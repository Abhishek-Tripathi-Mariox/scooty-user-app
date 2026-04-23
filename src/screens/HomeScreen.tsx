import React from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { GradientButton } from '../components/GradientButton';
import { MapPinIcon, ScooterIcon, ShareIcon, WalletIcon } from '../components/HomeIcons';
import { ScreenSurface } from '../components/ScreenSurface';
import { COLORS } from '../constants/theme';
import type { Dashboard, User } from '../services/userApi';
import type { PickupStation } from './PickupStationScreen';
import { formatCurrency } from '../utils/format';
import { useResponsiveLayout } from '../utils/responsive';

const ScootyImage = require('../assets/images/scooty-3d.png');
const MapBackground = require('../assets/images/map-bg.png');
const ScootyMarker = require('../assets/images/scooty-marker.png');
const RedPin = require('../assets/images/red-pin.png');
const ReferPerson = require('../assets/images/refer-person.png');

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
}: {
  user?: User | null;
  dashboard?: Dashboard | null;
  stations?: PickupStation[] | null;
  loading?: boolean;
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  onBookScooty: () => void;
  onViewAll?: () => void;
  onReferPress?: () => void;
}) {
  const layout = useResponsiveLayout();
  const city = user?.settings?.location?.city || user?.city || 'Location not set';
  const nearbyStations = (stations ?? []).slice(0, 5);
  const carouselGap = Math.max(8, Math.round(layout.screenWidth * 0.025));
  const bookButtonHeight = Math.max(50, Math.round(layout.screenHeight * 0.067));

  return (
    <ScreenSurface>
      <View style={styles.root}>
        <View style={[styles.heroPanel, { paddingHorizontal: layout.screenX, paddingTop: Math.max(6, Math.round(layout.screenHeight * 0.01)) }]}>
          <View style={[styles.heroTopRow, { marginBottom: Math.max(10, Math.round(layout.screenHeight * 0.014)) }]}>
            <View style={styles.locationWrap}>
              <View style={styles.locationIcon}>
                <MapPinIcon size={18} />
              </View>
              <View>
                <Text style={styles.smallLabel}>Your location</Text>
                <Text style={styles.locationValue}>{city}</Text>
              </View>
            </View>

            <View style={styles.walletChip}>
              <WalletIcon size={20} />
              <Text style={styles.walletText}>{dashboard ? formatCurrency(dashboard.walletBalance) : '₹0.00'}</Text>
            </View>
          </View>

          <ImageBackground
            source={MapBackground}
            style={[styles.mapCard, { height: layout.mapCardHeight, borderRadius: Math.max(22, Math.round(layout.screenWidth * 0.06)) }]}
            imageStyle={[styles.mapImage, { borderRadius: Math.max(22, Math.round(layout.screenWidth * 0.06)) }]}
            resizeMode="cover"
          >
            {mapPins.map((pin) => (
              <View key={pin.id} style={[styles.mapPin, { left: pin.left, top: pin.top }]}>
                <Image source={ScootyMarker} style={styles.pinBadgeImage} resizeMode="contain" />
              </View>
            ))}

            <View style={styles.centerPin}>
              <Image source={RedPin} style={styles.centerPinImage} resizeMode="contain" />
            </View>
          </ImageBackground>

          <GradientButton
            label="Book a Scooty"
            onPress={onBookScooty}
            height={bookButtonHeight}
            radius={Math.max(12, Math.round(layout.screenWidth * 0.035))}
            style={styles.bookButton}
            leftIcon={<ScooterIcon size={22} />}
            labelStyle={styles.bookButtonText}
          />
        </View>

        <View style={[styles.sectionRow, { paddingHorizontal: layout.screenX, marginBottom: 8 }]}>
          <Text style={styles.sectionTitle}>Nearest Available Scooty</Text>
          <Pressable onPress={onViewAll}>
            <Text style={styles.viewAll}>view all</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.carouselContent, { paddingHorizontal: layout.screenX, gap: carouselGap }]}
          snapToInterval={layout.heroCardWidth + carouselGap}
          decelerationRate="fast"
        >
          {loading ? (
            <View style={[styles.emptyStateCard, { width: layout.heroCardWidth }]}>
              <Text style={styles.emptyStateTitle}>Loading live stations</Text>
              <Text style={styles.emptyStateText}>Fetching the latest scooty availability from the backend.</Text>
            </View>
          ) : nearbyStations.length > 0 ? (
            nearbyStations.map((station) => (
              <Pressable
                key={station.id}
                style={[
                  styles.stationCard,
                  {
                    width: layout.heroCardWidth,
                    borderRadius: Math.max(18, Math.round(layout.screenWidth * 0.055)),
                    paddingHorizontal: Math.max(10, Math.round(layout.screenWidth * 0.03)),
                  },
                ]}
                onPress={onBookScooty}
              >
                <View
                  style={[
                    styles.stationArtworkWrap,
                    {
                      height: layout.heroArtworkHeight,
                      borderRadius: Math.max(16, Math.round(layout.screenWidth * 0.045)),
                    },
                  ]}
                >
                  <View style={styles.artBackdrop} />
                  <Image
                    source={ScootyImage}
                    style={[styles.scootyImage, { width: layout.heroArtworkHeight + 14, height: layout.heroArtworkHeight + 14 }]}
                    resizeMode="contain"
                  />
                </View>

                <Text style={styles.stationName} numberOfLines={1}>
                  {station.name}
                </Text>

                <Text style={styles.stationAddress} numberOfLines={2}>
                  {station.address}
                </Text>

                <View style={styles.statsRow}>
                  <Meta label={`${station.available} available`} icon="🔋" />
                  <Meta label={station.distance} icon="📍" />
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.parkingText}>{station.parking}</Text>
                  <Text style={styles.batteryText}>{station.battery}</Text>
                </View>

                <GradientButton label="Book Now" onPress={onBookScooty} height={40} radius={12} />
              </Pressable>
            ))
          ) : (
            <View style={[styles.emptyStateCard, { width: layout.heroCardWidth }]}>
              <Text style={styles.emptyStateTitle}>No live stations yet</Text>
              <Text style={styles.emptyStateText}>The backend returned no nearby stations for this location.</Text>
            </View>
          )}
        </ScrollView>

        <Pressable style={[styles.referralCard, { marginHorizontal: layout.screenX, borderRadius: Math.max(18, Math.round(layout.screenWidth * 0.055)) }]} onPress={onReferPress}>
          <View style={styles.referralTextWrap}>
            <Text style={styles.referralTitle}>Refer & Earn ₹200</Text>
            <Text style={styles.referralSubtitle}>Invite friends and earn after their first ride</Text>

            <View style={styles.shareButton}>
              <ShareIcon size={14} color="#ff7a45" />
              <Text style={styles.shareButtonText}>Share Code</Text>
            </View>
          </View>

          <View style={[styles.referralVisual, { width: layout.referralVisualSize * 1.2, height: layout.referralVisualSize }]}>
            <Image source={ReferPerson} style={styles.referralImage} resizeMode="contain" />
          </View>
        </Pressable>
      </View>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </ScreenSurface>
  );
}

