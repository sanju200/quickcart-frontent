/**
 * QuickGreen - Home Page (Modular Architecture)
 */

import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { 
  StatusBar, 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  Animated, 
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Import Custom Components
import Header from './src/components/Header';
import Carousel from './src/components/Carousel';
import Features from './src/components/Features';
import Categories from './src/components/Categories';
import CategoryProducts from './src/components/CategoryProducts';
import ProfileScreen from './src/components/ProfileScreen';
import OrdersScreen from './src/components/OrdersScreen';
import CartScreen from './src/components/CartScreen';
import PaymentsScreen from './src/components/PaymentsScreen';
import LoginScreen from './src/components/LoginScreen';
import SignupScreen from './src/components/SignupScreen';
import EditProfileScreen from './src/components/EditProfileScreen';
import SavedAddressesScreen from './src/components/SavedAddressesScreen';
import PreviouslyOrderedProducts from './src/components/PreviouslyOrderedProducts';
import NotFoundScreen from './src/components/NotFoundScreen';
import ToastNotification from './src/components/ToastNotification';
import { getAuthToken } from './src/services/authentication.service';

const { width } = Dimensions.get('window');

import { Screen, NavigationContext, CartContext } from './src/context/AppContext';
import { getCart } from './src/services/cart.service';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [categoryData, setCategoryData] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const refreshCartCount = async () => {
    try {
      const items = await getCart();
      setCartItems(items);
      // count unique items by their product ID to ensure the badge shows total types of items
      const uniqueItems = new Set(items.map(item => item.productId || item.product?.id || item.id));
      setCartCount(uniqueItems.size);
    } catch (error) {
      console.error('Failed to refresh cart count:', error);
    }
  };

  const resetCart = () => {
    setCartItems([]);
    setCartCount(0);
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          setCurrentScreen('LOGIN');
        } else {
          setCurrentScreen('HOME');
          refreshCartCount(); // Initial count load
        }
      } catch (error) {
        setCurrentScreen('LOGIN');
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuthStatus();
  }, []);

  const navigate = (screen: Screen, data?: any) => {
    // Smooth transition
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen(screen);
      if (data) setCategoryData(data);
      
      // Refresh cart count on specific navigations if needed
      if (screen === 'CART' || screen === 'HOME') {
        refreshCartCount();
      }

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
  };

  if (isLoadingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <NavigationContext.Provider value={{ currentScreen, categoryData, navigate, showToast }}>
      <CartContext.Provider value={{ cartItems, cartCount, refreshCartCount, resetCart }}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <View style={styles.mainWrapper}>
            <AppContent fadeAnim={fadeAnim} />
          </View>
          <ToastNotification
            message={toast.message}
            type={toast.type}
            visible={toast.visible}
            onHide={() => setToast({ ...toast, visible: false })}
          />
        </SafeAreaProvider>
      </CartContext.Provider>
    </NavigationContext.Provider>
  );
}

function AppContent({ fadeAnim }: { fadeAnim: Animated.Value }) {
  const safeAreaInsets = useSafeAreaInsets();
  const { currentScreen, navigate } = useContext(NavigationContext)!;
  const { cartItems, cartCount, refreshCartCount } = useContext(CartContext)!;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
          >
            <View style={styles.content}>
              <Carousel />
              <Features />
              <Categories />
              {/* No empty boxes here anymore */}
              <View style={{ height: 120 }} />
            </View>
          </ScrollView>
        );
      case 'CATEGORY_PRODUCTS':
        return <CategoryProducts />;
      case 'PROFILE':
        return <ProfileScreen />;
      case 'EDIT_PROFILE':
        return <EditProfileScreen />;
      case 'SAVED_ADDRESSES':
        return <SavedAddressesScreen />;
      case 'ORDERS':
        return <OrdersScreen />;
      case 'CART':
        return <CartScreen />;
      case 'PAYMENTS':
        return <PaymentsScreen />;
      case 'LOGIN':
        return <LoginScreen />;
      case 'SIGNUP':
        return <SignupScreen />;
      case 'NOT_FOUND':
        return <NotFoundScreen />;
      case 'PREVIOUSLY_ORDERED':
        return <PreviouslyOrderedProducts />;
      default:
        return <NotFoundScreen />;
    }
  };

  const showNavAndHeader = !['LOGIN', 'SIGNUP', 'NOT_FOUND'].includes(currentScreen);

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      {/* Sticky Top Header - Only show on Home screen to avoid double headers */}
      {currentScreen === 'HOME' && <Header />}

      {/* Main Content with Fade Transition */}
      <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
        {renderScreen()}
      </Animated.View>

      {/* Sticky Bottom Nav with Icons and Labels */}
      {showNavAndHeader && (
        <View style={[styles.bottomNav, { paddingBottom: safeAreaInsets.bottom || 15 }]}>
          <TouchableOpacity onPress={() => navigate('HOME')} style={styles.navItem}>
            <Text style={[styles.navIcon, currentScreen === 'HOME' && styles.navActiveText]}>🏠</Text>
            <Text style={[styles.navLabel, currentScreen === 'HOME' && styles.navActiveText]}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigate('CATEGORY_PRODUCTS', { category: 'all' })} style={styles.navItem}>
            <Text style={[styles.navIcon, currentScreen === 'CATEGORY_PRODUCTS' && styles.navActiveText]}>🔳</Text>
            <Text style={[styles.navLabel, currentScreen === 'CATEGORY_PRODUCTS' && styles.navActiveText]}>Categories</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigate('ORDERS')} style={styles.navItem}>
            <Text style={[styles.navIcon, currentScreen === 'ORDERS' && styles.navActiveText]}>🔄</Text>
            <Text style={[styles.navLabel, currentScreen === 'ORDERS' && styles.navActiveText]}>Order Again</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigate('CART')} style={styles.navItem}>
            <View>
              <Text style={[styles.navIcon, currentScreen === 'CART' && styles.navActiveText]}>🛒</Text>
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.navLabel, currentScreen === 'CART' && styles.navActiveText]}>Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screenContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  content: {
    backgroundColor: '#F1F8E9',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  navItem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width / 4,
  },
  navIcon: {
    fontSize: 22,
    color: '#757575',
  },
  navLabel: {
    fontSize: 10,
    color: '#757575',
    marginTop: 4,
    fontWeight: '600',
  },
  navActiveText: {
    color: '#2E7D32',
  },
  badge: {
    position: 'absolute',
    right: -10,
    top: -5,
    backgroundColor: '#E53935',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  placeholderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    padding: 20,
  },
  placeholderIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backBtn: {
    marginTop: 30,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default App;
