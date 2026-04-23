import { useEffect, useMemo, useState } from 'react';
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
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from '../components/RideIcons';
import type { TimeSlotItem } from '../services/userApi';
import type { RidePlan } from './RidePlanScreen';

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
const DURATIONS = ['1h', '2h', '3h', '4h', '6h', '8h', '12h', '24h'];

type DateOption = {
  id: string;
  label: string;
};

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
  const selectedPlan = plan || DEFAULT_PLAN;
  const dates = useMemo(() => buildDateOptions(), []);
  const [selectedDate, setSelectedDate] = useState(dates[1]?.id || 'tomorrow');
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [selectedDuration, setSelectedDuration] = useState('2h');

  const availableTimeSlots = useMemo(
    () =>
      slots && slots.length > 0
        ? slots
        : TIME_SLOTS.map((slot) => ({ label: slot, value: slot, disabled: false })),
    [slots],
  );

  useEffect(() => {
    const firstAvailable =
      availableTimeSlots.find((slot) => !slot.disabled)?.value || availableTimeSlots[0]?.value;
    if (firstAvailable && !availableTimeSlots.some((slot) => slot.value === selectedTime && !slot.disabled)) {
      setSelectedTime(firstAvailable);
    }
  }, [availableTimeSlots, selectedTime]);

  const selectedDateLabel = dates.find((d) => d.id === selectedDate)?.label || 'Tomorrow';
  const estimatedHours = Number(selectedDuration.replace(/[^\d]/g, '')) || 1;
  const estimatedCost = selectedPlan.price * estimatedHours;

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>Select Time Slot</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader icon={<CalendarIcon size={18} color="#fc4c02" />} label="Select Date" />
        <View style={styles.dateRow}>
          {dates.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              active={selectedDate === item.id}
              onPress={() => setSelectedDate(item.id)}
              height={38}
              fontSize={10.5}
            />
          ))}
        </View>

        <View style={styles.sectionSpacer} />
        <SectionHeader icon={<ClockIcon size={18} color="#fc4c02" />} label="Start Time" />
        <View style={styles.grid}>
          {availableTimeSlots.map((slot) => (
            <Chip
              key={slot.value}
              label={slot.label}
              active={selectedTime === slot.value}
              onPress={() => !slot.disabled && setSelectedTime(slot.value)}
              disabled={slot.disabled}
              height={41}
              fontSize={12.25}
            />
          ))}
        </View>

        <View style={styles.sectionSpacer} />
        <SectionHeader icon={<ClockIcon size={18} color="#fc4c02" />} label="Duration (Hours)" />
        <View style={styles.grid}>
          {DURATIONS.map((d) => (
            <Chip
              key={d}
              label={d}
              active={selectedDuration === d}
              onPress={() => setSelectedDuration(d)}
              height={41}
              fontSize={12.25}
            />
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <SummaryRow label="Start" value={`${selectedDateLabel}, ${selectedTime}`} />
          <SummaryRow label="Duration" value={`${estimatedHours} ${estimatedHours === 1 ? 'hour' : 'hours'}`} />
          <SummaryRow label="Estimated Cost" value={`₹${estimatedCost}`} accent />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label="Continue"
          onPress={() =>
            onContinue({ date: selectedDate, time: selectedTime, duration: selectedDuration, plan: selectedPlan })
          }
          height={56}
        />
      </View>
    </SafeAreaView>
  );
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={styles.sectionHeaderText}>{label}</Text>
    </View>
  );
}

function Chip({
  label,
  active,
  disabled,
  onPress,
  height = 41,
  fontSize = 12.25,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
  height?: number;
  fontSize?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.chip, { height }, active && styles.chipActive, disabled && styles.chipDisabled]}
    >
      <Text
        style={[
          styles.chipText,
          { fontSize },
          active && styles.chipTextActive,
          disabled && styles.chipTextDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, accent && styles.summaryAccent]}>{value}</Text>
    </View>
  );
}

function buildDateOptions(): DateOption[] {
  const options: DateOption[] = [];
  const today = new Date();
  for (let i = 0; i < 4; i += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const id =
      i === 0
        ? 'today'
        : i === 1
          ? 'tomorrow'
          : d.toISOString().slice(0, 10);
    const label =
      i === 0
        ? 'Today'
        : i === 1
          ? 'Tomorrow'
          : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    options.push({ id, label });
  }
  return options;
}

const DEFAULT_PLAN: RidePlan = {
  id: 'hourly',
  title: 'Hourly',
  duration: '1 Hour',
  price: 49,
  rateLabel: '/hr',
  bullets: [],
  validity: '',
  extraCharges: '',
};

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
    color: '#0f172a',
    fontSize: 21,
    fontWeight: '500',
    lineHeight: 32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  sectionHeaderText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  sectionSpacer: {
    height: 20,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  chip: {
    flexBasis: '23%',
    flexGrow: 1,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#fc4c02',
    borderColor: '#fc4c02',
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    color: '#0f172a',
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'center',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipTextDisabled: {
    color: '#94a3b8',
  },
  summaryCard: {
    marginTop: 24,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    padding: 15,
    gap: 7,
  },
  summaryTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
  },
  summaryValue: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  summaryAccent: {
    color: '#fc4c02',
    fontWeight: '600',
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
