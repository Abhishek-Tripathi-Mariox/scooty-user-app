import { Platform } from 'react-native';

const LOCAL_USER_API_BASE_URL =
  Platform.select({
    android: 'http://10.0.2.2:3000/v1/api',
    ios: 'http://localhost:3000/v1/api',
    default: 'http://localhost:3000/v1/api',
  }) || 'http://localhost:3000/v1/api';

const HOSTED_USER_API_BASE_URL: string = 'https://mira-ai.marioxsoftware.net/scooty/v1/api';
const LEGACY_HOSTED_USER_API_BASE_URL: string = 'https://mira-ai.marioxsoftware.net/v1/api';

export const USER_API_BASE_URL: string = HOSTED_USER_API_BASE_URL;
const USER_API_BASE_URLS = [HOSTED_USER_API_BASE_URL, LEGACY_HOSTED_USER_API_BASE_URL, LOCAL_USER_API_BASE_URL];

type JsonObject = Record<string, unknown>;

export type KycUploadFile = {
  uri: string;
  name: string;
  type: string;
  size?: number | null;
};

export type User = {
  _id: string;
  name?: string;
  email?: string;
  mobile?: string;
  language?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  adress?: string;
  role?: string;
  profilePhotoUrl?: string;
  walletBalance?: number;
  kycStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  kycRejectionReason?: string;
  kycSubmittedAt?: string;
  kycVerifiedAt?: string;
  adharFile?: string;
  panFile?: string;
  settings?: UserSettings;
};

export type UserKyc = {
  status?: string;
  rejectionReason?: string;
  submittedAt?: string | null;
  verifiedAt?: string | null;
  documents?: {
    profilePhotoUrl?: string;
    adharFile?: string;
    panFile?: string;
  };
};

export type KycUploadFiles = {
  profilePhoto?: KycUploadFile | null;
  adharFile?: KycUploadFile | null;
  panFile?: KycUploadFile | null;
};

export type Dashboard = {
  walletBalance: number;
  totalSpent: number;
  ridesCompleted: number;
  unreadNotifications: number;
};

export type NotificationItem = {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
};

export type WalletTransactionItem = {
  _id: string;
  key?: string;
  type: string;
  direction?: 'DEBIT' | 'CREDIT';
  status?: string;
  amount: number;
  taxAmount?: number;
  commissionAmount?: number;
  ownerAmount?: number;
  platformAmount?: number;
  sourceType?: string;
  stationId?: string | null;
  sourceId?: string | null;
  bookingId?: string | null;
  referenceId?: string;
  description?: string;
  currency?: string;
  balanceBefore?: number | null;
  balanceAfter?: number | null;
  meta?: Record<string, unknown>;
  createdAt?: string;
};

export type WalletSummary = {
  balance: number;
  referralEarnings: number;
  recentCredits: Array<{
    id: string;
    title: string;
    amount: number;
    createdAt?: string;
  }>;
  activeReservations: Array<{
    id: string;
    title: string;
    amount: number;
    createdAt?: string;
  }>;
};

export type RideItem = {
  _id: string;
  status?: string;
  planCode?: string;
  planName?: string;
  planType?: string;
  date?: string;
  startAt?: string;
  endAt?: string;
  durationHours?: number;
  pricing?: BookingQuote['pricing'];
  payment?: {
    status?: string;
    method?: string;
    referenceId?: string;
    paidAmount?: number;
    paidAt?: string;
  };
  unlockCode?: string;
  pickupStation?: StationItem;
  dropStation?: StationItem;
  scooter?: {
    id?: string;
    modelName?: string;
    registrationNumber?: string;
    imageUrl?: string;
  };
  schedule?: BookingItem['schedule'];
  distance?: number;
  fare?: number;
  startTime?: string;
  endTime?: string;
  createdAt?: string;
};

export type StationItem = {
  _id: string;
  name?: string;
  address?: string;
  city?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  availableScooters?: number;
  averageBatteryPercent?: number | null;
  distanceKm?: number | null;
};

