import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';

export function BookingConfirmedScreen({
  onBack,
  onViewDetails,
  onBackHome,
  onStartRide,
  bookingId,
  planType,
  amount,
  pickupStationName,
  dropStationName,
  timeSlot,
  duration,
  rideStartsIn,
}: {
  onBack: () => void;
  onViewDetails: () => void;
  onBackHome: () => void;
  onStartRide?: () => void;
  bookingId?: string;
  planType?: string;
  amount?: number;
  pickupStationName?: string;
  dropStationName?: string;
  timeSlot?: string;
  duration?: string;
  rideStartsIn?: string;
}) {
  return (
    <View style={styles.root}>
      <PageFrame title="" onBack={onBack} scroll={false}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Text style={styles.checkMark}>✓</Text>
          </View>

          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.subtitle}>Your scooty ride has been successfully booked</Text>

          <View style={styles.bookingCard}>
            <View style={styles.bookingRow}>
              <Text style={styles.bookingLabel}>Booking ID</Text>
              <Text style={styles.bookingValue}>{bookingId || 'SCT12322'}</Text>
            </View>

            <View style={[styles.bookingRow, styles.borderTop]}>
              <Text style={styles.bookingLabel}>Plan Type</Text>
              <Text style={styles.bookingValue}>{planType || 'Full Day'}</Text>
            </View>

            <View style={[styles.bookingRow, styles.borderTop]}>
              <Text style={styles.bookingLabel}>Ride starts in</Text>
              <Text style={styles.bookingValue}>{rideStartsIn || '15 mins'}</Text>
              <Text style={styles.bookingSubtext}>Please arrive 15 mins early</Text>
            </View>

            <View style={[styles.bookingRow, styles.borderTop]}>
              <Text style={styles.bookingLabel}>Amount</Text>
              <Text style={styles.bookingValue}>₹{amount ?? 0}</Text>
            </View>
          </View>

          <View style={styles.pickupBox}>
            <Text style={styles.pickupTitle}>Drop Instructions</Text>
            <View style={styles.pickupItem}>
              <Text style={styles.pickupLabel}>📍 Drop Station</Text>
              <Text style={styles.pickupValue}>{dropStationName || pickupStationName || 'Central Plaza'}</Text>
            </View>
            <View style={styles.pickupItem}>
              <Text style={styles.pickupLabel}>📅 Time Slot</Text>
              <Text style={styles.pickupValue}>{timeSlot || '6:00 PM - 7:00 PM'}</Text>
            </View>
            <View style={styles.pickupItem}>
              <Text style={styles.pickupLabel}>⏱ Ride Duration</Text>
              <Text style={styles.pickupValue}>{duration || '1 Hour'}</Text>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            {onStartRide ? (
              <PrimaryButton label="Start Ride" onPress={onStartRide} style={styles.startRideButton} />
            ) : null}
            <PrimaryButton label="View Details" onPress={onViewDetails} />
          </View>

          <Pressable style={styles.secondaryButton} onPress={onViewDetails}>
            <Text style={styles.secondaryText}>Share</Text>
          </Pressable>

          <Pressable onPress={onBackHome}>
            <Text style={styles.backLink}>Back to Home</Text>
          </Pressable>
        </View>
      </PageFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkMark: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '900',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  bookingCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 16,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(33, 48, 74, 0.08)',
  },
  bookingLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  bookingValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  bookingSubtext: {
    position: 'absolute',
    bottom: -18,
    right: 0,
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  pickupBox: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 20,
  },
  pickupTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 10,
  },
  pickupItem: {
    marginBottom: 12,
  },
  pickupLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  pickupValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  buttonGroup: {
    width: '100%',
  },
  startRideButton: {
    marginBottom: 10,
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryText: {
    color: COLORS.button,
    fontSize: 13,
    fontWeight: '700',
  },
  backLink: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
