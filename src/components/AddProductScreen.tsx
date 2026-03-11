import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { createProduct } from '../services/product.service';
import { getAllCategories } from '../services/category.service';

const AddProductScreen = () => {
  const { navigate, showToast } = useAppNavigation();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [useImageLink, setUseImageLink] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  React.useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getAllCategories();
        const filtered = data.filter(c => c.id !== 'all');
        setCategories(filtered);
        if (filtered.length > 0) setCategory(filtered[0].tag || filtered[0].id || filtered[0].name);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCats();
  }, []);

  const handleCreateProduct = async () => {
    if (!name || !price || !weight || !category || (!useImageLink && !imageUrl) || (useImageLink && !imageUrl)) {
      showToast('Please fill all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await createProduct({
        name,
        price,
        weight,
        category,
        image: imageUrl,
        stock: parseInt(stock) || 0,
      });
      showToast('Product added successfully!', 'success');
      setTimeout(() => navigate('INVENTORY_MANAGER'), 1000);
    } catch (error: any) {
      showToast(error.message || 'Failed to add product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const simulateUpload = () => {
    setUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploading(false);
        // Set a sample image for demonstration
        setImageUrl('https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=3087&auto=format&fit=crop');
        showToast('Image uploaded successfully (Demo)', 'success');
      }
    }, 300);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Product</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Coca-Cola 1.25L"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Price (₹)</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="70"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Weight/Volume</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="1.25L"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Initial Stock</Text>
            <TextInput
              style={styles.input}
              value={stock}
              onChangeText={setStock}
              placeholder="75"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.categoryChips}
            >
              {categories && categories.map(cat => {
                const catValue = cat.tag || cat.id || cat.name;
                return (
                  <TouchableOpacity 
                    key={catValue} 
                    style={[styles.chip, category === catValue && styles.activeChip]}
                    onPress={() => setCategory(catValue)}
                  >
                    <Text style={[styles.chipText, category === catValue && styles.activeChipText]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.imageSection}>
            <Text style={styles.label}>Product Image</Text>
            <View style={styles.tabBar}>
              <TouchableOpacity 
                style={[styles.tab, useImageLink && styles.activeTab]} 
                onPress={() => setUseImageLink(true)}
              >
                <Text style={[styles.tabText, useImageLink && styles.activeTabText]}>Image Link</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, !useImageLink && styles.activeTab]} 
                onPress={() => setUseImageLink(false)}
              >
                <Text style={[styles.tabText, !useImageLink && styles.activeTabText]}>Upload File</Text>
              </TouchableOpacity>
            </View>

            {useImageLink ? (
              <TextInput
                style={[styles.input, { marginTop: 15 }]}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="Paste image URL here..."
                placeholderTextColor="#999"
              />
            ) : (
              <View style={styles.uploadContainer}>
                {uploading ? (
                  <View style={styles.uploadingBox}>
                    <ActivityIndicator size="small" color="#2E7D32" />
                    <Text style={styles.uploadingText}>Uploading... {uploadProgress}%</Text>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadBtn} onPress={simulateUpload}>
                    <Text style={styles.uploadIcon}>☁️</Text>
                    <Text style={styles.uploadBtnText}>Select Image to Upload</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {imageUrl !== '' && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUrl }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeImg} onPress={() => setImageUrl('')}>
                  <Text style={styles.removeImgText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.disabledBtn]} 
            onPress={handleCreateProduct}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Add Product to Inventory</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Increased to ensure visibility above bottom nav
  },
  form: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F7F9F7',
    borderWidth: 1,
    borderColor: '#E0EAE0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  categoryChips: {
    paddingBottom: 5,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F4F0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0EAE0',
  },
  activeChip: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  chipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  activeChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imageSection: {
    marginTop: 5,
    marginBottom: 25,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F0F4F0',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#2E7D32',
  },
  uploadContainer: {
    marginTop: 15,
  },
  uploadBtn: {
    height: 120,
    borderWidth: 2,
    borderColor: '#2E7D32',
    borderStyle: 'dashed',
    borderRadius: 15,
    backgroundColor: '#F1F8E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  uploadBtnText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 14,
  },
  uploadingBox: {
    height: 120,
    backgroundColor: '#F1F8E9',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadingText: {
    marginTop: 10,
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 14,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0EAE0',
    borderRadius: 3,
    marginTop: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2E7D32',
  },
  previewContainer: {
    marginTop: 15,
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
  },
  removeImg: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImgText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddProductScreen;
