import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';

export function RideInProgressScreen({
  onEmergency,
  onPauseResume,
  onEndRide,
  rideTime,
  distance,
  battery,
  speed,
}: {
  onEmergency: () => void;
  onPauseResume: () => void;
  onEndRide: () => void;
  rideTime?: string;
  distance?: number;
  battery?: number;
  speed?: number;
}) {
  return (
    <View style={styles.root}>
      <PageFrame title="" onBack={() => {}} scroll={false}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>TIME</Text>
            <Text style={styles.statValue}>{rideTime || '0:05'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>SPEED</Text>
            <Text style={styles.statValue}>{speed || 15} km/h</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>BATTERY</Text>
            <Text style={styles.statValue}>{battery || 92}%</Text>
          </View>
        </View>

        <View style={styles.sosContainer}>
          <Pressable style={styles.sosButton} onPress={onEmergency}>
            <Text style={styles.sosIcon}>🚨</Text>
            <Text style={styles.sosText}>Emergency SOS</Text>
          </Pressable>
          <Text style={styles.sosSubtext}>Need immediate help? Contact emergency services or MOVYRA support.</Text>
        </View>

        <View style={styles.controlButtons}>
          <Pressable style={styles.controlButton} onPress={onPauseResume}>
            <Text style={styles.controlIcon}>⏸️</Text>
            <Text style={styles.controlLabel}>Pause Ride</Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={onEndRide}>
            <Text style={styles.controlIcon}>⏹️</Text>
            <Text style={styles.controlLabel}>End Ride</Text>
          </Pressable>
        </View>
      </PageFrame>

      <View style={styles.bottomControls}>
        <Pressable style={styles.controlAction} onPress={onPauseResume}>
          <Text>Pause Ride</Text>
        </Pressable>
        <PrimaryButton label="End Ride" onPress={onEndRide} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  liveText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  sosContainer: {
    marginBottom: 16,
  },
  sosButton: {
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    borderWidth: 2,
    borderColor: '#ef4444',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sosIcon: {
    fontSize: 20,
  },
  sosText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '900',
  },
  sosSubtext: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 8,
    lineHeight: 14,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  controlButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 12,
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  controlLabel: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  controlAction: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.button,
  },
});
