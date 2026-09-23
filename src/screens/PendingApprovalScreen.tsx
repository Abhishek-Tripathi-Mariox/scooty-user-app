import { Image, Pressable, Text, View } from 'react-native';
import { GradientButton } from '../components/GradientButton';
import { KycFrame } from '../components/KycFrame';
import { ClockIcon } from '../components/RideIcons';
import { FONTS } from '../constants/fonts';
import { useStyles } from '../utils/responsiveStyles';

const HeroArt = require('../assets/images/registration-pending-hero.png');

// Figma 477-14401 "Registration Pending Approval" (same UI as the owner app):
// KYC header without a progress bar, "Thank You, <name>", the clipboard
// illustration, two grey paragraphs, the estimated-time card with the UNDER
// REVIEW pill, the gradient "Waiting for Approval" button and a closing note.
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
  const styles = useStyles(RAW_STYLES);
  const isRejected = status === 'REJECTED';
  const reasonText = rejectionReason?.trim();
  const heading = isRejected ? 'KYC Rejected' : `Thank You, ${userName}`;

  return (
    <KycFrame title="Registration Pending Approval">
      <View style={styles.content}>
        <Text style={styles.heading} numberOfLines={1}>
          {heading}
        </Text>

        <Image source={HeroArt} style={styles.hero} resizeMode="contain" />

        <Text style={styles.body}>
          {isRejected ? (
            'Your KYC request was not approved yet.'
          ) : (
            <>
              Your <Text style={styles.bodyStrong}>documents</Text>
              {'\n'}have been successfully submitted.
            </>
          )}
        </Text>

        <Text style={styles.subBody}>
          {isRejected
            ? 'Please update the missing or incorrect documents and submit again.'
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
          <ClockIcon size={15} color="#464646" />
          <View style={styles.etaTextWrap}>
            <Text style={styles.etaText}>Estimated verification time:</Text>
            <Text style={styles.etaText}>
              {isRejected ? 'Please update the missing details' : 'Within 24 hours'}
            </Text>
          </View>
          <View style={styles.etaPill}>
            <Text style={styles.etaPillText} numberOfLines={1}>
              {isRejected ? 'ACTION NEEDED' : 'UNDER REVIEW'}
            </Text>
          </View>
        </View>

        <GradientButton
          label={isRejected ? 'Update KYC' : 'Waiting for Approval'}
          onPress={isRejected ? onRetryKyc || (() => undefined) : () => undefined}
          style={styles.button}
          height={48}
          radius={14}
        />

        <Text style={styles.note}>
          Once approved, you&apos;ll receive a notification and{'\n'}can start booking rides.
        </Text>

        {onLogout ? (
          <Pressable onPress={onLogout} hitSlop={10} style={styles.logoutWrap}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        ) : null}
      </View>
    </KycFrame>
  );
}

const RAW_STYLES = {
  content: {
    flex: 1,
    alignItems: 'center',
  },
  heading: {
    color: '#353535',
    fontFamily: FONTS.semiBold,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 28,
    textAlign: 'center',
  },
  hero: {
    width: 252,
    height: 205,
    marginTop: 34,
  },
  body: {
    marginTop: 44,
    color: '#797878',
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  bodyStrong: {
    color: '#4b4b4b',
    fontFamily: FONTS.semiBold,
    fontWeight: '600',
  },
  subBody: {
    marginTop: 21,
    color: '#797878',
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  reasonCard: {
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252,76,2,0.18)',
    backgroundColor: 'rgba(252,76,2,0.06)',
  },
  reasonLabel: {
    color: '#6b7280',
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  reasonText: {
    color: '#353535',
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  // 370px wide in the 390px frame: bleeds 14px past the panel's 24px padding.
  etaCard: {
    marginTop: 32,
    alignSelf: 'stretch',
    marginHorizontal: -14,
    minHeight: 70,
    paddingLeft: 14,
    paddingRight: 11,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
    backgroundColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  etaTextWrap: {
    flex: 1,
  },
  etaText: {
    color: '#464646',
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 23,
  },
  etaPill: {
    minWidth: 113,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(252,76,2,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaPillText: {
    color: '#4b4b4b',
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 28,
    textAlign: 'center',
  },
  button: {
    marginTop: 35,
    width: '100%',
  },
  note: {
    marginTop: 11,
    color: '#797878',
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 28,
    textAlign: 'center',
  },
  logoutWrap: {
    marginTop: 12,
    paddingVertical: 6,
  },
  logoutText: {
    color: '#dc2626',
    fontFamily: FONTS.medium,
    fontSize: 14,
    fontWeight: '500',
  },
} as const;
