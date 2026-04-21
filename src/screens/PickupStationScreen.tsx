import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';

const StationImage = require('../assets/images/booking.png');

export type PickupStation = {
  id: string;
  name: string;
  address: string;
  distance: string;
  available: number;
  battery: string;
  parking: string;
};

const defaultStations: PickupStation[] = [
  {
    id: '1',
    name: 'Central Plaza Station',
    address: 'MC Road, Sector 14',
    distance: '0.2 km',
    available: 8,
    battery: '92%',
    parking: 'Covered Parking',
  },
  {
    id: '2',
    name: 'Uptown Junction',
    address: 'Ring Road, Block B',
    distance: '0.5 km',
    available: 6,
    battery: '88%',
    parking: 'Street Parking',
  },
  {
    id: '3',
    name: 'City Center Hub',
    address: 'Main Market Road',
    distance: '0.8 km',
    available: 4,
    battery: '95%',
    parking: 'Covered Parking',
  },
  {
    id: '4',
    name: 'Lake View Station',
    address: 'Park Lane, South Block',
    distance: '1.2 km',
    available: 5,
    battery: '91%',
    parking: 'Covered Parking',
  },
];

export function PickupStationScreen({
  onBack,
  onContinue,
  onSelectStation,
  stations,
  selectedStationId,
  planTitle,
  scheduleLabel,
  mode = 'pickup',
}: {
  onBack: () => void;
  onContinue: (station: PickupStation) => void;
  onSelectStation?: (station: PickupStation) => void;
  stations?: PickupStation[];
  selectedStationId?: string | null;
  planTitle?: string;
  scheduleLabel?: string;
  mode?: 'pickup' | 'drop';
}) {
  const list = stations && stations.length > 0 ? stations : defaultStations;
  const activeStation = list.find((station) => station.id === selectedStationId) || list[0];
  const pageTitle = mode === 'drop' ? 'Select Drop Station' : 'Select Pickup Station';
  const heroTitle = mode === 'drop' ? 'Choose a drop station for ride end.' : 'Choose a station close to you.';
  const heroSubtitle =
    mode === 'drop'
      ? 'We’ll use this station when you finish the ride and return the scooty.'
      : 'We’ll use the best pickup point for your ride window and keep your reservation flow moving.';
  const bannerTitle =
    mode === 'drop' ? 'Stations available for your drop-off' : 'Stations available for your time slot';
  const bannerText =
    mode === 'drop'
      ? 'Tap a station card to lock in the return point before ending the ride.'
      : 'Tap a station card to lock it in before confirming the ride.';
  const footerTitle = mode === 'drop' ? 'Best drop nearby' : 'Best pickup nearby';
  const footerText =
    mode === 'drop'
      ? 'The selected drop station will be carried into the ride-finish flow so we can close the trip cleanly.'
      : 'The selected station will be carried into the final confirmation screen so we can keep the booking details together.';

  return (
    <View style={styles.root}>
      <PageFrame
        title={pageTitle}
        subtitle={mode === 'drop' ? '04. Drop Scooty' : '03. Search'}
        onBack={onBack}
        scroll
      >
        <View style={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View style={styles.heroTopRow}>
              <View style={styles.stepPill}>
                <Text style={styles.stepPillText}>{mode === 'drop' ? 'Station drop-off' : 'Station pick-up'}</Text>
              </View>
              <Text style={styles.heroStepText}>{`${list.length} stations nearby`}</Text>
            </View>

            <View style={styles.heroMainRow}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>{heroTitle}</Text>
                <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
              </View>

              <View style={styles.heroVisual}>
                <Image source={StationImage} style={styles.heroImage} resizeMode="contain" />
              </View>
            </View>

            <View style={styles.heroStatsRow}>
              <InfoPill label="Plan" value={planTitle || 'Selected'} />
              <InfoPill label="Time" value={scheduleLabel || 'Flexible'} />
              <InfoPill label="Support" value="24/7" />
            </View>
          </View>

          <View style={styles.banner}>
            <Text style={styles.bannerIcon}>✓</Text>
            <View style={styles.bannerCopy}>
              <Text style={styles.bannerTitle}>{bannerTitle}</Text>
              <Text style={styles.bannerText}>{bannerText}</Text>
            </View>
          </View>

          {list.map((station) => {
            const active = selectedStationId === station.id;
            return (
              <Pressable
                key={station.id}
                onPress={() => onSelectStation?.(station)}
                style={({ pressed }) => [styles.card, active && styles.cardActive, pressed && styles.cardPressed]}
              >
                <View style={styles.cardTop}>
                  <View style={styles.thumbnailWrap}>
                    <Image source={StationImage} style={styles.thumbnail} resizeMode="cover" />
                    <View style={styles.thumbnailBadge}>
                      <Text style={styles.thumbnailBadgeText}>{station.available} ready</Text>
                    </View>
                  </View>

                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.stationName}>{station.name}</Text>
                      {active ? (
                        <View style={styles.selectedBadge}>
                          <Text style={styles.selectedBadgeText}>Selected</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.stationAddress}>📍 {station.address}</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Meta label={`Available ${station.available}`} />
                  <Meta label={`Avg Battery ${station.battery}`} />
                  <Meta label={`Distance ${station.distance}`} />
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>24/7 Access</Text>
                  <Text style={styles.footerText}>{station.parking}</Text>
                </View>
              </Pressable>
            );
          })}

          <View style={styles.footerNote}>
            <Text style={styles.footerNoteTitle}>{footerTitle}</Text>
            <Text style={styles.footerNoteText}>{footerText}</Text>
          </View>

          <PrimaryButton
            label="Continue to Summary"
            onPress={() => onContinue(activeStation)}
            style={styles.continueButton}
          />
        </View>
      </PageFrame>
    </View>
  );
}

function Meta({ label }: { label: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroStatPill}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 18,
    gap: 12,
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    padding: 16,
    overflow: 'hidden',
  },
  heroGlowOne: {
    position: 'absolute',
    right: -34,
    top: -28,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 100, 28, 0.1)',
  },
  heroGlowTwo: {
    position: 'absolute',
    left: -26,
    bottom: -28,
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: 'rgba(255, 182, 112, 0.16)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 100, 28, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  stepPillText: {
    color: COLORS.button,
    fontSize: 11,
    fontWeight: '800',
  },
  heroStepText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 8,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  heroVisual: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 88,
    height: 88,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  heroStatPill: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  heroStatValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  heroStatLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 100, 28, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 28, 0.12)',
    padding: 12,
  },
  bannerIcon: {
    color: COLORS.button,
    fontSize: 14,
    fontWeight: '900',
    marginRight: 8,
    marginTop: 1,
  },
  bannerCopy: {
    flex: 1,
  },
  bannerTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  bannerText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  card: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.86)',
    padding: 12,
  },
  cardPressed: {
    opacity: 0.94,
  },
  cardActive: {
    borderColor: COLORS.button,
    backgroundColor: 'rgba(255, 100, 28, 0.08)',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  thumbnailWrap: {
    marginRight: 10,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 16,
  },
  thumbnailBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(33,48,74,0.76)',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  thumbnailBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  cardHeader: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stationName: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  selectedBadge: {
    borderRadius: 999,
    backgroundColor: 'rgba(255, 100, 28, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedBadgeText: {
    color: COLORS.button,
    fontSize: 10,
    fontWeight: '800',
  },
  stationAddress: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  metaItem: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.86)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  footerNote: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.84)',
    padding: 14,
    gap: 6,
  },
  footerNoteTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  footerNoteText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  continueButton: {
    marginTop: 4,
  },
});
