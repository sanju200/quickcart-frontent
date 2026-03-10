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
  Image,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { getAllOrders, updateOrderStatus, Order } from '../services/order.service';
import { getUserData } from '../services/authentication.service';

const DeliveryPartnerScreen = () => {
  const { navigate } = useAppNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [podText, setPodText] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [stats, setStats] = useState({ earnings: 0, count: 0 });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const userData = await getUserData();
      if (userData) setUserId(userData.id);
      fetchDeliveryOrders();
    };
    init();
  }, [activeTab]);

  const fetchDeliveryOrders = async () => {
    try {
      setLoading(true);
      const userData = await getUserData();
      const currentUserId = userData?.id;

      if (activeTab === 'ACTIVE') {
        const allOrders = await getAllOrders();
        const filtered = allOrders.filter(o => 
          o.status === 'HANDED_OVER' || 
          o.status === 'IN_TRANSIT' || 
          o.status === 'OUT_FOR_DELIVERY'
        );
        setOrders(filtered);
      } else {
        // Fetch history specifically for this partner
        const historyOrders = await getAllOrders({ 
          status: 'DELIVERED', 
          assignedDeliveryPartnerId: currentUserId 
        } as any);
        setOrders(historyOrders);
        
        // Calculate stats
        const totalEarnings = historyOrders.reduce((sum, o) => sum + (Number(o.totalAmount) * 0.1), 0); // 10% commission demo
        setStats({ earnings: totalEarnings, count: historyOrders.length });
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, stage: any) => {
    try {
      const userData = await getUserData();
      await updateOrderStatus(orderId, stage, { deliveryPartnerId: userData?.id });
      fetchDeliveryOrders();
      Alert.alert('Success', 'Status updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update status');
    }
  };

  const handleDeliveryComplete = (orderId: string) => {
    if (!podText) {
      Alert.alert('Error', 'Please provide Proof of Delivery (e.g. Received by [Name])');
      return;
    }

    Alert.alert(
      'Complete Delivery',
      'Confirm this order as successfully delivered?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            try {
              await updateOrderStatus(orderId, 'delivered', { proofOfDelivery: podText });
              fetchDeliveryOrders();
              Alert.alert('Delivered', 'Final notification sent to user.');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to complete delivery');
            }
            setActiveOrderId(null);
            setPodText('');
          }
        }
      ]
    );
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isEditingPOD = activeOrderId === item.id;
    const isExpanded = expandedOrders.includes(item.id);

    return (
      <View style={styles.orderCard}>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => toggleExpand(item.id)}
          style={styles.cardHeaderArea}
        >
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Order #{item.id.slice(4).toUpperCase()}</Text>
              <View style={[
                styles.statusBadge, 
                item.status === 'HANDED_OVER' ? styles.statusHANDED_OVER :
                item.status === 'IN_TRANSIT' ? styles.statusIN_TRANSIT :
                item.status === 'OUT_FOR_DELIVERY' ? styles.statusOUT_FOR_DELIVERY :
                item.status === 'DELIVERED' ? styles.statusDELIVERED : null
              ]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{item.userName}</Text>
              <Text style={styles.customerPhone}>📞 {item.userPhone || 'N/A'}</Text>
              <Text style={styles.customerAddress}>{item.address}</Text>
            </View>

            <View style={styles.orderStats}>
               <Text style={styles.itemsCount}>{item.items?.length || 0} Items • ₹{item.totalAmount}</Text>
               <Text style={styles.expandText}>{isExpanded ? 'Hide Details ▲' : 'Show Details ▼'}</Text>
            </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.itemsList}>
            {item.items?.map((orderItem, idx) => (
              <View key={idx} style={styles.productItem}>
                <Image source={{ uri: orderItem.productImage }} style={styles.productImage} />
                <View style={styles.productDetails}>
                  <Text style={styles.productTitle} numberOfLines={1}>{orderItem.productTitle}</Text>
                  <Text style={styles.productMeta}>Qty: {orderItem.quantity} • ₹{orderItem.price}</Text>
                </View>
                <Text style={styles.productTotal}>₹{orderItem.totalAmount}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionSection}>
          {item.status === 'HANDED_OVER' || item.status === 'IN_TRANSIT' ? (
            <TouchableOpacity 
              style={styles.outForDeliveryBtn} 
              onPress={() => handleStatusUpdate(item.id, 'out-for-delivery')}
            >
              <Text style={styles.btnText}>Mark Out for Delivery</Text>
            </TouchableOpacity>
          ) : item.status === 'OUT_FOR_DELIVERY' ? (
            isEditingPOD ? (
              <View style={styles.podForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Proof of Delivery (e.g. Handed to John)"
                  value={podText}
                  onChangeText={setPodText}
                />
                <View style={styles.formButtons}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setActiveOrderId(null)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={() => handleDeliveryComplete(item.id)}>
                    <Text style={styles.confirmBtnText}>Complete Delivery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.deliveredBtn} 
                onPress={() => setActiveOrderId(item.id)}
              >
                <Text style={styles.btnText}>Mark as Delivered (Capture POD)</Text>
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.completedBadge}>
              <View style={styles.completedRow}>
                <Text style={styles.completedText}>✓ Delivered</Text>
                {item.deliveredAt && (
                   <Text style={styles.deliveredTime}>
                     {new Date(item.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </Text>
                )}
              </View>
              {item.proofOfDelivery && <Text style={styles.podDetail}>POD: {item.proofOfDelivery}</Text>}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('PROFILE')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Partner</Text>
        <TouchableOpacity onPress={fetchDeliveryOrders} style={styles.refreshBtn}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Summary Card */}
      {!loading && activeTab === 'HISTORY' ? (
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Success Rate</Text>
            <Text style={styles.statValue}>100%</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statLabel}>Deliveries</Text>
            <Text style={styles.statValue}>{stats.count}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Earnings</Text>
            <Text style={styles.statValue}>₹{stats.earnings.toFixed(2)}</Text>
          </View>
        </View>
      ) : null}

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'ACTIVE' && styles.activeTab]}
          onPress={() => setActiveTab('ACTIVE')}
        >
          <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'HISTORY' && styles.activeTab]}
          onPress={() => setActiveTab('HISTORY')}
        >
          <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛵</Text>
              <Text style={styles.emptyText}>No deliveries assigned currently</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9',
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
  listContent: {
    padding: 15,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusHANDED_OVER: { backgroundColor: '#E0F2F1' },
  statusIN_TRANSIT: { backgroundColor: '#E8EAF6' },
  statusOUT_FOR_DELIVERY: { backgroundColor: '#FFFDE7' },
  statusDELIVERED: { backgroundColor: '#E8F5E9' },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#444',
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  customerPhone: {
    fontSize: 13,
    color: '#2E7D32',
    marginTop: 2,
  },
  customerAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  actionSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
    paddingTop: 12,
  },
  outForDeliveryBtn: {
    backgroundColor: '#1976D2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deliveredBtn: {
    backgroundColor: '#2E7D32',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  podForm: {
    gap: 10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: 'bold',
  },
  confirmBtn: {
    flex: 2,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  completedBadge: {
    alignItems: 'center',
    padding: 8,
  },
  completedText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 16,
  },
  podDetail: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 50,
    opacity: 0.2,
  },
  emptyText: {
    color: '#999',
    marginTop: 10,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2E7D32',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1B5E20',
    marginHorizontal: 15,
    borderRadius: 16,
    padding: 20,
    marginBottom: 5,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statLabel: {
    color: '#A5D6A7',
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardHeaderArea: {
    paddingBottom: 10,
  },
  orderStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f9f9f9',
  },
  itemsCount: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  expandText: {
    fontSize: 12,
    color: '#666',
  },
  itemsList: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  productMeta: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  productTotal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  completedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  deliveredTime: {
    fontSize: 12,
    color: '#888',
  },
});

export default DeliveryPartnerScreen;
