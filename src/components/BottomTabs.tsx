import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Polygon,
  Stop,
} from 'react-native-svg';
import { useResponsiveLayout } from '../utils/responsive';

const HomeIcon = require('../assets/images/home.png');
const NotificationIcon = require('../assets/images/notification.png');
const ProfileIcon = require('../assets/images/profile.png');

export type TabKey = 'home' | 'booking' | 'notification' | 'profile';

const ACTIVE_COLOR = '#fc4c02';
const INACTIVE_COLOR = 'rgba(54,54,54,0.8)';

function BookingTabIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11.4544 2.27344C13.9477 2.27344 14.5514 2.34609 15.465 2.45531C15.7079 2.48437 15.9807 2.51766 16.3121 2.55187L16.3496 2.55562C16.5933 2.58157 16.8335 2.63407 17.0658 2.71219L17.1127 2.72812L17.1483 2.74125H17.1539L17.16 2.74359C17.6813 2.93409 18.1471 3.25126 18.5153 3.66654C18.8835 4.08181 19.1427 4.58215 19.2694 5.1225L19.3135 5.54437C19.4264 6.63375 19.5164 8.27672 19.5629 10.1873C19.5696 10.476 19.6892 10.7506 19.896 10.9521C20.1028 11.1537 20.3803 11.2662 20.6691 11.2655C20.8238 11.2649 20.9769 11.2337 21.1195 11.1737C21.2621 11.1138 21.3915 11.0262 21.5002 10.9161C21.6089 10.806 21.6947 10.6755 21.7528 10.5321C21.8109 10.3886 21.8401 10.2352 21.8386 10.0805C21.8166 7.17422 21.5789 5.31281 21.5789 5.31281C21.471 4.27033 21.0726 3.27907 20.4292 2.4518C19.7857 1.62453 18.923 0.994462 17.9391 0.633281C17.8871 0.614062 17.835 0.595313 17.7825 0.577031C17.3936 0.446302 16.9915 0.358745 16.5835 0.315937L16.5446 0.311719C14.9869 0.151875 14.7371 0.0234375 11.4544 0.0234375C8.17316 0.0234375 7.64207 0.151875 6.08535 0.313594L6.04645 0.317813C5.6181 0.362805 5.19639 0.457182 4.78973 0.599063V0.5775C3.77558 0.922271 2.88158 1.55066 2.21376 2.38814C1.54594 3.22562 1.1323 4.23705 1.02191 5.3025C0.826914 7.1775 0.727539 8.98547 0.727539 11.8856C0.727539 14.7858 0.826914 16.5942 1.02191 18.4692C1.15514 19.7487 1.7243 20.9435 2.63394 21.8531C3.54357 22.7628 4.73835 23.3319 6.01785 23.4652L6.05676 23.4689C7.41285 23.6095 7.77707 23.7258 10.02 23.753C10.1678 23.7548 10.3145 23.7274 10.4517 23.6725C10.5889 23.6176 10.714 23.5362 10.8197 23.4329C10.9254 23.3297 11.0098 23.2066 11.068 23.0707C11.1261 22.9349 11.1569 22.7889 11.1586 22.6411C11.1619 22.3446 11.048 22.0589 10.8418 21.8459C10.6355 21.633 10.3535 21.5101 10.0571 21.5039C8.59691 21.4739 7.71332 21.3956 7.13488 21.3263C6.89254 21.2972 6.61926 21.2644 6.28832 21.2302L6.25082 21.2259C5.48471 21.1464 4.76929 20.8057 4.22465 20.261C3.68001 19.7164 3.33931 19.001 3.25973 18.2348C3.09051 16.6088 2.97848 14.9067 2.97848 11.8842C2.97848 8.86172 3.09145 7.16016 3.25973 5.53406C3.31879 4.96195 3.52435 4.41473 3.85657 3.94523C4.18878 3.47573 4.63643 3.0998 5.15629 2.85375L5.52754 2.72438C5.77027 2.63964 6.02191 2.58302 6.27754 2.55562L6.31785 2.55187C6.57098 2.52516 6.7927 2.50031 7.00691 2.47641C8.09395 2.35406 8.81207 2.27344 11.4539 2.27344"
        fill={color}
      />
      <Path
        d="M17.1257 24.0234C13.7362 24.0234 10.979 21.2662 10.979 17.8772C10.9807 16.2475 11.6289 14.6851 12.7813 13.5327C13.9336 12.3804 15.496 11.7322 17.1257 11.7305C20.5148 11.7305 23.2724 14.4877 23.2724 17.8772C23.2724 21.2667 20.5148 24.0234 17.1257 24.0234ZM17.1257 13.9805C16.355 13.9805 15.6016 14.209 14.9608 14.6372C14.32 15.0654 13.8206 15.6739 13.5256 16.386C13.2307 17.098 13.1535 17.8815 13.3039 18.6374C13.4542 19.3933 13.8254 20.0876 14.3703 20.6326C14.9153 21.1775 15.6096 21.5487 16.3655 21.699C17.1214 21.8494 17.9049 21.7722 18.6169 21.4773C19.329 21.1824 19.9375 20.6829 20.3657 20.0421C20.7939 19.4013 21.0224 18.6479 21.0224 17.8772C21.0213 16.8441 20.6104 15.8536 19.8799 15.123C19.1494 14.3925 18.1589 13.9816 17.1257 13.9805Z"
        fill={color}
      />
      <Path
        d="M6.17032 6.26562H16.4013C16.6935 6.27161 16.9717 6.3919 17.1763 6.60069C17.3808 6.80948 17.4954 7.09013 17.4954 7.38242C17.4954 7.67471 17.3808 7.95536 17.1763 8.16415C16.9717 8.37294 16.6935 8.49323 16.4013 8.49922H6.17032C5.87809 8.49323 5.59985 8.37294 5.39529 8.16415C5.19074 7.95536 5.07617 7.67471 5.07617 7.38242C5.07617 7.09013 5.19074 6.80948 5.39529 6.60069C5.59985 6.3919 5.87809 6.27161 6.17032 6.26562Z"
        fill={color}
      />
      <Path
        d="M6.17027 13.2761C5.87414 13.2761 5.59014 13.1585 5.38074 12.9491C5.17135 12.7397 5.05371 12.4557 5.05371 12.1595C5.05371 11.8634 5.17135 11.5794 5.38074 11.37C5.59014 11.1606 5.87414 11.043 6.17027 11.043H12.0043C12.3005 11.043 12.5845 11.1606 12.7939 11.37C13.0033 11.5794 13.1209 11.8634 13.1209 12.1595C13.1209 12.4557 13.0033 12.7397 12.7939 12.9491C12.5845 13.1585 12.3005 13.2761 12.0043 13.2761H6.17027Z"
        fill={color}
      />
      <Path
        d="M19.116 19.0312H17.0259C16.7556 19.031 16.4964 18.9235 16.3052 18.7324C16.1141 18.5412 16.0066 18.282 16.0063 18.0117V15.5039C16.0063 15.2335 16.1138 14.9742 16.305 14.783C16.4962 14.5918 16.7555 14.4844 17.0259 14.4844C17.2963 14.4844 17.5556 14.5918 17.7468 14.783C17.938 14.9742 18.0454 15.2335 18.0454 15.5039V16.9922H19.116C19.3864 16.9922 19.6458 17.0996 19.837 17.2908C20.0282 17.482 20.1356 17.7413 20.1356 18.0117C20.1356 18.2821 20.0282 18.5414 19.837 18.7326C19.6458 18.9238 19.3864 19.0312 19.116 19.0312Z"
        fill={color}
      />
    </Svg>
  );
}

