import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';

const { width } = Dimensions.get('window');

const LiveDeliveryMap = () => {
  const { navigate } = useAppNavigation();
  const [activePartners] = useState([
    { id: '1', name: 'Rahul S.', status: 'Delivering', top: 120, left: 150, color: '#4CAF50' },
    { id: '2', name: 'Amit K.', status: 'To Store', top: 300, left: 80, color: '#FF9800' },
    { id: '3', name: 'Sonia V.', status: 'Idle', top: 200, left: 250, color: '#9E9E9E' },
    { id: '4', name: 'Vikram D.', status: 'Delivering', top: 400, left: 200, color: '#4CAF50' },
  ]);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Delivery Map</Text>
        <View style={styles.liveIndicator}>
            <Animated.View style={[styles.pulse, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Mock Map Area */}
      <View style={styles.mapContainer}>
        <View style={styles.gridBackground}>
          {/* Simulated Streets */}
          <View style={[styles.street, { top: 150, left: 0, width: '100%', height: 20 }]} />
          <View style={[styles.street, { top: 350, left: 0, width: '100%', height: 20 }]} />
          <View style={[styles.street, { top: 0, left: 100, width: 20, height: '100%' }]} />
          <View style={[styles.street, { top: 0, left: 300, width: 20, height: '100%' }]} />
          
          {/* Main Store Marker */}
          <View style={[styles.storeMarker, { top: 220, left: 180 }]}>
            <Text style={styles.storeIcon}>🏪</Text>
            <View style={styles.storeLabel}><Text style={styles.storeLabelText}>Main Hub</Text></View>
          </View>

          {/* Delivery Partner Markers */}
          {activePartners.map(partner => (
            <View 
              key={partner.id} 
              style={[styles.partnerMarker, { top: partner.top, left: partner.left }]}
            >
              <View style={[styles.partnerDot, { backgroundColor: partner.color }]} />
              <View style={styles.partnerLabel}>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <Text style={styles.partnerStatus}>{partner.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Delivering</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>To Store</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9E9E9E' }]} />
            <Text style={styles.legendText}>Idle</Text>
          </View>
        </View>
      </View>

      {/* Active Fleet List */}
      <View style={styles.fleetListContainer}>
        <Text style={styles.sectionTitle}>Active Fleet ({activePartners.length})</Text>
        <ScrollView style={styles.fleetList}>
          {activePartners.map(partner => (
            <TouchableOpacity key={partner.id} style={styles.fleetItem}>
              <View style={[styles.fleetStatusIcon, { backgroundColor: partner.color }]} />
              <View style={styles.fleetInfo}>
                <Text style={styles.fleetName}>{partner.name}</Text>
                <Text style={styles.fleetStatusText}>{partner.status}</Text>
              </View>
              <Text style={styles.fleetLocation}>Zone A-4</Text>
              <Text style={styles.fleetDetail}>{'>'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D32F2F',
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  mapContainer: {
    height: 450,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  gridBackground: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  street: {
    position: 'absolute',
    backgroundColor: '#fff',
    opacity: 0.8,
  },
  storeMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  storeIcon: {
    fontSize: 30,
  },
  storeLabel: {
    backgroundColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  storeLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  partnerMarker: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  partnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  partnerLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
    elevation: 2,
  },
  partnerName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  partnerStatus: {
    fontSize: 8,
    color: '#666',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 8,
    elevation: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 10,
    color: '#333',
  },
  fleetListContainer: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  fleetList: {
    flex: 1,
  },
  fleetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  fleetStatusIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  fleetInfo: {
    flex: 1,
  },
  fleetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  fleetStatusText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  fleetLocation: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
    marginRight: 15,
  },
  fleetDetail: {
    color: '#ccc',
    fontSize: 18,
  }
});

export default LiveDeliveryMap;
