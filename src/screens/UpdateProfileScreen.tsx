import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import DocumentPicker, { type DocumentPickerResponse } from 'react-native-document-picker';
import { PageFrame } from '../components/PageFrame';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS, SPACING } from '../constants/theme';
import type { KycUploadFile, User } from '../services/userApi';
import { compressImage } from '../utils/image-compression';

const DefaultAvatar = require('../assets/images/profile.png');
const CameraIcon = require('../assets/images/camera.png');

type ProfileFormState = {
  name: string;
  email: string;
  city: string;
  address: string;
  language: string;
};

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
  const initials = getInitials(form.name || user?.name || '');
  const canSave = form.name.trim().length > 0 && !loading;

  const handleSave = async () => {
    const normalizedName = form.name.trim();
    const normalizedEmail = form.email.trim();
    const normalizedCity = form.city.trim();
    const normalizedAddress = form.address.trim();
    const normalizedLanguage = form.language.trim();

    if (!normalizedName) {
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
        city: normalizedCity,
        address: normalizedAddress,
        language: normalizedLanguage,
      },
      selectedPhoto,
    );
  };

  const handlePickPhoto = async () => {
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
      <PageFrame title="Update Profile" subtitle="Edit the details shown on your account" onBack={onBack}>
        <View style={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.avatarWrap}>
              <Image source={avatarSource} style={styles.avatarImage} />
              {!photoPreviewUri.trim() ? (
                <View style={styles.initialsFallback}>
                  <Text style={styles.initialsText}>{initials}</Text>
                </View>
              ) : null}
              <Pressable style={styles.cameraBadge} onPress={handlePickPhoto} disabled={photoPicking}>
                <Image source={CameraIcon} style={styles.cameraIcon} resizeMode="contain" />
              </Pressable>
            </View>

            <View style={styles.heroText}>
              <Text style={styles.heroName}>{form.name.trim() || 'Your profile'}</Text>
              <Text style={styles.heroSubtext}>
                Tap the camera icon to upload a new photo.
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Field label="Full Name">
              <TextInput
                value={form.name}
                onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
                placeholder="Enter full name"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
              />
            </Field>

            <Field label="Mobile Number" helper="This is linked to your account and cannot be changed here.">
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{formatPhone(user?.mobile || '')}</Text>
              </View>
            </Field>

            <Field label="Email Address">
              <TextInput
                value={form.email}
                onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
                placeholder="Enter email address"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </Field>

            <View style={styles.row}>
              <Field label="City" containerStyle={styles.halfField}>
                <TextInput
                  value={form.city}
                  onChangeText={(value) => setForm((current) => ({ ...current, city: value }))}
                  placeholder="City"
                  placeholderTextColor={COLORS.textMuted}
                  style={styles.input}
                />
              </Field>

              <Field label="Language" containerStyle={[styles.halfField, styles.halfFieldRight]}>
                <TextInput
                  value={form.language}
                  onChangeText={(value) => setForm((current) => ({ ...current, language: value }))}
                  placeholder="English"
                  placeholderTextColor={COLORS.textMuted}
                  style={styles.input}
                />
              </Field>
            </View>

            <Field label="Address">
              <TextInput
                value={form.address}
                onChangeText={(value) => setForm((current) => ({ ...current, address: value }))}
                placeholder="House no, street, area"
                placeholderTextColor={COLORS.textMuted}
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.textArea]}
              />
            </Field>

            <PrimaryButton
              label={loading ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              style={styles.button}
              disabled={!canSave}
            />
          </View>
        </View>
      </PageFrame>
    </View>
  );
}

function Field({
  label,
  helper,
  children,
  containerStyle,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
      {children}
    </View>
  );
}

function buildForm(user?: User | null): ProfileFormState {
  return {
    name: user?.name || '',
    email: user?.email || '',
    city: user?.city || '',
    address: user?.address || user?.adress || '',
    language: user?.settings?.language || '',
  };
}

function getAvatarSource(profilePhotoUrl: string): ImageSourcePropType {
  if (!profilePhotoUrl.trim()) {
    return DefaultAvatar;
  }

  return { uri: profilePhotoUrl.trim() };
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase();
}

function formatPhone(value: string) {
  if (!value) return '+91 98765 43210';
  const digits = value.replace(/[^\d+]/g, '').trim();
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+91 ${digits}`;
  return value;
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
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 18,
  },
  heroCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#d8b9a8',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initialsFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  initialsText: {
    color: COLORS.textPrimary,
    fontWeight: '900',
    fontSize: 18,
  },
  cameraBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.button,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },
  heroText: {
    flex: 1,
    paddingLeft: 14,
  },
  heroName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  heroSubtext: {
    marginTop: 6,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  formCard: {
    marginTop: 14,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.64)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.76)',
    padding: 16,
    shadowColor: '#d8b9a8',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
  },
  halfField: {
    flex: 1,
  },
  halfFieldRight: {
    marginLeft: 12,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  helper: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: -4,
    marginBottom: 8,
    lineHeight: 16,
  },
  input: {
    minHeight: 44,
    borderRadius: SPACING.controlRadius,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.inputBg,
    color: '#2b3141',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  readOnlyField: {
    minHeight: 44,
    borderRadius: SPACING.controlRadius,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  readOnlyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
  },
});
