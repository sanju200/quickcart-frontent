import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { getAllProducts, Product, getCategoryName } from '../services/product.service';
import { addToCart, handleCartQuantityChange, CartItem } from '../services/cart.service';
import { getOrders, Order, OrderItem } from '../services/order.service';
import { useEffect } from 'react';
import { Alert } from 'react-native';

import { getAllCategories } from '../services/category.service';

const CATEGORY_TABS = [
  { id: '1', title: 'All Products', icon: '🏠', category: 'all' },
  { id: '2', title: 'Best Sellers', icon: '🔥', tag: 'best_seller' },
  { id: '3', title: 'Fresh Arrivals', icon: '🌟', tag: 'fresh' },
  { id: '4', title: 'Under ₹99', icon: '💰', tag: 'under_99' },
  { id: '5', title: 'Healthy', icon: '🥗', tag: 'healthy' },
  { id: '6', title: 'Organic', icon: '🌿', tag: 'organic' },
  { id: '7', title: 'Premium', icon: '👑', tag: 'premium' },
  { id: '8', title: 'Combos', icon: '🎁', tag: 'combo' },
];

const BG_COLORS = ['#F1F8E9', '#E3F2FD', '#FFF3E0', '#FCE4EC', '#F3E5F5', '#EFEBE9'];

