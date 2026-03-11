import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';

const OperationalControlScreen = () => {
  const { navigate, showToast } = useAppNavigation();
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [zones, setZones] = useState([
    { id: '1', name: 'Downtown', active: true },
    { id: '2', name: 'Green Park', active: true },
    { id: '3', name: 'Airport Road', active: false },
  ]);

  const handleSendBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    Alert.alert('Broadcast Sent', `Message: "${broadcastMsg}" has been sent to all active users and partners.`);
    setBroadcastMsg('');
  };

  const toggleZone = (id: string) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, active: !z.active } : z));
    showToast('Zone status updated', 'info');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Operational Control</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Store Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Hours & Holiday Mode</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.cardLabel}>Store Status</Text>
                <Text style={styles.cardSub}>{isStoreOpen ? 'Accepting Orders' : 'Closed - Holiday Mode'}</Text>
              </View>
              <Switch 
                value={isStoreOpen} 
                onValueChange={setIsStoreOpen}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isStoreOpen ? '#2E7D32' : '#f4f3f4'}
              />
            </View>
            {!isStoreOpen && (
               <View style={styles.warningBox}>
                  <Text style={styles.warningText}>⚠️ Customers cannot place new orders while the store is closed.</Text>
               </View>
            )}
          </View>
        </View>

        {/* Service Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Zone Management</Text>
          <View style={styles.card}>
            {zones.map(zone => (
              <View key={zone.id} style={styles.zoneItem}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <TouchableOpacity 
                  onPress={() => toggleZone(zone.id)}
                  style={[styles.statusBadge, { backgroundColor: zone.active ? '#E8F5E9' : '#FFEBEE' }]}
                >
                  <Text style={[styles.statusText, { color: zone.active ? '#2E7D32' : '#D32F2F' }]}>
                    {zone.active ? 'Active' : 'Disabled'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Broadcast */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Broadcast Notifications</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Send message to all users</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Flash sale starts in 10 mins!"
              value={broadcastMsg}
              onChangeText={setBroadcastMsg}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !broadcastMsg && styles.disabledBtn]} 
              onPress={handleSendBroadcast}
              disabled={!broadcastMsg}
            >
              <Text style={styles.sendBtnText}>Send Broadcast</Text>
            </TouchableOpacity>
          </View>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  warningText: {
    fontSize: 11,
    color: '#E65100',
  },
  zoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  zoneName: {
    fontSize: 14,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F7F9F7',
    borderWidth: 1,
    borderColor: '#E0EAE0',
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
  },
  sendBtn: {
    backgroundColor: '#2E7D32',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OperationalControlScreen;
