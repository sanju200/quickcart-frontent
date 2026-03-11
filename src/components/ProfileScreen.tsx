import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { logoutUser, getUserData, UserData } from '../services/authentication.service';

const PROFILE_OPTIONS = [
  { id: '1', title: 'Order History', icon: '📦', subtitle: 'View your past orders' },
  { id: '2', title: 'Saved Addresses', icon: '📍', subtitle: 'Manage your delivery addresses' },
  { id: '3', title: 'Help & Support', icon: '🎧', subtitle: 'FAQs and live chat' },
  { id: '4', title: 'Contact Details', icon: '📞', subtitle: 'Update your email and phone' },
  { id: '5', title: 'Payment Methods', icon: '💳', subtitle: 'Saved cards and wallets' },
  { id: '6', title: 'Settings', icon: '⚙️', subtitle: 'App preferences and notifications' },
];

const ProfileScreen = () => {
  const { navigate } = useAppNavigation();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const data = await getUserData();
      setUser(data);
      setLoading(false);
    };
    loadUserData();
  }, []);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Details</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Card */}
        {loading ? (
          <View style={[styles.userCard, { justifyContent: 'center' }]}>
            <ActivityIndicator size="small" color="#2E7D32" />
          </View>
        ) : (
          <View style={styles.userCard}>
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {user?.name ? getInitial(user.name) : '?'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
              {user?.phone ? <Text style={styles.userPhone}>{user.phone}</Text> : null}
              {user?.addresses?.find(a => a.isSelected) ? (
                <Text style={styles.userAddress} numberOfLines={1}>
                  {user.addresses.find(a => a.isSelected)?.streetAddress}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigate('EDIT_PROFILE', { from: 'PROFILE' })}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Role-Specific Dashboard Shortcut */}
        {!loading && user?.role && ['INVENTORY_MANAGER', 'LOGISTICS_PARTNER', 'DELIVERY_PARTNER'].includes(user.role) && (
          <TouchableOpacity 
            style={styles.dashboardShortcut}
            onPress={() => {
              if (user.role === 'INVENTORY_MANAGER') navigate('INVENTORY_MANAGER');
              else if (user.role === 'LOGISTICS_PARTNER') navigate('LOGISTICS_PARTNER');
              else if (user.role === 'DELIVERY_PARTNER') navigate('DELIVERY_PARTNER');
            }}
          >
            <View style={styles.dashboardIconBox}>
              <Text style={styles.dashboardIcon}>📊</Text>
            </View>
            <View style={styles.dashboardInfo}>
              <Text style={styles.dashboardTitle}>
                {user.role.replace('_', ' ')} Dashboard
              </Text>
              <Text style={styles.dashboardSubtitle}>Manage orders and fulfillment</Text>
            </View>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
        )}

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {[
            ...PROFILE_OPTIONS,
            ...(user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'INVENTORY_MANAGER' 
              ? [
                  { id: 'admin-dash', title: 'Admin Terminal', icon: '🚀', subtitle: 'Open main management hub' },
                  { id: 'sec-pref', title: '--- SETTINGS ---', type: 'header' },
                ] 
              : [])
          ].map((item: any) => (
            item.type === 'header' ? (
              <View key={item.id} style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{item.title}</Text>
              </View>
            ) : (
            <TouchableOpacity 
              key={item.id} 
              style={styles.optionItem}
              onPress={() => {
                if (item.title === 'Order History') {
                  navigate('ORDERS', { from: 'PROFILE' });
                } else if (item.title === 'Saved Addresses') {
                  navigate('SAVED_ADDRESSES', { from: 'PROFILE' });
                } else if (item.title === 'Contact Details') {
                  navigate('CONTACT_DETAILS', { from: 'PROFILE' });
                } else if (item.title === 'Help & Support') {
                  navigate('HELP_AND_SUPPORT', { from: 'PROFILE' });
                } else if (item.title === 'Admin Terminal') {
                  navigate('HOME');
                }
              }}
            >
              <View style={styles.optionIconBox}>
                <Text style={styles.optionIcon}>{item.icon}</Text>
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
            )
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={async () => {
          await logoutUser();
          navigate('LOGIN');
        }}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>

        {user?.role === 'ADMIN' && (
          <View style={styles.roleContainer}>
            <Text style={styles.roleHeader}>Switch Role (Demo Mode)</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity style={styles.roleBtn} onPress={() => navigate('INVENTORY_MANAGER')}>
                <Text style={styles.roleBtnText}>Inventory</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.roleBtn} onPress={() => navigate('LOGISTICS_PARTNER')}>
                <Text style={styles.roleBtnText}>Logistics</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.roleBtn} onPress={() => navigate('DELIVERY_PARTNER')}>
                <Text style={styles.roleBtnText}>Delivery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.versionText}>App Version 1.0.5</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 120,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#666',
  },
  userAddress: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontStyle: 'italic',
  },
  editBtn: {
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  editBtnText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  optionIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#F9FBF9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 24,
    color: '#ccc',
    marginLeft: 10,
  },
  logoutBtn: {
    marginTop: 25,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffebee',
  },
  logoutBtnText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
    color: '#999',
  },
  roleContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  roleHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleBtn: {
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    width: '30%',
    alignItems: 'center',
  },
  roleBtnText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  dashboardShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  dashboardIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  dashboardIcon: {
    fontSize: 20,
  },
  dashboardInfo: {
    flex: 1,
  },
  dashboardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  dashboardSubtitle: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 2,
    opacity: 0.8,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9E9E9E',
    letterSpacing: 1,
  },
});

export default ProfileScreen;
