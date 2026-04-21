import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { COLORS } from '../constants/theme';
import type { StationItem } from '../services/userApi';

const ScootyImage = require('../assets/images/scooty.png');

export function SearchScreen({
  onBack,
  stations,
  loading = false,
  selectedStationId,
  onSelectStation,
  onContinue,
}: {
  onBack: () => void;
  stations?: StationItem[] | null;
  loading?: boolean;
  selectedStationId?: string | null;
  onSelectStation?: (station: StationItem) => void;
  onContinue?: () => void;
}) {
  const items = stations && stations.length > 0 ? stations : demoStations;

  return (
    <View style={styles.root}>
      <PageFrame title="Explore Scooty" onBack={onBack} scroll>
        <View style={styles.content}>
          <View style={styles.mapCard}>
            <View style={styles.mapGrid} />
            <View style={styles.mapPin} />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterIcon}>⏳</Text>
            <Text style={styles.filterText}>Filters</Text>
            <View style={styles.filterSpacer} />
            <Text style={styles.filterMeta}>Min Battery: 67%</Text>
            <Text style={styles.filterMeta}>Max Distance: 5 km</Text>
          </View>

          <View style={styles.sliderTrack}>
            <View style={styles.sliderFill} />
            <View style={styles.sliderThumb} />
          </View>

          <View style={styles.stationList}>
            {loading ? (
              <Text style={styles.loadingText}>Loading stations...</Text>
            ) : (
              items.map((station) => (
                <Pressable
                  key={station._id}
                  onPress={() => onSelectStation?.(station)}
                  style={[styles.stationCard, selectedStationId === station._id && styles.stationCardActive]}
                >
                  <Image source={ScootyImage} style={styles.stationImage} resizeMode="cover" />
                  <View style={styles.stationBody}>
                    <Text style={styles.stationName}>{station.name || 'Central Plaza Station'}</Text>
                    <Text style={styles.stationAddress}>{station.address || 'MC Road, Sector 14'}</Text>

                    <View style={styles.metaRow}>
                      <Meta label={`Available ${station.availableScooties ?? 0}`} />
                      <Meta label="Avg Battery 92%" />
                      <Meta label={station.distanceKm != null ? `Distance ${station.distanceKm.toFixed(1)} km` : 'Distance 0.0 km'} />
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>

          <Pressable style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueText}>Continue to Book</Text>
          </Pressable>
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

const demoStations: StationItem[] = [
  {
    _id: 'st1',
    name: 'Central Plaza Station',
    address: 'MC Road, Sector 14',
    availableScooties: 8,
  },
  {
    _id: 'st2',
    name: 'Central Plaza Station',
    address: 'MC Road, Sector 14',
    availableScooties: 8,
  },
  {
    _id: 'st3',
    name: 'Central Plaza Station',
    address: 'MC Road, Sector 14',
    availableScooties: 8,
  },
];

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 18,
  },
  mapCard: {
    height: 184,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.84)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 240, 230, 0.86)',
  },
  mapPin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -8,
    marginTop: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ff5d0f',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.94)',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterIcon: {
    color: COLORS.button,
    fontSize: 13,
    fontWeight: '900',
  },
  filterText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  filterSpacer: {
    flexBasis: '100%',
    height: 0,
  },
  filterMeta: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  sliderTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(33, 48, 74, 0.12)',
    marginBottom: 14,
  },
  sliderFill: {
    width: '72%',
    height: 4,
    borderRadius: 999,
    backgroundColor: COLORS.button,
  },
  sliderThumb: {
    position: 'absolute',
    left: '68%',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.button,
  },
  stationList: {
    gap: 10,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
  stationCard: {
    flexDirection: 'row',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.84)',
    padding: 10,
    alignItems: 'center',
  },
  stationCardActive: {
    borderColor: COLORS.button,
    backgroundColor: 'rgba(255, 100, 28, 0.08)',
  },
  stationImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginRight: 10,
  },
  stationBody: {
    flex: 1,
  },
  stationName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  stationAddress: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  metaItem: {
    paddingHorizontal: 0,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  continueButton: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: COLORS.button,
    alignItems: 'center',
    paddingVertical: 13,
  },
  continueText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});
