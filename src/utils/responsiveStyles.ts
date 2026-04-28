import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ResponsiveLayout, useResponsiveLayout } from './responsive';

const DESIGN_SURFACE_WIDTH = 390;

const SIZE_KEYS = new Set([
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
  'marginStart',
  'marginEnd',
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingHorizontal',
  'paddingVertical',
  'paddingStart',
  'paddingEnd',
  'top',
  'bottom',
  'left',
  'right',
  'start',
  'end',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderTopStartRadius',
  'borderTopEndRadius',
  'borderBottomStartRadius',
  'borderBottomEndRadius',
  'gap',
  'rowGap',
  'columnGap',
]);

const FONT_KEYS = new Set(['fontSize', 'lineHeight', 'letterSpacing']);

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function scaleSize(size: number, w: number): number {
  const ratio = w / DESIGN_SURFACE_WIDTH;
  return Math.round(size * clamp(ratio, 0.85, 1.15));
}

function scaleFont(size: number, w: number): number {
  const ratio = w / DESIGN_SURFACE_WIDTH;
  return Math.round(size * clamp(ratio, 0.9, 1.1));
}

function scaleValue(value: unknown, key: string, w: number): unknown {
  if (typeof value !== 'number' || !isFinite(value)) return value;
  if (FONT_KEYS.has(key)) return scaleFont(value, w);
  if (SIZE_KEYS.has(key)) return scaleSize(value, w);
  return value;
}

function scaleStyleObject<T extends Record<string, unknown>>(style: T, w: number): T {
  const out: Record<string, unknown> = {};
  for (const key in style) {
    out[key] = scaleValue(style[key], key, w);
  }
  return out as T;
}

export type StyleMap = Record<string, Record<string, unknown>>;

export function createResponsiveStyles<T>(layout: ResponsiveLayout, styles: T): T {
  const w = layout.screenWidth;
  const scaled: Record<string, Record<string, unknown>> = {};
  for (const name in styles as Record<string, unknown>) {
    scaled[name] = scaleStyleObject(
      (styles as Record<string, Record<string, unknown>>)[name],
      w,
    );
  }
  return StyleSheet.create(scaled as Record<string, object>) as unknown as T;
}

export function useStyles<T>(raw: T): T {
  const layout = useResponsiveLayout();
  return useMemo(() => createResponsiveStyles(layout, raw), [layout, raw]);
}
