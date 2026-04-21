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
            paddingTop: Math.max(14, Math.round(layout.screenHeight * 0.024)),
            paddingBottom: 0,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <BrandHeader compact />
        </View>

        <View style={[styles.card, { width: '100%', maxWidth: layout.authCardWidth }]}>
          <Text style={styles.cardLabel}>Mobile Number</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputIconWrap}>
              <PhoneIcon width={18} height={18} />
            </View>
            <Text style={styles.mobileValue}>
              {mobileNumber.length > 0 ? mobileNumber : 'Enter 10 digit mobile number'}
            </Text>
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
            label={loading ? 'Sending OTP...' : 'Send OTP'}
            onPress={onContinue}
            style={styles.button}
            disabled={loading || !acceptedTerms || mobileNumber.length !== 10}
          />

          <Text style={styles.helperText}>
            By continuing, you agree to our{' '}
            <Text style={styles.helperLink}>Terms & Conditions</Text>
          </Text>
        </View>

        <View style={styles.keypadTray}>
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
    marginTop: 6,
    marginBottom: 14,
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: 'rgba(255,245,236,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    shadowColor: '#e6b9aa',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  cardLabel: {
    color: '#2a3342',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  inputRow: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(225, 229, 236, 0.96)',
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  inputIconWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  mobileValue: {
    flex: 1,
    color: '#7b8191',
    fontSize: 14,
    fontWeight: '500',
    paddingLeft: 8,
  },
  termsRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#9b8a90',
    marginTop: 3,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.button,
    borderColor: COLORS.button,
  },
  checkboxMark: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  termsText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    flex: 1,
    lineHeight: 14,
  },
  termsLink: {
    fontWeight: '700',
    color: COLORS.button,
  },
  button: {
    marginTop: 14,
    height: 46,
    borderRadius: 14,
  },
  helperText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#9da3b5',
    fontSize: 11,
    lineHeight: 15,
  },
  helperLink: {
    color: '#9da3b5',
    textDecorationLine: 'underline',
  },
  keypadTray: {
    width: '100%',
    marginTop: 18,
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'rgba(217, 221, 230, 0.96)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
