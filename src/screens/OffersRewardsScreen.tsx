import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { ArrowLeftIcon } from '../components/RideIcons';

type Tab = 'offers' | 'referrals';

type Offer = {
  id: string;
  title: string;
  desc: string;
  code: string;
  valid: string;
};

const OFFERS: Offer[] = [
  { id: 'o1', title: 'First Ride Offer', desc: '50% off up to ₹100', code: 'FIRST50', valid: 'Valid till 31 Jan 2026' },
  { id: 'o2', title: 'Go Green', desc: '20% off on all rides', code: 'GREEN20', valid: 'Valid till 15 Feb 2026' },
  { id: 'o3', title: 'Weekend Special', desc: '₹15 off on weekends', code: 'WEEKEND15', valid: 'Valid till 28 Feb 2026' },
];

export function OffersRewardsScreen({
  onBack,
  onTabPress,
  activeTab,
}: {
  onBack: () => void;
  onTabPress: (tab: TabKey) => void;
  activeTab: TabKey;
}) {
  const [tab, setTab] = useState<Tab>('offers');

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Offer & Rewards</Text>
      </View>

      <View style={styles.tabBar}>
        {(['offers', 'referrals'] as const).map((k) => {
          const active = tab === k;
          return (
            <Pressable key={k} style={styles.tabItem} onPress={() => setTab(k)}>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {k === 'offers' ? 'Offers' : 'Referrals'}
              </Text>
              {active ? <View style={styles.tabIndicator} /> : null}
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {tab === 'offers' ? <OffersTab /> : <ReferralsTab />}
      </ScrollView>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </SafeAreaView>
  );
}

function OffersTab() {
  return (
    <View style={{ gap: 12 }}>
      {OFFERS.map((o) => (
        <View key={o.id} style={styles.card}>
          <View style={styles.offerTop}>
            <View style={styles.tagIconWrap}>
              <TagIcon color="#16a34a" />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.offerTitle}>{o.title}</Text>
              <Text style={styles.offerDesc}>{o.desc}</Text>
              <View style={styles.codeRow}>
                <View style={styles.codePill}>
                  <Text style={styles.codeText}>{o.code}</Text>
                </View>
                <Pressable style={styles.copyButton}>
                  <CopyIcon color="#363636" />
                </Pressable>
              </View>
              <Text style={styles.offerValid}>{o.valid}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function ReferralsTab() {
  const [code] = useState('JOHN2026');
  return (
    <View style={{ gap: 16 }}>
      <View style={styles.earningsCard}>
        <View style={styles.earningsIconRow}>
          <GiftIcon color="#101828" />
          <Text style={styles.earningsLabel}>Your Referral Earnings</Text>
        </View>
        <Text style={styles.earningsAmount}>₹250</Text>
        <Text style={styles.earningsMeta}>5 friends invited</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.shareTitle}>Share Your Code</Text>
        <Text style={styles.shareSubtitle}>Invite friends and earn ₹50 per successful referral</Text>
        <View style={styles.codeInputRow}>
          <TextInput value={code} editable={false} style={styles.codeInput} />
          <Pressable style={styles.codeCopyButton}>
            <CopyIcon color="#363636" />
          </Pressable>
        </View>
        <Pressable style={styles.whatsappButton}>
          <Text style={styles.whatsappText}>Share via WhatsApp</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.howTitle}>How it Works?</Text>
        <Text style={styles.howItem}>Share your referral code with friends</Text>
        <Text style={styles.howItem}>They sign up and complete their first ride</Text>
        <Text style={styles.howItem}>You both get ₹50 in wallet!</Text>
      </View>
    </View>
  );
}

function TagIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={color}>
      <Path d="M20 12 12 20l-8-8V4h8l8 8ZM7 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </Svg>
  );
}

function CopyIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x={7} y={7} width={13} height={13} rx={2} stroke={color} strokeWidth={1.8} />
      <Path d="M17 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function GiftIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={8} width={18} height={4} stroke={color} strokeWidth={1.8} />
      <Path d="M12 8v13M3 12v9h18v-9M8.5 8a2.5 2.5 0 1 1 3.5-3.5A2.5 2.5 0 1 1 15.5 8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.26)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.6)',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  tabLabelActive: {
    color: '#fc4c02',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#fc4c02',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  offerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tagIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  offerDesc: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  codeText: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  copyButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerValid: {
    color: '#6a7282',
    fontSize: 12,
    lineHeight: 16,
  },
  earningsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    gap: 8,
  },
  earningsIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  earningsLabel: {
    color: '#101828',
    fontSize: 16,
    lineHeight: 24,
  },
  earningsAmount: {
    color: '#101828',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
  },
  earningsMeta: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  shareTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  shareSubtitle: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  codeInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderRadius: 24,
    paddingHorizontal: 16,
    color: '#101828',
    fontSize: 16,
  },
  codeCopyButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappButton: {
    backgroundColor: '#00a63e',
    borderRadius: 12,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
  },
  howTitle: {
    color: '#1c1c1e',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  howItem: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
});
