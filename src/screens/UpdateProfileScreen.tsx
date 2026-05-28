import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DocumentPicker, { type DocumentPickerResponse } from 'react-native-document-picker';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { GradientButton } from '../components/GradientButton';
import { ArrowLeftIcon } from '../components/RideIcons';
import type { KycUploadFile, User } from '../services/userApi';
import { compressImage } from '../utils/image-compression';

const DefaultAvatar = require('../assets/images/profile.png');

type ProfileFormState = {
  name: string;
  email: string;
  city: string;
  address: string;
  pincode: string;
};

function IndianFlag({ size = 22 }: { size?: number }) {
  const stripeH = size / 3;
  const cx = size / 2;
  const cy = size / 2;
  const chakraR = stripeH * 0.4;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Rect x={0} y={0} width={size} height={stripeH} fill="#FF9933" />
      <Rect x={0} y={stripeH} width={size} height={stripeH} fill="#FFFFFF" />
      <Rect x={0} y={stripeH * 2} width={size} height={stripeH} fill="#138808" />
      <Circle cx={cx} cy={cy} r={chakraR} stroke="#000080" strokeWidth={1} fill="none" />
      <Line x1={cx - chakraR} y1={cy} x2={cx + chakraR} y2={cy} stroke="#000080" strokeWidth={0.6} />
      <Line x1={cx} y1={cy - chakraR} x2={cx} y2={cy + chakraR} stroke="#000080" strokeWidth={0.6} />
      <Line x1={cx - chakraR * 0.7} y1={cy - chakraR * 0.7} x2={cx + chakraR * 0.7} y2={cy + chakraR * 0.7} stroke="#000080" strokeWidth={0.5} />
      <Line x1={cx - chakraR * 0.7} y1={cy + chakraR * 0.7} x2={cx + chakraR * 0.7} y2={cy - chakraR * 0.7} stroke="#000080" strokeWidth={0.5} />
    </Svg>
  );
}

