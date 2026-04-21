import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop, Circle } from 'react-native-svg';

type BackgroundVariant = 'default' | 'auth' | 'otp';

const VARIANTS: Record<
  BackgroundVariant,
  {
    base: string;
    top: string;
    mid: string;
    bottom: string;
    topRight: string;
    bottomLeft: string;
  }
> = {
  default: {
    base: '#f5e6df',
    top: '#f8dfce',
    mid: '#f6e3d4',
    bottom: '#f4ccd3',
    topRight: '#f4d7c8',
    bottomLeft: '#efc8d2',
  },
  auth: {
    base: '#f5e6df',
    top: '#f8dfce',
    mid: '#f6e3d4',
    bottom: '#f4ccd3',
    topRight: '#f4d7c8',
    bottomLeft: '#efc8d2',
  },
  otp: {
    base: '#f4ddd2',
    top: '#f7ddcd',
    mid: '#f5e1d3',
    bottom: '#d3dae5',
    topRight: '#ecd9cc',
    bottomLeft: '#e7cfd6',
  },
};

export function AppBackground({ variant = 'default' }: { variant?: BackgroundVariant }) {
  const colors = VARIANTS[variant];

  return (
    <>
      <View pointerEvents="none" style={styles.base}>
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.top} stopOpacity="1" />
              <Stop offset="50%" stopColor={colors.mid} stopOpacity="1" />
              <Stop offset="100%" stopColor={colors.bottom} stopOpacity="1" />
            </LinearGradient>
            <RadialGradient id="topGlow" cx="50%" cy="28%" rx="45%" ry="35%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
              <Stop offset="45%" stopColor={colors.topRight} stopOpacity="0.34" />
              <Stop offset="100%" stopColor={colors.topRight} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="bottomGlow" cx="40%" cy="82%" rx="50%" ry="34%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.62" />
              <Stop offset="55%" stopColor={colors.bottomLeft} stopOpacity="0.35" />
              <Stop offset="100%" stopColor={colors.bottomLeft} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#grad1)" />
          <Circle cx="190" cy="245" r="120" fill="url(#topGlow)" />
          <Circle cx="120" cy="660" r="150" fill="url(#bottomGlow)" />
          <Circle cx="290" cy="1040" r="125" fill={colors.bottomLeft} opacity="0.35" />
          <Circle cx="40" cy="1180" r="100" fill={colors.bottomLeft} opacity="0.22" />
        </Svg>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: VARIANTS.default.base,
  },
});
