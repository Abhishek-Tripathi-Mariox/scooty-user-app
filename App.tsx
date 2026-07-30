import React, { useEffect, useMemo, useState } from 'react';
import { Alert, AppState, NativeModules, Platform, StyleSheet, Text, View } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { LoginScreen } from './src/screens/LoginScreen';
import { OtpScreen } from './src/screens/OtpScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { KycScreen } from './src/screens/KycScreen';
import { PendingApprovalScreen } from './src/screens/PendingApprovalScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { EditLocationScreen } from './src/screens/EditLocationScreen';
import { PermissionsScreen } from './src/screens/PermissionsScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { RidePlanScreen, type RidePlan, type RidePlanId } from './src/screens/RidePlanScreen';
import { TimeSlotScreen } from './src/screens/TimeSlotScreen';
import { PickupStationScreen, type PickupStation } from './src/screens/PickupStationScreen';
import { BookingsScreen } from './src/screens/BookingsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { UpdateProfileScreen } from './src/screens/UpdateProfileScreen';
import { NotificationScreen } from './src/screens/NotificationScreen';
import { RideHistoryScreen } from './src/screens/RideHistoryScreen';
import { OffersRewardsScreen } from './src/screens/OffersRewardsScreen';
import { HelpSupportScreen } from './src/screens/HelpSupportScreen';
import { MyWalletScreen } from './src/screens/MyWalletScreen';
import { DepositRefundStatusScreen } from './src/screens/DepositRefundStatusScreen';
import { RideCompletedScreen } from './src/screens/RideCompletedScreen';
import { RateYourExperienceScreen } from './src/screens/RateYourExperienceScreen';
import { ScanQRCodeScreen } from './src/screens/ScanQRCodeScreen';
import { RideInProgressScreen } from './src/screens/RideInProgressScreen';
import { ParkingConfirmationScreen } from './src/screens/ParkingConfirmationScreen';
import { SelectParkingStationScreen } from './src/screens/SelectParkingStationScreen';
import { ConfirmRideScreen } from './src/screens/ConfirmRideScreen';
import { PaymentModeScreen } from './src/screens/PaymentModeScreen';
import { BookingConfirmedScreen } from './src/screens/BookingConfirmedScreen';
import { BookingDetailScreen } from './src/screens/BookingDetailScreen';
import { BookingReceiptScreen } from './src/screens/BookingReceiptScreen';
import { PreRideScreen } from './src/screens/PreRideScreen';
import { RideCancelScreen } from './src/screens/RideCancelScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { CityPickerScreen } from './src/screens/CityPickerScreen';
import { AuthStep, OTP_LENGTH } from './src/constants/auth';
import type { TabKey } from './src/components/BottomTabs';
import {
  BookingItem,
  BookingQuote,
  Dashboard,
  KycUploadFile,
  KycUploadFiles,
  NotificationItem,
  PlanItem,
  RideItem,
  WalletTransactionItem,
  StationItem,
  SupportFaq,
  TimeSlotItem,
  User,
  userApi,
  userApiErrorMessage,
  userApiIsNetworkError,
} from './src/services/userApi';
import { fetchCoordsIfAllowed } from './src/utils/location';
import { formatCurrency, formatTime12 } from './src/utils/format';
import { compressImage } from './src/utils/image-compression';

type AppStep =
  | 'splash'
  | 'city-picker'
  | AuthStep
  | 'register'
  | 'kyc'
  | 'pending-approval'
  | 'permissions'
  | 'dashboard'
  | 'edit-location'
  | 'search'
  | 'ride-plan'
  | 'time-slot'
  | 'drop-station'
  | 'confirm-ride'
  | 'payment-mode'
  | 'booking-confirmed'
  | 'pre-ride'
  | 'ride-cancel'
  | 'wallet'
  | 'refund-status'
  | 'scan-qr'
  | 'ride-progress'
  | 'end-ride-station'
  | 'parking-confirmation'
  | 'bookings'
  | 'profile'
  | 'update-profile'
  | 'notification'
  | 'ride-history'
  | 'offers'
  | 'support'
  | 'ride-completed'
  | 'rate'
  | 'booking-detail'
  | 'booking-receipt';

const mapPlanTypeToRidePlanId = (type?: string): RidePlanId => {
  const normalized = String(type || '').trim().toUpperCase();
  if (normalized === 'DAY_PASS' || normalized === 'FULL_DAY') return 'full-day';
  if (normalized === 'WEEKLY') return 'weekly';
  if (normalized === 'MONTHLY') return 'monthly';
  return 'hourly';
};

const mapRidePlanIdToPlanCode = (id?: RidePlanId | null) => {
  if (id === 'full-day') return 'DAY_PASS';
  if (id === 'weekly') return 'WEEKLY';
  if (id === 'monthly') return 'MONTHLY';
  return 'HOURLY';
};

// Stations are only shown within this distance of the selected location.
const STATION_RADIUS_KM = 20;

const canStartScheduledRide = (booking?: BookingItem | null) => {
  const scheduledStartAt = booking?.startAt || booking?.schedule?.startAt;
  if (!scheduledStartAt) return true;

  const startMs = new Date(scheduledStartAt).getTime();
  if (Number.isNaN(startMs)) return true;

  return Date.now() >= startMs;
};

const normalizeBookingResponse = (booking?: BookingItem | null): BookingItem | null => {
  if (!booking) return booking ?? null;

  return {
    ...booking,
    pickupStation: booking.pickupStation || booking.pickupStationId,
    dropStation: booking.dropStation || booking.dropStationId,
    scooter:
      booking.scooter ||
      (booking.vehicleId
        ? {
            id: booking.vehicleId._id,
            modelName: booking.vehicleId.modelName,
            registrationNumber: booking.vehicleId.registrationNumber,
            imageUrl: booking.vehicleId.photos?.sideUrl || booking.vehicleId.photos?.frontUrl,
          }
        : undefined),
  };
};

const AUTH_TOKEN_KEY = 'scooty_rental_user_auth_token';
const UserAuthStorage = NativeModules.UserAuthStorage as
  | {
      setItem?: (key: string, value: string) => Promise<void>;
      getItem?: (key: string) => Promise<string | null>;
      removeItem?: (key: string) => Promise<void>;
    }
  | undefined;

const mapBackendPlanToRidePlan = (plan: PlanItem): RidePlan => {
  const id = mapPlanTypeToRidePlanId(plan.type);
  const price = Number(plan.price ?? 0);
  const durationHours = Number(plan.durationHours ?? 1);
  const title =
    plan.name ||
    (id === 'hourly'
      ? 'Hourly'
      : id === 'full-day'
        ? 'Full Day'
        : id === 'weekly'
          ? 'Weekly'
          : 'Monthly');

  return {
    id,
    code: plan.code || mapRidePlanIdToPlanCode(id),
    title,
    duration: `${durationHours} Hour${durationHours === 1 ? '' : 's'}`,
    price,
    rateLabel:
      id === 'hourly'
        ? '/hr'
        : id === 'full-day'
          ? '/day'
          : id === 'weekly'
            ? '/7 days'
            : '/30 days',
    bullets: plan.perks && plan.perks.length > 0 ? plan.perks : [],
    validity: plan.description || '',
    extraCharges: plan.securityDeposit ? `₹${plan.securityDeposit} security deposit` : '',
  };
};

