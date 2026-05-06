import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';

export function RegisterScreen({
  fullName,
  email,
  mobileNumber,
  city,
  acceptedTerms,
  onToggleTerms,
  onChangeFullName,
  onChangeEmail,
  onChangeMobile,
  onChangeCity,
  onContinue,
  onLoginPress,
  loading = false,
}: {
  fullName: string;
  email: string;
  mobileNumber: string;
  city: string;
  acceptedTerms: boolean;
  onToggleTerms: () => void;
  onChangeFullName: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangeMobile: (value: string) => void;
  onChangeCity: (value: string) => void;
  onContinue: () => void;
  onLoginPress: () => void;
  loading?: boolean;
}) {
  const canSubmit =
    !loading &&
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    mobileNumber.trim().length >= 10 &&
    city.trim().length > 0 &&
    acceptedTerms;

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={onLoginPress} style={styles.backButton} hitSlop={10}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join the ride and start booking scooties around you.
            </Text>
          </View>

          <View style={styles.card}>
            <LabeledInput
              label="Full Name"
              value={fullName}
              onChangeText={onChangeFullName}
              placeholder="Enter your full name"
            />
            <LabeledInput
              label="Email Address"
              value={email}
              onChangeText={onChangeEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <LabeledInput
              label="Mobile Number"
              value={mobileNumber}
              onChangeText={onChangeMobile}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
            />
            <LabeledInput
              label="City"
              value={city}
              onChangeText={onChangeCity}
              placeholder="City"
            />

            <Pressable style={styles.termsRow} onPress={onToggleTerms}>
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms ? <Text style={styles.checkboxMark}>✓</Text> : null}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </Pressable>
          </View>

          <GradientButton
            label={loading ? 'Saving...' : 'Continue  →'}
            onPress={onContinue}
            style={styles.button}
            disabled={!canSubmit}
            height={48}
            radius={16}
          />

          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginLink} onPress={onLoginPress}>
              Login
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText?: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffd1b0' },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  backButtonText: {
    fontSize: 24,
    lineHeight: 24,
    color: '#101828',
  },
  header: {
    width: '100%',
    marginBottom: 24,
  },
  title: {
    color: '#101828',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    color: '#101828',
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: '#101828',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 14,
  },
  input: {
    height: 45,
    borderRadius: 10,
    borderWidth: 1.162,
    borderColor: '#e5e7eb',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 0,
    color: '#101828',
    fontSize: 14,
  },
  termsRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.162,
    borderColor: '#e2e8f0',
    marginTop: 2,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#fc4c02',
    borderColor: '#fc4c02',
  },
  checkboxMark: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 11,
  },
  termsText: {
    flex: 1,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 17.5,
  },
  termsLink: {
    color: '#101828',
  },
  button: {
    marginTop: 24,
  },
  loginText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#101828',
    fontSize: 16,
    lineHeight: 24,
  },
  loginLink: {
    color: '#fc4d04',
    fontSize: 16,
    fontWeight: '600',
  },
});
