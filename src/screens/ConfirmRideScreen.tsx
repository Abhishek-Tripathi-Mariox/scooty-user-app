import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';
import { useResponsiveLayout } from '../utils/responsive';

const ScootyArtwork = require('../assets/images/scooty.png');

export function ConfirmRideScreen({
  onBack,
  onConfirm,
  scootyId,
  scootyBattery,
  scootyRange,
  farePerMinute,
  farePerKilometer,
  destinations,
  loading,
  planName,
  pickupStationName,
  dropStationName,
  scheduleLabel,
  estimatedTotal,
}: {
  onBack: () => void;
  onConfirm: () => void;
  scootyId?: string;
  scootyBattery?: number;
  scootyRange?: number;
  farePerMinute?: number;
  farePerKilometer?: number;
  destinations?: Array<{ icon: string; label: string }>;
  loading?: boolean;
  planName?: string;
  pickupStationName?: string;
  dropStationName?: string;
  scheduleLabel?: string;
  estimatedTotal?: number;
}) {
  const layout = useResponsiveLayout();
  const tripAmount = estimatedTotal ?? 95;
  const routeDestinations =
    destinations && destinations.length > 0
      ? destinations
      : [
          { icon: '💼', label: 'Office / Work' },
          { icon: '🏠', label: 'Home' },
          { icon: '🛍️', label: 'Market / Shops' },
          { icon: '🅿️', label: 'Parking' },
          { icon: '⛽', label: 'Petrol Pump' },
          { icon: '❌', label: 'Just running' },
        ];

  return (
    <View style={styles.root}>
      <PageFrame title="Confirm Ride" subtitle="Step 4 of 4" onBack={onBack} scroll>
        <View style={[styles.content, { paddingBottom: Math.max(20, Math.round(layout.screenHeight * 0.02)) }]}>
          <View style={styles.heroCard}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View style={styles.heroTopRow}>
              <View style={styles.stepPill}>
                <Text style={styles.stepPillText}>Ready to book</Text>
              </View>
              <Text style={styles.heroStepText}>{scheduleLabel || 'Final review'}</Text>
            </View>

            <View style={styles.heroMainRow}>
              <View style={styles.scootyVisual}>
                <View style={styles.scootyOrb} />
                <Image source={ScootyArtwork} style={styles.scootyImage} resizeMode="contain" />
              </View>

              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>{scootyId || 'SC001'}</Text>
                <Text style={styles.heroSubtitle}>KA 01 AB 1234</Text>
                <Text style={styles.heroDescription}>
                  Confirm the scooter, pickup station, and schedule before we move to payment.
                </Text>
              </View>
            </View>

            <View style={styles.heroStatsRow}>
              <InfoPill label="Battery" value={`${scootyBattery ?? 95}%`} />
              <InfoPill label="Range" value={`${scootyRange ?? 45} km`} />
              <InfoPill label="Plan" value={planName || 'Selected'} />
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <SummaryRow label="Pickup Station" value={pickupStationName || 'Nearest station'} />
            <SummaryRow label="Drop Station" value={dropStationName || 'Select drop station'} />
            <SummaryRow label="Schedule" value={scheduleLabel || 'Tomorrow, 10:00 • 2h'} />
            <SummaryRow label="Plan" value={planName || 'Hourly'} />
          </View>

          <View style={styles.fareBox}>
            <Text style={styles.fareTitle}>Fare Estimate</Text>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Per Minute</Text>
              <Text style={styles.fareAmount}>₹{farePerMinute || 3}</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Per Kilometer</Text>
              <Text style={styles.fareAmount}>₹{farePerKilometer || 8}</Text>
            </View>
            <View style={[styles.fareRow, styles.estimatedTotal]}>
              <Text style={styles.totalLabel}>Estimated total</Text>
              <Text style={styles.totalAmount}>{formatCurrency(tripAmount)}</Text>
            </View>
          </View>

          <View style={styles.destinationBox}>
            <Text style={styles.destinationTitle}>Where are you planning to go?</Text>
            <View style={styles.destinationGrid}>
              {routeDestinations.map((dest, idx) => (
                <Pressable key={idx} style={styles.destinationItem}>
                  <Text style={styles.destIcon}>{dest.icon}</Text>
                  <Text style={styles.destLabel}>{dest.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              Destination stays flexible. We’ll keep the trip fare visible and let you complete payment in the next
              step.
            </Text>
          </View>

          <View style={styles.walletBox}>
            <Text style={styles.walletIcon}>💳</Text>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Wallet Balance</Text>
              <Text style={styles.walletAmount}>₹450</Text>
            </View>
            <Pressable>
              <Text style={styles.addMoneyLink}>+ Add Money</Text>
            </Pressable>
          </View>

          <PrimaryButton
            label={loading ? 'Processing...' : 'Confirm & Pay'}
            onPress={onConfirm}
            style={styles.button}
            disabled={loading}
          />
        </View>
      </PageFrame>
    </View>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroStatPill}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function formatCurrency(value: number) {
  return `₹${value}`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 20,
    gap: 12,
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    padding: 16,
    overflow: 'hidden',
  },
  heroGlowOne: {
    position: 'absolute',
    right: -34,
    top: -30,
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: 'rgba(255, 100, 28, 0.12)',
  },
  heroGlowTwo: {
    position: 'absolute',
    left: -28,
    bottom: -28,
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: 'rgba(255, 182, 112, 0.16)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 100, 28, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  stepPillText: {
    color: COLORS.button,
    fontSize: 11,
    fontWeight: '800',
  },
  heroStepText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scootyVisual: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scootyOrb: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 100, 28, 0.08)',
  },
  scootyImage: {
    width: 84,
    height: 84,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 2,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  heroDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  heroStatPill: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  heroStatValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  heroStatLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  summaryCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.86)',
    padding: 14,
  },
  summaryTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  summaryValue: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  fareBox: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,200,200,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 28, 0.16)',
    padding: 12,
  },
  fareTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  fareLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  fareAmount: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  estimatedTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 100, 28, 0.22)',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  totalAmount: {
    color: COLORS.button,
    fontSize: 13,
    fontWeight: '900',
  },
  destinationBox: {
    gap: 10,
  },
  destinationTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  destinationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  destinationItem: {
    width: '31%',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.86)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  destIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  destLabel: {
    color: COLORS.textPrimary,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  noteBox: {
    borderRadius: 12,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
    padding: 10,
  },
  noteText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  walletBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,240,230,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 28, 0.1)',
    padding: 12,
  },
  walletIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  walletAmount: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  addMoneyLink: {
    color: COLORS.button,
    fontSize: 10,
    fontWeight: '700',
  },
  button: {
    marginBottom: 0,
  },
});
