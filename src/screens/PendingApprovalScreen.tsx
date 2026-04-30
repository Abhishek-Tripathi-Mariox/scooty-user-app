import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';

function ClockIcon({ size = 18, color = '#464646' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.6} />
      <Path
        d="M12 7v5l3 2"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HourglassIcon({ size = 96, color = '#fc4c02' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <Path
        d="M28 12h40M28 84h40M32 12v12c0 8 8 12 16 16 8 4 16 8 16 16v28M64 12v12c0 8-8 12-16 16-8 4-16 8-16 16v28"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PendingApprovalScreen({
  userName = 'User',
  status = 'PENDING',
  rejectionReason,
  onRetryKyc,
  onLogout,
}: {
  userName?: string;
  status?: string;
  rejectionReason?: string;
  onRetryKyc?: () => void;
  onLogout?: () => void;
}) {
  const isRejected = status === 'REJECTED';
  const reasonText = rejectionReason?.trim();
  const heading = isRejected ? 'KYC Rejected' : `Thank You, ${userName}`;

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registration Pending Approval</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>{heading}</Text>

        <View style={styles.heroWrap}>
          <HourglassIcon size={120} color="#fc4c02" />
        </View>

        <Text style={styles.body}>
          {isRejected ? (
            'Your KYC request was not approved yet.'
          ) : (
            <>
              Your <Text style={styles.bodyStrong}>documents</Text> have been successfully submitted.
            </>
          )}
        </Text>

        <Text style={styles.subBody}>
          {isRejected
            ? rejectionReason || 'Please update the missing or incorrect documents and submit again.'
            : 'Our verification team is reviewing your details.\nYou will be notified once your account is approved.'}
        </Text>

        {isRejected ? (
          <View style={styles.reasonCard}>
            <Text style={styles.reasonLabel}>Rejection reason</Text>
            <Text style={styles.reasonText}>
              {reasonText || 'Please update the missing or incorrect documents and submit again.'}
            </Text>
          </View>
        ) : null}

        <View style={styles.etaCard}>
          <View style={styles.etaLeft}>
            <ClockIcon size={18} color="#464646" />
            <View style={styles.etaTextWrap}>
              <Text style={styles.etaLabel}>Estimated verification time:</Text>
              <Text style={styles.etaValue}>
                {isRejected ? 'Please update the missing details' : 'Within 24 hours'}
              </Text>
            </View>
          </View>
          <View style={styles.etaPill}>
            <Text style={styles.etaPillText}>
              {isRejected ? 'ACTION NEEDED' : 'UNDER REVIEW'}
            </Text>
          </View>
        </View>

        {isRejected ? (
          <GradientButton
            label="Update KYC"
            onPress={onRetryKyc || (() => undefined)}
            style={styles.button}
            height={48}
            radius={14}
          />
        ) : (
          <GradientButton
            label="Waiting for Approval"
            onPress={() => undefined}
            style={styles.button}
            height={48}
            radius={14}
          />
        )}

        {onLogout ? (
          <Pressable onPress={onLogout} hitSlop={10} style={styles.logoutWrap}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        ) : null}

        <Text style={styles.note}>
          Once approved, you&apos;ll receive a notification.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffd1b0' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.26)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.6)',
  },
  headerTitle: {
    color: '#1c1c1e',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  heading: {
    color: '#353535',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroWrap: {
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  body: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  bodyStrong: {
    color: '#101828',
    fontWeight: '600',
  },
  subBody: {
    color: '#6a7282',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  reasonCard: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#fff5f0',
    borderWidth: 1,
    borderColor: '#fc4c02',
    padding: 12,
    marginBottom: 16,
    gap: 4,
  },
  reasonLabel: {
    color: '#fc4c02',
    fontSize: 12,
    fontWeight: '600',
  },
  reasonText: {
    color: '#4a5565',
    fontSize: 13,
    lineHeight: 19,
  },
  etaCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
  },
  etaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  etaTextWrap: { flex: 1 },
  etaLabel: {
    color: '#797878',
    fontSize: 11,
    lineHeight: 14,
  },
  etaValue: {
    color: '#101828',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  etaPill: {
    backgroundColor: '#fff1ea',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  etaPillText: {
    color: '#fc4c02',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  button: { width: '100%' },
  logoutWrap: {
    marginTop: 16,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  note: {
    marginTop: 16,
    color: '#6a7282',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
