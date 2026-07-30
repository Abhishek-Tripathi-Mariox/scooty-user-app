import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { ArrowLeftIcon } from '../components/RideIcons';

function PinIcon({ size = 22, color = '#fc4c02' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9c0 4.9 6.05 11.55 6.3 11.83a1 1 0 0 0 1.4 0C12.95 20.55 19 13.9 19 9c0-3.87-3.13-7-7-7z"
        fill={color}
      />
      <Circle cx={12} cy={9} r={2.6} fill="#ffffff" />
    </Svg>
  );
}

function GpsIcon({ size = 20, color = '#fc4c02' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3.4} fill={color} />
      <Circle cx={12} cy={12} r={7} stroke={color} strokeWidth={1.8} />
      <Path
        d="M12 2v3M12 19v3M2 12h3M19 12h3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function EditLocationScreen({
  currentCity,
  loading = false,
  onBack,
  onSave,
  onUseCurrentLocation,
}: {
  currentCity?: string;
  loading?: boolean;
  onBack: () => void;
  onSave: (city: string, state?: string, coords?: { latitude: number; longitude: number }) => void;
  onUseCurrentLocation: () => void;
}) {
  const [search, setSearch] = useState('');
  const typedCity = search.trim();
  const isCurrent =
    !!typedCity && typedCity.toLowerCase() === (currentCity || '').trim().toLowerCase();

  return (
    <View style={styles.root}>
      <AppBackground variant="auth" />

      <View style={styles.topbar}>
        <Pressable onPress={onBack} style={styles.back} hitSlop={10}>
          <ArrowLeftIcon size={24} color="#0f172a" />
        </Pressable>
        <Text style={styles.heading}>Choose City</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Enter city name"
          placeholderTextColor="rgba(27,29,33,0.4)"
          autoCapitalize="words"
          autoFocus
          editable={!loading}
          selectionColor="#fc4c02"
          cursorColor="#fc4c02"
          style={styles.searchInput}
          returnKeyType="done"
          onSubmitEditing={() => typedCity && !loading && onSave(typedCity)}
        />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        <Pressable
          style={[styles.cityCard, styles.gpsCard]}
          onPress={onUseCurrentLocation}
          disabled={loading}
        >
          <View style={styles.pinWrap}>
            <GpsIcon size={22} />
          </View>
          <Text style={styles.gpsText}>
            {loading ? 'Updating location…' : 'Use my current location'}
          </Text>
        </Pressable>

        {currentCity?.trim() ? (
          <View style={[styles.cityCard, styles.cityCardSelected]}>
            <View style={styles.pinWrap}>
              <PinIcon size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>Current location</Text>
              <Text style={styles.cityText} numberOfLines={1}>
                {currentCity.trim()}
              </Text>
            </View>
            <Text style={styles.selectedMark}>✓</Text>
          </View>
        ) : null}

        {typedCity && !isCurrent ? (
          <Pressable
            style={styles.cityCard}
            onPress={() => onSave(typedCity)}
            disabled={loading}
          >
            <View style={styles.pinWrap}>
              <PinIcon size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>Set location to</Text>
              <Text style={styles.cityText} numberOfLines={1}>
                {typedCity}
              </Text>
            </View>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
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
    fontWeight: '600',
    lineHeight: 32,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchInput: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 20,
    color: '#1b1d21',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  cityCardSelected: {
    borderColor: '#fc4c02',
    backgroundColor: 'rgba(252,76,2,0.08)',
  },
  gpsCard: {
    borderColor: 'rgba(252,76,2,0.45)',
  },
  pinWrap: {
    width: 28,
    alignItems: 'center',
    marginRight: 14,
  },
  cardLabel: {
    color: '#4a5565',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  cityText: {
    color: '#101828',
    fontSize: 17,
    fontWeight: '600',
  },
  gpsText: {
    flex: 1,
    color: '#fc4c02',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedMark: {
    color: '#fc4c02',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});
