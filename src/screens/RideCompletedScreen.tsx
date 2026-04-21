import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';
import { formatCurrency } from '../utils/format';

export function RideCompletedScreen({
  onBack,
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
  const totalFare = fare || 153;

  return (
    <View style={styles.root}>
      <PageFrame title="" onBack={onBack} scroll={false}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Text style={styles.successMark}>✓</Text>
          </View>

          <Text style={styles.title}>Ride Completed!</Text>
          <Text style={styles.subtitle}>Hope you had a great ride</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Metric icon="⏱" label="Duration" value={duration || '18:45'} />
              <Metric icon="◈" label="Distance" value={`${distance || 6.5} km`} />
            </View>

            <View style={styles.breakdownSection}>
              <Text style={styles.breakdownTitle}>Fare Breakdown</Text>
              <LineItem label="Base Fare" value="₹45" />
              <LineItem label="Distance Fare" value="₹52" />
              <LineItem label="Time Fare" value="₹56" />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalFare)}</Text>
              </View>
            </View>

            <View style={styles.walletCard}>
              <Text style={styles.walletLabel}>Paid via Wallet</Text>
              <Text style={styles.walletValue}>{formatCurrency(totalFare)}</Text>
            </View>
          </View>

          <Pressable style={styles.receiptButton} onPress={() => {}}>
            <Text style={styles.receiptText}>⬇ Download Receipt</Text>
          </Pressable>

          <View style={styles.footerCard}>
            <PrimaryButton label="Rate Your Ride" onPress={onRate} style={styles.rateButton} />

            <Pressable onPress={onHome} style={styles.backHomeButton}>
              <Text style={styles.backHomeText}>Back to Home</Text>
            </Pressable>
          </View>
        </View>
      </PageFrame>
    </View>
  );
}

function Metric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}>
        <Text style={styles.metricIconText}>{icon}</Text>
      </View>
      <View style={styles.metricTextWrap}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

function LineItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.lineItem}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={styles.lineValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 18,
    paddingTop: 8,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successMark: {
    fontSize: 34,
    color: '#16a34a',
    fontWeight: '900',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 16,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.84)',
    padding: 14,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 245, 238, 0.62)',
    padding: 10,
  },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  metricIconText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  metricTextWrap: {
    flex: 1,
  },
  metricLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  breakdownSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(33, 48, 74, 0.08)',
    paddingTop: 12,
  },
  breakdownTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  lineLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  lineValue: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(33, 48, 74, 0.08)',
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  totalValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  walletCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(33, 48, 74, 0.05)',
    padding: 14,
  },
  walletLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  walletValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  receiptButton: {
    width: '100%',
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.button,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  receiptText: {
    color: COLORS.button,
    fontSize: 13,
    fontWeight: '800',
  },
  footerCard: {
    width: '100%',
    paddingTop: 18,
  },
  rateButton: {
    width: '100%',
  },
  backHomeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backHomeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
