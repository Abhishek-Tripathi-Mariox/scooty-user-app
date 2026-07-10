import { AppRegistry, Text, TextInput } from 'react-native';
import App from './App';

// Keep the UI pixel-consistent on every phone regardless of the device's
// system "Font size" (accessibility) setting. Without this, a large system
// font enlarges every label, overflows fixed-height rows/buttons (letters get
// clipped and appear to vanish) and pushes screens like Login out of place.
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
Text.defaultProps.maxFontSizeMultiplier = 1;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;
TextInput.defaultProps.maxFontSizeMultiplier = 1;

AppRegistry.registerComponent('App', () => App);
