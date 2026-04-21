import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { useResponsiveLayout } from '../utils/responsive';

export function OtpBoxes({
  otp,
  length,
}: {
  otp: string;
  length: number;
}) {
  const layout = useResponsiveLayout();
  return (
    <View style={[styles.row, { gap: layout.otpBoxGap }]}>
      {Array.from({ length }).map((_, index) => {
        const digit = otp[index] ?? 'X';
        return (
          <View
            key={`otp-${index}`}
            style={[
              styles.box,
              {
                width: layout.otpBoxSize,
                height: layout.otpBoxSize,
                borderRadius: Math.max(10, Math.round(layout.otpBoxSize * 0.28)),
              },
            ]}
          >
            <Text style={[styles.boxText, { fontSize: Math.max(15, Math.round(layout.otpBoxSize * 0.38)) }]}>
              {digit}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderWidth: 1,
    borderColor: '#e7dfdb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxText: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
