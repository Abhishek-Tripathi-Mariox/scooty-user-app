import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { BrandHeader } from '../components/BrandHeader';
import { GradientButton } from '../components/GradientButton';
import { PhoneIcon } from '../components/PhoneIcon';

const MOBILE_LENGTH = 10;

export function LoginScreen({
  mobileNumber,
  onChangeMobile,
  onContinue,
  loading = false,
}: {
  mobileNumber: string;
  onChangeMobile: (value: string) => void;
  onContinue: () => void;
  loading?: boolean;
}) {
  const handleChange = (value: string) => {
    onChangeMobile(value.replace(/\D/g, '').slice(0, MOBILE_LENGTH));
  };

  const canSubmit = !loading && mobileNumber.length === MOBILE_LENGTH;

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <BrandHeader />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Mobile Number</Text>

            <View style={styles.inputRow}>
              <View style={styles.inputIcon}>
                <PhoneIcon width={20} height={20} />
              </View>
              <TextInput
                style={styles.input}
                value={mobileNumber}
                onChangeText={handleChange}
                placeholder="Enter 10 digit mobile number"
                placeholderTextColor="#717182"
                keyboardType="number-pad"
                maxLength={MOBILE_LENGTH}
              />
            </View>

            <GradientButton
              label={loading ? 'Sending OTP...' : 'Send OTP'}
              onPress={onContinue}
              disabled={!canSubmit}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 63,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 350,
    marginTop: 36,
    padding: 23,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
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
  button: {
    marginTop: 21,
  },
});
