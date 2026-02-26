import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAppNavigation } from '../../App';
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
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {PROFILE_OPTIONS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.optionItem}>
              <View style={styles.optionIconBox}>
                <Text style={styles.optionIcon}>{item.icon}</Text>
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={async () => {
          await logoutUser();
          navigate('LOGIN');
        }}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>App Version 1.0.4</Text>
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
  }
});

export default ProfileScreen;