export type PlanItem = {
  _id: string;
  code?: string;
  name?: string;
  type?: string;
  durationHours?: number;
  price?: number;
  securityDeposit?: number;
  description?: string;
  perks?: string[];
  badge?: string;
  availableScooters?: number;
};

export type TimeSlotItem = {
  label: string;
  value: string;
  disabled?: boolean;
  endLabel?: string;
};

export type TimeSlotResponse = {
  date: string;
  plan: PlanItem;
  slots: TimeSlotItem[];
};

export type BookingQuote = {
  plan: PlanItem;
  scooter: {
    id?: string;
    modelName?: string;
    registrationNumber?: string;
    imageUrl?: string;
  };
  pickupStation: StationItem;
  dropStation?: StationItem;
  schedule: {
    date: string;
    startAt: string;
    endAt: string;
    startLabel: string;
    endLabel: string;
  };
  pricing: {
    baseFare?: number;
    securityDeposit?: number;
    convenienceFee?: number;
    tax?: number;
    discount?: number;
    referralDiscount?: number;
    walletUsed?: number;
    totalPayable?: number;
  };
  referralCodeApplied?: string;
};

export type BookingItem = {
  _id: string;
  status?: string;
  userId?: string;
  vehicleId?: {
    _id?: string;
    modelName?: string;
    registrationNumber?: string;
    photos?: {
      frontUrl?: string;
      sideUrl?: string;
    };
  };
  pickupStationId?: StationItem;
  dropStationId?: StationItem;
  planCode?: string;
  planName?: string;
  planType?: string;
  date?: string;
  startAt?: string;
  endAt?: string;
  durationHours?: number;
  pricing?: BookingQuote['pricing'];
  payment?: {
    status?: string;
    method?: string;
    referenceId?: string;
    paidAmount?: number;
    paidAt?: string;
  };
  unlockCode?: string;
  refund?: {
    status?: string;
    amount?: number;
    method?: string;
    referenceId?: string;
    processedByRole?: string;
    processedByUserId?: string | null;
    failureReason?: string;
    note?: string;
  };
  parkingPhotoUrl?: string;
  review?: string;
  actualDurationMinutes?: number;
  referralCodeApplied?: string;
  offerCodeApplied?: string;
  meta?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  pickupStation?: StationItem;
  dropStation?: StationItem;
  scooter?: {
    id?: string;
    modelName?: string;
    registrationNumber?: string;
    imageUrl?: string;
  };
  schedule?: {
    date?: string;
    startAt?: string;
    endAt?: string;
    startLabel?: string;
    endLabel?: string;
    dateLabel?: string;
  };
  distance?: number;
  fare?: number;
  startTime?: string;
  endTime?: string;
};

export type SupportFaq = {
  id: string;
  question: string;
  answer?: string;
};

export type SupportTicket = {
  _id: string;
  subject?: string;
  message?: string;
  status?: string;
  createdAt?: string;
};

export type UserSettings = {
  notifications?: {
    rideUpdates?: boolean;
    promotions?: boolean;
    support?: boolean;
    earnings?: boolean;
    payout?: boolean;
    maintenance?: boolean;
  };
  language?: string;
  permissions?: {
    location?: boolean;
    camera?: boolean;
    notifications?: boolean;
  };
  location?: {
    isEnabled?: boolean;
    latitude?: number | null;
    longitude?: number | null;
    accuracy?: number | null;
    source?: string;
    city?: string;
    state?: string;
    pincode?: string;
    updatedAt?: string | Date | null;
  };
};

type RequestOptions = {
  token?: string | null;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  isFormData?: boolean;
  query?: Record<string, string | number | undefined | null>;
};

