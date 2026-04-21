import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { useResponsiveLayout } from '../utils/responsive';

const keypadLetters: Record<string, string> = {
  2: 'abc',
  3: 'def',
  4: 'ghi',
  5: 'jkl',
  6: 'mno',
  7: 'pqrs',
  8: 'tuv',
  9: 'wxyz',
};

export function OtpKeypad({
  onKeyPress,
  onBackspace,
}: {
  onKeyPress: (value: string) => void;
  onBackspace: () => void;
}) {
  const layout = useResponsiveLayout();
  const keyHeight = Math.max(41, Math.round(layout.screenHeight * 0.05));
  return (
    <View style={[styles.keypad, { minHeight: layout.keypadMinHeight }]}>
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
        <Pressable key={key} style={[styles.key, { minHeight: keyHeight }]} onPress={() => onKeyPress(key)}>
          <Text style={[styles.keyNumber, { fontSize: Math.max(18, Math.round(layout.screenWidth * 0.048)) }]}>
            {key}
          </Text>
          <Text style={[styles.keyLetters, { fontSize: Math.max(8, Math.round(layout.screenWidth * 0.023)) }]}>
            {key === '1' ? '' : keypadLetters[key]}
          </Text>
        </Pressable>
      ))}

      <View style={styles.spacer} />
      <Pressable style={[styles.key, { minHeight: keyHeight }]} onPress={() => onKeyPress('0')}>
        <Text style={[styles.keyNumber, { fontSize: Math.max(18, Math.round(layout.screenWidth * 0.048)) }]}>0</Text>
      </Pressable>
      <Pressable style={[styles.backspace, { minHeight: keyHeight }]} onPress={onBackspace}>
        <Text style={[styles.backspaceText, { fontSize: Math.max(13, Math.round(layout.screenWidth * 0.035)) }]}>⌫</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  keypad: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  key: {
    width: '31%',
    borderRadius: 4,
    backgroundColor: COLORS.keyBg,
    borderWidth: 1,
    borderColor: '#cfd5df',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  keyNumber: {
    color: '#22292f',
    fontWeight: '400',
    lineHeight: 20,
  },
  keyLetters: {
    color: '#5f6770',
    letterSpacing: 0.8,
    marginTop: -2,
    textTransform: 'lowercase',
  },
  spacer: {
    width: '31%',
  },
  backspace: {
    width: '31%',
    borderRadius: 4,
    backgroundColor: '#eef1f6',
    borderWidth: 1,
    borderColor: '#cfd5df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backspaceText: {
    color: '#606a75',
    fontWeight: '700',
    lineHeight: 18,
  },
});
