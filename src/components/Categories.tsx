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
import { getAllProducts, Product } from '../services/product.service';
import { addToCart } from '../services/cart.service';
import { useEffect } from 'react';
import { Alert } from 'react-native';

const CATEGORY_TABS = [
  { id: '1', title: 'All Products', icon: '🏠' },
  { id: '2', title: 'Best Sellers', icon: '🔥' },
  { id: '3', title: 'Fresh Arrivals', icon: '🌟' },
  { id: '4', title: 'Under ₹99', icon: '💰' },
  { id: '5', title: 'Healthy Options', icon: '🥗' },
  { id: '6', title: 'Organic', icon: '🌿' },
  { id: '7', title: 'Premium', icon: '👑' },
  { id: '8', title: 'Combo Deals', icon: '🎁' },
];

const CATEGORY_GRID = [
  { id: 'g1', category: 'veggies', title: 'Fruits & Vegetables', icon: '🥬', bgColor: '#F1F8E9' },
  { id: 'g2', category: 'dairy', title: 'Dairy & Breakfast', icon: '🥛', bgColor: '#E3F2FD' },
  { id: 'g3', category: 'snacks', title: 'Munchies', icon: '🍿', bgColor: '#FFF3E0' },
  { id: 'g4', category: 'beverages', title: 'Cold Drinks & Juices', icon: '🥤', bgColor: '#FCE4EC' },
  { id: 'g5', category: 'frozen', title: 'Instant & Frozen Food', icon: '🍜', bgColor: '#F3E5F5' },
  { id: 'g6', category: 'beverages', title: 'Tea, Coffee & Health', icon: '☕', bgColor: '#EFEBE9' },
];

const Categories = () => {
  const [activeTab, setActiveTab ] = useState('1');
  const { navigate } = useAppNavigation();
  const { refreshCartCount } = useCartCount();
  const [recentlyOrdered, setRecentlyOrdered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentlyOrdered = async () => {
    // API integration will be done later by the user
    setLoading(false);
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
              onPress={() => setActiveTab(item.id)}
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
        {CATEGORY_GRID.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.gridItem}
            onPress={() => navigate('CATEGORY_PRODUCTS', item)}
          >
            <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
              <Text style={styles.gridIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.gridTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recently Ordered Section */}
      <View style={styles.popularHeader}>
        <Text style={styles.popularTitle}>🕒 Recently Ordered</Text>
        <TouchableOpacity onPress={() => navigate('ORDERS')}>
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
          {recentlyOrdered.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.productWeight}>{item.weight}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.productPrice}>
                  {typeof item.price === 'number' ? `₹${item.price}` : item.price}
                </Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => handleAddToCart(item)}
                >
                  <Text style={styles.addText}>ADD</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyRecentContainer}>
          <Text style={styles.emptyRecentText}>No recent orders yet</Text>
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
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  emptyRecentText: {
    color: '#999',
    fontSize: 14,
  },
});

export default Categories;
