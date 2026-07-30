import {
  Image,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { ArrowLeftIcon } from '../components/RideIcons';
import type { Dashboard, User } from '../services/userApi';
import { useStyles } from '../utils/responsiveStyles';

const DefaultAvatar = require('../assets/images/profile.png');
const BookingIcon = require('../assets/images/booking.png');
const RideHistoryIcon = require('../assets/images/ridehistory.png');
const OfferIcon = require('../assets/images/offer.png');
const HelpIcon = require('../assets/images/help.png');

type ProfileMenuKey = 'language' | 'bookings' | 'history' | 'offers' | 'support';

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
};

type ProfileMenuItem = {
  key: ProfileMenuKey;
  title: string;
  subtitle?: string;
  icon: ImageSourcePropType;
  iconSize?: number;
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
  const styles = useStyles(RAW_STYLES);
  const displayName = user?.name || 'Profile not set';
  const displayPhone = user?.mobile ? `+91 ${user.mobile}` : 'Mobile number unavailable';
  const displayEmail = user?.email || 'Email not added';
  const avatarSource = user?.profilePhotoUrl ? { uri: user.profilePhotoUrl } : DefaultAvatar;

  const menu: ProfileMenuItem[] = [
    { key: 'bookings', title: 'My Bookings', icon: BookingIcon },
    { key: 'history', title: 'Ride History', icon: RideHistoryIcon, iconSize: 40 },
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
        <Pressable style={styles.languageCard} onPress={() => onMenuPress?.('language')}>
          <View style={styles.menuIconWrap}>
            <GlobeIcon color="#2563eb" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Language</Text>
            <Text style={styles.menuSubtitle}>
              {LANGUAGE_LABELS[user?.settings?.language || 'en'] || 'English'}
            </Text>
          </View>
          <ChevronRightIcon color="#9ca3af" />
        </Pressable>

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
  const styles = useStyles(RAW_STYLES);
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuIconWrap}>
        <Image
          source={item.icon}
          style={[styles.menuIcon, item.iconSize ? { width: item.iconSize, height: item.iconSize } : null]}
          resizeMode="contain"
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        {item.subtitle ? <Text style={styles.menuSubtitle}>{item.subtitle}</Text> : null}
      </View>
      <ChevronRightIcon color="#9ca3af" />
    </Pressable>
  );
}

function GlobeIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M12 2c2.5 2.6 3.9 6.1 3.9 10S14.5 19.4 12 22c-2.5-2.6-3.9-6.1-3.9-10S9.5 4.6 12 2ZM2.6 8.8h18.8M2.6 15.2h18.8"
        stroke={color}
        strokeWidth={1.8}
      />
    </Svg>
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

const RAW_STYLES = {
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    color: '#1C1C1E',
    fontFamily: 'Poppins',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 32,
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
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#363636',
  },
  profileText: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: '#1c1c1e',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 27,
  },
  meta: {
    color: '#4b5563',
    fontSize: 15,
    lineHeight: 21,
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
    paddingTop: 12,
    paddingBottom: 20,
    gap: 10,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 6,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  menuTitle: {
    color: '#101828',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  menuSubtitle: {
    color: '#6a7282',
    fontSize: 14,
    lineHeight: 19,
  },
  menuDivider: {
    marginLeft: 78,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.3,
    borderColor: '#ef4444',
    marginTop: 2,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  version: {
    textAlign: 'center',
    color: '#6a7282',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
} as const;
