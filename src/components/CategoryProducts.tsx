import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { useAppNavigation } from '../../App';

const { width, height } = Dimensions.get('window');

const SIDEBAR_CATEGORIES = [
  { id: 'all', title: 'All', icon: '🌟' },
  { id: 'fruits', title: 'Fruits', icon: '🍎' },
  { id: 'veggies', title: 'Veggies', icon: '🥦' },
  { id: 'dairy', title: 'Dairy', icon: '🥛' },
  { id: 'snacks', title: 'Snacks', icon: '🍿' },
  { id: 'beverages', title: 'Drinks', icon: '🥤' },
  { id: 'frozen', title: 'Frozen', icon: '🍜' },
];

const MOCK_PRODUCTS = [
  // Fruits
  { id: 'f1', category: 'fruits', name: 'Organic Banana', price: '₹60', weight: '500g', image: 'https://images.unsplash.com/photo-1571771894821-ad996211fdf4?w=200&q=80' },
  { id: 'f2', category: 'fruits', name: 'Red Apple', price: '₹120', weight: '500g', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&q=80' },
  { id: 'f3', category: 'fruits', name: 'Alphonso Mango', price: '₹250', weight: '1kg', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&q=80' },
  { id: 'f4', category: 'fruits', name: 'Green Grapes', price: '₹90', weight: '500g', image: 'https://images.unsplash.com/photo-1537640538966-79f369b41e8f?w=200&q=80' },
  { id: 'f5', category: 'fruits', name: 'Fresh Kiwi', price: '₹140', weight: '3 units', image: 'https://images.unsplash.com/photo-1585059895524-72359e061381?w=200&q=80' },
  // Veggies
  { id: 'v1', category: 'veggies', name: 'Fresh Spinach', price: '₹40', weight: '250g', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80' },
  { id: 'v2', category: 'veggies', name: 'Broccoli', price: '₹80', weight: '1 unit', image: 'https://images.unsplash.com/photo-1453306458620-5bbef13a5bca?w=200&q=80' },
  { id: 'v3', category: 'veggies', name: 'Baby Carrots', price: '₹50', weight: '200g', image: 'https://images.unsplash.com/photo-1522184216316-3c25379f9760?w=200&q=80' },
  { id: 'v4', category: 'veggies', name: 'Potato', price: '₹30', weight: '1kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?w=200&q=80' },
  { id: 'v5', category: 'veggies', name: 'Tomato', price: '₹45', weight: '500g', image: 'https://images.unsplash.com/photo-1546473144-c24555107d64?w=200&q=80' },
  // Dairy
  { id: 'd1', category: 'dairy', name: 'Fresh Milk', price: '₹35', weight: '500ml', image: 'https://images.unsplash.com/photo-1563636619-e910f01859ec?w=200&q=80' },
  { id: 'd2', category: 'dairy', name: 'Amul Butter', price: '₹55', weight: '100g', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&q=80' },
  { id: 'd3', category: 'dairy', name: 'Cheese Slices', price: '₹120', weight: '200g', image: 'https://images.unsplash.com/photo-1528283228102-587dad4d6ca2?w=200&q=80' },
  { id: 'd4', category: 'dairy', name: 'Curd/Dahi', price: '₹40', weight: '400g', image: 'https://images.unsplash.com/photo-1485921325833-316270034a78?w=200&q=80' },
  // Snacks
  { id: 's1', category: 'snacks', name: 'Lays Chips', price: '₹20', weight: '50g', image: 'https://images.unsplash.com/photo-1566478989125-5134764831ad?w=200&q=80' },
  { id: 's2', category: 'snacks', name: 'Dark Chocolate', price: '₹80', weight: '100g', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=200&q=80' },
  { id: 's3', category: 'snacks', name: 'Nachos', price: '₹45', weight: '60g', image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=200&q=80' },
  // Drinks
  { id: 'b1', category: 'beverages', name: 'Orange Juice', price: '₹70', weight: '1L', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200&q=80' },
  { id: 'b2', category: 'beverages', name: 'Coca Cola', price: '₹40', weight: '600ml', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&q=80' },
  { id: 'b3', category: 'beverages', name: 'Iced Coffee', price: '₹150', weight: '250ml', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=200&q=80' },
];

const CategoryProducts = () => {
  const { categoryData, navigate } = useAppNavigation();
  const [selectedSideCategory, setSelectedSideCategory] = useState(categoryData?.category || 'all');

  const filteredProducts = selectedSideCategory === 'all' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === selectedSideCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
           <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Browse Products</Text>
          <Text style={styles.headerSubtitle}>{filteredProducts.length} items available</Text>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Left Sidebar */}
        <View style={styles.sidebar}>
          <FlatList
            data={SIDEBAR_CATEGORIES}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isActive = selectedSideCategory === item.id;
              return (
                <TouchableOpacity 
                  style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                  onPress={() => setSelectedSideCategory(item.id)}
                >
                  <View style={[styles.sidebarIconBox, isActive && styles.sidebarIconBoxActive]}>
                    <Text style={styles.sidebarIcon}>{item.icon}</Text>
                  </View>
                  <Text style={[styles.sidebarText, isActive && styles.sidebarTextActive]}>
                    {item.title}
                  </Text>
                  {isActive && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Product Grid */}
        <View style={styles.productContent}>
          <FlatList
            data={filteredProducts}
            numColumns={2}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.productWeight}>{item.weight}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>{item.price}</Text>
                    <TouchableOpacity style={styles.addButton}>
                      <Text style={styles.addText}>ADD</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 85,
    backgroundColor: '#F7F9F7',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  sidebarItem: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sidebarItemActive: {
    backgroundColor: '#fff',
  },
  sidebarIconBox: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  sidebarIconBoxActive: {
    backgroundColor: '#E8F5E9',
  },
  sidebarIcon: {
    fontSize: 20,
  },
  sidebarText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  sidebarTextActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    width: 4,
    height: '60%',
    backgroundColor: '#2E7D32',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  productContent: {
    flex: 1,
    backgroundColor: '#fff',
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
    height: 100,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F8E9',
  },
  addText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default CategoryProducts;
