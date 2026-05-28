import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
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
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';

const ScootyArt = require('../assets/images/scooty.png');

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

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
    title: 'Ride anywhere',
    subtitle: 'Pick up a scooty from your nearest station',
  },
  {
    kind: 'pay',
    title: 'One-tap payments',
    subtitle: 'Pay from your wallet — quick and effortless',
  },
];

const SLIDE_DURATION = 1300;
const ENTER_MS = 560;
const EXIT_MS = 300;

const AnimatedSvgG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function SplashScreen() {
  const [index, setIndex] = useState(0);
  const enter = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(0)).current;
  const ambient = useRef(new Animated.Value(0)).current;
  const orbA = useRef(new Animated.Value(0)).current;
  const orbB = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(ambient, {
        toValue: 1,
        duration: 6000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ).start();
    Animated.loop(
      Animated.timing(orbA, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
    Animated.loop(
      Animated.timing(orbB, {
        toValue: 1,
        duration: 7500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [ambient, orbA, orbB]);

  useEffect(() => {
    enter.setValue(0);
    exit.setValue(0);

    Animated.timing(enter, {
      toValue: 1,
      duration: ENTER_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(progress, {
      toValue: index + 1,
      duration: SLIDE_DURATION - EXIT_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const t = setTimeout(() => {
      if (index < SLIDES.length - 1) {
        Animated.timing(exit, {
          toValue: 1,
          duration: EXIT_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(() => setIndex((i) => i + 1));
      }
    }, SLIDE_DURATION);

    return () => clearTimeout(t);
  }, [index]);

  const slide = SLIDES[index];

  const heroOpacity = Animated.multiply(
    enter,
    exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
  );
  const heroTranslate = Animated.add(
    enter.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }),
    exit.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }),
  );
  const progressWidth = progress.interpolate({
    inputRange: [0, SLIDES.length],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <DriftingOrbs orbA={orbA} orbB={orbB} />
      <FloatingParticles />

      <View style={styles.brandMark}>
        <View style={styles.brandMarkDot} />
        <Text style={styles.brandMarkText}>SLYDO MOBILITY</Text>
        <View style={styles.brandMarkLine} />
      </View>

      <View style={styles.stage}>
        <Animated.View
          style={[
            styles.heroStage,
            { opacity: heroOpacity, transform: [{ translateX: heroTranslate }] },
          ]}
        >
          {slide.kind === 'brand' ? (
            <BrandSlide ambient={ambient} enter={enter} />
          ) : null}
          {slide.kind === 'ride' ? <RideSlide enter={enter} /> : null}
          {slide.kind === 'pay' ? <PaySlide enter={enter} /> : null}
        </Animated.View>

        <View style={styles.textBlock}>
          <StaggeredTitle key={slide.kind} title={slide.title} />
          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: enter.interpolate({
                  inputRange: [0, 0.55, 1],
                  outputRange: [0, 0, 1],
                }),
                transform: [
                  {
                    translateY: enter.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {slide.subtitle}
          </Animated.Text>
        </View>
      </View>

      <View style={styles.footerArea}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <View style={styles.indicatorRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.indicator, i === index && styles.indicatorActive]}
            />
          ))}
        </View>
        <Text style={styles.footerHint}>
          {index === SLIDES.length - 1 ? 'Almost there…' : 'Loading your experience'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

/* ----------------------------- Slide 1 — Brand ---------------------------- */

function BrandSlide({
  ambient,
  enter,
}: {
  ambient: Animated.Value;
  enter: Animated.Value;
}) {
  const orbit = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(orbit, {
        toValue: 1,
        duration: 7000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [orbit]);

  const rotation = orbit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const burst = ambient.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.96, 1.04, 0.96],
  });

  const wordmark = 'SLYDO';
  const letters = wordmark.split('');
  const letterAnims = useRef(letters.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      45,
      letterAnims.map((a) =>
        Animated.spring(a, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [letterAnims]);

  const haloScale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <View style={styles.brandSlide}>
      <Animated.View style={[styles.halo, { transform: [{ scale: Animated.multiply(haloScale, burst) }] }]}>
        <Svg width={280} height={280} viewBox="0 0 280 280" fill="none">
          <Defs>
            <RadialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#fc4c02" stopOpacity={0.45} />
              <Stop offset="60%" stopColor="#fc4c02" stopOpacity={0.1} />
              <Stop offset="100%" stopColor="#fc4c02" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={140} cy={140} r={140} fill="url(#haloGrad)" />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.orbitWrap, { transform: [{ rotate: rotation }] }]}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          const r = 130;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          const palette = ['#fc4c02', '#ff7a45', '#16a34a', '#fc4c02', '#22c55e', '#ff7a45'];
          return (
            <View
              key={i}
              style={[
                styles.orbitDot,
                {
                  backgroundColor: palette[i],
                  transform: [{ translateX: x }, { translateY: y }],
                },
              ]}
            />
          );
        })}
      </Animated.View>

      <View style={styles.wordmarkStack}>
        <View style={styles.wordmarkRow}>
          {letters.map((ch, i) => {
            const a = letterAnims[i];
            const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
            const scale = a.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
            return (
              <Animated.Text
                key={i}
                style={[
                  styles.wordmarkLetter,
                  { opacity: a, transform: [{ translateY }, { scale }] },
                ]}
              >
                {ch}
              </Animated.Text>
            );
          })}
        </View>
        <Animated.Text
          style={[
            styles.wordmarkSub,
            {
              opacity: enter.interpolate({ inputRange: [0.4, 1], outputRange: [0, 1] }),
              transform: [
                {
                  translateY: enter.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          M O B I L I T Y
        </Animated.Text>
      </View>
    </View>
  );
}

/* ------------------------------ Slide 2 — Ride ---------------------------- */

function RideSlide({ enter }: { enter: Animated.Value }) {
  const drive = useRef(new Animated.Value(0)).current;
  const road = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(road, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(drive, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(drive, {
          toValue: 0,
          duration: 1,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [drive, road]);

  const scooterX = drive.interpolate({ inputRange: [0, 1], outputRange: [-60, 60] });
  const scooterTilt = drive.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-3deg', '0deg', '3deg'],
  });
  const roadShift = road.interpolate({ inputRange: [0, 1], outputRange: [0, -28] });

  const pinIn = enter.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
  const pinOpacity = enter.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.rideSlide}>
      <View style={styles.pinRow}>
        {['City Centre', 'Park Hub', 'Metro'].map((label, i) => (
          <Animated.View
            key={label}
            style={[
              styles.pinChip,
              {
                opacity: pinOpacity,
                transform: [
                  {
                    translateY: Animated.add(
                      pinIn,
                      enter.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-8 * i, 0],
                      }),
                    ),
                  },
                ],
              },
            ]}
          >
            <View style={styles.pinDot} />
            <Text style={styles.pinText}>{label}</Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View
        style={[
          styles.scooterWrap,
          { transform: [{ translateX: scooterX }, { rotate: scooterTilt }] },
        ]}
      >
        <Image source={ScootyArt} style={styles.scooterImage} resizeMode="contain" />
        <View style={styles.motionStack}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.motionStreak,
                { width: 50 - i * 12, opacity: 0.7 - i * 0.18 },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      <View style={styles.roadWrap}>
        <View style={styles.roadEdge} />
        <Animated.View
          style={[styles.roadDashes, { transform: [{ translateX: roadShift }] }]}
        >
          {Array.from({ length: 14 }).map((_, i) => (
            <View key={i} style={styles.roadDash} />
          ))}
        </Animated.View>
        <View style={styles.roadEdge} />
      </View>
    </View>
  );
}

/* ------------------------------- Slide 3 — Pay ---------------------------- */

function PaySlide({ enter }: { enter: Animated.Value }) {
  const ripple = useRef(new Animated.Value(0)).current;
  const tap = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(ripple, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(tap, {
          toValue: 1,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(tap, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(800),
      ]),
    ).start();
  }, [ripple, tap]);

  const card1Translate = enter.interpolate({ inputRange: [0, 1], outputRange: [40, -12] });
  const card2Translate = enter.interpolate({ inputRange: [0, 1], outputRange: [56, 0] });
  const card3Translate = enter.interpolate({ inputRange: [0, 1], outputRange: [72, 12] });

  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.2] });
  const rippleOpacity = ripple.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.4, 0],
  });

  const tapScale = tap.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] });

  return (
    <View style={styles.paySlide}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.rippleRing,
          { transform: [{ scale: rippleScale }], opacity: rippleOpacity },
        ]}
      />

      <Animated.View
        style={[
          styles.cardBack,
          {
            transform: [
              { translateY: card3Translate },
              { translateX: 28 },
              { rotate: '6deg' },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.cardMid,
          {
            transform: [
              { translateY: card2Translate },
              { translateX: -14 },
              { rotate: '-4deg' },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.cardFront,
          {
            transform: [
              { translateY: card1Translate },
              { rotate: '0deg' },
              { scale: tapScale },
            ],
          },
        ]}
      >
        <View style={styles.cardChip} />
        <Text style={styles.cardSymbol}>₹</Text>
        <View style={styles.cardLineFar} />
        <View style={styles.cardLineNear} />
        <View style={styles.cardLogo}>
          <View style={[styles.cardLogoDot, { backgroundColor: '#fc4c02' }]} />
          <View
            style={[
              styles.cardLogoDot,
              { backgroundColor: '#16a34a', marginLeft: -8 },
            ]}
          />
        </View>
      </Animated.View>

      <View style={styles.fingerHint}>
        <Svg width={24} height={32} viewBox="0 0 24 32" fill="none">
          <Path
            d="M12 4 V18 M12 4 C9 4 7 6 7 9 V18 C7 24 10 28 14 28 H16 C19 28 21 26 21 23 V18 L16 18"
            stroke="#0f172a"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.9)"
          />
        </Svg>
      </View>
    </View>
  );
}

/* ------------------------------- Shared bits ------------------------------ */

function StaggeredTitle({ title }: { title: string }) {
  const letters = useMemo(() => title.split(''), [title]);
  const anims = useRef(letters.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      30,
      anims.map((a) =>
        Animated.spring(a, {
          toValue: 1,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [title, anims]);

  return (
    <View style={styles.titleRow}>
      {letters.map((ch, i) => {
        const a = anims[i];
        const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
        return (
          <Animated.Text
            key={`${title}-${i}`}
            style={[styles.titleChar, { opacity: a, transform: [{ translateY }] }]}
          >
            {ch === ' ' ? ' ' : ch}
          </Animated.Text>
        );
      })}
    </View>
  );
}

function DriftingOrbs({
  orbA,
  orbB,
}: {
  orbA: Animated.Value;
  orbB: Animated.Value;
}) {
  const aX = orbA.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-30, 30, -30],
  });
  const aY = orbA.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-20, 20, -20],
  });
  const bX = orbB.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [25, -25, 25],
  });
  const bY = orbB.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [15, -25, 15],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <Animated.View
        style={[
          styles.orb,
          styles.orbA,
          { transform: [{ translateX: aX }, { translateY: aY }] },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbB,
          { transform: [{ translateX: bX }, { translateY: bY }] },
        ]}
      />
    </View>
  );
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: 3 + ((i * 7) % 8),
  startX: (i * 71) % SCREEN_W,
  startY: 80 + ((i * 113) % (SCREEN_H - 220)),
  delay: (i * 230) % 2200,
  duration: 4400 + ((i * 311) % 2200),
  amp: 18 + ((i * 9) % 24),
  color:
    i % 3 === 0
      ? 'rgba(252, 76, 2, 0.42)'
      : i % 3 === 1
        ? 'rgba(34, 197, 94, 0.36)'
        : 'rgba(255, 255, 255, 0.7)',
}));

