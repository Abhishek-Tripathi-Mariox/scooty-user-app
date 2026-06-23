import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { FONTS } from '../constants/fonts';
import ArrowRight from '../assets/splash/arrow-right.svg';
import ScootyIcon from '../assets/splash/scooty-icon.svg';

const HeroArt = require('../assets/splash/hero-art.png');
const SlydoLogo = require('../assets/splash/slydo-logo-upright.png');

// Matches the four Figma splash frames in order:
// Screen 1 (877): small upright logo fades + scales in
// Screen 2 (879): logo zooms in and rotates 45°
// Screen 3 (881): logo rotates back upright and shrinks (back to screen 1)
// Screen 4 (887): logo grows back and "Slydo / Mobility" emerges from the logo, holds,
//                 then the name hides back into the logo
// Screen 5: logo zooms up + smooth fade → onboarding
const PHASE_0_BLANK_MS = 250;
const PHASE_1_LOGO_IN_MS = 800;
const PHASE_2_DIAMOND_MS = 800;
const PHASE_3_UPRIGHT_MS = 700;
const PHASE_4_REVEAL_MS = 700;
const PHASE_4_HOLD_MS = 900;
const PHASE_4_RETRACT_MS = 500;
const PHASE_5_FADE_OUT_MS = 850;
const PHASE_5_HERO_IN_MS = 900;

