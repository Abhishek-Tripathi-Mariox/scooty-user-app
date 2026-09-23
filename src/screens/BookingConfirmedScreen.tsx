import { Alert, Linking, Platform, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { ShareIcon } from '../components/HomeIcons';
import {
  CalendarIcon,
  ClockIcon,
  LocationIcon,
  SmallScooterIcon,
} from '../components/RideIcons';
import { useStyles } from '../utils/responsiveStyles';

export function BookingConfirmedScreen({
  onViewDetails,
  onBackHome,
  onStartRide,
  canStartRide = true,
  bookingId,
  pickupStationName,
  timeSlot,
  rideStartsIn,
  pickupLat,
  pickupLng,
  pending = false,
  rideOtp,
  otpLoading = false,
}: {
  onBack: () => void;
  onViewDetails: () => void;
  onBackHome: () => void;
  onStartRide?: () => void;
  canStartRide?: boolean;
  bookingId?: string;
  planType?: string;
  amount?: number;
  pickupStationName?: string;
  dropStationName?: string;
  timeSlot?: string;
  duration?: string;
  rideStartsIn?: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  pending?: boolean;
  rideOtp?: string;
  otpLoading?: boolean;
}) {
  const openMaps = async () => {
    if (typeof pickupLat !== 'number' || typeof pickupLng !== 'number') {
      Alert.alert(
        'Pickup location unavailable',
        'GPS coordinates for this pickup station are not set yet.',
      );
      return;
    }
    const q = `${pickupLat},${pickupLng}`;
    const url = Platform.select({
      ios: `maps://maps.apple.com/?q=${q}`,
      android: `geo:${q}?q=${q}`,
      default: `https://www.google.com/maps/search/?api=1&query=${q}`,
    });
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error('No maps app');
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open Maps', 'Please install a maps application or try again.');
    }
  };
  const styles = useStyles(RAW_STYLES);
  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {rideOtp ? (
          <View style={styles.otpPill}>
            <Text style={styles.otpPillText}>
              <Text style={styles.otpPillLabel}>OTP</Text>
              <Text style={styles.otpPillDigits}>- {rideOtp}</Text>
            </Text>
          </View>
        ) : null}

        <View style={[styles.successCircle, pending ? styles.pendingCircle : null]}>
          {pending ? (
            <Text style={styles.successCheck}>{'⏳'}</Text>
          ) : (
            // Green disc, white inner disc, green tick.
            <View style={styles.successInner}>
              <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
                <Path
                  d="m6 12.5 4 4 8-9"
                  stroke="#5fd64f"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          )}
        </View>

        <Text style={styles.title}>{pending ? 'Booking Requested!' : 'Booking Confirmed!'}</Text>
        <Text style={styles.subtitle}>
          {pending
            ? 'Your booking is waiting for station admin approval. We will notify you once it is confirmed.'
            : rideOtp
              ? 'Share the OTP below with the station admin at pickup to start your ride.'
              : 'Your scooty ride has been successfully booked'}
        </Text>

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

        <Pressable style={styles.directionsButton} onPress={openMaps}>
          <LocationIcon size={18} color="#fc5109" />
          <Text style={styles.directionsText}>Get Directions</Text>
        </Pressable>

        {pending ? (
          <View style={[styles.startRideButton, styles.pendingButton]}>
            <ClockIcon size={20} color="#92400e" />
            <Text style={[styles.startRideText, styles.pendingButtonText]}>
              Waiting for approval
            </Text>
          </View>
        ) : rideOtp ? (
          <View style={styles.otpWrap}>
            <Text style={styles.otpHint}>
              Tell this OTP to the station admin. Your ride starts as soon as they enter it.
            </Text>
            <View style={styles.otpWaiting}>
              <ClockIcon size={16} color="#92400e" />
              <Text style={styles.otpWaitingText}>Waiting for station admin to start the ride…</Text>
            </View>
          </View>
        ) : (
          <Pressable
            style={[
              styles.startRideButton,
              (!canStartRide || otpLoading) && styles.startRideButtonDisabled,
            ]}
            onPress={canStartRide && !otpLoading ? onStartRide : undefined}
            disabled={!canStartRide || otpLoading}
          >
            <SmallScooterIcon size={20} color="#ffffff" />
            <Text style={styles.startRideText}>
              {otpLoading ? 'Getting OTP…' : canStartRide ? 'Start Ride' : 'Starts at Scheduled Time'}
            </Text>
          </Pressable>
        )}

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

const RAW_STYLES = {
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
    backgroundColor: '#5fd64f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 20 },
    elevation: 8,
  },
  successInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
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
  startRideButton: {
    marginTop: 12,
    width: '100%',
    height: 56,
    borderRadius: 36,
    backgroundColor: '#fc5109',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#fc4c02',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  startRideButtonDisabled: {
    opacity: 0.55,
  },
  startRideText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 28,
  },
  otpWrap: {
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  // Peach pill: grey "OTP" followed by the orange dash + digits.
  otpPill: {
    marginBottom: 16,
    backgroundColor: '#fdeee6',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 22,
    alignSelf: 'flex-end',
  },
  otpPillText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'right',
  },
  otpPillLabel: {
    color: '#8e8e8e',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  otpPillDigits: {
    color: '#fc5109',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1,
  },
  otpHint: {
    color: '#363636',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  otpWaiting: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef3c7',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  otpWaitingText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  pendingCircle: {
    backgroundColor: '#fbbf24',
  },
  pendingButton: {
    backgroundColor: '#fef3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  pendingButtonText: {
    color: '#92400e',
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
} as const;
