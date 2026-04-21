import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';

export function ParkingConfirmationScreen({
  onBack,
  onRetakePhoto,
  onConfirmParking,
  photoTaken,
}: {
  onBack: () => void;
  onRetakePhoto: () => void;
  onConfirmParking: () => void;
  photoTaken?: boolean;
}) {
  const [step, setStep] = useState<'initial' | 'photo-taken' | 'confirmed'>(
    photoTaken ? 'photo-taken' : 'initial'
  );

  if (step === 'initial') {
    return (
      <View style={styles.root}>
        <PageFrame title="Drop Scooty" onBack={onBack} scroll={false}>
          <View style={styles.photoBox}>
            <Text style={styles.photoIcon}>📷</Text>
            <Text style={styles.photoLabel}>Take a photo to confirm parked scooter</Text>
          </View>

          <View style={styles.instructionBox}>
            <Text style={styles.instructionTitle}>Instructions</Text>
            <Text style={styles.instructionText}>
              ✓ I confirm that the scooter is parked properly within the designated station area
            </Text>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>Note:</Text>
            <Text style={styles.noteText}>
              Improper parking may result in additional charges. Please ensure the scooter is parked in a safe location.
            </Text>
          </View>

          <PrimaryButton
            label="Take Photo"
            onPress={() => setStep('photo-taken')}
            style={styles.button}
          />
        </PageFrame>
      </View>
    );
  }

  if (step === 'photo-taken') {
    return (
      <View style={styles.root}>
        <PageFrame title="Drop Scooty" onBack={onBack} scroll={false}>
          <View style={styles.photoContainer}>
            <View style={styles.photoPreview}>
              <Text style={styles.photoPlaceholder}>📸</Text>
              <Text style={styles.photoText}>Photo captured</Text>
            </View>

            <Pressable style={styles.retakeButton} onPress={onRetakePhoto}>
              <Text style={styles.retakeText}>🔄 Retake Photo</Text>
            </Pressable>
          </View>

          <View style={styles.confirmBox}>
            <Pressable
              style={styles.checkboxRow}
              onPress={() => {
                // Toggle confirmation
              }}
            >
              <View style={styles.checkbox}>
                <Text>✓</Text>
              </View>
              <Text style={styles.confirmText}>
                I confirm that the scooter is parked properly within the designated station area
              </Text>
            </Pressable>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>Note:</Text>
            <Text style={styles.noteText}>
              Improper parking may result in additional charges. Please ensure the scooter is parked in a safe location.
            </Text>
          </View>

          <PrimaryButton
            label="End Ride"
            onPress={() => setStep('confirmed')}
            style={styles.button}
          />
        </PageFrame>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <PageFrame title="" onBack={onBack} scroll={false}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Photo Captured!</Text>
          <Text style={styles.successSubtitle}>
            Your scooter parked photo has been saved
          </Text>
        </View>

        <PrimaryButton
          label="Continue"
          onPress={onConfirmParking}
          style={styles.button}
        />
      </PageFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  photoBox: {
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.cardBorder,
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  photoIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  photoLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  instructionBox: {
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    padding: 12,
    marginBottom: 12,
  },
  instructionTitle: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 6,
  },
  instructionText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  noteBox: {
    borderRadius: 12,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
    padding: 12,
    marginBottom: 20,
  },
  noteLabel: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  noteText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  button: {
    marginTop: 'auto',
  },
  photoContainer: {
    marginBottom: 20,
  },
  photoPreview: {
    borderRadius: 16,
    backgroundColor: '#1f2937',
    paddingVertical: 60,
    alignItems: 'center',
    marginBottom: 12,
  },
  photoPlaceholder: {
    fontSize: 40,
    marginBottom: 8,
  },
  photoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  retakeButton: {
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 10,
    alignItems: 'center',
  },
  retakeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  confirmBox: {
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: 12,
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  confirmText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkMark: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '900',
  },
  successTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  successSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
