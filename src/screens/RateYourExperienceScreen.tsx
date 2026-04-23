import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export function RateYourExperienceScreen({
  onSubmit,
  onSkip,
}: {
  onBack: () => void;
  onSubmit: (rating: number, feedback: string) => void;
  onSkip: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.topCard}>
        <Text style={styles.title}>Rate Your Experience</Text>
        <Text style={styles.subtitle}>Your feedback helps us improve</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.ratingBlock}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Pressable key={i} onPress={() => setRating(i)} style={styles.starWrap}>
                <StarIcon filled={i <= rating} size={32} />
              </Pressable>
            ))}
          </View>
          <Text style={styles.ratingLabel}>{RATING_LABELS[rating - 1]}</Text>
        </View>

        <View style={styles.feedbackBlock}>
          <Text style={styles.feedbackTitle}>Additional Feedback (Optional)</Text>
          <View style={styles.textareaWrap}>
            <TextInput
              style={styles.textarea}
              multiline
              placeholder="Share your experience..."
              placeholderTextColor="#9ca3af"
              value={feedback}
              onChangeText={setFeedback}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <GradientButton label="Submit Feedback" onPress={() => onSubmit(rating, feedback)} height={52} />
        <Pressable style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function StarIcon({ filled, size }: { filled: boolean; size: number }) {
  const color = filled ? '#eab308' : '#d4d4d4';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  topCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#363636',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'center',
  },
  subtitle: {
    color: '#363636',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 32,
  },
  ratingBlock: {
    alignItems: 'center',
    gap: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  starWrap: {
    padding: 4,
  },
  ratingLabel: {
    color: '#4a5565',
    fontSize: 16,
    lineHeight: 24,
  },
  feedbackBlock: {
    gap: 12,
  },
  feedbackTitle: {
    color: '#363636',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 27,
  },
  textareaWrap: {
    borderWidth: 1,
    borderColor: 'rgba(140, 140, 140, 0.35)',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 125,
  },
  textarea: {
    flex: 1,
    color: '#363636',
    fontSize: 16,
    lineHeight: 23,
    minHeight: 90,
    padding: 0,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 12,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  skipText: {
    color: '#808080',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
  },
});
