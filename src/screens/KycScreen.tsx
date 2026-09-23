import { Pressable, Text, View } from 'react-native';
import { GradientButton } from '../components/GradientButton';
import { KycFrame } from '../components/KycFrame';
import { UploadArrowIcon } from '../components/RideIcons';
import { FONTS } from '../constants/fonts';
import type { KycUploadFiles } from '../services/userApi';
import { useStyles } from '../utils/responsiveStyles';

type KycField = keyof KycUploadFiles;

// Figma 477-14094 "Complete KYC / Upload Documents" (same UI as the owner
// app): label, then a 126px frosted card with the upload glyph and a hint.
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
        <UploadArrowIcon size={32} color={isUploaded ? '#fc4c02' : '#99a1af'} />
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
    adharBackFileUrl?: string;
    drivingLicenseFileUrl?: string;
    panFileUrl?: string;
    profilePhotoUrl?: string;
  };
  loading?: boolean;
}) {
  const styles = useStyles(RAW_STYLES);
  // Mandatory: Aadhaar front + back, driving licence, profile photo. PAN is optional.
  const isReady = Boolean(
    (documents.adharFile || existingDocuments?.adharFileUrl) &&
      (documents.adharBackFile || existingDocuments?.adharBackFileUrl) &&
      (documents.drivingLicenseFile || existingDocuments?.drivingLicenseFileUrl) &&
      (documents.profilePhoto || existingDocuments?.profilePhotoUrl),
  );
  const existingLabel = (url?: string) => (url ? 'Current document uploaded' : undefined);

  // Riders have a single KYC step, so the bar is already full here.
  return (
    <KycFrame title="Complete KYC" progress={100} onBack={onBack}>
      <Text style={styles.sectionTitle}>Upload Documents</Text>

      <UploadCard
        label="Upload Aadhaar Card (Front)"
        hint="Click to upload Aadhaar front side"
        fileName={documents.adharFile?.name || existingLabel(existingDocuments?.adharFileUrl)}
        onPress={() => onPickDocument('adharFile')}
      />
      <UploadCard
        label="Upload Aadhaar Card (Back)"
        hint="Click to upload Aadhaar back side"
        fileName={documents.adharBackFile?.name || existingLabel(existingDocuments?.adharBackFileUrl)}
        onPress={() => onPickDocument('adharBackFile')}
      />
      <UploadCard
        label="Upload Driving License"
        hint="Click to upload Driving License"
        fileName={
          documents.drivingLicenseFile?.name || existingLabel(existingDocuments?.drivingLicenseFileUrl)
        }
        onPress={() => onPickDocument('drivingLicenseFile')}
      />
      <UploadCard
        label="Upload Profile Photo"
        hint="Click to upload photo"
        fileName={documents.profilePhoto?.name || existingLabel(existingDocuments?.profilePhotoUrl)}
        onPress={() => onPickDocument('profilePhoto')}
      />
      <UploadCard
        label="Upload PAN Card (Optional)"
        hint="Click to upload PAN Card"
        fileName={documents.panFile?.name || existingLabel(existingDocuments?.panFileUrl)}
        onPress={() => onPickDocument('panFile')}
      />

      <GradientButton
        label={loading ? 'Submitting...' : 'Submit for Review'}
        onPress={onSubmit}
        disabled={loading || !isReady}
        height={48}
        radius={14}
      />
    </KycFrame>
  );
}

const RAW_STYLES = {
  sectionTitle: {
    color: '#1e293b',
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 16,
  },
  uploadBlock: {
    marginBottom: 16,
  },
  uploadLabel: {
    marginBottom: 8,
    color: '#1e293b',
    fontFamily: FONTS.medium,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  uploadCard: {
    height: 126,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  uploadCardSelected: {
    borderColor: '#fc4c02',
    backgroundColor: 'rgba(255, 244, 239, 0.5)',
  },
  uploadHint: {
    color: '#6a7282',
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  uploadHintSelected: {
    color: '#fc4c02',
    fontFamily: FONTS.medium,
    fontWeight: '500',
  },
} as const;
