import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { GradientButton } from '../components/GradientButton';
import { ArrowLeftIcon } from '../components/RideIcons';

export function ScanQRCodeScreen({
  onBack,
  onScanned,
  expectedCode,
}: {
  onBack: () => void;
  onScanned: (code: string) => void;
  expectedCode?: string;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <Pressable style={styles.flashButton}>
          <FlashIcon size={24} color="#1c1c1e" />
        </Pressable>
      </View>

      <View style={styles.cameraFrame}>
        <View style={styles.frameWrap}>
          <View style={styles.frameOuter}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.scanLine} />
        </View>
        <Text style={styles.hint}>Position the QR code within the frame</Text>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Enter Code Manually</Text>
        </Pressable>
        <GradientButton
          label="Complete Scan"
          onPress={() => onScanned(expectedCode || '')}
          height={52}
          style={styles.primaryButton}
        />
      </View>
    </SafeAreaView>
  );
}

function FlashIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2 5 13h5l-1 9 8-11h-5l1-9Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="m4 4 16 16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const FRAME_SIZE = 256;
const CORNER_SIZE = 48;
const BORDER = 3.5;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0a0f1a',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 8,
    color: '#1c1c1e',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  flashButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  cameraFrame: {
    flex: 1,
    backgroundColor: '#05080f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  frameWrap: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameOuter: {
    position: 'absolute',
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderWidth: BORDER,
    borderColor: '#ffffff',
    borderRadius: 24,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#ffffff',
  },
  cornerTL: {
    top: 10,
    left: 10,
    borderLeftWidth: BORDER,
    borderTopWidth: BORDER,
    borderTopLeftRadius: 24,
  },
  cornerTR: {
    top: 10,
    right: 10,
    borderRightWidth: BORDER,
    borderTopWidth: BORDER,
    borderTopRightRadius: 24,
  },
  cornerBL: {
    bottom: 10,
    left: 10,
    borderLeftWidth: BORDER,
    borderBottomWidth: BORDER,
    borderBottomLeftRadius: 24,
  },
  cornerBR: {
    bottom: 10,
    right: 10,
    borderRightWidth: BORDER,
    borderBottomWidth: BORDER,
    borderBottomRightRadius: 24,
  },
  scanLine: {
    width: 8,
    height: 128,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 4,
  },
  hint: {
    marginTop: 40,
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    gap: 16,
  },
  secondaryButton: {
    height: 51,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fd540d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: '#fd540d',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
  },
  primaryButton: {
    borderRadius: 12,
  },
});
