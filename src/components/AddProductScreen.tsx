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
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation } from '../context/AppContext';
import { createProduct } from '../services/product.service';
import { getAllCategories } from '../services/category.service';

const AddProductScreen = () => {
  const { navigate, showToast, userRole } = useAppNavigation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [stock, setStock] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
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
        if (filtered.length > 0) setSelectedCategoryId(filtered[0].id);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCats();
  }, []);

  const getDashboardByRole = (): any => {
    switch (userRole) {
      case 'ADMIN': return 'ADMIN_DASHBOARD';
      case 'INVENTORY_MANAGER': return 'INVENTORY_MANAGER';
      case 'DELIVERY_PARTNER': return 'DELIVERY_PARTNER';
      case 'LOGISTICS_PARTNER': return 'LOGISTICS_PARTNER';
      default: return 'HOME';
    }
  };

  const handleCreateProduct = async () => {
    if (!name || !price || !weight || !selectedCategoryId || (!useImageLink && !imageUrl) || (useImageLink && !imageUrl)) {
      showToast('Please fill all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await createProduct({
        name,
        price: parseFloat(price),
        weight,
        categoryId: selectedCategoryId,
        image: imageUrl,
        stock: parseInt(stock) || 0,
      });
      showToast('Product added successfully!', 'success');
      setTimeout(() => navigate(getDashboardByRole()), 1000);
           
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
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          onPress={() => navigate(getDashboardByRole())} 
          style={styles.backButton}
        >
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
            <TouchableOpacity 
              style={styles.dropdownTrigger}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={styles.dropdownTriggerText}>
                {categories.find(c => c.id === selectedCategoryId)?.title || 'Select Category'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            <Modal
              visible={showCategoryModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowCategoryModal(false)}
            >
              <TouchableOpacity 
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowCategoryModal(false)}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Category</Text>
                    <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                      <Text style={styles.closeModal}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.categoryList}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryOption,
                          selectedCategoryId === cat.id && styles.activeOption
                        ]}
                        onPress={() => {
                          setSelectedCategoryId(cat.id);
                          setShowCategoryModal(false);
                        }}
                      >
                        <Text style={styles.catIcon}>{cat.icon || '📦'}</Text>
                        <View style={{flex: 1}}>
                            <Text style={[
                              styles.catLabel,
                              selectedCategoryId === cat.id && styles.activeCatLabel
                            ]}>
                              {cat.title}
                            </Text>
                        </View>
                        {selectedCategoryId === cat.id && <Text style={styles.checkIcon}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>
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
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F9F7',
    borderWidth: 1,
    borderColor: '#E0EAE0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  dropdownTriggerText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#2E7D32',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeModal: {
    fontSize: 20,
    color: '#999',
    padding: 5,
  },
  categoryList: {
    padding: 10,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 5,
  },
  activeOption: {
    backgroundColor: '#F1F8E9',
  },
  catIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  catLabel: {
    fontSize: 16,
    color: '#444',
  },
  activeCatLabel: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  checkIcon: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default AddProductScreen;
