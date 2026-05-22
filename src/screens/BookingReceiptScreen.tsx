import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { ArrowLeftIcon } from '../components/RideIcons';
import type { BookingItem } from '../services/userApi';
import { formatCurrency, formatDateTime } from '../utils/format';
import { useStyles } from '../utils/responsiveStyles';

function paymentTone(status?: string): { bg: string; color: string; label: string } {
  const s = String(status || '').toUpperCase();
  if (s === 'PAID' || s === 'SUCCESS') {
    return { bg: 'rgba(22,163,74,0.12)', color: '#16a34a', label: 'Paid' };
  }
  if (s === 'PENDING') {
    return { bg: 'rgba(252,76,2,0.12)', color: '#fc4c02', label: 'Pending' };
  }
  if (s === 'FAILED') {
    return { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: 'Failed' };
  }
  if (s === 'REFUNDED') {
    return { bg: 'rgba(37,99,235,0.12)', color: '#2563eb', label: 'Refunded' };
  }
  return { bg: 'rgba(100,116,139,0.12)', color: '#64748b', label: s || 'Unknown' };
}

export function BookingReceiptScreen({
  booking,
  onBack,
}: {
  booking: BookingItem | null;
  onBack: () => void;
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
          <Text style={styles.headerTitle}>Receipt</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No receipt to show</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tone = paymentTone(booking.payment?.status);
  const planTitle = booking.planName || booking.planType || booking.planCode || 'Plan';
  const method = booking.payment?.method || '—';
  const referenceId = booking.payment?.referenceId || '—';
  const paidAt = booking.payment?.paidAt ? formatDateTime(booking.payment.paidAt) : '—';
  const paidAmount =
    typeof booking.payment?.paidAmount === 'number'
      ? booking.payment.paidAmount
      : booking.pricing?.totalPayable || 0;

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={10}>
          <ArrowLeftIcon size={22} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Payment Receipt</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Amount Paid</Text>
          <Text style={styles.heroAmount}>{formatCurrency(paidAmount)}</Text>
          <View style={[styles.statusChip, { backgroundColor: tone.bg }]}>
            <Text style={[styles.statusText, { color: tone.color }]}>{tone.label}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Info</Text>
          <View style={styles.divider} />
          <Row label="Method" value={String(method).toUpperCase()} />
          <Row label="Reference ID" value={referenceId} mono />
          <Row label="Paid At" value={paidAt} />
          <Row label="Booking" value={planTitle} />
          <Row
            label="Booking ID"
            value={booking._id ? `#${booking._id.slice(-8).toUpperCase()}` : '—'}
            mono
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fare Breakdown</Text>
          <View style={styles.divider} />
          {typeof booking.pricing?.baseFare === 'number' ? (
            <Row label="Base Fare" value={formatCurrency(booking.pricing.baseFare)} />
          ) : null}
          {typeof booking.pricing?.securityDeposit === 'number' &&
          booking.pricing.securityDeposit > 0 ? (
            <Row label="Security Deposit" value={formatCurrency(booking.pricing.securityDeposit)} />
          ) : null}
          {typeof booking.pricing?.convenienceFee === 'number' &&
          booking.pricing.convenienceFee > 0 ? (
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
          <Row label="Total" value={formatCurrency(paidAmount)} bold />
        </View>

        {booking.refund?.status ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Refund</Text>
            <View style={styles.divider} />
            <Row label="Status" value={String(booking.refund.status).toUpperCase()} />
            {typeof booking.refund.amount === 'number' ? (
              <Row label="Amount" value={formatCurrency(booking.refund.amount)} />
            ) : null}
            {booking.refund.method ? (
              <Row label="Method" value={String(booking.refund.method).toUpperCase()} />
            ) : null}
            {booking.refund.referenceId ? (
              <Row label="Reference" value={booking.refund.referenceId} mono />
            ) : null}
          </View>
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
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  heroLabel: { color: '#475569', fontSize: 13, lineHeight: 18 },
  heroAmount: {
    color: '#101828',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 4,
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
  rowValueBold: { fontWeight: '700', fontSize: 16 },
  rowValueMono: { fontFamily: 'Courier', letterSpacing: 1 },
} as const;
