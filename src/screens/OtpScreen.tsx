import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { BrandHeader } from '../components/BrandHeader';
import { GradientButton } from '../components/GradientButton';
import { LockIcon } from '../components/LockIcon';
import { PhoneIcon } from '../components/PhoneIcon';
import { DEFAULT_PHONE_NUMBER, OTP_LENGTH, RESEND_SECONDS } from '../constants/auth';

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
  const otpRef = useRef<TextInput>(null);
  void onBack;

  useEffect(() => {
    setSecondsLeft(RESEND_SECONDS);
    const timer = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => otpRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  const handleOtpChange = (value: string) => {
    onOtpChange(value.replace(/\D/g, '').slice(0, OTP_LENGTH));
  };

  const displayNumber = phoneNumber || DEFAULT_PHONE_NUMBER;
  const canSubmit = !loading && otp.length === OTP_LENGTH;

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <BrandHeader />
          </View>

          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>Mobile Number</Text>
              <Pressable style={styles.inputRow} onPress={onChangeNumber}>
                <View style={styles.inputIcon}>
                  <PhoneIcon width={20} height={20} />
                </View>
                <Text style={styles.valueText}>{displayNumber}</Text>
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Enter OTP</Text>
              <Pressable style={styles.inputRow} onPress={() => otpRef.current?.focus()}>
                <View style={styles.inputIcon}>
                  <LockIcon width={20} height={20} />
                </View>
                <TextInput
                  ref={otpRef}
                  style={styles.input}
                  value={otp}
                  onChangeText={handleOtpChange}
                  placeholder={`Enter ${OTP_LENGTH} digit OTP`}
                  placeholderTextColor="#717182"
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  autoFocus
                />
              </Pressable>
              <Text style={styles.helper}>
                {secondsLeft > 0 ? (
                  <>OTP sent to {displayNumber}</>
                ) : (
                  <Text onPress={onResend} style={styles.resendLink}>
                    Resend OTP
                  </Text>
                )}
              </Text>
            </View>

            <GradientButton
              label={loading ? 'Verifying...' : 'Login'}
              onPress={onVerify}
              disabled={!canSubmit}
              height={48}
              radius={12}
              style={styles.loginButton}
            />

            <Text style={styles.terms}>
              By continuing, you agree to our{'\n'}
              <Text style={styles.termsLink}>Terms & Conditions</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 63,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 345,
    marginTop: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#f6e3d4',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 18,
  },
  inputRow: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  inputIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    padding: 0,
  },
  valueText: {
    flex: 1,
    fontSize: 16,
    color: '#717182',
  },
  helper: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    color: '#6a7282',
  },
  resendLink: {
    color: '#fc4c02',
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 4,
  },
  terms: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 18,
    color: '#99a1af',
    textAlign: 'center',
  },
  termsLink: {
    color: '#99a1af',
  },
});
