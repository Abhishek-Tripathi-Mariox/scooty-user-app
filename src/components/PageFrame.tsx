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
  return (
    <ScreenSurface>
      {scroll ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(20, Math.round(layout.screenHeight * 0.02)) }]}
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
        <View style={styles.container}>
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
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={[styles.backText, { fontSize: Math.max(22, Math.round(layout.screenWidth * 0.06)) }]}>←</Text>
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
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  backText: {
    color: COLORS.textPrimary,
    marginTop: -2,
  },
  backPlaceholder: {
    width: 30,
    height: 30,
    marginRight: 10,
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
