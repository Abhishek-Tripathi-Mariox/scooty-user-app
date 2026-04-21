import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PageFrame } from '../components/PageFrame';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { COLORS } from '../constants/theme';

const CallIcon = require('../assets/images/callicon.png');
const SupportHero = require('../assets/images/helpand support.png');
const LiveChatIcon = require('../assets/images/livechat.png');
const MessageIcon = require('../assets/images/message.png');

type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: 'How do I unlock a scooter?',
    answer: 'Scan the QR code from the app and follow the unlock flow after payment is confirmed.',
  },
  {
    question: 'What if the scooter has low battery?',
    answer: 'Choose another scooter or contact support from the same screen before starting your ride.',
  },
  {
    question: 'How is the fare calculated?',
    answer: 'Fare is based on ride duration, distance, and any applicable penalties or promotions.',
  },
  {
    question: 'Can I pause my ride?',
    answer: 'Yes, if the parking policy allows it. The app will show pause controls during the trip.',
  },
  {
    question: 'What is the service area?',
    answer: 'Service area coverage depends on your current city and the available stations nearby.',
  },
];

export function HelpSupportScreen({
  onBack,
  onTabPress,
  activeTab,
}: {
  onBack: () => void;
  onTabPress: (tab: TabKey) => void;
  activeTab: TabKey;
}) {
  const [issue, setIssue] = useState('');
  const [expanded, setExpanded] = useState<string | null>(faqs[0].question);

  const quickActions = useMemo(
    () => [
      { key: 'call', label: 'Call Us', bg: 'rgba(16, 185, 129, 0.12)', fg: '#16a34a', icon: CallIcon },
      { key: 'chat', label: 'Live Chat', bg: 'rgba(59, 130, 246, 0.12)', fg: '#2563eb', icon: LiveChatIcon },
      { key: 'email', label: 'Email', bg: 'rgba(168, 85, 247, 0.12)', fg: '#9333ea', icon: MessageIcon },
    ],
    [],
  );

  return (
    <View style={styles.root}>
      <PageFrame title="Help & Support" onBack={onBack} scroll>
        <View style={styles.content}>
          <View style={styles.heroCard}>
            <Image source={SupportHero} style={styles.heroImage} resizeMode="contain" />
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Need help?</Text>
              <Text style={styles.heroText}>
                Pick one of the quick actions below or submit an issue with a short description.
              </Text>
            </View>
          </View>

          <View style={styles.quickRow}>
            {quickActions.map((action) => (
              <Pressable
                key={action.key}
                onPress={() => Alert.alert(action.label, `${action.label} is not connected yet.`)}
                style={styles.callTile}
              >
                <View style={[styles.quickIcon, { backgroundColor: action.bg }]}>
                  <Image source={action.icon} style={[styles.quickImage, { tintColor: action.fg }]} resizeMode="contain" />
                </View>
                <Text style={styles.quickLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.issueCard}>
            <Text style={styles.sectionTitle}>Report an Issue</Text>
            <TextInput
              value={issue}
              onChangeText={setIssue}
              placeholder="Describe your issue..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              textAlignVertical="top"
              style={styles.issueInput}
            />
            <Pressable
              onPress={() => Alert.alert('Submitted', issue.trim() ? 'Your issue has been submitted.' : 'Please add issue details first.')}
              style={styles.submitButton}
            >
              <Text style={styles.submitText}>Submit Issue</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionHeader}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {faqs.map((faq) => {
              const isOpen = expanded === faq.question;
              return (
                <View key={faq.question} style={styles.faqItem}>
                  <Pressable onPress={() => setExpanded(isOpen ? null : faq.question)} style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <Text style={styles.faqChevron}>{isOpen ? '˄' : '˅'}</Text>
                  </Pressable>
                  {isOpen ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}
                </View>
              );
            })}
          </View>
        </View>
      </PageFrame>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 18,
  },
  heroCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.84)',
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroImage: {
    width: 72,
    height: 72,
    marginRight: 12,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  callTile: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    alignItems: 'center',
    paddingVertical: 12,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickImage: {
    width: 20,
    height: 20,
  },
  quickLabel: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  issueCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },
  issueInput: {
    minHeight: 74,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(33, 48, 74, 0.18)',
    backgroundColor: 'rgba(255,255,255,0.84)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: COLORS.button,
    alignItems: 'center',
    paddingVertical: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    paddingRight: 10,
  },
  faqChevron: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '900',
  },
  faqAnswer: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
});
