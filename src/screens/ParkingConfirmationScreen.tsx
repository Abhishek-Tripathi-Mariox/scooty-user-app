import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import { ArrowLeftIcon, CheckIcon } from '../components/RideIcons';

export function ParkingConfirmationScreen({
  onBack,
  onConfirmParking,
  onRetakePhoto,
  photoTaken: photoTakenProp = false,
}: {
  onBack: () => void;
  onRetakePhoto?: () => void;
  onConfirmParking: () => void;
  photoTaken?: boolean;
}) {
  const [photoTaken, setPhotoTaken] = useState(photoTakenProp);
  const [agreed, setAgreed] = useState(false);
  const canEndRide = photoTaken && agreed;

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
            {photoTaken ? (
              <View style={styles.capturedWrap}>
                <View style={styles.capturedCircle}>
                  <CheckIcon size={40} color="#16a34a" />
                </View>
                <Text style={styles.capturedText}>Photo captured!</Text>
              </View>
            ) : (
              <View style={styles.placeholderWrap}>
                <CameraIcon color="#ffffff" />
                <Text style={styles.placeholderText}>Take a photo of parked scooter</Text>
              </View>
            )}
          </View>

          {photoTaken ? (
            <Pressable style={styles.retakeButton} onPress={() => {
              setPhotoTaken(false);
              onRetakePhoto?.();
            }}>
              <CameraIcon color="#fc4c02" size={18} />
              <Text style={styles.retakeText}>Retake Photo</Text>
            </Pressable>
          ) : (
            <GradientButton
              label="Take Photo"
              onPress={() => setPhotoTaken(true)}
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
          <GradientButton label="End Ride" onPress={onConfirmParking} height={52} radius={12} />
        ) : (
          <View style={styles.endDisabled}>
            <Text style={styles.endDisabledText}>End Ride</Text>
          </View>
        )}
      </View>
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
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
