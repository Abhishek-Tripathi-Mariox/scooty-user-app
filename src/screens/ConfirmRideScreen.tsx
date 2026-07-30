import { ReactNode, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import { useStyles } from '../utils/responsiveStyles';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  ExternalLinkIcon,
  LocationIcon,
  ReceiptIcon,
  ScooterSideIcon,
  ShieldIcon,
  SmallInfoIcon,
  WalletCardIcon,
} from '../components/RideIcons';

const StationThumb = require('../assets/images/station-thumb.jpg');

export function ConfirmRideScreen({
  onBack,
  onConfirm,
  loading,
  pickupStationName,
  scheduleLabel,
  estimatedTotal,
  pricing,
}: {
  onBack: () => void;
  onConfirm: () => void;
  scootyId?: string;
  scootyBattery?: number;
  scootyRange?: number;
  farePerMinute?: number;
  farePerKilometer?: number;
  destinations?: Array<{ icon: string; label: string }>;
  loading?: boolean;
  planName?: string;
  pickupStationName?: string;
  dropStationName?: string;
  scheduleLabel?: string;
  estimatedTotal?: number;
  pricing?: {
    baseFare?: number;
    securityDeposit?: number;
    convenienceFee?: number;
    tax?: number;
    discount?: number;
    totalPayable?: number;
  };
}) {
  // Real amounts come from the backend quote; nothing is computed locally.
  const rideFare = pricing?.baseFare ?? estimatedTotal ?? 0;
  const convenienceFee = pricing?.convenienceFee ?? 0;
  const taxes = pricing?.tax ?? 0;
  const discount = pricing?.discount ?? 0;
  const deposit = pricing?.securityDeposit ?? 0;
  const subtotal = rideFare + convenienceFee + taxes;
  const totalPayable = pricing?.totalPayable ?? Math.max(0, subtotal + deposit - discount);
  const walletAvailable = 0;
  const scheduleText = scheduleLabel || 'Schedule unavailable';
  const styles = useStyles(RAW_STYLES);
  const stationLabel = pickupStationName || 'Station unavailable';
  const [insuranceOpen, setInsuranceOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Booking Summary</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <CardTitle icon={<ScooterSideIcon size={22} color="#363636" />} text="Plan Details" />
          <View style={styles.planRow}>
            <CalendarIcon size={20} color="#6a7282" />
            <View style={styles.planRowText}>
              <Text style={styles.planLabel}>Start Date & Time</Text>
              <Text style={styles.planValue}>{scheduleText}</Text>
            </View>
          </View>
          <View style={styles.planRow}>
            <ClockIcon size={20} color="#6a7282" />
            <View style={styles.planRowText}>
              <Text style={styles.planLabel}>End Date & Time</Text>
              <Text style={styles.planValue}>{scheduleText}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <CardTitle icon={<LocationIcon size={22} color="#1c1c1e" />} text="Pickup Station" />
          <View style={styles.stationRow}>
            <Image source={StationThumb} style={styles.stationThumb} resizeMode="cover" />
            <View style={styles.stationChip}>
              <LocationIcon size={14} color="#363636" />
              <Text style={styles.stationChipText}>{stationLabel}</Text>
            </View>
            <View style={styles.stationChip}>
              <Text style={styles.stationChipText}>—</Text>
            </View>
          </View>
        </Card>

        <Card>
          <CardTitle icon={<ReceiptIcon size={22} color="#16a34a" />} text="Cost Breakdown" bold />
          <CostRow label="Ride Fare" value={`₹${rideFare}`} />
          <CostRow label="Convenience Fee" value={`₹${convenienceFee}`} />
          <CostRow label="Taxes (GST)" value={`₹${taxes}`} />
          {discount > 0 ? <CostRow label="Discount" value={`-₹${discount}`} /> : null}
          <View style={styles.costDivider} />
          <CostRow label="Subtotal" value={`₹${subtotal}`} boldLabel boldValue />
          <View style={styles.costDivider} />
          <View style={styles.depositRow}>
            <ShieldIcon size={20} color="#16a34a" />
            <Text style={styles.depositLabel}>Refundable Security Deposit</Text>
            <View style={styles.infoButton}>
              <SmallInfoIcon size={16} color="#6a7282" />
            </View>
            <Text style={styles.depositValue}>₹{deposit}</Text>
          </View>
          <View style={styles.costDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹{totalPayable}</Text>
          </View>
        </Card>

        <Pressable onPress={() => setInsuranceOpen(true)}>
          <Card>
            <View style={styles.insuranceRow}>
              <Text style={styles.insuranceLabel}>Ride Insurance (Bima)</Text>
              <SmallInfoIcon size={16} color="#155dfc" />
            </View>
            <View style={styles.termsRow}>
              <Text style={styles.termsLink}>View Terms & Conditions</Text>
              <ExternalLinkIcon size={14} color="#155dfc" />
            </View>
          </Card>
        </Pressable>

        <View style={styles.alertCard}>
          <ShieldIcon size={22} color="#166534" />
          <View style={styles.alertBody}>
            <Text style={styles.alertTitle}>
              ₹{deposit} security deposit is fully refundable after ride completion.
            </Text>
            <Text style={styles.alertText}>Tap to learn more about deposit refund process</Text>
          </View>
        </View>

        <Card>
          <View style={styles.paymentRow}>
            <WalletCardIcon size={22} color="#363636" />
            <View style={styles.paymentText}>
              <Text style={styles.paymentLabelTop}>Payment via</Text>
              <Text style={styles.paymentLabelBottom}>Wallet Balance</Text>
            </View>
            <View style={styles.paymentRight}>
              <Text style={styles.paymentAvailable}>Available</Text>
              <Text style={styles.paymentAmount}>₹{walletAvailable}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <View style={styles.warningBlock}>
            <Text style={styles.warningText}>
              <Text style={styles.warningIcon}>⚠️ </Text>
              <Text style={styles.warningBold}>Important: </Text>
              Ride can only be started during the booked time slot. Please arrive at the station 5 minutes before
              your slot begins. Cancellation charges apply.
            </Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label={loading ? 'Confirming...' : `Confirm & Pay ₹${totalPayable}`}
          onPress={onConfirm}
          disabled={loading}
          height={56}
        />
      </View>

      <InsuranceSheet visible={insuranceOpen} onClose={() => setInsuranceOpen(false)} />
    </SafeAreaView>
  );
}

function InsuranceSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const styles = useStyles(RAW_STYLES);
  const bullets = [
    'Covers accidental minor damages',
    'Excludes theft',
    'Maximum claim limit ₹5,000',
    'Valid for selected ride only',
    'Non-refundable once ride starts',
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <View style={styles.sheetIconWrap}>
            <ShieldIcon size={22} color="#fc4c02" />
          </View>
          <Text style={styles.sheetTitle}>Ride Insurance (Bima)</Text>
          <Pressable style={styles.sheetClose} onPress={onClose}>
            <Text style={styles.sheetCloseText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.bulletList}>
          {bullets.map((b) => (
            <View key={b} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>

        <GradientButton label="Got it" onPress={onClose} height={56} />
      </View>
    </Modal>
  );
}

function Card({ children }: { children: ReactNode }) {
  const styles = useStyles(RAW_STYLES);
  return <View style={styles.card}>{children}</View>;
}

function CardTitle({ icon, text, bold }: { icon: ReactNode; text: string; bold?: boolean }) {
  const styles = useStyles(RAW_STYLES);
  return (
    <View style={styles.cardTitleRow}>
      {icon}
      <Text style={[styles.cardTitleText, bold && styles.cardTitleBold]}>{text}</Text>
    </View>
  );
}

function CostRow({
  label,
  value,
  boldLabel,
  boldValue,
}: {
  label: string;
  value: string;
  boldLabel?: boolean;
  boldValue?: boolean;
}) {
  const styles = useStyles(RAW_STYLES);
  return (
    <View style={styles.costRow}>
      <Text style={[styles.costLabel, boldLabel && styles.costLabelBold]}>{label}</Text>
      <Text style={[styles.costValue, boldValue && styles.costValueBold]}>{value}</Text>
    </View>
  );
}

const RAW_STYLES = {
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 16,
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitleText: {
    color: '#363636',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
  },
  cardTitleBold: {
    color: '#101828',
    fontWeight: '700',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  planRowText: {
    flex: 1,
    gap: 4,
  },
  planLabel: {
    color: '#6a7282',
    fontSize: 12,
    lineHeight: 16,
  },
  planValue: {
    color: '#363636',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stationThumb: {
    width: 48,
    height: 48,
    borderRadius: 11,
  },
  stationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  stationChipText: {
    color: '#363636',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  costLabel: {
    color: '#364153',
    fontSize: 16,
    lineHeight: 24,
  },
  costLabelBold: {
    color: '#101828',
    fontWeight: '700',
  },
  costValue: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  costValueBold: {
    fontWeight: '700',
  },
  costDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    marginVertical: 4,
  },
  depositRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  depositLabel: {
    flex: 1,
    color: '#101828',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  infoButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositValue: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  totalValue: {
    color: '#00a63e',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  insuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insuranceLabel: {
    color: '#0a0a0a',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  termsLink: {
    color: '#155dfc',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    textDecorationLine: 'underline',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: 'rgba(0, 166, 62, 0.17)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    padding: 20,
  },
  alertBody: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  alertText: {
    color: '#166534',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentText: {
    flex: 1,
  },
  paymentLabelTop: {
    color: '#363636',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  paymentLabelBottom: {
    color: '#363636',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAvailable: {
    color: '#363636',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  paymentAmount: {
    color: '#363636',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  warningBlock: {
    paddingVertical: 2,
  },
  warningText: {
    color: '#363636',
    fontSize: 12,
    lineHeight: 19.5,
  },
  warningIcon: {
    fontSize: 12,
  },
  warningBold: {
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 25 },
    elevation: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffefe8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    flex: 1,
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
  },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCloseText: {
    color: '#0a0a0a',
    fontSize: 24,
    lineHeight: 26,
  },
  bulletList: {
    gap: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletDot: {
    marginTop: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#99a1af',
  },
  bulletText: {
    flex: 1,
    color: '#364153',
    fontSize: 12,
    lineHeight: 19.5,
  },
} as const;
