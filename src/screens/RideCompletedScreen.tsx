import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import { CheckIcon, ClockIcon, ShieldIcon } from '../components/RideIcons';

export function RideCompletedScreen({
  onHome,
  onRate,
  duration,
  distance,
  fare,
  securityDeposit,
}: {
  onBack: () => void;
  onHome: () => void;
  onRate: () => void;
  duration?: string;
  distance?: number;
  fare?: number;
  securityDeposit?: number;
}) {
  const durationText = duration || '—';
  const distanceText = distance != null ? `${distance.toFixed(1)} km` : '—';
  const baseFare = fare ?? 0;
  const distanceFare = 0;
  const timeFare = 0;
  const total = fare ?? baseFare;
  const deposit = securityDeposit ?? 1000;

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successCircle}>
          <CheckIcon size={48} color="#16a34a" />
        </View>

        <Text style={styles.title}>Ride Completed!</Text>
        <Text style={styles.subtitle}>Hope you had a great ride</Text>

        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <Metric icon={<ClockIcon size={22} color="#363636" />} label="Duration" value={durationText} />
            <Metric icon={<ArrowUpRight color="#363636" />} label="Distance" value={distanceText} />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Fare Breakdown</Text>
          <FareRow label="Base Fare" value={`₹${baseFare}`} />
          <FareRow label="Distance Fare" value={`₹${distanceFare}`} />
          <FareRow label="Time Fare" value={`₹${timeFare}`} />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>

        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Paid via Wallet</Text>
          <Text style={styles.walletValue}>₹{total}</Text>
        </View>

        <View style={styles.depositCard}>
          <View style={styles.depositRow}>
            <View style={styles.depositIcon}>
              <ShieldIcon size={22} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.depositLabel}>Security Deposit</Text>
              <Text style={styles.depositAmount}>₹{deposit}</Text>
              <View style={styles.refundBadge}>
                <CheckIcon size={14} color="#ffffff" />
                <Text style={styles.refundText}>Refund Initiated</Text>
              </View>
            </View>
            <ArrowRight color="#363636" />
          </View>
          <View style={styles.depositDivider} />
          <Text style={styles.depositNote}>✓ Refund processing - Expected in 3-5 business days</Text>
        </View>

        <Pressable style={styles.downloadButton}>
          <DownloadIcon color="#fc4c02" />
          <Text style={styles.downloadText}>Download Receipt</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton label="Rate Your Ride" onPress={onRate} height={52} />
        <Pressable style={styles.backHome} onPress={onHome}>
          <Text style={styles.backHomeText}>Back to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricIcon}>{icon}</View>
      <View>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

function FareRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fareRow}>
      <Text style={styles.fareLabel}>{label}</Text>
      <Text style={styles.fareValue}>{value}</Text>
    </View>
  );
}

function ArrowUpRight({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path d="M6 16 16 6M8 6h8v8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ArrowRight({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path d="M5 11h12m0 0-5-5m5 5-5 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DownloadIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path d="M9 2v10m0 0 4-4m-4 4-4-4M3 14v2h12v-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 150,
    alignItems: 'center',
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 24,
    color: '#101828',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: '#363636',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  card: {
    marginTop: 24,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  metricValue: {
    color: '#363636',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  sectionTitle: {
    color: '#363636',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 27,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareLabel: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  fareValue: {
    color: '#363636',
    fontSize: 14,
    lineHeight: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#363636',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  totalValue: {
    color: '#363636',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  walletCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 4,
  },
  walletLabel: {
    color: '#364153',
    fontSize: 14,
    lineHeight: 20,
  },
  walletValue: {
    color: '#363636',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  depositCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  depositRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  depositIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00a63e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositLabel: {
    color: '#364153',
    fontSize: 14,
    lineHeight: 20,
  },
  depositAmount: {
    color: '#00a63e',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginTop: 2,
  },
  refundBadge: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  refundText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  depositDivider: {
    height: 1,
    backgroundColor: 'rgba(218, 218, 218, 0.5)',
  },
  depositNote: {
    color: '#016630',
    fontSize: 12,
    lineHeight: 16,
  },
  downloadButton: {
    marginTop: 16,
    width: '100%',
    height: 37,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fc4c02',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadText: {
    color: '#fc4c02',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
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
    gap: 12,
  },
  backHome: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backHomeText: {
    color: '#808080',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
  },
});
