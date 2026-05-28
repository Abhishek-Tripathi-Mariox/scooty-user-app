import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { useResponsiveLayout } from '../utils/responsive';

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
      <View style={{ width: baseWidth, height: baseHeight, alignItems: 'center', justifyContent: 'center' }}>
        <BrandLogo size={baseHeight} />
      </View>
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

function BrandLogo({ size }: { size: number }) {
  const w = size;
  const h = size;
  return (
    <Svg width={w} height={h} viewBox="0 0 96 96" fill="none">
      <Defs>
        <SvgLinearGradient id="brandLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#fc4c02" />
          <Stop offset="100%" stopColor="#ff7a45" />
        </SvgLinearGradient>
      </Defs>
      <Circle cx={48} cy={48} r={46} fill="url(#brandLogoGrad)" />
      <Circle cx={48} cy={48} r={46} stroke="#ffffff" strokeOpacity={0.25} strokeWidth={2} />
      <Circle cx={26} cy={66} r={9} stroke="#ffffff" strokeWidth={3.6} />
      <Circle cx={70} cy={66} r={9} stroke="#ffffff" strokeWidth={3.6} />
      <Path
        d="M26 56 L40 30 H52 M48 66 H56 M40 30 L56 54 H70"
        stroke="#ffffff"
        strokeWidth={3.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={48} cy={48} r={3.4} fill="#ffffff" />
    </Svg>
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
