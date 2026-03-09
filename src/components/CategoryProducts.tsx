import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { getAllProducts, Product } from '../services/product.service';
import { addToCart, handleCartQuantityChange, CartItem } from '../services/cart.service';
import { Alert } from 'react-native';

const SIDEBAR_CATEGORIES = [
  { id: 'all', title: 'All', icon: '🌟' },
  { id: 'fruits', title: 'Fruits', icon: '🍎' },
  { id: 'veggies', title: 'Veggies', icon: '🥦' },
  { id: 'dairy', title: 'Dairy', icon: '🥛' },
  { id: 'snacks', title: 'Snacks', icon: '🍿' },
  { id: 'beverages', title: 'Drinks', icon: '🥤' },
  { id: 'frozen', title: 'Frozen', icon: '🍜' },
  { id: 'spices', title: 'Spices', icon: '🌶️' },
  { id: 'toys', title: 'Toys', icon: '🧸' },
  { id: 'home_decor', title: 'Home Decor', icon: '🪴' },
  
];

const CategoryProducts = () => {
  const { categoryData, navigate } = useAppNavigation();
  const { cartItems, refreshCartCount } = useCartCount();
  const [selectedSideCategory, setSelectedSideCategory] = useState(categoryData?.category || 'all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
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
      await handleCartQuantityChange(productId, currentQty + delta);
      refreshCartCount();
    } catch (err: any) {
      console.error('Error updating cart:', err);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const filteredProducts = selectedSideCategory === 'all' 
    ? products 
    : products.filter(p => p.category.toLowerCase() === selectedSideCategory.toLowerCase());

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
            contentContainerStyle={styles.sidebarListContent}
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
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              numColumns={2}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.centerContainer}>
                  <Text style={styles.emptyText}>No products found in this category</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.productCard}>
                  <Image source={{ uri: item.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.productWeight}>{item.weight}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>
                        ₹{item.price}
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
                </View>
              )}
            />
          )}
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
  sidebarListContent: {
    paddingBottom: 100, // Provides spacing at bottom to avoid overlapping with navigation bar
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
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
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
    fontSize: 14,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default CategoryProducts;
