import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useResponsiveLayout } from '../utils/responsive';

const ScootyLogo = require('../assets/images/scooty.png');

export function BrandHeader({
  compact = false,
}: {
  compact?: boolean;
}) {
  const layout = useResponsiveLayout();
  return (
    <View style={[styles.wrap, compact && styles.compactWrap]}>
      <Image
        source={ScootyLogo}
        style={[
          styles.logo,
          {
            width: compact ? layout.brandLogoWidth * 0.85 : layout.brandLogoWidth,
            height: compact ? layout.brandLogoHeight * 0.85 : layout.brandLogoHeight,
          },
        ]}
        resizeMode="contain"
      />
      <Text
        style={[
          styles.brand,
          compact ? styles.compactBrand : null,
          { fontSize: compact ? layout.brandTitleCompactSize : layout.brandTitleSize },
        ]}
      >
        MOVYRA
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
  logo: {
    width: 156,
    height: 92,
  },
  brand: {
    marginTop: 2,
    color: '#151515',
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  compactBrand: {
    marginTop: 1,
  },
});
