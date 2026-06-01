import React, { useEffect, useMemo, useState } from 'react';
import { Alert, AppState, NativeModules, Platform, StyleSheet, Text, View } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { LoginScreen } from './src/screens/LoginScreen';
import { OtpScreen } from './src/screens/OtpScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { KycScreen } from './src/screens/KycScreen';
import { PendingApprovalScreen } from './src/screens/PendingApprovalScreen';
import { HomeScreen } from './src/screens/HomeScreen';
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
} from './src/services/userApi';
import { fetchCoordsIfAllowed } from './src/utils/location';
import { formatCurrency } from './src/utils/format';

type AppStep =
  | 'splash'
  | AuthStep
  | 'register'
  | 'kyc'
  | 'pending-approval'
  | 'permissions'
  | 'dashboard'
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

  return `${dateLabel}, ${selection.time} • ${selection.duration}`;
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

  // UI state
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const pickupStations = useMemo(
    () => stations?.map((station, index) => mapStationToPickupStation(station, String(index + 1))) ?? null,
    [stations],
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
    if (step !== 'splash' || isBootstrapping) return;

    const timer = setTimeout(() => {
      setStep('login');
    }, 5800);

    return () => clearTimeout(timer);
  }, [isBootstrapping, step]);

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
        await clearAuthToken();
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
        const kycStatus = await refreshKycStatus(token);
        if (!active) return;
        if (kycStatus === 'APPROVED') {
          if (hasCompletedPermissions(user?.settings)) {
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
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') void sync();
    });

    return () => {
      active = false;
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

    const coords = await fetchCoordsIfAllowed();
    if (!coords) return null;

    try {
      const result = await userApi.updateSettings(authToken, {
        location: {
          isEnabled: true,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy ?? null,
          city: profileUser.city || profileUser.settings?.location?.city || '',
          state: profileUser.state || profileUser.settings?.location?.state || '',
          pincode: profileUser.pincode || profileUser.settings?.location?.pincode || '',
          source: 'gps',
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
      const storedLocation = profileResult.user?.settings?.location;
      const stationsResult = await userApi.stations(token, {
        latitude: liveCoords?.latitude ?? storedLocation?.latitude ?? undefined,
        longitude: liveCoords?.longitude ?? storedLocation?.longitude ?? undefined,
      });
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
            const stationsResult = await userApi.stations(token, {
              latitude: coords.latitude,
              longitude: coords.longitude,
            });
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
      return result.user?.kycStatus;
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

      setUser(result.user);
      if (result.dashboard) {
        setDashboard(result.dashboard);
      }
      setStep('profile');
    } catch (error) {
      Alert.alert('Error', userApiErrorMessage(error));
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

  const handleConfirmBooking = async (paymentMethodId: 'CASH' | 'WALLET' = 'CASH') => {
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
        autoConfirm: true,
      });
      setCreatedBooking(bookingResult.booking);

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
        _id: bookingResult.booking._id,
        status: 'ongoing',
        planCode: bookingResult.booking.planCode,
        planName: bookingResult.booking.planName,
        date: bookingResult.booking.date,
        startAt: bookingResult.booking.startAt,
        endAt: bookingResult.booking.endAt,
        durationHours: bookingResult.booking.durationHours,
        pricing: bookingResult.booking.pricing,
        payment: bookingResult.booking.payment,
        pickupStation: bookingResult.booking.pickupStation,
        dropStation: bookingResult.booking.dropStation,
        scooter: bookingResult.booking.scooter,
        schedule: bookingResult.booking.schedule,
        distance: 0,
        fare: bookingResult.booking.pricing?.totalPayable,
      });

      setStep('booking-confirmed');
    } catch (error) {
      Alert.alert('Could not confirm ride', userApiErrorMessage(error));
    } finally {
      setBookingBusy(false);
    }
  };

  const handleStartRide = async () => {
    const bookingId = createdBooking?._id || selectedRide?._id;
    if (!token || !bookingId) {
      Alert.alert('Cannot start ride', 'Booking is not ready yet. Please try again.');
      return;
    }
    try {
      setBookingBusy(true);
      const result = await userApi.startRide(token, bookingId, {
        unlockCode: createdBooking?.unlockCode || selectedRide?.unlockCode,
      });
      setCreatedBooking(result.booking);
      setSelectedRide({
        ...result.booking,
        status: 'ongoing',
        unlockCode: result.booking.unlockCode,
        distance: 0,
        fare: result.booking.pricing?.totalPayable,
      });
      setStep('ride-progress');
    } catch (error) {
      Alert.alert('Could not start ride', userApiErrorMessage(error));
    } finally {
      setBookingBusy(false);
    }
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
    setSelectedRide((current) =>
      current
        ? {
            ...current,
            unlockCode: code,
            status: 'ongoing',
          }
        : current,
    );
    setStep('ride-progress');
  };

  const handleRideEmergency = () => {
    Alert.alert('Emergency SOS', 'We have notified support for this ride.');
  };

  const handlePauseResumeRide = () => {
    Alert.alert('Ride Status', 'Ride controls are ready for live ride integration.');
  };

  const handleEndRide = () => {
    setStep('end-ride-station');
  };

  const handleConfirmParking = async () => {
    const bookingId = selectedRide?._id || createdBooking?._id;
    if (!token || !bookingId) {
      Alert.alert('Cannot complete ride', 'No active ride found.');
      return;
    }
    try {
      setBookingBusy(true);
      const result = await userApi.completeRide(token, bookingId, {
        dropStationId: selectedDropStation?.id,
      });
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
    return <SplashScreen />;
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

  if (step === 'dashboard') {
    return (
      <HomeScreen
        user={user}
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
        onLocationPress={() => setStep('permissions')}
        onWalletPress={() => setStep('wallet')}
      />
    );
  }

  if (step === 'search') {
    return (
      <SearchScreen
        onBack={() => setStep('dashboard')}
        stations={stations}
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
        onStartRide={() => setStep('pre-ride')}
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
          (selectedPickupStation ? `SC${String(selectedPickupStation.id).padStart(3, '0')}` : 'Unavailable')
        }
        scootyBattery={0}
        scootyRange={0}
        farePerMinute={selectedRidePlan?.id === 'monthly' ? 2 : 3}
        farePerKilometer={selectedRidePlan?.id === 'weekly' ? 6 : 8}
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
        loading={loading}
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
    return (
      <BookingConfirmedScreen
        onBack={() => setStep('confirm-ride')}
        onStartRide={handleStartRide}
        onViewDetails={() => setStep('bookings')}
        onBackHome={() => {
          setActiveTab('home');
          setStep('dashboard');
        }}
        bookingId={createdBooking?._id || 'Unavailable'}
        planType={createdBooking?.planName || selectedRidePlan?.title || 'Plan unavailable'}
        amount={createdBooking?.pricing?.totalPayable || bookingQuote?.pricing?.totalPayable || selectedRidePlan?.price}
        pickupStationName={createdBooking?.pickupStation?.name || selectedPickupStation?.name}
        dropStationName={createdBooking?.dropStation?.name || selectedRide?.dropStation?.name}
        timeSlot={
          createdBooking?.schedule?.startLabel && createdBooking?.schedule?.endLabel
            ? `${createdBooking.schedule.startLabel} - ${createdBooking.schedule.endLabel}`
            : selectedTimeSlot
              ? `${selectedTimeSlot.time} - ${selectedTimeSlot.time}`
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
        onBack={() => setStep('booking-confirmed')}
        onScanned={handleScannedCode}
        expectedCode={createdBooking?.unlockCode || selectedRide?.unlockCode || ''}
      />
    );
  }

  if (step === 'ride-progress') {
    return (
      <RideInProgressScreen
        onEmergency={handleRideEmergency}
        onPauseResume={handlePauseResumeRide}
        onEndRide={handleEndRide}
        rideTime={selectedRide?.schedule?.startLabel || '—'}
        distance={selectedRide?.distance || 0}
        battery={0}
        speed={0}
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
        onBack={() => setStep('end-ride-station')}
        onRetakePhoto={() => undefined}
        onConfirmParking={handleConfirmParking}
        photoTaken={false}
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
