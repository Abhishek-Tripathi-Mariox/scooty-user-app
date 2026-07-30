import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { GradientButton } from '../components/GradientButton';
import { MapPinIcon, ScooterIcon, ShareIcon } from '../components/HomeIcons';
import { LiveMap } from '../components/LiveMap';
import Svg, { Circle, Path } from 'react-native-svg';
import { AddressPinIcon, BatteryIcon, ClockIcon } from '../components/RideIcons';
import { ScreenSurface } from '../components/ScreenSurface';
import type { Dashboard, User } from '../services/userApi';
import type { PickupStation } from './PickupStationScreen';
import { useResponsiveLayout } from '../utils/responsive';
import { STATUS_TOP_INSET } from '../utils/statusBarInset';

const ScootyImage = require('../assets/images/scooty-3d.png');
// Cropped to just the 3D person (the original PNG is a wide canvas with
// ~60% empty transparent space on the left).
const ReferPerson = require('../assets/images/refer-person-cropped.png');

// The Root wrapper (index.js) pads every screen below the status bar, but
// the Home map should run edge-to-edge behind the transparent bar — so the
// map card pulls itself up by the same inset and pads its header instead.
const STATUS_BAR_PAD = STATUS_TOP_INSET + 8;
const MAP_HEIGHT = 250;

