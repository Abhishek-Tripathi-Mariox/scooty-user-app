import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import { ArrowLeftIcon, CheckIcon, ClockIcon, SmallInfoIcon } from '../components/RideIcons';

export function DepositRefundStatusScreen({
  onBack,
  onGoToWallet,
  onBackHome,
  depositAmount = 1000,
  transactionId = 'RFDGJWD1CO9KW',
  expectedDate = '25 February 2026',
}: {
  onBack: () => void;
  onGoToWallet: () => void;
  onBackHome: () => void;
  depositAmount?: number;
  transactionId?: string;
  expectedDate?: string;
}) {
  const steps = [
    { label: 'Ride Completed', subtitle: 'February 19, 2026 at 2:45 PM', state: 'done' as const },
    { label: 'Verification Complete', subtitle: 'Vehicle inspected successfully', state: 'done' as const },
    { label: 'Refund Initiated', subtitle: 'Processing refund to your payment method', state: 'active' as const },
    { label: 'Amount Credited', subtitle: 'Pending', state: 'pending' as const },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#000000" />
        </Pressable>
        <Text style={styles.headerTitle}>Deposit Refund Status</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.successCard}>
          <View style={styles.successCircle}>
            <CheckIcon size={48} color="#00a63e" />
          </View>
          <Text style={styles.successAmount}>₹{depositAmount}</Text>
          <Text style={styles.successLabel}>Security Deposit Refund</Text>
          <View style={styles.successChip}>
            <CheckIcon size={14} color="#ffffff" />
            <Text style={styles.successChipText}>Refund Initiated</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Refund Progress</Text>
          {steps.map((s, i) => (
            <View key={s.label} style={styles.stepRow}>
              <View style={styles.stepIconWrap}>
                {s.state === 'done' ? (
                  <View style={styles.stepDone}>
                    <CheckIcon size={16} color="#ffffff" />
                  </View>
                ) : s.state === 'active' ? (
                  <View style={styles.stepActive}>
                    <Text style={styles.stepNum}>{i + 1}</Text>
                  </View>
                ) : (
                  <View style={styles.stepPending}>
                    <Text style={styles.stepNum}>{i + 1}</Text>
                  </View>
                )}
                {i < steps.length - 1 ? <View style={styles.stepConnector} /> : null}
              </View>
              <View style={styles.stepBody}>
                <Text
                  style={[
                    styles.stepLabel,
                    s.state === 'pending' && styles.stepLabelMuted,
                  ]}
                >
                  {s.label}
                </Text>
                <Text
                  style={[
                    styles.stepSubtitle,
                    s.state === 'pending' && styles.stepLabelMuted,
                  ]}
                >
                  {s.subtitle}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.estimatedCard}>
          <ClockIcon size={24} color="#1e40af" />
          <View style={{ flex: 1 }}>
            <Text style={styles.estimatedLabel}>Estimated Credit Time</Text>
            <Text style={styles.estimatedDate}>{expectedDate}</Text>
            <Text style={styles.estimatedNote}>
              Refund typically takes 3-5 business days to reflect in your account
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Refund Details</Text>
          <Row label="Deposit Amount" value={`₹${depositAmount}`} />
          <Row label="Deductions" value="₹0" valueColor="#16a34a" />
          <View style={styles.divider} />
          <Row label="Refund Amount" boldLabel valueNode={
            <Text style={styles.refundAmountBig}>₹{depositAmount}</Text>
          } />
          <View style={styles.divider} />
          <View style={styles.methodRow}>
            <Text style={styles.rowLabel}>Refund Method</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.rowValue}>Original Payment Method</Text>
              <Text style={styles.methodMeta}>UPI / Card ending ****4532</Text>
            </View>
          </View>
          <Row label="Transaction ID" valueNode={<Text style={styles.mono}>{transactionId}</Text>} />
        </View>

        <View style={styles.yellowCard}>
          <SmallInfoIcon size={20} color="#a16207" />
          <View style={{ flex: 1 }}>
            <Text style={styles.yellowTitle}>Track Your Refund</Text>
            <Text style={styles.yellowBody}>
              You can track the refund status anytime from the Wallet section. You&apos;ll also receive
              notifications when the amount is credited to your account.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton label="Go to Wallet" onPress={onGoToWallet} height={52} />
        <Pressable style={styles.backHome} onPress={onBackHome}>
          <Text style={styles.backHomeText}>Back to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  valueNode,
  valueColor,
  boldLabel,
}: {
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
  valueColor?: string;
  boldLabel?: boolean;
}) {
  return (
    <View style={styles.rowFlex}>
      <Text style={[styles.rowLabel, boldLabel && styles.rowLabelBold]}>{label}</Text>
      {valueNode ? valueNode : <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  header: {
    height: 60,
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
    color: '#000000',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 160,
    gap: 24,
  },
  successCard: {
    backgroundColor: 'rgba(220, 252, 231, 0.4)',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00a63e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successAmount: {
    color: '#166534',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  successLabel: {
    color: '#166534',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  successChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  successChipText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
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
  cardTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepIconWrap: {
    alignItems: 'center',
    width: 24,
  },
  stepDone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00a63e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fc4c02',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  stepConnector: {
    width: 1,
    height: 28,
    backgroundColor: '#bdbdbd',
    marginTop: 4,
  },
  stepBody: {
    flex: 1,
    paddingBottom: 12,
  },
  stepLabel: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  stepSubtitle: {
    marginTop: 2,
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 18,
  },
  stepLabelMuted: {
    color: '#9ca3af',
  },
  estimatedCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(239, 246, 255, 0.55)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  estimatedLabel: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  estimatedDate: {
    marginTop: 4,
    color: '#1e40af',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  estimatedNote: {
    marginTop: 8,
    color: '#1e40af',
    fontSize: 12,
    lineHeight: 18,
  },
  rowFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
  },
  rowLabelBold: {
    color: '#101828',
    fontWeight: '600',
  },
  rowValue: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  refundAmountBig: {
    color: '#16a34a',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  methodMeta: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 16,
  },
  mono: {
    color: '#101828',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  yellowCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(254, 252, 232, 0.55)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  yellowTitle: {
    color: '#a16207',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  yellowBody: {
    marginTop: 6,
    color: '#a16207',
    fontSize: 12,
    lineHeight: 18,
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
