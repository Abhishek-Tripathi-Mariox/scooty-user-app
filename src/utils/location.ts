import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export type Coords = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

let configured = false;
const ensureConfigured = () => {
  if (configured) return;
  configured = true;
  try {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
      enableBackgroundLocationUpdates: false,
      locationProvider: 'auto',
    });
  } catch {
    // older versions ignore this signature
  }
};

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location permission',
      message: 'Allow Scooty to use your location to find nearby stations.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

function getOnce(options: {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}): Promise<Coords | null> {
  return new Promise((resolve) => {
    try {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy ?? null,
          });
        },
        (error) => {
          console.warn(
            `Geolocation error (highAccuracy=${options.enableHighAccuracy}):`,
            error?.message || error,
          );
          resolve(null);
        },
        options,
      );
    } catch (error) {
      console.warn('Geolocation native module unavailable:', error);
      resolve(null);
    }
  });
}

export async function getCurrentCoords(): Promise<Coords | null> {
  ensureConfigured();

  const cached = await getOnce({ enableHighAccuracy: false, timeout: 4000, maximumAge: 5 * 60 * 1000 });
  if (cached) return cached;

  const coarse = await getOnce({ enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
  if (coarse) return coarse;

  return getOnce({ enableHighAccuracy: true, timeout: 25000, maximumAge: 60000 });
}

export async function fetchCoordsIfAllowed(): Promise<Coords | null> {
  const ok = await requestLocationPermission();
  if (!ok) return null;
  return getCurrentCoords();
}