function VerifiedCheck({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill="#0f172a" />
      <Path
        d="M8 12.5l2.5 2.5L16 9"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CameraIcon({ size = 32, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M14 16h4l2-3h8l2 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V18a2 2 0 0 1 2-2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={24} cy={24} r={5} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

function FloatingField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  editable = true,
  autoCapitalize,
  chipColor,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  chipColor?: string;
  error?: string | null;
}) {
  return (
    <View style={styles.field}>
      <View style={[styles.labelChip, chipColor ? { backgroundColor: chipColor } : null]}>
        <Text style={styles.labelChipText}>{label}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(27,29,33,0.4)"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        selectionColor="#fc4c02"
        cursorColor="#fc4c02"
        style={[styles.input, error ? { borderColor: '#ef4444' } : null]}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function UpdateProfileScreen({
  user,
  onBack,
  onSave,
  loading = false,
}: {
  user?: User | null;
  onBack: () => void;
  onSave: (payload: ProfileFormState, profilePhoto?: KycUploadFile | null) => Promise<void>;
  loading?: boolean;
}) {
  const [form, setForm] = useState<ProfileFormState>(() => buildForm(user));
  const [selectedPhoto, setSelectedPhoto] = useState<KycUploadFile | null>(null);
  const [photoPreviewUri, setPhotoPreviewUri] = useState<string>(user?.profilePhotoUrl || '');
  const [photoPicking, setPhotoPicking] = useState(false);

  useEffect(() => {
    setForm(buildForm(user));
    setSelectedPhoto(null);
    setPhotoPreviewUri(user?.profilePhotoUrl || '');
  }, [user]);

  const avatarSource = useMemo(() => getAvatarSource(photoPreviewUri), [photoPreviewUri]);

  const handleSave = async () => {
    const normalizedName = form.name.trim();
    const normalizedEmail = form.email.trim();

    if (!normalizedName) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }
    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    await onSave(
      {
        name: normalizedName,
        email: normalizedEmail,
        city: form.city.trim(),
        address: form.address.trim(),
        pincode: form.pincode.trim(),
      },
      selectedPhoto,
    );
  };

  const handlePickPhoto = async () => {
    if (photoPicking) return;
    try {
      setPhotoPicking(true);
      const picked = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images],
        copyTo: 'cachesDirectory',
      });
      const normalized = await normalizePickedImage(picked);
      setSelectedPhoto(normalized);
      setPhotoPreviewUri(normalized.uri);
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Photo upload', 'Could not open the image picker.');
      }
    } finally {
      setPhotoPicking(false);
    }
  };

  return (
    <View style={styles.root}>
      <AppBackground variant="auth" />

      <View style={styles.topbar}>
        <Pressable onPress={onBack} style={styles.back} hitSlop={10}>
          <ArrowLeftIcon size={24} color="#0f172a" />
        </Pressable>
        <Text style={styles.heading}>Profile</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.avatarWrap} onPress={handlePickPhoto}>
            <View style={styles.avatar}>
              <Image source={avatarSource} style={styles.avatarImage} resizeMode="cover" />
            </View>
            <View style={styles.avatarOverlay} pointerEvents="none">
              <CameraIcon size={32} color="#ffffff" />
            </View>
          </Pressable>

          <View style={styles.formCard}>
            <FloatingField
              label="Full Name"
              value={form.name}
              onChangeText={(v) =>
                setForm((c) => ({ ...c, name: v.replace(/[^a-zA-Z\s.'-]/g, '') }))
              }
              placeholder="Enter full name"
              autoCapitalize="words"
              chipColor="#ffebe1"
              error={
                form.name.length > 0 && form.name.trim().length < 2
                  ? 'Name must be at least 2 characters'
                  : null
              }
            />

            <FloatingField
              label="Email Address"
              value={form.email}
              onChangeText={(v) => setForm((c) => ({ ...c, email: v }))}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              chipColor="#ffe5dd"
              error={
                form.email.length > 0 &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
                  ? 'Enter a valid email address'
                  : null
              }
            />

            <View style={styles.field}>
              <View style={[styles.labelChip, { backgroundColor: '#ffe0dd' }]}>
                <Text style={styles.labelChipText}>Phone Number</Text>
              </View>
              <View style={[styles.input, styles.phoneRow]}>
                <View style={styles.flagCircle}>
                  <IndianFlag size={22} />
                </View>
                <Text style={styles.phoneText} numberOfLines={1}>
                  {user?.mobile ? `+91 ${user.mobile}` : '+91 98765 43210'}
                </Text>
                <VerifiedCheck size={20} />
              </View>
            </View>

            <FloatingField
              label="Current Address"
              value={form.address}
              onChangeText={(v) => setForm((c) => ({ ...c, address: v }))}
              placeholder="Enter current address"
              chipColor="#fcd5db"
            />

            <View style={styles.row}>
              <View style={styles.rowHalf}>
                <FloatingField
                  label="Zip Code"
                  value={form.pincode}
                  onChangeText={(v) => setForm((c) => ({ ...c, pincode: v }))}
                  placeholder="203207"
                  keyboardType="number-pad"
                  chipColor="#f8e1e3"
                />
              </View>
              <View style={styles.rowHalf}>
                <FloatingField
                  label="City"
                  value={form.city}
                  onChangeText={(v) => setForm((c) => ({ ...c, city: v }))}
                  placeholder="City"
                  chipColor="#f3e9e9"
                />
              </View>
            </View>
          </View>

          <GradientButton
            label={loading ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={loading}
            height={56}
            radius={12}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function buildForm(user?: User | null): ProfileFormState {
  return {
    name: user?.name || '',
    email: user?.email || '',
    city: user?.city || '',
    address: user?.address || user?.adress || '',
    pincode: user?.pincode || '',
  };
}

function getAvatarSource(profilePhotoUrl: string): ImageSourcePropType {
  if (!profilePhotoUrl.trim()) return DefaultAvatar;
  return { uri: profilePhotoUrl.trim() };
}

async function normalizePickedImage(picked: DocumentPickerResponse): Promise<KycUploadFile> {
  const sourceUri = picked.fileCopyUri || picked.uri;
  const fileName = picked.name || `profile-photo-${Date.now()}.jpg`;
  const mimeType = picked.type || 'image/jpeg';
  const compressed = await compressImage(sourceUri, fileName, 'photo');
  return {
    uri: compressed.uri,
    name: fileName,
    type: mimeType,
    size: picked.size ?? null,
  };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  flex: { flex: 1 },
  topbar: {
    height: 82,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.62)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  back: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    color: '#000000',
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  avatarWrap: {
    width: 104,
    height: 104,
    borderRadius: 36,
    alignSelf: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 36,
    backgroundColor: '#3a2a22',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22,22,22,0.7)',
  },
  formCard: {
    gap: 24,
    marginBottom: 24,
  },
  field: {
    position: 'relative',
  },
  labelChip: {
    position: 'absolute',
    top: -8,
    left: 16,
    paddingHorizontal: 8,
    backgroundColor: '#fbe6d6',
    zIndex: 2,
  },
  labelChipText: {
    color: 'rgba(27,29,33,0.5)',
    fontSize: 12,
    lineHeight: 16,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(27,29,33,0.18)',
    paddingHorizontal: 24,
    color: '#1b1d21',
    fontSize: 14,
  },
  fieldError: {
    marginTop: 6,
    marginLeft: 4,
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  flagCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneText: {
    flex: 1,
    color: '#1b1d21',
    fontSize: 14,
  },
  selector: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(27,29,33,0.1)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    flex: 1,
    color: '#1b1d21',
    fontSize: 14,
    marginRight: 8,
  },
  selectorPlaceholder: {
    color: 'rgba(27,29,33,0.4)',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowHalf: {
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '88%',
    maxHeight: '70%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
  },
  modalTitle: {
    color: '#1b1d21',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    color: '#1b1d21',
    fontSize: 14,
    marginBottom: 12,
  },
  stateList: {
    maxHeight: 320,
  },
  stateItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  stateItemText: {
    color: '#1b1d21',
    fontSize: 15,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
