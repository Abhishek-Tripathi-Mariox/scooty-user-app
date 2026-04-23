import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export function GradientButton({
  label,
  onPress,
  style,
  disabled,
  height = 48,
  radius = 12,
  leftIcon,
  labelStyle,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  height?: number;
  radius?: number;
  leftIcon?: ReactNode;
  labelStyle?: import('react-native').TextStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { height, borderRadius: radius },
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <View style={[StyleSheet.absoluteFillObject, { borderRadius: radius, overflow: 'hidden' }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#fc4c02" stopOpacity="1" />
              <Stop offset="100%" stopColor="#ff7a45" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#btnGrad)" />
        </Svg>
      </View>
      {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  leftIcon: {
    marginRight: 8,
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
});
