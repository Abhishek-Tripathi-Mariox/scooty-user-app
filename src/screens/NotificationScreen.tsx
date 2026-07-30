import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { ArrowLeftIcon, CheckIcon } from '../components/RideIcons';
import type { NotificationItem } from '../services/userApi';

type NotifRow = {
  id: string;
  title: string;
  message: string;
  time: string;
  kind: 'reminder' | 'message' | 'confirm' | 'offer';
  unread: boolean;
};

type NotifGroup = {
  label: string;
  items: NotifRow[];
};

export function NotificationScreen({
  onBack,
  onTabPress,
  notifications,
  loading = false,
  activeTab,
}: {
  onBack: () => void;
  onTabPress: (tab: TabKey) => void;
  notifications?: NotificationItem[] | null;
  loading?: boolean;
  activeTab: TabKey;
}) {
  const groups: NotifGroup[] = buildGroups(notifications || []);

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Notification</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <Text style={styles.emptyText}>Loading notifications...</Text>
        ) : groups.length === 0 ? (
          <Text style={styles.emptyText}>No notifications yet.</Text>
        ) : (
          groups.map((group) => (
            <View key={group.label}>
              <Text style={styles.sectionTitle}>{group.label}</Text>
              <View style={styles.list}>
                {group.items.map((n) => (
                  <View key={n.id} style={styles.row}>
                    <View style={[styles.iconWrap, iconBg(n.kind)]}>
                      <NotifIcon kind={n.kind} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.titleRow}>
                        {n.unread ? <View style={styles.unreadDot} /> : null}
                        <Text style={styles.title}>{n.title}</Text>
                        <Text style={styles.time}>{n.time}</Text>
                      </View>
                      <Text style={styles.message}>{n.message}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </SafeAreaView>
  );
}

function NotifIcon({ kind }: { kind: NotifRow['kind'] }) {
  if (kind === 'reminder') return <BellIcon color="#1e40af" />;
  if (kind === 'message') return <MessageIcon color="#9ca3af" />;
  if (kind === 'confirm') return <CheckIcon size={24} color="#16a34a" />;
  return <PartyIcon />;
}

function BellIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6V11a6 6 0 0 0-5-5.9V4a1 1 0 1 0-2 0v1.1A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2Z" />
    </Svg>
  );
}

function MessageIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Circle cx={11} cy={11} r={10} fill={color} />
      <Path
        d="M6 9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H9l-3 2v-8Z"
        fill="#ffffff"
      />
    </Svg>
  );
}

function PartyIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
      <Path d="m3 22 7-13 8 4-15 9Z" fill="#f97316" />
      <Path d="M14 4c-1 2 0 4 2 4" stroke="#fb923c" strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={21} cy={7} r={1.2} fill="#fde047" />
      <Circle cx={18} cy={3} r={1} fill="#34d399" />
      <Circle cx={23} cy={13} r={1} fill="#ef4444" />
    </Svg>
  );
}

function iconBg(kind: NotifRow['kind']) {
  if (kind === 'reminder') return { backgroundColor: '#dbeafe' };
  if (kind === 'message') return { backgroundColor: 'transparent' };
  if (kind === 'confirm') return { backgroundColor: '#e1f4e5' };
  return { backgroundColor: '#ffe2e2' };
}

function mapKind(type?: string, title?: string): NotifRow['kind'] {
  const t = `${type || ''} ${title || ''}`.toLowerCase();
  // Backend types: RIDE (bookings/rides), SYSTEM, ALERT, PROMO...
  if (t.includes('cancel') || t.includes('alert')) return 'reminder';
  if (t.includes('ride') || t.includes('booking') || t.includes('confirm') || t.includes('complete'))
    return 'confirm';
  if (t.includes('promo') || t.includes('offer') || t.includes('reward') || t.includes('referral'))
    return 'offer';
  if (t.includes('message') || t.includes('support') || t.includes('chat')) return 'message';
  return 'reminder';
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}hr`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function buildGroups(notifications: NotificationItem[]): NotifGroup[] {
  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
  );

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const groups: NotifGroup[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Earlier', items: [] },
  ];

  sorted.forEach((n) => {
    const created = n.createdAt ? new Date(n.createdAt).getTime() : 0;
    const row: NotifRow = {
      id: n._id,
      title: n.title,
      message: n.message,
      time: n.createdAt ? timeAgo(n.createdAt) : '—',
      kind: mapKind(n.type, n.title),
      unread: n.isRead === false,
    };
    if (created >= startOfToday.getTime()) groups[0].items.push(row);
    else if (created >= startOfYesterday.getTime()) groups[1].items.push(row);
    else groups[2].items.push(row);
  });

  return groups.filter((g) => g.items.length > 0);
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    color: '#1b1d21',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 16,
    marginTop: 8,
  },
  list: {
    gap: 20,
    marginBottom: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fc4c02',
    marginRight: 2,
  },
  emptyText: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(143, 146, 161, 0.1)',
    paddingBottom: 20,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    color: '#171717',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  time: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 16,
  },
  message: {
    marginTop: 2,
    color: '#8f92a1',
    fontSize: 14,
    lineHeight: 20,
  },
});