export function HomeScreen({
  user,
  dashboard,
  stations,
  loading = false,
  activeTab,
  onTabPress,
  onBookScooty,
  onViewAll,
  onReferPress,
  onLocationPress,
  onWalletPress,
}: {
  user?: User | null;
  dashboard?: Dashboard | null;
  stations?: PickupStation[] | null;
  loading?: boolean;
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  onBookScooty: (stationId?: string) => void;
  onViewAll?: () => void;
  onReferPress?: () => void;
  onLocationPress?: () => void;
  onWalletPress?: () => void;
}) {
  const layout = useResponsiveLayout();
  const city = user?.settings?.location?.city || user?.city || 'Kuala lumpur, Malaysia';
  const nearbyStations = (stations ?? []).slice(0, 5);

  const carouselGap = 16;
  const cardWidth = Math.min(230, Math.round(layout.screenWidth * 0.62));
  const sideInset = Math.max(20, Math.round((layout.screenWidth - cardWidth) / 2));
  const snapStep = cardWidth + carouselGap;

  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  // Page scroll pauses while a finger is on the map so map pan/pinch-zoom
  // gestures stay smooth instead of fighting the ScrollView.
  const [mapTouching, setMapTouching] = useState(false);

  // Gentle endless float for the active card's scooter image.
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim]);
  const floatY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const next = Math.max(0, Math.round(offset / snapStep));
    setActiveIndex(next);
  };
  // Pure native-driver scroll tracking — no JS work per frame, so the
  // card animations stay perfectly smooth.
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true },
  );

  const mapHeight = MAP_HEIGHT + STATUS_BAR_PAD;

  return (
    <ScreenSurface>
      <View style={styles.root}>
        {/* One scroll for the whole page — map, book button and sections all
            move together. The scroll area itself extends up under the
            transparent status bar so the map reaches the very top edge. */}
        <ScrollView
          style={[styles.bodyScroll, { marginTop: -STATUS_TOP_INSET }]}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!mapTouching}
        >
        <View style={[styles.mapCard, { height: mapHeight }]}>
          <LiveMap
            stations={stations || []}
            style={StyleSheet.absoluteFillObject}
            onTouchActive={setMapTouching}
          />
          <View
            style={[styles.headerRow, { paddingTop: STATUS_BAR_PAD + 12 }]}
            pointerEvents="box-none"
          >
            <Pressable
              style={styles.locationWrap}
              onPress={onLocationPress}
              hitSlop={6}
            >
              <MapPinIcon size={22} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.locationLabel}>Your location</Text>
                <Text style={styles.locationValue} numberOfLines={1}>
                  {city}
                </Text>
              </View>
            </Pressable>

            <Pressable style={styles.walletPill} onPress={onWalletPress} hitSlop={6}>
              <WalletCardGlyph />
              <Text style={styles.walletText}>
                {`₹${Math.round(dashboard?.walletBalance ?? 0)}`}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.bookButtonWrap}>
          <GradientButton
            label="Book a Scooty"
            onPress={() => onBookScooty()}
            height={62}
            radius={14}
            style={styles.bookButton}
            leftIcon={<ScooterIcon size={22} />}
            labelStyle={styles.bookButtonText}
          />
        </View>

          <View style={[styles.sectionRow, { paddingHorizontal: layout.screenX }]}>
            <Text style={styles.sectionTitle}>Nearest Available Scooty</Text>
            <Pressable onPress={onViewAll} hitSlop={8}>
              <Text style={styles.viewAll}>View all</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={[styles.emptyStateCard, { width: cardWidth, marginHorizontal: sideInset }]}>
              <Text style={styles.emptyStateTitle}>Loading live stations</Text>
              <Text style={styles.emptyStateText}>Fetching the latest scooty availability.</Text>
            </View>
          ) : nearbyStations.length > 0 ? (
            <Animated.FlatList
              data={nearbyStations}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={snapStep}
              snapToAlignment="start"
              decelerationRate="fast"
              disableIntervalMomentum
              scrollEventThrottle={16}
              onScroll={handleScroll}
              contentContainerStyle={{ paddingHorizontal: sideInset, paddingTop: 20, paddingBottom: 32 }}
              ItemSeparatorComponent={() => <View style={{ width: carouselGap }} />}
              onMomentumScrollEnd={handleMomentumEnd}
              renderItem={({ item, index }) => {
                const inputRange = [
                  (index - 1) * snapStep,
                  index * snapStep,
                  (index + 1) * snapStep,
                ];
                // Centre card full size, side cards slightly smaller and
                // dimmed, peeking in from the screen edges (matches design).
                const scale = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.9, 1, 0.9],
                  extrapolate: 'clamp',
                });
                const opacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.7, 1, 0.7],
                  extrapolate: 'clamp',
                });
                // Vertical stagger: the centre card sits slightly lower,
                // side cards ride a little higher (matches the design).
                const translateY = scrollX.interpolate({
                  inputRange,
                  outputRange: [-16, 8, -16],
                  extrapolate: 'clamp',
                });
                // Soft shadow fades in only while the card is centred.
                const shadowOpacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0, 1, 0],
                  extrapolate: 'clamp',
                });
                // Parallax: the scooter drifts opposite the scroll, slower
                // than the card it sits on.
                const parallax = scrollX.interpolate({
                  inputRange,
                  outputRange: [-22, 0, 22],
                  extrapolate: 'clamp',
                });
                return (
                  <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
                    <Animated.View
                      pointerEvents="none"
                      style={[styles.centerShadow, { opacity: shadowOpacity }]}
                    />
                    <StationCard
                      station={item}
                      width={cardWidth}
                      active={index === activeIndex}
                      float={floatY}
                      parallax={parallax}
                      onPress={() => onBookScooty(item.id)}
                    />
                  </Animated.View>
                );
              }}
            />
          ) : (
            <View style={[styles.emptyStateCard, { width: cardWidth, marginHorizontal: sideInset }]}>
              <Text style={styles.emptyStateTitle}>No live stations yet</Text>
              <Text style={styles.emptyStateText}>The backend returned no nearby stations.</Text>
            </View>
          )}

          <Pressable
            style={[styles.referralCard, { marginHorizontal: layout.screenX }]}
            onPress={onReferPress}
          >
            <View style={styles.referralTextWrap}>
              <View style={styles.referralTitleRow}>
                <PeopleIcon />
                <Text style={styles.referralTitle}>Refer & Earn {'₹'}200</Text>
              </View>
              <Text style={styles.referralSubtitle}>
                Invite friends and earn after their first ride
              </Text>
              <View style={styles.shareButton}>
                <ShareIcon size={14} color="#ff7a45" />
                <Text style={styles.shareButtonText}>Share Code</Text>
              </View>
            </View>

            <View style={styles.referralVisual}>
              <Image source={ReferPerson} style={styles.referralImage} resizeMode="contain" />
            </View>
          </Pressable>
        </ScrollView>
      </View>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </ScreenSurface>
  );
}

function WalletCardGlyph() {
  // Wallet glyph (from the provided design asset) used inside the wallet pill.
  return (
    <Svg width={21} height={20} viewBox="0 0 19 18" fill="none">
      <Path
        d="M17.9958 14.9965V15.9963C17.9958 17.096 17.096 17.9958 15.9963 17.9958H1.99953C0.889792 17.9958 0 17.096 0 15.9963V1.99953C0 0.89979 0.889792 0 1.99953 0H15.9963C17.096 0 17.9958 0.89979 17.9958 1.99953V2.9993H8.9979C7.88816 2.9993 6.99837 3.89909 6.99837 4.99883V12.997C6.99837 14.0967 7.88816 14.9965 8.9979 14.9965H17.9958ZM8.9979 12.997H18.9956V4.99883H8.9979V12.997ZM12.997 10.4976C12.1672 10.4976 11.4973 9.82771 11.4973 8.9979C11.4973 8.16809 12.1672 7.49825 12.997 7.49825C13.8268 7.49825 14.4966 8.16809 14.4966 8.9979C14.4966 9.82771 13.8268 10.4976 12.997 10.4976Z"
        fill="#1C1C1E"
      />
    </Svg>
  );
}

