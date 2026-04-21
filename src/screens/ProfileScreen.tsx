import React from 'react';
import {
  Alert,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { COLORS } from '../constants/theme';
import type { Dashboard, User } from '../services/userApi';

const DefaultAvatar = require('../assets/images/profile.png');
const EditIcon = require('../assets/images/edit1.png');
const LanguageIcon = require('../assets/images/language.png');
const BookingIcon = require('../assets/images/booking.png');
const RideHistoryIcon = require('../assets/images/ridehistory.png');
const OfferIcon = require('../assets/images/offer.png');
const HelpIcon = require('../assets/images/help.png');

type ProfileMenuItem = {
  key: 'language' | 'bookings' | 'history' | 'offers' | 'support';
  title: string;
  subtitle: string;
  iconBg: string;
  iconSource: ImageSourcePropType;
};

export function ProfileScreen({
  onBack,
  onTabPress,
  onLogout,
  onEditProfile,
  onMenuPress,
  user,
  dashboard,
  activeTab,
}: {
  onBack: () => void;
  onTabPress: (tab: TabKey) => void;
  onLogout?: () => void;
  onEditProfile?: () => void;
  onMenuPress?: (key: ProfileMenuItem['key']) => void;
  user?: User | null;
  dashboard?: Dashboard | null;
  activeTab: TabKey;
}) {
  const name = user?.name?.trim() || '-';
  const phone = user?.mobile ? formatPhone(user.mobile) : '+91 98765 43210';
  const email = user?.email?.trim() || '-';
  const initials = getInitials(name);
  const avatarSource = getAvatarSource(user?.profilePhotoUrl);

  const menuItems: ProfileMenuItem[] = [
    {
      key: 'language',
      title: 'Language',
      subtitle: user?.settings?.language?.trim() || 'English',
      iconBg: 'rgba(31, 102, 255, 0.10)',
      iconSource: LanguageIcon,
    },
    {
      key: 'bookings',
      title: 'My Bookings',
      subtitle: 'View your active and completed trips',
      iconBg: 'rgba(95, 106, 125, 0.10)',
      iconSource: BookingIcon,
    },
    {
      key: 'history',
      title: 'Ride History',
      subtitle: dashboard ? `${dashboard.ridesCompleted || 0} rides completed` : 'Past rides and receipts',
      iconBg: 'rgba(95, 106, 125, 0.10)',
      iconSource: RideHistoryIcon,
    },
    {
      key: 'offers',
      title: 'Offers & Rewards',
      subtitle: 'Save on your next ride',
      iconBg: 'rgba(95, 106, 125, 0.10)',
      iconSource: OfferIcon,
    },
    {
      key: 'support',
      title: 'Help & Support',
      subtitle: 'FAQs, tickets and contact options',
      iconBg: 'rgba(95, 106, 125, 0.10)',
      iconSource: HelpIcon,
    },
  ];

  return (
    <View style={styles.root}>
      <PageFrame title="Profile" onBack={onBack} scroll>
        <View style={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatarWrap}>
                <Image source={avatarSource} style={styles.avatarImage} />
                {!avatarSource ? (
                  <View style={styles.initialsFallback}>
                    <Text style={styles.initialsText}>{initials}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.phone}>{phone}</Text>
                <Text style={styles.email}>{email}</Text>
              </View>

              <Pressable
                onPress={onEditProfile || (() => Alert.alert('Edit profile', 'Profile editing is not wired yet.'))}
                style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Edit profile"
              >
                <Image source={EditIcon} style={styles.editImage} resizeMode="contain" />
              </Pressable>
            </View>
          </View>

          <View style={styles.menuCard}>
            {menuItems.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => {
                  if (onMenuPress) {
                    onMenuPress(item.key);
                    return;
                  }

                  if (item.key === 'language') {
                    Alert.alert('Language', 'Language settings are not connected yet.');
                    return;
                  }

                  Alert.alert(item.title, 'This section is not connected yet.');
                }}
                style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: item.iconBg }]}>
                  <Image source={item.iconSource} style={styles.menuIconImage} resizeMode="contain" />
                </View>

                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>

                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={onLogout || (() => Alert.alert('Logout', 'Logout handler is not connected yet.'))}
            style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutPressed]}
            accessibilityRole="button"
            accessibilityLabel="Logout"
          >
            <Text style={styles.logoutIcon}>⎋</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>

          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </PageFrame>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </View>
  );
}

function getAvatarSource(profilePhotoUrl?: string): ImageSourcePropType {
  if (!profilePhotoUrl) {
    return DefaultAvatar;
  }

  return { uri: profilePhotoUrl };
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase();
}

function formatPhone(value: string) {
  const digits = value.replace(/[^\d+]/g, '').trim();
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+91 ${digits}`;
  return value;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 18,
  },
  profileCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#d8b9a8',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initialsFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  initialsText: {
    color: COLORS.textPrimary,
    fontWeight: '900',
    fontSize: 18,
  },
  profileInfo: {
    flex: 1,
    paddingHorizontal: 14,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },
  phone: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  email: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  editButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.84)',
  },
  editImage: {
    width: 18,
    height: 18,
  },
  menuCard: {
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconImage: {
    width: 18,
    height: 18,
  },
  menuTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  menuTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  menuSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  chevron: {
    color: '#9aa1b1',
    fontSize: 28,
    marginTop: -2,
  },
  logoutButton: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#ff5252',
    borderRadius: 22,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  logoutPressed: {
    opacity: 0.82,
  },
  logoutIcon: {
    color: '#ff5252',
    fontSize: 16,
    marginRight: 8,
    fontWeight: '900',
  },
  logoutText: {
    color: '#ff5252',
    fontSize: 15,
    fontWeight: '800',
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 10,
  },
  pressed: {
    opacity: 0.82,
  },
});
