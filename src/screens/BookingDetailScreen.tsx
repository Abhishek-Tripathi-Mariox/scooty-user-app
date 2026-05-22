import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { ArrowLeftIcon } from '../components/RideIcons';
import type { BookingItem } from '../services/userApi';
import { formatCurrency, formatDateTime } from '../utils/format';
import { useStyles } from '../utils/responsiveStyles';

function statusTone(status?: string): { bg: string; color: string; label: string } {
  const s = String(status || '').toUpperCase();
  if (s === 'CONFIRMED' || s === 'PAID') {
    return { bg: 'rgba(22,163,74,0.12)', color: '#16a34a', label: 'Confirmed' };
  }
  if (s === 'ONGOING' || s === 'IN_PROGRESS') {
    return { bg: 'rgba(37,99,235,0.12)', color: '#2563eb', label: 'In Progress' };
  }
  if (s === 'COMPLETED') {
    return { bg: 'rgba(15,118,110,0.12)', color: '#0f766e', label: 'Completed' };
  }
  if (s === 'CANCELLED' || s === 'CANCELED') {
    return { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: 'Cancelled' };
  }
  if (s === 'PENDING_PAYMENT') {
    return { bg: 'rgba(252,76,2,0.12)', color: '#fc4c02', label: 'Payment Pending' };
  }
  return { bg: 'rgba(100,116,139,0.12)', color: '#64748b', label: s || 'Unknown' };
}

export function BookingDetailScreen({
  booking,
  onBack,
  onViewReceipt,
}: {
  booking: BookingItem | null;
  onBack: () => void;
  onViewReceipt?: () => void;
}) {
  const styles = useStyles(RAW_STYLES);

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppBackground variant="auth" />
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={10}>
            <ArrowLeftIcon size={22} color="#1c1c1e" />
          </Pressable>
          <Text style={styles.headerTitle}>Booking Details</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No booking selected</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tone = statusTone(booking.status);
  const planTitle = booking.planName || booking.planType || booking.planCode || 'Plan';
  const vehicle =
    booking.scooter?.modelName ||
    booking.vehicleId?.modelName ||
    booking.scooter?.registrationNumber ||
    booking.vehicleId?.registrationNumber ||
    '—';
  const pickupName = booking.pickupStation?.name || booking.pickupStationId?.name || '—';
  const dropName = booking.dropStation?.name || booking.dropStationId?.name || '—';
  const dateLabel = booking.schedule?.dateLabel || booking.schedule?.date || booking.date || '—';
  const startLabel = booking.schedule?.startLabel || formatDateTime(booking.startAt);
  const endLabel = booking.schedule?.endLabel || formatDateTime(booking.endAt);
  const duration =
    typeof booking.actualDurationMinutes === 'number'
      ? `${booking.actualDurationMinutes} min`
      : typeof booking.durationHours === 'number'
        ? `${booking.durationHours} hr`
        : '—';

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={10}>
          <ArrowLeftIcon size={22} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Booking Details</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.statusChip, { backgroundColor: tone.bg }]}>
          <Text style={[styles.statusText, { color: tone.color }]}>{tone.label}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{planTitle}</Text>
          <Text style={styles.cardSubtitle}>Booking #{booking._id?.slice(-8).toUpperCase() || '—'}</Text>

          <View style={styles.divider} />

          <Row label="Vehicle" value={vehicle} />
          <Row label="Date" value={dateLabel} />
          <Row
            label="Time"
            value={startLabel && endLabel ? `${startLabel} → ${endLabel}` : startLabel || endLabel || '—'}
          />
          <Row label="Duration" value={duration} />
          {booking.unlockCode ? <Row label="Unlock Code" value={booking.unlockCode} mono /> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Stations</Text>
          <View style={styles.divider} />
          <View style={styles.stationRow}>
            <View style={[styles.dot, { backgroundColor: '#16a34a' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stationLabel}>Pickup</Text>
              <Text style={styles.stationName}>{pickupName}</Text>
            </View>
          </View>
          <View style={styles.stationRow}>
            <View style={[styles.dot, { backgroundColor: '#fc4c02' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stationLabel}>Drop</Text>
              <Text style={styles.stationName}>{dropName}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fare Summary</Text>
          <View style={styles.divider} />
          {typeof booking.pricing?.baseFare === 'number' ? (
            <Row label="Base Fare" value={formatCurrency(booking.pricing.baseFare)} />
          ) : null}
          {typeof booking.pricing?.securityDeposit === 'number' && booking.pricing.securityDeposit > 0 ? (
            <Row label="Security Deposit" value={formatCurrency(booking.pricing.securityDeposit)} />
          ) : null}
          {typeof booking.pricing?.convenienceFee === 'number' && booking.pricing.convenienceFee > 0 ? (
            <Row label="Convenience Fee" value={formatCurrency(booking.pricing.convenienceFee)} />
          ) : null}
          {typeof booking.pricing?.tax === 'number' && booking.pricing.tax > 0 ? (
            <Row label="Tax" value={formatCurrency(booking.pricing.tax)} />
          ) : null}
          {typeof booking.pricing?.discount === 'number' && booking.pricing.discount > 0 ? (
            <Row label="Discount" value={`-${formatCurrency(booking.pricing.discount)}`} />
          ) : null}
          {typeof booking.pricing?.walletUsed === 'number' && booking.pricing.walletUsed > 0 ? (
            <Row label="Wallet Used" value={`-${formatCurrency(booking.pricing.walletUsed)}`} />
          ) : null}
          <View style={styles.divider} />
          <Row
            label="Total Payable"
            value={formatCurrency(booking.pricing?.totalPayable || 0)}
            bold
          />
        </View>

        {onViewReceipt ? (
          <Pressable style={styles.receiptButton} onPress={onViewReceipt}>
            <Text style={styles.receiptButtonText}>View Payment Receipt</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  bold,
  mono,
}: {
  label: string;
  value: string;
  bold?: boolean;
  mono?: boolean;
}) {
  const styles = useStyles(RAW_STYLES);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          bold && styles.rowValueBold,
          mono && styles.rowValueMono,
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const RAW_STYLES = {
  safe: { flex: 1, backgroundColor: 'transparent' },
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
    marginLeft: 4,
    color: '#1c1c1e',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: { color: '#475569', fontSize: 14 },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 4,
  },
  cardTitle: {
    color: '#101828',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  cardSubtitle: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    gap: 12,
  },
  rowLabel: { color: '#64748b', fontSize: 13, lineHeight: 18 },
  rowValue: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    flexShrink: 1,
    textAlign: 'right',
  },
  rowValueBold: { fontWeight: '700', fontSize: 16, color: '#101828' },
  rowValueMono: { fontFamily: 'Courier', letterSpacing: 1 },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  stationLabel: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  stationName: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  receiptButton: {
    marginTop: 4,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fc4c02',
    backgroundColor: 'rgba(252,76,2,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptButtonText: {
    color: '#fc4c02',
    fontSize: 14,
    fontWeight: '600',
  },
} as const;
