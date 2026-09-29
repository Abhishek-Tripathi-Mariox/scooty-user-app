import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import { GradientFill } from '../components/GradientFill';
import { WheelPicker, WheelPickerGroup } from '../components/WheelPicker';
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from '../components/RideIcons';
import { FONTS } from '../constants/fonts';
import type { TimeSlotItem, TimeSlotWindow } from '../services/userApi';
import { formatCurrency, formatTime12 } from '../utils/format';
import { useStyles } from '../utils/responsiveStyles';
import type { RidePlan } from './RidePlanScreen';

type DateOption = {
  id: string;
  label: string;
};

type Period = 'AM' | 'PM';

// Bookable range of one day, in minutes from midnight.
type TimeRange = { open: number; min: number; max: number; step: number };

// Drum-style time picker: the selected row plus three fading rows on each side.
const TIME_WHEEL_ROWS = 7;
const TIME_WHEEL_ROW_HEIGHT = 22;
const TIME_WHEEL_FONT_SIZE = 16;
const MINUTES_PER_HALF_DAY = 12 * 60;
const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const pad2 = (value: number) => String(value).padStart(2, '0');

const toMinutes = (value?: string | null) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || '').trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

const toClock = (total: number) => `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;

const toHour24 = (hour12: number, period: Period) => (hour12 % 12) + (period === 'PM' ? 12 : 0);

// The range always comes from the backend: its booking window when it sends
// one, otherwise the first and last slot it returned. No data, no range.
const resolveTimeRange = (
  timeWindow?: TimeSlotWindow | null,
  slots?: TimeSlotItem[] | null,
): TimeRange | null => {
  if (timeWindow) {
    const open = toMinutes(timeWindow.openTime);
    const max = toMinutes(timeWindow.closeTime);
    const min = toMinutes(timeWindow.earliestTime);
    if (max == null || min == null || min > max) return null;
    const step =
      typeof timeWindow.minuteStep === 'number' &&
      Number.isInteger(timeWindow.minuteStep) &&
      timeWindow.minuteStep >= 1 &&
      timeWindow.minuteStep <= 30
        ? timeWindow.minuteStep
        : 1;
    return { open: open ?? min, min, max, step };
  }

  const all = (slots ?? [])
    .map((slot) => toMinutes(slot.value))
    .filter((value): value is number => value != null);
  const enabled = (slots ?? [])
    .filter((slot) => !slot.disabled)
    .map((slot) => toMinutes(slot.value))
    .filter((value): value is number => value != null);
  if (enabled.length === 0) return null;
  return {
    open: Math.min(...all),
    min: Math.min(...enabled),
    max: Math.max(...enabled),
    step: 1,
  };
};

const isBookable = (total: number, range: TimeRange) =>
  total >= range.min && total <= range.max && (total % 60) % range.step === 0;

// Nearest bookable minute to the requested one.
const clampToRange = (total: number, range: TimeRange) => {
  const bounded = Math.min(range.max, Math.max(range.min, total));
  if (isBookable(bounded, range)) return bounded;
  for (let offset = 1; offset <= 60; offset += 1) {
    if (isBookable(bounded + offset, range)) return bounded + offset;
    if (isBookable(bounded - offset, range)) return bounded - offset;
  }
  return null;
};

export function TimeSlotScreen({
  onBack,
  onContinue,
  onDateChange,
  plan,
  slots,
  timeWindow,
}: {
  onBack: () => void;
  onContinue: (selection: { date: string; time: string; duration: string; plan: RidePlan }) => void;
  onDateChange?: (dateId: string) => void;
  plan?: RidePlan | null;
  slots?: TimeSlotItem[] | null;
  timeWindow?: TimeSlotWindow | null;
}) {
  const styles = useStyles(RAW_STYLES);
  const selectedPlan = plan ?? null;
  const baseDates = useMemo(() => buildDateOptions(), []);
  const [customDate, setCustomDate] = useState<{ id: string; label: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState(baseDates[0]?.id || 'today');
  // Chosen start time in minutes from midnight; null until the backend range is known.
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Let the parent refetch slots for the chosen date (tomorrow / future days
  // must show the full day, not today's already-passed hours).
  useEffect(() => {
    onDateChange?.(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const dates = useMemo(() => {
    if (customDate && !baseDates.some((d) => d.id === customDate.id)) {
      return [...baseDates, customDate];
    }
    return baseDates;
  }, [baseDates, customDate]);

  const range = useMemo(() => resolveTimeRange(timeWindow, slots), [timeWindow, slots]);

  // Keep the selection inside the bookable range (first load, date change).
  useEffect(() => {
    if (!range) {
      if (selectedMinutes != null) setSelectedMinutes(null);
      return;
    }
    if (selectedMinutes != null && isBookable(selectedMinutes, range)) return;
    const next = clampToRange(selectedMinutes ?? range.min, range);
    if (next !== selectedMinutes) setSelectedMinutes(next);
  }, [range, selectedMinutes]);

  const selected = range && selectedMinutes != null && isBookable(selectedMinutes, range)
    ? selectedMinutes
    : null;
  const selectedPeriod: Period = selected != null && selected >= MINUTES_PER_HALF_DAY ? 'PM' : 'AM';
  const selectedHour24 = selected != null ? Math.floor(selected / 60) : 0;
  const selectedHour12 = selectedHour24 % 12 === 0 ? 12 : selectedHour24 % 12;
  const selectedMinute = selected != null ? selected % 60 : 0;

  const hourItems = useMemo(
    () =>
      HOURS_12.map((hour12) => {
        const start = toHour24(hour12, selectedPeriod) * 60;
        const hasBookableMinute =
          range != null &&
          Array.from({ length: 60 }, (_, minute) => start + minute).some((total) =>
            isBookable(total, range),
          );
        return { label: String(hour12), value: String(hour12), disabled: !hasBookableMinute };
      }),
    [range, selectedPeriod],
  );

  const minuteItems = useMemo(() => {
    const step = range?.step ?? 1;
    const items = [];
    for (let minute = 0; minute < 60; minute += step) {
      items.push({
        label: pad2(minute),
        value: pad2(minute),
        disabled: range == null || !isBookable(selectedHour24 * 60 + minute, range),
      });
    }
    return items;
  }, [range, selectedHour24]);

  const periodItems = useMemo(
    () =>
      (['AM', 'PM'] as Period[]).map((period) => {
        const start = period === 'PM' ? MINUTES_PER_HALF_DAY : 0;
        const end = start + MINUTES_PER_HALF_DAY - 1;
        return {
          label: period,
          value: period,
          disabled: range == null || range.max < start || range.min > end,
        };
      }),
    [range],
  );

  const pickTime = useCallback(
    (total: number) => {
      if (!range) return;
      const next = clampToRange(total, range);
      if (next != null) setSelectedMinutes(next);
    },
    [range],
  );

  const pickHour = (value: string) =>
    pickTime(toHour24(Number(value), selectedPeriod) * 60 + selectedMinute);
  const pickMinute = (value: string) => pickTime(selectedHour24 * 60 + Number(value));
  const pickPeriod = (value: string) =>
    pickTime(toHour24(selectedHour12, value as Period) * 60 + selectedMinute);

  // While a finger is on the wheels the page must not scroll under them,
  // otherwise both scroll views fight over the gesture.
  const pageScrollRef = useRef<ScrollView | null>(null);
  const setWheelActive = useCallback((active: boolean) => {
    pageScrollRef.current?.setNativeProps({ scrollEnabled: !active });
  }, []);

  const selectedDateLabel = dates.find((d) => d.id === selectedDate)?.label || 'Today';
  const selectedTimeLabel = selected != null ? formatTime12(toClock(selected)) : '';
  const canContinue = Boolean(selectedPlan && selected != null);

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
        ref={pageScrollRef}
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
        {range && selected != null ? (
          <>
            <WheelPickerGroup
              visibleRows={TIME_WHEEL_ROWS}
              itemHeight={TIME_WHEEL_ROW_HEIGHT}
              onInteractionChange={setWheelActive}
            >
              <WheelPicker
                bare
                visibleRows={TIME_WHEEL_ROWS}
                itemHeight={TIME_WHEEL_ROW_HEIGHT}
                fontSize={TIME_WHEEL_FONT_SIZE}
                align="right"
                items={hourItems}
                value={String(selectedHour12)}
                onChange={pickHour}
              />
              <WheelPicker
                bare
                visibleRows={TIME_WHEEL_ROWS}
                itemHeight={TIME_WHEEL_ROW_HEIGHT}
                fontSize={TIME_WHEEL_FONT_SIZE}
                items={minuteItems}
                value={pad2(selectedMinute)}
                onChange={pickMinute}
              />
              <WheelPicker
                bare
                visibleRows={TIME_WHEEL_ROWS}
                itemHeight={TIME_WHEEL_ROW_HEIGHT}
                fontSize={TIME_WHEEL_FONT_SIZE}
                align="left"
                items={periodItems}
                value={selectedPeriod}
                onChange={pickPeriod}
              />
            </WheelPickerGroup>
            <Text style={styles.wheelHint}>
              Pick any time between {formatTime12(toClock(range.open))} and{' '}
              {formatTime12(toClock(range.max))}
            </Text>
          </>
        ) : (
          <Text style={styles.wheelHint}>No time slots available for this date.</Text>
        )}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <SummaryRow
            label="Start"
            value={selectedTimeLabel ? `${selectedDateLabel}, ${selectedTimeLabel}` : '—'}
          />
          <SummaryRow label="Duration" value={selectedPlan?.duration || '—'} />
          <SummaryRow
            label="Plan Price"
            value={selectedPlan?.price != null ? formatCurrency(selectedPlan.price) : '—'}
            accent
          />
          <Text style={styles.summaryHint}>
            Security deposit, convenience fee & taxes will be added on the confirmation screen.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label="Continue"
          disabled={!canContinue}
          onPress={() => {
            if (!selectedPlan || selected == null) return;
            onContinue({
              date: selectedDate,
              time: toClock(selected),
              duration: selectedPlan.duration,
              plan: selectedPlan,
            });
          }}
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
  const styles = useStyles(RAW_STYLES);
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
  const styles = useStyles(RAW_STYLES);
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
  const styles = useStyles(RAW_STYLES);
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
  const styles = useStyles(RAW_STYLES);
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

const RAW_STYLES = {
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
    color: '#1e293b',
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  sectionHeaderText: {
    color: '#1e293b',
    fontFamily: FONTS.semiBold,
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
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
  },
  dateFieldText: {
    flex: 1,
    color: '#1e293b',
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  dateFieldHint: {
    color: '#fc4c02',
    fontFamily: FONTS.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 7,
  },
  wheelHint: {
    marginTop: 8,
    textAlign: 'center',
    color: '#64748b',
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  chip: {
    flexBasis: '23%',
    flexGrow: 1,
    paddingHorizontal: 12,
    borderRadius: 12,
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
    color: '#1e293b',
    fontFamily: FONTS.medium,
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
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    padding: 20,
    gap: 8,
  },
  summaryTitle: {
    color: '#1e293b',
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#64748b',
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  summaryValue: {
    color: '#1e293b',
    fontFamily: FONTS.medium,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  summaryAccent: {
    color: '#fc4c02',
    fontWeight: '600',
  },
  summaryHint: {
    marginTop: 4,
    color: '#64748b',
    fontFamily: FONTS.regular,
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
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 244, 236, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#1e293b',
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  monthNav: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
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
} as const;
