import React from 'react';
import { FlatList, Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { COLORS } from '../constants/theme';
import type { NotificationItem } from '../services/userApi';

type NotificationViewItem = NotificationItem & {
  timeLabel: string;
  iconBg: string;
  iconSource: ImageSourcePropType;
};

const NotificationHero = require('../assets/images/notification.png');
const RideIcon = require('../assets/images/orderedconfirmed.png');
const PushIcon = require('../assets/images/pushnotification.png');
const ReminderIcon = require('../assets/images/remindernotification.png');
const MessageIcon = require('../assets/images/remindermessage.png');
const OfferIcon = require('../assets/images/summeroffer.png');

export function NotificationScreen({
  onBack,
  onTabPress,
  notifications,
  activeTab,
}: {
  onBack: () => void;
  onTabPress: (tab: TabKey) => void;
  notifications?: NotificationItem[] | null;
  activeTab: TabKey;
}) {
  const items = (notifications || []).map((item, index) => ({
    ...item,
    timeLabel: deriveTimeLabel(item.createdAt, index),
    iconBg: colorForNotification(item.type),
    iconSource: iconForNotification(item.type),
  }));

  return (
    <View style={styles.root}>
      <PageFrame title="Notification" onBack={onBack} scroll>
        <View style={styles.content}>
          <View style={styles.heroCard}>
            <Image source={NotificationHero} style={styles.heroImage} resizeMode="contain" />
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Updates from your rides</Text>
              <Text style={styles.heroText}>
                Alerts, reminders, offers, and ride confirmations appear here.
              </Text>
            </View>
          </View>

          <Text style={styles.dayLabel}>Today</Text>
          <View style={styles.list}>
            {items.length > 0 ? (
              <FlatList
                data={items}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                renderItem={({ item }) => <NotificationCard notification={item} />}
              />
            ) : (
              <Text style={styles.emptyText}>No notifications yet</Text>
            )}
          </View>
        </View>
      </PageFrame>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </View>
  );
}

function NotificationCard({ notification }: { notification: NotificationViewItem }) {
  return (
    <Pressable style={[styles.card, !notification.isRead && styles.cardUnread]}>
      <View style={[styles.iconWrap, { backgroundColor: notification.iconBg }]}>
        <Image source={notification.iconSource} style={styles.iconImage} resizeMode="contain" />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.time}>{notification.timeLabel}</Text>
        </View>
        <Text style={styles.message}>{notification.message}</Text>
      </View>
    </Pressable>
  );
}

function deriveTimeLabel(value?: string, index?: number) {
  if (!value) return index === 0 ? '13min' : '1h';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return index === 0 ? '13min' : '1h';
  const diff = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (diff < 60) return `${diff}min`;
  return `${Math.round(diff / 60)}h`;
}

function iconForNotification(type?: string): ImageSourcePropType {
  switch (String(type || '').toLowerCase()) {
    case 'ride':
      return RideIcon;
    case 'earning':
      return PushIcon;
    case 'system':
      return ReminderIcon;
    case 'offer':
      return OfferIcon;
    default:
      return MessageIcon;
  }
}

function colorForNotification(type?: string) {
  switch (String(type || '').toLowerCase()) {
    case 'ride':
      return '#dbeafe';
    case 'earning':
      return '#dcfce7';
    case 'system':
      return '#fef3c7';
    case 'offer':
      return '#fce7f3';
    default:
      return '#dbeafe';
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 18,
  },
  heroCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.84)',
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroImage: {
    width: 72,
    height: 72,
    marginRight: 12,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  dayLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  list: {
    gap: 10,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(33, 48, 74, 0.06)',
    paddingVertical: 12,
  },
  cardUnread: {},
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconImage: {
    width: 22,
    height: 22,
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    paddingRight: 12,
  },
  time: {
    color: '#c7cad4',
    fontSize: 10,
    fontWeight: '600',
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
});
