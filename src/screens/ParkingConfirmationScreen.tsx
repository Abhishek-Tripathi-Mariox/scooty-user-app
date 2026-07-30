import { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Camera, CameraType, type CameraApi } from 'react-native-camera-kit';
import Svg, { Path, Rect } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import { ArrowLeftIcon } from '../components/RideIcons';
import type { KycUploadFile } from '../services/userApi';

export function ParkingConfirmationScreen({
  onBack,
  onConfirmParking,
  onRetakePhoto,
}: {
  onBack: () => void;
  onRetakePhoto?: () => void;
  onConfirmParking: (photo: KycUploadFile | null) => void;
  photoTaken?: boolean;
}) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const cameraRef = useRef<CameraApi | null>(null);
  const canEndRide = !!photoUri && agreed;

  const openCamera = async () => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'Camera permission',
        message: 'Camera is needed to take a photo of the parked scooty.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      });
      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Camera needed', 'Please allow camera access to take the parking photo.');
        return;
      }
    }
    setCameraOpen(true);
  };

  const capturePhoto = async () => {
    if (capturing) return;
    try {
      setCapturing(true);
      const image = await cameraRef.current?.capture();
      if (image?.uri) {
        setPhotoUri(image.uri.startsWith('file') ? image.uri : `file://${image.uri}`);
        setCameraOpen(false);
      }
    } catch {
      Alert.alert('Camera', 'Could not capture the photo. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Parking Confirmation</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.photoBox}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
            ) : (
              <View style={styles.placeholderWrap}>
                <CameraIcon color="#ffffff" />
                <Text style={styles.placeholderText}>Take a photo of parked scooter</Text>
              </View>
            )}
          </View>

          {photoUri ? (
            <Pressable
              style={styles.retakeButton}
              onPress={() => {
                setPhotoUri(null);
                onRetakePhoto?.();
                void openCamera();
              }}
            >
              <CameraIcon color="#fc4c02" size={18} />
              <Text style={styles.retakeText}>Retake Photo</Text>
            </Pressable>
          ) : (
            <GradientButton
              label="Take Photo"
              onPress={() => void openCamera()}
              height={37}
              radius={12}
              leftIcon={<CameraIcon color="#ffffff" size={18} />}
              labelStyle={styles.takeLabel}
            />
          )}
        </View>

        <Pressable style={styles.checkRow} onPress={() => setAgreed((v) => !v)}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed ? (
              <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                <Path d="m3.5 8.5 3 3 6-7" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            ) : null}
          </View>
          <Text style={styles.checkText}>
            I confirm that the scooter is parked properly within the designated station area
          </Text>
        </Pressable>

        <View style={styles.noteCard}>
          <Text style={styles.noteBold}>Note:</Text>
          <Text style={styles.noteText}>
            Improper parking may result in additional charges. Please ensure the scooter is parked in a safe location.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {canEndRide ? (
          <GradientButton
            label="End Ride"
            onPress={() =>
              onConfirmParking(
                photoUri
                  ? {
                      uri: photoUri,
                      name: `parking-${Date.now()}.jpg`,
                      type: 'image/jpeg',
                    }
                  : null,
              )
            }
            height={52}
            radius={12}
          />
        ) : (
          <View style={styles.endDisabled}>
            <Text style={styles.endDisabledText}>End Ride</Text>
          </View>
        )}
      </View>

      <Modal
        visible={cameraOpen}
        animationType="slide"
        onRequestClose={() => setCameraOpen(false)}
      >
        <View style={styles.cameraModal}>
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            cameraType={CameraType.Back}
          />
          <Pressable style={styles.cameraClose} onPress={() => setCameraOpen(false)} hitSlop={10}>
            <Text style={styles.cameraCloseText}>×</Text>
          </Pressable>
          <View style={styles.cameraFooter}>
            <Pressable
              style={[styles.captureButton, capturing && { opacity: 0.5 }]}
              onPress={() => void capturePhoto()}
              disabled={capturing}
            >
              <View style={styles.captureInner} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function CameraIcon({ color, size = 32 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Rect x={3} y={8} width={26} height={18} rx={3} stroke={color} strokeWidth={2} />
      <Path d="M10 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke={color} strokeWidth={2} />
      <Rect x={11} y={13} width={10} height={10} rx={5} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  header: {
    height: 60,
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
    color: '#1c1c1e',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingTop: 25,
    paddingHorizontal: 25,
    paddingBottom: 25,
    gap: 16,
  },
  photoBox: {
    backgroundColor: '#1b1e31',
    borderRadius: 14,
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  photoPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraCloseText: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 30,
  },
  cameraFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 36,
    alignItems: 'center',
  },
  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
  },
  placeholderWrap: {
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    color: '#4a5565',
    fontSize: 16,
    lineHeight: 24,
  },
  capturedWrap: {
    alignItems: 'center',
    gap: 12,
  },
  capturedCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturedText: {
    color: '#32d34b',
    fontSize: 16,
    lineHeight: 24,
  },
  takeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 37,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fc4c02',
  },
  retakeText: {
    color: '#fc4c02',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#16a34a',
  },
  checkText: {
    flex: 1,
    color: '#363636',
    fontSize: 14,
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 17,
    gap: 4,
  },
  noteBold: {
    color: '#363636',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  noteText: {
    color: '#363636',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.6,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  endDisabled: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#dbdbdb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endDisabledText: {
    color: 'rgba(0, 0, 0, 0.26)',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 28,
  },
});
