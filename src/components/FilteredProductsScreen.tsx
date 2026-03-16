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
  TextInput,
  Alert
} from 'react-native';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { getFilteredProducts, Product } from '../services/product.service';
import { addToCart, handleCartQuantityChange, CartItem } from '../services/cart.service';

const FilteredProductsScreen = () => {
  const { categoryData, navigate } = useAppNavigation();
  const { cartItems, refreshCartCount } = useCartCount();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localSearch, setLocalSearch ] = useState(categoryData?.search || '');
  
  // Use the title from the tag if available, otherwise generic
  const screenTitle = categoryData?.title || 'Products';

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(categoryData?.category || 'all', localSearch, categoryData?.tag);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [localSearch, categoryData?.tag]);

  const fetchProducts = async (category?: string, search?: string, tag?: string) => {
    try {
      setLoading(true);
      const data = await getFilteredProducts(category, search, tag);
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

  return (
    <View style={styles.container}>
      {/* Header with Search and Title */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>{screenTitle}</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.internalSearchBar}>
            <Text style={styles.internalSearchIcon}>🔍</Text>
            <TextInput 
              placeholder="Search in this list..."
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

      <View style={styles.productContent}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => fetchProducts(categoryData?.category, localSearch)}
            >
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
                <Text style={styles.emptyText}>No products found for this filter</Text>
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
                         {item.categoryId && typeof item.categoryId === 'object' ? ((item.categoryId as any).title || (item.categoryId as any).name || (item.categoryId as any).category) : (item.categoryId || 'General')}
                       </Text>
                    </View>
                  </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    width: '100%',
  },
  internalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 45,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  internalSearchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  internalSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
  clearText: {
    fontSize: 18,
    color: '#999',
    paddingHorizontal: 5,
  },
  productContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
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
    height: 110,
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
    minWidth: 65,
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

export default FilteredProductsScreen;
