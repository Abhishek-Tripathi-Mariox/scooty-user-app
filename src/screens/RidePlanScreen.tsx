import { ReactNode } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  InfoIcon,
} from '../components/RideIcons';

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
  const availablePlans = plans ?? [];
  const activePlanId = selectedPlan || availablePlans[0]?.id || null;
  const activePlan = activePlanId
    ? availablePlans.find((plan) => plan.id === activePlanId) || availablePlans[0] || null
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Choose Your Ride Plan</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Select a plan that suits your riding needs</Text>

        {availablePlans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No live plans available</Text>
            <Text style={styles.emptyBody}>The backend did not return ride plans for this station yet.</Text>
          </View>
        ) : (
          <View style={styles.planList}>
            {availablePlans.map((plan) => {
            const active = activePlanId === plan.id;
            const bullets = plan.bullets.length > 0 ? plan.bullets.slice(0, 3) : [];
            const showBadge = plan.id === 'full-day';
            return (
              <Pressable
                key={plan.id}
                onPress={() => onSelectPlan?.(plan.id)}
                style={[styles.card, active && styles.cardActive]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.iconBox}>
                      {plan.id === 'hourly' ? (
                        <ClockIcon size={32} color="#fc4c02" />
                      ) : (
                        <CalendarIcon size={32} color="#fc4c02" />
                      )}
                    </View>
                    <View>
                      <Text style={styles.planTitle}>{plan.title}</Text>
                      <Text style={styles.planDuration}>{plan.duration}</Text>
                    </View>
                  </View>
                  <View style={styles.priceWrap}>
                    <Text style={styles.price}>{`₹${plan.price}`}</Text>
                    <Text style={styles.rateLabel}>{plan.rateLabel}</Text>
                  </View>
                </View>

                <View style={styles.bulletList}>
                  {bullets.map((bullet) => (
                    <View key={bullet} style={styles.bulletRow}>
                      <CheckIcon size={18} color="#16a34a" />
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>

                <InfoBox title="Validity" value={plan.validity || 'Valid for the selected booking window'} />
                <InfoBox title="Extra Charges" value={plan.extraCharges || 'No additional charges shown'} />

                {showBadge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>MOST POPULAR</Text>
                  </View>
                ) : null}
              </Pressable>
            );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label="Continue to Time Slot"
          onPress={() => {
            if (!activePlan) return;
            onContinue(activePlan);
          }}
          height={56}
        />
      </View>
    </SafeAreaView>
  );
}

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.infoBox}>
      <View style={styles.infoIconWrap}>
        <InfoIcon size={18} color="#6a7282" />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoText}>{value}</Text>
      </View>
    </View>
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
    lineHeight: 32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  subtitle: {
    color: '#363636',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  planList: {
    gap: 16,
  },
  emptyState: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    padding: 18,
    gap: 6,
  },
  emptyTitle: {
    color: '#1c1c1e',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  emptyBody: {
    color: '#4a5565',
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    paddingVertical: 17,
    paddingHorizontal: 24,
    gap: 16,
  },
  cardActive: {
    borderColor: '#ff7740',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitle: {
    color: '#161c2d',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  planDuration: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
  priceWrap: {
    alignItems: 'flex-end',
  },
  price: {
    color: '#161c2d',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  rateLabel: {
    color: '#bbbbbb',
    fontSize: 14,
    lineHeight: 20,
  },
  bulletList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletText: {
    color: '#363636',
    fontSize: 14,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  infoIconWrap: {
    paddingTop: 2,
  },
  infoTextWrap: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    color: '#363636',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  infoText: {
    color: '#363636',
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.7,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#161c2d',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
  },
});
