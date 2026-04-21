import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandHeader } from '../components/BrandHeader';
import { ScreenSurface } from '../components/ScreenSurface';
import { COLORS } from '../constants/theme';

export function SplashScreen() {
  return (
    <ScreenSurface variant="auth">
      <View style={styles.content}>
        <BrandHeader />
        <Text style={styles.tagline}>Ride smarter, faster, and cleaner</Text>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  tagline: {
    marginTop: 14,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
