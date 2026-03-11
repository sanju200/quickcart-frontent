import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { getAllProducts, Product, updateProductStock } from '../services/product.service';

const LowStockDashboard = () => {
  const { navigate, showToast } = useAppNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const stockThreshold = 10; // Items with stock <= 10 are considered low

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await getAllProducts();
      const lowStock = allProducts.filter(p => (p.stock || 0) <= stockThreshold);
      // Sort by stock ascending (lowest first)
      lowStock.sort((a, b) => (a.stock || 0) - (b.stock || 0));
      setProducts(lowStock);
    } catch (error) {
      console.error('Failed to fetch low stock products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRestock = async (productId: string, currentStock: number) => {
    const restockAmount = 20;
    const newStock = currentStock + restockAmount;

    try {
      setLoading(true);
      await updateProductStock(productId, newStock);
      showToast(`Restocked +${restockAmount} units`, 'success');
      fetchLowStockProducts();
    } catch (error: any) {
      showToast(error.message || 'Failed to restock', 'error');
      setLoading(false);
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const isCritical = (item.stock || 0) <= 2;
    return (
      <View style={[styles.productCard, isCritical && styles.criticalCard]}>
        <Image source={{ uri: item.image }} style={styles.productImg} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productMeta}>{item.category} • ₹{item.price}</Text>
          <View style={[styles.stockBadge, isCritical ? styles.criticalBadge : styles.warningBadge]}>
            <Text style={[styles.stockText, isCritical ? styles.criticalText : styles.warningText]}>
              Current Stock: {item.stock}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.restockBtn} 
          onPress={() => handleQuickRestock(item.id, item.stock || 0)}
        >
          <Text style={styles.restockBtnText}>+20</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Low Stock Dashboard</Text>
        <TouchableOpacity onPress={fetchLowStockProducts} style={styles.refreshBtn}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryBox}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>Items Low</Text>
        </View>
        <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: '#eee' }]}>
          <Text style={[styles.statValue, { color: '#D32F2F' }]}>
            {products.filter(p => (p.stock || 0) <= 2).length}
          </Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#D32F2F" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={renderProductItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyText}>All stocks are healthy!</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9',
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
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 16,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  listContent: {
    paddingBottom: 40,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  criticalCard: {
    borderColor: '#FFCDD2',
    backgroundColor: '#FFF9F9',
  },
  productImg: {
    width: 60, height: 60, borderRadius: 10, backgroundColor: '#f5f5f5'
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  productMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  warningBadge: { backgroundColor: '#FFF3E0' },
  criticalBadge: { backgroundColor: '#FFEBEE' },
  stockText: { fontSize: 11, fontWeight: 'bold' },
  warningText: { color: '#E65100' },
  criticalText: { color: '#D32F2F' },
  restockBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  restockBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 50,
  },
  emptyText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
  },
});

export default LowStockDashboard;
