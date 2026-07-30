import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import Svg, { Path } from 'react-native-svg';
import { GradientButton } from '../components/GradientButton';
import { ArrowLeftIcon } from '../components/RideIcons';
import { STATUS_TOP_INSET } from '../utils/statusBarInset';

export function ScanQRCodeScreen({
  onBack,
  onScanned,
  expectedCode,
}: {
  onBack: () => void;
  onScanned: (code: string) => void;
  expectedCode?: string;
}) {
  void expectedCode; // backend validates the unlock code
  const [permission, setPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [torchOn, setTorchOn] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const scannedRef = useRef(false);

  useEffect(() => {
    void (async () => {
      if (Platform.OS !== 'android') {
        setPermission('granted');
        return;
      }
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'Camera permission',
        message: 'Camera is needed to scan the scooty QR code and unlock your ride.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      });
      setPermission(result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied');
    })();
  }, []);

  const submitCode = (raw: string) => {
    const code = String(raw || '').trim();
    if (!code || scannedRef.current) return;
    scannedRef.current = true;
    // Allow a re-scan if the backend rejects this code.
    setTimeout(() => {
      scannedRef.current = false;
    }, 3000);
    onScanned(code);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <Pressable style={styles.flashButton} onPress={() => setTorchOn((t) => !t)} hitSlop={8}>
          <FlashIcon size={24} color={torchOn ? '#fc4c02' : '#1c1c1e'} />
        </Pressable>
      </View>

      <View style={styles.cameraFrame}>
        {permission === 'granted' ? (
          <Camera
            style={StyleSheet.absoluteFillObject}
            cameraType={CameraType.Back}
            scanBarcode
            onReadCode={(event: { nativeEvent: { codeStringValue?: string } }) =>
              submitCode(event.nativeEvent?.codeStringValue || '')
            }
            showFrame={false}
            torchMode={torchOn ? 'on' : 'off'}
          />
        ) : (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionText}>
              {permission === 'pending'
                ? 'Opening camera…'
                : 'Camera permission is needed to scan the QR code.\nAllow camera access from Settings, or enter the code manually below.'}
            </Text>
          </View>
        )}

        <View style={styles.frameWrap} pointerEvents="none">
          <View style={styles.frameOuter}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>
        <View style={styles.hintWrap} pointerEvents="none">
          <Text style={styles.hint}>Position the QR code within the frame</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.secondaryButton} onPress={() => setManualOpen(true)}>
          <Text style={styles.secondaryText}>Enter Code Manually</Text>
        </Pressable>
      </View>

      <Modal
        visible={manualOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setManualOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setManualOpen(false)} />
        <View style={styles.modalWrap} pointerEvents="box-none">
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter Unlock Code</Text>
            <Text style={styles.modalSubtitle}>
              The unlock code is shown on your booking (e.g. MV-A1B2C3).
            </Text>
            <TextInput
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="MV-XXXXXX"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
              autoFocus
              style={styles.modalInput}
              selectionColor="#fc4c02"
              cursorColor="#fc4c02"
            />
            <GradientButton
              label="Unlock Ride"
              onPress={() => {
                setManualOpen(false);
                submitCode(manualCode);
              }}
              disabled={!manualCode.trim()}
              height={50}
              radius={12}
            />
          </View>
        </View>
      </Modal>
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
    // Extend the dark backdrop under the status bar; content stays below it.
    marginTop: -STATUS_TOP_INSET,
    paddingTop: STATUS_TOP_INSET,
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
  },
  permissionBox: {
    paddingHorizontal: 32,
  },
  permissionText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  frameWrap: {
    position: 'absolute',
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameOuter: {
    position: 'absolute',
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#ffffff',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderLeftWidth: BORDER,
    borderTopWidth: BORDER,
    borderTopLeftRadius: 24,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderRightWidth: BORDER,
    borderTopWidth: BORDER,
    borderTopRightRadius: 24,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderLeftWidth: BORDER,
    borderBottomWidth: BORDER,
    borderBottomLeftRadius: 24,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderRightWidth: BORDER,
    borderBottomWidth: BORDER,
    borderBottomRightRadius: 24,
  },
  hintWrap: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hint: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 24,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  modalWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  modalTitle: {
    color: '#101828',
    fontSize: 19,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#6a7282',
    fontSize: 13,
    lineHeight: 18,
  },
  modalInput: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    color: '#101828',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
});
