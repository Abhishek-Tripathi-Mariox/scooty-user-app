import { useWindowDimensions } from 'react-native';
import { DESIGN_SURFACE_WIDTH } from '../components/ScreenSurface';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const round = (value: number) => Math.round(value);

export type ResponsiveLayout = {
  screenWidth: number;
  screenHeight: number;
  isCompact: boolean;
  isWide: boolean;
  screenX: number;
  authCardWidth: number;
  authContentWidth: number;
  brandLogoWidth: number;
  brandLogoHeight: number;
  brandTitleSize: number;
  brandTitleCompactSize: number;
  otpBoxSize: number;
  otpBoxGap: number;
  keypadMinHeight: number;
  tabBarHeight: number;
  tabIconWrapSize: number;
  tabIconSize: number;
  tabLabelSize: number;
  pageTitleSize: number;
  pageSubtitleSize: number;
  mapCardHeight: number;
  heroCardWidth: number;
  heroArtworkHeight: number;
  referralVisualSize: number;
  qrFrameSize: number;
  qrInnerSize: number;
};

export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  const scale = width / DESIGN_SURFACE_WIDTH;

  const screenX = clamp(round(width * 0.07), 16, 28);
  const authCardWidth = clamp(round(width - screenX * 2), 300, 390);
  const authContentWidth = clamp(round(width - screenX * 2), 300, 430);
  const brandLogoWidth = clamp(round(156 * clamp(scale, 0.9, 1.12)), 132, 176);
  const brandLogoHeight = clamp(round(92 * clamp(scale, 0.9, 1.12)), 78, 104);

  return {
    screenWidth: width,
    screenHeight: height,
    isCompact: width < 360,
    isWide: width >= 430,
    screenX,
    authCardWidth,
    authContentWidth,
    brandLogoWidth,
    brandLogoHeight,
    brandTitleSize: clamp(round(30 * clamp(scale, 0.9, 1.08)), 26, 34),
    brandTitleCompactSize: clamp(round(26 * clamp(scale, 0.9, 1.08)), 22, 30),
    otpBoxSize: clamp(round(width * 0.12), 40, 52),
    otpBoxGap: clamp(round(width * 0.03), 8, 12),
    keypadMinHeight: clamp(round(height * 0.26), 208, 280),
    tabBarHeight: clamp(round(height * 0.084), 60, 76),
    tabIconWrapSize: clamp(round(width * 0.075), 26, 32),
    tabIconSize: clamp(round(width * 0.05), 18, 22),
    tabLabelSize: clamp(round(width * 0.028), 10, 12),
    pageTitleSize: clamp(round(width * 0.055), 20, 24),
    pageSubtitleSize: clamp(round(width * 0.033), 12, 14),
    mapCardHeight: clamp(round(width * 0.63), 220, 300),
    heroCardWidth: clamp(round(width * 0.56), 200, 250),
    heroArtworkHeight: clamp(round(width * 0.35), 110, 150),
    referralVisualSize: clamp(round(width * 0.23), 76, 108),
    qrFrameSize: clamp(round(width * 0.72), 240, 320),
    qrInnerSize: clamp(round(width * 0.5), 170, 220),
  };
}
