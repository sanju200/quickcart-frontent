import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation } from '../context/AppContext';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = Math.min(height * 0.42, 320);

const PARTNERS = [
  { id: '1', name: 'Rahul S.',  status: 'Delivering', top: 100, left: 140, color: '#22C55E', zone: 'Zone A-2', eta: '12 min' },
  { id: '2', name: 'Amit K.',   status: 'To Store',   top: 260, left: 60,  color: '#F97316', zone: 'Zone B-1', eta: '7 min'  },
  { id: '3', name: 'Sonia V.',  status: 'Idle',       top: 180, left: 230, color: '#94A3B8', zone: 'Zone C-3', eta: '—'      },
  { id: '4', name: 'Vikram D.', status: 'Delivering', top: 340, left: 180, color: '#22C55E', zone: 'Zone A-4', eta: '20 min' },
  { id: '5', name: 'Priya M.',  status: 'Delivering', top: 80,  left: 280, color: '#22C55E', zone: 'Zone D-1', eta: '5 min'  },
  { id: '6', name: 'Karan J.',  status: 'To Store',   top: 300, left: 310, color: '#F97316', zone: 'Zone B-3', eta: '15 min' },
  { id: '7', name: 'Deepa R.',  status: 'Idle',       top: 200, left: 40,  color: '#94A3B8', zone: 'Zone E-2', eta: '—'      },
  { id: '8', name: 'Mohan L.',  status: 'Delivering', top: 380, left: 90,  color: '#22C55E', zone: 'Zone F-1', eta: '9 min'  },
];

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  Delivering: { label: 'Delivering', bg: '#DCFCE7', text: '#15803D' },
  'To Store':  { label: 'To Store',  bg: '#FEF3C7', text: '#B45309' },
  Idle:        { label: 'Idle',       bg: '#F1F5F9', text: '#64748B' },
};

const BOTTOM_NAV_HEIGHT = 80; // matches App.tsx bottomNav height

