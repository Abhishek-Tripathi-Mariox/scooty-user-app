import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';

export function RateYourExperienceScreen({
  onBack,
  onSubmit,
  onSkip,
}: {
  onBack: () => void;
  onSubmit: (rating: number, feedback: string) => void;
  onSkip: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  const getRatingLabel = (rate: number) => {
    switch (rate) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return '';
    }
  };

  return (
    <View style={styles.root}>
      <PageFrame title="Rate Your Experience" onBack={onBack}>
        <Text style={styles.subtitle}>Your feedback helps us improve</Text>

        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
              >
                <Text style={[
                  styles.star,
                  star <= rating && styles.starActive,
                ]}>
                  ⭐
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>
        </View>

        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackLabel}>Additional Feedback (Optional)</Text>
          <TextInput
            style={styles.feedbackInput}
            placeholder="Share your experience..."
            placeholderTextColor={COLORS.textMuted}
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={4}
          />
        </View>

        <PrimaryButton
          label="Submit Feedback"
          onPress={() => onSubmit(rating, feedback)}
          style={styles.submitButton}
        />

        <Pressable style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </PageFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingContainer: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  star: {
    fontSize: 28,
    opacity: 0.4,
  },
  starActive: {
    opacity: 1,
  },
  ratingLabel: {
    color: COLORS.button,
    fontSize: 14,
    fontWeight: '900',
  },
  feedbackBox: {
    marginBottom: 20,
  },
  feedbackLabel: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  feedbackInput: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
    fontFamily: 'System',
  },
  submitButton: {
    marginBottom: 12,
  },
  skipButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
