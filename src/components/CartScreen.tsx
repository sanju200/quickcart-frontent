import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAppNavigation } from '../../App';


const MOCK_CART_ITEMS = [
  { id: 'c1', name: 'Fresh Spinach', price: 40, weight: '250g', quantity: 2, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80' },
  { id: 'c2', name: 'Organic Banana', price: 60, weight: '500g', quantity: 1, image: 'https://images.unsplash.com/photo-1571771894821-ad996211fdf4?w=200&q=80' },
  { id: 'c3', name: 'Red Apple', price: 120, weight: '500g', quantity: 1, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&q=80' },
];

const CartScreen = () => {
  const { navigate } = useAppNavigation();
  const [items, setItems] = useState(MOCK_CART_ITEMS);

  const updateQuantity = (id: string, delta: number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(0, item.quantity + delta) } 
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const deliveryFee = 25;
  const handlingFee = 5;
  const subtotal = calculateSubtotal();
  const total = items.length > 0 ? subtotal + deliveryFee + handlingFee : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Cart</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.length > 0 ? (
          <>
            {/* Delivery Time Banner */}
            <View style={styles.deliveryBanner}>
              <Text style={styles.deliveryIcon}>⚡</Text>
              <Text style={styles.deliveryText}>Delivery in 8 mins to Home</Text>
            </View>

            {/* Cart Items List */}
            <View style={styles.itemsContainer}>
              {items.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemWeight}>{item.weight}</Text>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                  </View>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity 
                      style={styles.qtyBtn} 
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.qtyBtn} 
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Bill Details */}
            <View style={styles.billContainer}>
              <Text style={styles.billTitle}>Bill Details</Text>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billValue}>₹{subtotal}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text style={styles.billValue}>₹{deliveryFee}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Handling Fee</Text>
                <Text style={styles.billValue}>₹{handlingFee}</Text>
              </View>
              <View style={[styles.billRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>₹{total}</Text>
              </View>
            </View>

            {/* Cancellation Policy */}
            <View style={styles.policyContainer}>
              <Text style={styles.policyTitle}>Cancellation Policy</Text>
              <Text style={styles.policyText}>
                Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided.
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyCartIcon}>🛒</Text>
            <Text style={styles.emptyCartText}>Your cart is empty!</Text>
            <TouchableOpacity onPress={() => navigate('HOME')} style={styles.shopBtn}>
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sticky Checkout Bar */}
      {items.length > 0 && (
        <View style={styles.checkoutBar}>
          <TouchableOpacity 
            style={styles.paymentMethodSection} 
            onPress={() => navigate('PAYMENTS')}
          >
            <View style={styles.paymentInfo}>
              <Text style={styles.checkoutTotal}>₹{total}</Text>
              <View style={styles.paymentMethodLabel}>
                <Text style={styles.paymentMethodText}>Google Pay</Text>
                <Text style={styles.paymentDropdownIcon}> ⌄</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.payBtn} onPress={() => navigate('PAYMENTS')}>
            <Text style={styles.payBtnText}>Proceed to Pay →</Text>
          </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollContent: {
    paddingBottom: 150,
  },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  deliveryIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  deliveryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  itemsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  itemWeight: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 4,
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  billContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  billLabel: {
    fontSize: 14,
    color: '#666',
  },
  billValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  policyContainer: {
    padding: 15,
    marginTop: 10,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  policyText: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  },
  emptyCart: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyCartIcon: {
    fontSize: 80,
    marginBottom: 20,
    opacity: 0.3,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  shopBtn: {
    marginTop: 20,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shopBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  paymentMethodSection: {
    flex: 1,
    marginRight: 10,
  },
  paymentInfo: {
    justifyContent: 'center',
  },
  checkoutTotal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
  },
  paymentMethodLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  paymentDropdownIcon: {
    fontSize: 10,
    color: '#2E7D32',
  },
  payBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 12,
  },
  payBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CartScreen;
