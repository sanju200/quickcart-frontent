import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';

const PartnerOnboardingScreen = () => {
  const { navigate, showToast } = useAppNavigation();
  const [pendingPartners, setPendingPartners] = useState([
    { id: '1', name: 'Arjun Mehra', email: 'arjun@example.com', vehicle: 'Motorcycle', appliedAt: '2026-03-10' },
    { id: '2', name: 'Zoya Khan', email: 'zoya@example.com', vehicle: 'Electric Scooter', appliedAt: '2026-03-11' },
    { id: '3', name: 'Manish P.', email: 'manish@example.com', vehicle: 'Bicycle', appliedAt: '2026-03-11' },
  ]);

  const handleApprove = (id: string, name: string) => {
    Alert.alert(
      'Approve Partner',
      `Confirm approval for ${name}? They will gain immediate access to the delivery dashboard.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: () => {
            setPendingPartners(prev => prev.filter(p => p.id !== id));
            showToast(`${name} has been approved!`, 'success');
          }
        }
      ]
    );
  };

  const handleReject = (id: string, name: string) => {
    Alert.alert(
      'Reject Application',
      `Are you sure you want to reject ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: () => {
            setPendingPartners(prev => prev.filter(p => p.id !== id));
            showToast(`Application rejected`, 'info');
          }
        }
      ]
    );
  };

  const renderPartnerItem = ({ item }: { item: any }) => (
    <View style={styles.partnerCard}>
      <View style={styles.partnerInfo}>
        <Text style={styles.partnerName}>{item.name}</Text>
        <Text style={styles.partnerDetail}>{item.email}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.vehicleBadge}>
            <Text style={styles.badgeText}>{item.vehicle}</Text>
          </View>
          <Text style={styles.dateText}>Applied: {item.appliedAt}</Text>
        </View>
      </View>
      <View style={styles.docStatus}>
          <Text style={styles.docIcon}>📄 ✓</Text>
          <Text style={styles.docLabel}>Docs Verified</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.approveBtn]} 
          onPress={() => handleApprove(item.id, item.name)}
        >
          <Text style={styles.approveBtnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.rejectBtn]} 
          onPress={() => handleReject(item.id, item.name)}
        >
          <Text style={styles.rejectBtnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Onboarding</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{pendingPartners.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>124</Text>
          <Text style={styles.statLabel}>Total Active</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Review Applications</Text>
        <FlatList
          data={pendingPartners}
          keyExtractor={(item) => item.id}
          renderItem={renderPartnerItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👍</Text>
              <Text style={styles.emptyText}>Inbox is clear! No pending applications.</Text>
            </View>
          }
        />
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
  statsRow: {
    flexDirection: 'row',
    padding: 15,
    gap: 15,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  statNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  listContent: {
    paddingBottom: 40,
  },
  partnerCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  partnerInfo: {
    marginBottom: 10,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  partnerDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  vehicleBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  dateText: {
    fontSize: 10,
    color: '#999',
  },
  docStatus: {
    backgroundColor: '#F5f5f5',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  docIcon: {
    marginRight: 6,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  docLabel: {
    fontSize: 11,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: '#2E7D32',
  },
  rejectBtn: {
    backgroundColor: '#F1F1F1',
  },
  approveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rejectBtnText: {
    color: '#333',
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
    color: '#999',
    marginTop: 10,
  },
});

export default PartnerOnboardingScreen;