function Meta({ label, icon }: { label: string; icon: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaIcon}>{icon}</Text>
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

const mapPins = [
  { id: '1', left: 26, top: 60 },
  { id: '2', left: 98, top: 36 },
  { id: '3', left: 186, top: 55 },
  { id: '4', left: 58, top: 136 },
  { id: '5', left: 166, top: 132 },
];

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 0,
  },
  heroPanel: {
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: 10,
  },
  locationIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  locationIconText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  smallLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  locationValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    paddingHorizontal: 12,
    height: 35,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  walletIcon: {
    marginRight: 6,
  },
  walletText: {
    color: '#1c1c1e',
    fontSize: 14,
    fontWeight: '600',
  },
  mapCard: {
    height: 248,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#f4f4f4',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    marginBottom: 14,
  },
  mapImage: {
    opacity: 0.85,
  },
  pinBadgeImage: {
    width: 32,
    height: 32,
  },
  centerPinImage: {
    width: 36,
    height: 36,
  },
  referralImage: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: '100%',
    height: '130%',
  },
  mapBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f7efe7',
  },
  mapRoadHorizontal: {
    position: 'absolute',
    left: -20,
    right: -20,
    top: 95,
    height: 1.6,
    backgroundColor: 'rgba(228, 217, 206, 0.85)',
    transform: [{ rotate: '-6deg' }],
  },
  mapRoadHorizontal2: {
    top: 160,
    opacity: 0.58,
    transform: [{ rotate: '8deg' }],
  },
  mapRoadVertical: {
    position: 'absolute',
    top: -10,
    bottom: -10,
    left: 94,
    width: 1.6,
    backgroundColor: 'rgba(228, 217, 206, 0.82)',
    transform: [{ rotate: '8deg' }],
  },
  mapRoadVertical2: {
    left: 210,
    opacity: 0.52,
    transform: [{ rotate: '-10deg' }],
  },
  mapGlowA: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(255,255,255,0.72)',
    left: 86,
    top: 88,
    opacity: 0.88,
  },
  mapGlowB: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: 'rgba(255, 100, 28, 0.08)',
    right: -24,
    bottom: -34,
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#45a84a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#3e9743',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  pinBadgeText: {
    fontSize: 10,
  },
  centerPin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -15,
    marginTop: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff6a33',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff6a33',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  centerPinText: {
    fontSize: 14,
  },
  bookButton: {
    marginBottom: 8,
    shadowColor: '#fc4c02',
    shadowOpacity: 0.26,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  bookButtonIcon: {
    color: '#fff',
    fontSize: 17,
    marginRight: 8,
    fontWeight: '900',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: 28,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  viewAll: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  carouselContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },
  emptyStateCard: {
    minHeight: 180,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.92)',
    padding: 18,
    justifyContent: 'center',
  },
  emptyStateTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyStateText: {
    marginTop: 6,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  stationCard: {
    width: 220,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: '#d8bbb0',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  stationArtworkWrap: {
    height: 126,
    borderRadius: 18,
    backgroundColor: '#f6f1eb',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  artBackdrop: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: 'rgba(255, 147, 106, 0.12)',
    top: -20,
    left: -20,
  },
  scootyImage: {
    width: 154,
    height: 154,
  },
  stationName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
  },
  stationAddress: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    minHeight: 28,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 8,
  },
  metaItem: {
    alignItems: 'flex-start',
    flex: 1,
  },
  metaIcon: {
    fontSize: 11,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 3,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  parkingText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '600',
  },
  batteryText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },
  bookNowPill: {
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  referralCard: {
    marginHorizontal: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#d8bbb0',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  referralTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  referralTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  referralSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 4,
    marginBottom: 10,
    maxWidth: 150,
  },
  shareButton: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff7a45',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shareButtonText: {
    color: '#ff7a45',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
  },
  referralVisual: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralOrb: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(255, 100, 28, 0.09)',
  },
  avatarWrap: {
    position: 'absolute',
    width: 34,
    height: 42,
    alignItems: 'center',
    justifyContent: 'flex-start',
    top: 10,
    left: 24,
  },
  avatarHead: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.textPrimary,
    backgroundColor: 'transparent',
  },
  avatarBody: {
    width: 28,
    height: 18,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: COLORS.textPrimary,
    marginTop: 4,
  },
  phoneMock: {
    position: 'absolute',
    width: 20,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 28, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    right: 8,
    bottom: 8,
    transform: [{ rotate: '8deg' }],
  },
  phoneScreen: {
    width: 14,
    height: 26,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 100, 28, 0.12)',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  phoneTopBar: {
    width: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.button,
    marginTop: 2,
  },
  phoneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.button,
  },
});
