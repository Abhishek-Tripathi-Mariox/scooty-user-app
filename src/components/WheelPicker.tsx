import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

export type WheelPickerItem = {
  label: string;
  value: string;
  disabled?: boolean;
};

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;

type ScrollHandle = { scrollTo: (options: { y: number; animated?: boolean }) => void };

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
  accentColor = '#fc4c02',
  style,
}: {
  items: WheelPickerItem[];
  value?: string | null;
  onChange: (value: string) => void;
  itemHeight?: number;
  visibleRows?: number;
  accentColor?: string;
  style?: ViewStyle;
}) {
  const scrollRef = useRef<ScrollHandle | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [layoutReady, setLayoutReady] = useState(false);
  const lastEmitted = useRef<string | null>(null);
  const isUserScrolling = useRef(false);

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
    scrollToIndex(selectedIndex, true);
  }, [layoutReady, selectedIndex, value, scrollToIndex]);

  const nearestEnabled = useCallback(
    (index: number) => {
      if (!items[index]?.disabled) return index;
      for (let offset = 1; offset < items.length; offset += 1) {
        const before = items[index - offset];
        const after = items[index + offset];
        if (before && !before.disabled) return index - offset;
        if (after && !after.disabled) return index + offset;
      }
      return index;
    },
    [items],
  );

  const settle = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isUserScrolling.current = false;
    const raw = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
    const clamped = Math.min(items.length - 1, Math.max(0, raw));
    const target = nearestEnabled(clamped);
    if (target !== clamped) {
      scrollToIndex(target, true);
    }
    const next = items[target]?.value;
    if (next && next !== lastEmitted.current) {
      lastEmitted.current = next;
      onChange(next);
    }
  };

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // With no fling, onMomentumScrollEnd never fires, so settle here instead.
    const vy = Math.abs(event.nativeEvent.velocity?.y ?? 0);
    if (vy < 0.05) {
      settle(event);
    }
  };

  return (
    <View style={[styles.wrap, { height }, style]}>
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
      <Animated.ScrollView
        ref={scrollRef as never}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate={Platform.OS === 'ios' ? 'fast' : 0.985}
        nestedScrollEnabled
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{ paddingVertical: padding }}
        onScrollBeginDrag={() => {
          isUserScrolling.current = true;
        }}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={settle}
        onLayout={() => {
          if (!layoutReady) {
            setLayoutReady(true);
            requestAnimationFrame(() => scrollToIndex(selectedIndex, false));
          }
        }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
      >
        {items.map((item, index) => {
          const inputRange = [
            (index - 2) * itemHeight,
            (index - 1) * itemHeight,
            index * itemHeight,
            (index + 1) * itemHeight,
            (index + 2) * itemHeight,
          ];
          const opacity = scrollY.interpolate({
            inputRange,
            outputRange: [0.25, 0.5, 1, 0.5, 0.25],
            extrapolate: 'clamp',
          });
          const scale = scrollY.interpolate({
            inputRange,
            outputRange: [0.8, 0.9, 1.08, 0.9, 0.8],
            extrapolate: 'clamp',
          });
          const rotateX = scrollY.interpolate({
            inputRange,
            outputRange: ['50deg', '30deg', '0deg', '-30deg', '-50deg'],
            extrapolate: 'clamp',
          });
          const isSelected = index === selectedIndex;
          return (
            <Animated.View
              key={item.value}
              style={[
                styles.row,
                { height: itemHeight },
                { opacity, transform: [{ perspective: 600 }, { rotateX }, { scale }] },
              ]}
            >
              <Text
                style={[
                  styles.rowText,
                  isSelected && { color: accentColor, fontWeight: '700' },
                  item.disabled && styles.rowTextDisabled,
                ]}
              >
                {item.label}
              </Text>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
      <View pointerEvents="none" style={[styles.fade, styles.fadeTop, { height: padding }]} />
      <View pointerEvents="none" style={[styles.fade, styles.fadeBottom, { height: padding }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
  },
  highlight: {
    position: 'absolute',
    left: 12,
    right: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: 'rgba(252, 76, 2, 0.08)',
  },
  row: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '500',
  },
  rowTextDisabled: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  fadeTop: {
    top: 0,
  },
  fadeBottom: {
    bottom: 0,
  },
});