const mapStationToPickupStation = (station: StationItem, fallbackId: string): PickupStation => {
  const distanceKm =
    typeof station.distanceKm === 'number' && Number.isFinite(station.distanceKm)
      ? station.distanceKm
      : null;
  const walkMinutes = distanceKm != null ? Math.max(1, Math.round(distanceKm * 12)) : null;
  const battery =
    typeof station.averageBatteryPercent === 'number' && Number.isFinite(station.averageBatteryPercent)
      ? `${station.averageBatteryPercent}%`
      : '—';

  return {
    id: station._id || fallbackId,
    name: station.name || 'Station unavailable',
    address: station.address || 'Address unavailable',
    distance: distanceKm != null ? `${distanceKm.toFixed(1)} km` : '—',
    available: Number(station.availableScooters ?? 0),
    battery,
    parking: walkMinutes != null ? `${walkMinutes} min walk` : '—',
    coordinates:
      typeof station.coordinates?.latitude === 'number' &&
      typeof station.coordinates?.longitude === 'number'
        ? { latitude: station.coordinates.latitude, longitude: station.coordinates.longitude }
        : undefined,
  };
};

const resolveRidePlanCode = (plan?: RidePlan | null) => plan?.code || mapRidePlanIdToPlanCode(plan?.id || null);

