import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export function GradientFill({ radius = 0 }: { radius?: number }) {
  const rawId = useId();
  const id = `grad-${rawId.replace(/:/g, '')}`;
  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { borderRadius: radius, overflow: 'hidden', pointerEvents: 'none' },
      ]}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#fc4c02" stopOpacity="1" />
            <Stop offset="100%" stopColor="#ff7a45" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
