import {
  Image,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { ArrowLeftIcon } from '../components/RideIcons';
import type { Dashboard, User } from '../services/userApi';

const DefaultAvatar = require('../assets/images/profile.png');
const LanguageIcon = require('../assets/images/language.png');
const BookingIcon = require('../assets/images/booking.png');
const RideHistoryIcon = require('../assets/images/ridehistory.png');
const OfferIcon = require('../assets/images/offer.png');
const HelpIcon = require('../assets/images/help.png');

type ProfileMenuKey = 'language' | 'bookings' | 'history' | 'offers' | 'support';

type ProfileMenuItem = {
  key: ProfileMenuKey;
  title: string;
  subtitle?: string;
  icon: ImageSourcePropType;
};

export function ProfileScreen({
  onBack,
  onTabPress,
  onLogout,
  onEditProfile,
  onMenuPress,
  user,
  activeTab,
}: {
  onBack: () => void;
  onTabPress: (tab: TabKey) => void;
  onLogout?: () => void;
  onEditProfile?: () => void;
  onMenuPress?: (key: ProfileMenuKey) => void;
  user?: User | null;
  dashboard?: Dashboard | null;
  activeTab: TabKey;
}) {
  const displayName = user?.name || 'Profile not set';
  const displayPhone = user?.mobile ? `+91 ${user.mobile}` : 'Mobile number unavailable';
  const displayEmail = user?.email || 'Email not added';
  const avatarSource = user?.profilePhotoUrl ? { uri: user.profilePhotoUrl } : DefaultAvatar;

  const firstItem: ProfileMenuItem = {
    key: 'language',
    title: 'Language',
    subtitle: user?.settings?.language === 'hi' ? 'Hindi' : 'English',
    icon: LanguageIcon,
  };

  const menu: ProfileMenuItem[] = [
    { key: 'bookings', title: 'My Bookings', icon: BookingIcon },
    { key: 'history', title: 'Ride History', icon: RideHistoryIcon },
    { key: 'offers', title: 'Offers & Rewards', icon: OfferIcon },
    { key: 'support', title: 'Help & Support', icon: HelpIcon },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
        <View style={styles.profileText}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.meta}>{displayPhone}</Text>
          <Text style={styles.meta}>{displayEmail}</Text>
        </View>
        <Pressable onPress={onEditProfile} style={styles.editButton}>
          <PencilIcon color="#363636" />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuCard}>
          <MenuRow item={firstItem} onPress={() => onMenuPress?.(firstItem.key)} />
        </View>

        <View style={styles.menuCard}>
          {menu.map((m, i) => (
            <View key={m.key}>
              <MenuRow item={m} onPress={() => onMenuPress?.(m.key)} />
              {i < menu.length - 1 ? <View style={styles.menuDivider} /> : null}
            </View>
          ))}
        </View>

        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <LogoutIcon color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </SafeAreaView>
  );
}

function MenuRow({ item, onPress }: { item: ProfileMenuItem; onPress: () => void }) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuIconWrap}>
        <Image source={item.icon} style={styles.menuIcon} resizeMode="contain" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        {item.subtitle ? <Text style={styles.menuSubtitle}>{item.subtitle}</Text> : null}
      </View>
      <ChevronRightIcon color="#9ca3af" />
    </Pressable>
  );
}

function PencilIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M14 2.5 17.5 6 7 16.5l-4 1 1-4L14 2.5Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="m8 5 5 5-5 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LogoutIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M8 3H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3M13 6l4 4-4 4M7 10h10"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.26)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.6)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    marginLeft: 8,
    color: '#1c1c1e',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  profileCard: {
    marginHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#363636',
  },
  profileText: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: '#363636',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  meta: {
    color: '#363636',
    fontSize: 14,
    lineHeight: 20,
  },
  editButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  menuCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 22,
    height: 22,
  },
  menuTitle: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  menuSubtitle: {
    color: '#6a7282',
    fontSize: 14,
    lineHeight: 20,
  },
  menuDivider: {
    marginLeft: 72,
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 51,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginTop: 4,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
  },
  version: {
    textAlign: 'center',
    color: '#6a7282',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 8,
  },
});
