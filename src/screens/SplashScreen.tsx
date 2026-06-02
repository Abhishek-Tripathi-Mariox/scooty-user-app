import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { scaleFont, scaleSize } from '../utils/responsive';
import ArrowRight from '../assets/splash/arrow-right.svg';
import ScootyIcon from '../assets/splash/scooty-icon.svg';

const HeroArt = require('../assets/splash/hero-art.png');
const ScootyLogo = require('../assets/splash/slydo-logo-upright.png');

const PHASE_1_BLANK_MS = 400;
const PHASE_2_LOGO_IN_MS = 700;
const PHASE_2_HOLD_MS = 250;
const PHASE_3_TILT_MS = 800;
const PHASE_3_HOLD_MS = 400;
const PHASE_3_FADE_OUT_MS = 500;
const PHASE_4_BLANK_MS = 350;
const PHASE_5_TEXT_IN_MS = 700;
const PHASE_5_HOLD_MS = 700;
const PHASE_6_FADE_MS = 800;

export function SplashScreen({ onGetStarted }: { onGetStarted?: () => void }) {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(width, height), [width, height]);

  const introOpacity = useRef(new Animated.Value(0)).current;
  const introScale = useRef(new Animated.Value(0.4)).current;
  const introRotate = useRef(new Animated.Value(0)).current;
  const slydoOpacity = useRef(new Animated.Value(0)).current;
  const slydoScale = useRef(new Animated.Value(0.85)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(PHASE_1_BLANK_MS),
      Animated.parallel([
        Animated.timing(introOpacity, {
          toValue: 1,
          duration: PHASE_2_LOGO_IN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(introScale, {
          toValue: 0.55,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(PHASE_2_HOLD_MS),
      Animated.parallel([
        Animated.timing(introRotate, {
          toValue: 1,
          duration: PHASE_3_TILT_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(introScale, {
          toValue: 0.95,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(PHASE_3_HOLD_MS),
      Animated.timing(introOpacity, {
        toValue: 0,
        duration: PHASE_3_FADE_OUT_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(PHASE_4_BLANK_MS),
      Animated.parallel([
        Animated.timing(slydoOpacity, {
          toValue: 1,
          duration: PHASE_5_TEXT_IN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(slydoScale, {
          toValue: 1,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(PHASE_5_HOLD_MS),
      Animated.timing(slydoOpacity, {
        toValue: 0,
        duration: PHASE_6_FADE_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(150),
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: PHASE_6_FADE_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setHeroReady(true);
    });
  }, [introOpacity, introScale, introRotate, slydoOpacity, slydoScale, heroOpacity]);

  const introRotateDeg = introRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdebd6" />

      <AppBackground />

      <Animated.View
        style={[StyleSheet.absoluteFillObject, { opacity: heroOpacity }]}
        pointerEvents={heroReady ? 'box-none' : 'none'}
      >
        <Svg
          width={width}
          height={height}
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

        <SafeAreaView style={styles.heroSafe}>
          <View style={styles.heroWrap}>
            <Image source={HeroArt} style={styles.heroImage} resizeMode="contain" />
          </View>

          <View style={styles.bottomBlock}>
            <Text style={styles.heading} adjustsFontSizeToFit numberOfLines={3}>
              <Text style={styles.headingRegular}>Lets choose your </Text>
              <Text style={styles.headingBold}>fav Scooty</Text>
              <Text style={styles.headingRegular}> with </Text>
              <Text style={styles.headingAccent}>Slydo</Text>
            </Text>

            <Text style={styles.subtitle} numberOfLines={2}>
              Vestibulum tempus imperdiet sem ac porttitor. Vivamus pulvinar
            </Text>

            <Pressable
              style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
              onPress={heroReady ? onGetStarted : undefined}
              disabled={!heroReady}
            >
              <View style={styles.ctaIconCircle}>
                <ScootyIcon
                  width={styles.ctaIconCircle.width * 0.66}
                  height={styles.ctaIconCircle.height * 0.56}
                />
              </View>
              <View style={styles.ctaTextRow}>
                <Text style={styles.ctaText} numberOfLines={1}>
                  Swipe to get started
                </Text>
                <ArrowRight width={scaleSize(24, width)} height={scaleSize(24, width)} />
              </View>
            </Pressable>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.View
        style={[styles.centerStage, { opacity: introOpacity }]}
        pointerEvents="none"
      >
        <Animated.Image
          source={ScootyLogo}
          style={[
            styles.introLogo,
            { transform: [{ scale: introScale }, { rotate: introRotateDeg }] },
          ]}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.centerStage,
          { opacity: slydoOpacity, transform: [{ scale: slydoScale }] },
        ]}
        pointerEvents="none"
      >
        <View style={styles.slydoRow}>
          <Image source={ScootyLogo} style={styles.slydoLogo} resizeMode="contain" />
          <View style={styles.slydoTextWrap}>
            <Text style={styles.slydoTitle} numberOfLines={1}>
              Slydo
            </Text>
            <Text style={styles.slydoSubtitle} numberOfLines={1}>
              Mobility
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function makeStyles(width: number, height: number) {
  const isShort = height < 700;
  const heroSize = Math.min(width * 0.82, height * 0.38);
  const introLogoSize = Math.min(width * 0.55, height * 0.3);
  const slydoLogoSize = Math.min(width * 0.22, 100);
  const ctaHeight = scaleSize(70, width);
  const ctaPad = scaleSize(4, width);
  const ctaIconSize = ctaHeight - ctaPad * 2;

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: '#fdebd6',
    },
    centerStage: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    introLogo: {
      width: introLogoSize,
      height: introLogoSize,
    },
    slydoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scaleSize(14, width),
      paddingHorizontal: scaleSize(20, width),
    },
    slydoLogo: {
      width: slydoLogoSize,
      height: slydoLogoSize,
    },
    slydoTextWrap: {
      justifyContent: 'center',
    },
    slydoTitle: {
      color: '#0f172a',
      fontSize: scaleFont(38, width),
      fontWeight: '800',
      letterSpacing: 0.2,
      lineHeight: scaleFont(44, width),
    },
    slydoSubtitle: {
      marginTop: 2,
      color: 'rgba(15,23,42,0.55)',
      fontSize: scaleFont(13, width),
      fontWeight: '600',
      letterSpacing: 1.8,
      textTransform: 'uppercase',
    },
    heroSafe: {
      flex: 1,
    },
    heroWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: isShort ? height * 0.04 : height * 0.06,
    },
    heroImage: {
      width: heroSize,
      height: heroSize,
    },
    bottomBlock: {
      paddingHorizontal: scaleSize(22, width),
      paddingBottom: Platform.OS === 'android' ? scaleSize(32, width) : scaleSize(20, width),
    },
    heading: {
      color: '#ffffff',
      fontSize: scaleFont(isShort ? 28 : 34, width),
      lineHeight: scaleFont(isShort ? 38 : 46, width),
      marginBottom: scaleSize(12, width),
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
      fontSize: scaleFont(16, width),
      lineHeight: scaleFont(24, width),
      marginBottom: scaleSize(20, width),
    },
    cta: {
      height: ctaHeight,
      borderRadius: ctaHeight / 2,
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.62)',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: ctaPad,
      overflow: 'hidden',
    },
    ctaPressed: {
      opacity: 0.85,
    },
    ctaIconCircle: {
      width: ctaIconSize,
      height: ctaIconSize,
      borderRadius: ctaIconSize / 2,
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
      gap: scaleSize(8, width),
    },
    ctaText: {
      color: '#ffffff',
      fontSize: scaleFont(17, width),
      fontWeight: '500',
    },
  });
}
