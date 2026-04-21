import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';
import { useResponsiveLayout } from '../utils/responsive';

const ScootyArtwork = require('../assets/images/scooty.png');
const BookingArtwork = require('../assets/images/booking.png');

export type RidePlanId = 'hourly' | 'full-day' | 'weekly' | 'monthly';

export type RidePlan = {
  id: RidePlanId;
  code?: string;
  title: string;
  duration: string;
  price: number;
  rateLabel: string;
  bullets: string[];
  validity: string;
  extraCharges: string;
};

export function RidePlanScreen({
  onBack,
  onContinue,
  selectedPlan,
  onSelectPlan,
  plans,
}: {
  onBack: () => void;
  onContinue: (plan: RidePlan) => void;
  selectedPlan?: RidePlanId | null;
  onSelectPlan?: (plan: RidePlanId) => void;
  plans?: RidePlan[];
}) {
  const layout = useResponsiveLayout();
  const availablePlans = plans && plans.length > 0 ? plans : defaultPlans;
  const activePlanId = selectedPlan || availablePlans[0]?.id || null;
  const activePlan = activePlanId ? availablePlans.find((plan) => plan.id === activePlanId) || availablePlans[0] || null : null;

  return (
    <View style={styles.root}>
      <PageFrame title="Choose Your Ride Plan" subtitle="Step 1 of 4" onBack={onBack} scroll>
        <View style={[styles.content, { paddingBottom: Math.max(18, Math.round(layout.screenHeight * 0.02)) }]}>
          <View style={styles.heroCard}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View style={styles.heroTopRow}>
              <View style={styles.stepPill}>
                <Image source={BookingArtwork} style={styles.stepIcon} resizeMode="contain" />
                <Text style={styles.stepPillText}>Booking flow</Text>
              </View>
              <Text style={styles.heroStepText}>{`${availablePlans.length} plan options`}</Text>
            </View>

            <View style={styles.heroMainRow}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>Pick the plan that fits your ride.</Text>
                <Text style={styles.heroSubtitle}>
                  Compare duration, value, and perks before moving to your preferred time slot.
                </Text>
              </View>

              <View style={styles.heroVisual}>
                <View style={styles.heroVisualOrb} />
                <Image source={ScootyArtwork} style={styles.heroScooty} resizeMode="contain" />
              </View>
            </View>

            <View style={styles.heroStatsRow}>
              <InfoPill label="Checkout" value="Secure" />
              <InfoPill label="Support" value="24/7" />
              <InfoPill label="Pickup" value="Flexible" />
            </View>
          </View>

          {activePlan ? (
            <View style={styles.selectionSummary}>
              <View style={styles.selectionCopy}>
                <Text style={styles.selectionLabel}>Selected plan</Text>
                <Text style={styles.selectionTitle}>{activePlan.title}</Text>
                <Text style={styles.selectionSubtitle}>{buildPlanSummary(activePlan)}</Text>
              </View>
              <View style={styles.selectionPriceWrap}>
                <Text style={styles.selectionPrice}>{`₹${activePlan.price}`}</Text>
                <Text style={styles.selectionRate}>{activePlan.rateLabel}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.planList}>
            {availablePlans.map((item) => {
              const active = activePlanId === item.id;
              const planHighlights = item.bullets.length > 0 ? item.bullets.slice(0, 3) : buildFallbackHighlights(item);

              return (
                <Pressable
                  key={item.id}
                  onPress={() => onSelectPlan?.(item.id)}
                  style={({ pressed }) => [styles.planCard, active && styles.planCardActive, pressed && styles.planCardPressed]}
                >
                  <View style={styles.planHeader}>
                    <View style={styles.planHeaderLeft}>
                      <View style={[styles.planIcon, active && styles.planIconActive]}>
                        <Text style={styles.planIconText}>{planIconLabel(item.id)}</Text>
                      </View>
                      <View style={styles.planHeadingWrap}>
                        <View style={styles.planHeadingRow}>
                          <Text style={styles.planTitle}>{item.title}</Text>
                          {active ? (
                            <View style={styles.selectedBadge}>
                              <Text style={styles.selectedBadgeText}>Selected</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.planDuration}>{item.duration}</Text>
                        {item.code ? <Text style={styles.planCode}>{item.code}</Text> : null}
                      </View>
                    </View>

                    <View style={styles.priceWrap}>
                      <Text style={styles.price}>{`₹${item.price}`}</Text>
                      <Text style={styles.rate}>{item.rateLabel}</Text>
                    </View>
                  </View>

                  <View style={styles.highlightWrap}>
                    {planHighlights.map((bullet) => (
                      <View key={bullet} style={styles.highlightChip}>
                        <Text style={styles.highlightText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.infoGrid}>
                    <InfoCard title="Validity" value={item.validity || 'Applies for the selected booking window'} />
                    <InfoCard title="Extra Charges" value={item.extraCharges || 'No additional charges shown'} />
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.footerNoteTitle}>Everything included</Text>
            <Text style={styles.footerNoteText}>
              Plans are grouped to keep the booking flow short. We’ll carry your selection to the next step automatically.
            </Text>
          </View>

          <PrimaryButton
            label="Continue to Time Slot"
            onPress={() => {
              if (!activePlan) return;
              onContinue(activePlan);
            }}
            style={styles.continueButton}
          />
        </View>
      </PageFrame>
    </View>
  );
}

function planIconLabel(id: RidePlanId) {
  if (id === 'hourly') return 'H';
  if (id === 'full-day') return 'D';
  if (id === 'weekly') return 'W';
  return 'M';
}

function buildFallbackHighlights(plan: RidePlan) {
  const defaults: Record<RidePlanId, string[]> = {
    hourly: ['Best for short hops', 'Quick city errands', 'Easy top-up'],
    'full-day': ['Great for day trips', 'Single-day freedom', 'Low planning overhead'],
    weekly: ['Best weekly value', 'Ideal for repeated commutes', 'Predictable spend'],
    monthly: ['Long-term savings', 'Committed mobility', 'Best for regular riders'],
  };

  return defaults[plan.id];
}

function buildPlanSummary(plan: RidePlan) {
  return `${plan.duration} • ₹${plan.price}${plan.rateLabel}`;
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroStatPill}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 18,
    gap: 12,
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    padding: 16,
    overflow: 'hidden',
  },
  heroGlowOne: {
    position: 'absolute',
    right: -36,
    top: -30,
    width: 134,
    height: 134,
    borderRadius: 67,
    backgroundColor: 'rgba(255, 100, 28, 0.12)',
  },
  heroGlowTwo: {
    position: 'absolute',
    left: -30,
    bottom: -34,
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: 'rgba(255, 182, 112, 0.18)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 100, 28, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  stepIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  stepPillText: {
    color: COLORS.button,
    fontSize: 11,
    fontWeight: '800',
  },
  heroStepText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 8,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  heroVisual: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroVisualOrb: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(255, 100, 28, 0.08)',
  },
  heroScooty: {
    width: 72,
    height: 72,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  heroStatPill: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  heroStatValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  heroStatLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.84)',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  selectionCopy: {
    flex: 1,
    paddingRight: 10,
  },
  selectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  selectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  selectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  selectionPriceWrap: {
    alignItems: 'flex-end',
  },
  selectionPrice: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  selectionRate: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  planList: {
    gap: 10,
  },
  planCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.84)',
    padding: 14,
  },
  planCardActive: {
    borderColor: COLORS.button,
    backgroundColor: 'rgba(255, 100, 28, 0.08)',
  },
  planCardPressed: {
    transform: [{ scale: 0.99 }],
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  planHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 4,
  },
  planIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  planIconActive: {
    backgroundColor: 'rgba(255, 100, 28, 0.12)',
  },
  planIconText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  planHeadingWrap: {
    flex: 1,
  },
  planHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  planTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
  planDuration: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  planCode: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 3,
    fontWeight: '700',
  },
  selectedBadge: {
    borderRadius: 999,
    backgroundColor: 'rgba(255, 100, 28, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedBadgeText: {
    color: COLORS.button,
    fontSize: 10,
    fontWeight: '800',
  },
  priceWrap: {
    alignItems: 'flex-end',
  },
  price: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  rate: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  highlightWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  highlightChip: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.86)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  highlightText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  infoCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.86)',
    padding: 12,
  },
  infoTitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  infoText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  footerNote: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.84)',
    padding: 14,
    gap: 6,
  },
  footerNoteTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  footerNoteText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  continueButton: {
    marginTop: 4,
  },
});