function FloatingParticles() {
  const anims = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    PARTICLES.forEach((p, i) => {
      const animate = () => {
        anims[i].setValue(0);
        Animated.timing(anims[i], {
          toValue: 1,
          duration: p.duration,
          delay: p.delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }).start(animate);
      };
      animate();
    });
  }, [anims]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {PARTICLES.map((p, i) => {
        const translateY = anims[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, -p.amp, 0],
        });
        const opacity = anims[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.15, 0.9, 0.15],
        });
        return (
          <Animated.View
            key={p.id}
            style={{
              position: 'absolute',
              left: p.startX,
              top: p.startY,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: p.color,
              transform: [{ translateY }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}

// Avoid TS unused warning for AnimatedSvgG/AnimatedCircle (kept for future use)
void AnimatedSvgG;
void AnimatedCircle;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  orb: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  orbA: {
    top: -80,
    left: -100,
    backgroundColor: 'rgba(252, 76, 2, 0.18)',
  },
  orbB: {
    bottom: -90,
    right: -110,
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
  },

  brandMark: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMarkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fc4c02',
  },
  brandMarkText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(15, 23, 42, 0.6)',
    letterSpacing: 3,
  },
  brandMarkLine: {
    width: 22,
    height: 1.5,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    borderRadius: 1,
  },

  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroStage: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    marginTop: 36,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  titleChar: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },

  /* Brand slide */
  brandSlide: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
  },
  orbitWrap: {
    position: 'absolute',
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  wordmarkStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
  },
  wordmarkLetter: {
    fontSize: 56,
    fontWeight: '900',
    color: '#fc4c02',
    letterSpacing: 3,
    textShadowColor: 'rgba(252, 76, 2, 0.25)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 12,
  },
  wordmarkSub: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },

  /* Ride slide */
  rideSlide: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinRow: {
    position: 'absolute',
    top: 10,
    flexDirection: 'row',
    gap: 8,
  },
  pinChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(252, 76, 2, 0.18)',
  },
  pinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fc4c02',
  },
  pinText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.4,
  },
  scooterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scooterImage: {
    width: 180,
    height: 120,
  },
  motionStack: {
    position: 'absolute',
    left: -40,
    top: 40,
    alignItems: 'flex-start',
    gap: 8,
  },
  motionStreak: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#fc4c02',
  },
  roadWrap: {
    position: 'absolute',
    bottom: 20,
    width: 260,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roadEdge: {
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
  },
  roadDashes: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  roadDash: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(252, 76, 2, 0.55)',
  },

  /* Pay slide */
  paySlide: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(252, 76, 2, 0.55)',
  },
  cardBack: {
    position: 'absolute',
    width: 180,
    height: 110,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  cardMid: {
    position: 'absolute',
    width: 190,
    height: 120,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#fc4c02',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  cardFront: {
    width: 210,
    height: 132,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#fc4c02',
    overflow: 'hidden',
    shadowColor: '#fc4c02',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  cardChip: {
    width: 28,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  cardSymbol: {
    position: 'absolute',
    top: 14,
    right: 18,
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
  },
  cardLineFar: {
    marginTop: 14,
    width: 90,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  cardLineNear: {
    marginTop: 8,
    width: 64,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  cardLogo: {
    position: 'absolute',
    bottom: 14,
    right: 18,
    flexDirection: 'row',
  },
  cardLogoDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  fingerHint: {
    position: 'absolute',
    bottom: 12,
    right: 30,
  },

  footerArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 48,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fc4c02',
    borderRadius: 2,
  },
  indicatorRow: {
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
  footerHint: {
    fontSize: 11,
    color: 'rgba(15, 23, 42, 0.5)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
