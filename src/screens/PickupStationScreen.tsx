import {
  Image,
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
  CheckIcon,
  SmallScooterIcon,
  WalkerIcon,
} from '../components/RideIcons';

const StationThumb = require('../assets/images/station-thumb.jpg');

export type PickupStation = {
  id: string;
  name: string;
  address: string;
  distance: string;
  available: number;
  battery: string;
  parking: string;
  coordinates?: { latitude: number; longitude: number };
};

export function PickupStationScreen({
  onBack,
  onContinue,
  onSelectStation,
  stations,
  selectedStationId,
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
  const list = stations ?? [];
  const activeId = selectedStationId || list[0]?.id || null;
  const activeStation = list.find((station) => station.id === activeId) || list[0];
  const title = mode === 'drop' ? 'Select Drop Station' : 'Select Pickup Station';
  const pillText =
    mode === 'drop' ? 'Stations available for drop-off' : 'Stations available for your time slot';

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <View style={styles.pillRow}>
        <View style={styles.pill}>
          <CheckIcon size={18} color="#fc4c02" />
          <Text style={styles.pillText}>{pillText}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {list.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No live stations available</Text>
            <Text style={styles.emptyBody}>The backend did not return any stations for this ride step.</Text>
          </View>
        ) : (
          list.map((station) => {
            const active = station.id === activeId;
            return (
              <Pressable
                key={station.id}
                onPress={() => onSelectStation?.(station)}
                style={[styles.card, active && styles.cardActive]}
              >
                <View style={styles.cardTop}>
                  <Image source={StationThumb} style={styles.thumbnail} resizeMode="cover" />
                  <View style={styles.cardText}>
                    <Text style={styles.stationName}>{station.name}</Text>
                    <View style={styles.addressRow}>
                      <AddressPinIcon size={14} color="#4a5565" />
                      <Text style={styles.addressText}>{station.address}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.statsRow}>
                  <Stat
                    icon={<SmallScooterIcon size={18} color="#16a34a" />}
                    label="Available"
                    value={String(station.available)}
                  />
                  <Stat
                    icon={<BatteryIcon size={18} color="#16a34a" />}
                    label="Avg Battery"
                    value={station.battery}
                  />
                  <Stat
                    icon={<WalkerIcon size={18} color="#4a5565" />}
                    label="Distance"
                    value={station.distance}
                  />
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.bottomText}>24/7 Access</Text>
                  <Text style={styles.bottomText}>{station.parking}</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label="Continue to Summary"
          onPress={() => activeStation && onContinue(activeStation)}
          height={56}
        />
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
  header: {
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
    color: '#1c1c1e',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 32,
  },
  pillRow: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 122, 69, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: {
    color: '#363636',
    fontSize: 13,
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 16,
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
  thumbnail: {
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
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  bottomText: {
    color: '#363636',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
  },
});
