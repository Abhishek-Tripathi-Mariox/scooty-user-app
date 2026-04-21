import React, { useEffect, useMemo, useState } from 'react';
import { Alert, NativeModules, Platform, StyleSheet, Text, View } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { OtpScreen } from './src/screens/OtpScreen';
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
import { RideCompletedScreen } from './src/screens/RideCompletedScreen';
import { RateYourExperienceScreen } from './src/screens/RateYourExperienceScreen';
import { ScanQRCodeScreen } from './src/screens/ScanQRCodeScreen';
import { RideInProgressScreen } from './src/screens/RideInProgressScreen';
import { ParkingConfirmationScreen } from './src/screens/ParkingConfirmationScreen';
import { ConfirmRideScreen } from './src/screens/ConfirmRideScreen';
import { BookingConfirmedScreen } from './src/screens/BookingConfirmedScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { AuthStep, OTP_LENGTH } from './src/constants/auth';
import type { TabKey } from './src/components/BottomTabs';
import {
  BookingItem,
  BookingQuote,
  Dashboard,
  NotificationItem,
  PlanItem,
  RideItem,
  StationItem,
  TimeSlotItem,
  User,
  userApi,
  userApiErrorMessage,
} from './src/services/userApi';

type AppStep =
  | 'splash'
  | AuthStep
  | 'permissions'
  | 'dashboard'
  | 'search'
  | 'ride-plan'
  | 'time-slot'
  | 'drop-station'
  | 'confirm-ride'
  | 'booking-confirmed'
  | 'scan-qr'
  | 'ride-progress'
  | 'parking-confirmation'
  | 'bookings'
  | 'profile'
  | 'update-profile'
  | 'notification'
  | 'ride-history'
  | 'offers'
  | 'support'
  | 'ride-completed'
  | 'rate';

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

