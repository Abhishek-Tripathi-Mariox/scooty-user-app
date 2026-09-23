import React, { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { ScreenSurface } from './ScreenSurface';
import { useResponsiveLayout } from '../utils/responsive';
import { useBottomInset } from '../utils/insets';

export function PageFrame({
  children,
  title,
  subtitle,
  onBack,
  scroll = true,
  topRight,
  titleStyle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  scroll?: boolean;
  topRight?: ReactNode;
  titleStyle?: StyleProp<TextStyle>;
}) {
  const layout = useResponsiveLayout();
  const bottomInset = useBottomInset();
  return (
    <ScreenSurface>
      {scroll ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(20, Math.round(layout.screenHeight * 0.02)) + bottomInset }]}
        >
          <FrameChrome
            title={title}
            subtitle={subtitle}
            onBack={onBack}
            topRight={topRight}
            titleStyle={titleStyle}
          />
          <View style={[styles.body, { paddingHorizontal: layout.screenX }]}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.container, { paddingBottom: bottomInset }]}>
          <FrameChrome
            title={title}
            subtitle={subtitle}
            onBack={onBack}
            topRight={topRight}
            titleStyle={titleStyle}
          />
          <View style={[styles.body, { paddingHorizontal: layout.screenX }]}>{children}</View>
        </View>
      )}
    </ScreenSurface>
  );
}

function FrameChrome({
  title,
  subtitle,
  onBack,
  topRight,
  titleStyle,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  topRight?: ReactNode;
  titleStyle?: StyleProp<TextStyle>;
}) {
  const layout = useResponsiveLayout();
  return (
    <>
      <View style={[styles.headerRow, { paddingHorizontal: layout.screenX, paddingTop: Math.max(18, Math.round(layout.screenHeight * 0.03)) }]}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <View style={styles.headerTextWrap}>
          <Text style={[styles.title, titleStyle, { fontSize: layout.pageTitleSize }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { fontSize: layout.pageSubtitleSize }]}>{subtitle}</Text> : null}
        </View>
        <View style={styles.topRight}>{topRight}</View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingBottom: 20,
  },
  headerRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 30,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: -4,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    shadowColor: '#d9b7ab',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  backText: {
    color: COLORS.textPrimary,
    fontSize: 19,
    lineHeight: 21,
  },
  backPlaceholder: {
    width: 38,
    height: 38,
    marginRight: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    color: COLORS.textPrimary,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 3,
    fontWeight: '500',
  },
  topRight: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: SPACING.screenX,
  },
});
