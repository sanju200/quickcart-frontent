import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { getUserData, UserData, updateProfile, Address } from '../services/authentication.service';

const EditProfileScreen = () => {
  const { navigate, showToast } = useAppNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await getUserData();
      if (data) {
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAddresses(data.addresses || []);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSave = async () => {
    if (!name || !email) {
      showToast('Name and Email are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const currentData = await getUserData();
      const updatedData: UserData = {
        ...currentData,
        id: currentData?.id || '',
        name,
        email,
        phone,
        addresses: addresses,
      };
      
      await updateProfile(updatedData);
      showToast('Profile updated successfully', 'success');
      setTimeout(() => navigate('PROFILE'), 1000);
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleAddressSelection = (index: number) => {
    const newAddresses = addresses.map((addr, i) => ({
      ...addr,
      isSelected: i === index,
    }));
    setAddresses(newAddresses);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('PROFILE')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Addresses</Text>
          </View>

          {addresses.length > 0 ? (
            addresses.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.addressItem, item.isSelected && styles.selectedAddressItem]}
                onPress={() => toggleAddressSelection(index)}
              >
                <View style={styles.addressHeader}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.type}</Text>
                  </View>
                  <View style={[styles.radio, item.isSelected && styles.radioSelected]}>
                    {item.isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
                
                <View style={styles.addressBody}>
                  <View style={styles.addressTextContainer}>
                    <Text style={styles.streetText}>{item.streetAddress}</Text>
                    <Text style={styles.cityText}>{item.city}, {item.state} {item.postalCode}</Text>
                    <Text style={styles.countryText}>{item.country}</Text>
                  </View>
                  
                  {!item.isSelected && (
                    <TouchableOpacity 
                      style={styles.selectBadge}
                      onPress={() => toggleAddressSelection(index)}
                    >
                      <Text style={styles.selectText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                  {item.isSelected && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultLabel}>DEFAULT</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyAddress}>
              <Text style={styles.emptyText}>No addresses found</Text>
              <TouchableOpacity 
                style={styles.addSampleBtn}
                onPress={() => {
                  setAddresses([
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
                  ]);
                }}
              >
                <Text style={styles.addSampleText}>+ Use sample addresses</Text>
              </TouchableOpacity>
            </View>
          )}


          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={() => navigate('PROFILE')}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 40,
  },
  form: {
    marginTop: 10,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  addressItem: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  selectedAddressItem: {
    borderColor: '#2E7D32',
    backgroundColor: '#F1F8E9',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  typeText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#2E7D32',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E7D32',
  },
  addressBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  addressTextContainer: {
    flex: 1,
    marginRight: 10,
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
  selectBadge: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  defaultBadge: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  defaultLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyAddress: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  addSampleBtn: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  addSampleText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelBtnText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditProfileScreen;