const LiveDeliveryMap = () => {
  const { navigate } = useAppNavigation();
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  const delivering = PARTNERS.filter(p => p.status === 'Delivering').length;
  const toStore    = PARTNERS.filter(p => p.status === 'To Store').length;
  const idle       = PARTNERS.filter(p => p.status === 'Idle').length;

  useEffect(() => {
    // Pulse animation for LIVE badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Fade-in on mount
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Fixed Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Delivery Map</Text>
          <Text style={styles.headerSubtitle}>Fleet Control Center</Text>
        </View>
        <View style={styles.liveIndicator}>
          <Animated.View style={[styles.pulse, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── Stats Row ── */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderTopColor: '#22C55E' }]}>
              <Text style={[styles.statNumber, { color: '#22C55E' }]}>{delivering}</Text>
              <Text style={styles.statLabel}>Delivering</Text>
            </View>
            <View style={[styles.statCard, { borderTopColor: '#F97316' }]}>
              <Text style={[styles.statNumber, { color: '#F97316' }]}>{toStore}</Text>
              <Text style={styles.statLabel}>To Store</Text>
            </View>
            <View style={[styles.statCard, { borderTopColor: '#94A3B8' }]}>
              <Text style={[styles.statNumber, { color: '#94A3B8' }]}>{idle}</Text>
              <Text style={styles.statLabel}>Idle</Text>
            </View>
            <View style={[styles.statCard, { borderTopColor: '#6366F1' }]}>
              <Text style={[styles.statNumber, { color: '#6366F1' }]}>{PARTNERS.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {/* ── Map Area ── */}
          <View style={[styles.mapContainer, { height: MAP_HEIGHT }]}>
            {/* Grid streets */}
            <View style={styles.gridBackground}>
              <View style={[styles.street, { top: MAP_HEIGHT * 0.30, left: 0, width: width - 24, height: 18 }]} />
              <View style={[styles.street, { top: MAP_HEIGHT * 0.65, left: 0, width: width - 24, height: 18 }]} />
              <View style={[styles.street, { top: 0, left: (width - 24) * 0.25, width: 18, height: MAP_HEIGHT }]} />
              <View style={[styles.street, { top: 0, left: (width - 24) * 0.70, width: 18, height: MAP_HEIGHT }]} />

              {/* Zone labels */}
              <View style={[styles.zoneLabel, { top: 10, left: 10 }]}><Text style={styles.zoneLabelText}>Zone A</Text></View>
              <View style={[styles.zoneLabel, { top: 10, right: 10 }]}><Text style={styles.zoneLabelText}>Zone B</Text></View>
              <View style={[styles.zoneLabel, { bottom: 10, left: 10 }]}><Text style={styles.zoneLabelText}>Zone C</Text></View>
              <View style={[styles.zoneLabel, { bottom: 10, right: 10 }]}><Text style={styles.zoneLabelText}>Zone D</Text></View>

              {/* Main Hub Marker */}
              <View style={[styles.hubMarker, { top: MAP_HEIGHT * 0.42, left: width * 0.42 }]}>
                <Text style={styles.hubIcon}>🏪</Text>
                <View style={styles.hubLabel}><Text style={styles.hubLabelText}>Main Hub</Text></View>
              </View>

              {/* Partner Markers */}
              {PARTNERS.map(partner => (
                <View
                  key={partner.id}
                  style={[styles.partnerMarker, { top: partner.top * (MAP_HEIGHT / 430), left: partner.left * (width / 390) }]}
                >
                  <View style={[styles.partnerDot, { backgroundColor: partner.color }]}>
                    <Text style={styles.partnerDotIcon}>🛵</Text>
                  </View>
                  <View style={styles.partnerLabelBubble}>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Legend overlay */}
            <View style={styles.legend}>
              {[
                { color: '#22C55E', label: 'Delivering' },
                { color: '#F97316', label: 'To Store' },
                { color: '#94A3B8', label: 'Idle' },
              ].map(item => (
                <View key={item.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Section Header ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Fleet</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{PARTNERS.length} Partners</Text>
            </View>
          </View>

          {/* ── Fleet List (all items, no nested ScrollView) ── */}
          <View style={styles.fleetListContainer}>
            {PARTNERS.map((partner, index) => {
              const meta = STATUS_META[partner.status];
              return (
                <TouchableOpacity
                  key={partner.id}
                  style={[styles.fleetItem, index === PARTNERS.length - 1 && styles.fleetItemLast]}
                  activeOpacity={0.75}
                >
                  {/* Left Status Bar */}
                  <View style={[styles.fleetStatusBar, { backgroundColor: partner.color }]} />

                  {/* Avatar */}
                  <View style={[styles.fleetAvatar, { backgroundColor: partner.color + '22' }]}>
                    <Text style={styles.fleetAvatarText}>{partner.name.charAt(0)}</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.fleetInfo}>
                    <Text style={styles.fleetName}>{partner.name}</Text>
                    <Text style={styles.fleetZone}>{partner.zone}</Text>
                  </View>

                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: meta.text }]}>{meta.label}</Text>
                  </View>

                  {/* ETA */}
                  <View style={styles.etaContainer}>
                    <Text style={styles.etaLabel}>ETA</Text>
                    <Text style={styles.etaValue}>{partner.eta}</Text>
                  </View>

                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom padding handled by contentContainerStyle paddingBottom */}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* ─── Header ─── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    zIndex: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
    lineHeight: 20,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  pulse: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 5,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 1,
  },

  /* ─── Scroll ─── */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  /* ─── Stats Cards ─── */
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },

  /* ─── Map ─── */
  mapContainer: {
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  gridBackground: {
    flex: 1,
    backgroundColor: '#D1FAE5',
  },
  street: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    opacity: 0.75,
  },
  zoneLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  zoneLabelText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '600',
  },
  hubMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  hubIcon: {
    fontSize: 26,
  },
  hubLabel: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  hubLabelText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  partnerMarker: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  partnerDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  partnerDotIcon: {
    fontSize: 14,
  },
  partnerLabelBubble: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  partnerName: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1E293B',
  },
  legend: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 10,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 7,
  },
  legendText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '500',
  },

  /* ─── Section Header ─── */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sectionBadgeText: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '600',
  },

  /* ─── Fleet List ─── */
  fleetListContainer: {
    marginHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  fleetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingRight: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  fleetItemLast: {
    borderBottomWidth: 0,
  },
  fleetStatusBar: {
    width: 4,
    height: 44,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: 10,
  },
  fleetAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fleetAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  fleetInfo: {
    flex: 1,
  },
  fleetName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  fleetZone: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  etaContainer: {
    alignItems: 'center',
    marginRight: 10,
    minWidth: 34,
  },
  etaLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  etaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 1,
  },
  chevron: {
    fontSize: 20,
    color: '#CBD5E1',
    lineHeight: 22,
  },
});

export default LiveDeliveryMap;