const Categories = () => {
  const [activeTab, setActiveTab ] = useState('1');
  const { navigate } = useAppNavigation();
  const { cartItems, refreshCartCount } = useCartCount();
  const [recentlyOrdered, setRecentlyOrdered] = useState<Product[]>([]);
  const [gridCategories, setGridCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentlyOrdered();
    const fetchCats = async () => {
        try {
            const data = await getAllCategories();
            // Filter out 'all' from grid display
            setGridCategories(data.filter(c => c.id !== 'all'));
        } catch (err) {
            console.error('Error fetching grid categories:', err);
        }
    };
    fetchCats();
  }, []);

  const getProductQuantity = (productId: string) => {
    const item = cartItems.find((i: CartItem) => (i.productId || i.product?.id) === productId);
    return item ? item.quantity : 0;
  };

  const handleUpdateQuantity = async (productId: string, currentQty: number, delta: number) => {
    try {
      await handleCartQuantityChange(productId, currentQty + delta);
      refreshCartCount();
    } catch (err: any) {
      console.error('Error updating cart:', err);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const fetchRecentlyOrdered = async () => {
    try {
      setLoading(true);
      const orders = await getOrders();
      
      const productMap = new Map<string, Product>();
      
      orders.forEach((order: Order) => {
        order.items?.forEach((orderItem: OrderItem) => {
          // Identify product by productId, product object id, or title
          const productId = orderItem.productId || orderItem.product?.id;
          const productKey = productId || orderItem.productTitle || orderItem.id;
          
          if (productKey && !productMap.has(productKey)) {
            const product: Product = {
              id: productId || orderItem.id, // Fallback to item id if productId is missing
              name: orderItem.productTitle || orderItem.product?.name || 'Product',
              price: (orderItem.priceAtPurchase || orderItem.price || orderItem.product?.price || 0).toString(),
              image: orderItem.productImage || orderItem.product?.image || 'https://via.placeholder.com/150',
              weight: orderItem.product?.weight || 'Unit',
              category: orderItem.product?.category || 'General'
            };
            productMap.set(productKey, product);
          }
        });
      });

      const recentProducts = Array.from(productMap.values());
      setRecentlyOrdered(recentProducts);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching recently ordered:', err);
      setRecentlyOrdered([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
      try {
          await addToCart(product.id, 1);
          refreshCartCount(); // Update global count
      } catch (err: any) {
          Alert.alert('Error', err.message || 'Failed to add item to cart');
      }
  };

  useEffect(() => {
    fetchRecentlyOrdered();
  }, []);

  return (
    <View style={styles.container}>
      {/* Shop By Category Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerIcon}>🔳</Text>
          <Text style={styles.headerTitle}>Shop by Category</Text>
        </View>
        <TouchableOpacity onPress={() => navigate('CATEGORY_PRODUCTS', { category: 'all' })}>
          <Text style={styles.seeAll}>See All →</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      >
        {CATEGORY_TABS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.tab,
                isActive ? styles.tabActive : styles.tabInactive,
              ]}
              onPress={() => {
                setActiveTab(item.id);
                navigate('FILTERED_PRODUCTS', { 
                  category: (item as any).category || 'all', 
                  tag: (item as any).tag || '',
                  title: item.title
                });
              }}
            >
              <Text style={styles.tabIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.tabText,
                  isActive ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Category Grid */}
      <View style={styles.gridContainer}>
        {gridCategories.map((item, index) => {
          const bgColor = BG_COLORS[index % BG_COLORS.length];
          const catValue = item.tag || item.id || item.name;
          return (
            <TouchableOpacity 
              key={item.id} 
              style={styles.gridItem}
              onPress={() => navigate('CATEGORY_PRODUCTS', { category: catValue })}
            >
              <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
                <Text style={styles.gridIcon}>{item.icon || '📦'}</Text>
              </View>
              <Text style={styles.gridTitle}>{item.name || item.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Recently Ordered Section */}
      <View style={styles.popularHeader}>
        <Text style={styles.popularTitle}>🕒 Recently Ordered</Text>
        <TouchableOpacity onPress={() => navigate('PREVIOUSLY_ORDERED')}>
          <Text style={styles.seeAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#2E7D32" />
        </View>
      ) : error ? (
        <View style={styles.loaderContainer}>
          <Text style={styles.errorTextSmall}>{error}</Text>
          <TouchableOpacity onPress={fetchRecentlyOrdered}>
             <Text style={styles.retryTextSmall}>Tap to Retry</Text>
          </TouchableOpacity>
        </View>
      ) : recentlyOrdered.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularScroll}>
          {recentlyOrdered.slice(0, 6).map((item) => (
            <View key={item.id} style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <View style={styles.cardTags}>
                <Text style={styles.productWeight}>{item.weight}</Text>
                <View style={styles.categoryBadge}>
                   <Text style={styles.categoryBadgeText}>
                     {getCategoryName(item)}
                   </Text>
                </View>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.productPrice}>
                  {`₹${item.price}`}
                </Text>
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
          ))}
          {recentlyOrdered.length >= 6 && (
            <TouchableOpacity 
              style={styles.viewAllRecentCard}
              onPress={() => navigate('PREVIOUSLY_ORDERED')}
            >
              <View style={styles.viewAllRecentIconContainer}>
                <Text style={styles.viewAllRecentIcon}>→</Text>
              </View>
              <Text style={styles.viewAllRecentText}>View All Items</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyRecentContainer}>
          <View style={styles.emptyRecentIconBox}>
            <Text style={styles.emptyRecentIcon}>🛍️</Text>
          </View>
          <Text style={styles.emptyRecentText}>No recent orders yet</Text>
          <Text style={styles.emptyRecentSubText}>Your ordered items will appear here</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 18,
    color: '#2E7D32',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAll: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  tabScrollContent: {
    paddingLeft: 15,
    paddingRight: 20,
    gap: 10,
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
  },
  tabActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  tabInactive: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E9ECEF',
  },
  tabIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabTextInactive: {
    color: '#495057',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '31%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBox: {
    width: 75,
    height: 75,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridIcon: {
    fontSize: 32,
  },
  gridTitle: {
    fontSize: 11,
    textAlign: 'center',
    color: '#444',
    fontWeight: '600',
    paddingHorizontal: 5,
  },
  popularHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  popularScroll: {
    paddingHorizontal: 15,
    gap: 15,
  },
  productCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    height: 35,
  },
  productWeight: {
    fontSize: 10,
    color: '#666',
    marginVertical: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#2E7D32',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F1F8E9',
  },
  addText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 50,
    justifyContent: 'space-between',
  },
  qtyBtn: {
    paddingHorizontal: 4,
  },
  qtyBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  qtyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loaderContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTextSmall: {
    color: '#d32f2f',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryTextSmall: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyRecentContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
    padding: 20,
  },
  emptyRecentIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyRecentIcon: {
    fontSize: 24,
  },
  emptyRecentText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptyRecentSubText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  viewAllRecentCard: {
    width: 140,
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginLeft: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  viewAllRecentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAllRecentIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllRecentText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardTags: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  categoryBadge: {
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 8,
    color: '#2E7D32',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default Categories;
