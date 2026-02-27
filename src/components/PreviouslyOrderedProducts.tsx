import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { Product } from '../services/product.service';
import { getOrders, Order, OrderItem } from '../services/order.service';
import { addToCart, handleCartQuantityChange, CartItem } from '../services/cart.service';

const PreviouslyOrderedProducts = () => {
  const { navigate } = useAppNavigation();
  const { cartItems, refreshCartCount } = useCartCount();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreviouslyOrdered();
  }, []);

  const fetchPreviouslyOrdered = async () => {
    try {
      setLoading(true);
      const orders = await getOrders();
      
      // Use a Map to deduplicate products by their title (since API items don't have a separate productId)
      const productMap = new Map<string, Product>();
      
      orders.forEach((order: Order) => {
        order.items?.forEach((orderItem: OrderItem) => {
          const productKey = orderItem.productTitle || orderItem.id;
          
          if (productKey && !productMap.has(productKey)) {
            const product: Product = {
              id: orderItem.id,
              name: orderItem.productTitle || 'Product',
              price: orderItem.price?.toString() || '0',
              image: orderItem.productImage || 'https://via.placeholder.com/150',
              weight: 'Unit',
              category: 'ordered',
            };
            productMap.set(productKey, product);
          }
        });
      });

      setProducts(Array.from(productMap.values()));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const getProductQuantity = (productId: string) => {
    const item = cartItems.find((i: CartItem) => (i.productId || i.product?.id) === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      refreshCartCount();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add item to cart');
    }
  };

  const handleUpdateQuantity = async (productId: string, currentQty: number, delta: number) => {
    try {
      if (currentQty + delta < 0) return;
      await handleCartQuantityChange(productId, currentQty + delta);
      refreshCartCount();
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
           <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Previously Ordered Products</Text>
          <Text style={styles.headerSubtitle}>{products.length} items found</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPreviouslyOrdered}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No previously ordered products found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productWeight}>{item.weight}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                  {getProductQuantity(item.id) > 0 ? (
                    <View style={styles.quantityControl}>
                      <TouchableOpacity 
                        style={styles.qtyBtn}
                        onPress={() => handleUpdateQuantity(item.id, getProductQuantity(item.id), -1)}
                      >
                        <Text style={styles.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{getProductQuantity(item.id)}</Text>
                      <TouchableOpacity 
                        style={styles.qtyBtn}
                        onPress={() => handleUpdateQuantity(item.id, getProductQuantity(item.id), 1)}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => handleAddToCart(item)}
                    >
                      <Text style={styles.addText}>ADD</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#666',
  },
  listContent: {
    padding: 10,
    paddingBottom: 100,
  },
  productCard: {
    width: '46%',
    margin: '2%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    height: 35,
  },
  productWeight: {
    fontSize: 10,
    color: '#888',
    marginVertical: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F1F8E9',
  },
  addText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: 'bold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 4,
    minWidth: 70,
    justifyContent: 'space-between',
  },
  qtyBtn: {
    paddingHorizontal: 5,
  },
  qtyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtyText: {
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
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default PreviouslyOrderedProducts;
