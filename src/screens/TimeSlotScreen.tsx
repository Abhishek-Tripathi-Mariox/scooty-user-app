import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import { GradientFill } from '../components/GradientFill';
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from '../components/RideIcons';
import type { TimeSlotItem } from '../services/userApi';
import { formatCurrency, formatTime12 } from '../utils/format';
import type { RidePlan } from './RidePlanScreen';

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

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
  const baseDates = useMemo(() => buildDateOptions(), []);
  const [customDate, setCustomDate] = useState<{ id: string; label: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState(baseDates[1]?.id || 'tomorrow');
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [pickerOpen, setPickerOpen] = useState(false);

  const dates = useMemo(() => {
    if (customDate && !baseDates.some((d) => d.id === customDate.id)) {
      return [...baseDates, customDate];
    }
    return baseDates;
  }, [baseDates, customDate]);

  const availableTimeSlots = useMemo(
    () =>
      slots && slots.length > 0
        ? slots
        : TIME_SLOTS.map((slot) => ({ label: formatTime12(slot), value: slot, disabled: false })),
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
  const selectedTimeLabel =
    availableTimeSlots.find((slot) => slot.value === selectedTime)?.label ||
    formatTime12(selectedTime);

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
        <Pressable
          style={styles.dateField}
          onPress={() => setPickerOpen(true)}
          hitSlop={6}
        >
          <CalendarIcon size={18} color="#fc4c02" />
          <Text style={styles.dateFieldText} numberOfLines={1}>
            {selectedDateLabel}
          </Text>
          <Text style={styles.dateFieldHint}>Tap to change</Text>
        </Pressable>
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

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <SummaryRow label="Start" value={`${selectedDateLabel}, ${selectedTimeLabel}`} />
          <SummaryRow label="Duration" value={selectedPlan.duration} />
          <SummaryRow label="Plan Price" value={formatCurrency(selectedPlan.price)} accent />
          <Text style={styles.summaryHint}>
            Security deposit, convenience fee & taxes will be added on the confirmation screen.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label="Continue"
          onPress={() =>
            onContinue({
              date: selectedDate,
              time: selectedTime,
              duration: selectedPlan.duration,
              plan: selectedPlan,
            })
          }
          height={56}
        />
      </View>

      <CalendarPickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(iso, label) => {
          setCustomDate({ id: iso, label });
          setSelectedDate(iso);
          setPickerOpen(false);
        }}
      />
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
      {active ? <GradientFill radius={10} /> : null}
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

function CalendarPickerModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (iso: string, label: string) => void;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [viewMonth, setViewMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const monthName = new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const firstDay = new Date(viewMonth.year, viewMonth.month, 1);
  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const startWeekday = firstDay.getDay();
  const cells: Array<number | null> = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const goPrev = () => {
    setViewMonth((vm) =>
      vm.month === 0 ? { year: vm.year - 1, month: 11 } : { year: vm.year, month: vm.month - 1 },
    );
  };
  const goNext = () => {
    setViewMonth((vm) =>
      vm.month === 11 ? { year: vm.year + 1, month: 0 } : { year: vm.year, month: vm.month + 1 },
    );
  };

  const canGoPrev =
    viewMonth.year > today.getFullYear() ||
    (viewMonth.year === today.getFullYear() && viewMonth.month > today.getMonth());

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={canGoPrev ? goPrev : undefined}
              disabled={!canGoPrev}
              style={[styles.monthNav, !canGoPrev && styles.monthNavDisabled]}
            >
              <Text style={styles.monthNavText}>‹</Text>
            </Pressable>
            <Text style={styles.modalTitle}>{monthName}</Text>
            <Pressable onPress={goNext} style={styles.monthNav}>
              <Text style={styles.monthNavText}>›</Text>
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Text key={`${d}-${i}`} style={styles.weekDay}>
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.dayGrid}>
            {cells.map((day, idx) => {
              if (day === null) {
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }
              const cellDate = new Date(viewMonth.year, viewMonth.month, day);
              cellDate.setHours(0, 0, 0, 0);
              const isPast = cellDate.getTime() < today.getTime();
              const isToday = cellDate.getTime() === today.getTime();
              return (
                <Pressable
                  key={`day-${day}`}
                  disabled={isPast}
                  style={[styles.dayCell, isPast && styles.dayCellDisabled]}
                  onPress={() => {
                    const iso = cellDate.toISOString().slice(0, 10);
                    const label = cellDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    });
                    onSelect(iso, label);
                  }}
                >
                  <Text style={[styles.dayText, isPast && styles.dayTextDisabled, isToday && styles.dayTextToday]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
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
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: '#fc4c02',
  },
  dateFieldText: {
    flex: 1,
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
  dateFieldHint: {
    color: '#fc4c02',
    fontSize: 12,
    fontWeight: '600',
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
    overflow: 'hidden',
  },
  chipActive: {
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
  summaryHint: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 11,
    lineHeight: 15,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  monthNav: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5ed',
  },
  monthNavDisabled: {
    opacity: 0.3,
  },
  monthNavText: {
    color: '#fc4c02',
    fontSize: 22,
    lineHeight: 22,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '500',
  },
  dayTextDisabled: {
    color: '#94a3b8',
  },
  dayTextToday: {
    color: '#fc4c02',
    fontWeight: '700',
  },
});
