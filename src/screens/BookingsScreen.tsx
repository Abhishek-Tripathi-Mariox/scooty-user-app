import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { COLORS } from '../constants/theme';
import type { BookingItem } from '../services/userApi';
import { formatDateTime, formatCurrency } from '../utils/format';

export function BookingsScreen({
  onBack,
  onTabPress,
  bookings,
  loading = false,
  activeTab,
}: {
  onBack: () => void;
  onTabPress: (tab: TabKey) => void;
  bookings?: BookingItem[] | null;
  loading?: boolean;
  activeTab: TabKey;
}) {
  return (
    <View style={styles.root}>
      <PageFrame title="My Bookings" onBack={onBack} scroll>
        <View style={styles.bookingsContainer}>
          {loading ? (
            <Text style={styles.loadingText}>Loading bookings...</Text>
          ) : !bookings || bookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyText}>Your confirmed rides will appear here once a booking is created.</Text>
            </View>
          ) : (
            bookings.map((booking) => (
              <RideCard key={booking._id} booking={booking} />
            ))
          )}
        </View>
      </PageFrame>
      <BottomTabs
        active={activeTab}
        onTabPress={onTabPress}
      />
    </View>
  );
}

function RideCard({ booking }: { booking: BookingItem }) {
  const bookingTitle = booking.planName || booking.planCode || `Booking #${booking._id?.substring(0, 8)}`;
  const startLabel = booking.schedule?.startLabel || formatDateTime(booking.startAt || booking.startTime);
  const endLabel = booking.schedule?.endLabel || formatDateTime(booking.endAt || booking.endTime);
  const fromStation = booking.pickupStation || booking.pickupStationId;
  const toStation = booking.dropStation || booking.dropStationId;
  return (
    <View style={styles.rideCard}>
      <View style={styles.rideHeader}>
        <Text style={styles.rideTitle}>{bookingTitle}</Text>
        <View style={[styles.status, getStatusStyle(booking.status)]}>
          <Text style={styles.statusText}>{booking.status || 'Pending'}</Text>
        </View>
      </View>

      <View style={styles.rideDetails}>
        <View style={styles.locationRow}>
          <Text style={styles.locationLabel}>From</Text>
          <Text style={styles.locationValue}>{fromStation?.name || 'N/A'}</Text>
        </View>
        <View style={styles.locationRow}>
          <Text style={styles.locationLabel}>To</Text>
          <Text style={styles.locationValue}>{toStation?.name || 'N/A'}</Text>
        </View>
        <View style={styles.locationRow}>
          <Text style={styles.locationLabel}>Slot</Text>
          <Text style={styles.locationValue}>{startLabel ? `${startLabel} - ${endLabel || ''}` : 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.rideMeta}>
        <MetaItem label="Duration" value={`${booking.durationHours || 0} hrs`} />
        <MetaItem label="Fare" value={formatCurrency(booking.pricing?.totalPayable ?? booking.fare)} />
        <MetaItem label="Time" value={startLabel || formatDateTime(booking.startTime)} />
      </View>
    </View>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function getStatusStyle(status?: string) {
  switch (status?.toLowerCase()) {
    case 'completed':
      return styles.statusCompleted;
    case 'cancelled':
      return styles.statusCancelled;
    case 'ongoing':
      return styles.statusOngoing;
    default:
      return styles.statusPending;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  bookingsContainer: {
    marginTop: 8,
    minHeight: 200,
  },
  emptyState: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
  rideCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
    marginBottom: 10,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rideTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusOngoing: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 133, 87, 0.1)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  rideDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(33, 48, 74, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(33, 48, 74, 0.08)',
    paddingVertical: 8,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  locationLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    width: 40,
  },
  locationValue: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  rideMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  metaValue: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});
