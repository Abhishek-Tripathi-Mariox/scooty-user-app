import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import ArrowRight from '../assets/splash/arrow-right.svg';
import ScootyIcon from '../assets/splash/scooty-icon.svg';

const HeroArt = require('../assets/splash/hero-art.png');
const ScootyLogo = require('../assets/images/scootylogo.png');

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const LOGO_IN_MS = 800;
const LOGO_TILT_MS = 1100;
const LOGO_SETTLE_MS = 900;
const CAPTION_HOLD_MS = 1100;
const HERO_FADE_MS = 900;

export function SplashScreen() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const captionOpacity = useRef(new Animated.Value(0)).current;
  const logoStageOpacity = useRef(new Animated.Value(1)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: LOGO_IN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 0.7,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: LOGO_TILT_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1.05,
          friction: 5,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: LOGO_SETTLE_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 0.85,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(captionOpacity, {
          toValue: 1,
          duration: LOGO_SETTLE_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(CAPTION_HOLD_MS),
      Animated.parallel([
        Animated.timing(logoStageOpacity, {
          toValue: 0,
          duration: HERO_FADE_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: HERO_FADE_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [
    logoOpacity,
    logoScale,
    logoRotate,
    captionOpacity,
    logoStageOpacity,
    heroOpacity,
  ]);

  const rotate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdebd6" />

      <AppBackground />

      <Animated.View
        style={[StyleSheet.absoluteFillObject, { opacity: heroOpacity }]}
        pointerEvents="none"
      >
        <Svg
          width={SCREEN_W}
          height={SCREEN_H}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        >
          <Defs>
            <SvgLinearGradient id="splashBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#fc8f1b" />
              <Stop offset="50%" stopColor="#ff6d0c" />
              <Stop offset="100%" stopColor="#f3550a" />
            </SvgLinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#splashBg)" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[styles.logoStage, { opacity: logoStageOpacity }]}
        pointerEvents="none"
      >
        <Animated.Image
          source={ScootyLogo}
          style={[
            styles.logo,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }, { rotate }],
            },
          ]}
          resizeMode="contain"
        />
        <Animated.View style={[styles.caption, { opacity: captionOpacity }]}>
          <Text style={styles.captionTitle}>Slydo</Text>
          <Text style={styles.captionSubtitle}>Mobility</Text>
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[styles.heroScene, { opacity: heroOpacity }]}
        pointerEvents="none"
      >
        <View style={styles.heroWrap}>
          <Image source={HeroArt} style={styles.heroImage} resizeMode="contain" />
        </View>

        <View style={styles.bottomBlock}>
          <Text style={styles.heading}>
            <Text style={styles.headingRegular}>Lets choose your </Text>
            <Text style={styles.headingBold}>fav Scooty</Text>
            <Text style={styles.headingRegular}> with </Text>
            <Text style={styles.headingAccent}>Slydo</Text>
          </Text>

          <Text style={styles.subtitle}>
            Vestibulum tempus imperdiet sem ac porttitor. Vivamus pulvinar
          </Text>

          <View style={styles.cta}>
            <View style={styles.ctaIconCircle}>
              <ScootyIcon width={42} height={36} />
            </View>
            <View style={styles.ctaTextRow}>
              <Text style={styles.ctaText}>Swipe to get started</Text>
              <ArrowRight width={24} height={24} />
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fdebd6',
  },
  logoStage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  caption: {
    marginTop: 32,
    alignItems: 'center',
  },
  captionTitle: {
    color: '#0f172a',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  captionSubtitle: {
    marginTop: 4,
    color: 'rgba(15,23,42,0.7)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroScene: {
    ...StyleSheet.absoluteFillObject,
  },
  heroWrap: {
    position: 'absolute',
    top: SCREEN_H * 0.18,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  heroImage: {
    width: SCREEN_W * 0.85,
    height: SCREEN_H * 0.42,
  },
  bottomBlock: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 56,
  },
  heading: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 46,
    marginBottom: 16,
  },
  headingRegular: {
    fontWeight: '400',
  },
  headingBold: {
    fontWeight: '800',
  },
  headingAccent: {
    fontWeight: '800',
    color: '#ffe8d5',
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 28,
  },
  cta: {
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  ctaIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fc8c1a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 9.5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  ctaTextRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
});