const defaultPlans: RidePlan[] = [
  {
    id: 'hourly',
    code: 'HOURLY',
    title: 'Hourly',
    duration: '1 Hour',
    price: 49,
    rateLabel: '/hr',
    bullets: ['Best for short hops', 'Quick city errands', 'Easy top-up'],
    validity: 'Ideal for quick trips and local visits.',
    extraCharges: 'No hidden extra charges shown',
  },
  {
    id: 'full-day',
    code: 'DAY_PASS',
    title: 'Full Day',
    duration: '24 Hours',
    price: 249,
    rateLabel: '/day',
    bullets: ['Great for day trips', 'Single-day freedom', 'Low planning overhead'],
    validity: 'Valid for a full 24-hour booking window.',
    extraCharges: 'Security deposit may apply',
  },
  {
    id: 'weekly',
    code: 'WEEKLY',
    title: 'Weekly',
    duration: '7 Days',
    price: 999,
    rateLabel: '/7 days',
    bullets: ['Best weekly value', 'Ideal for commuting', 'Predictable spend'],
    validity: 'Works best for repeat riders and commuters.',
    extraCharges: 'Security deposit may apply',
  },
  {
    id: 'monthly',
    code: 'MONTHLY',
    title: 'Monthly',
    duration: '30 Days',
    price: 2999,
    rateLabel: '/30 days',
    bullets: ['Long-term savings', 'Committed mobility', 'Best for regular riders'],
    validity: 'Best for riders who need a scooter every day.',
    extraCharges: 'Security deposit may apply',
  },
];
