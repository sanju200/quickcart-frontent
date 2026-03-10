import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAppNavigation, useCartCount } from '../context/AppContext';
import { getUserData } from '../services/authentication.service';
import { createOrder } from '../services/order.service';
import { clearCart } from '../services/cart.service';

const UPI_METHODS = [
  { id: 'gpay', name: 'Google Pay', icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' },
  { id: 'phonepe', name: 'PhonePe', icon: 'https://cdn-icons-png.flaticon.com/512/825/825590.png' },
  { id: 'paytm', name: 'Paytm', icon: 'https://cdn-icons-png.flaticon.com/512/825/825454.png' },
];

const CARDS = [
  { id: 'visa', name: 'Credit / Debit Cards', subtitle: 'Visa, Mastercard, RuPay & more', icon: '💳' },
];

const OTHER_METHODS = [
  { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
  { id: 'cod', name: 'Cash on Delivery', icon: '💵' },
];

const PaymentsScreen = () => {
  const { navigate, categoryData, showToast } = useAppNavigation();
  const { refreshCartCount, resetCart } = useCartCount();
  const [selectedMethod, setSelectedMethod] = useState('gpay');
  const [loading, setLoading] = useState(false);

  const cartItems = categoryData?.items || [];
  const totalAmount = categoryData?.total || 0;

  const handleProceedToPay = async () => {
    try {
      setLoading(true);
      
      // 1. Prepare Order Data
      const user = await getUserData();
      if (!user) throw new Error('User not found');

      // Extract the selected address string
      let selectedAddress = 'Address not provided';
      if (Array.isArray(user.addresses)) {
        const selected = user.addresses.find((a: any) => a.isSelected);
        if (selected) {
          selectedAddress = `${selected.streetAddress}, ${selected.city}, ${selected.state} - ${selected.postalCode}`;
        } else if (user.addresses.length > 0) {
          const first = user.addresses[0];
          selectedAddress = `${first.streetAddress}, ${first.city}, ${first.state} - ${first.postalCode}`;
        }
      } else if (typeof user.addresses === 'string') {
        selectedAddress = user.addresses;
      }

      const orderData = {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone || 'N/A',
        address: selectedAddress,
        totalAmount: Number(totalAmount),
        items: cartItems.map((item: any) => ({
          productId: item.productId || item.product?.id,
          productTitle: item.product?.name || 'Product',
          productImage: item.product?.image || 'https://via.placeholder.com/60',
          quantity: item.quantity,
          price: typeof item.product?.price === 'string' 
            ? parseFloat(item.product.price.replace(/[^\d.]/g, '')) 
            : item.product?.price || 0
        }))
      };

      // 3. Create Order in Backend
      await createOrder(orderData);

      // 4. Order created successfully! Reset UI state immediately
      resetCart();

      // 5. Clear Cart in Backend (only if order were successful)
      try {
        await clearCart();
      } catch (clearError) {
        console.warn('Failed to clear cart on backend, but order was placed:', clearError);
      }
      
      // 6. Final sync with server to ensure everything is clean
      await refreshCartCount();

      // 7. Show Notification and Navigate
      showToast('Order placed successfully!', 'success');
      navigate('HOME');

    } catch (error: any) {
      console.error('Payment Error:', error);
      showToast(error.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('CART')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Payment Method</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* UPI Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UPI</Text>
          <View style={styles.cardContainer}>
            {UPI_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.methodItem}
                onPress={() => setSelectedMethod(method.id)}
              >
                <Image source={{ uri: method.icon }} style={styles.methodIconImage} />
                <Text style={styles.methodName}>{method.name}</Text>
                <View style={styles.radioOutline}>
                  {selectedMethod === method.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cards</Text>
          <View style={styles.cardContainer}>
            {CARDS.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.methodItem}
                onPress={() => setSelectedMethod(card.id)}
              >
                <View style={styles.methodIconBox}>
                  <Text style={styles.methodIconText}>{card.icon}</Text>
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{card.name}</Text>
                  <Text style={styles.methodSubtitle}>{card.subtitle}</Text>
                </View>
                <View style={styles.radioOutline}>
                  {selectedMethod === card.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Other Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Payment Options</Text>
          <View style={styles.cardContainer}>
            {OTHER_METHODS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.methodItem}
                onPress={() => setSelectedMethod(item.id)}
              >
                <View style={styles.methodIconBox}>
                  <Text style={styles.methodIconText}>{item.icon}</Text>
                </View>
                <Text style={styles.methodName}>{item.name}</Text>
                <View style={styles.radioOutline}>
                  {selectedMethod === item.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer Banner */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceValue}>₹{totalAmount}</Text>
          <Text style={styles.selectedMethodText}>
            Paying via {
              [...UPI_METHODS, ...CARDS, ...OTHER_METHODS].find(m => m.id === selectedMethod)?.name || 'UPI'
            }
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.payBtn, loading && styles.payBtnDisabled]} 
          onPress={handleProceedToPay}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>Proceed to Pay</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Full Screen Loader Overlay */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loaderText}>Processing Payment...</Text>
            <Text style={styles.loaderSubtext}>Please do not close the app or press back</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
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
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 180, // Increased to accommodate the sticky footer above bottom nav
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  methodIconImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    marginRight: 15,
  },
  methodIconBox: {
    width: 32,
    height: 32,
    backgroundColor: '#F1F8E9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  methodIconText: {
    fontSize: 18,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  methodSubtitle: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  radioOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E7D32',
  },
  footer: {
    position: 'absolute',
    bottom: 80, // Positioned above the 80px bottom nav
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  priceContainer: {
    justifyContent: 'center',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  selectedMethodText: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: 'bold',
    marginTop: 2,
  },
  payBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  payBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  payBtnDisabled: {
    backgroundColor: '#9E9E9E',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  loaderCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
  },
  loaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#000',
  },
  loaderSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  }
});

export default PaymentsScreen;
