import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { BatteryIcon, CalendarIcon, ClockIcon } from '../components/RideIcons';

const RideScene = require('../assets/images/preride-scooter.jpg');

export function RideInProgressScreen({
  onEmergency,
  onPauseResume,
  onEndRide,
  rideTime = '—',
  distance = 0,
  battery = 0,
  speed = 0,
  planName = 'Plan unavailable',
  timeLeft = 'Time remaining unavailable',
}: {
  onEmergency?: () => void;
  onPauseResume?: () => void;
  onEndRide: () => void;
  rideTime?: string;
  distance?: number;
  battery?: number;
  speed?: number;
  planName?: string;
  timeLeft?: string;
}) {
  const [sosOpen, setSosOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const distanceText = `${distance.toFixed(2)} km`;

  return (
    <SafeAreaView style={styles.safe}>
      <Image source={RideScene} style={styles.heroImage} blurRadius={5} resizeMode="cover" />
      <View style={styles.overlay} />

      <View style={styles.topBlock}>
        <View style={styles.planRow}>
          <View style={styles.planIcon}>
            <CalendarIcon size={18} color="#ffffff" />
          </View>
          <View style={styles.planText}>
            <Text style={styles.planLabel}>Active Plan</Text>
            <Text style={styles.planName}>{planName}</Text>
          </View>
          <View style={styles.timeLeftChip}>
            <Text style={styles.timeLeftText}>{timeLeft}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard icon={<ClockIcon size={22} color="#22c55e" />} label="Duration" value={rideTime} />
          <StatCard icon={<GaugeIcon color="#22c55e" />} label="Speed" value={`${speed} km/h`} />
          <StatCard icon={<BatteryIcon size={22} color="#22c55e" />} label="Battery" value={`${battery}%`} />
        </View>
      </View>

      <View style={styles.dial}>
        <Text style={styles.dialValue}>{speed}</Text>
        <Text style={styles.dialUnit}>km/h</Text>
        <Text style={styles.dialDistance}>{distanceText}</Text>
      </View>

      <View style={styles.bottomBlock}>
        <View style={styles.bottomInner}>
          <View style={styles.sessionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionLabel}>Current Session</Text>
              <Text style={styles.sessionTime}>{rideTime}</Text>
              <Text style={styles.sessionDistance}>{distanceText} traveled</Text>
            </View>
            <Pressable
              style={styles.sosButton}
              onPress={() => {
                setSosOpen(true);
                onEmergency?.();
              }}
            >
              <Text style={styles.sosText}>SOS</Text>
            </Pressable>
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              style={styles.pauseButton}
              onPress={() => {
                setPaused((p) => !p);
                onPauseResume?.();
              }}
            >
              <Text style={styles.pauseText}>{paused ? 'Resume Ride' : 'Pause Ride'}</Text>
            </Pressable>
            <Pressable style={styles.endButton} onPress={onEndRide}>
              <Text style={styles.endText}>End Ride</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <SosModal visible={sosOpen} onClose={() => setSosOpen(false)} />
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function SosModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sosOverlay} onPress={onClose} />
      <View style={styles.sosDialogWrap} pointerEvents="box-none">
        <View style={styles.sosDialog}>
          <Pressable style={styles.sosClose} onPress={onClose}>
            <Text style={styles.sosCloseText}>×</Text>
          </Pressable>
          <View style={styles.sosIconCircle}>
            <AlertIcon color="#ef4444" />
          </View>
          <Text style={styles.sosTitle}>Emergency SOS</Text>
          <Text style={styles.sosBody}>
            Need immediate help? Contact emergency services or movyra support.
          </Text>
          <Pressable style={styles.sosCallRed}>
            <PhoneIcon color="#ffffff" />
            <Text style={styles.sosCallRedText}>Call Emergency (100)</Text>
          </Pressable>
          <Pressable style={styles.sosCallOutline}>
            <PhoneIcon color="#fc4c02" />
            <Text style={styles.sosCallOutlineText}>Call Movyra Support</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function GaugeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path d="M3 17a8 8 0 1 1 16 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="m11 15 4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={11} cy={15} r={1.4} fill={color} />
    </Svg>
  );
}

function AlertIcon({ color }: { color: string }) {
  return (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      <Circle cx={16} cy={16} r={13.5} stroke={color} strokeWidth={2} />
      <Rect x={14.5} y={9} width={3} height={10} rx={1.4} fill={color} />
      <Circle cx={16} cy={22} r={1.6} fill={color} />
    </Svg>
  );
}

function PhoneIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M18 14v2.5a1.5 1.5 0 0 1-1.6 1.5A14.5 14.5 0 0 1 3.5 6.1 1.5 1.5 0 0 1 5 4.5h2.5a1 1 0 0 1 1 .8l.7 3.3a1 1 0 0 1-.3 1L7.3 11a11 11 0 0 0 4 4l1.4-1.6a1 1 0 0 1 1-.3l3.3.7a1 1 0 0 1 .8 1.2Z"
        fill={color}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#111827',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  topBlock: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  planIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planText: {
    flex: 1,
  },
  planLabel: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
  },
  planName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  timeLeftChip: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timeLeftText: {
    color: '#363636',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  dial: {
    position: 'absolute',
    left: '50%',
    marginLeft: -96,
    top: '42%',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialValue: {
    color: '#101828',
    fontSize: 60,
    fontWeight: '700',
    lineHeight: 66,
  },
  dialUnit: {
    color: '#4a5565',
    fontSize: 16,
    lineHeight: 22,
  },
  dialDistance: {
    color: '#6a7282',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  bottomBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bottomInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionLabel: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  sessionTime: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  sessionDistance: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
  },
  sosButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    flex: 1,
    height: 51,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
  },
  endButton: {
    flex: 1,
    height: 51,
    borderRadius: 24,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
  },
  sosOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  sosDialogWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sosDialog: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 20 },
    elevation: 12,
  },
  sosClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosCloseText: {
    color: '#363636',
    fontSize: 22,
    lineHeight: 22,
  },
  sosIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffe2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosTitle: {
    color: '#0a0a0a',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  sosBody: {
    color: '#4a5565',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 240,
  },
  sosCallRed: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    height: 48,
    borderRadius: 10,
    backgroundColor: '#ef4444',
  },
  sosCallRedText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  sosCallOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fc4c02',
  },
  sosCallOutlineText: {
    color: '#fc4c02',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
});
