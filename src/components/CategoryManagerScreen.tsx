import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation } from '../context/AppContext';
import { getAllCategories, createCategory, deleteCategory, Category } from '../services/category.service';

const CategoryManagerScreen = () => {
  const { navigate, showToast } = useAppNavigation();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding ] = useState(false);
  
  // New Category Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newIcon, setNewIcon] = useState('📦');
  const [newBgColor, setNewBgColor] = useState('#F0F0F0');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data.filter(c => c.id !== 'all'));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newTitle || !newCategory) {
      showToast('Title and Category identifier are required', 'error');
      return;
    }

    try {
      setLoading(true);
      await createCategory({
        title: newTitle,
        category: newCategory,
        icon: newIcon,
        bgColor: newBgColor,
      });
      showToast('Category added successfully', 'success');
      setNewTitle('');
      setNewCategory('');
      setNewIcon('📦');
      setNewBgColor('#F0F0F0');
      setIsAdding(false);
      fetchCategories();
    } catch (error: any) {
      showToast(error.message || 'Failed to add category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteCategory(id);
              showToast('Category deleted', 'success');
              fetchCategories();
            } catch (error: any) {
              showToast(error.message || 'Failed to delete category', 'error');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <View style={[styles.categoryIconBox, { backgroundColor: item.bgColor || '#F0F0F0' }]}>
        <Text style={styles.categoryIconMain}>{item.icon || '📂'}</Text>
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.title}</Text>
        <Text style={styles.categoryTag}>Identifier: {item.category}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => handleDeleteCategory(item.id, item.title)}
      >
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Global Category Manager</Text>
        <TouchableOpacity onPress={fetchCategories} style={styles.refreshBtn}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isAdding ? (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Add New Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Display Title (e.g. Organic Grains)"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Category ID (e.g. grains)"
              value={newCategory}
              onChangeText={setNewCategory}
              autoCapitalize="none"
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Emoji Icon (e.g. 🌾)"
                value={newIcon}
                onChangeText={setNewIcon}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Hex Color (e.g. #E8F5E9)"
                value={newBgColor}
                onChangeText={setNewBgColor}
              />
            </View>
            <View style={styles.formActions}>
              <TouchableOpacity 
                style={[styles.btn, styles.cancelBtn]} 
                onPress={() => setIsAdding(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btn, styles.saveBtn]} 
                onPress={handleAddCategory}
              >
                <Text style={styles.saveBtnText}>Save Category</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addTrigger} 
            onPress={() => setIsAdding(true)}
          >
            <Text style={styles.addTriggerText}>+ Create New Category</Text>
          </TouchableOpacity>
        )}

        {loading && !isAdding ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={renderCategoryItem}
            scrollEnabled={true}
            contentContainerStyle={{ paddingBottom: 120 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📂</Text>
                <Text style={styles.emptyText}>No categories found</Text>
              </View>
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    padding: 15,
  },
  addTrigger: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  addTriggerText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addForm: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#F7F9F7',
    borderWidth: 1,
    borderColor: '#E0EAE0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#333',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F5F5F5',
  },
  saveBtn: {
    backgroundColor: '#2E7D32',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 40,
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryIconMain: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryTag: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 2,
    fontWeight: '600',
  },
  categoryDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 10,
  },
  deleteIcon: {
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 50,
    opacity: 0.1,
  },
  emptyText: {
    color: '#999',
    marginTop: 10,
  },
});

export default CategoryManagerScreen;
