import { Image, StyleSheet, Text, View } from 'react-native';

const ScootyLogo = require('../assets/splash/slydo-logo-upright.png');

export function BrandHeader({
  compact = false,
}: {
  compact?: boolean;
}) {
  const size = compact ? 72 : 96;
  return (
    <View style={styles.wrap}>
      <Image
        source={ScootyLogo}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      <Text style={[styles.brand, compact && styles.compactBrand]} numberOfLines={1}>
        Slydo Mobility
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    marginTop: 12,
    color: '#151515',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  compactBrand: {
    marginTop: 8,
    fontSize: 22,
  },
});
