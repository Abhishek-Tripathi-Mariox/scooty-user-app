import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { GradientButton } from '../components/GradientButton';
import { ArrowLeftIcon, ShieldIcon, WalletCardIcon } from '../components/RideIcons';
import type { WalletTransactionItem } from '../services/userApi';

type Txn = {
  id: string;
  title: string;
  date: string;
  amount: number;
  kind: 'ride' | 'topup' | 'refund';
  note?: string;
};

const RECHARGE_PRESETS = [
  { amount: 20, extra: 10 },
  { amount: 50, extra: 25 },
  { amount: 100, extra: 50 },
  { amount: 200, extra: 100 },
  { amount: 500, extra: 250 },
  { amount: 1000, extra: 150 },
  { amount: 2000, extra: 300 },
  { amount: 4000, extra: 600 },
  { amount: 8000, extra: 1200 },
];

export function MyWalletScreen({
  onBack,
  onTabPress,
  balance,
  transactions,
  activeTab,
  onOpenRefundStatus,
  onRecharge,
}: {
  onBack: () => void;
  onTabPress: (tab: TabKey) => void;
  balance?: number;
  transactions?: WalletTransactionItem[] | null;
  activeTab?: TabKey;
  onOpenRefundStatus?: () => void;
  onRecharge?: (amount: number) => void;
}) {
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const list = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    return transactions.map((tx) => ({
      id: tx._id,
      title: tx.description || formatTransactionTitle(tx.type),
      date: formatTransactionDate(tx.createdAt),
      amount: tx.direction === 'CREDIT' ? tx.amount : -tx.amount,
      kind: mapTransactionKind(tx),
      note: tx.status && tx.status !== 'SUCCESS' ? tx.status : undefined,
    }));
  }, [transactions]);
  const latestRefund = useMemo(() => transactions?.find((tx) => tx.type === 'REFUND') || null, [transactions]);

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#101828" />
        </Pressable>
        <Text style={styles.headerTitle}>My Wallet</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <WalletCardIcon size={22} color="#1c1c1e" />
            <Text style={styles.balanceLabel}>Current Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>₹{balance?.toFixed(2) || '0.00'}</Text>
          <Pressable style={styles.addMoneyButton} onPress={() => setRechargeOpen(true)}>
            <Text style={styles.addMoneyPlus}>+</Text>
            <Text style={styles.addMoneyText}>Add Money</Text>
          </Pressable>
        </View>

        {latestRefund ? (
          <Pressable style={styles.refundCard} onPress={onOpenRefundStatus}>
            <View style={styles.refundTopRow}>
              <View style={styles.refundIconWrap}>
                <HourglassIcon color="#a16207" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.refundLabel}>Security Deposit Refund</Text>
                <Text style={styles.refundAmount}>₹{latestRefund.amount}</Text>
                <View style={styles.refundChip}>
                  <Text style={styles.refundChipText}>{latestRefund.status || 'Processing'}</Text>
                </View>
              </View>
              <ShieldIcon size={28} color="#d97706" />
            </View>
            <View style={styles.refundDivider} />
            <Text style={styles.refundFooter}>
              {latestRefund.createdAt ? `Updated: ${formatTransactionDate(latestRefund.createdAt)} • Tap for details` : 'Tap for details'}
            </Text>
          </Pressable>
        ) : null}

        <Text style={styles.sectionTitle}>Transaction History</Text>
        {list.length > 0 ? (
          <View style={styles.txnList}>
            {list.map((t) => (
              <View key={t.id} style={styles.txnRow}>
                <View style={[styles.txnIcon, txnIconBg(t.kind)]}>
                  {t.kind === 'ride' ? (
                    <ArrowUpRedIcon />
                  ) : t.kind === 'topup' ? (
                    <ArrowDownGreenIcon />
                  ) : (
                    <HourglassIcon color="#92400e" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txnTitle}>{t.title}</Text>
                  <View style={styles.txnMetaRow}>
                    <Text style={styles.txnDate}>{t.date}</Text>
                    {t.note ? (
                      <View style={styles.txnNoteChip}>
                        <Text style={styles.txnNoteText}>{t.note}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <Text style={[styles.txnAmount, t.amount < 0 ? styles.txnNegative : styles.txnPositive]}>
                  {t.amount < 0 ? '-' : '+'}₹{Math.abs(t.amount)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No live wallet transactions yet.</Text>
        )}
      </ScrollView>

      {activeTab ? <BottomTabs active={activeTab} onTabPress={onTabPress} /> : null}

      <RechargeModal
        visible={rechargeOpen}
        onClose={() => setRechargeOpen(false)}
        onRecharge={onRecharge}
      />
    </SafeAreaView>
  );
}

function RechargeModal({
  visible,
  onClose,
  onRecharge,
}: {
  visible: boolean;
  onClose: () => void;
  onRecharge?: (amount: number) => void;
}) {
  const [selected, setSelected] = useState(500);
  const preset = RECHARGE_PRESETS.find((p) => p.amount === selected) || RECHARGE_PRESETS[4];
  const gst = Math.round(selected * 0.18);
  const total = selected + gst;
  const extraPercent = Math.round((preset.extra / preset.amount) * 100);

  const handlePay = () => {
    onClose();
    if (onRecharge) {
      onRecharge(total);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <View style={styles.sheet}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sheetTitle}>Recharge Amount</Text>
          <View style={styles.presetGrid}>
            {RECHARGE_PRESETS.map((p) => (
              <Pressable
                key={p.amount}
                style={[styles.presetTile, selected === p.amount && styles.presetTileActive]}
                onPress={() => setSelected(p.amount)}
              >
                <Text style={styles.presetAmount}>₹ {p.amount}</Text>
                <View style={styles.presetExtraPill}>
                  <Text style={styles.presetExtraText}>Get ₹ {p.extra} Extra</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.sheetDivider} />

          <Text style={styles.sheetTitle}>Payment Details</Text>
          <View style={styles.paymentBox}>
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>Recharge Amount</Text>
              <Text style={styles.payValue}>₹ {selected}</Text>
            </View>
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>GST (18%)</Text>
              <Text style={styles.payValue}>₹ {gst}</Text>
            </View>
            <View style={styles.dashedDivider} />
            <View style={styles.payRow}>
              <Text style={styles.payLabelTotal}>Total Amount</Text>
              <Text style={styles.payValueTotal}>₹ {total}</Text>
            </View>
          </View>

          <View style={styles.extraBadge}>
            <View style={styles.extraBadgeLeft}>
              <Text style={styles.extraPercent}>{extraPercent}%</Text>
              <Text style={styles.extraLabel}>EXTRA</Text>
            </View>
            <Text style={styles.extraText}>
              <Text style={styles.extraTextBold}>Rs {selected + preset.extra}</Text>
              {' '}Will be credited to your wallet after the recharge
            </Text>
          </View>

          <View style={{ marginTop: 16 }}>
            <GradientButton label="Pay Now" onPress={handlePay} height={45} radius={12} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function ArrowUpRedIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M10 16V4M10 4l-5 5M10 4l5 5" stroke="#e7000b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ArrowDownGreenIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M10 4v12m0 0-5-5m5 5 5-5" stroke="#00a63e" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HourglassIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 3h12M6 21h12M7 3v3c0 3 3 4 5 6-2 2-5 3-5 6v3M17 3v3c0 3-3 4-5 6 2 2 5 3 5 6v3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function txnIconBg(kind: Txn['kind']) {
  if (kind === 'topup') return { backgroundColor: '#dcfce7' };
  if (kind === 'refund') return { backgroundColor: '#fef3c6' };
  return { backgroundColor: '#ffe2e2' };
}

function formatTransactionTitle(type: string) {
  const normalized = String(type || '').trim().replace(/_/g, ' ').toLowerCase();
  if (!normalized) return 'Wallet transaction';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatTransactionDate(iso?: string) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function mapTransactionKind(tx: WalletTransactionItem): Txn['kind'] {
  if (tx.type === 'REFUND') return 'refund';
  if (tx.direction === 'CREDIT') return 'topup';
  return 'ride';
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
    color: '#101828',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
    gap: 16,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    gap: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceLabel: {
    color: '#1c1c1e',
    fontSize: 16,
    lineHeight: 24,
  },
  balanceAmount: {
    color: '#101828',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
  },
  addMoneyButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    gap: 6,
  },
  addMoneyPlus: {
    color: '#fc4c02',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  addMoneyText: {
    color: '#fc4c02',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  refundCard: {
    backgroundColor: 'rgba(254, 252, 232, 0.5)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  refundTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  refundIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refundLabel: {
    color: '#7b3306',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  refundAmount: {
    marginTop: 2,
    color: '#7b3306',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  refundChip: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#d97706',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  refundChipText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  refundDivider: {
    height: 1,
    backgroundColor: '#fee685',
  },
  refundFooter: {
    color: '#7b3306',
    fontSize: 12,
    lineHeight: 16,
  },
  emptyText: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
  },
  txnList: {
    gap: 8,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnTitle: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  txnMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  txnDate: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  txnNoteChip: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  txnNoteText: {
    color: '#92400e',
    fontSize: 10,
    lineHeight: 14,
  },
  txnAmount: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  txnNegative: {
    color: '#e7000b',
  },
  txnPositive: {
    color: '#00a63e',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },
  sheetTitle: {
    color: '#353535',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 12,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetTile: {
    width: '31.5%',
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    overflow: 'hidden',
  },
  presetTileActive: {
    borderColor: '#fc5007',
    borderWidth: 1.5,
  },
  presetAmount: {
    color: '#353535',
    fontSize: 16,
    fontWeight: '700',
  },
  presetExtraPill: {
    width: '100%',
    paddingVertical: 4,
    backgroundColor: '#ffd6c5',
    alignItems: 'center',
  },
  presetExtraText: {
    color: '#353535',
    fontSize: 10,
    lineHeight: 14,
  },
  sheetDivider: {
    marginVertical: 16,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ffd3c2',
  },
  paymentBox: {
    borderWidth: 1,
    borderColor: '#fc4c02',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payLabel: {
    color: '#353535',
    fontSize: 14,
    lineHeight: 18,
  },
  payValue: {
    color: '#353535',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  dashedDivider: {
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#fc5007',
  },
  payLabelTotal: {
    color: '#353535',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  payValueTotal: {
    color: '#353535',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  extraBadge: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fbfbfb',
    borderRadius: 6,
    paddingVertical: 12,
    paddingRight: 12,
  },
  extraBadgeLeft: {
    width: 76,
    backgroundColor: '#34c759',
    alignSelf: 'stretch',
    marginLeft: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  extraPercent: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  extraLabel: {
    marginTop: 2,
    color: '#ffffff',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  extraText: {
    flex: 1,
    color: '#353535',
    fontSize: 14,
    lineHeight: 20,
  },
  extraTextBold: {
    fontWeight: '600',
  },
});
