import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { FONTS } from '../constants/fonts';

export type WheelPickerItem = {
  label: string;
  value: string;
  disabled?: boolean;
};

type WheelAlign = 'left' | 'center' | 'right';

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const ACCENT = '#fc4c02';

type ScrollHandle = { scrollTo: (options: { y: number; animated?: boolean }) => void };

/**
 * One row of the wheel. Everything that changes while scrolling is driven by
 * the native scroll position, so a row never re-renders during a scroll and
 * the accent colour follows the finger instead of waiting for the wheel to stop.
 */
const WheelRow = memo(function WheelRow({
  label,
  disabled,
  index,
  itemHeight,
  scrollY,
  align,
  fontSize,
  accentColor,
  tight,
}: {
  label: string;
  disabled: boolean;
  index: number;
  itemHeight: number;
  scrollY: Animated.Value;
  align: WheelAlign;
  fontSize?: number;
  accentColor: string;
  tight: boolean;
}) {
  const anim = useMemo(() => {
    const drum = [-3, -2, -1, 0, 1, 2, 3].map((offset) => (index + offset) * itemHeight);
    const center = [(index - 0.6) * itemHeight, index * itemHeight, (index + 0.6) * itemHeight];
    return {
      opacity: scrollY.interpolate({
        inputRange: drum,
        outputRange: [0.14, 0.32, 0.58, 1, 0.58, 0.32, 0.14],
        extrapolate: 'clamp',
      }),
      scale: scrollY.interpolate({
        inputRange: drum,
        outputRange: [0.6, 0.76, 0.9, 1.04, 0.9, 0.76, 0.6],
        extrapolate: 'clamp',
      }),
      rotateX: scrollY.interpolate({
        inputRange: drum,
        outputRange: ['62deg', '44deg', '24deg', '0deg', '-24deg', '-44deg', '-62deg'],
        extrapolate: 'clamp',
      }),
      selected: scrollY.interpolate({
        inputRange: center,
        outputRange: [0, 1, 0],
        extrapolate: 'clamp',
      }),
      resting: scrollY.interpolate({
        inputRange: center,
        outputRange: [1, 0, 1],
        extrapolate: 'clamp',
      }),
    };
  }, [index, itemHeight, scrollY]);

  const sizing = [
    fontSize != null && { fontSize },
    // Tight rows: the line box must not be taller than the row.
    tight && { lineHeight: itemHeight, includeFontPadding: false },
  ];

  return (
    <Animated.View
      style={[
        styles.row,
        align === 'left' && styles.rowLeft,
        align === 'right' && styles.rowRight,
        { height: itemHeight },
        {
          opacity: anim.opacity,
          transform: [{ perspective: 600 }, { rotateX: anim.rotateX }, { scale: anim.scale }],
        },
      ]}
    >
      {disabled ? (
        <Text style={[styles.rowText, sizing, styles.rowTextDisabled]}>{label}</Text>
      ) : (
        <View>
          {/* The bold accent label sets the width; the plain one fades out over it. */}
          <Animated.Text
            style={[styles.rowText, styles.rowTextSelected, sizing, { color: accentColor, opacity: anim.selected }]}
          >
            {label}
          </Animated.Text>
          <Animated.Text
            style={[styles.rowText, styles.rowTextResting, sizing, { opacity: anim.resting }]}
          >
            {label}
          </Animated.Text>
        </View>
      )}
    </Animated.View>
  );
});

/**
 * iOS-style wheel picker built on a snapping Animated.ScrollView.
 * Neighbouring rows fade, shrink and tilt away from the highlighted center row.
 */
