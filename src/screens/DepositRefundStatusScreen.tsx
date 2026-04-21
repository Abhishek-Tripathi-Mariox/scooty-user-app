import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';
import { formatCurrency } from '../utils/format';

export function DepositRefundStatusScreen({
  onBack,
  depositAmount,
  refundProgress,
}: {
  onBack: () => void;
  depositAmount?: number;
  refundProgress?: number;
}) {
  return (
    <View style={styles.root}>
      <PageFrame title="Deposit Refund Status" onBack={onBack}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.successIcon}>
            <Text style={styles.checkMark}>✓</Text>
          </View>

          <View style={styles.refundBox}>
            <Text style={styles.refundAmount}>{formatCurrency(depositAmount || 1000)}</Text>
            <Text style={styles.refundLabel}>Security Deposit Refund</Text>
            <Pressable style={styles.refundStatus}>
              <Text style={styles.refundStatusText}>Refund Initiated</Text>
            </Pressable>
          </View>

          <View style={styles.progressBox}>
            <Text style={styles.progressTitle}>Refund Progress</Text>

            {[
              { title: 'Ride Completed', subtext: 'Completed at 6:00 AM' },
              { title: 'Verification Complete', subtext: 'Request verified by admin' },
              { title: 'Refund Initiated', subtext: 'Processing request to payment method' },
              { title: 'Amount Credited', subtext: 'Pending' },
            ].map((step, idx) => (
              <View key={idx} style={[styles.progressStep, idx < 3 && styles.stepCompleted]}>
                <View style={styles.stepDot}>
                  {idx < 3 && <Text style={styles.stepCheck}>✓</Text>}
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepSubtext}>{step.subtext}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.detailsBox}>
            <Text style={styles.detailsTitle}>Refund Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Deposit amount</Text>
              <Text style={styles.detailValue}>₹1000</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Deductions</Text>
              <Text style={styles.detailValue}>₹ 0</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Refund Amount</Text>
              <Text style={styles.detailValue}>₹1000</Text>
            </View>
            <Text style={styles.refundMethod}>Refund Method: Original Payment Method</Text>
          </View>

          <View style={styles.estimateBox}>
            <Text style={styles.estimateTitle}>Estimated Credit Time</Text>
            <Text style={styles.estimateValue}>25 February 2026</Text>
            <Text style={styles.estimateNote}>
              Refund typically takes 3-5 business days to reflect in your account
            </Text>
          </View>

          <PrimaryButton label="View Details" onPress={() => {}} />
        </ScrollView>
      </PageFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: {
    paddingBottom: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  checkMark: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '900',
  },
  refundBox: {
    borderRadius: 16,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  refundAmount: {
    color: COLORS.button,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  refundLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 10,
  },
  refundStatus: {
    borderRadius: 12,
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  refundStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  progressBox: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  progressTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 16,
  },
  progressStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepCompleted: {
    opacity: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepCheck: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '900',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  stepSubtext: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  detailsBox: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,240,230,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 28, 0.1)',
    padding: 12,
    marginBottom: 12,
  },
  detailsTitle: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  detailValue: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  refundMethod: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 100, 28, 0.1)',
  },
  estimateBox: {
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  estimateTitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  estimateValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 6,
  },
  estimateNote: {
    color: COLORS.textSecondary,
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 13,
  },
});
