import { Image, StyleSheet, Text, View } from 'react-native';
import { useResponsiveLayout } from '../utils/responsive';

const ScootyLogo = require('../assets/images/scootylogo.png');

export function BrandHeader({
  compact = false,
}: {
  compact?: boolean;
}) {
  const layout = useResponsiveLayout();
  const baseWidth = compact ? layout.brandLogoWidth * 0.85 : layout.brandLogoWidth;
  const baseHeight = compact ? layout.brandLogoHeight * 0.85 : layout.brandLogoHeight;
  return (
    <View style={[styles.wrap, compact && styles.compactWrap]}>
      <Image
        source={ScootyLogo}
        style={{ width: baseWidth, height: baseHeight }}
        resizeMode="contain"
      />
      <Text
        style={[
          styles.brand,
          compact ? styles.compactBrand : null,
          { fontSize: compact ? layout.brandTitleCompactSize * 0.82 : layout.brandTitleSize * 0.82 },
        ]}
      >
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
  compactWrap: {
    marginBottom: 10,
  },
  brand: {
    marginTop: 8,
    color: '#151515',
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  compactBrand: {
    marginTop: 4,
  },
});
