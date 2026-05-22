import { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { ArrowLeftIcon } from '../components/RideIcons';
import { useStyles } from '../utils/responsiveStyles';
import { formatCurrency } from '../utils/format';

type Tab = 'offers' | 'referrals';

export type ReferralSummary = {
  referralCode: string;
  referralEarnings: number;
  totalReferrals: number;
  inviteReward: number;
  appliedReferral?: string | null;
  invitees?: { name?: string; mobile?: string; createdAt?: string }[];
};

export type OfferItem = {
  id: string;
  title: string;
  description?: string;
  code?: string;
  validTill?: string;
};

export function OffersRewardsScreen({
  onBack,
  onTabPress,
  activeTab,
  referral,
  offers = [],
  loading = false,
  onApplyReferral,
}: {
  onBack: () => void;
  onTabPress: (tab: TabKey) => void;
  activeTab: TabKey;
  referral?: ReferralSummary | null;
  offers?: OfferItem[];
  loading?: boolean;
  onApplyReferral?: (code: string) => Promise<void> | void;
}) {
  const styles = useStyles(RAW_STYLES);
  const [tab, setTab] = useState<Tab>('offers');

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={10}>
          <ArrowLeftIcon size={22} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Offers & Rewards</Text>
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
        {tab === 'offers' ? (
          <OffersTab offers={offers} loading={loading} />
        ) : (
          <ReferralsTab referral={referral} onApply={onApplyReferral} />
        )}
      </ScrollView>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </SafeAreaView>
  );
}

