import React from 'react';
import { AppRegistry, Image, Platform, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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

// Force the bundled Poppins family as the base font for every Text/TextInput.
// Phones with a custom system font (common on Unisoc/Tecno/Itel devices and
// OEM theme stores) draw glyphs wider than React Native measured them, which
// clips labels mid-word ("Slydo Mobi…", "Send" instead of "Send OTP") and
// shifts layouts vertically. A bundled font keeps measure and draw identical
// on every device. Styles that declare their own fontFamily still win because
// the default is prepended before the element's own style.
const DEFAULT_FONT = { fontFamily: 'Poppins' };
const patchRender = (Component) => {
  const originalRender = Component.render;
  if (typeof originalRender !== 'function') return;
  // Merge into props BEFORE the component renders: Text wraps its output in a
  // TextAncestor.Provider, so cloning the returned element cannot reach the
  // native text node.
  Component.render = function (props, ref) {
    return originalRender.call(
      this,
      { ...props, style: [DEFAULT_FONT, props.style] },
      ref,
    );
  };
};
patchRender(Text);
patchRender(TextInput);

// The app window draws edge-to-edge (behind the transparent status and
// navigation bars). This root wrapper paints the shared background across
// the FULL screen — including behind the system bars — and then pads the
// actual app content below the status bar so headers and back buttons
// stay fully tappable.
// MainActivity opts every Android version into edge-to-edge (Android 15+
// already forces it), so content must always be pushed below the status bar.
const IS_EDGE_TO_EDGE = Platform.OS === 'android';
const STATUS_BAR_HEIGHT = IS_EDGE_TO_EDGE ? StatusBar.currentHeight ?? 0 : 0;

function Root() {
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <Image
          source={require('./src/assets/images/userbackground.png')}
          style={styles.background}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <App />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  content: {
    flex: 1,
    paddingTop: STATUS_BAR_HEIGHT,
  },
});

AppRegistry.registerComponent('App', () => Root);
