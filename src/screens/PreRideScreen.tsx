import { useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import { ScooterIcon } from '../components/HomeIcons';
import {
  ArrowLeftIcon,
  BatteryIcon,
  WalletCardIcon,
} from '../components/RideIcons';

const ScooterPhoto = require('../assets/images/preride-scooter.jpg');

type Destination = {
  id: string;
  label: string;
  icon: (color: string) => React.ReactNode;
};

const DESTINATIONS: Destination[] = [
  { id: 'work', label: 'Office / Work', icon: (c) => <BriefcaseIcon color={c} /> },
  { id: 'home', label: 'Home', icon: (c) => <HomeIcon color={c} /> },
  { id: 'market', label: 'Market / Errand', icon: (c) => <CartIcon color={c} /> },
  { id: 'college', label: 'College', icon: (c) => <CapIcon color={c} /> },
  { id: 'trip', label: 'Short Trip', icon: (c) => <CompassIcon color={c} /> },
  { id: 'roaming', label: 'Just roaming', icon: (c) => <RoamIcon color={c} /> },
  { id: 'map', label: 'Select on map', icon: (c) => <MapIcon color={c} /> },
];

export function PreRideScreen({
  onBack,
  onStartRide,
  scootyId = 'Unavailable',
  scootyModel,
  scootyBattery = null,
  planName,
  totalPayable,
  walletBalance = 0,
  loading = false,
}: {
  onBack: () => void;
  onStartRide: (destinationId: string | null) => void;
  scootyId?: string;
  scootyModel?: string;
  scootyBattery?: number | null;
  planName?: string;
  totalPayable?: number;
  walletBalance?: number;
  loading?: boolean;
}) {
  const [destination, setDestination] = useState<string | null>(null);
  const hasBattery = scootyBattery != null && Number.isFinite(scootyBattery);
  const batteryText = hasBattery ? `${scootyBattery}%` : '—';
  // Rough range estimate from battery (~60 km on a full charge).
  const rangeText = hasBattery ? `${Math.round((scootyBattery as number) * 0.6)} km` : '—';
  // Minimum wallet balance requirement disabled for now:
  // const walletOk = walletBalance >= 50;
  const walletOk = true;

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#363636" />
        </Pressable>
        <Text style={styles.headerTitle}>Confirm Ride</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image source={ScooterPhoto} style={styles.hero} resizeMode="cover" />

        <View style={styles.body}>
          <View style={styles.card}>
            <View style={styles.scootyHeader}>
              <View style={styles.scootyIconBox}>
                <ScooterIcon size={30} color="#fc4c02" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.scootyId}>{scootyId}</Text>
                {scootyModel ? <Text style={styles.scootyPlate}>{scootyModel}</Text> : null}
              </View>
            </View>

            <View style={styles.scootyStatsRow}>
              <View style={styles.scootyStat}>
                <BatteryIcon size={22} color="#16a34a" />
                <View>
                  <Text style={styles.statLabel}>Battery</Text>
                  <Text style={styles.statValue}>{batteryText}</Text>
                </View>
              </View>
              <View style={styles.scootyStat}>
                <GaugeIcon color="#363636" />
                <View>
                  <Text style={styles.statLabel}>Range</Text>
                  <Text style={styles.statValue}>{rangeText}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fare Details</Text>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Plan</Text>
              <Text style={styles.fareValue}>{planName || '—'}</Text>
            </View>
            <View style={styles.fareDivider} />
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Total Amount</Text>
              <Text style={styles.fareTotal}>₹{totalPayable ?? 0}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.destHeader}>
              <Text style={styles.cardTitle}>Where are you planning to go?</Text>
              <Text style={styles.destOptional}>(Optional)</Text>
            </View>

            <View style={styles.destGrid}>
              {DESTINATIONS.slice(0, 6).map((dest) => {
                const active = destination === dest.id;
                return (
                  <Pressable
                    key={dest.id}
                    style={[styles.destTile, active && styles.destTileActive]}
                    onPress={() => setDestination(active ? null : dest.id)}
                  >
                    {dest.icon(active ? '#fc4c02' : '#363636')}
                    <Text style={[styles.destLabel, active && styles.destLabelActive]}>
                      {dest.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={[styles.destTileWide, destination === 'map' && styles.destTileActive]}
              onPress={() => setDestination(destination === 'map' ? null : 'map')}
            >
              <MapIcon color={destination === 'map' ? '#fc4c02' : '#363636'} />
              <Text
                style={[styles.destLabel, destination === 'map' && styles.destLabelActive]}
              >
                Select on map
              </Text>
            </Pressable>

            <View style={styles.destNoteBox}>
              <Text style={styles.destNoteText}>
                This helps us manage stations better. Destination is not locked.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.walletRow}>
              <WalletCardIcon size={22} color="#363636" />
              <View style={{ flex: 1 }}>
                <Text style={styles.walletLabel}>Wallet Balance</Text>
                <Text style={styles.walletAmount}>₹{walletBalance}</Text>
              </View>
              <View style={styles.walletChip}>
                <Text style={styles.walletChipText}>{walletOk ? 'Sufficient' : 'Low'}</Text>
              </View>
            </View>
            {/* Minimum balance requirement disabled for now:
            <Text style={styles.walletNote}>Minimum balance required: ₹50</Text> */}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label={loading ? 'Starting...' : 'Start Ride'}
          onPress={() => onStartRide(destination)}
          disabled={loading || !walletOk}
          height={52}
        />
        <Text style={styles.footerNote}>By starting, you agree to the terms and conditions</Text>
      </View>
    </SafeAreaView>
  );
}

function BriefcaseIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Rect x={4} y={9} width={20} height={14} rx={2} stroke={color} strokeWidth={1.8} />
      <Path d="M10 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Path
        d="M4 13 14 5l10 8v9a2 2 0 0 1-2 2h-4v-7h-8v7H6a2 2 0 0 1-2-2v-9Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CartIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Path
        d="M3 5h3l2.4 11.5A2 2 0 0 0 10.3 18h10.2a2 2 0 0 0 2-1.5l2-7.5H7"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={11} cy={23} r={1.5} fill={color} />
      <Circle cx={20} cy={23} r={1.5} fill={color} />
    </Svg>
  );
}

function CapIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Path
        d="m2 11 12-5 12 5-12 5L2 11Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M7 13v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function CompassIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Circle cx={14} cy={14} r={10} stroke={color} strokeWidth={1.8} />
      <Path d="m18 10-6 2-2 6 6-2 2-6Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function RoamIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Circle cx={14} cy={14} r={10} stroke={color} strokeWidth={1.8} />
      <Path d="M4 14h20M14 4c3.5 4 3.5 16 0 20M14 4c-3.5 4-3.5 16 0 20" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function MapIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Path
        d="m3 7 7-3 8 3 7-3v18l-7 3-8-3-7 3V7Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M10 4v18M18 7v18" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function GaugeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M3 17a8 8 0 1 1 16 0"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path d="m11 15 4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={11} cy={15} r={1.4} fill={color} />
    </Svg>
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
    color: '#363636',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  hero: {
    width: '100%',
    height: 224,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  scootyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scootyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scootyId: {
    color: '#363636',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  scootyPlate: {
    color: '#4a5565',
    fontSize: 16,
    lineHeight: 22,
  },
  scootyStatsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  scootyStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  statValue: {
    color: '#363636',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  cardTitle: {
    color: '#363636',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 27,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareLabel: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  fareValue: {
    color: '#363636',
    fontSize: 14,
    lineHeight: 20,
  },
  fareTotal: {
    color: '#363636',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  fareDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  destHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
  },
  destOptional: {
    color: '#6a7282',
    fontSize: 12,
    lineHeight: 16,
  },
  destGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  destTile: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.4)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 8,
  },
  destTileWide: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.4)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 8,
  },
  destTileActive: {
    borderColor: '#fc4c02',
    backgroundColor: 'rgba(255, 122, 69, 0.15)',
  },
  destLabel: {
    color: '#363636',
    fontSize: 12,
    lineHeight: 16,
  },
  destLabelActive: {
    color: '#fc4c02',
    fontWeight: '600',
  },
  destNoteBox: {
    backgroundColor: 'rgba(239, 246, 255, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(190, 219, 255, 0.5)',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  destNoteText: {
    color: '#363636',
    fontSize: 12,
    lineHeight: 16,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletLabel: {
    color: '#363636',
    fontSize: 14,
    lineHeight: 20,
  },
  walletAmount: {
    color: '#363636',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  walletChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  walletChipText: {
    color: '#363636',
    fontSize: 12,
    lineHeight: 16,
  },
  walletNote: {
    color: '#363636',
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    gap: 8,
  },
  footerNote: {
    color: '#363636',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
