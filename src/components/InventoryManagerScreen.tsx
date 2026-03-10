import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { getAllOrders, updateOrderStatus, Order, OrderStatus } from '../services/order.service';
import { getAllProducts, Product, updateProductStock } from '../services/product.service';

const InventoryManagerScreen = () => {
  const { navigate } = useAppNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab ] = useState<'ORDERS' | 'INVENTORY'>('ORDERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [stats, setStats] = useState({ pending: 0, processing: 0, lowStock: 0 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'ORDERS') {
        const allOrders = await getAllOrders();
        const filtered = allOrders.filter(o => 
          o.status === 'PLACED' || 
          o.status === 'PROCESSING'
        );
        setOrders(filtered);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          pending: allOrders.filter(o => o.status === 'PLACED').length,
          processing: allOrders.filter(o => o.status === 'PROCESSING').length,
        }));
      } else {
        const allProducts = await getAllProducts();
        setProducts(allProducts);
        
        setStats(prev => ({
          ...prev,
          lowStock: allProducts.filter(p => (p.stock || 0) < 5).length,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessOrder = async (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus = currentStatus === 'PLACED' ? 'process' : 'handover';
    const alertMsg = currentStatus === 'PLACED' 
        ? 'Move this order to PROCESSING status?' 
        : 'Order ready for HANDOVER to logistics?';

    Alert.alert(
      'Update Status',
      alertMsg,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed', 
          onPress: async () => {
            try {
              await updateOrderStatus(orderId, nextStatus);
              fetchData(); // Refresh list
              Alert.alert('Success', `Order status updated to ${nextStatus.toUpperCase()}`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update order');
            }
          }
        }
      ]
    );
  };

  const handleUpdateStock = async (productId: string, delta: number) => {
    // Find current stock
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newStock = Math.max(0, (product.stock || 0) + delta);
    
    try {
      // Optimistic update
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, stock: newStock } : p
      ));
      
      // Persist to DB
      await updateProductStock(productId, newStock);
      
      // Update stats correctly after change
      const allProducts = products.map(p => p.id === productId ? { ...p, stock: newStock } : p);
      setStats(prev => ({
        ...prev,
        lowStock: allProducts.filter(p => (p.stock || 0) < 5).length,
      }));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update stock in database');
      // Rollback on error
      fetchData();
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
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
            <View style={[styles.statusBadge, item.status === 'PROCESSING' ? styles.statusProcessing : styles.statusPlaced]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.userName}</Text>
            <Text style={styles.customerAddress} numberOfLines={1}>{item.address}</Text>
          </View>

          <View style={styles.orderStatsRow}>
            <Text style={styles.itemCountText}>{item.items.length} Items • ₹{item.totalAmount}</Text>
            <Text style={styles.expandText}>{isExpanded ? 'Hide Items ▲' : 'Show Items ▼'}</Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedItems}>
            {item.items.map((it, idx) => (
              <View key={idx} style={styles.orderItemRow}>
                <Image source={{ uri: it.productImage }} style={styles.itemThumb} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itTitle}>{it.productTitle}</Text>
                  <Text style={styles.itMeta}>Qty: {it.quantity}</Text>
                </View>
                <Text style={styles.itPrice}>₹{it.price}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionRow}>
          {item.status === 'PLACED' && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.prepBtn]} 
              onPress={() => handleProcessOrder(item.id, item.status)}
            >
              <Text style={styles.actionBtnText}>Start Preparing</Text>
            </TouchableOpacity>
          )}

          {item.status === 'PROCESSING' && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.handoverBtn]} 
              onPress={() => handleProcessOrder(item.id, item.status)}
            >
              <Text style={styles.actionBtnText}>Ready for Handover</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const isLowStock = (item.stock || 0) < 5;
    return (
        <View style={styles.productCard}>
            <Image source={{ uri: item.image }} style={styles.productImg} />
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productCategory}>{item.category} • ₹{item.price}</Text>
                <View style={[styles.stockBadge, isLowStock ? styles.lowStockBg : styles.normalStockBg]}>
                    <Text style={[styles.stockText, isLowStock ? styles.lowStockText : styles.normalStockText]}>
                        Stock: {item.stock} {isLowStock ? '(Low Stock!)' : ''}
                    </Text>
                </View>
            </View>
            <View style={styles.stockControls}>
                <TouchableOpacity 
                    style={styles.stockBtn} 
                    onPress={() => handleUpdateStock(item.id, 1)}
                >
                    <Text style={styles.stockBtnText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.stockBtn, { marginTop: 8 }]} 
                    onPress={() => handleUpdateStock(item.id, -1)}
                >
                    <Text style={styles.stockBtnText}>-</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('PROFILE')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory Manager</Text>
        <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView stickyHeaderIndices={[2]} showsVerticalScrollIndicator={false}>
          {/* Stats Summary */}
          <View style={styles.statsContainer}>
              <View style={[styles.statCard, styles.pendingCard]}>
                  <Text style={styles.statEmoji}>🔔</Text>
                  <Text style={styles.statNum}>{stats.pending}</Text>
                  <Text style={styles.statName}>New Orders</Text>
              </View>
              <View style={[styles.statCard, styles.prepCard]}>
                  <Text style={styles.statEmoji}>⚙️</Text>
                  <Text style={styles.statNum}>{stats.processing}</Text>
                  <Text style={styles.statName}>Preparing</Text>
              </View>
              <View style={[styles.statCard, styles.lowStockCard]}>
                  <Text style={styles.statEmoji}>📉</Text>
                  <Text style={styles.statNum}>{stats.lowStock}</Text>
                  <Text style={styles.statName}>Low Stock</Text>
              </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput 
                    placeholder={activeTab === 'ORDERS' ? "Search Order ID or Customer..." : "Search Product Name or Category..."}
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
                    style={[styles.tab, activeTab === 'ORDERS' && styles.activeTab]}
                    onPress={() => { setActiveTab('ORDERS'); setSearchQuery(''); }}
                  >
                    <Text style={[styles.tabText, activeTab === 'ORDERS' && styles.activeTabText]}>Active Orders</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.tab, activeTab === 'INVENTORY' && styles.activeTab]}
                    onPress={() => { setActiveTab('INVENTORY'); setSearchQuery(''); }}
                  >
                    <Text style={[styles.tabText, activeTab === 'INVENTORY' && styles.activeTabText]}>Stock Manager</Text>
                  </TouchableOpacity>
              </View>
          </View>

          <View style={styles.listWrapper}>
            {loading ? (
                <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
            ) : (
                activeTab === 'ORDERS' ? (
                    <FlatList
                        scrollEnabled={false}
                        data={filteredOrders}
                        keyExtractor={(item) => item.id}
                        renderItem={renderOrderItem}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>📦</Text>
                                <Text style={styles.emptyText}>No matching orders found</Text>
                            </View>
                        }
                    />
                ) : (
                    <FlatList
                        scrollEnabled={false}
                        data={filteredProducts}
                        keyExtractor={(item) => item.id}
                        renderItem={renderProductItem}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>🍎</Text>
                                <Text style={styles.emptyText}>No matching products found</Text>
                            </View>
                        }
                    />
                )
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
  pendingCard: { borderLeftWidth: 4, borderLeftColor: '#2196F3' },
  prepCard: { borderLeftWidth: 4, borderLeftColor: '#9C27B0' },
  lowStockCard: { borderLeftWidth: 4, borderLeftColor: '#F44336' },
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
  cardHeaderArea: { borderBottomWidth: 1, borderBottomColor: '#f5f5f5', paddingBottom: 10 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusPlaced: { backgroundColor: '#E3F2FD' },
  statusProcessing: { backgroundColor: '#F3E5F5' },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#333' },
  customerInfo: { marginTop: 10 },
  customerName: { fontSize: 15, fontWeight: '600', color: '#000' },
  customerAddress: { fontSize: 12, color: '#666', marginTop: 1 },
  orderStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  itemCountText: { fontSize: 12, color: '#2E7D32', fontWeight: 'bold' },
  expandText: { fontSize: 12, color: '#666' },
  expandedItems: { backgroundColor: '#F9FBF9', borderRadius: 8, padding: 10, marginVertical: 10 },
  orderItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemThumb: { width: 32, height: 32, borderRadius: 4, backgroundColor: '#eee' },
  itemInfo: { flex: 1, marginLeft: 10 },
  itTitle: { fontSize: 12, fontWeight: '500', color: '#444' },
  itMeta: { fontSize: 10, color: '#888' },
  itPrice: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  actionRow: { marginTop: 5 },
  actionBtn: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  prepBtn: { backgroundColor: '#2E7D32' },
  handoverBtn: { backgroundColor: '#1B5E20' },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  productImg: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#f5f5f5' },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  productCategory: { fontSize: 12, color: '#888', marginTop: 2 },
  stockBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
  normalStockBg: { backgroundColor: '#E8F5E9' },
  lowStockBg: { backgroundColor: '#FFEBEE' },
  stockText: { fontSize: 11, fontWeight: 'bold' },
  normalStockText: { color: '#2E7D32' },
  lowStockText: { color: '#D32F2F' },
  stockControls: { alignItems: 'center' },
  stockBtn: { backgroundColor: '#f0f0f0', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stockBtnText: { fontSize: 18, fontWeight: 'bold', color: '#444' },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyIcon: { fontSize: 50, opacity: 0.1 },
  emptyText: { color: '#999', marginTop: 10 },
});

export default InventoryManagerScreen;
