import { Platform, StatusBar } from 'react-native';

// The app draws edge-to-edge on every Android version (MainActivity opts
// pre-15 devices in; Android 15+ forces it). The Root wrapper (index.js)
// pads all app content below the transparent status bar. Screens use this
// inset to stretch their own backgrounds up underneath the status bar so
// the app visually fills the entire screen.
export const STATUS_TOP_INSET =
  Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
