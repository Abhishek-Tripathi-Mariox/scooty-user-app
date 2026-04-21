import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { COLORS } from '../constants/theme';
import type { Dashboard } from '../services/userApi';
import { formatCurrency } from '../utils/format';

export function DashboardScreen({
  onBack,
  onTabPress,
  dashboard,
  activeTab,
  onBookScooty,
  onViewBookings,
}: {
  onBack: () => void;
  onTabPress: (tab: TabKey) => void;
  dashboard?: Dashboard | null;
  activeTab: TabKey;
  onBookScooty: () => void;
  onViewBookings: () => void;
}) {
  return (
    <View style={styles.root}>
      <PageFrame title="Dashboard" onBack={onBack} scroll={false}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>Wallet Balance</Text>
              <Text style={styles.heroValue}>{formatCurrency(dashboard?.walletBalance ?? 0)}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Stat label="Rides" value={String(dashboard?.ridesCompleted ?? 0)} />
            <Stat label="Spent" value={formatCurrency(dashboard?.totalSpent ?? 0)} />
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Pressable style={styles.actionCard} onPress={onBookScooty}>
              <Text style={styles.actionText}>Book a Scooty</Text>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={onViewBookings}>
              <Text style={styles.actionText}>View Bookings</Text>
            </Pressable>
          </View>
        </View>
      </PageFrame>
      <BottomTabs
        active={activeTab}
        onTabPress={onTabPress}
      />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 16, flex: 1 },
  hero: {
    borderRadius: 24,
    backgroundColor: COLORS.button,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  heroCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,244,239,0.92)',
    padding: 14,
  },
  heroLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  heroValue: { color: COLORS.button, fontSize: 24, fontWeight: '900', marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, gap: 8 },
  stat: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '900' },
  statLabel: { marginTop: 4, color: COLORS.textSecondary, fontSize: 10 },
  cardSection: {
    marginTop: 12,
  },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '900', marginBottom: 10 },
  actionCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  actionText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700' },
});
