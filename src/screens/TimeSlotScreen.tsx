import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';
import { useResponsiveLayout } from '../utils/responsive';
import type { TimeSlotItem } from '../services/userApi';
import type { RidePlan } from './RidePlanScreen';

type DateOption = {
  id: string;
  label: string;
  subLabel: string;
};

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
const durations = ['1h', '2h', '3h', '4h', '6h', '8h', '12h', '24h'];

export function TimeSlotScreen({
  onBack,
  onContinue,
  plan,
  slots,
}: {
  onBack: () => void;
  onContinue: (selection: { date: string; time: string; duration: string; plan: RidePlan }) => void;
  plan?: RidePlan | null;
  slots?: TimeSlotItem[] | null;
}) {
  const layout = useResponsiveLayout();
  const selectedPlan = plan || defaultPlan;
  const dates = React.useMemo(() => buildDateOptions(), []);
  const [selectedDate, setSelectedDate] = React.useState(dates[1]?.id || 'tomorrow');
  const [selectedTime, setSelectedTime] = React.useState('10:00');
  const [selectedDuration, setSelectedDuration] = React.useState('2h');
  const availableTimeSlots = React.useMemo(
    () => (slots && slots.length > 0 ? slots : timeSlots.map((slot) => ({ label: slot, value: slot, disabled: false }))),
    [slots],
  );

  React.useEffect(() => {
    const firstAvailable = availableTimeSlots.find((slot) => !slot.disabled)?.value || availableTimeSlots[0]?.value;
    if (firstAvailable && !availableTimeSlots.some((slot) => slot.value === selectedTime && !slot.disabled)) {
      setSelectedTime(firstAvailable);
    }
  }, [availableTimeSlots, selectedTime]);

  const selectedDateLabel = formatDateLabel(selectedDate);

  return (
    <View style={styles.root}>
      <PageFrame title="Select Time Slot" subtitle="Step 2 of 4" onBack={onBack} scroll>
        <View style={[styles.content, { paddingBottom: Math.max(18, Math.round(layout.screenHeight * 0.02)) }]}>
          <View style={styles.heroCard}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View style={styles.heroTopRow}>
              <View style={styles.stepPill}>
                <Text style={styles.stepPillText}>Time booking</Text>
              </View>
              <Text style={styles.heroStepText}>Choose a start time and duration</Text>
            </View>

            <Text style={styles.heroTitle}>{selectedPlan.title}</Text>
            <Text style={styles.heroSubtitle}>
              Lock in the exact pickup window. We’ll keep the rest of the booking ready for the next step.
            </Text>

            <View style={styles.heroStatsRow}>
              <InfoPill label="Plan" value={`${selectedPlan.price}${selectedPlan.rateLabel}`} />
              <InfoPill label="Duration" value={selectedPlan.duration} />
              <InfoPill label="Status" value="Live slots" />
            </View>
          </View>

          <SectionTitle icon="📅" title="Select Date" subtitle="Pick the day you want the ride to start" />
          <View style={styles.chipRow}>
            {dates.map((item) => (
              <Chip
                key={item.id}
                label={item.label}
                subLabel={item.subLabel}
                active={selectedDate === item.id}
                onPress={() => setSelectedDate(item.id)}
              />
            ))}
          </View>

          <SectionTitle icon="⏰" title="Start Time" subtitle="Choose the first available slot that fits" />
          <View style={styles.grid}>
            {availableTimeSlots.map((slot) => (
              <Chip
                key={slot.value}
                label={slot.label}
                active={selectedTime === slot.value}
                onPress={() => {
                  if (slot.disabled) return;
                  setSelectedTime(slot.value);
                }}
                compact
                disabled={slot.disabled}
              />
            ))}
          </View>

          <SectionTitle icon="🕒" title="Duration" subtitle="How long do you need the scooty?" />
          <View style={styles.grid}>
            {durations.map((slot) => (
              <Chip
                key={slot}
                label={slot}
                active={selectedDuration === slot}
                onPress={() => setSelectedDuration(slot)}
                compact
              />
            ))}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <SummaryRow label="Start" value={`${selectedDateLabel}, ${selectedTime}`} />
            <SummaryRow label="Duration" value={selectedDuration} />
            <SummaryRow label="Estimated Cost" value={estimateCost(selectedPlan.price, selectedDuration)} accent />
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.footerNoteTitle}>Need a different time?</Text>
            <Text style={styles.footerNoteText}>
              Available slots are shown live. If the exact time is unavailable, pick the closest option and we’ll
              carry it through the booking flow.
            </Text>
          </View>

          <PrimaryButton
            label="Continue"
            onPress={() =>
              onContinue({
                date: selectedDate,
                time: selectedTime,
                duration: selectedDuration,
                plan: selectedPlan,
              })
            }
            style={styles.continueButton}
          />
        </View>
      </PageFrame>
    </View>
  );
}

function buildDateOptions(): DateOption[] {
  const options: DateOption[] = [];
  const today = new Date();

  for (let offset = 0; offset < 4; offset += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);

    const id = offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : formatIsoDate(date);
    const label =
      offset === 0
        ? 'Today'
        : offset === 1
          ? 'Tomorrow'
          : date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

    options.push({
      id,
      label,
      subLabel: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : 'Available',
    });
  }

  return options;
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value: string) {
  if (value === 'today') return 'Today';
  if (value === 'tomorrow') return 'Tomorrow';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <View style={styles.sectionTitleWrap}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function Chip({
  label,
  subLabel,
  active,
  onPress,
  compact,
  disabled,
}: {
  label: string;
  subLabel?: string;
  active?: boolean;
  onPress: () => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        compact && styles.compactChip,
        active && styles.chipActive,
        disabled && styles.chipDisabled,
        pressed && !disabled ? styles.chipPressed : null,
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive, disabled && styles.chipTextDisabled]}>{label}</Text>
      {subLabel ? <Text style={[styles.chipSubText, active && styles.chipSubTextActive]}>{subLabel}</Text> : null}
    </Pressable>
  );
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, accent && styles.summaryAccent]}>{value}</Text>
    </View>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroStatPill}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

const defaultPlan: RidePlan = {
  id: 'hourly',
  title: 'Hourly',
  duration: '1 Hour',
  price: 49,
  rateLabel: '/hr',
  bullets: [] as string[],
  validity: '',
  extraCharges: '',
};

function estimateCost(basePrice: number, duration: string) {
  const hours = Number(duration.replace(/[^\d]/g, '')) || 1;
  return `₹${basePrice * hours}`;
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
    backgroundColor: 'rgba(255, 100, 28, 0.1)',
  },
  heroGlowTwo: {
    position: 'absolute',
    left: -30,
    bottom: -34,
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: 'rgba(255, 182, 112, 0.16)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 100, 28, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 7,
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
  sectionTitleWrap: {
    gap: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    fontSize: 14,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactChip: {
    minWidth: 0,
    width: '23%',
  },
  chipPressed: {
    opacity: 0.92,
  },
  chipActive: {
    backgroundColor: COLORS.button,
    borderColor: COLORS.button,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  chipTextActive: {
    color: '#fff',
  },
  chipTextDisabled: {
    color: COLORS.textMuted,
  },
  chipSubText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
  },
  chipSubTextActive: {
    color: 'rgba(255,255,255,0.86)',
  },
  summaryCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.86)',
    padding: 14,
    gap: 2,
  },
  summaryTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  summaryValue: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  summaryAccent: {
    color: COLORS.button,
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