const resolveBookingDate = (selection: string) => {
  const today = new Date();
  const date = new Date(today);

  if (selection === 'tomorrow') {
    date.setDate(date.getDate() + 1);
  } else if (selection === 'today') {
    // no-op
  } else {
    const parsed = new Date(selection);
    if (!Number.isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const rideStartsInLabel = (startAt?: string | null) => {
  if (!startAt) return undefined;
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) return undefined;
  const diffMs = start.getTime() - Date.now();
  if (diffMs <= 0) return 'Now';
  const totalMinutes = Math.round(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
};

const formatScheduleLabel = (selection?: { date: string; time: string; duration: string } | null) => {
  if (!selection) return undefined;

  const parsed = new Date(selection.date);
  const dateLabel =
    selection.date === 'today'
      ? 'Today'
      : selection.date === 'tomorrow'
        ? 'Tomorrow'
        : Number.isNaN(parsed.getTime())
          ? selection.date
          : parsed.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return `${dateLabel}, ${formatTime12(selection.time)} • ${selection.duration}`;
};

export default function App() {
  // Auth state
  const [step, setStep] = useState<AppStep>('splash');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [kycFiles, setKycFiles] = useState<KycUploadFiles>({});
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    city: '',
    acceptedTerms: false,
  });

  // User data state
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [stations, setStations] = useState<StationItem[] | null>(null);
  const [rides, setRides] = useState<RideItem[] | null>(null);
  const [bookings, setBookings] = useState<BookingItem[] | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(null);
  const [supportFaqs, setSupportFaqs] = useState<SupportFaq[]>([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransactionItem[] | null>(null);
  const [referral, setReferral] = useState<{
    referralCode: string;
    referralEarnings: number;
    totalReferrals: number;
    inviteReward: number;
    appliedReferral?: string | null;
  } | null>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<BookingItem | null>(null);
  const [receiptBooking, setReceiptBooking] = useState<BookingItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideItem | null>(null);
  const [selectedRidePlan, setSelectedRidePlan] = useState<RidePlan | null>(null);
  const [selectedPickupStation, setSelectedPickupStation] = useState<PickupStation | null>(null);
  const [selectedDropStation, setSelectedDropStation] = useState<PickupStation | null>(null);
  const [selectedSearchStationId, setSelectedSearchStationId] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: string; time: string; duration: string } | null>(null);
  const [availableRidePlans, setAvailableRidePlans] = useState<RidePlan[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlotItem[]>([]);
  const [bookingQuote, setBookingQuote] = useState<BookingQuote | null>(null);
  const [createdBooking, setCreatedBooking] = useState<BookingItem | null>(null);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [ridesLoading, setRidesLoading] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const visibleStations = useMemo(() => {
    if (!stations) return null;
    if (!selectedCity) return stations;
    const cityFilter = selectedCity.split(',')[0].trim().toLowerCase();
    return stations.filter((s) => (s.city || '').toLowerCase().includes(cityFilter));
  }, [stations, selectedCity]);

  const pickupStations = useMemo(
    () =>
      visibleStations?.map((station, index) =>
        mapStationToPickupStation(station, String(index + 1)),
      ) ?? null,
    [visibleStations],
  );

  const persistAuthToken = async (value: string) => {
    if (Platform.OS !== 'android' || !UserAuthStorage?.setItem) return;
    await UserAuthStorage.setItem(AUTH_TOKEN_KEY, value);
  };

  const clearAuthToken = async () => {
    if (Platform.OS !== 'android' || !UserAuthStorage?.removeItem) return;
    await UserAuthStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const hasCompletedPermissions = (settings?: User['settings'] | null) => {
    return Boolean(settings?.location?.updatedAt);
  };

  // Station query for the user's effective location:
  // - city picked from the list (has its own coords) → 20 km around that city's centre
  // - city typed in the profile (no reliable coords) → filter by city name
  // - GPS / live location → 20 km around the user's coordinates
  const stationQueryFor = (
    profileUser?: User | null,
    liveCoords?: { latitude: number; longitude: number } | null,
  ) => {
    const location = profileUser?.settings?.location;

    if (location?.source === 'manual' && location?.latitude != null && location?.longitude != null) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        radiusKm: STATION_RADIUS_KM,
      };
    }

    if (location?.source === 'manual' || location?.source === 'profile') {
      return {
        city: location?.city || profileUser?.city || undefined,
        latitude: liveCoords?.latitude ?? undefined,
        longitude: liveCoords?.longitude ?? undefined,
      };
    }

    const latitude = liveCoords?.latitude ?? location?.latitude ?? undefined;
    const longitude = liveCoords?.longitude ?? location?.longitude ?? undefined;
    return {
      latitude,
      longitude,
      radiusKm: latitude != null && longitude != null ? STATION_RADIUS_KM : undefined,
    };
  };

  const loadRidePlans = async (stationId?: string | null) => {
    if (!token) return [];

    const plansResult = await userApi.plans(token, stationId || undefined);
    const rawPlans = plansResult.plans ?? [];
    const stationPlans = stationId
      ? rawPlans.filter(
          (plan) => typeof plan.availableScooters === 'number' && plan.availableScooters > 0,
        )
      : rawPlans;
    const mappedPlans = stationPlans.map(mapBackendPlanToRidePlan);

    setAvailableRidePlans(mappedPlans);
    setSelectedRidePlan((current) => {
      if (!mappedPlans.length) return null;
      if (!current) return mappedPlans[0];
      return mappedPlans.find((plan) => plan.id === current.id) || mappedPlans[0] || null;
    });

    return mappedPlans;
  };

  const loadBookings = async () => {
    if (!token) return;

    try {
      setBookingsLoading(true);
      const bookingsResult = await userApi.bookings(token);
      setBookings(bookingsResult.bookings || []);
    } catch (error) {
      console.warn('Failed to load bookings:', error);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Effects

  useEffect(() => {
    let active = true;

    const bootstrapAuth = async () => {
      try {
        const storedToken =
          Platform.OS === 'android' && UserAuthStorage?.getItem
            ? await UserAuthStorage.getItem(AUTH_TOKEN_KEY)
            : null;

        if (!storedToken) {
          return;
        }

        const result = await userApi.profile(storedToken);
        if (!active) return;

        setToken(storedToken);
        setUser(result.user);
        setDashboard(result.dashboard);

        const kycStatus = result.user?.kycStatus;
        if (kycStatus === 'PENDING' || kycStatus === 'REJECTED') {
          setStep('pending-approval');
          return;
        }
        if (kycStatus !== 'APPROVED') {
          const isProfileComplete = Boolean(
            result.user?.name?.trim() &&
              result.user?.email?.trim() &&
              (result.user?.city?.trim() || result.user?.adress?.trim()),
          );
          if (!isProfileComplete) {
            setRegisterForm({
              fullName: result.user?.name || '',
              email: result.user?.email || '',
              city: result.user?.city || '',
              acceptedTerms: false,
            });
            setStep('register');
            return;
          }
          setStep('kyc');
          return;
        }

        if (hasCompletedPermissions(result.user?.settings)) {
          setActiveTab('home');
          setStep('dashboard');
          return;
        }

        setStep('permissions');
      } catch (error) {
        // Only drop the saved session when the token is actually invalid.
        // A network failure (backend down / no internet) must not log the
        // user out, or auto-login after admin approval would silently break.
        if (!userApiIsNetworkError(error)) {
          await clearAuthToken();
        }
        console.warn('Failed to restore user session:', error);
      } finally {
        if (active) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (token) {
      loadUserData();
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (step !== 'pending-approval') return;
    let active = true;
    let inFlight = false;

    const sync = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const freshUser = await refreshKycStatus(token);
        if (!active) return;
        if (freshUser?.kycStatus === 'APPROVED') {
          if (hasCompletedPermissions(freshUser.settings)) {
            setActiveTab('home');
            setStep('dashboard');
          } else {
            setStep('permissions');
          }
        }
      } finally {
        inFlight = false;
      }
    };

    void sync();
    const pollInterval = setInterval(() => {
      if (AppState.currentState === 'active') void sync();
    }, 10000);
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') void sync();
    });

    return () => {
      active = false;
      clearInterval(pollInterval);
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, step]);

  useEffect(() => {
    if (!token || step !== 'time-slot') return;
    const selectedPlanCode = resolveRidePlanCode(selectedRidePlan);
    void userApi
      .timeSlots(token, {
        planCode: selectedPlanCode,
        stationId: selectedPickupStation?.id,
      })
      .then((result) => {
        setAvailableTimeSlots(result.slots || []);
        if (result.plan) {
          setSelectedRidePlan(mapBackendPlanToRidePlan(result.plan));
        }
      })
      .catch(() => setAvailableTimeSlots([]));
  }, [selectedPickupStation?.id, selectedRidePlan?.id, step, token]);

  useEffect(() => {
    if (!token || step !== 'bookings') return;
    void loadBookings();
  }, [step, token]);

  // Always pull fresh ride history from the backend when the screen opens.
  useEffect(() => {
    if (!token || step !== 'ride-history') return;
    let active = true;
    setRidesLoading(true);
    void userApi
      .rides(token)
      .then((result) => {
        if (active) setRides(result.rides || []);
      })
      .catch(() => {
        if (active) setRides([]);
      })
      .finally(() => {
        if (active) setRidesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [step, token]);

  // While the user waits on the "Booking Requested" screen, poll the booking
  // so the screen flips to Confirmed as soon as the station admin approves.
  useEffect(() => {
    if (!token || step !== 'booking-confirmed') return;
    const bookingId = createdBooking?._id;
    if (!bookingId || createdBooking?.status !== 'PENDING_PAYMENT') return;
    let active = true;

    const check = async () => {
      try {
        const result = await userApi.bookingDetail(token, bookingId);
        if (!active || !result.booking) return;
        if (result.booking.status === 'CANCELLED') {
          setCreatedBooking(result.booking);
          Alert.alert('Booking cancelled', 'The station admin cancelled this booking.');
          setStep('bookings');
          return;
        }
        if (result.booking.status !== 'PENDING_PAYMENT') {
          setCreatedBooking(result.booking);
        }
      } catch {
        // polling is best-effort
      }
    };

    void check();
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') void check();
    }, 8000);

    return () => {
      active = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, token, createdBooking?._id, createdBooking?.status]);

  // Fetch the real quote (base fare + deposit + tax + fees) as soon as the
  // user reaches the confirm screen, so both the confirm and payment screens
  // show the exact amount that will actually be charged.
  useEffect(() => {
    if (!token || step !== 'confirm-ride') return;
    if (!selectedRidePlan || !selectedPickupStation || !selectedDropStation || !selectedTimeSlot) return;
    let active = true;
    void userApi
      .bookingQuote(token, {
        pickupStationId: selectedPickupStation.id,
        dropStationId: selectedDropStation.id,
        planCode: resolveRidePlanCode(selectedRidePlan),
        date: resolveBookingDate(selectedTimeSlot.date),
        startTime: selectedTimeSlot.time,
        walletToUse: 0,
      })
      .then((result) => {
        if (active) setBookingQuote(result.quote);
      })
      .catch(() => {
        // quote preview is best-effort; booking re-quotes on confirm
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, token]);

  useEffect(() => {
    if (!token || step !== 'offers') return;
    void loadReferral();
  }, [step, token]);

  useEffect(() => {
    if (!token || step !== 'support') return;
    let active = true;
    setSupportLoading(true);
    void userApi
      .supportFaqs(token)
      .then((res) => {
        if (active) setSupportFaqs(res.faqs || []);
      })
      .catch(() => active && setSupportFaqs([]))
      .finally(() => active && setSupportLoading(false));
    return () => {
      active = false;
    };
  }, [step, token]);

  const refreshLiveLocation = async (
    authToken: string,
    profileUser: User,
  ): Promise<{ latitude: number; longitude: number } | null> => {
    if (!profileUser?.settings?.permissions?.location) return null;

    // A manually chosen city stores that city's own coordinates — never
    // overwrite them with GPS, or the 20 km radius would drift back to
    // wherever the user physically is.
    const storedLocation = profileUser.settings?.location;
    if (storedLocation?.source === 'manual') return null;

    const coords = await fetchCoordsIfAllowed();
    if (!coords) return null;

    const keepChosenCity = storedLocation?.source === 'profile';

    try {
      const result = await userApi.updateSettings(authToken, {
        location: {
          isEnabled: true,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy ?? null,
          city: keepChosenCity
            ? storedLocation?.city || ''
            : profileUser.city || storedLocation?.city || '',
          state: profileUser.state || storedLocation?.state || '',
          pincode: profileUser.pincode || storedLocation?.pincode || '',
          source: keepChosenCity ? 'profile' : 'gps',
          updatedAt: new Date().toISOString(),
        },
      });
      setUser(result.user);
    } catch (error) {
      console.warn('Failed to persist live location:', error);
    }

    return { latitude: coords.latitude, longitude: coords.longitude };
  };

  const loadUserData = async () => {
    try {
      if (!token) return;

      setLoading(true);
      const profileResult = await userApi.profile(token);
      setUser(profileResult.user);
      setDashboard(profileResult.dashboard);

      const liveCoords = await refreshLiveLocation(token, profileResult.user);
      const stationsResult = await userApi.stations(
        token,
        stationQueryFor(profileResult.user, liveCoords),
      );
      setStations(stationsResult.stations);

      try {
        await loadRidePlans();
      } catch (error) {
        console.warn('Failed to load ride plans:', error);
      }

      const notificationsResult = await userApi.notifications(token);
      setNotifications(notificationsResult.notifications);

      try {
        const transactionsResult = await userApi.transactions(token, { limit: 20 });
        setTransactions(transactionsResult.transactions || []);
      } catch (error) {
        console.warn('Failed to load wallet transactions:', error);
        setTransactions([]);
      }

      await loadBookings();
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReferral = async () => {
    if (!token) return;
    try {
      const result = await userApi.referralSummary(token);
      setReferral(result.referral);
    } catch (error) {
      console.warn('Failed to load referral summary:', error);
    }
  };

  const handleApplyReferral = async (code: string) => {
    if (!token) return;
    try {
      await userApi.applyReferralCode(token, code);
      await loadReferral();
      Alert.alert('Referral applied', 'Bonus will reflect in your wallet shortly.');
    } catch (error) {
      throw new Error(userApiErrorMessage(error));
    }
  };

  // Handlers
  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      await userApi.sendOtp(mobileNumber);
      setStep('otp');
      setOtp('');
    } catch (error) {
      const message = userApiErrorMessage(error);
      if (/OWNER\s+account/i.test(message)) {
        Alert.alert(
          'Use the Owner app',
          'This mobile number is registered as a vehicle owner. Please install and login with the Slydo Mobility Owner app to continue.',
        );
      } else {
        Alert.alert('Could not send OTP', message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      Alert.alert('Error', 'Please enter a valid OTP');
      return;
    }

    try {
      setLoading(true);
      const result = await userApi.verifyOtp({
        mobile: mobileNumber,
        otp,
      });
      setToken(result.token);
      void persistAuthToken(result.token);
      setUser(result.user);
      setActiveTab('home');

      const kycStatus = result.user?.kycStatus;
      if (kycStatus === 'PENDING' || kycStatus === 'REJECTED') {
        setStep('pending-approval');
        return;
      }
      if (kycStatus === 'APPROVED') {
        setStep('permissions');
        return;
      }

      const isProfileComplete = Boolean(
        result.user?.name?.trim() &&
          result.user?.email?.trim() &&
          (result.user?.city?.trim() || result.user?.adress?.trim()),
      );

      if (!isProfileComplete) {
        setRegisterForm((prev) => ({
          fullName: prev.fullName || result.user?.name || '',
          email: prev.email || result.user?.email || '',
          city: prev.city || result.user?.city || '',
          acceptedTerms: prev.acceptedTerms,
        }));
        setStep('register');
        return;
      }

      setStep('kyc');
    } catch (error) {
      Alert.alert('Error', userApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionsContinue = async (
    permissions: Record<'location' | 'camera' | 'notifications', boolean>,
    coords: { latitude: number; longitude: number; accuracy?: number | null } | null,
  ) => {
    try {
      setLoading(true);
      if (token) {
        const result = await userApi.updateSettings(token, {
          permissions,
          language: user?.settings?.language || 'en',
          location: {
            isEnabled: permissions.location,
            latitude: coords?.latitude ?? null,
            longitude: coords?.longitude ?? null,
            accuracy: coords?.accuracy ?? null,
            city: user?.city || '',
            state: user?.state || '',
            pincode: user?.pincode || '',
            source: coords ? 'gps' : 'profile',
            updatedAt: new Date().toISOString(),
          },
        });
        setUser(result.user);

        if (coords) {
          try {
            const stationsResult = await userApi.stations(
              token,
              stationQueryFor(result.user, coords),
            );
            setStations(stationsResult.stations);
          } catch (error) {
            console.warn('Failed to refresh stations after location update:', error);
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', userApiErrorMessage(error));
      return;
    } finally {
      setLoading(false);
    }

    setActiveTab('home');
    setStep('dashboard');
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await userApi.sendOtp(mobileNumber);
      setOtp('');
      Alert.alert('Success', 'OTP sent again');
    } catch (error) {
      const message = userApiErrorMessage(error);
      if (/OWNER\s+account/i.test(message)) {
        Alert.alert(
          'Use the Owner app',
          'This mobile number is registered as a vehicle owner. Please install and login with the Slydo Mobility Owner app to continue.',
        );
      } else {
        Alert.alert('Could not send OTP', message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterContinue = async () => {
    const { fullName, email, city, acceptedTerms } = registerForm;
    if (!fullName.trim() || !email.trim() || !city.trim() || !acceptedTerms) {
      Alert.alert('Incomplete details', 'Please fill all fields and accept the terms.');
      return;
    }
    if (!token) {
      if (!mobileNumber || mobileNumber.length !== 10) {
        Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
        return;
      }
      try {
        setLoading(true);
        const result = await userApi.signup({
          mobile: mobileNumber,
          name: fullName.trim(),
          address: city.trim(),
          city: city.trim(),
        });
        setToken(result.token);
        void persistAuthToken(result.token);

        let finalUser = result.user;
        try {
          const updated = await userApi.updateProfile(result.token, {
            email: email.trim(),
          });
          finalUser = updated.user;
        } catch {
          // email update is best-effort; signup already succeeded
        }
        setUser(finalUser);
        setActiveTab('home');
        setStep('kyc');
      } catch (error) {
        const message = userApiErrorMessage(error);
        if (/OWNER\s+account/i.test(message)) {
          Alert.alert(
            'Use the Owner app',
            'This mobile number is registered as a vehicle owner. Please install and login with the Slydo Mobility Owner app to continue.',
          );
        } else {
          Alert.alert('Could not sign up', message);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const result = await userApi.updateProfile(token, {
        name: fullName.trim(),
        email: email.trim(),
        city: city.trim(),
      });
      setUser(result.user);
      setStep('kyc');
    } catch (error) {
      Alert.alert('Could not save details', userApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePickKycDocument = async (field: keyof KycUploadFiles) => {
    try {
      const picked = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
      });
      const file: KycUploadFile = {
        uri: picked.fileCopyUri || picked.uri,
        name: picked.name || `${field}.jpg`,
        type: picked.type || 'application/octet-stream',
        size: picked.size ?? null,
      };
      setKycFiles((prev) => ({ ...prev, [field]: file }));
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Document upload', 'Could not open the file picker.');
      }
    }
  };

  const handleSubmitKyc = async () => {
    if (!token) return;
    if (!kycFiles.profilePhoto || !kycFiles.adharFile || !kycFiles.panFile) {
      Alert.alert(
        'Select all documents',
        'Please upload Aadhaar, PAN, and profile photo before submitting.',
      );
      return;
    }

    try {
      setKycSubmitting(true);
      await userApi.submitKyc(token, kycFiles);
      setKycFiles({});
      setUser((current) => (current ? { ...current, kycStatus: 'PENDING' } : current));
      setStep('pending-approval');
    } catch (error) {
      Alert.alert('Could not submit KYC', userApiErrorMessage(error));
    } finally {
      setKycSubmitting(false);
    }
  };

  const refreshKycStatus = async (sessionToken: string) => {
    try {
      const result = await userApi.profile(sessionToken);
      setUser(result.user);
      setDashboard(result.dashboard);
      return result.user;
    } catch {
      return undefined;
    }
  };

  const handleTabPress = (tab: TabKey) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home':
        setStep('dashboard');
        break;
      case 'booking':
        setStep('bookings');
        break;
      case 'notification':
        setStep('notification');
        break;
      case 'profile':
        setStep('profile');
        break;
    }
  };

  const startBookingFlow = (station?: StationItem | null) => {
    const resolvedStation = station || stations?.[0] || null;
    const stationId = resolvedStation?._id || null;
    const mappedStation = resolvedStation ? mapStationToPickupStation(resolvedStation, resolvedStation._id) : null;

    setSelectedRidePlan(null);
    setSelectedPickupStation(null);
    setSelectedSearchStationId(stationId);
    setSelectedTimeSlot(null);
    setBookingQuote(null);
    setCreatedBooking(null);
    setAvailableTimeSlots([]);
    if (mappedStation) {
      setSelectedPickupStation(mappedStation);
    }

    void (async () => {
      try {
        setLoading(true);
        await loadRidePlans(stationId);
      } catch (error) {
        console.warn('Failed to load station ride plans:', error);
        setAvailableRidePlans([]);
        setSelectedRidePlan(null);
      } finally {
        setLoading(false);
        setStep('ride-plan');
      }
    })();
  };

  const handleProfileMenuPress = (key: 'language' | 'bookings' | 'history' | 'offers' | 'support') => {
    switch (key) {
      case 'bookings':
        setStep('bookings');
        break;
      case 'history':
        setStep('ride-history');
        break;
      case 'offers':
        setStep('offers');
        break;
      case 'support':
        setStep('support');
        break;
    }
  };

  const handleUpdateProfile = async (payload: {
    name: string;
    email: string;
    city: string;
    address: string;
    pincode?: string;
  }, profilePhoto?: { uri: string; name: string; type: string; size?: number | null } | null) => {
    if (!token) {
      Alert.alert('Error', 'You need to be signed in to update your profile.');
      return;
    }

    try {
      setLoading(true);
      const result = await userApi.updateProfile(token, {
        name: payload.name,
        email: payload.email || undefined,
        city: payload.city || undefined,
        address: payload.address || undefined,
        pincode: payload.pincode || undefined,
      }, profilePhoto || null);

      let updatedUser = result.user;
      if (result.dashboard) {
        setDashboard(result.dashboard);
      }

      const newCity = payload.city.trim();
      const previousCity = (user?.settings?.location?.city || user?.city || '').trim();
      if (newCity && newCity.toLowerCase() !== previousCity.toLowerCase()) {
        const currentLocation = updatedUser?.settings?.location || user?.settings?.location;

        try {
          // updateSettings replaces the whole location object, so resend existing coords
          const settingsResult = await userApi.updateSettings(token, {
            location: {
              isEnabled: currentLocation?.isEnabled ?? false,
              latitude: currentLocation?.latitude ?? null,
              longitude: currentLocation?.longitude ?? null,
              accuracy: currentLocation?.accuracy ?? null,
              city: newCity,
              state: updatedUser?.state || user?.state || '',
              pincode: payload.pincode || updatedUser?.pincode || '',
              source: 'profile',
              updatedAt: new Date().toISOString(),
            },
          });
          updatedUser = settingsResult.user;
        } catch (error) {
          console.warn('Failed to sync location settings with new city:', error);
        }

        try {
          const stationsResult = await userApi.stations(token, {
            city: newCity,
            latitude: currentLocation?.latitude ?? undefined,
            longitude: currentLocation?.longitude ?? undefined,
          });
          setStations(stationsResult.stations);
        } catch (error) {
          console.warn('Failed to refresh stations for new city:', error);
        }
      }

      setUser(updatedUser);
      setStep('profile');
    } catch (error) {
      Alert.alert('Error', userApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLocation = async (
    city: string,
    state?: string,
    coords?: { latitude: number; longitude: number },
  ) => {
    if (!token) return;
    const newCity = city.trim();
    if (!newCity) {
      Alert.alert('Enter a city', 'Please type a city name to change your location.');
      return;
    }

    try {
      setLoading(true);
      const currentLocation = user?.settings?.location;
      // Store the chosen city's own coordinates so the 20 km radius is
      // anchored to that city (and survives app reloads).
      const result = await userApi.updateSettings(token, {
        location: {
          isEnabled: currentLocation?.isEnabled ?? false,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          accuracy: null,
          city: newCity,
          state: state?.trim() || user?.state || '',
          pincode: user?.pincode || '',
          source: 'manual',
          updatedAt: new Date().toISOString(),
        },
      });
      setUser(result.user);

      const stationsResult = await userApi.stations(
        token,
        coords
          ? {
              latitude: coords.latitude,
              longitude: coords.longitude,
              radiusKm: STATION_RADIUS_KM,
            }
          : { city: newCity },
      );
      setStations(stationsResult.stations);

      setActiveTab('home');
      setStep('dashboard');
    } catch (error) {
      Alert.alert('Could not update location', userApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const coords = await fetchCoordsIfAllowed();
      if (!coords) {
        Alert.alert(
          'Location unavailable',
          'Please allow location access to use your current location.',
        );
        return;
      }

      const result = await userApi.updateSettings(token, {
        location: {
          isEnabled: true,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy ?? null,
          city: '',
          state: user?.state || '',
          pincode: user?.pincode || '',
          source: 'gps',
          updatedAt: new Date().toISOString(),
        },
      });
      setUser(result.user);

      const stationsResult = await userApi.stations(token, {
        latitude: coords.latitude,
        longitude: coords.longitude,
        radiusKm: STATION_RADIUS_KM,
      });
      setStations(stationsResult.stations);

      setActiveTab('home');
      setStep('dashboard');
    } catch (error) {
      Alert.alert('Could not update location', userApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: () => {
          void clearAuthToken();
          setToken(null);
          setUser(null);
          setDashboard(null);
          setStations(null);
          setRides(null);
          setBookings(null);
          setNotifications(null);
          setTransactions(null);
          setSelectedRide(null);
          setSelectedRidePlan(null);
          setSelectedPickupStation(null);
          setSelectedDropStation(null);
          setSelectedTimeSlot(null);
          setAvailableRidePlans([]);
          setAvailableTimeSlots([]);
          setBookingQuote(null);
          setCreatedBooking(null);
          setBookingBusy(false);
          setMobileNumber('');
          setOtp('');
          setStep('login');
          setActiveTab('home');
        },
      },
    ]);
  };

  const buildBookingDate = (selection: string) => resolveBookingDate(selection);

  const handleConfirmBooking = async (
    paymentMethodId: 'CASH' | 'WALLET' | 'UPI' | 'NETBANKING' = 'CASH',
  ) => {
    if (!token || !selectedRidePlan || !selectedPickupStation || !selectedDropStation || !selectedTimeSlot) {
      Alert.alert('Missing details', 'Please choose a plan, time slot, pickup station, and drop station before continuing.');
      return;
    }

    const bookingDate = buildBookingDate(selectedTimeSlot.date);
    const startTime = selectedTimeSlot.time;
    const planCode = resolveRidePlanCode(selectedRidePlan);
    const pickupStationId = selectedPickupStation.id;
    const dropStationId = selectedDropStation?.id;

    if (!dropStationId) {
      Alert.alert('Missing details', 'Please choose a drop station before continuing.');
      return;
    }

    setBookingBusy(true);
    try {
      const quoteResult = await userApi.bookingQuote(token, {
        pickupStationId,
        dropStationId,
        planCode,
        date: bookingDate,
        startTime,
        walletToUse: 0,
      });
      setBookingQuote(quoteResult.quote);

      const totalPayable = Number(quoteResult.quote?.pricing?.totalPayable || 0);
      const walletBalance = Number(user?.walletBalance ?? dashboard?.walletBalance ?? 0);

      if (paymentMethodId === 'WALLET' && walletBalance < totalPayable) {
        Alert.alert(
          'Insufficient wallet balance',
          `Your wallet has ${formatCurrency(walletBalance)} but the booking total is ${formatCurrency(totalPayable)}. Choose Cash or top up your wallet.`,
        );
        return;
      }

      const walletToUse = paymentMethodId === 'WALLET' ? totalPayable : 0;
      const paymentMethod = paymentMethodId === 'WALLET' ? 'WALLET' : 'CASH';

      const bookingResult = await userApi.createBooking(token, {
        pickupStationId,
        dropStationId,
        planCode,
        date: bookingDate,
        startTime,
        walletToUse,
        paymentMethod,
        paymentReferenceId: `${paymentMethod}-${Date.now()}`,
        // Bookings wait for station admin approval before getting confirmed.
        autoConfirm: false,
      });
      const normalizedBooking = normalizeBookingResponse(bookingResult.booking);
      setCreatedBooking(normalizedBooking);

      const [profileResult, ridesResult, dashboardResult, notificationsResult, transactionsResult] = await Promise.all([
        userApi.profile(token),
        userApi.rides(token),
        userApi.dashboard(token),
        userApi.notifications(token),
        userApi.transactions(token, { limit: 20 }),
      ]);
      setUser(profileResult.user);
      setDashboard(profileResult.dashboard || dashboardResult.dashboard);
      setRides(ridesResult.rides);
      setNotifications(notificationsResult.notifications);
      setTransactions(transactionsResult.transactions || []);
      setSelectedRide({
        _id: normalizedBooking?._id || bookingResult.booking._id,
        status: 'ongoing',
        planCode: normalizedBooking?.planCode || bookingResult.booking.planCode,
        planName: normalizedBooking?.planName || bookingResult.booking.planName,
        date: normalizedBooking?.date || bookingResult.booking.date,
        startAt: normalizedBooking?.startAt || bookingResult.booking.startAt,
        endAt: normalizedBooking?.endAt || bookingResult.booking.endAt,
        durationHours: normalizedBooking?.durationHours || bookingResult.booking.durationHours,
        pricing: normalizedBooking?.pricing || bookingResult.booking.pricing,
        payment: normalizedBooking?.payment || bookingResult.booking.payment,
        pickupStation: normalizedBooking?.pickupStation || bookingResult.booking.pickupStation,
        dropStation: normalizedBooking?.dropStation || bookingResult.booking.dropStation,
        scooter: normalizedBooking?.scooter || bookingResult.booking.scooter,
        schedule: normalizedBooking?.schedule || bookingResult.booking.schedule,
        distance: 0,
        fare: normalizedBooking?.pricing?.totalPayable || bookingResult.booking.pricing?.totalPayable,
      });

      setStep('booking-confirmed');
    } catch (error) {
      Alert.alert('Could not confirm ride', userApiErrorMessage(error));
    } finally {
      setBookingBusy(false);
    }
  };

  // Start Ride always goes through the full flow:
  // Confirm Ride (pre-ride) → Scan QR → ride starts.
  const handleStartRide = () => {
    const currentBooking = createdBooking || selectedRide;
    if (!currentBooking?._id) {
      Alert.alert('Cannot start ride', 'Booking is not ready yet. Please try again.');
      return;
    }
    if (!canStartScheduledRide(currentBooking)) {
      Alert.alert(
        'Ride not started yet',
        'This booking is scheduled for a future time. You can start it only when the booked time begins.',
      );
      return;
    }
    setStep('pre-ride');
  };

  const handleViewBookingDetails = (booking: BookingItem) => {
    setSelectedBookingDetail(booking);
    setStep('booking-detail');
  };

  const handleViewBookingReceipt = (booking: BookingItem) => {
    setReceiptBooking(booking);
    setStep('booking-receipt');
  };

  const handleScannedCode = (code: string) => {
    const bookingId = createdBooking?._id || selectedRide?._id;
    if (!token || !bookingId) {
      Alert.alert('Cannot start ride', 'Booking is not ready yet. Please try again.');
      return;
    }

    void (async () => {
      try {
        setBookingBusy(true);
        const result = await userApi.startRide(token, bookingId, { unlockCode: code });
        setCreatedBooking(result.booking);
        setSelectedRide({
          ...result.booking,
          status: 'ongoing',
          unlockCode: result.booking.unlockCode || code,
          distance: 0,
          fare: result.booking.pricing?.totalPayable,
        });
        setStep('ride-progress');
      } catch (error) {
        Alert.alert('Could not start ride', userApiErrorMessage(error));
      } finally {
        setBookingBusy(false);
      }
    })();
  };

  const handleRideEmergency = () => {
    Alert.alert('Emergency SOS', 'We have notified support for this ride.');
  };

  const handleEndRide = () => {
    // Drop station is already chosen at booking time — go straight to
    // parking confirmation instead of asking again.
    setStep('parking-confirmation');
  };

  const handleConfirmParking = async (photo?: KycUploadFile | null) => {
    const bookingId = selectedRide?._id || createdBooking?._id;
    if (!token || !bookingId) {
      Alert.alert('Cannot complete ride', 'No active ride found.');
      return;
    }
    try {
      setBookingBusy(true);

      // Compress the parking proof photo before uploading (best-effort).
      let parkingPhoto: KycUploadFile | null = null;
      if (photo) {
        try {
          const compressed = await compressImage(photo.uri, photo.name, 'photo');
          parkingPhoto = { uri: compressed.uri, name: photo.name, type: photo.type };
        } catch {
          parkingPhoto = photo;
        }
      }

      // No dropStationId sent — the backend falls back to the drop station
      // chosen at booking time, avoiding stale selections from older flows.
      const result = await userApi.completeRide(token, bookingId, {}, parkingPhoto);
      setCreatedBooking(result.booking);
      setSelectedRide({
        ...result.booking,
        status: 'completed',
        distance: result.booking.distance || 0,
        fare: result.booking.pricing?.totalPayable || 0,
      });

      try {
        const [profileResult, ridesResult, transactionsResult] = await Promise.all([
          userApi.profile(token),
          userApi.rides(token),
          userApi.transactions(token, { limit: 20 }),
        ]);
        setUser(profileResult.user);
        setDashboard(profileResult.dashboard || null);
        setRides(ridesResult.rides);
        setTransactions(transactionsResult.transactions || []);
      } catch {
        // refresh failures are non-fatal
      }

      setStep('ride-completed');
    } catch (error) {
      Alert.alert('Could not complete ride', userApiErrorMessage(error));
    } finally {
      setBookingBusy(false);
    }
  };

  const handleCancelBookingPress = (booking: BookingItem) => {
    setCancelTarget(booking);
    setStep('ride-cancel');
  };

  const handleConfirmCancel = async (reason?: string) => {
    const bookingId = cancelTarget?._id;
    if (!token || !bookingId) {
      setStep('bookings');
      return;
    }
    try {
      setBookingBusy(true);
      await userApi.cancelBooking(token, bookingId, { reason });
      try {
        const [profileResult, bookingsResult, transactionsResult] = await Promise.all([
          userApi.profile(token),
          userApi.bookings(token),
          userApi.transactions(token, { limit: 20 }),
        ]);
        setUser(profileResult.user);
        setDashboard(profileResult.dashboard || null);
        setBookings(bookingsResult.bookings);
        setTransactions(transactionsResult.transactions || []);
      } catch {
        // best-effort refresh
      }
      setCancelTarget(null);
      setStep('bookings');
    } catch (error) {
      Alert.alert('Could not cancel booking', userApiErrorMessage(error));
    } finally {
      setBookingBusy(false);
    }
  };

  // Render
  if (step === 'splash') {
    return <SplashScreen onGetStarted={() => setStep('login')} />;
  }

  if (step === 'login') {
    return (
      <LoginScreen
        mobileNumber={mobileNumber}
        onChangeMobile={setMobileNumber}
        onContinue={handleSendOtp}
        onRegisterPress={() => {
          void clearAuthToken();
          setToken(null);
          setUser(null);
          setMobileNumber('');
          setRegisterForm({ fullName: '', email: '', city: '', acceptedTerms: false });
          setStep('register');
        }}
        loading={loading}
      />
    );
  }

  if (step === 'otp') {
    return (
      <OtpScreen
        phoneNumber={mobileNumber}
        otp={otp}
        onOtpChange={setOtp}
        onBack={() => setStep('login')}
        onChangeNumber={() => setStep('login')}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        loading={loading}
      />
    );
  }

  if (step === 'register') {
    return (
      <RegisterScreen
        fullName={registerForm.fullName}
        email={registerForm.email}
        mobileNumber={mobileNumber}
        city={registerForm.city}
        acceptedTerms={registerForm.acceptedTerms}
        onToggleTerms={() =>
          setRegisterForm((prev) => ({ ...prev, acceptedTerms: !prev.acceptedTerms }))
        }
        onChangeFullName={(v) => setRegisterForm((prev) => ({ ...prev, fullName: v }))}
        onChangeEmail={(v) => setRegisterForm((prev) => ({ ...prev, email: v }))}
        onChangeMobile={(v) => setMobileNumber(v.replace(/\D/g, '').slice(0, 10))}
        onChangeCity={(v) => setRegisterForm((prev) => ({ ...prev, city: v }))}
        onContinue={handleRegisterContinue}
        onLoginPress={() => setStep('login')}
        loading={loading}
      />
    );
  }

  if (step === 'kyc') {
    return (
      <KycScreen
        onBack={() => setStep('register')}
        onSubmit={handleSubmitKyc}
        onPickDocument={handlePickKycDocument}
        documents={kycFiles}
        existingDocuments={{
          adharFileUrl: user?.adharFile,
          panFileUrl: user?.panFile,
          profilePhotoUrl: user?.profilePhotoUrl,
        }}
        loading={kycSubmitting}
      />
    );
  }

  if (step === 'pending-approval') {
    return (
      <PendingApprovalScreen
        userName={user?.name || 'User'}
        status={user?.kycStatus || 'PENDING'}
        rejectionReason={user?.kycRejectionReason}
        onRetryKyc={() => setStep('kyc')}
        onLogout={handleLogout}
      />
    );
  }

  if (step === 'permissions') {
    return (
      <PermissionsScreen
        onContinue={handlePermissionsContinue}
        initialPermissions={user?.settings?.permissions}
      />
    );
  }

  if (step === 'city-picker') {
    const currentCity =
      selectedCity || user?.settings?.location?.city || user?.city || undefined;
    return (
      <CityPickerScreen
        onBack={() => setStep('dashboard')}
        currentCity={currentCity}
        onSelect={(city) => {
          setSelectedCity(city);
          setStep('dashboard');
          if (token) {
            const cityName = city.split(',')[0].trim();
            setLoading(true);
            userApi
              .stations(token, { city: cityName })
              .then((result) => setStations(result.stations || []))
              .catch((err) => console.warn('Failed to load stations for city:', err))
              .finally(() => setLoading(false));
          }
        }}
      />
    );
  }

  if (step === 'dashboard') {
    const homeUser = selectedCity && user
      ? ({
          ...user,
          city: selectedCity,
          settings: {
            ...(user.settings || {}),
            location: { ...(user.settings?.location || {}), city: selectedCity },
          },
        } as typeof user)
      : user;
    return (
      <HomeScreen
        user={homeUser}
        dashboard={dashboard}
        stations={pickupStations}
        loading={loading}
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onBookScooty={(stationId) => {
          if (!stationId) {
            setStep('search');
            return;
          }
          const station = stations?.find((s) => s._id === stationId) ?? null;
          startBookingFlow(station);
        }}
        onViewAll={() => setStep('search')}
        onReferPress={() => setStep('offers')}
        onLocationPress={() => setStep('edit-location')}
        onWalletPress={() => setStep('wallet')}
      />
    );
  }

  if (step === 'edit-location') {
    return (
      <EditLocationScreen
        currentCity={user?.settings?.location?.city || user?.city || ''}
        loading={loading}
        onBack={() => setStep('dashboard')}
        onSave={(city, state, coords) => {
          void handleSaveLocation(city, state, coords);
        }}
        onUseCurrentLocation={() => {
          void handleUseCurrentLocation();
        }}
      />
    );
  }

  if (step === 'search') {
    return (
      <SearchScreen
        onBack={() => setStep('dashboard')}
        stations={visibleStations}
        loading={loading}
        selectedStationId={selectedSearchStationId}
        onSelectStation={(station) => {
          setSelectedSearchStationId(station._id);
          setSelectedPickupStation(mapStationToPickupStation(station, station._id));
        }}
        onContinue={() => {
          const station = stations?.find((item) => item._id === selectedSearchStationId) || stations?.[0];
          startBookingFlow(station || null);
        }}
      />
    );
  }

  if (step === 'ride-plan') {
    return (
      <RidePlanScreen
        onBack={() => setStep('dashboard')}
        selectedPlan={selectedRidePlan?.id as RidePlanId | null}
        plans={availableRidePlans}
        onSelectPlan={(planId) => {
          setSelectedRidePlan(availableRidePlans.find((plan) => plan.id === planId) || null);
        }}
        onContinue={(plan) => {
          setSelectedRidePlan(plan);
          setStep('time-slot');
        }}
      />
    );
  }

  if (step === 'time-slot') {
    return (
      <TimeSlotScreen
        onBack={() => setStep('ride-plan')}
        plan={selectedRidePlan}
        slots={availableTimeSlots}
        onContinue={(selection) => {
          setSelectedTimeSlot({
            date: selection.date,
            time: selection.time,
            duration: selection.duration,
          });
          setSelectedRidePlan(selection.plan);
          setStep('drop-station');
        }}
      />
    );
  }

  if (step === 'drop-station') {
    return (
      <PickupStationScreen
        onBack={() => setStep('time-slot')}
        selectedStationId={selectedDropStation?.id}
        stations={pickupStations || undefined}
        planTitle={selectedRidePlan?.title}
        scheduleLabel={formatScheduleLabel(selectedTimeSlot)}
        mode="drop"
        onSelectStation={(station) => setSelectedDropStation(station)}
        onContinue={(station) => {
          setSelectedDropStation(station);
          setStep('confirm-ride');
        }}
      />
    );
  }

  if (step === 'bookings') {
    return (
      <BookingsScreen
        onBack={() => setStep('dashboard')}
        onTabPress={handleTabPress}
        bookings={bookings}
        loading={loading || bookingsLoading}
        activeTab={activeTab}
        onStartRide={(booking) => {
          setCreatedBooking(booking);
          const status = (booking.status || '').toUpperCase();
          if (status === 'ACTIVE' || status === 'ONGOING') {
            // Ride already running on the backend — jump straight back in.
            setSelectedRide({
              ...booking,
              status: 'ongoing',
              distance: 0,
              fare: booking.pricing?.totalPayable,
            });
            setStep('ride-progress');
            return;
          }
          setSelectedRide(null);
          setStep('pre-ride');
        }}
        onCancelBooking={handleCancelBookingPress}
        onViewDetails={handleViewBookingDetails}
        onViewReceipt={handleViewBookingReceipt}
      />
    );
  }

  if (step === 'ride-cancel') {
    return (
      <RideCancelScreen
        onBack={() => setStep('bookings')}
        onConfirmCancel={(reason) => {
          void handleConfirmCancel(reason);
        }}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
    );
  }

  if (step === 'pre-ride') {
    return (
      <PreRideScreen
        onBack={() => setStep('bookings')}
        onStartRide={() => setStep('scan-qr')}
        scootyId={
          createdBooking?.scooter?.registrationNumber ||
          createdBooking?.vehicleId?.registrationNumber ||
          'Unavailable'
        }
        scootyModel={
          createdBooking?.scooter?.modelName || createdBooking?.vehicleId?.modelName
        }
        scootyBattery={
          createdBooking?.scooter?.batteryPercent ??
          createdBooking?.vehicleId?.batteryPercent ??
          null
        }
        planName={createdBooking?.planName}
        totalPayable={createdBooking?.pricing?.totalPayable}
        walletBalance={dashboard?.walletBalance ?? 0}
      />
    );
  }

  if (step === 'profile') {
    return (
      <ProfileScreen
        onBack={() => setStep('dashboard')}
        onTabPress={handleTabPress}
        onLogout={handleLogout}
        onEditProfile={() => setStep('update-profile')}
        onMenuPress={handleProfileMenuPress}
        user={user}
        dashboard={dashboard}
        activeTab={activeTab}
      />
    );
  }

  if (step === 'update-profile') {
    return (
      <UpdateProfileScreen
        onBack={() => setStep('profile')}
        onSave={handleUpdateProfile}
        user={user}
        loading={loading}
      />
    );
  }

  if (step === 'notification') {
    return (
      <NotificationScreen
        onBack={() => setStep('dashboard')}
        onTabPress={handleTabPress}
        notifications={notifications}
        loading={loading}
        activeTab={activeTab}
      />
    );
  }

  if (step === 'ride-history') {
    return (
      <RideHistoryScreen
        onBack={() => setStep('profile')}
        onTabPress={handleTabPress}
        rides={rides}
        loading={ridesLoading}
        activeTab={activeTab}
        onOpenRide={(ride) => {
          setSelectedRide(ride);
          setStep('ride-completed');
        }}
      />
    );
  }

  if (step === 'booking-detail') {
    return (
      <BookingDetailScreen
        booking={selectedBookingDetail}
        onBack={() => setStep('bookings')}
        onViewReceipt={
          selectedBookingDetail
            ? () => {
                setReceiptBooking(selectedBookingDetail);
                setStep('booking-receipt');
              }
            : undefined
        }
      />
    );
  }

  if (step === 'booking-receipt') {
    return (
      <BookingReceiptScreen
        booking={receiptBooking}
        onBack={() => setStep(selectedBookingDetail ? 'booking-detail' : 'bookings')}
      />
    );
  }

  if (step === 'offers') {
    return (
      <OffersRewardsScreen
        onBack={() => setStep('profile')}
        onTabPress={handleTabPress}
        activeTab={activeTab}
        referral={referral}
        onApplyReferral={handleApplyReferral}
      />
    );
  }

  if (step === 'support') {
    return (
      <HelpSupportScreen
        onBack={() => setStep('profile')}
        onTabPress={handleTabPress}
        activeTab={activeTab}
        faqs={supportFaqs}
        loading={supportLoading}
        onSubmitIssue={async (message) => {
          if (!token) return;
          try {
            await userApi.createSupportTicket(token, {
              subject: 'Issue from app',
              message,
            });
            Alert.alert(
              'Ticket submitted',
              'Our support team will get back to you shortly.',
            );
          } catch (error) {
            Alert.alert('Could not submit', userApiErrorMessage(error));
          }
        }}
      />
    );
  }

  if (step === 'wallet') {
    return (
      <MyWalletScreen
        onBack={() => setStep('dashboard')}
        onTabPress={handleTabPress}
        balance={dashboard?.walletBalance ?? 0}
        transactions={transactions}
        activeTab={activeTab}
        onOpenRefundStatus={() => setStep('refund-status')}
        onRecharge={(amount) => {
          Alert.alert(
            'Recharge requested',
            `Top-up of ${formatCurrency(amount)} has been recorded. Your wallet will reflect the credit shortly.`,
          );
        }}
      />
    );
  }

  if (step === 'refund-status') {
    return (
      <DepositRefundStatusScreen
        onBack={() => setStep('wallet')}
        onGoToWallet={() => setStep('wallet')}
        onBackHome={() => {
          setActiveTab('home');
          setStep('dashboard');
        }}
      />
    );
  }

  if (step === 'ride-completed') {
    return (
      <RideCompletedScreen
        onBack={() => setStep('ride-history')}
        onHome={() => {
          setActiveTab('home');
          setStep('dashboard');
        }}
        onRate={() => setStep('rate')}
        duration={selectedRide?.schedule?.startLabel || selectedRide?.startAt || '—'}
        distance={selectedRide?.distance || 0}
        fare={selectedRide?.pricing?.totalPayable ?? selectedRide?.fare}
        securityDeposit={selectedRide?.pricing?.securityDeposit ?? 0}
      />
    );
  }

  if (step === 'confirm-ride') {
    return (
      <ConfirmRideScreen
        onBack={() => setStep('drop-station')}
        onConfirm={() => setStep('payment-mode')}
        scootyId={
          createdBooking?.scooter?.registrationNumber ||
          bookingQuote?.scooter?.registrationNumber ||
          (selectedPickupStation ? `SC${String(selectedPickupStation.id).padStart(3, '0')}` : 'Unavailable')
        }
        scootyBattery={0}
        scootyRange={0}
        farePerMinute={selectedRidePlan?.id === 'monthly' ? 2 : 3}
        farePerKilometer={selectedRidePlan?.id === 'weekly' ? 6 : 8}
        destinations={[]}
        loading={bookingBusy}
        planName={selectedRidePlan?.title}
        pickupStationName={selectedPickupStation?.name}
        dropStationName={selectedDropStation?.name}
        scheduleLabel={formatScheduleLabel(selectedTimeSlot)}
        estimatedTotal={bookingQuote?.pricing?.totalPayable || createdBooking?.pricing?.totalPayable || selectedRidePlan?.price}
        pricing={bookingQuote?.pricing}
      />
    );
  }

  if (step === 'payment-mode') {
    return (
      <PaymentModeScreen
        onBack={() => setStep('confirm-ride')}
        onConfirm={handleConfirmBooking}
        amount={
          bookingQuote?.pricing?.totalPayable ||
          createdBooking?.pricing?.totalPayable ||
          selectedRidePlan?.price ||
          0
        }
        walletBalance={Number(user?.walletBalance ?? dashboard?.walletBalance ?? 0)}
        loading={bookingBusy}
      />
    );
  }

  if (step === 'booking-confirmed') {
    const currentBooking = createdBooking || selectedRide;
    return (
      <BookingConfirmedScreen
        onBack={() => setStep('confirm-ride')}
        onStartRide={handleStartRide}
        canStartRide={canStartScheduledRide(currentBooking)}
        onViewDetails={() => setStep('bookings')}
        onBackHome={() => {
          setActiveTab('home');
          setStep('dashboard');
        }}
        pending={createdBooking?.status === 'PENDING_PAYMENT'}
        rideStartsIn={rideStartsInLabel(currentBooking?.startAt || bookingQuote?.schedule?.startAt)}
        bookingId={currentBooking?._id || 'Unavailable'}
        planType={currentBooking?.planName || selectedRidePlan?.title || 'Plan unavailable'}
        amount={currentBooking?.pricing?.totalPayable || bookingQuote?.pricing?.totalPayable || selectedRidePlan?.price}
        pickupStationName={currentBooking?.pickupStation?.name || selectedPickupStation?.name}
        dropStationName={currentBooking?.dropStation?.name || selectedRide?.dropStation?.name}
        timeSlot={
          currentBooking?.schedule?.startLabel && currentBooking?.schedule?.endLabel
            ? `${currentBooking.schedule.startLabel} - ${currentBooking.schedule.endLabel}`
            : selectedTimeSlot
              ? formatTime12(selectedTimeSlot.time)
              : undefined
        }
        duration={selectedTimeSlot?.duration || selectedRidePlan?.duration}
        pickupLat={selectedPickupStation?.coordinates?.latitude ?? null}
        pickupLng={selectedPickupStation?.coordinates?.longitude ?? null}
      />
    );
  }

  if (step === 'scan-qr') {
    return (
      <ScanQRCodeScreen
        onBack={() => setStep('pre-ride')}
        onScanned={handleScannedCode}
        expectedCode={createdBooking?.unlockCode || selectedRide?.unlockCode || ''}
      />
    );
  }

  if (step === 'ride-progress') {
    return (
      <RideInProgressScreen
        onEmergency={handleRideEmergency}
        onEndRide={handleEndRide}
        planName={selectedRide?.planName || createdBooking?.planName || 'Plan unavailable'}
        battery={
          selectedRide?.scooter?.batteryPercent ??
          createdBooking?.scooter?.batteryPercent ??
          createdBooking?.vehicleId?.batteryPercent ??
          null
        }
        startedAt={selectedRide?.rideStartedAt || createdBooking?.rideStartedAt || null}
        endAt={selectedRide?.endAt || createdBooking?.endAt || null}
      />
    );
  }

  if (step === 'end-ride-station') {
    return (
      <SelectParkingStationScreen
        onBack={() => setStep('ride-progress')}
        onSelectStation={() => setStep('parking-confirmation')}
      />
    );
  }

  if (step === 'parking-confirmation') {
    return (
      <ParkingConfirmationScreen
        onBack={() => setStep('ride-progress')}
        onRetakePhoto={() => undefined}
        onConfirmParking={(photo) => {
          void handleConfirmParking(photo);
        }}
      />
    );
  }

  if (step === 'rate') {
    return (
      <RateYourExperienceScreen
        onBack={() => setStep('ride-completed')}
        onSubmit={(rating, feedback) => {
          void (async () => {
            const bookingId = selectedRide?._id || createdBooking?._id;
            if (token && bookingId && rating > 0) {
              try {
                await userApi.completeRide(token, bookingId, {
                  rating,
                  review: feedback,
                });
              } catch (error) {
                console.warn('Could not submit rating:', userApiErrorMessage(error));
              }
            }
            setStep('dashboard');
          })();
        }}
        onSkip={() => setStep('dashboard')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text>Unknown step: {step}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
