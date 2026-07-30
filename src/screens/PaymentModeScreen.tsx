import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import { ArrowLeftIcon } from '../components/RideIcons';
import { formatCurrency } from '../utils/format';
import { useStyles } from '../utils/responsiveStyles';

export type PaymentMethodId = 'CASH' | 'WALLET' | 'UPI' | 'NETBANKING';

type PayOption = {
  id: PaymentMethodId;
  label: string;
  description: string;
  iconBg: string;
  iconColor: string;
  iconChar: string;
};

const OPTIONS: PayOption[] = [
  {
    id: 'CASH',
    label: 'Cash on Pickup',
    description: 'Pay in cash at the pickup station',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    iconChar: '₹',
  },
  {
    id: 'WALLET',
    label: 'Wallet Balance',
    description: 'Use your in-app wallet balance',
    iconBg: '#ffedd5',
    iconColor: '#fc4c02',
    iconChar: 'W',
  },
  {
    id: 'UPI',
    label: 'UPI',
    description: 'Google Pay, PhonePe, Paytm & other UPI apps',
    iconBg: '#e0f2fe',
    iconColor: '#0284c7',
    iconChar: 'U',
  },
  {
    id: 'NETBANKING',
    label: 'Online Banking',
    description: 'Net banking from all major banks',
    iconBg: '#ede9fe',
    iconColor: '#6d28d9',
    iconChar: 'B',
  },
];

export function PaymentModeScreen({
  onBack,
  onConfirm,
  amount = 0,
  walletBalance = 0,
  loading = false,
}: {
  onBack: () => void;
  onConfirm: (methodId: PaymentMethodId) => void;
  amount?: number;
  walletBalance?: number;
  loading?: boolean;
}) {
  const styles = useStyles(RAW_STYLES);
  const walletEnough = walletBalance >= amount;
  const [selected, setSelected] = useState<PaymentMethodId>('CASH');

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Payment Mode</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount Payable</Text>
          <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
        </View>

        <Text style={styles.sectionLabel}>Choose how you'd like to pay</Text>

        <View style={styles.card}>
          {OPTIONS.map((opt, idx) => {
            const disabled = opt.id === 'WALLET' && !walletEnough;
            const isSelected = selected === opt.id;
            return (
              <View key={opt.id}>
                {idx > 0 ? <View style={styles.rowDivider} /> : null}
                <Pressable
                  style={[styles.row, disabled && styles.rowDisabled]}
                  onPress={() => !disabled && setSelected(opt.id)}
                  disabled={disabled}
                >
                  <View style={[styles.logo, { backgroundColor: opt.iconBg }]}>
                    <Text style={[styles.logoText, { color: opt.iconColor }]}>{opt.iconChar}</Text>
                  </View>
                  <View style={styles.rowMain}>
                    <Text style={styles.rowLabel}>{opt.label}</Text>
                    <Text style={styles.rowNote}>
                      {opt.id === 'WALLET'
                        ? `Balance: ${formatCurrency(walletBalance)}${
                            !walletEnough ? ' — Insufficient' : ''
                          }`
                        : opt.description}
                    </Text>
                  </View>
                  <View style={styles.radioWrap}>
                    {isSelected ? <RadioCheck /> : <RadioEmpty />}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>

        <Text style={styles.helperText}>
          You can top up your wallet from Profile {'>'} My Wallet to use the wallet option.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label={loading ? 'Processing…' : `Confirm — ${formatCurrency(amount)}`}
          onPress={() => onConfirm(selected)}
          disabled={loading || (selected === 'WALLET' && !walletEnough)}
          height={56}
        />
      </View>
    </SafeAreaView>
  );
}

function RadioCheck() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Circle cx={11} cy={11} r={11} fill="#fc4c02" />
      <Path d="M6 11.5 10 15l6-7" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function RadioEmpty() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Circle cx={11} cy={11} r={10} stroke="#cbd5e1" strokeWidth={1.4} />
    </Svg>
  );
}

const RAW_STYLES = {
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
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
    paddingHorizontal: 19,
    paddingTop: 20,
    paddingBottom: 120,
    gap: 16,
  },
  amountCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 4,
  },
  amountLabel: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
  amountValue: {
    color: '#0f172a',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
  },
  sectionLabel: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 4,
  },
  rowDivider: {
    height: 1,
    marginHorizontal: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 17,
    gap: 12,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
  },
  rowMain: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  rowNote: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
  radioWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    color: '#475569',
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
  },
} as const;
