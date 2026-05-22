import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';

const ScootyLogo = require('../assets/images/scooty.png');

type SlideKind = 'brand' | 'ride' | 'pay';

type Slide = {
  kind: SlideKind;
  title: string;
  subtitle: string;
};

const SLIDES: Slide[] = [
  {
    kind: 'brand',
    title: 'Slydo Mobility',
    subtitle: 'Smart urban rides, one tap away',
  },
  {
    kind: 'ride',
    title: 'Ride anywhere, anytime',
    subtitle: 'Pick up a scooty from your nearest station',
  },
  {
    kind: 'pay',
    title: 'One-tap payments',
    subtitle: 'Pay from your wallet — quick and effortless',
  },
];

const SLIDE_DURATION = 1200;

export function SplashScreen() {
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(28)).current;
  const scale = useRef(new Animated.Value(0.6)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    slideUp.setValue(28);
    scale.setValue(0.6);
    pulse.setValue(0);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 560,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: index + 1,
      duration: SLIDE_DURATION - 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const t = setTimeout(() => {
      if (index < SLIDES.length - 1) {
        Animated.timing(fade, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start(() => setIndex((i) => i + 1));
      }
    }, SLIDE_DURATION);

    return () => clearTimeout(t);
  }, [index]);

  const slide = SLIDES[index];

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.6],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.45, 0.2, 0],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: fade,
              transform: [{ translateY: slideUp }, { scale }],
            },
          ]}
        >
          <View style={styles.iconWrap}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pulseRing,
                { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
              ]}
            />
            <View style={styles.iconBadge}>
              <SlideIcon kind={slide.kind} />
            </View>
          </View>

          <Animated.Text style={styles.title}>{slide.title}</Animated.Text>
          <Animated.Text style={styles.subtitle}>{slide.subtitle}</Animated.Text>
        </Animated.View>

        <View style={styles.indicatorRow}>
          {SLIDES.map((_, i) => {
            const active = i === index;
            return (
              <View
                key={i}
                style={[styles.indicator, active && styles.indicatorActive]}
              />
            );
          })}
        </View>

        <Text style={styles.footer}>Slydo Mobility</Text>
      </View>
    </SafeAreaView>
  );
}

function SlideIcon({ kind }: { kind: SlideKind }) {
  if (kind === 'brand') {
    return (
      <Image source={ScootyLogo} style={styles.brandImage} resizeMode="contain" />
    );
  }
  if (kind === 'ride') {
    return (
      <Svg width={88} height={88} viewBox="0 0 64 64" fill="none">
        <Defs>
          <SvgLinearGradient id="rideGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#fc4c02" />
            <Stop offset="100%" stopColor="#ff7a45" />
          </SvgLinearGradient>
        </Defs>
        <Circle cx={32} cy={32} r={30} fill="url(#rideGrad)" opacity={0.16} />
        <Circle cx={16} cy={44} r={6} stroke="#fc4c02" strokeWidth={2.6} />
        <Circle cx={46} cy={44} r={6} stroke="#fc4c02" strokeWidth={2.6} />
        <Path
          d="M16 38 L24 18 H32 M34 44 H40 M24 18 L34 36 H46"
          stroke="#fc4c02"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={88} height={88} viewBox="0 0 64 64" fill="none">
      <Defs>
        <SvgLinearGradient id="payGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#16a34a" />
          <Stop offset="100%" stopColor="#22c55e" />
        </SvgLinearGradient>
      </Defs>
      <Circle cx={32} cy={32} r={30} fill="url(#payGrad)" opacity={0.16} />
      <Rect
        x={14}
        y={20}
        width={36}
        height={24}
        rx={4}
        stroke="#16a34a"
        strokeWidth={2.6}
      />
      <Path d="M14 28 H50" stroke="#16a34a" strokeWidth={2.6} />
      <Circle cx={42} cy={36} r={2.4} fill="#16a34a" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(252, 76, 2, 0.18)',
  },
  iconBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fc4c02',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  brandImage: {
    width: 96,
    height: 64,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#101828',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  indicatorRow: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#fc4c02',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(15, 23, 42, 0.45)',
    letterSpacing: 1.5,
  },
});
