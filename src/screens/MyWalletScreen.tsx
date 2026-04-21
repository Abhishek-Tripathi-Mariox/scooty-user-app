import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';
import { formatCurrency } from '../utils/format';

export function MyWalletScreen({
  onBack,
  onTabPress,
  balance,
  transactions,
}: {
  onBack: () => void;
  onTabPress: (tab: TabKey) => void;
  balance?: number;
  transactions?: Array<{ id: string; type: string; amount: number; date: string }>;
}) {
  const defaultTransactions = [
    { id: '1', type: 'Ride', amount: -153, date: '28-Jan-2026' },
    { id: '2', type: 'Wallet Top-up', amount: 500, date: '27-Jan-2026' },
    { id: '3', type: 'Ride', amount: -98, date: '27-Jan-2026' },
    { id: '4', type: 'Ride', amount: -125, date: '26-Jan-2026' },
    { id: '5', type: 'Wallet Top-up', amount: 300, date: '26-Jan-2026' },
  ];

  return (
    <View style={styles.root}>
      <PageFrame title="My Wallet" onBack={onBack}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance || 450)}</Text>

          <View style={styles.walletActions}>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionLabel}>Add Money</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.rechargeBox}>
          <Text style={styles.rechargeTitle}>Quick Recharge</Text>
          <View style={styles.rechargeGrid}>
            {[
              { label: '₹20', value: 20 },
              { label: '₹50', value: 50 },
              { label: '₹100', value: 100 },
              { label: '₹200', value: 200 },
              { label: '₹500', value: 500 },
              { label: '₹1000', value: 1000 },
              { label: '₹2000', value: 2000 },
              { label: '₹4000', value: 4000 },
              { label: '₹8000', value: 8000 },
            ].map((item, idx) => (
              <Pressable key={idx} style={styles.rechargeButton}>
                <Text style={styles.rechargeText}>{item.label}</Text>
                <Text style={styles.rchargeSub}>Set Offer Extra</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.paymentBox}>
          <Text style={styles.paymentTitle}>Payment Details</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Recharge Amount</Text>
            <Text style={styles.paymentValue}>₹500</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>IGST (5%)</Text>
            <Text style={styles.paymentValue}>₹ 30</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Total Amount</Text>
            <Text style={styles.paymentValue}>₹ 530</Text>
          </View>
          <Text style={styles.paymentNote}>
            45% EXTRA will be credited to your wallet after the recharge
          </Text>
        </View>

        <PrimaryButton label="Pay Now" onPress={() => {}} style={styles.payButton} />

        <View style={styles.transactionBox}>
          <Text style={styles.transactionTitle}>Transaction History</Text>
          {(transactions || defaultTransactions).map((txn) => (
            <View key={txn.id} style={styles.transactionItem}>
              <View style={styles.txnContent}>
                <Text style={styles.txnType}>{txn.type}</Text>
                <Text style={styles.txnDate}>{txn.date}</Text>
              </View>
              <Text
                style={[
                  styles.txnAmount,
                  txn.amount < 0 ? styles.txnMinus : styles.txnPlus,
                ]}
              >
                {txn.amount < 0 ? '-' : '+'}₹{Math.abs(txn.amount)}
              </Text>
            </View>
          ))}
        </View>
      </PageFrame>
      <BottomTabs active="profile" onTabPress={onTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  balanceCard: {
    borderRadius: 20,
    backgroundColor: COLORS.button,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 8,
  },
  walletActions: {
    marginTop: 12,
    width: '100%',
  },
  actionButton: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  actionIcon: {
    fontSize: 16,
    color: '#fff',
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  rechargeBox: {
    marginBottom: 16,
  },
  rechargeTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 10,
  },
  rechargeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rechargeButton: {
    width: '31%',
    borderRadius: 10,
    backgroundColor: 'rgba(255,200,200,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 28, 0.2)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  rechargeText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  rchargeSub: {
    color: COLORS.textSecondary,
    fontSize: 8,
    marginTop: 2,
  },
  paymentBox: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
    marginBottom: 12,
  },
  paymentTitle: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  paymentLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  paymentValue: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  paymentNote: {
    color: COLORS.button,
    fontSize: 9,
    marginTop: 8,
    fontWeight: '600',
  },
  payButton: {
    marginBottom: 16,
  },
  transactionBox: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
  },
  transactionTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(33, 48, 74, 0.08)',
  },
  txnContent: {
    flex: 1,
  },
  txnType: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  txnDate: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 11,
    fontWeight: '700',
  },
  txnPlus: {
    color: '#22c55e',
  },
  txnMinus: {
    color: '#ef4444',
  },
});