export function SplashScreen({ onGetStarted }: { onGetStarted?: () => void }) {
  const { width, height } = useWindowDimensions();

  const [textWidth, setTextWidth] = useState(0);
  const styles = useMemo(() => makeStyles(width, height), [width, height]);

  // Logo intro
  const stageOpacity = useRef(new Animated.Value(0)).current; // logo + name group
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoRotate = useRef(new Animated.Value(0)).current; // 0 = upright, 1 = 45° diamond
  // Name reveal (0 = hidden, 1 = revealed)
  const reveal = useRef(new Animated.Value(0)).current;
  // Onboarding hero
  const heroOpacity = useRef(new Animated.Value(0)).current;
  // Barely-there settle so the onboarding dissolves in smoothly, not a pop.
  const heroScale = useRef(new Animated.Value(1.05)).current;
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(PHASE_0_BLANK_MS),

      // Screen 1 — small upright logo fades + scales in
      Animated.parallel([
        Animated.timing(stageOpacity, {
          toValue: 1,
          duration: PHASE_1_LOGO_IN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.65,
          duration: PHASE_1_LOGO_IN_MS,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
      ]),

      // Screen 2 — zoom in + rotate 45°
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: PHASE_2_DIAMOND_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: PHASE_2_DIAMOND_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // Screen 3 — rotate back upright and shrink
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.65,
          duration: PHASE_3_UPRIGHT_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: PHASE_3_UPRIGHT_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // Screen 4 — logo grows back and the name emerges from the logo
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: PHASE_4_REVEAL_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(reveal, {
          toValue: 1,
          duration: PHASE_4_REVEAL_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // Screen 4 — hold the full lockup
      Animated.delay(PHASE_4_HOLD_MS),

      // Name hides back into the logo
      Animated.timing(reveal, {
        toValue: 0,
        duration: PHASE_4_RETRACT_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),

      // Screen 5 — the logo zooms up toward the viewer and fades, and the
      // onboarding scene appears through that zoom. The fades overlap the zoom
      // window (no gap) so the reveal stays smooth.
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 2.8,
          duration: PHASE_5_FADE_OUT_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(stageOpacity, {
          toValue: 0,
          duration: PHASE_5_FADE_OUT_MS,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: PHASE_5_HERO_IN_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(heroScale, {
          toValue: 1,
          duration: PHASE_5_HERO_IN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) setHeroReady(true);
    });
  }, [stageOpacity, logoScale, logoRotate, reveal, heroOpacity, heroScale]);

  // Keep the logo optically centered until the name appears, then shift the
  // whole lockup left so logo + text sit centered together.
  const gap = styles.lockup.gap as number;
  const shift = (gap + textWidth) / 2;
  const lockupTranslateX = reveal.interpolate({
    inputRange: [0, 1],
    outputRange: [shift, 0],
  });
  // Name is tucked fully behind the logo, then wipes out to the right —
  // so "Slydo Mobility" appears to emerge from the logo itself.
  const textTranslateX = reveal.interpolate({
    inputRange: [0, 1],
    outputRange: [-(textWidth + 24), 0],
  });
  const logoRotateDeg = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdebd6" />

      <SplashBackground width={width} height={height} />

      {/* Screens 1–4: logo intro → name reveal lockup */}
      <View style={styles.centerStage} pointerEvents="none">
        <Animated.View
          style={[
            styles.lockup,
            { opacity: stageOpacity, transform: [{ translateX: lockupTranslateX }] },
          ]}
        >
          <Animated.Image
            source={SlydoLogo}
            style={[
              styles.logo,
              { transform: [{ scale: logoScale }, { rotate: logoRotateDeg }] },
            ]}
            resizeMode="contain"
          />
          <View style={styles.textClip}>
            <Animated.View
              onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
              style={[
                styles.textWrap,
                { opacity: reveal, transform: [{ translateX: textTranslateX }] },
              ]}
            >
              <Text style={styles.title} numberOfLines={1}>
                Slydo
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                Mobility
              </Text>
            </Animated.View>
          </View>
        </Animated.View>
      </View>

      {/* Screen 5: onboarding scene — rendered last so it sits on top */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: heroOpacity, transform: [{ scale: heroScale }] },
        ]}
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
            <Text style={styles.heading} adjustsFontSizeToFit numberOfLines={4}>
              <Text style={styles.headingRegular}>Turn your </Text>
              <Text style={styles.headingBold}>scooties</Text>
              <Text style={styles.headingRegular}> into a profitable business with </Text>
              <Text style={styles.headingAccent}>Slydo</Text>
            </Text>

            <Text style={styles.heroSubtitle} numberOfLines={2}>
              List your vehicles, monitor performance, and earn from every ride.
            </Text>

            <SwipeToStart
              enabled={heroReady}
              onComplete={onGetStarted}
              height={styles.cta.height}
              pad={styles.cta.padding}
            />
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

// Slide-to-start control — drag the orange thumb to the end to continue.
function SwipeToStart({
  enabled,
  onComplete,
  height,
  pad,
}: {
  enabled: boolean;
  onComplete?: () => void;
  height: number;
  pad: number;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const completedRef = useRef(false);

  const thumbSize = height - pad * 2;
  const maxX = Math.max(0, trackWidth - pad * 2 - thumbSize);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: (_e, g) => enabled && Math.abs(g.dx) > 4,
        onPanResponderMove: (_e, g) => {
          translateX.setValue(Math.min(Math.max(0, g.dx), maxX));
        },
        onPanResponderRelease: (_e, g) => {
          const x = Math.min(Math.max(0, g.dx), maxX);
          if (maxX > 0 && x >= maxX * 0.6) {
            Animated.timing(translateX, {
              toValue: maxX,
              duration: 130,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false,
            }).start(() => {
              if (!completedRef.current) {
                completedRef.current = true;
                onComplete?.();
              }
            });
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              friction: 6,
              tension: 80,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [enabled, maxX, onComplete, translateX],
  );

  const labelOpacity = translateX.interpolate({
    inputRange: [0, Math.max(1, maxX * 0.55)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[sliderStyles.track, { height, borderRadius: height / 2, padding: pad }]}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[sliderStyles.labelRow, { opacity: labelOpacity }]}
        pointerEvents="none"
      >
        <Text style={sliderStyles.label} numberOfLines={1}>
          Swipe to get started
        </Text>
        <ArrowRight width={24} height={24} />
      </Animated.View>

      <Animated.View
        {...pan.panHandlers}
        style={[
          sliderStyles.thumb,
          {
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            left: pad,
            top: pad,
            transform: [{ translateX }],
          },
        ]}
      >
        <ScootyIcon width={thumbSize * 0.66} height={thumbSize * 0.56} />
      </Animated.View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  labelRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '500',
    fontFamily: FONTS.medium,
  },
  thumb: {
    position: 'absolute',
    backgroundColor: '#fc8c1a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 9.5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});

// Soft, blurred pink + blue gradient — matches the Figma splash backdrop.
function SplashBackground({ width, height }: { width: number; height: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <RadialGradient
            id="peach"
            cx={width * 0.78}
            cy={height * 0.16}
            r={width * 0.95}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#ffe6c4" stopOpacity={1} />
            <Stop offset="100%" stopColor="#ffe6c4" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient
            id="pink"
            cx={width * 0.06}
            cy={height * 0.46}
            r={width * 0.9}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#f8c4ce" stopOpacity={0.95} />
            <Stop offset="100%" stopColor="#f8c4ce" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient
            id="blue"
            cx={width * 0.55}
            cy={height * 1.02}
            r={width * 1.05}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#cdd8f1" stopOpacity={0.95} />
            <Stop offset="100%" stopColor="#cdd8f1" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="#fdecdb" />
        <Rect width="100%" height="100%" fill="url(#peach)" />
        <Rect width="100%" height="100%" fill="url(#pink)" />
        <Rect width="100%" height="100%" fill="url(#blue)" />
      </Svg>
    </View>
  );
}

function makeStyles(width: number, height: number) {
  const isShort = height < 700;
  const logoSize = Math.min(width * 0.16, 66);
  const titleSize = Math.min(width * 0.12, 46);
  const subtitleSize = Math.min(width * 0.037, 15);
  const heroSize = Math.min(width * 0.82, height * 0.38);
  const ctaHeight = Math.min(width * 0.17, 70);
  const ctaPad = 4;

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
    lockup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 20,
    },
    logo: {
      width: logoSize,
      height: logoSize,
      zIndex: 2,
    },
    // Sits just behind the logo's right edge and clips the name so it appears
    // to slide out from inside the logo.
    textClip: {
      marginLeft: -8,
      paddingLeft: 8,
      overflow: 'hidden',
      zIndex: 1,
    },
    textWrap: {
      justifyContent: 'center',
    },
    title: {
      color: '#1f2533',
      fontFamily: FONTS.bold,
      fontSize: titleSize,
      fontWeight: '700',
      letterSpacing: 0.2,
      lineHeight: titleSize * 1.08,
    },
    subtitle: {
      marginTop: 2,
      marginLeft: 2,
      color: 'rgba(31,37,51,0.62)',
      fontFamily: FONTS.medium,
      fontSize: subtitleSize,
      fontWeight: '500',
      letterSpacing: 1.6,
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
      paddingHorizontal: 22,
      paddingBottom: Platform.OS === 'android' ? 32 : 20,
    },
    heading: {
      color: '#ffffff',
      fontSize: isShort ? 28 : 34,
      lineHeight: isShort ? 38 : 46,
      marginBottom: 12,
      fontFamily: FONTS.regular,
    },
    headingRegular: {
      fontWeight: '400',
    },
    headingBold: {
      fontWeight: '800',
      fontFamily: FONTS.bold,
    },
    headingAccent: {
      fontWeight: '800',
      fontFamily: FONTS.bold,
      color: '#ffe8d5',
    },
    heroSubtitle: {
      color: '#ffffff',
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 20,
      fontFamily: FONTS.regular,
    },
    // Provides the slider track's height + inner padding (thumb inset).
    cta: {
      height: ctaHeight,
      padding: ctaPad,
    },
  });
}
