import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { COLORS } from '../constants/theme';
import type { RideItem } from '../services/userApi';
import { formatCurrency } from '../utils/format';

type RideHistoryItem = RideItem & {
  label: string;
  statusTone?: 'green' | 'orange';
};

export function RideHistoryScreen({
  onBack,
  onTabPress,
  rides,
  activeTab,
  onOpenRide,
}: {
  onBack: () => void;
  onTabPress: (tab: TabKey) => void;
  rides?: RideItem[] | null;
  activeTab: TabKey;
  onOpenRide: (ride: RideItem) => void;
}) {
  const items: RideHistoryItem[] = (rides || []).map((ride, index) => ({
    ...ride,
    label: ride._id?.toUpperCase().slice(0, 7) || `RIDE00${index + 1}`,
    statusTone: ride.status?.toLowerCase() === 'completed' ? 'green' : 'orange',
  }));

  return (
    <View style={styles.root}>
      <PageFrame title="Ride History" onBack={onBack} scroll>
        <View style={styles.content}>
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onOpenRide(item)}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.titleWrap}>
                    <View style={styles.iconBubble}>
                      <Text style={styles.scootyIcon}>🛴</Text>
                    </View>
                    <View style={styles.titleTextWrap}>
                      <Text style={styles.rideId}>{item.planName || item.planCode || item.label}</Text>
                      <Text style={styles.rideDate}>{formatRideDate(item.startAt || item.schedule?.startAt || item.startTime)}</Text>
                    </View>
                  </View>

                  <View style={[styles.statusBadge, item.statusTone === 'orange' ? styles.penaltyBadge : styles.completedBadge]}>
                    <Text style={[styles.statusText, item.statusTone === 'orange' ? styles.penaltyText : styles.completedText]}>
                      {item.status || 'Completed'}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⏱</Text>
                    <Text style={styles.metaText}>{formatRideDuration(item.startAt || item.schedule?.startAt || item.startTime)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>◈</Text>
                    <Text style={styles.metaText}>{item.distance ? `${item.distance} km` : '0 km'}</Text>
                  </View>

                  <Text style={styles.fareText}>{formatCurrency(item.pricing?.totalPayable ?? item.fare ?? 0)}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptIcon}>▤</Text>
                </View>
              </Pressable>
            )}
          />

          {!rides || rides.length === 0 ? (
            <Text style={styles.emptyText}>No ride history yet</Text>
          ) : null}
        </View>
      </PageFrame>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </View>
  );
}

function formatRideDate(value?: string) {
  if (!value) return '28 Jan, 2026 • 10:30 AM';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '28 Jan, 2026 • 10:30 AM';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

function formatRideDuration(value?: string) {
  if (!value) return '18:45';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '18:45';
  const hh = String(date.getHours() % 12 || 12).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 18,
  },
  card: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.84)',
    padding: 14,
  },
  separator: {
    height: 10,
  },
  pressed: {
    opacity: 0.84,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 100, 28, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scootyIcon: {
    fontSize: 18,
  },
  titleTextWrap: {
    flex: 1,
  },
  rideId: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  rideDate: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  completedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  penaltyBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  completedText: {
    color: '#0ea35d',
  },
  penaltyText: {
    color: '#f59e0b',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(33, 48, 74, 0.08)',
    paddingTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '900',
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  fareText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  receiptRow: {
    alignItems: 'flex-end',
    marginTop: 14,
  },
  receiptIcon: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
