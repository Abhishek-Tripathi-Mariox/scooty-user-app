import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useResponsiveLayout } from '../utils/responsive';

const HomeIcon = require('../assets/images/home.png');
const BookingIcon = require('../assets/images/booking.png');
const NotificationIcon = require('../assets/images/notification.png');
const ProfileIcon = require('../assets/images/profile.png');

export type TabKey = 'home' | 'booking' | 'notification' | 'profile';

const ACTIVE_COLOR = '#ff7a44';
const INACTIVE_COLOR = 'rgba(54,54,54,0.8)';

export function BottomTabs({
  active,
  onTabPress,
}: {
  active: TabKey;
  onTabPress: (tab: TabKey) => void;
}) {
  const layout = useResponsiveLayout();
  return (
    <View style={[styles.bar, { height: Math.max(layout.tabBarHeight, 70) }]}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)}>
            <View style={[styles.indicator, !isActive && styles.indicatorHidden]} />
            <Image
              source={tab.icon}
              style={[
                styles.iconImage,
                { width: layout.tabIconSize, height: layout.tabIconSize },
                { tintColor: isActive ? ACTIVE_COLOR : INACTIVE_COLOR },
              ]}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.label,
                { fontSize: layout.tabLabelSize },
                { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
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
    alignItems: 'flex-end',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    paddingTop: 6,
    paddingBottom: 4,
  },
  indicator: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: ACTIVE_COLOR,
    marginBottom: 6,
  },
  indicatorHidden: {
    backgroundColor: 'transparent',
  },
  iconImage: {
    marginBottom: 4,
  },
  label: {
    fontWeight: '500',
  },
});
