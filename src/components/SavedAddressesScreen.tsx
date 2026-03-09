import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { getUserData, updateProfile, Address, UserData } from '../services/authentication.service';

const SavedAddressesScreen = () => {
  const { navigate, showToast } = useAppNavigation();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);


  // New Address Form State
  const [newType, setNewType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostal, setNewPostal] = useState('');
  const [newCountry, setNewCountry] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    const data = await getUserData();
    setUser(data);
    setLoading(false);
  };

  const handleSetDefault = async (index: number) => {
    if (!user) return;
    
    setSaving(true);
    try {
      const updatedAddresses = user.addresses?.map((addr, i) => ({
        ...addr,
        isSelected: i === index,
      })) || [];

      const updatedUser = { ...user, addresses: updatedAddresses };
      await updateProfile(updatedUser);
      setUser(updatedUser);
      showToast('Default address updated', 'success');
    } catch (error) {
      showToast('Failed to update address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!user) return;
    
    setSaving(true);
    try {
      const updatedAddresses = user.addresses?.filter((_, i) => i !== index) || [];
      
      // If we deleted the selected one, select the first remaining one
      if (user.addresses?.[index].isSelected && updatedAddresses.length > 0) {
        updatedAddresses[0].isSelected = true;
      }

      const updatedUser = { ...user, addresses: updatedAddresses };
      await updateProfile(updatedUser);
      setUser(updatedUser);
      showToast('Address removed', 'success');
    } catch (error) {
      showToast('Failed to remove address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = async () => {
    if (!newStreet || !newCity) {
      showToast('Please enter street and city', 'error');
      return;
    }

    setSaving(true);
    try {
      const newAddress: Address = {
        type: newType,
        streetAddress: newStreet,
        city: newCity,
        state: newState,
        postalCode: newPostal,
        country: newCountry,
        isSelected: editingIndex !== null ? user!.addresses![editingIndex].isSelected : (user?.addresses?.length || 0) === 0,
      };

      let updatedAddresses: Address[] = [];
      if (editingIndex !== null) {
        updatedAddresses = [...(user?.addresses || [])];
        updatedAddresses[editingIndex] = newAddress;
      } else {
        updatedAddresses = [...(user?.addresses || []), newAddress];
      }

      const updatedUser = { ...user!, addresses: updatedAddresses };
      
      await updateProfile(updatedUser);
      setUser(updatedUser);
      setShowAddModal(false);
      resetForm();
      showToast(editingIndex !== null ? 'Address updated' : 'New address added', 'success');
    } catch (error) {
      showToast('Failed to save address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (index: number) => {
    const addr = user!.addresses![index];
    setNewType(addr.type);
    setNewStreet(addr.streetAddress);
    setNewCity(addr.city);
    setNewState(addr.state);
    setNewPostal(addr.postalCode);
    setNewCountry(addr.country);
    setEditingIndex(index);
    setShowAddModal(true);
  };


  const resetForm = () => {
    setNewType('Home');
    setNewStreet('');
    setNewCity('');
    setNewState('');
    setNewPostal('');
    setNewCountry('');
    setEditingIndex(null);
  };

  const useSampleData = async () => {
    const sampleAddresses: Address[] = [
      {
        type: 'Home',
        streetAddress: '123 Wonderland Ave',
        city: 'Anystate',
        state: 'State',
        postalCode: '12345',
        country: 'United States',
        isSelected: true
      },
      {
        type: 'Work',
        streetAddress: '456 Office St',
        city: 'Anothercity',
        state: 'State',
        postalCode: '67890',
        country: 'United States',
        isSelected: false
      }
    ];

    if (!user) return;
    setSaving(true);
    try {
      const updatedUser = { ...user, addresses: sampleAddresses };
      await updateProfile(updatedUser);
      setUser(updatedUser);
      showToast('Sample addresses loaded', 'success');
    } catch (error) {
      showToast('Failed to load samples', 'error');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('PROFILE')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {user?.addresses && user.addresses.length > 0 ? (
          user.addresses.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.addressCard, item.isSelected && styles.selectedCard]}
              onPress={() => handleSetDefault(index)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'Home' ? '#E8F5E9' : item.type === 'Work' ? '#E3F2FD' : '#FFF3E0' }]}>
                  <Text style={[styles.typeText, { color: item.type === 'Home' ? '#2E7D32' : item.type === 'Work' ? '#1565C0' : '#E65100' }]}>
                    {item.type}
                  </Text>
                </View>
                <View style={[styles.radio, item.isSelected && styles.radioSelected]}>
                  {item.isSelected && <View style={styles.radioInner} />}
                </View>
              </View>

              {item.isSelected && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultLabel}>DEFAULT DELIVERY ADDRESS</Text>
                </View>
              )}


              <Text style={styles.streetText}>{item.streetAddress}</Text>
              <Text style={styles.cityText}>{item.city}, {item.state} {item.postalCode}</Text>
              <Text style={styles.countryText}>{item.country}</Text>

              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEdit(index);
                  }}
                  disabled={saving}
                >
                  <Text style={styles.actionBtnText}>Edit Details</Text>
                </TouchableOpacity>
                {!item.isSelected && (
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.selectBtn]} 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleSetDefault(index);
                    }}
                    disabled={saving}
                  >
                    <Text style={[styles.actionBtnText, styles.selectBtnText]}>Select as Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.deleteBtn]} 
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                  disabled={saving}
                >
                  <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))

        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptySubtitle}>Add an address to make checkout faster</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.addNewBtn} 
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addNewBtnText}>+ Add New Address</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.sampleBottomBtn} 
          onPress={useSampleData}
          disabled={saving}
        >
          <Text style={styles.sampleBottomBtnText}>↻ Reset to Sample Addresses</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeModal}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Address Type</Text>
              <View style={styles.typeSelector}>
                {(['Home', 'Work', 'Other'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeOption, newType === t && styles.typeOptionActive]}
                    onPress={() => setNewType(t)}
                  >
                    <Text style={[styles.typeOptionText, newType === t && styles.typeOptionTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Street Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Building, street, area"
                value={newStreet}
                onChangeText={setNewStreet}
              />

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={newCity}
                    onChangeText={setNewCity}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>State</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="State"
                    value={newState}
                    onChangeText={setNewState}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Postal Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Zip code"
                    value={newPostal}
                    onChangeText={setNewPostal}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Country</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Country"
                    value={newCountry}
                    onChangeText={setNewCountry}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.saveModalBtn} 
                onPress={handleAddNew}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveModalBtnText}>Save Address</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 40,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  selectedCard: {
    borderColor: '#2E7D32',
    backgroundColor: '#F1F8E9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  defaultLabel: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  radioSelected: {
    borderColor: '#2E7D32',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E7D32',
  },
  streetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cityText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  countryText: {
    fontSize: 14,
    color: '#888',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  actionBtnText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  selectBtn: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  selectBtnText: {
    color: '#2E7D32',
  },
  deleteBtn: {
    borderColor: '#ffebee',
  },
  deleteBtnText: {
    color: '#d32f2f',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  addNewBtn: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  addNewBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sampleBottomBtn: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  sampleBottomBtnText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeModal: {
    fontSize: 20,
    color: '#999',
  },
  modalForm: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 5,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  typeOptionActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
  },
  typeOptionTextActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 5,
  },
  saveModalBtn: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveModalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SavedAddressesScreen;
