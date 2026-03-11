import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';

const { width } = Dimensions.get('window');

const ExecutiveDashboard = () => {
  const { navigate, showToast } = useAppNavigation();
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '1Y'>('7D');

  const stats = [
    { label: 'Revenue', value: '₹1.2L', trend: '+12%', color: '#2E7D32' },
    { label: 'Orders', value: '842', trend: '+5%', color: '#1976D2' },
    { label: 'Avg Order', value: '₹142', trend: '-2%', color: '#FFA000' },
    { label: 'Customers', value: '1.2K', trend: '+18%', color: '#7B1FA2' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Executive Dashboard</Text>
      </View>

      <View style={styles.tabBar}>
        {['7D', '30D', '1Y'].map(range => (
          <TouchableOpacity 
            key={range} 
            style={[styles.tab, timeRange === range && styles.activeTab]}
            onPress={() => setTimeRange(range as any)}
          >
            <Text style={[styles.tabText, timeRange === range && styles.activeTabText]}>{range}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statTrend, { color: stat.trend.startsWith('+') ? '#4CAF50' : '#F44336' }]}>
                {stat.trend} vs last {timeRange}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartTitle}>Revenue Growth (Last {timeRange})</Text>
          <View style={styles.chartGraphic}>
             {/* Simple Bar Simulation */}
             <View style={[styles.bar, { height: '30%' }]} />
             <View style={[styles.bar, { height: '50%' }]} />
             <View style={[styles.bar, { height: '40%' }]} />
             <View style={[styles.bar, { height: '80%', backgroundColor: '#2E7D32' }]} />
             <View style={[styles.bar, { height: '60%' }]} />
             <View style={[styles.bar, { height: '70%' }]} />
             <View style={[styles.bar, { height: '90%', backgroundColor: '#2E7D32' }]} />
          </View>
          <View style={styles.chartLabels}>
             <Text style={styles.chartLabel}>Mon</Text>
             <Text style={styles.chartLabel}>Tue</Text>
             <Text style={styles.chartLabel}>Wed</Text>
             <Text style={styles.chartLabel}>Thu</Text>
             <Text style={styles.chartLabel}>Fri</Text>
             <Text style={styles.chartLabel}>Sat</Text>
             <Text style={styles.chartLabel}>Sun</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Selling Categories</Text>
          <View style={styles.categoryRow}>
             <View style={styles.catBox}>
                <Text style={styles.catName}>Beverages</Text>
                <Text style={styles.catValue}>32% share</Text>
             </View>
             <View style={styles.catBox}>
                <Text style={styles.catName}>Snacks</Text>
                <Text style={styles.catValue}>24% share</Text>
             </View>
             <View style={styles.catBox}>
                <Text style={styles.catName}>Essentials</Text>
                <Text style={styles.catValue}>15% share</Text>
             </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.fullReportBtn}
          onPress={() => showToast('Full CSV report requested', 'info')}
        >
          <Text style={styles.fullReportText}>Download Full Sales Report (CSV)</Text>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    justifyContent: 'center',
    gap: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#2E7D32',
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 40) / 2,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statTrend: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  chartPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  chartGraphic: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  bar: {
    width: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 10,
  },
  chartLabel: {
    fontSize: 10,
    color: '#999',
    width: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  catBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  catName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  catValue: {
    fontSize: 10,
    color: '#2E7D32',
    marginTop: 2,
  },
  fullReportBtn: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#eee',
  },
  fullReportText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ExecutiveDashboard;