function PeopleIcon() {
  return (
    <View style={styles.peopleIconWrap}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx={9} cy={8} r={3.2} stroke="#1c1c1e" strokeWidth={1.7} />
        <Path
          d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5"
          stroke="#1c1c1e"
          strokeWidth={1.7}
          strokeLinecap="round"
        />
        <Circle cx={16.5} cy={9} r={2.4} stroke="#1c1c1e" strokeWidth={1.5} />
        <Path
          d="M15.5 14.6c2.3.2 4.2 1.5 4.8 4"
          stroke="#1c1c1e"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

function StatPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.statPill}>
      {icon}
      <Text style={styles.statPillText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function StationCard({
  station,
  width,
  active,
  float,
  parallax,
  onPress,
}: {
  station: PickupStation;
  width: number;
  active: boolean;
  float?: Animated.AnimatedInterpolation<number>;
  parallax?: Animated.AnimatedInterpolation<number>;
  onPress: () => void;
}) {
  const artSize = 150;
  const overlap = 96;

  const artTransforms: Array<Record<string, unknown>> = [];
  if (parallax) artTransforms.push({ translateX: parallax });
  if (active && float) artTransforms.push({ translateY: float });

  return (
    <Pressable
      style={{
        width,
        paddingTop: overlap,
        alignItems: 'center',
      }}
      onPress={onPress}
    >
      <View
        style={[
          styles.stationCardBody,
          { width: '100%', paddingTop: artSize - overlap + 10 },
        ]}
      >
        <Text style={styles.stationName} numberOfLines={1}>
          {station.name}
        </Text>
        <View style={styles.statsRow}>
          <StatPill icon={<BatteryIcon size={14} color="#16a34a" />} label={station.battery} />
          <StatPill icon={<ClockIcon size={14} color="#4a5565" />} label={station.parking} />
          <StatPill icon={<AddressPinIcon size={14} color="#4a5565" />} label={station.distance} />
        </View>
        <GradientButton
          label="Book Now"
          onPress={onPress}
          height={46}
          radius={14}
          style={styles.bookNowButton}
        />
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.stationArtWrap,
          artTransforms.length > 0 ? { transform: artTransforms as never } : null,
        ]}
      >
        <Image
          source={ScootyImage}
          style={{ width: artSize * 1.25, height: artSize }}
          resizeMode="contain"
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  mapCard: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#f4f4f4',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  locationLabel: {
    color: '#3f3f46',
    fontSize: 13.5,
    letterSpacing: 0.14,
  },
  locationValue: {
    color: '#000',
    fontSize: 17.5,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.16,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ececf0',
    paddingHorizontal: 13,
    height: 40,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  walletText: {
    color: '#17181c',
    fontSize: 16,
    fontWeight: '700',
  },
  bookButtonWrap: {
    marginTop: -28,
    marginBottom: 6,
    paddingHorizontal: 36,
    zIndex: 5,
  },
  bookButton: {
    shadowColor: '#fc4c02',
    shadowOpacity: 0.36,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: 28,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 24,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 0,
  },
  sectionTitle: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.16,
  },
  viewAll: {
    color: '#3a3a3c',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyStateCard: {
    minHeight: 200,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
    padding: 18,
    justifyContent: 'center',
    marginVertical: 16,
  },
  emptyStateTitle: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyStateText: {
    marginTop: 6,
    color: '#4a5565',
    fontSize: 12,
    lineHeight: 17,
  },
  stationCardBody: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'stretch',
  },
  // Rendered behind the card; fades in only when the card is centred so the
  // soft shadow belongs to the front card alone.
  centerShadow: {
    position: 'absolute',
    top: 100,
    left: 6,
    right: 6,
    bottom: 8,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#b3705a',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  stationArtWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 4,
  },
  stationName: {
    color: '#363636',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  statPillText: {
    color: '#363636',
    fontSize: 11,
    fontWeight: '500',
  },
  bookNowButton: {
    marginTop: 2,
  },
  referralCard: {
    marginTop: 6,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f0f4',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 128,
    shadowColor: '#d8bbb0',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  referralTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  referralTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  peopleIconWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralTitle: {
    color: '#1c1c1e',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  referralSubtitle: {
    color: '#6b7280',
    fontSize: 12.5,
    lineHeight: 17,
    marginBottom: 12,
    maxWidth: 190,
  },
  shareButton: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1.3,
    borderColor: '#ff7a45',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 6,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  shareButtonText: {
    color: '#ff7a45',
    fontSize: 14,
    fontWeight: '600',
  },
  // Matches the design spec: the 3D person is a fixed 120 × 138 block on the
  // card's right side, fully inside the card.
  referralVisual: {
    width: 120,
    height: 138,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  referralImage: {
    width: '100%',
    height: '100%',
  },
});
