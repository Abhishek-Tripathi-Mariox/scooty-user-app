import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import { ArrowLeftIcon } from '../components/RideIcons';
import type { KycUploadFiles } from '../services/userApi';
import { useStyles } from '../utils/responsiveStyles';

type KycField = keyof KycUploadFiles;

function UploadIcon({ size = 32, color = '#6a7282' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3v12m0-12-4 4m4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function UploadCard({
  label,
  hint,
  fileName,
  onPress,
}: {
  label: string;
  hint: string;
  fileName?: string;
  onPress: () => void;
}) {
  const styles = useStyles(RAW_STYLES);
  const isUploaded = Boolean(fileName);
  return (
    <View style={styles.uploadBlock}>
      <Text style={styles.uploadLabel}>{label}</Text>
      <Pressable
        style={[styles.uploadCard, isUploaded && styles.uploadCardSelected]}
        onPress={onPress}
      >
        <UploadIcon size={32} color={isUploaded ? '#fc4c02' : '#6a7282'} />
        <Text
          style={[styles.uploadHint, isUploaded && styles.uploadHintSelected]}
          numberOfLines={1}
        >
          {fileName || hint}
        </Text>
      </Pressable>
    </View>
  );
}

export function KycScreen({
  onBack,
  onSubmit,
  onPickDocument,
  documents,
  existingDocuments,
  loading = false,
}: {
  onBack: () => void;
  onSubmit: () => void;
  onPickDocument: (field: KycField) => void;
  documents: KycUploadFiles;
  existingDocuments?: {
    adharFileUrl?: string;
    panFileUrl?: string;
    profilePhotoUrl?: string;
  };
  loading?: boolean;
}) {
  const styles = useStyles(RAW_STYLES);
  const isReady = Boolean(
    (documents.profilePhoto || existingDocuments?.profilePhotoUrl) &&
      (documents.adharFile || existingDocuments?.adharFileUrl) &&
      (documents.panFile || existingDocuments?.panFileUrl),
  );

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={10}>
          <ArrowLeftIcon size={24} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.headerTitle}>Complete KYC</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Upload your documents to verify your identity. Admin will review and approve your account.
        </Text>

        <UploadCard
          label="Upload Aadhaar"
          hint="Click to upload Aadhaar"
          fileName={
            documents.adharFile?.name ||
            (existingDocuments?.adharFileUrl ? 'Current document uploaded' : undefined)
          }
          onPress={() => onPickDocument('adharFile')}
        />
        <UploadCard
          label="Upload PAN Card"
          hint="Click to upload PAN Card"
          fileName={
            documents.panFile?.name ||
            (existingDocuments?.panFileUrl ? 'Current document uploaded' : undefined)
          }
          onPress={() => onPickDocument('panFile')}
        />
        <UploadCard
          label="Upload Profile Photo"
          hint="Click to upload photo"
          fileName={
            documents.profilePhoto?.name ||
            (existingDocuments?.profilePhotoUrl ? 'Current document uploaded' : undefined)
          }
          onPress={() => onPickDocument('profilePhoto')}
        />

        <GradientButton
          label={loading ? 'Submitting...' : 'Submit for Review'}
          onPress={onSubmit}
          disabled={loading || !isReady}
          height={48}
          radius={14}
          style={styles.submit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const RAW_STYLES = {
  safe: { flex: 1, backgroundColor: '#ffd1b0' },
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
    marginLeft: 8,
    color: '#1c1c1e',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  subtitle: {
    color: '#4a5565',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  uploadBlock: {
    marginBottom: 16,
  },
  uploadLabel: {
    marginBottom: 8,
    fontSize: 14,
    color: '#101828',
    fontWeight: '500',
    lineHeight: 14,
  },
  uploadCard: {
    height: 126,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadCardSelected: {
    borderColor: '#fc4c02',
    backgroundColor: 'rgba(255, 244, 239, 0.5)',
  },
  uploadHint: {
    color: '#6a7282',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  uploadHintSelected: {
    color: '#fc4c02',
    fontWeight: '500',
  },
  submit: {
    marginTop: 8,
  },
} as const;
