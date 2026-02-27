import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { getOrders, Order } from '../services/order.service';

const OrdersScreen = () => {
  const { navigate } = useAppNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const date = new Date(item.createdAt || item.created_at || '').toLocaleDateString();
    
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderDate}>{date}</Text>
            <Text style={styles.orderId}>Order #{item.id.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.itemsPreview}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {item.items?.map((orderItem, index) => (
              <View key={orderItem.id || index} style={styles.miniItem}>
                <Image 
                  source={{ uri: orderItem.productImage || orderItem.product?.image || 'https://via.placeholder.com/50' }} 
                  style={styles.miniImage} 
                />
                <Text style={styles.miniQty}>x{orderItem.quantity}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Total: <Text style={styles.totalAmount}>₹{item.totalAmount}</Text></Text>
          <TouchableOpacity 
            style={styles.reorderBtn}
            onPress={() => navigate('HOME')} // In a real app, this would add items to cart
          >
            <Text style={styles.reorderText}>Order Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Fetching your orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No orders found</Text>
              <TouchableOpacity style={styles.shopBtn} onPress={() => navigate('HOME')}>
                <Text style={styles.shopBtnText}>Start Shopping</Text>
              </TouchableOpacity>
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
    backgroundColor: '#F5F7F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  listContent: {
    padding: 15,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
    marginBottom: 10,
  },
  orderDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  orderId: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDELIVERED: {
    backgroundColor: '#E8F5E9',
  },
  statusPENDING: {
    backgroundColor: '#FFF3E0',
  },
  statusCANCELLED: {
    backgroundColor: '#FFEBEE',
  },
  statusPLACED: {
    backgroundColor: '#E3F2FD', // Light blue for placed
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  itemsPreview: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  miniItem: {
    marginRight: 10,
    alignItems: 'center',
  },
  miniImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  miniQty: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  reorderBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reorderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  shopBtn: {
    marginTop: 20,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shopBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OrdersScreen;
