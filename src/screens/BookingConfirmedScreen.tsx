import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { ShareIcon } from '../components/HomeIcons';
import {
  CalendarIcon,
  ClockIcon,
  LocationIcon,
  SmallScooterIcon,
} from '../components/RideIcons';

export function BookingConfirmedScreen({
  onViewDetails,
  onBackHome,
  onStartRide,
  bookingId,
  pickupStationName,
  timeSlot,
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
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successCircle}>
          <Text style={styles.successCheck}>✓</Text>
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>Your scooty ride has been successfully booked</Text>

        <View style={styles.idCard}>
          <Text style={styles.idText}>Booking ID : {bookingId || 'Unavailable'}</Text>
        </View>

        <View style={styles.timerCard}>
          <ClockIcon size={32} color="#363636" />
          <Text style={styles.timerLabel}>Ride starts in</Text>
          <Text style={styles.timerValue}>{rideStartsIn || 'Time unavailable'}</Text>
          <Text style={styles.timerHint}>Please arrive 5 minutes early</Text>
        </View>

        <View style={styles.pickupCard}>
          <Text style={styles.pickupTitle}>Pickup Instructions</Text>
          <View style={styles.pickupRow}>
            <LocationIcon size={22} color="#363636" />
            <View style={styles.pickupText}>
              <Text style={styles.pickupLabel}>Pickup Station</Text>
              <Text style={styles.pickupValue}>{pickupStationName || 'Station unavailable'}</Text>
            </View>
          </View>
          <View style={styles.pickupRow}>
            <CalendarIcon size={22} color="#363636" />
            <View style={styles.pickupText}>
              <Text style={styles.pickupLabel}>Time Slot</Text>
              <Text style={styles.pickupValue}>{timeSlot || '—'}</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.directionsButton} onPress={onStartRide}>
          <SmallScooterIcon size={20} color="#fc5109" />
          <Text style={styles.directionsText}>Get Directions</Text>
        </Pressable>

        <View style={styles.secondaryRow}>
          <Pressable style={styles.secondaryButton} onPress={onViewDetails}>
            <ShareIcon size={16} color="#4b5563" />
            <Text style={styles.secondaryText}>Share</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onViewDetails}>
            <Text style={styles.secondaryText}>My Bookings</Text>
          </Pressable>
        </View>

        <Pressable style={styles.backHomeRow} onPress={onBackHome}>
          <Text style={styles.backHomeText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 32,
    alignItems: 'center',
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#69df48',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 20 },
    elevation: 8,
  },
  successCheck: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
  },
  title: {
    marginTop: 24,
    color: '#363636',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: '#363636',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  idCard: {
    marginTop: 24,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  idText: {
    color: '#363636',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  timerCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  timerLabel: {
    color: '#363636',
    fontSize: 14,
    lineHeight: 20,
  },
  timerValue: {
    color: '#363636',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  timerHint: {
    color: '#363636',
    fontSize: 12,
    lineHeight: 16,
  },
  pickupCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    gap: 20,
  },
  pickupTitle: {
    color: '#363636',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 27,
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pickupText: {
    flex: 1,
  },
  pickupLabel: {
    color: '#4a5565',
    fontSize: 12,
    lineHeight: 16,
  },
  pickupValue: {
    marginTop: 2,
    color: '#363636',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  directionsButton: {
    marginTop: 16,
    width: '100%',
    height: 56,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: '#fc5109',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  directionsText: {
    color: '#fc5109',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 28,
  },
  secondaryRow: {
    marginTop: 16,
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 40,
    borderRadius: 36,
    borderWidth: 1.2,
    borderColor: '#d1d5db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  backHomeRow: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backHomeText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
