import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import { ArrowLeftIcon } from '../components/RideIcons';

type PayOption = {
  id: string;
  label: string;
  logoBg: string;
  logoText: string;
  logoColor: string;
  cardNumber?: string;
  secured?: boolean;
  note?: string;
};

const PRIMARY: PayOption[] = [
  { id: 'gpay', label: 'Google Pay', logoBg: '#ffffff', logoText: 'G', logoColor: '#4285f4' },
  { id: 'paytm', label: 'Paytm', logoBg: '#ffffff', logoText: 'P', logoColor: '#00baf2' },
  { id: 'card', label: '•••• 9999', logoBg: '#ffffff', logoText: 'MC', logoColor: '#eb001b', secured: true },
];

const UPI: PayOption[] = [
  { id: 'phonepe', label: 'PhonePe UPI', logoBg: '#5f259f', logoText: 'Ⴗ', logoColor: '#ffffff', note: 'Low success rate currently' },
  { id: 'mobikwik', label: 'Mobikwik', logoBg: '#e6eefc', logoText: 'M+', logoColor: '#1d4ed8' },
  { id: 'cred', label: 'CRED pay', logoBg: '#0a0a0a', logoText: 'C', logoColor: '#ffffff' },
];

export function PaymentModeScreen({
  onBack,
  onConfirm,
  amount = 0,
  loading = false,
}: {
  onBack: () => void;
  onConfirm: (methodId: string) => void;
  amount?: number;
  loading?: boolean;
}) {
  const [selected, setSelected] = useState<string>('gpay');

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Preferred Mode</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {PRIMARY.map((opt, i) => (
            <PayRow
              key={opt.id}
              option={opt}
              amount={amount}
              selected={selected === opt.id}
              onSelect={() => setSelected(opt.id)}
              showDivider={i > 0}
              showPayButton={selected === opt.id && opt.id === 'gpay'}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>UPI</Text>

        <View style={styles.card}>
          {UPI.map((opt, i) => (
            <PayRow
              key={opt.id}
              option={opt}
              amount={amount}
              selected={selected === opt.id}
              onSelect={() => setSelected(opt.id)}
              showDivider={i > 0}
              subTextNote={opt.note}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label={loading ? 'Processing...' : `Confirm & Pay ₹${amount}`}
          onPress={() => onConfirm(selected)}
          disabled={loading}
          height={56}
        />
      </View>
    </SafeAreaView>
  );
}

function PayRow({
  option,
  amount,
  selected,
  onSelect,
  showDivider,
  showPayButton,
  subTextNote,
}: {
  option: PayOption;
  amount: number;
  selected: boolean;
  onSelect: () => void;
  showDivider: boolean;
  showPayButton?: boolean;
  subTextNote?: string;
}) {
  return (
    <View>
      {showDivider ? <View style={styles.rowDivider} /> : null}
      <Pressable style={styles.row} onPress={onSelect}>
        <View style={[styles.logo, { backgroundColor: option.logoBg }]}>
          <Text style={[styles.logoText, { color: option.logoColor }]}>{option.logoText}</Text>
        </View>

        <View style={styles.rowMain}>
          <Text style={styles.rowLabel}>{option.label}</Text>
          {option.secured ? (
            <View style={styles.securedChip}>
              <Text style={styles.securedText}>Secured</Text>
            </View>
          ) : null}
          {subTextNote ? <Text style={styles.rowNote}>{subTextNote}</Text> : null}
        </View>

        <Text style={styles.amountText}>₹{amount}</Text>

        <View style={styles.radioWrap}>{selected ? <RadioCheck /> : <RadioEmpty />}</View>
      </Pressable>

      {showPayButton ? (
        <Pressable style={styles.payButton} onPress={onSelect}>
          <Text style={styles.payButtonText}>Pay using {option.label}</Text>
        </Pressable>
      ) : null}
    </View>
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

const styles = StyleSheet.create({
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
    paddingHorizontal: 19,
    paddingTop: 20,
    paddingBottom: 120,
    gap: 16,
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
  logo: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 17,
    fontWeight: '800',
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  rowLabel: {
    color: '#0a0a0a',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 21,
  },
  rowNote: {
    width: '100%',
    color: '#0a0a0a',
    fontSize: 13,
    fontWeight: '300',
    lineHeight: 21,
  },
  securedChip: {
    backgroundColor: 'rgba(16, 164, 94, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  securedText: {
    color: '#10a45e',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 13,
  },
  amountText: {
    color: '#8f8f8f',
    fontSize: 15,
    lineHeight: 21,
  },
  radioWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButton: {
    marginTop: 4,
    marginBottom: 16,
    marginHorizontal: 78,
    height: 47,
    borderRadius: 12,
    backgroundColor: '#fc4c02',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  sectionLabel: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 22,
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
});
