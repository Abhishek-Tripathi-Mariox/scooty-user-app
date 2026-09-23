import { Image, Text, View } from 'react-native';
import { FONTS } from '../constants/fonts';
import { useStyles } from '../utils/responsiveStyles';

const ScootyLogo = require('../assets/splash/slydo-logo-upright.png');

export function BrandHeader({
  compact = false,
}: {
  compact?: boolean;
}) {
  const styles = useStyles(RAW_STYLES);
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

const RAW_STYLES = {
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    marginTop: 12,
    color: '#151515',
    fontFamily: FONTS.brand,
    fontSize: 26,
    fontWeight: 'normal',
    letterSpacing: 0.4,
  },
  compactBrand: {
    marginTop: 8,
    fontSize: 22,
  },
} as const;
