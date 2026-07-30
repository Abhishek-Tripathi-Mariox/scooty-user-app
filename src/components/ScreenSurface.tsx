import React, { ReactNode } from 'react';
import { SafeAreaView, StyleSheet, View, ViewStyle } from 'react-native';
import { AppBackground } from './AppBackground';
import { STATUS_TOP_INSET } from '../utils/statusBarInset';

export const DESIGN_SURFACE_WIDTH = 390.4873046875;

export function ScreenSurface({
  children,
  variant = 'default',
  contentStyle,
}: {
  children: ReactNode;
  variant?: 'default' | 'auth' | 'otp';
  contentStyle?: ViewStyle;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant={variant} />
      <View style={[styles.surface, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  surface: {
    flex: 1,
    width: '100%',
    // Stretch the surface tint up under the status bar while keeping the
    // children exactly where they were.
    marginTop: -STATUS_TOP_INSET,
    paddingTop: STATUS_TOP_INSET,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#d9b7ab',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
});