function OffersTab({ offers, loading }: { offers: OfferItem[]; loading: boolean }) {
  const styles = useStyles(RAW_STYLES);

  if (loading) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Loading offers…</Text>
        <Text style={styles.emptyText}>Fetching the latest promotions for you.</Text>
      </View>
    );
  }

  if (offers.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No offers right now</Text>
        <Text style={styles.emptyText}>
          You'll see active promo codes and seasonal deals here as soon as they go live.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {offers.map((o) => (
        <View key={o.id} style={styles.card}>
          <View style={styles.offerTop}>
            <View style={styles.tagIconWrap}>
              <TagIcon color="#16a34a" />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.offerTitle}>{o.title}</Text>
              {o.description ? <Text style={styles.offerDesc}>{o.description}</Text> : null}
              {o.code ? (
                <View style={styles.codeRow}>
                  <View style={styles.codePill}>
                    <Text style={styles.codeText}>{o.code}</Text>
                  </View>
                </View>
              ) : null}
              {o.validTill ? <Text style={styles.offerValid}>{o.validTill}</Text> : null}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function ReferralsTab({
  referral,
  onApply,
}: {
  referral?: ReferralSummary | null;
  onApply?: (code: string) => Promise<void> | void;
}) {
  const styles = useStyles(RAW_STYLES);
  const [applyCode, setApplyCode] = useState('');
  const [applying, setApplying] = useState(false);

  const code = referral?.referralCode || '';
  const earnings = referral?.referralEarnings ?? 0;
  const totalReferrals = referral?.totalReferrals ?? 0;
  const inviteReward = referral?.inviteReward ?? 50;
  const alreadyApplied = Boolean(referral?.appliedReferral);

  const handleShare = async () => {
    if (!code) return;
    try {
      await Share.share({
        message: `Join Slydo Mobility with my referral code: ${code} and we both earn ${formatCurrency(
          inviteReward,
        )}!`,
      });
    } catch {
      // share cancelled
    }
  };

  const handleWhatsapp = async () => {
    if (!code) return;
    const text = `Join Slydo Mobility with my referral code: ${code}`;
    const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      handleShare();
    }
  };

  const handleApply = async () => {
    const value = applyCode.trim().toUpperCase();
    if (!value || !onApply) return;
    try {
      setApplying(true);
      await onApply(value);
      setApplyCode('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not apply code';
      Alert.alert('Referral code', message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.earningsCard}>
        <View style={styles.earningsIconRow}>
          <GiftIcon color="#101828" />
          <Text style={styles.earningsLabel}>Your Referral Earnings</Text>
        </View>
        <Text style={styles.earningsAmount}>{formatCurrency(earnings)}</Text>
        <Text style={styles.earningsMeta}>
          {totalReferrals} friend{totalReferrals === 1 ? '' : 's'} invited
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.shareTitle}>Share Your Code</Text>
        <Text style={styles.shareSubtitle}>
          Invite friends and earn {formatCurrency(inviteReward)} per successful referral
        </Text>
        <View style={styles.codeInputRow}>
          <TextInput
            value={code}
            editable={false}
            placeholder="Your code will appear here"
            placeholderTextColor="#9ca3af"
            style={styles.codeInput}
          />
          <Pressable
            style={styles.codeCopyButton}
            onPress={handleShare}
            disabled={!code}
            hitSlop={6}
          >
            <CopyIcon color="#363636" />
          </Pressable>
        </View>
        <Pressable
          style={[styles.whatsappButton, !code && styles.whatsappButtonDisabled]}
          onPress={handleWhatsapp}
          disabled={!code}
        >
          <Text style={styles.whatsappText}>Share via WhatsApp</Text>
        </Pressable>
      </View>

      {!alreadyApplied && onApply ? (
        <View style={styles.card}>
          <Text style={styles.shareTitle}>Have a referral code?</Text>
          <Text style={styles.shareSubtitle}>
            Apply a friend's code to get your sign-up bonus.
          </Text>
          <View style={styles.codeInputRow}>
            <TextInput
              value={applyCode}
              onChangeText={(v) => setApplyCode(v.toUpperCase())}
              placeholder="Enter referral code"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
              style={styles.codeInput}
            />
          </View>
          <Pressable
            style={[styles.applyButton, (!applyCode || applying) && styles.applyButtonDisabled]}
            onPress={handleApply}
            disabled={!applyCode || applying}
          >
            <Text style={styles.applyButtonText}>{applying ? 'Applying…' : 'Apply Code'}</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.howTitle}>How it Works?</Text>
        <Text style={styles.howItem}>Share your referral code with friends</Text>
        <Text style={styles.howItem}>They sign up and complete their first ride</Text>
        <Text style={styles.howItem}>
          You both get {formatCurrency(inviteReward)} in wallet!
        </Text>
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
      <Path
        d="M17 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"
        stroke={color}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

function GiftIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={8} width={18} height={4} stroke={color} strokeWidth={1.8} />
      <Path
        d="M12 8v13M3 12v9h18v-9M8.5 8a2.5 2.5 0 1 1 3.5-3.5A2.5 2.5 0 1 1 15.5 8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const RAW_STYLES = {
  safe: { flex: 1, backgroundColor: 'transparent' },
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
    marginLeft: 4,
    color: '#1c1c1e',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
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
  tabLabelActive: { color: '#fc4c02' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#fc4c02',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 6,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyText: {
    color: '#4a5565',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
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
  offerTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
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
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  offerDesc: { color: '#4a5565', fontSize: 14, lineHeight: 20 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  offerValid: { color: '#6a7282', fontSize: 12, lineHeight: 16 },
  earningsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    gap: 8,
  },
  earningsIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  earningsLabel: { color: '#101828', fontSize: 15, lineHeight: 22 },
  earningsAmount: {
    color: '#101828',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  earningsMeta: { color: '#4a5565', fontSize: 14, lineHeight: 20 },
  shareTitle: {
    color: '#101828',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  shareSubtitle: { color: '#4a5565', fontSize: 13, lineHeight: 18 },
  codeInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.16)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 14,
    paddingHorizontal: 14,
    color: '#101828',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1,
  },
  codeCopyButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappButton: {
    backgroundColor: '#00a63e',
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappButtonDisabled: { opacity: 0.5 },
  whatsappText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  applyButton: {
    backgroundColor: '#fc4c02',
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonDisabled: { opacity: 0.5 },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  howTitle: {
    color: '#1c1c1e',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  howItem: { color: '#4a5565', fontSize: 14, lineHeight: 20 },
} as const;
