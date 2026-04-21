import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BrandHeader } from '../components/BrandHeader';
import { OtpBoxes } from '../components/OtpBoxes';
import { OtpKeypad } from '../components/OtpKeypad';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenSurface } from '../components/ScreenSurface';
import { DEFAULT_PHONE_NUMBER, OTP_LENGTH, RESEND_SECONDS } from '../constants/auth';
import { COLORS } from '../constants/theme';
import { useResponsiveLayout } from '../utils/responsive';

export function OtpScreen({
  phoneNumber,
  otp,
  onOtpChange,
  onBack,
  onChangeNumber,
  onVerify,
  onResend,
  loading = false,
}: {
  phoneNumber: string;
  otp: string;
  onOtpChange: (value: string) => void;
  onBack: () => void;
  onChangeNumber: () => void;
  onVerify: () => void;
  onResend?: () => void;
  loading?: boolean;
}) {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const layout = useResponsiveLayout();

  useEffect(() => {
    setSecondsLeft(RESEND_SECONDS);
    const timer = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleKeyPress = (value: string) => {
    if (otp.length >= OTP_LENGTH) {
      return;
    }

    onOtpChange(`${otp}${value}`);
  };

  const handleBackspace = () => {
    onOtpChange(otp.slice(0, -1));
  };

  return (
    <ScreenSurface variant="otp">
      <KeyboardAvoidingView
        style={[
          styles.screen,
          {
            paddingHorizontal: layout.screenX,
            paddingTop: Math.max(18, Math.round(layout.screenHeight * 0.03)),
            paddingBottom: Math.max(18, Math.round(layout.screenHeight * 0.02)),
          },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>

        <View style={styles.brandRow}>
          <BrandHeader compact />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            We&apos;ve sent a {OTP_LENGTH}-digit code to{'\n'}
            <Text style={styles.phone}>+91 {phoneNumber || DEFAULT_PHONE_NUMBER}</Text>
          </Text>
          <Text style={styles.sentNote}>OTP sent to {phoneNumber || DEFAULT_PHONE_NUMBER}</Text>
        </View>

        <View style={[styles.card, { width: '100%', maxWidth: layout.authCardWidth }]}>
          <Text style={styles.cardLabel}>Enter OTP</Text>
          <OtpBoxes otp={otp} length={OTP_LENGTH} />

          <Text style={styles.resendText}>
            {secondsLeft > 0 ? (
              <>
                Resend OTP in <Text style={styles.resendAccent}>{secondsLeft}s</Text>
              </>
            ) : (
              <Text style={styles.resendAccent} onPress={onResend}>
                Resend OTP
              </Text>
            )}
          </Text>

          <PrimaryButton
            label={loading ? 'Verifying...' : 'Login'}
            onPress={onVerify}
            style={styles.button}
            disabled={otp.length < OTP_LENGTH || loading}
          />

          <Pressable style={styles.changeRow} onPress={onChangeNumber}>
            <Text style={styles.changeText}>
              Changed your number? <Text style={styles.changeLink}>Login again</Text>
            </Text>
          </Pressable>
        </View>

        <OtpKeypad onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
      </KeyboardAvoidingView>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginTop: 20,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.textPrimary,
    marginTop: -2,
  },
  brandRow: {
    marginTop: 8,
    alignItems: 'center',
  },
  header: {
    marginTop: 10,
    marginBottom: 14,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 21,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 7,
    lineHeight: 18,
  },
  phone: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sentNote: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  card: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#d9b7ab',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  },
  cardLabel: {
    color: '#2e3444',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  resendText: {
    marginTop: 16,
    color: COLORS.textSecondary,
    fontSize: 10,
    textAlign: 'center',
  },
  resendAccent: {
    fontWeight: '700',
    color: COLORS.button,
  },
  button: {
    marginTop: 18,
  },
  changeRow: {
    marginTop: 12,
    alignItems: 'center',
  },
  changeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  changeLink: {
    fontWeight: '700',
    color: COLORS.button,
  },
});
