import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllCategories } from '../services/category.service';
import { getAdminStats, AdminStats } from '../services/admin.service';


const { width } = Dimensions.get('window');

const AdminDashboardScreen = () => {
  const { navigate } = useAppNavigation();
  const insets = useSafeAreaInsets();
  const [dashboardCategories, setDashboardCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    activeOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cats, adminStats] = await Promise.all([
          getAllCategories(),
          getAdminStats()
        ]);
        setDashboardCategories(cats.filter(c => c.id !== 'all'));
        setStats(adminStats);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sections = [
    {
      title: 'Control Center',
      items: [
        { id: 'users', title: 'User Directory', icon: '👥', color: '#E8F5E9', screen: 'USER_MANAGER' },
        { id: 'sales', title: 'Sales Ledger', icon: '🧾', color: '#E3F2FD', screen: 'SALES_MANAGER' },
        { id: 'exec', title: 'Analytics', icon: '📊', color: '#E8EAF6', screen: 'EXECUTIVE_DASHBOARD' },
        { id: 'ops', title: 'Operations', icon: '⚙️', color: '#ECEFF1', screen: 'OPERATIONAL_CONTROL' },
      ]
    },
    {
      title: 'Inventory & Growth',
      items: [
        { id: 'add', title: 'Add Product', icon: '➕', color: '#FFF3E0', screen: 'ADD_PRODUCT' },
        { id: 'cat', title: 'Categories', icon: '📂', color: '#F3E5F5', screen: 'CATEGORY_MANAGER' },
        { id: 'off', title: 'Offers', icon: '🎟️', color: '#E0F2F1', screen: 'OFFER_MANAGER' },
        { id: 'low', title: 'Low Stock', icon: '📉', color: '#FFEBEE', screen: 'LOW_STOCK_DASHBOARD' },
      ]
    },
    {
      title: 'Logistics & Fleet',
      items: [
        { id: 'map', title: 'Live Map', icon: '📍', color: '#F1F8E9', screen: 'LIVE_DELIVERY_MAP' },
        { id: 'onboard', title: 'Partners', icon: '🤝', color: '#E0F2F1', screen: 'PARTNER_ONBOARDING' },
        { id: 'comm', title: 'Commission', icon: '💰', color: '#F1F8E9', screen: 'COMMISSION_MANAGER' },
        { id: 'feed', title: 'Feedback', icon: '💬', color: '#FFFDE7', screen: 'FEEDBACK_CENTER' },
      ]
    }
  ];

  return (
    <View style={styles.container}>
      {/* Dashboard Sub-Header */}
      <View style={styles.dashboardHeader}>
        <View>
          <Text style={styles.welcomeText}>Admin Portal</Text>
          <Text style={styles.dashboardTitle}>QuickCart Terminal</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigate('SALES_MANAGER')}
          >
            <Text style={styles.statLabel}>Today's Revenue</Text>
            <Text style={styles.statValue}>₹{stats.totalRevenue.toLocaleString()}</Text>
            <Text style={styles.statTrend}>↑ 12% vs yesterday</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigate('SALES_MANAGER')}
          >
            <Text style={styles.statLabel}>Active Orders</Text>
            <Text style={styles.statValue}>{stats.activeOrders}</Text>
            <Text style={styles.statTrend}>↑ {stats.pendingOrders} pending</Text>
          </TouchableOpacity>
        </View>

        {/* Modules Grid */}
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.grid}>
              {section.items.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.moduleCard, { backgroundColor: item.color }]}
                  onPress={() => navigate(item.screen as any)}
                >
                  <View style={styles.moduleIconBox}>
                    <Text style={styles.moduleIcon}>{item.icon}</Text>
                  </View>
                  <Text style={styles.moduleTitle}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Shop By Category Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Shop By Category</Text>
            <TouchableOpacity onPress={() => navigate('CATEGORY_PRODUCTS', { category: 'all' })}>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {dashboardCategories.map((cat, idx) => (
              <TouchableOpacity 
                key={cat.id} 
                style={styles.categoryCard}
                onPress={() => navigate('CATEGORY_PRODUCTS', { category: cat.tag || cat.id || cat.name })}
              >
                <View style={[styles.catIconBox, { backgroundColor: ['#F1F8E9', '#E3F2FD', '#FFF3E0', '#FCE4EC', '#F3E5F5'][idx % 5] }]}>
                  <Text style={styles.catIcon}>{cat.icon || '📦'}</Text>
                </View>
                <Text style={styles.catName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* System Message */}
        <View style={styles.msgBox}>
           <Text style={styles.msgTitle}>📢 System Status</Text>
           <Text style={styles.msgText}>All delivery zones are operational. Warehouse pickup delay is +/- 4 minutes.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dashboardHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  profileBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F1F8E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  profileIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2E7D32',
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statTrend: {
    color: '#A5D6A7',
    fontSize: 11,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moduleCard: {
    width: (width - 40 - 12) / 2,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  moduleIcon: {
    fontSize: 24,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  msgBox: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  msgTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 6,
  },
  msgText: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  categoryScroll: {
    paddingRight: 20,
    gap: 15,
  },
  categoryCard: {
    alignItems: 'center',
    width: 80,
  },
  catIconBox: {
    width: 65,
    height: 65,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  catIcon: {
    fontSize: 28,
  },
  catName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});

export default AdminDashboardScreen;
