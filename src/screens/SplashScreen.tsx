import { memo, useEffect, useMemo, useRef, useState } from 'react';
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
import { useBottomInset } from '../utils/insets';
import { STATUS_TOP_INSET } from '../utils/statusBarInset';
import ArrowRight from '../assets/splash/arrow-right.svg';
import ScootyIcon from '../assets/splash/scooty-icon.svg';

const HeroArt = require('../assets/splash/hero-art.png');
const SlydoLogo = require('../assets/splash/slydo-logo-upright.png');

// Splash flow (based on the Figma frames 8851-1157 … 8851-1181, adjusted per
// client feedback): logo slides in → rotates into a big diamond and rests →
// rotates back while shrinking small → logo grows back out of it with the name
// sliding out beside it → logo zooms into the orange onboarding screen.
// The logo is the transparent brand mark, not the rounded-square icon.
const T_BLANK_MS = 450;
const T_LOGO_IN_MS = 280;
const T_LOGO_HOLD_MS = 750;
const T_DIAMOND_MS = 600; // eased rotation into the diamond …
const T_DIAMOND_HOLD_MS = 550; // … then it rests
const T_SHRINK_MS = 380; // rotates back while shrinking to a tiny mark
const T_SMALL_HOLD_MS = 140;
const T_LOCKUP_IN_MS = 480; // logo grows back out of the tiny mark, name slides out beside it
const T_LOCKUP_HOLD_MS = 850;
const T_ZOOM_OUT_MS = 700; // slow bloom into the orange screen
// How big the logo gets while it rotates into the diamond (relative to 100px).
const DIAMOND_SCALE = 1.7;
// How small the mark gets between the diamond and the lockup (relative to 100px).
const SMALL_SCALE = 0.025;
const T_HERO_IN_MS = 480;
// Base size of the orange square that blooms out of the logo (it is scaled up).
const BLOOM_BASE = 200;

