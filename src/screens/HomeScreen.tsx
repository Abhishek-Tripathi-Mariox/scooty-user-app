import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { GradientButton } from '../components/GradientButton';
import { MapPinIcon, ScooterIcon, ShareIcon, WalletIcon } from '../components/HomeIcons';
import { LiveMap } from '../components/LiveMap';
import { AddressPinIcon, BatteryIcon, ClockIcon } from '../components/RideIcons';
import { ScreenSurface } from '../components/ScreenSurface';
import type { Dashboard, User } from '../services/userApi';
import type { PickupStation } from './PickupStationScreen';
import { formatCurrency } from '../utils/format';
import { useResponsiveLayout } from '../utils/responsive';

const ScootyImage = require('../assets/images/scooty-3d.png');
const ReferPerson = require('../assets/images/refer-person.png');

const STATUS_BAR_PAD = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 8;
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
  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const next = Math.max(0, Math.round(offset / snapStep));
    setActiveIndex(next);
  };
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true },
  );

  const mapHeight = MAP_HEIGHT + STATUS_BAR_PAD;

  return (
    <ScreenSurface>
      <View style={styles.root}>
        <View style={[styles.mapCard, { height: mapHeight }]}>
          <LiveMap
            stations={stations || []}
            style={StyleSheet.absoluteFillObject}
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
              <MapPinIcon size={20} />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.locationLabel}>Your location</Text>
                <Text style={styles.locationValue} numberOfLines={1}>
                  {city}
                </Text>
              </View>
            </Pressable>

            <Pressable style={styles.walletPill} onPress={onWalletPress} hitSlop={6}>
              <WalletIcon size={20} />
              <Text style={styles.walletText}>
                {dashboard ? formatCurrency(dashboard.walletBalance) : '₹0'}
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

        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
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
              decelerationRate={0.92}
              disableIntervalMomentum
              scrollEventThrottle={16}
              onScroll={handleScroll}
              contentContainerStyle={{ paddingHorizontal: sideInset, paddingVertical: 4 }}
              ItemSeparatorComponent={() => <View style={{ width: carouselGap }} />}
              onMomentumScrollEnd={handleMomentumEnd}
              renderItem={({ item, index }) => {
                const inputRange = [
                  (index - 1) * snapStep,
                  index * snapStep,
                  (index + 1) * snapStep,
                ];
                const scale = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.88, 1, 0.88],
                  extrapolate: 'clamp',
                });
                const opacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.55, 1, 0.55],
                  extrapolate: 'clamp',
                });
                return (
                  <Animated.View style={{ transform: [{ scale }], opacity }}>
                    <StationCard
                      station={item}
                      width={cardWidth}
                      active={index === activeIndex}
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

            <View
              style={[
                styles.referralVisual,
                { width: layout.referralVisualSize * 1.1, height: layout.referralVisualSize },
              ]}
            >
              <Image source={ReferPerson} style={styles.referralImage} resizeMode="contain" />
            </View>
          </Pressable>
        </ScrollView>
      </View>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </ScreenSurface>
  );
}

function PeopleIcon() {
  return (
    <View style={styles.peopleIconWrap}>
      <Text style={styles.peopleIconText}>👥</Text>
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
  onPress,
}: {
  station: PickupStation;
  width: number;
  active: boolean;
  onPress: () => void;
}) {
  void active;
  const artSize = 118;
  const overlap = 70;

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
          { width: '100%', paddingTop: artSize - overlap + 8 },
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
          height={44}
          radius={12}
          style={styles.bookNowButton}
        />
      </View>

      <View pointerEvents="none" style={styles.stationArtWrap}>
        <Image
          source={ScootyImage}
          style={{ width: artSize * 1.2, height: artSize }}
          resizeMode="contain"
        />
      </View>
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
    color: '#1c1c1e',
    fontSize: 14,
    letterSpacing: 0.14,
  },
  locationValue: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.16,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    height: 36,
    minWidth: 84,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  walletText: {
    color: '#1c1c1e',
    fontSize: 14,
    fontWeight: '600',
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
    borderRadius: 22,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingBottom: 14,
    alignItems: 'stretch',
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
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
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
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 124,
    shadowColor: '#d8bbb0',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
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
  peopleIconText: {
    fontSize: 16,
  },
  referralTitle: {
    color: '#1c1c1e',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
  },
  referralSubtitle: {
    color: 'rgba(28,28,30,0.7)',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
    maxWidth: 200,
  },
  shareButton: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ff7a45',
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 6,
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shareButtonText: {
    color: '#ff7a45',
    fontSize: 14,
    fontWeight: '500',
  },
  referralVisual: {
    width: 100,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralImage: {
    position: 'absolute',
    right: -8,
    bottom: -10,
    width: '120%',
    height: '130%',
  },
});
