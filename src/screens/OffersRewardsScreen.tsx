import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { COLORS } from '../constants/theme';

type OfferTab = 'offers' | 'referrals';

const offerCards = [
  {
    title: 'First Ride Offer',
    subtitle: '50% off up to ₹100',
    code: 'FIRST50',
    validity: 'Valid till 31 Jan 2026',
  },
  {
    title: 'Go Green',
    subtitle: '20% off on all rides',
    code: 'GREEN20',
    validity: 'Valid till 15 Feb 2026',
  },
  {
    title: 'Weekend Special',
    subtitle: '₹15 off on weekends',
    code: 'WEEKEND15',
    validity: 'Valid till 28 Feb 2026',
  },
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
  const [tab, setTab] = useState<OfferTab>('offers');

  return (
    <View style={styles.root}>
      <PageFrame title="Offer & Rewards" onBack={onBack} scroll>
        <View style={styles.content}>
          <View style={styles.segmentRow}>
            <Segment
              label="Offers"
              active={tab === 'offers'}
              onPress={() => setTab('offers')}
            />
            <Segment
              label="Referrals"
              active={tab === 'referrals'}
              onPress={() => setTab('referrals')}
            />
          </View>

          {tab === 'offers' ? (
            <View style={styles.list}>
              {offerCards.map((item) => (
                <View key={item.code} style={styles.offerCard}>
                  <View style={styles.offerHeader}>
                    <View style={styles.offerIcon}>
                      <Text style={styles.offerIconText}>🏷</Text>
                    </View>
                    <View style={styles.offerTextWrap}>
                      <Text style={styles.offerTitle}>{item.title}</Text>
                      <Text style={styles.offerSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>

                  <View style={styles.codeRow}>
                    <View>
                      <Text style={styles.codeText}>{item.code}</Text>
                      <Text style={styles.validityText}>{item.validity}</Text>
                    </View>
                    <Pressable onPress={() => Alert.alert('Copied', `${item.code} copied`)}>
                      <Text style={styles.copyText}>⧉</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.list}>
              <View style={styles.earningsCard}>
                <Text style={styles.earningsLabel}>Your Referral Earnings</Text>
                <Text style={styles.earningsAmount}>₹250</Text>
                <Text style={styles.earningsMeta}>5 friends invited</Text>
              </View>

              <View style={styles.shareCard}>
                <Text style={styles.sectionTitle}>Share Your Code</Text>
                <Text style={styles.sectionSubtitle}>Invite friends and earn ₹50 per successful referral</Text>
                <View style={styles.codeInputRow}>
                  <Text style={styles.shareCode}>JOHN2026</Text>
                  <Text style={styles.copyText}>⧉</Text>
                </View>
                <Pressable
                  onPress={() => Alert.alert('Shared', 'Share via WhatsApp coming soon')}
                  style={styles.shareButton}
                >
                  <Text style={styles.shareButtonText}>Share via WhatsApp</Text>
                </Pressable>
              </View>

              <View style={styles.howCard}>
                <Text style={styles.sectionTitle}>How it Works?</Text>
                <Text style={styles.howText}>Share your referral code with friends</Text>
                <Text style={styles.howText}>They sign up and complete their first ride</Text>
                <Text style={styles.howText}>You both get ₹50 in wallet!</Text>
              </View>
            </View>
          )}
        </View>
      </PageFrame>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </View>
  );
}

function Segment({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.segment}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
      <View style={[styles.segmentLine, active && styles.segmentLineActive]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 18,
  },
  segmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  segmentText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: COLORS.button,
  },
  segmentLine: {
    marginTop: 10,
    width: '100%',
    height: 2,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  segmentLineActive: {
    backgroundColor: COLORS.button,
  },
  list: {
    gap: 10,
  },
  offerCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    padding: 14,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
    marginRight: 12,
  },
  offerIconText: {
    fontSize: 16,
  },
  offerTextWrap: {
    flex: 1,
  },
  offerTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
  offerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  codeRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(33, 48, 74, 0.08)',
    paddingTop: 10,
  },
  codeText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  validityText: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  copyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '900',
  },
  earningsCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    padding: 14,
  },
  earningsLabel: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  earningsAmount: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 6,
  },
  earningsMeta: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 8,
  },
  shareCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    padding: 14,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
    marginBottom: 12,
  },
  codeInputRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(33, 48, 74, 0.16)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  shareCode: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  shareButton: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  howCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    padding: 14,
  },
  howText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
});
