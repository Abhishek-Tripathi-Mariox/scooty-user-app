import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import {
  ArrowLeftIcon,
  ClockIcon,
  SmallScooterIcon,
} from '../components/RideIcons';
import type { RideItem } from '../services/userApi';

type HistoryRow = {
  id: string;
  label: string;
  dateTime: string;
  duration: string;
  distance: string;
  amount: number;
  status: 'Completed' | 'Penalty';
};

export function RideHistoryScreen({
  onBack,
  onTabPress,
  rides,
  loading = false,
  activeTab,
  onOpenRide,
}: {
  onBack: () => void;
  onTabPress: (tab: TabKey) => void;
  rides?: RideItem[] | null;
  loading?: boolean;
  activeTab: TabKey;
  onOpenRide: (ride: RideItem) => void;
}) {
  const items: HistoryRow[] =
    rides && rides.length > 0
      ? rides.map((r, i) => ({
          id: r._id || `r${i}`,
          label: r._id?.toUpperCase().slice(0, 7) || `RIDE00${i + 1}`,
          dateTime: r.schedule?.startLabel || '—',
          duration: r.durationHours ? `${r.durationHours}h` : '—',
          distance: r.distance != null ? `${r.distance.toFixed(1)} km` : '—',
          amount: r.pricing?.totalPayable ?? r.fare ?? 0,
          status: r.status?.toLowerCase() === 'cancelled' ? 'Penalty' : 'Completed',
        }))
      : [];

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Ride History</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <Text style={styles.emptyText}>Loading ride history...</Text>
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>No live ride history yet.</Text>
        ) : (
          items.map((item, idx) => (
            <Pressable
              key={item.id}
              onPress={() => rides?.[idx] && onOpenRide(rides[idx])}
              style={styles.card}
            >
              <View style={styles.topRow}>
                <View style={styles.iconTile}>
                  <SmallScooterIcon size={22} color="#fc4c02" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rideLabel}>{item.label}</Text>
                  <Text style={styles.rideDate}>{item.dateTime}</Text>
                </View>
                <View style={[styles.statusChip, item.status === 'Penalty' && styles.statusChipPenalty]}>
                  <Text
                    style={[
                      styles.statusText,
                      item.status === 'Penalty' && styles.statusTextPenalty,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <ClockIcon size={18} color="#4a5565" />
                  <Text style={styles.statText}>{item.duration}</Text>
                </View>
                <View style={styles.statItem}>
                  <DiamondIcon color="#4a5565" />
                  <Text style={styles.statText}>{item.distance}</Text>
                </View>
                <View style={styles.amountWrap}>
                  <Text style={styles.amountText}>₹{item.amount}</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />
              <View style={styles.receiptRow}>
                <View style={{ flex: 1 }} />
                <View style={styles.receiptIconWrap}>
                  <ReceiptIcon color="#363636" />
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </SafeAreaView>
  );
}

function DiamondIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
      <Path d="M10 2 2 10l8 8 8-8-8-8Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="m7 8 3-3 3 3-3 3-3-3Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

function ReceiptIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill={color}>
      <Rect x={3} y={2} width={14} height={16} rx={1} />
      <Path d="M6 6h8M6 9h8M6 12h5" stroke="#ffffff" strokeWidth={1.2} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.26)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.6)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    marginLeft: 8,
    color: '#1c1c1e',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  emptyText: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rideLabel: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  rideDate: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  statusChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.49)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusChipPenalty: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  statusText: {
    color: '#16a34a',
    fontSize: 13,
    lineHeight: 19,
  },
  statusTextPenalty: {
    color: '#f59e0b',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  amountWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amountText: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
