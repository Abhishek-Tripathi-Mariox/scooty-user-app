import Svg, { Circle, Path, Rect } from 'react-native-svg';

export function MapPinIcon({ size = 20, color = '#1c1c1e' }: { size?: number; color?: string }) {
  // Outline map marker (from the provided design asset).
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M9.99984 5C9.34057 5 8.6961 5.1955 8.14794 5.56177C7.59977 5.92804 7.17253 6.44863 6.92024 7.05772C6.66795 7.66681 6.60194 8.33703 6.73055 8.98363C6.85917 9.63024 7.17664 10.2242 7.64282 10.6904C8.10899 11.1565 8.70293 11.474 9.34954 11.6026C9.99614 11.7312 10.6664 11.6652 11.2755 11.4129C11.8845 11.1606 12.4051 10.7334 12.7714 10.1852C13.1377 9.63707 13.3332 8.9926 13.3332 8.33333C13.3332 7.44928 12.982 6.60143 12.3569 5.97631C11.7317 5.35119 10.8839 5 9.99984 5ZM9.99984 10C9.6702 10 9.34797 9.90225 9.07389 9.71912C8.79981 9.53598 8.58619 9.27568 8.46004 8.97114C8.33389 8.6666 8.30089 8.33148 8.3652 8.00818C8.42951 7.68488 8.58824 7.38791 8.82133 7.15482C9.05442 6.92173 9.35139 6.763 9.67469 6.69869C9.99799 6.63438 10.3331 6.66739 10.6376 6.79353C10.9422 6.91968 11.2025 7.1333 11.3856 7.40738C11.5688 7.68147 11.6665 8.0037 11.6665 8.33333C11.6665 8.77536 11.4909 9.19928 11.1784 9.51184C10.8658 9.82441 10.4419 10 9.99984 10Z"
        fill={color}
      />
      <Path
        d="M9.99977 19.9997C9.29806 20.0033 8.6057 19.8387 7.98066 19.5198C7.35562 19.2008 6.8161 18.7367 6.40727 18.1664C3.23144 13.7855 1.62061 10.4922 1.62061 8.37721C1.62061 6.15492 2.50341 4.02365 4.07481 2.45225C5.6462 0.88085 7.77748 -0.00195312 9.99977 -0.00195312C12.2221 -0.00195312 14.3533 0.88085 15.9247 2.45225C17.4961 4.02365 18.3789 6.15492 18.3789 8.37721C18.3789 10.4922 16.7681 13.7855 13.5923 18.1664C13.1834 18.7367 12.6439 19.2008 12.0189 19.5198C11.3938 19.8387 10.7015 20.0033 9.99977 19.9997ZM9.99977 1.81721C8.26012 1.8192 6.59229 2.51115 5.36217 3.74127C4.13204 4.9714 3.44009 6.63923 3.43811 8.37888C3.43811 10.0539 5.0156 13.1514 7.87894 17.1005C8.12202 17.4354 8.44091 17.7079 8.80953 17.8958C9.17815 18.0837 9.58602 18.1816 9.99977 18.1816C10.4135 18.1816 10.8214 18.0837 11.19 17.8958C11.5586 17.7079 11.8775 17.4354 12.1206 17.1005C14.9839 13.1514 16.5614 10.0539 16.5614 8.37888C16.5595 6.63923 15.8675 4.9714 14.6374 3.74127C13.4073 2.51115 11.7394 1.8192 9.99977 1.81721Z"
        fill={color}
      />
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
  // Kick scooter with a lightning bolt, matching the design glyph.
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={5} cy={14.5} r={2.2} stroke={color} strokeWidth={1.7} />
      <Circle cx={18.3} cy={14.5} r={2.7} stroke={color} strokeWidth={1.7} />
      <Path d="M7.2 14.5h8.2" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path
        d="M11.3 1.9h3.1c.9 0 1.6.7 1.6 1.6v2c0 2.8.9 5 2.3 6.9"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.2 17.4 8.9 19.9l2.5.5-1.5 2.6 4.3-2.5-2.5-.5 1.5-2.6Z"
        fill={color}
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
