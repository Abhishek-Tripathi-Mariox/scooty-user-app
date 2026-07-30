import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { GradientButton } from '../components/GradientButton';
import { ArrowLeftIcon, CalendarIcon, LocationIcon } from '../components/RideIcons';
import type { BookingItem } from '../services/userApi';
import { formatDateTime, formatCurrency } from '../utils/format';

type Tab = 'upcoming' | 'active' | 'completed';

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

export function BookingsScreen({
  onBack,
  onTabPress,
  bookings,
  loading = false,
  activeTab,
  onStartRide,
  onCancelBooking,
  onViewReceipt,
  onViewDetails,
}: {
  onBack: () => void;
  onTabPress: (tab: TabKey) => void;
  bookings?: BookingItem[] | null;
  loading?: boolean;
  activeTab: TabKey;
  onStartRide?: (booking: BookingItem) => void;
  onCancelBooking?: (booking: BookingItem) => void;
  onViewReceipt?: (booking: BookingItem) => void;
  onViewDetails?: (booking: BookingItem) => void;
}) {
  const [selectedTab, setSelectedTab] = useState<Tab>('upcoming');

  const filtered = useMemo(() => {
    const list = bookings ?? [];
    return list.filter((b) => {
      const status = (b.status || '').toLowerCase();
      if (selectedTab === 'upcoming') {
        return (
          !status ||
          status === 'pending' ||
          status === 'pending_payment' ||
          status === 'upcoming' ||
          status === 'confirmed'
        );
      }
      if (selectedTab === 'active') return status === 'ongoing' || status === 'active';
      return status === 'completed' || status === 'cancelled';
    });
  }, [bookings, selectedTab]);

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const active = selectedTab === tab.key;
          return (
            <Pressable key={tab.key} style={styles.tabItem} onPress={() => setSelectedTab(tab.key)}>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              {active ? <View style={styles.tabIndicator} /> : null}
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading bookings...</Text>
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>No {selectedTab} bookings yet.</Text>
        ) : (
          filtered.map((booking) => (
            <RideCard
              key={booking._id}
              booking={booking}
              tab={selectedTab}
              onStartRide={onStartRide}
              onCancelBooking={onCancelBooking}
              onViewReceipt={onViewReceipt}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </ScrollView>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </SafeAreaView>
  );
}

function RideCard({
  booking,
  tab,
  onStartRide,
  onCancelBooking,
  onViewReceipt,
  onViewDetails,
}: {
  booking: BookingItem;
  tab: Tab;
  onStartRide?: (booking: BookingItem) => void;
  onCancelBooking?: (booking: BookingItem) => void;
  onViewReceipt?: (booking: BookingItem) => void;
  onViewDetails?: (booking: BookingItem) => void;
}) {
  const title = booking.planName || booking.planCode || 'Plan unavailable';
  const idText = `ID: ${booking._id?.substring(0, 10).toUpperCase() || 'Unavailable'}`;
  const pickup = booking.pickupStation?.name || booking.pickupStationId?.name || 'Station unavailable';
  const timeLabel =
    booking.schedule?.startLabel || formatDateTime(booking.startAt || booking.startTime) || '—';
  const total = formatCurrency(booking.pricing?.totalPayable ?? booking.fare) || '₹0.00';
  const status = (booking.status || '').toLowerCase();
  const isPendingApproval = status === 'pending_payment';
  const isConfirmed = status === 'confirmed';
  const isCancelled = status === 'cancelled';
  const statusLabel =
    tab === 'upcoming'
      ? isPendingApproval
        ? 'Pending Approval'
        : isConfirmed
          ? 'Confirmed'
          : 'Upcoming'
      : tab === 'active'
        ? 'Active'
        : isCancelled
          ? 'Cancelled'
          : 'Completed';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardId}>{idText}</Text>
        </View>
        <View style={styles.statusChip}>
          <Text style={styles.statusChipText}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <LocationIcon size={18} color="#363636" />
        <View style={styles.infoText}>
          <Text style={styles.infoLabel}>Pickup Station</Text>
          <Text style={styles.infoValue}>{pickup}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <CalendarIcon size={18} color="#363636" />
        <View style={styles.infoText}>
          <Text style={styles.infoLabel}>Time Slot</Text>
          <Text style={styles.infoValue}>{timeLabel}</Text>
        </View>
      </View>

      <View style={styles.paidBox}>
        <Text style={styles.paidLabel}>
          {isPendingApproval || isCancelled ? 'Total Amount' : 'Total Paid'}
        </Text>
        <Text style={styles.paidValue}>{total}</Text>
      </View>

      {tab === 'active' ? (
        <GradientButton
          label="Start Ride"
          onPress={() => onStartRide?.(booking)}
          height={40}
          radius={24}
        />
      ) : tab === 'completed' ? (
        <Pressable
          style={[styles.actionButton, styles.actionDark, styles.actionFull]}
          onPress={() => (isCancelled ? onViewDetails?.(booking) : onViewReceipt?.(booking))}
        >
          <Text style={styles.actionDarkText}>{isCancelled ? 'View Details' : 'View Receipt'}</Text>
        </Pressable>
      ) : (
        <>
          {isConfirmed ? (
            <GradientButton
              label="Start Ride"
              onPress={() => onStartRide?.(booking)}
              height={40}
              radius={24}
            />
          ) : null}
          <View style={[styles.actionsRow, isConfirmed ? { marginTop: 10 } : null]}>
            <Pressable
              style={[styles.actionButton, styles.actionDark]}
              onPress={() => onViewDetails?.(booking)}
            >
              <Text style={styles.actionDarkText}>View Details</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.actionRed]}
              onPress={() => onCancelBooking?.(booking)}
            >
              <Text style={styles.actionRedText}>Cancel</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
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
    lineHeight: 32,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.26)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.6)',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    color: '#363636',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  tabLabelActive: {
    color: '#fd5712',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#fd5712',
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
  loadingText: {
    color: '#4a5565',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#6a7282',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 40,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#363636',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 27,
  },
  cardId: {
    marginTop: 2,
    color: '#6a7282',
    fontSize: 12,
    lineHeight: 16,
  },
  statusChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusChipText: {
    color: '#363636',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    color: '#6a7282',
    fontSize: 12,
    lineHeight: 16,
  },
  infoValue: {
    color: '#363636',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  paidBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paidLabel: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  paidValue: {
    color: '#363636',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 24,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionFull: {
    flex: 0,
    width: '100%',
  },
  actionDark: {
    borderColor: '#363636',
  },
  actionDarkText: {
    color: '#363636',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionRed: {
    borderColor: '#ef4444',
  },
  actionRedText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
