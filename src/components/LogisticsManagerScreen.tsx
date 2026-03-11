import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { getAllOrders, updateOrderStatus, Order, OrderStatus } from '../services/order.service';
import { getUserData } from '../services/authentication.service';

const LogisticsManagerScreen = () => {
  const { navigate } = useAppNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'IN_TRANSIT' | 'HISTORY'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ pending: 0, inTransit: 0, dispatchedToday: 0 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const allOrders = await getAllOrders();
      
      // Calculate global stats
      const today = new Date().toLocaleDateString();
      setStats({
          pending: allOrders.filter(o => o.status === 'PROCESSING').length,
          inTransit: allOrders.filter(o => o.status === 'HANDED_OVER' || o.status === 'IN_TRANSIT' || o.status === 'OUT_FOR_DELIVERY').length,
          dispatchedToday: allOrders.filter(o => o.status !== 'PLACED' && o.status !== 'PROCESSING' && o.updated_at && new Date(o.updated_at).toLocaleDateString() === today).length
      });

      if (activeTab === 'PENDING') {
        const filtered = allOrders.filter(o => o.status === 'PROCESSING');
        setOrders(filtered);
      } else if (activeTab === 'IN_TRANSIT') {
        const filtered = allOrders.filter(o => 
          o.status === 'HANDED_OVER' || 
          o.status === 'IN_TRANSIT' || 
          o.status === 'OUT_FOR_DELIVERY'
        );
        setOrders(filtered);
      } else {
        const filtered = allOrders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED');
        setOrders(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHandover = (orderId: string) => {
    if (!courierName || !trackingNumber) {
      Alert.alert('Error', 'Please enter courier name and tracking number');
      return;
    }

    Alert.alert(
      'Confirm Handover',
      `Handover order to ${courierName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            try {
              const user = await getUserData();
              await updateOrderStatus(orderId, 'handover', { 
                courierName, 
                trackingNumber, 
                assignedLogisticsId: user?.id 
              });
              fetchData();
              Alert.alert('Success', 'Order handed over successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to confirm handover');
            }
            setActiveOrderId(null);
            setCourierName('');
            setTrackingNumber('');
          }
        }
      ]
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isEditing = activeOrderId === item.id;
    const isHandedOver = item.status === 'HANDED_OVER';
    const isInTransit = item.status === 'IN_TRANSIT' || item.status === 'OUT_FOR_DELIVERY';
    const isDelivered = item.status === 'DELIVERED';

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item.id.slice(4).toUpperCase()}</Text>
          <View style={[
            styles.statusBadge, 
            isHandedOver ? styles.statusHandedOver : 
            isInTransit ? styles.statusInTransit : 
            item.status === 'PROCESSING' ? styles.statusProcessing : styles.statusDelivered
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.userName}</Text>
          <Text style={styles.customerAddress} numberOfLines={2}>{item.address}</Text>
        </View>

        {(isHandedOver || isInTransit || isDelivered) && item.courierName && (
          <View style={styles.handoverDetails}>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Courier: </Text>
                <Text style={styles.detailValue}>{item.courierName}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tracking: </Text>
                <Text style={styles.detailValue}>{item.trackingNumber}</Text>
            </View>
            
            {isHandedOver && (
              <TouchableOpacity style={styles.transitBtn} onPress={async () => {
                try {
                  const user = await getUserData();
                  if (!user || (!user.id && !user.id)) {
                      throw new Error("Unable to identify current logistics user");
                  }
                  await updateOrderStatus(item.id, 'transit', { assignedLogisticsId: user.id || user.id });
                  fetchData();
                  Alert.alert('Success', 'Order is now IN-TRANSIT');
                } catch (error: any) {
                  Alert.alert('Error', error.message || 'Failed to update to transit');
                }
              }}>
                <Text style={styles.transitBtnText}>Dispatch to Transit</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {item.status === 'PROCESSING' && (
          <View style={styles.actionSection}>
            {isEditing ? (
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Courier Name (e.g. BlueDart)"
                  value={courierName}
                  onChangeText={setCourierName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Tracking Number"
                  value={trackingNumber}
                  onChangeText={setTrackingNumber}
                />
                <View style={styles.formButtons}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setActiveOrderId(null)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={() => handleHandover(item.id)}>
                    <Text style={styles.confirmBtnText}>Handover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.assignBtn} onPress={() => setActiveOrderId(item.id)}>
                <Text style={styles.assignBtnText}>Assign Courier & Handover</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('PROFILE')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Logistics Manager</Text>
        <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView stickyHeaderIndices={[2]} showsVerticalScrollIndicator={false}>
          {/* Stats Summary */}
          <View style={styles.statsContainer}>
              <View style={[styles.statCard, styles.pendingCard]}>
                  <Text style={styles.statEmoji}>📦</Text>
                  <Text style={styles.statNum}>{stats.pending}</Text>
                  <Text style={styles.statName}>New Handover</Text>
              </View>
              <View style={[styles.statCard, styles.transitCard]}>
                  <Text style={styles.statEmoji}>🚚</Text>
                  <Text style={styles.statNum}>{stats.inTransit}</Text>
                  <Text style={styles.statName}>In-Transit</Text>
              </View>
              <View style={[styles.statCard, styles.dispatchCard]}>
                  <Text style={styles.statEmoji}>✅</Text>
                  <Text style={styles.statNum}>{stats.dispatchedToday}</Text>
                  <Text style={styles.statName}>Dispatch Today</Text>
              </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput 
                    placeholder="Search Order ID, Customer, Courier..."
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery !== '' && (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                          <Text style={styles.clearIcon}>✕</Text>
                      </TouchableOpacity>
                  )}
              </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabWrapper}>
              <View style={styles.tabBar}>
                  <TouchableOpacity 
                    style={[styles.tab, activeTab === 'PENDING' && styles.activeTab]}
                    onPress={() => { setActiveTab('PENDING'); setSearchQuery(''); }}
                  >
                    <Text style={[styles.tabText, activeTab === 'PENDING' && styles.activeTabText]}>Pending</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.tab, activeTab === 'IN_TRANSIT' && styles.activeTab]}
                    onPress={() => { setActiveTab('IN_TRANSIT'); setSearchQuery(''); }}
                  >
                    <Text style={[styles.tabText, activeTab === 'IN_TRANSIT' && styles.activeTabText]}>Transit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.tab, activeTab === 'HISTORY' && styles.activeTab]}
                    onPress={() => { setActiveTab('HISTORY'); setSearchQuery(''); }}
                  >
                    <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.activeTabText]}>History</Text>
                  </TouchableOpacity>
              </View>
          </View>

          <View style={styles.listWrapper}>
            {loading ? (
                <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    scrollEnabled={false}
                    data={filteredOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrderItem}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>🚚</Text>
                            <Text style={styles.emptyText}>No matching orders found</Text>
                        </View>
                    }
                />
            )}
          </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  refreshBtn: {
    padding: 5,
  },
  refreshIcon: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  pendingCard: { borderLeftWidth: 4, borderLeftColor: '#9C27B0' },
  transitCard: { borderLeftWidth: 4, borderLeftColor: '#2196F3' },
  dispatchCard: { borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statNum: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statName: { fontSize: 10, color: '#666', marginTop: 2 },
  
  searchContainer: { paddingHorizontal: 15, marginBottom: 15 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  clearIcon: { fontSize: 16, color: '#999', padding: 4 },

  tabWrapper: { backgroundColor: '#F7F9F7', paddingHorizontal: 15, paddingBottom: 10 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E8EBE8',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#666' },
  activeTabText: { color: '#2E7D32' },

  listWrapper: { padding: 15, paddingBottom: 120 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusProcessing: { backgroundColor: '#F3E5F5' },
  statusHandedOver: { backgroundColor: '#E0F2F1' },
  statusInTransit: { backgroundColor: '#E3F2FD' },
  statusDelivered: { backgroundColor: '#E8F5E9' },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#333' },
  customerInfo: { marginBottom: 12 },
  customerName: { fontSize: 15, fontWeight: '600', color: '#000' },
  customerAddress: { fontSize: 12, color: '#666', marginTop: 2, lineHeight: 18 },
  actionSection: { borderTopWidth: 1, borderTopColor: '#f1f1f1', paddingTop: 12 },
  assignBtn: { backgroundColor: '#2E7D32', padding: 12, borderRadius: 8, alignItems: 'center' },
  assignBtnText: { color: '#fff', fontWeight: 'bold' },
  form: { gap: 10 },
  input: { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', fontSize: 14 },
  formButtons: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#eee', alignItems: 'center' },
  cancelBtnText: { color: '#666', fontWeight: 'bold' },
  confirmBtn: { flex: 2, padding: 12, borderRadius: 8, backgroundColor: '#2E7D32', alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: 'bold' },
  handoverDetails: { borderTopWidth: 1, borderTopColor: '#f1f1f1', paddingTop: 12, gap: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailLabel: { fontSize: 12, color: '#888' },
  detailValue: { color: '#333', fontWeight: '600', fontSize: 12 },
  transitBtn: { marginTop: 8, backgroundColor: '#F1F8E9', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#C8E6C9' },
  transitBtnText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 13 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyIcon: { fontSize: 50, opacity: 0.1 },
  emptyText: { color: '#999', marginTop: 10 },
});

export default LogisticsManagerScreen;
