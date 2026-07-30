import { Platform, StatusBar } from 'react-native';

// On edge-to-edge Android (15+) the Root wrapper (index.js) pads all app
// content below the transparent status bar. Screens use this inset to
// stretch their own backgrounds up underneath the status bar so the app
// visually fills the entire screen.
export const STATUS_TOP_INSET =
  Platform.OS === 'android' && Number(Platform.Version) >= 35
    ? StatusBar.currentHeight ?? 0
    : 0;
