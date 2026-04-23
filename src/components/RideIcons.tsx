import Svg, { Circle, Path, Rect } from 'react-native-svg';

export function ClockIcon({ size = 32, color = '#fc4c02' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Path d="M12 7v5l3.5 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CalendarIcon({ size = 32, color = '#fc4c02' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={5} width={18} height={16} rx={2.5} stroke={color} strokeWidth={1.8} />
      <Path d="M3 10h18M8 3v4M16 3v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function InfoIcon({ size = 18, color = '#6a7282' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Path d="M12 11v5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={12} cy={8} r={1} fill={color} />
    </Svg>
  );
}

export function CheckIcon({ size = 18, color = '#16a34a' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} fill={color} />
      <Path d="m8 12 3 3 5-6" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function FilterIcon({ size = 18, color = '#fc4c02' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ArrowLeftIcon({ size = 24, color = '#0f172a' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 6l-6 6 6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SmallScooterIcon({ size = 16, color = '#16a34a' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={5.5} cy={17.5} r={2.5} stroke={color} strokeWidth={1.6} />
      <Circle cx={18.5} cy={17.5} r={2.5} stroke={color} strokeWidth={1.6} />
      <Path
        d="M5.5 15 9 7h3l4 8h2.5M9 7h5M16 17.5c-.6-2 .5-4 2.5-4"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BatteryIcon({ size = 16, color = '#16a34a' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={8} width={16} height={9} rx={2} stroke={color} strokeWidth={1.6} />
      <Rect x={19} y={11} width={2} height={3} rx={0.5} fill={color} />
      <Rect x={5} y={10} width={10} height={5} rx={1} fill={color} />
    </Svg>
  );
}

export function WalkerIcon({ size = 16, color = '#4a5565' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={13} cy={4.5} r={2} fill={color} />
      <Path
        d="M9 21l2.5-5 2-2-2-3-3 1-1 3M13.5 12l3 1 1 5M11 16l-2 5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function AddressPinIcon({ size = 14, color = '#4a5565' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M7 1a4.5 4.5 0 0 1 4.5 4.5C11.5 9 7 13 7 13S2.5 9 2.5 5.5A4.5 4.5 0 0 1 7 1Z"
        stroke={color}
        strokeWidth={1.3}
      />
      <Circle cx={7} cy={5.5} r={1.5} stroke={color} strokeWidth={1.3} />
    </Svg>
  );
}

export function ReceiptIcon({ size = 24, color = '#16a34a' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M4 3h16v18l-3-2-3 2-3-2-3 2-4-2V3Zm3 5h10v2H7V8Zm0 4h10v2H7v-2Zm0 4h6v2H7v-2Z" />
    </Svg>
  );
}

export function LocationIcon({ size = 24, color = '#1c1c1e' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function ShieldIcon({ size = 24, color = '#16a34a' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="m9 12 2 2 4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function WalletCardIcon({ size = 24, color = '#363636' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={6} width={18} height={13} rx={2.5} stroke={color} strokeWidth={1.8} />
      <Path d="M3 10h18" stroke={color} strokeWidth={1.8} />
      <Circle cx={17} cy={14.5} r={1.2} fill={color} />
    </Svg>
  );
}

export function ScooterSideIcon({ size = 24, color = '#363636' }: { size?: number; color?: string }) {
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

export function ExternalLinkIcon({ size = 14, color = '#155dfc' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M8 2h4v4M6 8l6-6M11 9v3H2V3h3"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SmallInfoIcon({ size = 16, color = '#155dfc' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle cx={8} cy={8} r={6} stroke={color} strokeWidth={1.4} />
      <Path d="M8 7v4" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Circle cx={8} cy={5} r={0.8} fill={color} />
    </Svg>
  );
}
