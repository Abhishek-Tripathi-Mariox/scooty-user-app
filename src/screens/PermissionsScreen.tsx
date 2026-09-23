import { useState } from 'react';
import { Image, SafeAreaView, ScrollView, Switch, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import { fetchCoordsIfAllowed, type Coords } from '../utils/location';
import { useStyles } from '../utils/responsiveStyles';

const LocationIcon = require('../assets/images/location.png');
const PushNotificationIcon = require('../assets/images/pushnotification.png');

type PermissionKey = 'location' | 'camera' | 'notifications';

type PermissionItem = {
  key: PermissionKey;
  title: string;
  subtitle: string;
  icon: number;
  required?: boolean;
};

const permissions: PermissionItem[] = [
  {
    key: 'location',
    title: 'Location Access',
    subtitle: 'Required to find nearby scooters and stations',
    icon: LocationIcon,
    required: true,
  },
  {
    key: 'notifications',
    title: 'Push Notifications',
    subtitle: 'Get updates about your rides and offers',
    icon: PushNotificationIcon,
  },
];

export function PermissionsScreen({
  onContinue,
  initialPermissions,
}: {
  onContinue: (permissions: Record<PermissionKey, boolean>, coords: Coords | null) => void;
  initialPermissions?: Partial<Record<PermissionKey, boolean>>;
}) {
  const styles = useStyles(RAW_STYLES);
  const [enabled, setEnabled] = useState<Record<PermissionKey, boolean>>({
    location: initialPermissions?.location ?? true,
    // Camera is not offered in the UI any more (rides start via the station
    // admin's OTP); the key stays for backend compatibility.
    camera: initialPermissions?.camera ?? false,
    notifications: initialPermissions?.notifications ?? true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (submitting) return;
    setSubmitting(true);
    const coords = enabled.location ? await fetchCoordsIfAllowed() : null;
    setSubmitting(false);
    onContinue(enabled, coords);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.headerBlock}>
            <View style={styles.checkCircle}>
              <View style={styles.checkInner}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="#ffffff"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </View>
            <Text style={styles.title}>Enable Permissions</Text>
            <Text style={styles.subtitle}>
              We need a few permissions to provide you the best experience
            </Text>
          </View>

          <View style={styles.cardList}>
            {permissions.map((item) => (
              <View key={item.key} style={styles.card}>
                <View style={styles.iconWrap}>
                  <Image source={item.icon} style={styles.iconImage} resizeMode="contain" />
                </View>

                <View style={styles.textWrap}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {item.required ? <Text style={styles.required}>*Required</Text> : null}
                  </View>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>

                <Switch
                  value={enabled[item.key]}
                  onValueChange={(value) =>
                    setEnabled((current) => ({ ...current, [item.key]: value }))
                  }
                  trackColor={{ false: '#d1d5db', true: '#86c599' }}
                  thumbColor={enabled[item.key] ? '#16a34a' : '#ffffff'}
                  ios_backgroundColor="#d1d5db"
                />
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <GradientButton
              label={submitting ? 'Getting location…' : 'Continue to Home'}
              onPress={handleContinue}
              height={52}
              disabled={submitting}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const RAW_STYLES = {
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.53)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 16,
    color: '#101828',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  subtitle: {
    marginTop: 8,
    maxWidth: 328,
    color: '#4a5565',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  cardList: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconImage: {
    width: 28,
    height: 28,
  },
  textWrap: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardTitle: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  required: {
    marginLeft: 8,
    color: '#fb2c36',
    fontSize: 12,
    lineHeight: 16,
  },
  cardSubtitle: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    paddingHorizontal: 0,
    borderRadius: 24,
    padding: 24,
  },
} as const;
