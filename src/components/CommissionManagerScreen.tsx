import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';

const CommissionManagerScreen = () => {
  const { navigate, showToast } = useAppNavigation();
  const [baseCommission, setBaseCommission] = useState('10'); // %
  const [deliveryFeeShare, setDeliveryFeeShare] = useState('80'); // % to partner
  const [zones, setZones] = useState([
    { id: '1', name: 'Downtown (Zone A)', multiplier: '1.2' },
    { id: '2', name: 'Suburbs (Zone B)', multiplier: '1.0' },
    { id: '3', name: 'Industrial (Zone C)', multiplier: '1.5' },
    { id: '4', name: 'Downtown (Zone A)', multiplier: '1.2' },
    { id: '5', name: 'Suburbs (Zone B)', multiplier: '1.0' },
    { id: '6', name: 'Industrial (Zone C)', multiplier: '1.5' },
  ]);

  const handleUpdateBase = () => {
    showToast('Base rates updated successfully', 'success');
  };

  const handleUpdateZone = (id: string, newMultiplier: string) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, multiplier: newMultiplier } : z));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commission Manager</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Commission Rates</Text>
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Base Commission (%)</Text>
                <TextInput
                  style={styles.input}
                  value={baseCommission}
                  onChangeText={setBaseCommission}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Partner Fee Share (%)</Text>
                <TextInput
                  style={styles.input}
                  value={deliveryFeeShare}
                  onChangeText={setDeliveryFeeShare}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <TouchableOpacity style={styles.updateBtn} onPress={handleUpdateBase}>
              <Text style={styles.updateBtnText}>Update Global Rates</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zone Multipliers</Text>
          {zones.map(zone => (
            <View key={zone.id} style={styles.zoneCard}>
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Text style={styles.zoneDesc}>Dynamic pricing multiplier</Text>
              </View>
              <View style={styles.multiplierInput}>
                <Text style={styles.xIcon}>×</Text>
                <TextInput
                  style={styles.smallInput}
                  value={zone.multiplier}
                  onChangeText={(val) => handleUpdateZone(zone.id, val)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          ))}
          <TouchableOpacity 
            style={styles.addZoneBtn}
            onPress={() => showToast('New zone creation coming soon', 'info')}
          >
            <Text style={styles.addZoneText}>+ Add New Zone</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
           <Text style={styles.infoTitle}>💡 Pro Tip</Text>
           <Text style={styles.infoText}>
             Higher multipliers in industrial zones or during peak hours attract more delivery partners to those areas.
           </Text>
        </View>
      </ScrollView>
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
  content: {
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F7F9F7',
    borderWidth: 1,
    borderColor: '#E0EAE0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  updateBtn: {
    backgroundColor: '#2E7D32',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  updateBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  zoneCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  zoneDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  multiplierInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  xIcon: {
    fontSize: 14,
    color: '#2E7D32',
    marginRight: 4,
    fontWeight: 'bold',
  },
  smallInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    width: 40,
    textAlign: 'center',
    paddingVertical: 8,
  },
  addZoneBtn: {
    padding: 15,
    alignItems: 'center',
  },
  addZoneText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 18,
  },
});

export default CommissionManagerScreen;
