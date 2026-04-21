import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { useResponsiveLayout } from '../utils/responsive';

const HomeIcon = require('../assets/images/home.png');
const BookingIcon = require('../assets/images/booking.png');
const NotificationIcon = require('../assets/images/notification.png');
const ProfileIcon = require('../assets/images/profile.png');

export type TabKey = 'home' | 'booking' | 'notification' | 'profile';

export function BottomTabs({
  active,
  onTabPress,
}: {
  active: TabKey;
  onTabPress: (tab: TabKey) => void;
}) {
  const layout = useResponsiveLayout();
  return (
    <View style={[styles.bar, { height: layout.tabBarHeight }]}>
      {tabs.map((tab) => (
        <Pressable key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)}>
          <View
            style={[
              styles.iconWrap,
              { width: layout.tabIconWrapSize, height: layout.tabIconWrapSize, borderRadius: layout.tabIconWrapSize / 2 },
              active === tab.key && styles.iconWrapActive,
            ]}
          >
            <Image source={tab.icon} style={[styles.iconImage, { width: layout.tabIconSize, height: layout.tabIconSize }]} resizeMode="contain" />
          </View>
          <Text style={[styles.label, { fontSize: layout.tabLabelSize }, active === tab.key && styles.active]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const tabs: Array<{ key: TabKey; label: string; icon: number }> = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'booking', label: 'Booking', icon: BookingIcon },
  { key: 'notification', label: 'Notification', icon: NotificationIcon },
  { key: 'profile', label: 'Profile', icon: ProfileIcon },
];

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ece3de',
    backgroundColor: '#fff',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(245, 133, 87, 0.12)',
  },
  iconImage: {
  },
  label: {
    marginTop: 3,
    color: '#7b8191',
    fontWeight: '700',
  },
  active: {
    color: COLORS.button,
  },
});
