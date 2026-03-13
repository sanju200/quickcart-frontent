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
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { getAllUsers, deleteUser, addUser, AdminUser } from '../services/admin.service';
import { getUserData } from '../services/authentication.service';

const UserManagerScreen = () => {
  const { navigate, showToast } = useAppNavigation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // New User Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');

  useEffect(() => {
    fetchUsers();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const data = await getUserData();
    setCurrentUser(data);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!name || !email || !password) {
      showToast('Name, email and password are required', 'error');
      return;
    }

    try {
      setLoading(true);
      await addUser({ name, email, password, role });
      showToast('User created successfully', 'success');
      resetForm();
      fetchUsers();
    } catch (error: any) {
      showToast(error.message || 'Failed to create user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('USER');
    setIsModalVisible(false);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete "${userName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteUser(userId);
              showToast('User deleted', 'success');
              fetchUsers();
            } catch (error: any) {
              showToast(error.message || 'Failed to delete user', 'error');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderUserItem = ({ item }: { item: AdminUser }) => (
    <View style={styles.userCard}>
      <View style={styles.userAvatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.userInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.userName}>{item.name}</Text>
          {currentUser?.id === item.id && (
            <View style={styles.selfBadge}>
              <Text style={styles.selfBadgeText}>YOU</Text>
            </View>
          )}
        </View>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
          <Text style={styles.roleText}>{item.role}</Text>
        </View>
      </View>
      {currentUser?.id !== item.id && (
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => handleDeleteUser(item.id, item.name)}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return '#D32F2F';
      case 'INVENTORY_MANAGER': return '#F57C00';
      case 'LOGISTICS_PARTNER': return '#1976D2';
      case 'DELIVERY_PARTNER': return '#388E3C';
      default: return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Directory</Text>
        <TouchableOpacity onPress={fetchUsers} style={styles.refreshBtn}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.addBtnText}>+ Add New User</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={[...users].sort((a, b) => {
              if (a.id === currentUser?.id) return -1;
              if (b.id === currentUser?.id) return 1;

              const roleOrder: Record<string, number> = {
                'ADMIN': 1,
                'INVENTORY_MANAGER': 2,
                'LOGISTICS_PARTNER': 3,
                'DELIVERY_PARTNER': 4,
                'USER': 5
              };

              const roleA = roleOrder[a.role] || 99;
              const roleB = roleOrder[b.role] || 99;

              if (roleA !== roleB) {
                return roleA - roleB;
              }

              // Secondary sort by name
              return a.name.localeCompare(b.name);
            })}
            keyExtractor={(item) => item.id}
            renderItem={renderUserItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>👤</Text>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Add User Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Create New Account</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>System Role</Text>
                <View style={styles.rolePicker}>
                  {['USER', 'ADMIN', 'INVENTORY_MANAGER', 'LOGISTICS_PARTNER', 'DELIVERY_PARTNER'].map((r) => (
                    <TouchableOpacity 
                      key={r}
                      style={[styles.roleOption, role === r && styles.selectedRole]}
                      onPress={() => setRole(r)}
                    >
                      <Text style={[styles.roleOptionText, role === r && styles.selectedRoleText]}>
                        {r.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.btn, styles.cancelBtn]} 
                  onPress={resetForm}
                >
                  <Text style={styles.cancelBtnText}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, styles.saveBtn]} 
                  onPress={handleAddUser}
                >
                  <Text style={styles.saveBtnText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
  addBtn: {
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
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  deleteBtn: {
    padding: 10,
  },
  deleteIcon: {
    fontSize: 18,
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
    padding: 25,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
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
  input: {
    backgroundColor: '#F7F9F7',
    borderWidth: 1,
    borderColor: '#E0EAE0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  rolePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F4F0',
    borderWidth: 1,
    borderColor: '#E0EAE0',
  },
  selectedRole: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  roleOptionText: {
    fontSize: 12,
    color: '#666',
  },
  selectedRoleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 25,
    marginBottom: 20,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
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
  selfBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  selfBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});

export default UserManagerScreen;
