import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';

import { useAppNavigation, useCartCount } from '../context/AppContext';
import { getUserData, UserData } from '../services/authentication.service';

const Header = () => {
  const { navigate, currentScreen, userRole } = useAppNavigation();
  const { cartCount } = useCartCount();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const data = await getUserData();
      setUser(data);
    };
    loadUser();
  }, [currentScreen]); // Trigger refresh on navigation


  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {/* Top Bar: Profile (Left), Location (Center), Cart (Right) */}
      <View style={styles.topBar}>
        {/* Profile Button (Left) */}
        <TouchableOpacity style={styles.profileButton} onPress={() => navigate('PROFILE')}>
          <View style={styles.profileAvatarFallback}>
            <Text style={styles.profileAvatarText}>
              {user?.name ? getInitial(user.name) : '?'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Logo & Location (Center) */}
        <View style={styles.centerContainer}>
          <View style={styles.logoMiniContainer}>
            <Text style={styles.logoIconTextSmall}>🥬</Text>
            <Text style={styles.logoTextSmall}>QuickCart</Text>
          </View>
          {userRole === 'USER' && (
            <View style={styles.locationContainer}>
              <Text style={styles.locationPin}>📍</Text>
              <Text style={styles.addressText} numberOfLines={1}>
                {user?.addresses?.find(a => a.isSelected)?.streetAddress || 'Set Location'} ⌄
              </Text>
            </View>
          )}
        </View>

        {/* Cart Button (Right) - Only for customers */}
        {userRole === 'USER' && (
          <TouchableOpacity style={styles.cartButton} onPress={() => navigate('CART')}>
            <View style={styles.cartIconWrapper}>
              <Text style={styles.cartIcon}>🛒</Text>
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>�</Text>
          <TextInput
            placeholder={userRole === 'USER' ? "Search for organics, veggies, fruits..." : "Search orders, items, reports..."}
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
          <View style={styles.searchShortcut}>
            <Text style={styles.shortcutText}>⌘ K</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
    height: 60,
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoMiniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  logoIconTextSmall: {
    fontSize: 12,
    marginRight: 4,
  },
  logoTextSmall: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2E7D32',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: '90%',
  },
  locationPin: {
    marginRight: 4,
    fontSize: 10,
    color: '#2E7D32',
  },
  addressText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000',
  },
  cartButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIconWrapper: {
    position: 'relative',
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#000',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileDetailsCard: {
    marginHorizontal: 15,
    marginTop: 10,
    backgroundColor: '#FAF7F2',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: '#666',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  closeBtn: {
    padding: 5,
  },
  closeBtnText: {
    fontSize: 20,
    color: '#999',
  },
  profileActions: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  profileActionItem: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  searchContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 10,
    color: '#2E7D32',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  searchShortcut: {
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  shortcutText: {
    fontSize: 10,
    color: '#999',
  },
});

export default Header;