const tabs: Array<{ key: TabKey; label: string; icon?: number; renderIcon?: boolean }> = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'booking', label: 'Booking', renderIcon: true },
  { key: 'notification', label: 'Notification', icon: NotificationIcon },
  { key: 'profile', label: 'Profile', icon: ProfileIcon },
];

export function BottomTabs({
  active,
  onTabPress,
}: {
  active: TabKey;
  onTabPress: (tab: TabKey) => void;
}) {
  const layout = useResponsiveLayout();
  const [barWidth, setBarWidth] = useState(0);

  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.key === active));
  const slideAnim = useRef(new Animated.Value(activeIndex)).current;
  const popAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slide the beam/indicator to the active tab.
    Animated.spring(slideAnim, {
      toValue: activeIndex,
      useNativeDriver: true,
      friction: 9,
      tension: 90,
    }).start();

    // Small pop on the newly active icon.
    popAnim.setValue(0.8);
    Animated.spring(popAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 120,
    }).start();
  }, [activeIndex, popAnim, slideAnim]);

  const tabWidth = barWidth / tabs.length;
  const translateX = Animated.multiply(slideAnim, tabWidth);

  const onBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      style={[styles.bar, { height: Math.max(layout.tabBarHeight, 70) }]}
      onLayout={onBarLayout}
    >
      {barWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.beamWrap, { width: tabWidth, transform: [{ translateX }] }]}
        >
          <Svg width="100%" height="100%" viewBox="0 0 100 64" preserveAspectRatio="none">
            <Defs>
              <SvgLinearGradient id="tabBeam" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={ACTIVE_COLOR} stopOpacity="0.26" />
                <Stop offset="0.7" stopColor={ACTIVE_COLOR} stopOpacity="0.05" />
                <Stop offset="1" stopColor={ACTIVE_COLOR} stopOpacity="0" />
              </SvgLinearGradient>
            </Defs>
            <Polygon points="20,0 80,0 94,64 6,64" fill="url(#tabBeam)" />
          </Svg>
          <View style={styles.topLine} />
        </Animated.View>
      ) : null}

      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
        const icon = tab.renderIcon ? (
          <BookingTabIcon size={layout.tabIconSize} color={color} />
        ) : (
          <Image
            source={tab.icon}
            style={[
              { width: layout.tabIconSize, height: layout.tabIconSize },
              { tintColor: color },
            ]}
            resizeMode="contain"
          />
        );
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)}>
            <Animated.View
              style={[styles.iconWrap, isActive ? { transform: [{ scale: popAnim }] } : null]}
            >
              {icon}
            </Animated.View>
            <Text style={[styles.label, { fontSize: layout.tabLabelSize }, { color }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  beamWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: '58%',
    height: 3.5,
    backgroundColor: ACTIVE_COLOR,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  iconWrap: {
    marginBottom: 4,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    paddingTop: 12,
    paddingBottom: 4,
  },
  label: {
    fontWeight: '500',
  },
});
