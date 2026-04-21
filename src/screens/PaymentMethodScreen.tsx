import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';

type PaymentMethod = 'google-pay' | 'paytm' | 'phonepe' | 'credit-card' | 'upi' | 'mobikwik' | 'cred';

export function PaymentMethodScreen({
  onBack,
  onSelectMethod,
  selectedMethod,
  amount,
}: {
  onBack: () => void;
  onSelectMethod: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod | null;
  amount: number;
}) {
  const methods: Array<{ id: PaymentMethod; name: string; icon?: string }> = [
    { id: 'google-pay', name: 'Google Pay' },
    { id: 'paytm', name: 'Paytm' },
    { id: 'phonepe', name: 'PhonePe' },
    { id: 'credit-card', name: 'Credit Card' },
    { id: 'upi', name: 'UPI' },
    { id: 'phonepe', name: 'PhonePe UPI' },
    { id: 'mobikwik', name: 'Mobikwik' },
    { id: 'cred', name: 'CRED Pay' },
  ];

  return (
    <View style={styles.root}>
      <PageFrame title="Preferred Mode" onBack={onBack}>
        <ScrollView contentContainerStyle={styles.methodsContainer}>
          {methods.map((method) => (
            <Pressable
              key={method.id}
              style={[
                styles.methodItem,
                selectedMethod === method.id && styles.methodItemSelected,
              ]}
              onPress={() => onSelectMethod(method.id)}
            >
              <View style={styles.methodIcon}>
                <Text style={styles.methodIconText}>💳</Text>
              </View>
              <Text style={styles.methodName}>{method.name}</Text>
              <View
                style={[
                  styles.radioButton,
                  selectedMethod === method.id && styles.radioButtonSelected,
                ]}
              >
                {selectedMethod === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Amount</Text>
            <Text style={styles.feeAmount}>₹{amount}</Text>
          </View>
          <PrimaryButton
            label="Confirm & Pay ₹180"
            onPress={() => {
              // Handle payment
            }}
            disabled={!selectedMethod}
            style={styles.button}
          />
        </View>
      </PageFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  methodsContainer: {
    paddingBottom: 120,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
    marginBottom: 10,
  },
  methodItemSelected: {
    backgroundColor: 'rgba(255, 100, 28, 0.08)',
    borderColor: COLORS.button,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodIconText: {
    fontSize: 20,
  },
  methodName: {
    flex: 1,
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.button,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.button,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  feeLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  feeAmount: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  button: {
    marginBottom: 0,
  },
});
