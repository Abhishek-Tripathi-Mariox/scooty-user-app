import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';

export type CancellationReason = 
  | 'change-plan'
  | 'no-scooter'
  | 'low-battery'
  | 'station-far'
  | 'wrong-book'
  | 'emergency'
  | 'price-issue'
  | 'weather'
  | 'other';

export function RideCancelScreen({
  onBack,
  onConfirmCancel,
  onKeepBooking,
}: {
  onBack: () => void;
  onConfirmCancel: (reason: CancellationReason) => void;
  onKeepBooking: () => void;
}) {
  const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const reasons: Array<{ id: CancellationReason; label: string }> = [
    { id: 'change-plan', label: 'Change in plan / timing' },
    { id: 'no-scooter', label: 'Scooter not available at station' },
    { id: 'low-battery', label: 'Low battery level' },
    { id: 'station-far', label: 'Station is too far' },
    { id: 'wrong-book', label: 'Booked by mistake' },
    { id: 'emergency', label: 'Emergency situation' },
    { id: 'price-issue', label: 'Price not suitable' },
    { id: 'weather', label: 'Weather conditions' },
    { id: 'other', label: 'Other' },
  ];

  if (showConfirm && selectedReason) {
    return (
      <View style={styles.root}>
        <PageFrame title="Cancel booking?" onBack={() => setShowConfirm(false)}>
          <View style={styles.confirmContainer}>
            <View style={styles.warningIcon}>
              <Text style={styles.warningText}>❓</Text>
            </View>

            <Text style={styles.confirmTitle}>Are you sure you want to cancel?</Text>
            <Text style={styles.confirmSubtitle}>
              You're about to cancel your scooty booking
            </Text>

            <View style={styles.detailsBox}>
              <Text style={styles.detailsLabel}>Cancellation Reason</Text>
              <Text style={styles.detailsValue}>
                {reasons.find((r) => r.id === selectedReason)?.label}
              </Text>
            </View>

            <View style={styles.buttonsGroup}>
              <Pressable
                style={styles.keepButton}
                onPress={onKeepBooking}
              >
                <Text style={styles.keepText}>Keep Booking</Text>
              </Pressable>

              <PrimaryButton
                label="Cancel Booking"
                onPress={() => onConfirmCancel(selectedReason)}
                style={{
                  backgroundColor: '#ef4444',
                }}
              />
            </View>
          </View>
        </PageFrame>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <PageFrame title="Ride Cancel" onBack={onBack}>
        <ScrollView contentContainerStyle={styles.reasonsContainer}>
          <Text style={styles.reasonsTitle}>Why are you cancelling?</Text>

          {reasons.map((reason) => (
            <Pressable
              key={reason.id}
              style={[
                styles.reasonItem,
                selectedReason === reason.id && styles.reasonItemSelected,
              ]}
              onPress={() => setSelectedReason(reason.id)}
            >
              <View
                style={[
                  styles.radioButton,
                  selectedReason === reason.id && styles.radioButtonSelected,
                ]}
              >
                {selectedReason === reason.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.reasonLabel}>{reason.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="Cancel Ride"
            onPress={() => setShowConfirm(true)}
            disabled={!selectedReason}
            style={{
              backgroundColor: selectedReason ? '#ef4444' : COLORS.buttonDisabled,
            }}
          />
        </View>
      </PageFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  reasonsContainer: {
    paddingBottom: 100,
  },
  reasonsTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  reasonItemSelected: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: '#ef4444',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: '#ef4444',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  reasonLabel: {
    flex: 1,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  confirmContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  warningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  warningText: {
    fontSize: 40,
  },
  confirmTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsBox: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
    marginBottom: 20,
  },
  detailsLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 6,
  },
  detailsValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  buttonsGroup: {
    width: '100%',
    gap: 10,
  },
  keepButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.button,
    paddingVertical: 10,
    alignItems: 'center',
  },
  keepText: {
    color: COLORS.button,
    fontSize: 12,
    fontWeight: '700',
  },
});
