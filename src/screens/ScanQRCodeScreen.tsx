import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable} from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';
import { useResponsiveLayout } from '../utils/responsive';

export function ScanQRCodeScreen({
  onBack,
  onScanned,
}: {
  onBack: () => void;
  onScanned: (code: string) => void;
}) {
  const [code, setCode] = useState('');
  const layout = useResponsiveLayout();

  return (
    <View style={styles.root}>
      <PageFrame title="Scan QR Code" onBack={onBack} scroll={false}>
        <View style={[styles.container, { paddingHorizontal: layout.screenX }]}>
          <View style={[styles.qrFrame, { width: layout.qrFrameSize, height: layout.qrFrameSize, marginTop: Math.max(16, Math.round(layout.screenHeight * 0.02)) }]}>
            <View style={[styles.qrBorder, { width: layout.qrInnerSize, height: layout.qrInnerSize }]} />
            <Text style={styles.qrText}>Position the QR code within the frame</Text>
          </View>

          <View style={styles.codeInfo}>
            <Text style={styles.codeLabel}>Scooty Code</Text>
            <Text style={styles.codeValue}>SC001</Text>
            <Text style={styles.codeSubtext}>KA 01 AB 1234</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🔋</Text>
              <Text style={styles.detailValue}>95%</Text>
              <Text style={styles.detailLabel}>Battery</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={styles.detailValue}>45 km</Text>
              <Text style={styles.detailLabel}>Range</Text>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Enter Code Manually</Text>
            <Pressable
              style={styles.manualInput}
              onPress={() => {
                setCode('SC001');
              }}
            >
              <Text style={styles.manualInputText}>Tap to enter QR code</Text>
            </Pressable>
          </View>

          <PrimaryButton
            label="Simulate Scan (Demo)"
            onPress={() => onScanned('SC001')}
            style={styles.button}
          />
        </View>
      </PageFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  qrFrame: {
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.button,
  },
  qrBorder: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.button,
    borderRadius: 12,
  },
  qrText: {
    position: 'absolute',
    bottom: 20,
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  codeInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  codeLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  codeValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  codeSubtext: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  detailValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  inputSection: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  manualInput: {
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualInputText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    marginTop: 'auto',
    marginBottom: 16,
    width: '100%',
  },
});
