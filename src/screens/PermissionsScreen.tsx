import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { ScreenSurface } from '../components/ScreenSurface';
import { COLORS } from '../constants/theme';
import { useResponsiveLayout } from '../utils/responsive';
const LocationIcon = require('../assets/images/location.png');
const CameraIcon = require('../assets/images/camera.png');
const PushNotificationIcon = require('../assets/images/pushnotification.png');

type PermissionItem = {
  key: 'location' | 'camera' | 'notifications';
  title: string;
  subtitle: string;
  icon: number;
  required?: boolean;
};

const permissions: PermissionItem[] = [
  {
    key: 'location',
    title: 'Location Access',
    subtitle: 'Required to find nearby scooties and stations',
    icon: LocationIcon,
    required: true,
  },
  {
    key: 'camera',
    title: 'Camera Access',
    subtitle: 'Scan QR codes to unlock scooters',
    icon: CameraIcon,
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
  onContinue: (permissions: Record<PermissionItem['key'], boolean>) => void;
  initialPermissions?: Partial<Record<PermissionItem['key'], boolean>>;
}) {
  const [enabled, setEnabled] = useState<Record<PermissionItem['key'], boolean>>({
    location: initialPermissions?.location ?? true,
    camera: initialPermissions?.camera ?? true,
    notifications: initialPermissions?.notifications ?? true,
  });
  const layout = useResponsiveLayout();

  return (
    <ScreenSurface>
      <View style={[styles.root, { paddingHorizontal: layout.screenX }]}>
        <View style={styles.centerBlock}>
          <View style={styles.topIcon}>
            <Text style={styles.topIconText}>✓</Text>
          </View>

          <Text style={styles.title}>Enable Permissions</Text>
          <Text style={styles.subtitle}>We need a few permissions to provide you the best experience</Text>

          <View style={styles.cardList}>
            {permissions.map((item) => (
              <View key={item.key} style={styles.permissionCard}>
                <View style={styles.permissionLeft}>
                  <View style={styles.iconWrap}>
                    <Image source={item.icon} style={styles.iconImage} resizeMode="contain" />
                  </View>

                  <View style={styles.textWrap}>
                    <Text style={styles.permissionTitle}>
                      {item.title} {item.required ? <Text style={styles.required}>*Required</Text> : null}
                    </Text>
                    <Text style={styles.permissionSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>

                <Switch
                  value={enabled[item.key]}
                  onValueChange={(value) =>
                    setEnabled((current) => ({
                      ...current,
                      [item.key]: value,
                    }))
                  }
                  trackColor={{ false: '#cfe7d1', true: '#42c15a' }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.button} onPress={() => onContinue(enabled)}>
            <Text style={styles.buttonText}>Continue to Home</Text>
          </Pressable>
        </View>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 8,
  },
  centerBlock: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  topIcon: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  topIconText: {
    color: '#16a34a',
    fontSize: 26,
    fontWeight: '900',
    marginTop: -1,
  },
  title: {
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 18,
  },
  cardList: {
    gap: 16,
  },
  permissionCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#e7bfb0',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconImage: {
    width: 20,
    height: 20,
  },
  textWrap: {
    flex: 1,
  },
  permissionTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  required: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '900',
  },
  permissionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
  footer: {
    paddingTop: 18,
  },
  button: {
    borderRadius: 12,
    backgroundColor: COLORS.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    shadowColor: COLORS.button,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});
