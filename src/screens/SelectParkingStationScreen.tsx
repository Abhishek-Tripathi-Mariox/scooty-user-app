import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import {
  ArrowLeftIcon,
  SmallScooterIcon,
  WalkerIcon,
} from '../components/RideIcons';

const StationThumb = require('../assets/images/station-thumb.jpg');

export type ParkingStation = {
  id: string;
  name: string;
  distance: number;
  address: string;
  availableSpots: number;
  totalSpots?: number;
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
  const list = stations ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Select Parking Station</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Choose a nearby station to park your scooter</Text>

        {list.length === 0 ? (
          <Text style={styles.emptyText}>No parking stations returned by the backend.</Text>
        ) : (
          list.map((station) => (
            <Pressable
              key={station.id}
              style={styles.card}
              onPress={() => onSelectStation(station)}
            >
              <View style={styles.cardTop}>
                <Image source={StationThumb} style={styles.thumbnail} resizeMode="cover" />
                <View style={styles.cardText}>
                  <Text style={styles.stationName}>{station.name}</Text>
                  <View style={styles.distanceRow}>
                    <WalkerIcon size={18} color="#4a5565" />
                    <Text style={styles.distanceText}>{station.distance.toFixed(1)} km away</Text>
                  </View>
                </View>
                <View style={styles.arrowWrap}>
                  <ArrowIcon color="#22c55e" />
                </View>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.slotsRow}>
                  <SmallScooterIcon size={18} color="#4a5565" />
                  <Text style={styles.slotsText}>
                    {station.availableSpots}/{station.totalSpots ?? 10} slots available
                  </Text>
                </View>
                <View style={styles.availableChip}>
                  <Text style={styles.availableText}>Available</Text>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ArrowIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 16V4M10 4l-5 5M10 4l5 5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.26)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.6)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    marginLeft: 8,
    color: '#1c1c1e',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  emptyText: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: 20,
  },
  subtitle: {
    color: '#4a5565',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 11,
  },
  cardText: {
    flex: 1,
  },
  stationName: {
    color: '#363636',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 27,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  distanceText: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  arrowWrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotsText: {
    color: '#364153',
    fontSize: 14,
    lineHeight: 20,
  },
  availableChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  availableText: {
    color: '#05df72',
    fontSize: 12,
    lineHeight: 16,
  },
});