// Memoised: App re-renders while the session is restored must not re-render the
// splash mid-animation (that re-renders the SVG backdrop + hero and stalls steps).
export const SplashScreen = memo(function SplashScreen({
  onGetStarted,
}: {
  onGetStarted?: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const bottomInset = useBottomInset();

  const [textWidth, setTextWidth] = useState(0);
  const styles = useMemo(() => makeStyles(width, height), [width, height]);

  const logoRef = useRef<Image>(null);
  const heroRef = useRef<Image>(null);

  // Logo intro
  const stageOpacity = useRef(new Animated.Value(0)).current; // logo + name group
  const stageTranslateY = useRef(new Animated.Value(height * 0.12)).current; // slides up on entry
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoRotate = useRef(new Animated.Value(0)).current; // 0 = upright, 1 = 45° diamond
  // Final morph: the logo travels to where the hero mark sits
  const logoMorphX = useRef(new Animated.Value(0)).current;
  const logoMorphY = useRef(new Animated.Value(0)).current;
  // 1 = the logo alone sits at the screen centre, 0 = logo + name centred together
  const lockupShift = useRef(new Animated.Value(1)).current;
  // Name reveal (0 = tucked behind the logo, 1 = wiped out to the right)
  const reveal = useRef(new Animated.Value(0)).current;
  // Onboarding: the orange backdrop blooms out of the logo, then the content dissolves in
  const bloomX = useRef(new Animated.Value(0)).current;
  const bloomY = useRef(new Animated.Value(0)).current;
  const bloomScale = useRef(new Animated.Value(0.001)).current;
  const bloomOpacity = useRef(new Animated.Value(0)).current;
  // Name fades out fast at the start of the final morph (Figma drops it at once)
  const nameOpacity = useRef(new Animated.Value(1)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const measure = (ref: React.RefObject<Image | null>) =>
      new Promise<{ cx: number; cy: number; w: number }>((resolve) => {
        const node = ref.current;
        if (!node) {
          resolve({ cx: width / 2, cy: height / 2, w: 0 });
          return;
        }
        node.measureInWindow((x, y, w, h) => resolve({ cx: x + w / 2, cy: y + h / 2, w }));
      });

    // Splash6 is built lazily so it can use the real on-screen positions: the
    // orange square grows out of the logo and the logo grows into the hero
    // mark, exactly like the Figma prototype.
    const morphIntoOnboarding: Animated.CompositeAnimation = {
      start: (cb) => {
        void Promise.all([measure(logoRef), measure(heroRef)]).then(([logo, hero]) => {
          const diagonal = Math.hypot(width, height);
          bloomX.setValue(logo.cx);
          bloomY.setValue(logo.cy);
          bloomScale.setValue(Math.max(0.001, (logo.w || 1) * 1.15) / BLOOM_BASE);
          const timing = (value: Animated.Value, toValue: number, extra: Partial<Animated.TimingAnimationConfig> = {}) =>
            Animated.timing(value, {
              toValue,
              duration: T_ZOOM_OUT_MS,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: true,
              ...extra,
            });
          Animated.parallel([
            timing(bloomOpacity, 1, { duration: 120, easing: Easing.out(Easing.quad) }),
            timing(nameOpacity, 0, { duration: 160, easing: Easing.out(Easing.quad) }),
            timing(bloomScale, (diagonal * 2.2) / BLOOM_BASE),
            timing(logoMorphX, hero.cx - logo.cx),
            timing(logoMorphY, hero.cy - logo.cy),
            timing(logoScale, hero.w && logo.w ? hero.w / logo.w : 4),
            timing(stageOpacity, 0, { duration: 200, easing: Easing.out(Easing.quad) }),
            timing(heroOpacity, 1, { duration: T_HERO_IN_MS, delay: 160, easing: Easing.out(Easing.cubic) }),
          ]).start(cb);
        });
      },
      stop: () => {},
      reset: () => {},
    };

    Animated.sequence([
      // Splash1 — blank backdrop
      Animated.delay(T_BLANK_MS),

      // Splash2 — logo slides up from below while fading in, then holds
      Animated.parallel([
        Animated.timing(stageOpacity, {
          toValue: 1,
          duration: T_LOGO_IN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(stageTranslateY, {
          toValue: 0,
          duration: T_LOGO_IN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: T_LOGO_IN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(T_LOGO_HOLD_MS),

      // Splash3 — rotate 45° while growing into the big diamond (slow, eased
      // so it glides to a stop), then rest
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: DIAMOND_SCALE,
          duration: T_DIAMOND_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: T_DIAMOND_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(T_DIAMOND_HOLD_MS),

      // Splash4 — the diamond rotates back upright while shrinking to a point,
      // and the point drifts left to where the logo will sit in the lockup
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: SMALL_SCALE,
          duration: T_SHRINK_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: T_SHRINK_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(lockupShift, {
          toValue: 0,
          duration: T_SHRINK_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(T_SMALL_HOLD_MS),

      // Splash5 — the icon and the name both come out of that point: the logo
      // grows in place while "Slydo / Mobility" scales out beside it, then holds
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: T_LOCKUP_IN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(reveal, {
          toValue: 1,
          duration: T_LOCKUP_IN_MS + 80,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(T_LOCKUP_HOLD_MS),

      // Splash6 — orange square blooms out of the logo, logo becomes the hero mark
      morphIntoOnboarding,
    ]).start(({ finished }) => {
      if (finished) setHeroReady(true);
    });
  }, [
    width,
    height,
    stageOpacity,
    stageTranslateY,
    logoScale,
    logoRotate,
    logoMorphX,
    logoMorphY,
    lockupShift,
    reveal,
    bloomX,
    bloomY,
    bloomScale,
    bloomOpacity,
    nameOpacity,
    heroOpacity,
  ]);

  // While the logo is alone it sits at the screen centre; once the lockup
  // forms, the whole logo + name group is centred together.
  const gap = styles.lockup.gap as number;
  const shift = (gap + textWidth) / 2;
  const lockupTranslateX = lockupShift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, shift],
  });
  // Name is tucked fully behind the logo, then wipes out to the right —
  // so "Slydo Mobility" appears to emerge from the logo itself.
  const textTranslateX = reveal.interpolate({
    inputRange: [0, 1],
    outputRange: [-(textWidth + 24), 0],
  });
  // Name scales out of the point together with the logo, then settles at full size.
  const textScale = reveal.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });
  const logoRotateDeg = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.root}>
      <StatusBar translucent barStyle="dark-content" backgroundColor="transparent" />

      <SplashBackground width={width} height={height} />

      {/* Splash6 backdrop: an orange rounded square that grows out of the logo */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.bloom,
          {
            opacity: bloomOpacity,
            transform: [{ translateX: bloomX }, { translateY: bloomY }, { scale: bloomScale }],
          },
        ]}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <SvgLinearGradient id="splashBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#fc8f1b" />
              <Stop offset="50%" stopColor="#ff6d0c" />
              <Stop offset="100%" stopColor="#f3510a" />
            </SvgLinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#splashBg)" />
        </Svg>
      </Animated.View>

      {/* Splash2–5: logo intro → diamond → collapse → lockup reveal */}
      <View style={styles.centerStage} pointerEvents="none">
        <Animated.View
          style={[
            styles.lockup,
            {
              opacity: stageOpacity,
              transform: [{ translateX: lockupTranslateX }, { translateY: stageTranslateY }],
            },
          ]}
        >
          <Animated.Image
            ref={logoRef}
            source={SlydoLogo}
            style={[
              styles.logo,
              {
                transform: [
                  { translateX: logoMorphX },
                  { translateY: logoMorphY },
                  { scale: logoScale },
                  { rotate: logoRotateDeg },
                ],
              },
            ]}
            resizeMode="contain"
          />
          <View style={styles.textClip}>
            <Animated.View
              onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
              style={[
                styles.textWrap,
                {
                  opacity: Animated.multiply(reveal, nameOpacity),
                  transform: [{ translateX: textTranslateX }, { scale: textScale }],
                },
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

      {/* Splash6 content: hero mark + copy + swipe, dissolves in over the bloom */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { opacity: heroOpacity }]}
        pointerEvents={heroReady ? 'box-none' : 'none'}
      >
        <SafeAreaView style={styles.heroSafe}>
          <View style={styles.heroWrap}>
            <Image ref={heroRef} source={HeroArt} style={styles.heroImage} resizeMode="contain" />
          </View>

          <View style={[styles.bottomBlock, { paddingBottom: (styles.bottomBlock.paddingBottom as number) + bottomInset }]}>
            <Text style={styles.heading} adjustsFontSizeToFit numberOfLines={4}>
              <Text style={styles.headingRegular}>Lets choose your </Text>
              <Text style={styles.headingBold}>fav Scooty</Text>
              <Text style={styles.headingRegular}> with </Text>
              <Text style={styles.headingAccent}>Slydo</Text>
            </Text>

            <Text style={styles.heroSubtitle} numberOfLines={2}>
              Pick a scooty near you, book your slot, and ride in minutes.
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
});

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
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
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
  const logoSize = Math.min(width * 0.235, 100);
  const titleSize = Math.min(width * 0.13, 56);
  const subtitleSize = Math.min(width * 0.04, 17);
  const heroSize = Math.min(width * 0.96, height * 0.42);
  const ctaHeight = Math.min(width * 0.17, 70);
  const ctaPad = 4;

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: '#fdebd6',
      // Stretch the splash artwork up underneath the transparent status bar
      // (the Root wrapper pads all content below it) so the scene fills the
      // entire screen edge-to-edge.
      marginTop: -STATUS_TOP_INSET,
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
      fontFamily: FONTS.brand,
      fontSize: titleSize,
      fontWeight: 'normal',
      letterSpacing: 0.2,
      lineHeight: titleSize * 1.08,
    },
    subtitle: {
      marginTop: 2,
      marginLeft: 2,
      color: 'rgba(31,37,51,0.62)',
      fontFamily: FONTS.brand,
      fontSize: subtitleSize,
      fontWeight: 'normal',
      letterSpacing: 1.6,
    },
    bloom: {
      position: 'absolute',
      left: -BLOOM_BASE / 2,
      top: -BLOOM_BASE / 2,
      width: BLOOM_BASE,
      height: BLOOM_BASE,
      borderRadius: BLOOM_BASE * 0.22,
      overflow: 'hidden',
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
      fontSize: isShort ? 28 : 37,
      lineHeight: isShort ? 38 : 50,
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
      fontSize: isShort ? 16 : 20,
      lineHeight: isShort ? 24 : 30,
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
