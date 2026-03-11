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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { getAllOffers, createOffer, deleteOffer, Offer } from '../services/offer.service';

const OfferManagerScreen = () => {
  const { navigate, showToast } = useAppNavigation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // New Offer Form
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await getAllOffers();
      setOffers(data);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffer = async () => {
    if (!title || !code || !discountValue) {
      showToast('Title, code, and discount value are required', 'error');
      return;
    }

    try {
      setLoading(true);
      await createOffer({
        title,
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        description,
        isActive: true,
      });
      showToast('Offer created successfully', 'success');
      resetForm();
      fetchOffers();
    } catch (error: any) {
      showToast(error.message || 'Failed to create offer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCode('');
    setDiscountValue('');
    setDescription('');
    setIsAdding(false);
  };

  const handleDeleteOffer = (id: string, code: string) => {
    Alert.alert(
      'Delete Offer',
      `Are you sure you want to delete offer "${code}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteOffer(id);
              showToast('Offer deleted', 'success');
              fetchOffers();
            } catch (error: any) {
              showToast(error.message || 'Failed to delete offer', 'error');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderOfferItem = ({ item }: { item: Offer }) => (
    <View style={styles.offerCard}>
      <View style={styles.offerBadge}>
        <Text style={styles.offerCode}>{item.code}</Text>
      </View>
      <View style={styles.offerInfo}>
        <Text style={styles.offerTitle}>{item.title}</Text>
        <Text style={styles.offerValue}>
          {item.discountType === 'percentage' ? `${item.discountValue}% OFF` : `₹${item.discountValue} OFF`}
        </Text>
        {item.description && <Text style={styles.offerDesc}>{item.description}</Text>}
      </View>
      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => handleDeleteOffer(item.id, item.code)}
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotional Engine</Text>
        <TouchableOpacity onPress={fetchOffers} style={styles.refreshBtn}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isAdding ? (
          <ScrollView style={styles.addForm} showsVerticalScrollIndicator={false}>
            <Text style={styles.formTitle}>Create New Offer</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Offer Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Summer Special 20%"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Promo Code</Text>
              <TextInput
                style={styles.input}
                placeholder="SUMMER20"
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Discount Type</Text>
                <View style={styles.typeToggle}>
                  <TouchableOpacity 
                    style={[styles.typeBtn, discountType === 'percentage' && styles.activeType]}
                    onPress={() => setDiscountType('percentage')}
                  >
                    <Text style={[styles.typeBtnText, discountType === 'percentage' && styles.activeTypeText]}>%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.typeBtn, discountType === 'fixed' && styles.activeType]}
                    onPress={() => setDiscountType('fixed')}
                  >
                    <Text style={[styles.typeBtnText, discountType === 'fixed' && styles.activeTypeText]}>₹</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Value</Text>
                <TextInput
                  style={styles.input}
                  placeholder="20"
                  value={discountValue}
                  onChangeText={setDiscountValue}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Conditions, min order, etc."
                value={description}
                onChangeText={setDescription}
                multiline
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
                onPress={handleAddOffer}
              >
                <Text style={styles.saveBtnText}>Create Offer</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 20 }} />
          </ScrollView>
        ) : (
          <TouchableOpacity 
            style={styles.addTrigger} 
            onPress={() => setIsAdding(true)}
          >
            <Text style={styles.addTriggerText}>+ Launch New Campaign</Text>
          </TouchableOpacity>
        )}

        {loading && !isAdding ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(item) => item.id}
            renderItem={renderOfferItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🎟️</Text>
                <Text style={styles.emptyText}>No active offers</Text>
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
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  addTriggerText: {
    color: '#fff',
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
    maxHeight: '80%',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
  },
  input: {
    backgroundColor: '#F7F9F7',
    borderWidth: 1,
    borderColor: '#E0EAE0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F0F4F0',
    borderRadius: 10,
    padding: 4,
    height: 48,
  },
  typeBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeType: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  typeBtnText: {
    fontWeight: 'bold',
    color: '#666',
  },
  activeTypeText: {
    color: '#2E7D32',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
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
    paddingBottom: 120,
  },
  offerCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    position: 'relative',
    overflow: 'hidden',
  },
  offerBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  offerCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D32',
    letterSpacing: 1,
  },
  offerInfo: {
    paddingRight: 40,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  offerValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2E7D32',
    marginTop: 5,
  },
  offerDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  deleteBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
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

export default OfferManagerScreen;
