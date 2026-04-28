import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { BottomTabs, type TabKey } from '../components/BottomTabs';
import { GradientButton } from '../components/GradientButton';
import { ArrowLeftIcon } from '../components/RideIcons';

const FAQS = [
  { q: 'How do I unlock a scooter?', a: 'Scan the QR code on the scooter using the app to unlock it instantly.' },
  { q: 'What if the scooter has low battery?', a: 'Pick a scooter with higher battery — the app shows live battery levels at every station.' },
  { q: 'How is the fare calculated?', a: 'Fare is based on per-minute + per-kilometer rates plus applicable taxes.' },
  { q: 'Can I pause my ride?', a: 'Yes, you can pause your ride from the active ride screen. Pause minutes are billed at a reduced rate.' },
  { q: 'What is the service area?', a: 'Service is currently available within the city limits shown on the map.' },
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.tilesRow}>
          <ContactTile bg="#dcfce7" icon={<PhoneIcon color="#16a34a" />} label="Call Us" />
          <ContactTile bg="#dbeafe" icon={<ChatIcon color="#2563eb" />} label="Live Chat" />
          <ContactTile bg="#f3e8ff" icon={<MailIcon color="#9333ea" />} label="Email" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Report an Issue</Text>
          <View style={styles.textareaWrap}>
            <TextInput
              style={styles.textarea}
              multiline
              value={issue}
              onChangeText={setIssue}
              placeholder="Describe your issue..."
              placeholderTextColor="rgba(0, 0, 0, 0.45)"
            />
          </View>
          <GradientButton label="Submit Issue" onPress={() => setIssue('')} height={37} radius={12} />
        </View>

        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
        <View style={{ gap: 8 }}>
          {FAQS.map((f, i) => {
            const open = openIndex === i;
            return (
              <View key={f.q} style={styles.faqCard}>
                <Pressable style={styles.faqRow} onPress={() => setOpenIndex(open ? null : i)}>
                  <Text style={styles.faqQuestion}>{f.q}</Text>
                  <ChevronDownIcon color="#6b7280" rotated={open} />
                </Pressable>
                {open ? <Text style={styles.faqAnswer}>{f.a}</Text> : null}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <BottomTabs active={activeTab} onTabPress={onTabPress} />
    </SafeAreaView>
  );
}

function ContactTile({ bg, icon, label }: { bg: string; icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.tile}>
      <View style={[styles.tileIcon, { backgroundColor: bg }]}>{icon}</View>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function PhoneIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.487 17.14l-4.065-3.696a1 1 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.86 3.513a1 1 0 0 0-1.391-.087l-2.396 2.06a1 1 0 0 0-.291.649c-.015.25-.301 6.172 4.291 10.766C11.479 20.892 16.5 21.25 17.883 21.25c.202 0 .326-.007.359-.009a1 1 0 0 0 .649-.292l2.06-2.396a1 1 0 0 0-.064-1.413z"
        fill={color}
      />
    </Svg>
  );
}

function ChatIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM7 9h10v2H7V9zm6 5H7v-2h6v2zm4-6H7V6h10v2z"
        fill={color}
      />
    </Svg>
  );
}

function MailIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
        fill={color}
      />
    </Svg>
  );
}

function ChevronDownIcon({ color, rotated }: { color: string; rotated: boolean }) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      style={{ transform: [{ rotate: rotated ? '180deg' : '0deg' }] }}
    >
      <Path d="m5 8 5 5 5-5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  header: {
    height: 56,
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
    color: '#101828',
    fontFamily: 'Arimo',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 27,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tile: {
    flex: 1,
    height: 104,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    color: '#364153',
    fontSize: 12,
    lineHeight: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  cardTitle: {
    color: '#101828',
    fontFamily: 'Arimo',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 27,
  },
  textareaWrap: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 102,
  },
  textarea: {
    flex: 1,
    color: '#101828',
    fontSize: 16,
    lineHeight: 22,
    minHeight: 80,
    padding: 0,
    textAlignVertical: 'top',
  },
  faqTitle: {
    color: '#101828',
    fontFamily: 'Arimo',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 27,
  },
  faqCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  faqQuestion: {
    flex: 1,
    color: '#101828',
    fontSize: 16,
    lineHeight: 22,
  },
  faqAnswer: {
    paddingBottom: 14,
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
  },
});
