import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAppNavigation } from '../../App';

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

// Expanded Popular Items (15 items)
const POPULAR_ITEMS = [
  { id: 'p1', name: 'Fresh Spinach', price: '₹40', weight: '250g', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80' },
  { id: 'p2', name: 'Organic Banana', price: '₹60', weight: '500g', image: 'https://images.unsplash.com/photo-1571771894821-ad996211fdf4?w=200&q=80' },
  { id: 'p3', name: 'Baby Carrots', price: '₹50', weight: '200g', image: 'https://images.unsplash.com/photo-1522184216316-3c25379f9760?w=200&q=80' },
  { id: 'p4', name: 'Red Apple', price: '₹120', weight: '500g', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&q=80' },
  { id: 'p5', name: 'Fresh Milk', price: '₹35', weight: '500ml', image: 'https://images.unsplash.com/photo-1563636619-e910f01859ec?w=200&q=80' },
  { id: 'p6', name: 'Alphonso Mango', price: '₹250', weight: '1kg', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&q=80' },
  { id: 'p7', name: 'Green Grapes', price: '₹90', weight: '500g', image: 'https://images.unsplash.com/photo-1537640538966-79f369b41e8f?w=200&q=80' },
  { id: 'p8', name: 'Potato', price: '₹30', weight: '1kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?w=200&q=80' },
  { id: 'p9', name: 'Tomato', price: '₹45', weight: '500g', image: 'https://images.unsplash.com/photo-1546473144-c24555107d64?w=200&q=80' },
  { id: 'p10', name: 'Amul Butter', price: '₹55', weight: '100g', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&q=80' },
  { id: 'p11', name: 'Lays Chips', price: '₹20', weight: '50g', image: 'https://images.unsplash.com/photo-1566478989125-5134764831ad?w=200&q=80' },
  { id: 'p12', name: 'Orange Juice', price: '₹70', weight: '1L', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200&q=80' },
  { id: 'p13', name: 'Coca Cola', price: '₹40', weight: '600ml', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&q=80' },
  { id: 'p14', name: 'Dark Chocolate', price: '₹80', weight: '100g', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=200&q=80' },
  { id: 'p15', name: 'Broccoli', price: '₹80', weight: '1 unit', image: 'https://images.unsplash.com/photo-1453306458620-5bbef13a5bca?w=200&q=80' },
];

const Categories = () => {
  const [activeTab, setActiveTab ] = useState('1');
  const { navigate } = useAppNavigation();

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

      {/* Popular Items Section */}
      <View style={styles.popularHeader}>
        <Text style={styles.popularTitle}>🔥 Popular Items</Text>
        <TouchableOpacity onPress={() => navigate('CATEGORY_PRODUCTS', { category: 'all' })}>
          <Text style={styles.seeAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularScroll}>
        {POPULAR_ITEMS.map((item) => (
          <View key={item.id} style={styles.productCard}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productWeight}>{item.weight}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>{item.price}</Text>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addText}>ADD</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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
    paddingHorizontal: 15,
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
});

export default Categories;