export function WheelPicker({
  items,
  value,
  onChange,
  itemHeight = ITEM_HEIGHT,
  visibleRows = VISIBLE_ROWS,
  accentColor = ACCENT,
  bare = false,
  fontSize,
  align = 'center',
  style,
}: {
  items: WheelPickerItem[];
  value?: string | null;
  onChange: (value: string) => void;
  itemHeight?: number;
  visibleRows?: number;
  accentColor?: string;
  // Column inside a WheelPickerGroup: no card and no highlight of its own.
  bare?: boolean;
  fontSize?: number;
  // Horizontal position of the labels inside the column.
  align?: WheelAlign;
  style?: ViewStyle;
}) {
  const scrollRef = useRef<ScrollHandle | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [layoutReady, setLayoutReady] = useState(false);
  const lastEmitted = useRef<string | null>(null);
  const isUserScrolling = useRef(false);

  // Latest props for the scroll handlers, so the handlers themselves stay stable.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const rows = Math.max(3, visibleRows % 2 === 0 ? visibleRows + 1 : visibleRows);
  const padding = ((rows - 1) / 2) * itemHeight;
  const height = rows * itemHeight;

  const selectedIndex = useMemo(() => {
    const idx = items.findIndex((item) => item.value === value);
    return idx >= 0 ? idx : 0;
  }, [items, value]);

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      scrollRef.current?.scrollTo({ y: index * itemHeight, animated });
    },
    [itemHeight],
  );

  // Keep the wheel aligned with the controlled value when it changes externally.
  useEffect(() => {
    if (!layoutReady || isUserScrolling.current) return;
    if (lastEmitted.current === value) return;
    // The value was changed from outside: forget the last user pick so a later
    // change back to that same value still moves the wheel.
    lastEmitted.current = null;
    scrollToIndex(selectedIndex, true);
  }, [layoutReady, selectedIndex, value, scrollToIndex]);

  const settle = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isUserScrolling.current = false;
      const list = itemsRef.current;
      const raw = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
      const clamped = Math.min(list.length - 1, Math.max(0, raw));

      let target = clamped;
      if (list[clamped]?.disabled) {
        for (let offset = 1; offset < list.length; offset += 1) {
          const before = list[clamped - offset];
          const after = list[clamped + offset];
          if (before && !before.disabled) {
            target = clamped - offset;
            break;
          }
          if (after && !after.disabled) {
            target = clamped + offset;
            break;
          }
        }
      }
      if (target !== clamped) {
        scrollToIndex(target, true);
      }

      const next = list[target]?.value;
      if (next && next !== lastEmitted.current) {
        lastEmitted.current = next;
        onChangeRef.current(next);
      }
    },
    [itemHeight, scrollToIndex],
  );

  const onScrollBeginDrag = useCallback(() => {
    isUserScrolling.current = true;
  }, []);

  const onScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // With no fling, onMomentumScrollEnd never fires, so settle here instead.
      const vy = Math.abs(event.nativeEvent.velocity?.y ?? 0);
      if (vy < 0.05) {
        settle(event);
      }
    },
    [settle],
  );

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      }),
    [scrollY],
  );

  const contentStyle = useMemo(() => ({ paddingVertical: padding }), [padding]);

  return (
    <View style={[bare ? styles.bareWrap : styles.wrap, { height }, style]}>
      {bare ? null : (
        <View
          pointerEvents="none"
          style={[
            styles.highlight,
            {
              top: padding,
              height: itemHeight,
              borderColor: accentColor,
            },
          ]}
        />
      )}
      <Animated.ScrollView
        ref={scrollRef as never}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate={Platform.OS === 'ios' ? 'fast' : 0.985}
        nestedScrollEnabled
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={contentStyle}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={settle}
        onLayout={() => {
          if (!layoutReady) {
            setLayoutReady(true);
            requestAnimationFrame(() => scrollToIndex(selectedIndex, false));
          }
        }}
        scrollEventThrottle={16}
        onScroll={onScroll}
      >
        {items.map((item, index) => (
          <WheelRow
            key={item.value}
            label={item.label}
            disabled={Boolean(item.disabled)}
            index={index}
            itemHeight={itemHeight}
            scrollY={scrollY}
            align={align}
            fontSize={fontSize}
            accentColor={accentColor}
            tight={bare}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

/**
 * One card holding several bare wheels side by side under one shared
 * highlight row.
 */
export function WheelPickerGroup({
  children,
  itemHeight = ITEM_HEIGHT,
  visibleRows = VISIBLE_ROWS,
  accentColor = ACCENT,
  onInteractionChange,
  style,
}: {
  children: ReactNode;
  itemHeight?: number;
  visibleRows?: number;
  accentColor?: string;
  // True while a finger is on the wheels, so the page can stop scrolling under them.
  onInteractionChange?: (active: boolean) => void;
  style?: ViewStyle;
}) {
  const rows = Math.max(3, visibleRows % 2 === 0 ? visibleRows + 1 : visibleRows);
  const padding = ((rows - 1) / 2) * itemHeight;

  return (
    <View
      style={[styles.wrap, { height: rows * itemHeight }, style]}
      onTouchStart={() => onInteractionChange?.(true)}
      onTouchEnd={() => onInteractionChange?.(false)}
      onTouchCancel={() => onInteractionChange?.(false)}
    >
      <View
        pointerEvents="none"
        style={[
          styles.highlight,
          styles.groupHighlight,
          // Slightly taller than a row so the centred text has room.
          { top: padding - 4, height: itemHeight + 8, borderColor: accentColor },
        ]}
      />
      <View style={styles.groupRow}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bareWrap: {
    flex: 1,
    overflow: 'hidden',
  },
  // Hugs the columns instead of spanning the whole card.
  groupHighlight: {
    left: 60,
    right: 60,
    borderRadius: 12,
  },
  groupRow: {
    flex: 1,
    flexDirection: 'row',
    // Keeps the columns close together in the middle of the card.
    paddingHorizontal: 84,
    gap: 14,
  },
  // Same frosted-glass card as the other screens (translucent white + light border)
  wrap: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
  },
  highlight: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
  },
  row: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLeft: {
    alignItems: 'flex-start',
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowText: {
    color: '#1e293b',
    fontFamily: FONTS.medium,
    fontSize: 17,
    fontWeight: '500',
  },
  rowTextSelected: {
    fontFamily: FONTS.semiBold,
    fontWeight: '600',
  },
  // Sits exactly over the accent label.
  rowTextResting: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  rowTextDisabled: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
});
