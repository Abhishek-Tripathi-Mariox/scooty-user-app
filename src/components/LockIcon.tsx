import Svg, { Path, Rect } from 'react-native-svg';

export function LockIcon({ width = 18, height = 18 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Rect
        x={3.33}
        y={9.17}
        width={13.33}
        height={9.17}
        rx={1.67}
        stroke="#717182"
        strokeWidth={1.66}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.67 9.17V5.83a3.33 3.33 0 1 1 6.67 0v3.34"
        stroke="#717182"
        strokeWidth={1.66}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