class ApiError extends Error {
  code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

const toQuery = (query?: RequestOptions['query']) => {
  if (!query) return '';
  const rendered = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return rendered ? `?${rendered}` : '';
};

const buildUrl = (baseUrl: string, path: string, query?: RequestOptions['query']) =>
  `${baseUrl}${path}${toQuery(query)}`;

const requestWithBase = async <T>(baseUrl: string, path: string, options: RequestOptions = {}): Promise<T> => {
  const url = buildUrl(baseUrl, path, options.query);
  const headers: Record<string, string> = {};

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (!options.isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  console.log(`[API] ${options.method ?? 'GET'} ${url}`, {
    hasToken: !!options.token,
    isFormData: options.isFormData,
    body: options.isFormData ? 'FormData' : options.body,
  });

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body:
        options.body === undefined
          ? undefined
          : options.isFormData
            ? (options.body as FormData)
            : JSON.stringify(options.body),
    });
  } catch (error) {
    throw new ApiError(
      `Cannot reach API at ${baseUrl}. Make sure the backend is running and the device can access it.`,
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | { code?: number; message?: string; data?: T }
    | null;

  console.log(`[API Response] ${response.status}`, { message: payload?.message, code: payload?.code });

  if (!response.ok || payload?.code === 0 || payload?.code === 3 || payload?.code === 5) {
    throw new ApiError(payload?.message || 'Request failed', payload?.code);
  }

  return (payload?.data ?? (payload as unknown as T)) as T;
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  let lastError: unknown = null;

  for (const baseUrl of USER_API_BASE_URLS) {
    try {
      return await requestWithBase<T>(baseUrl, path, options);
    } catch (error) {
      lastError = error;

      const message = error instanceof ApiError ? error.message : '';
      const isRetryable =
        error instanceof ApiError &&
        (/route not found/i.test(message) || /cannot reach api/i.test(message));

      if (!isRetryable) {
        throw error;
      }
    }
  }

  throw lastError;
};

export const userApi = {
  sendOtp: (mobile: string) =>
    request<{ mobile: string; otp: string }>('/user/auth/send-otp', {
      method: 'POST',
      body: { mobile },
    }),
  verifyOtp: (payload: {
    mobile: string;
    otp: string;
    name?: string;
  }) =>
    request<{ token: string; user: User }>('/user/auth/verify-otp', {
      method: 'POST',
      body: payload,
    }),
  dashboard: (token: string) =>
    request<{ dashboard: Dashboard }>('/user/dashboard', { token }),
  profile: (token: string) =>
    request<{ user: User; dashboard: Dashboard }>('/user/me', { token }),
  me: (token: string) =>
    request<{ user: User; dashboard: Dashboard }>('/user/me', { token }),
  kyc: (token: string) => request<{ kyc: UserKyc }>('/user/kyc', { token }),
  submitKyc: (token: string, files: KycUploadFiles = {}) => {
    const formData = new FormData();
    const append = (field: string, file?: KycUploadFile | null) => {
      if (!file) return;
      formData.append(field, {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as unknown as Blob);
    };
    append('profilePhoto', files.profilePhoto);
    append('adharFile', files.adharFile);
    append('panFile', files.panFile);

    return request<{ kyc: UserKyc }>('/user/kyc', {
      method: 'PATCH',
      token,
      body: formData,
      isFormData: true,
    });
  },
  wallet: (token: string) =>
    request<{ wallet: WalletSummary }>('/user/wallet', { token }),
  updateProfile: (
    token: string,
    payload: Partial<User> & {
      name?: string;
      email?: string;
      city?: string;
      address?: string;
      language?: string;
    },
    profilePhoto?: KycUploadFile | null,
  ) =>
    profilePhoto
      ? request<{ user: User; dashboard?: Dashboard }>('/user/me', {
          method: 'PATCH',
          token,
          isFormData: true,
          body: (() => {
            const formData = new FormData();

            Object.entries(payload).forEach(([key, value]) => {
              if (value === undefined || value === null || value === '') {
                return;
              }

              formData.append(key, String(value));
            });

            formData.append(
              'profilePhoto',
              {
                uri: profilePhoto.uri,
                type: profilePhoto.type,
                name: profilePhoto.name,
              } as any,
            );

            return formData;
          })(),
        })
      : request<{ user: User; dashboard?: Dashboard }>('/user/me', {
          method: 'PATCH',
          token,
          body: payload,
        }),
  settings: (token: string) =>
    request<{ settings: UserSettings }>('/user/settings', { token }),
  plans: (token: string, stationId?: string) =>
    request<{ plans: PlanItem[] }>('/user/plans', {
      token,
      query: { stationId },
    }),
  timeSlots: (
    token: string,
    query: { date?: string; planCode?: string; stationId?: string } = {},
  ) =>
    request<TimeSlotResponse>('/user/time-slots', {
      token,
      query,
    }),
  bookingQuote: (
    token: string,
    payload: {
      pickupStationId?: string;
      dropStationId?: string;
      vehicleId?: string;
      planCode?: string;
      date?: string;
      startTime?: string;
      referralCode?: string;
      walletToUse?: number;
    },
  ) =>
    request<{ quote: BookingQuote }>('/user/bookings/quote', {
      method: 'POST',
      token,
      body: payload,
    }),
  createBooking: (
    token: string,
    payload: {
      pickupStationId?: string;
      dropStationId?: string;
      vehicleId?: string;
      planCode?: string;
      date?: string;
      startTime?: string;
      referralCode?: string;
      walletToUse?: number;
      paymentMethod?: string;
      paymentReferenceId?: string;
      autoConfirm?: boolean;
    },
  ) =>
    request<{ booking: BookingItem }>('/user/bookings', {
      method: 'POST',
      token,
      body: payload,
    }),
  bookings: (token: string, status?: string) =>
    request<{ bookings: BookingItem[] }>('/user/bookings', {
      token,
      query: { status },
    }),
  bookingDetail: (token: string, bookingId: string) =>
    request<{ booking: BookingItem }>(`/user/bookings/${bookingId}`, { token }),
  notifications: (token: string, type?: string) =>
    request<{ notifications: NotificationItem[] }>('/user/notifications', {
      token,
      query: { type },
    }),
  transactions: (
    token: string,
    query: { type?: string; from?: string; to?: string; page?: number; limit?: number } = {},
  ) =>
    request<{
      transactions: WalletTransactionItem[];
      pagination?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
        hasNextPage?: boolean;
        hasPrevPage?: boolean;
      };
    }>('/user/transactions', {
      token,
      query,
    }),
  markNotificationRead: (token: string, notificationId: string) =>
    request<{ notification: NotificationItem }>(`/user/notifications/${notificationId}/read`, {
      method: 'PATCH',
      token,
    }),
  rides: (token: string, query: { page?: number; limit?: number; status?: string } = {}) =>
    request<{ rides: RideItem[]; pagination?: { page?: number; limit?: number; total?: number; pages?: number } }>(
      '/user/rides/history',
      {
        token,
        query,
      },
    ),
  rideDetail: (token: string, rideId: string) =>
    request<{ ride: RideItem }>(`/user/rides/history/${rideId}`, { token }),
  stations: (token: string, query: { city?: string; latitude?: number; longitude?: number; search?: string } = {}) =>
    request<{ stations: StationItem[] }>('/user/stations', {
      token,
      query: {
        city: query.city,
        search: query.search,
        lat: query.latitude,
        lng: query.longitude,
      },
    }),
  supportFaqs: (token: string) =>
    request<{ faqs: SupportFaq[] }>('/user/support/faqs', { token }),
  supportTickets: (token: string) =>
    request<{ tickets: SupportTicket[] }>('/user/support/tickets', { token }),
  createSupportTicket: (token: string, payload: { subject: string; message: string }) =>
    request<{ ticket: SupportTicket }>('/user/support/tickets', {
      method: 'POST',
      token,
      body: payload,
    }),
  updateSettings: (token: string, settings: Partial<UserSettings>) =>
    request<{ user: User }>('/user/settings', {
      method: 'PATCH',
      token,
      body: { settings },
    }),
  updateLocation: (
    token: string,
    location: NonNullable<UserSettings['location']>,
  ) =>
    request<{ user: User }>('/user/location', {
      method: 'PATCH',
      token,
      body: { location },
    }),
};

export const userApiErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message || 'Something went wrong';
  }
  return 'Something went wrong';
};
