import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';

const DeliveryAnalyticsScreen = () => {
  const { navigate, showToast } = useAppNavigation();

  const metrics = [
    { label: 'Avg Delivery Time', value: '24 min', sub: '-2m vs yesterday', color: '#2E7D32' },
    { label: 'Wait at Store', value: '8 min', sub: '+1m vs yesterday', color: '#FFA000' },
    { label: 'Partner Occupancy', value: '78%', sub: '+4% vs yesterday', color: '#1976D2' },
    { label: 'Cancellation Rate', value: '1.2%', sub: 'No change', color: '#D32F2F' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Analytics</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.metricsGrid}>
          {metrics.map((m, idx) => (
            <View key={idx} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
              <Text style={styles.metricSub}>{m.sub}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chartBox}>
          <Text style={styles.chartTitle}>Delivery Time Trends (Hourly)</Text>
          <View style={styles.lineChartSim}>
             {/* Simulated Line Chart */}
             <View style={styles.chartLine} />
             <View style={[styles.dataPoint, { left: 0, bottom: 40 }]} />
             <View style={[styles.dataPoint, { left: '20%', bottom: 60 }]} />
             <View style={[styles.dataPoint, { left: '40%', bottom: 30 }]} />
             <View style={[styles.dataPoint, { left: '60%', bottom: 80 }]} />
             <View style={[styles.dataPoint, { left: '80%', bottom: 50 }]} />
             <View style={[styles.dataPoint, { left: '100%', bottom: 45 }]} />
          </View>
          <View style={styles.chartLabels}>
             <Text style={styles.chartLabel}>10AM</Text>
             <Text style={styles.chartLabel}>1PM</Text>
             <Text style={styles.chartLabel}>4PM</Text>
             <Text style={styles.chartLabel}>7PM</Text>
             <Text style={styles.chartLabel}>10PM</Text>
          </View>
        </View>

        <View style={styles.bottleneckSection}>
          <Text style={styles.sectionTitle}>Identified Bottlenecks</Text>
          <View style={styles.bottleneckItem}>
             <Text style={styles.bottleneckLabel}>Traffic Delay - Zone A</Text>
             <View style={styles.progressBar}><View style={[styles.progress, { width: '80%', backgroundColor: '#D32F2F' }]} /></View>
          </View>
          <View style={styles.bottleneckItem}>
             <Text style={styles.bottleneckLabel}>Store Prep Delay - Hub 1</Text>
             <View style={styles.progressBar}><View style={[styles.progress, { width: '45%', backgroundColor: '#FFA000' }]} /></View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.optimizeBtn}
          onPress={() => showToast('Suggesting route optimizations...', 'success')}
        >
          <Text style={styles.optimizeText}>AI Optimization Advice</Text>
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
  content: {
    flex: 1,
    padding: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  metricSub: {
    fontSize: 10,
    color: '#999',
  },
  chartBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  lineChartSim: {
    height: 120,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#eee',
    position: 'relative',
    marginBottom: 10,
  },
  chartLine: {
    position: 'absolute',
    top: '40%',
    width: '100%',
    height: 2,
    backgroundColor: '#E8F5E9',
  },
  dataPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontSize: 10,
    color: '#999',
  },
  bottleneckSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  bottleneckItem: {
    marginBottom: 12,
  },
  bottleneckLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
  optimizeBtn: {
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  optimizeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default DeliveryAnalyticsScreen;
