import Svg, { Circle, Path, Rect } from 'react-native-svg';

export function MapPinIcon({ size = 20, color = '#fc4c02' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 1.67a6.25 6.25 0 0 0-6.25 6.25c0 4.17 6.25 10.42 6.25 10.42s6.25-6.25 6.25-10.42A6.25 6.25 0 0 0 10 1.67Z"
        fill={color}
      />
      <Circle cx={10} cy={8.33} r={2.5} fill="#ffffff" />
    </Svg>
  );
}

export function WalletIcon({ size = 24, color = '#1c1c1e' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={6}
        width={18}
        height={13}
        rx={2.5}
        stroke={color}
        strokeWidth={1.6}
      />
      <Path d="M3 10h18" stroke={color} strokeWidth={1.6} />
      <Circle cx={17} cy={14} r={1.2} fill={color} />
    </Svg>
  );
}

export function ScooterIcon({ size = 22, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={5.5} cy={18} r={2.5} stroke={color} strokeWidth={1.6} />
      <Circle cx={18.5} cy={18} r={2.5} stroke={color} strokeWidth={1.6} />
      <Path
        d="M5.5 15.5 9 7h3.5M15 18h3.5M9 7l4 7h5.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ShareIcon({ size = 16, color = '#ff7a45' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle cx={3.5} cy={8} r={2} stroke={color} strokeWidth={1.5} />
      <Circle cx={12.5} cy={3.5} r={2} stroke={color} strokeWidth={1.5} />
      <Circle cx={12.5} cy={12.5} r={2} stroke={color} strokeWidth={1.5} />
      <Path d="m5.3 7.1 5.4-3.2M5.3 8.9l5.4 3.2" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
