import React from 'react';
import { StyleSheet, Text, View, Pressable, FlatList } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';

export type ParkingStation = {
  id: string;
  name: string;
  distance: number;
  address: string;
  availableSpots: number;
};

export function SelectParkingStationScreen({
  onBack,
  onSelectStation,
  stations,
}: {
  onBack: () => void;
  onSelectStation: (station: ParkingStation) => void;
  stations?: ParkingStation[];
}) {
  const defaultStations: ParkingStation[] = [
    {
      id: '1',
      name: 'Central Plaza',
      distance: 0.2,
      address: 'MG Road',
      availableSpots: 5,
    },
    {
      id: '2',
      name: 'Tech Park',
      distance: 0.7,
      address: 'Whitefield',
      availableSpots: 12,
    },
    {
      id: '3',
      name: 'Mall Road',
      distance: 1.1,
      address: 'Indiranagar',
      availableSpots: 8,
    },
  ];

  return (
    <View style={styles.root}>
      <PageFrame title="Select Parking Station" onBack={onBack}>
        <Text style={styles.subtitle}>Choose a nearby station to park your scooter</Text>

        <FlatList
          data={stations || defaultStations}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.stationCard}
              onPress={() => onSelectStation(item)}
            >
              <View style={styles.stationContent}>
                <View style={styles.stationHeader}>
                  <Text style={styles.stationName}>{item.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      item.availableSpots > 0
                        ? styles.statusAvailable
                        : styles.statusFull,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {item.availableSpots > 0 ? 'Available' : 'Full'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.stationAddress}>📍 {item.address}</Text>
                <View style={styles.stationMeta}>
                  <Text style={styles.distance}>📍 0.{item.distance} km away</Text>
                  <Text style={styles.spots}>
                    🅿️ {item.availableSpots} Spots available
                  </Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          )}
        />
      </PageFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 16,
  },
  stationCard: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  stationContent: {
    flex: 1,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stationName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusAvailable: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  statusFull: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  stationAddress: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 6,
  },
  stationMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  distance: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  spots: {
    color: COLORS.button,
    fontSize: 10,
    fontWeight: '700',
  },
  arrow: {
    color: COLORS.textSecondary,
    fontSize: 20,
    fontWeight: '700',
  },
});
