import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { GradientButton } from './GradientButton';
import { FONTS } from '../constants/fonts';
import { useBottomInset } from '../utils/insets';
import { useStyles } from '../utils/responsiveStyles';

// Figma 477-14493 "Registration Pending Approval p": once the admin approves,
// a bottom sheet slides over the dimmed pending screen with the check badge,
// "Account Activated! 🎉" and a "Go to Dashboard" button. Rendered as an
// absolute overlay on top of the pending screen. Same as the owner app.
export function AccountActivatedSheet({
  message,
  onGoToDashboard,
}: {
  message: string;
  onGoToDashboard: () => void;
}) {
  const styles = useStyles(RAW_STYLES);
  const bottomInset = useBottomInset();
  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Figma: backdrop-blur(5px) + 20% black over the pending screen */}
      <BlurView
        style={StyleSheet.absoluteFillObject}
        blurType="light"
        blurAmount={5}
        reducedTransparencyFallbackColor="#f3e6e0"
      />
      <View style={styles.dim} />
      <View style={[styles.sheet, { paddingBottom: 24 + bottomInset }]}>
        <View style={styles.badge}>
          <Svg width={144} height={144} viewBox="0 0 144 144" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <LinearGradient id="activatedBadge" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#fc4c02" />
                <Stop offset="100%" stopColor="#ff7a45" />
              </LinearGradient>
            </Defs>
            <Circle cx={72} cy={72} r={72} fill="url(#activatedBadge)" />
          </Svg>
          {/* lucide "circle-check-big": open arc + check, white */}
          <Svg width={96} height={96} viewBox="0 0 24 24" fill="none">
            <Path
              d="M21.801 10A10 10 0 1 1 17 3.335"
              stroke="#ffffff"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="m9 11 3 3L22 4"
              stroke="#ffffff"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.heading}>Account Activated! 🎉</Text>
          <Text style={styles.body}>Your account has been successfully activated.</Text>
          <Text style={styles.subBody}>{message}</Text>
        </View>

        <GradientButton
          label="Go to Dashboard"
          onPress={onGoToDashboard}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          height={56}
          radius={14}
        />
      </View>
    </View>
  );
}

const RAW_STYLES = {
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 10,
    elevation: 10,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  sheet: {
    backgroundColor: 'rgba(255,255,255,0.91)',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
    gap: 32,
  },
  badge: {
    width: 144,
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  heading: {
    color: '#1e293b',
    fontFamily: FONTS.semiBold,
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 36,
    textAlign: 'center',
  },
  body: {
    maxWidth: 323,
    color: '#6a7282',
    fontFamily: FONTS.regular,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
  },
  subBody: {
    maxWidth: 310,
    color: '#6a7282',
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 7.5,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  buttonLabel: {
    fontSize: 18,
    lineHeight: 28,
  },
} as const;
