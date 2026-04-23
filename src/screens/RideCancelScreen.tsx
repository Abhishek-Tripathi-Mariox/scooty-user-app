import { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { GradientButton } from '../components/GradientButton';
import { ArrowLeftIcon } from '../components/RideIcons';

const REASONS = [
  'Change in plan / timing',
  'Scooty not available at station',
  'Low battery level',
  'Station is too far',
  'Booked by mistake',
  'Found another scooty nearby',
  'App / unlock issue',
  'Price not suitable',
  'Weather conditions',
  'Emergency situation',
  'Other',
];

export function RideCancelScreen({
  onBack,
  onConfirmCancel,
  activeTab,
  onTabPress,
}: {
  onBack: () => void;
  onConfirmCancel: (reason: string) => void;
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
}) {
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Ride Cancel</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.question}>Why are you cancelling?</Text>

        <View style={styles.list}>
          {REASONS.map((reason) => {
            const active = reason === selectedReason;
            return (
              <Pressable
                key={reason}
                style={styles.row}
                onPress={() => setSelectedReason(reason)}
              >
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
                <Text style={styles.reasonText}>{reason}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footerWrap}>
        <View style={styles.cancelButton}>
          <GradientButton
            label="Cancel ride"
            onPress={() => setConfirmOpen(true)}
            height={48}
            labelStyle={styles.cancelLabel}
          />
        </View>
      </View>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />

      <ConfirmCancelDialog
        visible={confirmOpen}
        onKeep={() => setConfirmOpen(false)}
        onCancel={() => {
          setConfirmOpen(false);
          onConfirmCancel(selectedReason);
        }}
      />
    </SafeAreaView>
  );
}

function ConfirmCancelDialog({
  visible,
  onKeep,
  onCancel,
}: {
  visible: boolean;
  onKeep: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onKeep}>
      <Pressable style={styles.dialogOverlay} onPress={onKeep} />
      <View style={styles.dialogWrap} pointerEvents="box-none">
        <View style={styles.dialog}>
          <View style={styles.dialogIconCircle}>
            <XIcon size={42} color="#ee3e35" />
          </View>
          <Text style={styles.dialogTitle}>Cancel booking?</Text>
          <Text style={styles.dialogBody}>You&apos;re about to cancel your scooty booking.</Text>

          <View style={styles.dialogActions}>
            <Pressable style={[styles.dialogButton, styles.dialogKeep]} onPress={onKeep}>
              <Text style={styles.dialogKeepText}>Keep Booking</Text>
            </Pressable>
            <Pressable style={[styles.dialogButton, styles.dialogCancel]} onPress={onCancel}>
              <Text style={styles.dialogCancelText}>Cancel Booking</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function XIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Circle cx={21} cy={21} r={20} stroke={color} strokeWidth={2} />
      <Path d="m14 14 14 14M28 14 14 28" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  header: {
    height: 61,
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
    fontWeight: '600',
    lineHeight: 32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 19,
    paddingTop: 16,
    paddingBottom: 160,
  },
  question: {
    color: '#121212',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    marginBottom: 10,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#121212',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#121212',
  },
  reasonText: {
    color: '#121212',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  footerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 80,
    paddingHorizontal: 52,
  },
  cancelButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  dialogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  dialogWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  dialog: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  dialogIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitle: {
    color: '#43484b',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    textAlign: 'center',
  },
  dialogBody: {
    color: '#6e768a',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  dialogActions: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  dialogButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogKeep: {
    borderWidth: 1,
    borderColor: '#363636',
  },
  dialogKeepText: {
    color: '#363636',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  dialogCancel: {
    backgroundColor: '#ee3e35',
  },
  dialogCancelText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
