import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { getFilteredProducts, Product, getCategoryName } from '../services/product.service';
import { getAllCategories } from '../services/category.service';
import { addToCart, handleCartQuantityChange, CartItem } from '../services/cart.service';
import { Alert } from 'react-native';

const CategoryProducts = () => {
  const { categoryData, navigate } = useAppNavigation();
  const { cartItems, refreshCartCount } = useCartCount();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedSideCategory, setSelectedSideCategory] = useState(categoryData?.category || 'all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localSearch, setLocalSearch ] = useState(categoryData?.search || '');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error loading sidebar categories:', err);
      } finally {
        setCatLoading(false);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(selectedSideCategory, localSearch);
    }, 500); // 500ms debounce for search

    return () => clearTimeout(delayDebounceFn);
  }, [selectedSideCategory, localSearch]);

  // Update local search and category if nav params change
  useEffect(() => {
    if (categoryData?.search !== undefined) {
      setLocalSearch(categoryData.search);
    }
    if (categoryData?.category !== undefined) {
        setSelectedSideCategory(categoryData.category);
    }
  }, [categoryData?.search, categoryData?.category]);

  const fetchProducts = async (category?: string, search?: string) => {
    try {
      setLoading(true);
      const data = await getFilteredProducts(category, search);
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

  // Filtering is now handled on the backend
  const filteredProducts = products;

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
           <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchBarWrapper}>
          <View style={styles.internalSearchBar}>
            <Text style={styles.internalSearchIcon}>🔍</Text>
            <TextInput 
              placeholder="Search products..."
              style={styles.internalSearchInput}
              value={localSearch}
              onChangeText={setLocalSearch}
              placeholderTextColor="#999"
            />
            {localSearch !== '' && (
              <TouchableOpacity onPress={() => setLocalSearch('')}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Left Sidebar */}
        <View style={styles.sidebar}>
          {catLoading ? (
            <ActivityIndicator size="small" color="#2E7D32" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => (item.id || item.tag || item.name).toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sidebarListContent}
              renderItem={({ item }) => {
                const isActive = selectedSideCategory === (item.tag || item.id || item.name);
                return (
                  <TouchableOpacity 
                    style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                    onPress={() => setSelectedSideCategory(item.tag || item.id || item.name)}
                  >
                    <View style={[styles.sidebarIconBox, isActive && styles.sidebarIconBoxActive]}>
                      <Text style={styles.sidebarIcon}>{item.icon || '📦'}</Text>
                    </View>
                    <Text style={[styles.sidebarText, isActive && styles.sidebarTextActive]} numberOfLines={1}>
                      {item.name || item.title}
                    </Text>
                    {isActive && <View style={styles.activeIndicator} />}
                  </TouchableOpacity>
                );
              }}
            />
          )}
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
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchProducts(selectedSideCategory, localSearch)}>
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
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Text style={styles.emptyIconText}>🔍</Text>
                  </View>
                  <Text style={styles.emptyTitle}>No Products Found</Text>
                  <Text style={styles.emptyDescription}>
                    We couldn't find any products matching your current category or search filters.
                  </Text>
                  {(selectedSideCategory !== 'all' || localSearch !== '') && (
                    <TouchableOpacity 
                      style={styles.clearFiltersButton} 
                      onPress={() => {
                        setSelectedSideCategory('all');
                        setLocalSearch('');
                      }}
                    >
                      <Text style={styles.clearFiltersText}>Clear All Filters</Text>
                    </TouchableOpacity>
                  )}
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.productCard}>
                  <Image source={{ uri: item.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
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
  searchBarWrapper: {
    flex: 1,
    marginRight: 15,
  },
  internalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  internalSearchIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  internalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  clearText: {
    fontSize: 18,
    color: '#999',
    paddingHorizontal: 5,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F8E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  clearFiltersButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  clearFiltersText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default CategoryProducts;
