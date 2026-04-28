import React from 'react';
import { ViewStyle } from 'react-native';
import { GradientButton } from './GradientButton';

export function PrimaryButton({
  label,
  onPress,
  style,
  disabled,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}) {
  return (
    <GradientButton
      label={label}
      onPress={onPress}
      style={style}
      disabled={disabled}
      height={44}
      radius={12}
    />
  );
}
