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
import { getOrderDetails, Order, OrderStatus } from '../services/order.service';

interface TrackOrderScreenProps {
  orderId: string;
}

const STATUS_STEPS: { status: OrderStatus; label: string; icon: string; description: string }[] = [
  { status: 'PLACED', label: 'Order Placed', icon: '📝', description: 'Your order has been received' },
  { status: 'PROCESSING', label: 'Processing', icon: '⚙️', description: 'We are preparing your items' },
  { status: 'HANDED_OVER', label: 'Handed Over', icon: '📦', description: 'Transferred to our courier partner' },
  { status: 'IN_TRANSIT', label: 'In Transit', icon: '🚚', description: 'Your order is on the way' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🛵', description: 'Our partner is nearby' },
  { status: 'DELIVERED', label: 'Delivered', icon: '✅', description: 'Order reached its destination' },
];

const TrackOrderScreen = ({ orderId }: TrackOrderScreenProps) => {
  const { navigate, categoryData } = useAppNavigation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback to orderId from categoryData if prop is not passed (common in this app's navigation)
  const id = orderId || categoryData?.orderId;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderDetails(id);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate('ORDERS')}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStatusIndex = STATUS_STEPS.findIndex(step => step.status === order.status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('ORDERS')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.orderSummaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.orderLabel}>Order ID:</Text>
            <Text style={styles.orderValue}>#{order.id}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.orderLabel}>Placed On:</Text>
            <Text style={styles.orderValue}>
                {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          {order.trackingNumber && (
            <View style={styles.trackingInfo}>
              <Text style={styles.trackingLabel}>Tracking Number:</Text>
              <Text style={styles.trackingValue}>{order.trackingNumber}</Text>
              {order.courierName && <Text style={styles.courierValue}>{order.courierName}</Text>}
            </View>
          )}
        </View>

        <View style={styles.timelineContainer}>
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const isLast = index === STATUS_STEPS.length - 1;

            return (
              <View key={step.status} style={styles.stepWrapper}>
                <View style={styles.leftColumn}>
                  <View style={[
                    styles.dot, 
                    isCompleted ? styles.dotCompleted : styles.dotPending,
                    isCurrent && styles.dotCurrent
                  ]}>
                    {isCompleted && !isCurrent ? <Text style={styles.checkIcon}>✓</Text> : null}
                  </View>
                  {!isLast && (
                    <View style={[
                      styles.line, 
                      index < currentStatusIndex ? styles.lineCompleted : styles.linePending
                    ]} />
                  )}
                </View>
                <View style={styles.rightColumn}>
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepIcon}>{step.icon}</Text>
                    <Text style={[
                      styles.stepLabel, 
                      isCompleted ? styles.stepLabelActive : styles.stepLabelPending
                    ]}>
                      {step.label}
                    </Text>
                  </View>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>CURRENT STATUS</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.addressCard}>
          <Text style={styles.addressTitle}>Delivery Address</Text>
          <Text style={styles.addressText}>{order.address || 'N/A'}</Text>
        </View>

        {order.status === 'DELIVERED' && order.proofOfDelivery && (
          <View style={styles.podSection}>
            <Text style={styles.podTitle}>Proof of Delivery</Text>
            <Text style={styles.podValue}>{order.proofOfDelivery}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.helpBtn} 
          onPress={() => navigate('HELP_AND_SUPPORT')}
        >
          <Text style={styles.helpBtnText}>Need Help with this order?</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 100,
  },
  orderSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  trackingInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  trackingLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  trackingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  courierValue: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  timelineContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  stepWrapper: {
    flexDirection: 'row',
    minHeight: 80,
  },
  leftColumn: {
    alignItems: 'center',
    width: 30,
    marginRight: 15,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  dotCompleted: {
    backgroundColor: '#2E7D32',
  },
  dotPending: {
    backgroundColor: '#E0E0E0',
  },
  dotCurrent: {
    backgroundColor: '#2E7D32',
    borderWidth: 4,
    borderColor: '#C8E6C9',
  },
  checkIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  lineCompleted: {
    backgroundColor: '#2E7D32',
  },
  linePending: {
    backgroundColor: '#E0E0E0',
  },
  rightColumn: {
    flex: 1,
    paddingBottom: 25,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepLabelActive: {
    color: '#333',
  },
  stepLabelPending: {
    color: '#999',
  },
  stepDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  currentBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  currentBadgeText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: 'bold',
  },
  podSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  podTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  podValue: {
    fontSize: 14,
    color: '#555',
  },
  helpBtn: {
    padding: 15,
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  helpBtnText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default TrackOrderScreen;