const mapStationToPickupStation = (station: StationItem, fallbackId: string): PickupStation => ({
  id: station._id || fallbackId,
  name: station.name || 'Central Plaza Station',
  address: station.address || 'MC Road, Sector 14',
  distance:
    typeof station.distanceKm === 'number' && Number.isFinite(station.distanceKm)
      ? `${station.distanceKm.toFixed(1)} km`
      : '0.2 km',
  available: Number(station.availableScooties ?? 0),
  battery: '92%',
  parking: 'Covered Parking',
});

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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // User data state
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [stations, setStations] = useState<StationItem[] | null>(null);
  const [rides, setRides] = useState<RideItem[] | null>(null);
  const [bookings, setBookings] = useState<BookingItem[] | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(null);
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
    const permissions = settings?.permissions;
    return Boolean(
      permissions &&
        (permissions.location !== undefined ||
          permissions.camera !== undefined ||
          permissions.notifications !== undefined),
    );
  };

  const loadRidePlans = async (stationId?: string | null) => {
    if (!token) return [];

    const plansResult = await userApi.plans(token, stationId || undefined);
    const mappedPlans =
      plansResult.plans && plansResult.plans.length > 0
        ? plansResult.plans.map(mapBackendPlanToRidePlan)
        : [];

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
    }, 1200);

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

  const loadUserData = async () => {
    try {
      if (!token) return;

      setLoading(true);
      const profileResult = await userApi.profile(token);
      setUser(profileResult.user);
      setDashboard(profileResult.dashboard);

      const stationsResult = await userApi.stations(token);
      setStations(stationsResult.stations);

      try {
        await loadRidePlans();
      } catch (error) {
        console.warn('Failed to load ride plans:', error);
      }

      const notificationsResult = await userApi.notifications(token);
      setNotifications(notificationsResult.notifications);

      await loadBookings();
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Error', 'Please accept Terms & Conditions');
      return;
    }

    try {
      setLoading(true);
      await userApi.sendOtp(mobileNumber);
      setStep('otp');
      setOtp('');
    } catch (error) {
      Alert.alert('Error', userApiErrorMessage(error));
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
      setStep('permissions');
    } catch (error) {
      Alert.alert('Error', userApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionsContinue = async (permissions: Record<'location' | 'camera' | 'notifications', boolean>) => {
    try {
      setLoading(true);
      if (token) {
        const result = await userApi.updateSettings(token, {
          permissions,
          language: user?.settings?.language || 'en',
          location: {
            isEnabled: permissions.location,
            city: user?.city || '',
            state: user?.state || '',
            pincode: user?.pincode || '',
            source: 'profile',
          },
        });
        setUser(result.user);
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
      Alert.alert('Error', userApiErrorMessage(error));
    } finally {
      setLoading(false);
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
      case 'language':
        Alert.alert('Language', user?.settings?.language === 'hi' ? 'Hindi' : 'English');
        break;
    }
  };

  const handleUpdateProfile = async (payload: {
    name: string;
    email: string;
    city: string;
    address: string;
    language: string;
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
        language: payload.language || undefined,
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

  const handleConfirmBooking = async () => {
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

      const bookingResult = await userApi.createBooking(token, {
        pickupStationId,
        dropStationId,
        planCode,
        date: bookingDate,
        startTime,
        walletToUse: 0,
        paymentMethod: 'ONLINE',
        paymentReferenceId: `PAY-${Date.now()}`,
        autoConfirm: true,
      });
      setCreatedBooking(bookingResult.booking);

      const [profileResult, ridesResult, dashboardResult, notificationsResult] = await Promise.all([
        userApi.profile(token),
        userApi.rides(token),
        userApi.dashboard(token),
        userApi.notifications(token),
      ]);
      setUser(profileResult.user);
      setDashboard(profileResult.dashboard || dashboardResult.dashboard);
      setRides(ridesResult.rides);
      setNotifications(notificationsResult.notifications);
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

  const handleStartRide = () => {
    setStep('scan-qr');
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
    Alert.alert('Ride Status', 'This demo ride action is ready for live ride integration.');
  };

  const handleEndRide = () => {
    setStep('parking-confirmation');
  };

  const handleConfirmParking = () => {
    setSelectedRide((current) =>
      current
        ? {
            ...current,
            status: 'completed',
            distance: current.distance || 6.5,
            fare: current.fare || current.pricing?.totalPayable || 153,
          }
        : current,
    );
    setStep('ride-completed');
  };

  // Render
  if (step === 'splash') {
    return <SplashScreen />;
  }

  if (step === 'login') {
    return (
      <LoginScreen
        mobileNumber={mobileNumber}
        acceptedTerms={acceptedTerms}
        onToggleTerms={() => setAcceptedTerms(!acceptedTerms)}
        onChangeMobile={setMobileNumber}
        onContinue={handleSendOtp}
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
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onBookScooty={startBookingFlow}
        onViewAll={() => setStep('search')}
        onReferPress={() => setStep('offers')}
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
        activeTab={activeTab}
        onOpenRide={(ride) => {
          setSelectedRide(ride);
          setStep('ride-completed');
        }}
      />
    );
  }

  if (step === 'offers') {
    return (
      <OffersRewardsScreen
        onBack={() => setStep('profile')}
        onTabPress={handleTabPress}
        activeTab={activeTab}
      />
    );
  }

  if (step === 'support') {
    return (
      <HelpSupportScreen
        onBack={() => setStep('profile')}
        onTabPress={handleTabPress}
        activeTab={activeTab}
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
        duration={selectedRide?.schedule?.startLabel || selectedRide?.startAt || '18:45'}
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
        onConfirm={handleConfirmBooking}
        scootyId={
          createdBooking?.scooter?.registrationNumber ||
          bookingQuote?.scooter?.registrationNumber ||
          (selectedPickupStation ? `SC${String(selectedPickupStation.id).padStart(3, '0')}` : 'SC001')
        }
        scootyBattery={92}
        scootyRange={45}
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
        bookingId={createdBooking?._id || 'SCT12322'}
        planType={createdBooking?.planName || selectedRidePlan?.title || 'Full Day'}
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
        rideStartsIn="15 mins"
      />
    );
  }

  if (step === 'scan-qr') {
    return (
      <ScanQRCodeScreen
        onBack={() => setStep('booking-confirmed')}
        onScanned={handleScannedCode}
      />
    );
  }

  if (step === 'ride-progress') {
    return (
      <RideInProgressScreen
        onEmergency={handleRideEmergency}
        onPauseResume={handlePauseResumeRide}
        onEndRide={handleEndRide}
        rideTime={selectedRide?.schedule?.startLabel || '0:05'}
        distance={selectedRide?.distance || 0}
        battery={92}
        speed={18}
      />
    );
  }

  if (step === 'parking-confirmation') {
    return (
      <ParkingConfirmationScreen
        onBack={() => setStep('ride-progress')}
        onRetakePhoto={() => setStep('ride-progress')}
        onConfirmParking={handleConfirmParking}
        photoTaken={false}
      />
    );
  }

  if (step === 'rate') {
    return (
      <RateYourExperienceScreen
        onBack={() => setStep('ride-completed')}
        onSubmit={() => {
          setStep('dashboard');
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
