import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandHeader } from '../components/BrandHeader';
import { OtpKeypad } from '../components/OtpKeypad';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenSurface } from '../components/ScreenSurface';
import { COLORS } from '../constants/theme';
import { PhoneIcon } from '../components/PhoneIcon';
import { useResponsiveLayout } from '../utils/responsive';

const MOBILE_LENGTH = 10;

export function LoginScreen({
  mobileNumber,
  acceptedTerms,
  onToggleTerms,
  onChangeMobile,
  onContinue,
  loading = false,
}: {
  mobileNumber: string;
  acceptedTerms: boolean;
  onToggleTerms: () => void;
  onChangeMobile: (value: string) => void;
  onContinue: () => void;
  loading?: boolean;
}) {
  const layout = useResponsiveLayout();

  const handleKeyPress = (value: string) => {
    if (mobileNumber.length >= MOBILE_LENGTH) {
      return;
    }

    onChangeMobile(`${mobileNumber}${value}`.replace(/\D/g, '').slice(0, MOBILE_LENGTH));
  };

  const handleBackspace = () => {
    onChangeMobile(mobileNumber.slice(0, -1));
  };

  return (
    <ScreenSurface variant="auth">
      <ScrollView
        contentContainerStyle={[
          styles.screen,
          {
            paddingHorizontal: layout.screenX,
            paddingTop: Math.max(16, Math.round(layout.screenHeight * 0.028)),
            paddingBottom: Math.max(16, Math.round(layout.screenHeight * 0.02)),
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <BrandHeader compact />
          <Text style={styles.headerCopy}>Secure access for riders</Text>
        </View>

        <View style={[styles.card, { width: '100%', maxWidth: layout.authCardWidth }]}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardLabel}>Mobile Number</Text>
            <View style={styles.secureChip}>
              <Text style={styles.secureChipText}>OTP login</Text>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputIconWrap}>
              <PhoneIcon width={18} height={18} />
            </View>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <View style={styles.inputValueWrap}>
              <Text
                style={[styles.mobileValue, mobileNumber.length === 0 && styles.mobilePlaceholder]}
                numberOfLines={1}
              >
                {mobileNumber.length > 0 ? mobileNumber : 'Enter your mobile number'}
              </Text>
            </View>
          </View>

          <Pressable style={styles.termsRow} onPress={onToggleTerms}>
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms ? <Text style={styles.checkboxMark}>✓</Text> : null}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Pressable>

          <PrimaryButton
            label={loading ? 'Sending OTP...' : 'Send OTP  →'}
            onPress={onContinue}
            style={styles.button}
            disabled={loading || !acceptedTerms || mobileNumber.length !== 10}
          />
        </View>

        <View style={styles.keypadShell}>
          <Text style={styles.keypadTitle}>Quick number pad</Text>
          <OtpKeypad onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
        </View>
      </ScrollView>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  header: {
    marginTop: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  headerCopy: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  card: {
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    backgroundColor: 'rgba(255, 247, 241, 0.66)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    shadowColor: '#c79e92',
    shadowOpacity: 0.2,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardLabel: {
    color: '#2a3342',
    fontSize: 13,
    fontWeight: '700',
  },
  secureChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  secureChipText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  inputRow: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(223, 216, 213, 0.95)',
    backgroundColor: 'rgba(255,255,255,0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputIconWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  countryCode: {
    paddingRight: 10,
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#e5ddd9',
  },
  countryCodeText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  inputValueWrap: {
    flex: 1,
    minWidth: 0,
  },
  mobileValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  mobilePlaceholder: {
    color: '#8d8990',
    fontWeight: '500',
  },
  termsRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 15,
    height: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#9b8a90',
    marginTop: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  checkboxChecked: {
    backgroundColor: COLORS.button,
    borderColor: COLORS.button,
  },
  checkboxMark: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 10,
  },
  termsText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11.5,
    lineHeight: 17,
  },
  termsLink: {
    color: COLORS.button,
    textDecorationLine: 'underline',
    fontWeight: '800',
  },
  button: {
    marginTop: 18,
    height: 48,
    borderRadius: 14,
  },
  keypadShell: {
    width: '100%',
    marginTop: 16,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 2,
    backgroundColor: 'rgba(217, 221, 230, 0.96)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  keypadTitle: {
    marginBottom: 8,
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
