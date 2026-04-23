import {
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import {
  AddressPinIcon,
  ArrowLeftIcon,
  BatteryIcon,
  FilterIcon,
  SmallScooterIcon,
  WalkerIcon,
} from '../components/RideIcons';
import type { StationItem } from '../services/userApi';

const MapBackground = require('../assets/images/explore-map-bg.png');
const StationThumb = require('../assets/images/station-thumb.jpg');
const ScootyMarker = require('../assets/images/scooty-marker.png');
const RedPin = require('../assets/images/red-pin.png');

const MAP_PINS = [
  { left: 68, top: 130 },
  { left: 290, top: 88 },
  { left: 280, top: 182 },
  { left: 150, top: 196 },
  { left: 172, top: 80 },
];

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
  const items = stations ?? [];
  const activeId = selectedStationId || items[0]?._id || null;

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <ImageBackground source={MapBackground} style={styles.map} imageStyle={styles.mapImage} resizeMode="cover">
        {MAP_PINS.map((pin, idx) => (
          <Image
            key={idx}
            source={ScootyMarker}
            style={[styles.pin, { left: pin.left, top: pin.top }]}
            resizeMode="contain"
          />
        ))}
        <Image source={RedPin} style={styles.centerPin} resizeMode="contain" />
      </ImageBackground>

      <View style={styles.header} pointerEvents="box-none">
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>Explore Scooty</Text>
      </View>

      <View style={styles.filtersBlock}>
        <View style={styles.filterTitleRow}>
          <FilterIcon size={18} color="#fc4c02" />
          <Text style={styles.filterTitle}>Filters</Text>
        </View>

        <View style={styles.sliderRow}>
          <View style={styles.sliderCol}>
            <Text style={styles.sliderLabel}>Min Battery: 67%</Text>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: '67%' }]} />
              <View style={[styles.sliderThumb, { left: '64%' }]} />
            </View>
          </View>
          <View style={styles.sliderCol}>
            <Text style={styles.sliderLabel}>Max Distance: 5 km</Text>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: '72%' }]} />
              <View style={[styles.sliderThumb, { left: '69%' }]} />
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading stations...</Text>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No live stations found</Text>
            <Text style={styles.emptyBody}>The backend did not return any available stations for this area yet.</Text>
          </View>
        ) : (
          items.map((station) => {
            const active = station._id === activeId;
            const distance =
              station.distanceKm != null ? `${station.distanceKm.toFixed(1)} km` : '—';
            return (
              <Pressable
                key={station._id}
                onPress={() => onSelectStation?.(station)}
                style={[styles.card, active && styles.cardActive]}
              >
                <View style={styles.cardTop}>
                  <Image source={StationThumb} style={styles.cardThumb} resizeMode="cover" />
                  <View style={styles.cardText}>
                    <Text style={styles.stationName}>{station.name || 'Station unavailable'}</Text>
                    <View style={styles.addressRow}>
                      <AddressPinIcon size={14} color="#4a5565" />
                      <Text style={styles.addressText}>{station.address || 'Address unavailable'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.statsRow}>
                  <Stat
                    icon={<SmallScooterIcon size={18} color="#16a34a" />}
                    label="Available"
                    value={String(station.availableScooties ?? 0)}
                  />
                  <Stat
                    icon={<BatteryIcon size={18} color="#16a34a" />}
                    label="Avg Battery"
                    value="—"
                  />
                  <Stat
                    icon={<WalkerIcon size={18} color="#4a5565" />}
                    label="Distance"
                    value={distance}
                  />
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton label="Continue to Book" onPress={() => onContinue?.()} height={52} />
      </View>
    </SafeAreaView>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statBlock}>
      <View style={styles.statRow}>
        {icon}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  map: {
    height: 272,
    width: '100%',
  },
  mapImage: {
    opacity: 0.4,
  },
  pin: {
    position: 'absolute',
    width: 32,
    height: 32,
  },
  centerPin: {
    position: 'absolute',
    left: '50%',
    top: 138,
    marginLeft: -18,
    width: 36,
    height: 36,
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 56,
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
    color: '#0f172a',
    fontSize: 21,
    fontWeight: '500',
    lineHeight: 32,
  },
  filtersBlock: {
    paddingHorizontal: 21,
    paddingTop: 14,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  filterTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  sliderRow: {
    flexDirection: 'row',
    gap: 14,
  },
  sliderCol: {
    flex: 1,
    gap: 6,
  },
  sliderLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
    position: 'relative',
    marginTop: 6,
  },
  sliderFill: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#fc4c02',
  },
  sliderThumb: {
    position: 'absolute',
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fc4c02',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  list: {
    flex: 1,
    marginTop: 16,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 120,
    gap: 16,
  },
  loadingText: {
    color: '#4a5565',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyState: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 18,
    gap: 6,
  },
  emptyTitle: {
    color: '#363636',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  emptyBody: {
    color: '#4a5565',
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 10,
    gap: 10,
  },
  cardActive: {
    borderColor: '#fc4e05',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardThumb: {
    width: 71,
    height: 70,
    borderRadius: 11,
  },
  cardText: {
    flex: 1,
    gap: 6,
  },
  stationName: {
    color: '#363636',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 22,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addressText: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 2,
  },
  statBlock: {
    flex: 1,
    gap: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    color: '#6a7282',
    fontSize: 12,
    lineHeight: 16,
  },
  statValue: {
    color: '#363636',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginLeft: 24,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 25,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
  },
});
