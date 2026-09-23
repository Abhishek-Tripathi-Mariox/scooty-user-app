import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppBackground } from '../components/AppBackground';
import { ArrowLeftIcon, CheckIcon } from '../components/RideIcons';
import { useStyles } from '../utils/responsiveStyles';

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

function SearchIcon({ size = 20, color = '#6b7280' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={1.8} />
      <Path d="m16 16 4.5 4.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ClearIcon({ size = 18, color = '#9ca3af' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} fill={color} />
      <Path d="m9 9 6 6M15 9l-6 6" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

type Suggestion = {
  id: string;
  city: string;
  state?: string;
  displayLine: string;
  latitude: number;
  longitude: number;
};

type NominatimResult = {
  place_id: number | string;
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state_district?: string;
    state?: string;
    country?: string;
  };
};

// Free OpenStreetMap geocoding — same data source the in-app Leaflet map uses.
const SUGGEST_URL = 'https://nominatim.openstreetmap.org/search';
const SUGGEST_DEBOUNCE_MS = 400;

async function fetchCitySuggestions(query: string, signal: AbortSignal): Promise<Suggestion[]> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: query,
    addressdetails: '1',
    limit: '6',
    countrycodes: 'in',
    featuretype: 'settlement',
  });
  const res = await fetch(`${SUGGEST_URL}?${params.toString()}`, {
    signal,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'ScootyUserApp/1.0',
    },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimResult[];
  if (!Array.isArray(data)) return [];

  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const item of data) {
    const addr = item.address || {};
    const city = addr.city || addr.town || addr.village || item.name || '';
    if (!city) continue;
    const state = addr.state || addr.state_district;
    const dedupeKey = `${city.toLowerCase()}|${(state || '').toLowerCase()}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    const line = [addr.county && addr.county !== city ? addr.county : null, state, addr.country]
      .filter(Boolean)
      .join(', ');
    out.push({
      id: String(item.place_id),
      city,
      state,
      displayLine: line || item.display_name || '',
      latitude: Number(item.lat),
      longitude: Number(item.lon),
    });
  }
  return out;
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
  const styles = useStyles(RAW_STYLES);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const typedCity = search.trim();
  const isCurrent =
    !!typedCity && typedCity.toLowerCase() === (currentCity || '').trim().toLowerCase();

  // Debounced live suggestions while typing; stale requests are aborted so a
  // slow earlier response can never overwrite a newer query's results.
  useEffect(() => {
    abortRef.current?.abort();
    if (typedCity.length < 2) {
      setSuggestions([]);
      setSearching(false);
      setSearchDone(false);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await fetchCitySuggestions(typedCity, controller.signal);
        if (!controller.signal.aborted) {
          setSuggestions(results);
          setSearchDone(true);
          setSearching(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setSearchDone(true);
          setSearching(false);
        }
      }
    }, SUGGEST_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [typedCity]);

  const pickSuggestion = (s: Suggestion) => {
    if (loading) return;
    const hasCoords = Number.isFinite(s.latitude) && Number.isFinite(s.longitude);
    onSave(s.city, s.state, hasCoords ? { latitude: s.latitude, longitude: s.longitude } : undefined);
  };

  return (
    <SafeAreaView style={styles.root}>
      <AppBackground variant="auth" />

      <View style={styles.topbar}>
        <Pressable onPress={onBack} style={styles.back} hitSlop={10}>
          <ArrowLeftIcon size={24} color="#0f172a" />
        </Pressable>
        <Text style={styles.heading}>Choose City</Text>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <SearchIcon />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for your city"
            placeholderTextColor="rgba(27,29,33,0.4)"
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus
            editable={!loading}
            selectionColor="#fc4c02"
            cursorColor="#fc4c02"
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (loading) return;
              if (suggestions.length > 0) pickSuggestion(suggestions[0]);
              else if (typedCity) onSave(typedCity);
            }}
          />
          {searching ? (
            <ActivityIndicator size="small" color="#fc4c02" />
          ) : search.length > 0 ? (
            <Pressable onPress={() => setSearch('')} hitSlop={10}>
              <ClearIcon />
            </Pressable>
          ) : null}
        </View>
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

        {!typedCity && currentCity?.trim() ? (
          <View style={[styles.cityCard, styles.cityCardSelected, styles.currentCard]}>
            <View style={styles.pinWrap}>
              <PinIcon size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.currentLabel}>Current location</Text>
              <Text style={styles.currentCityText} numberOfLines={1}>
                {currentCity.trim()}
              </Text>
            </View>
            <CheckIcon size={20} color="#fc4c02" />
          </View>
        ) : null}

        {suggestions.length > 0 ? (
          <View style={styles.suggestionsCard}>
            <Text style={styles.suggestionsHeading}>Suggestions</Text>
            {suggestions.map((s, index) => (
              <Pressable
                key={s.id}
                style={[styles.suggestionRow, index > 0 && styles.suggestionDivider]}
                onPress={() => pickSuggestion(s)}
                disabled={loading}
                android_ripple={{ color: 'rgba(252,76,2,0.08)' }}
              >
                <View style={styles.suggestionPin}>
                  <PinIcon size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cityText} numberOfLines={1}>
                    {s.city}
                  </Text>
                  {s.displayLine ? (
                    <Text style={styles.suggestionSub} numberOfLines={1}>
                      {s.displayLine}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}

        {typedCity && searchDone && suggestions.length === 0 && !searching ? (
          <Text style={styles.noResults}>No matching city found — you can still set it manually below.</Text>
        ) : null}

        {typedCity && !isCurrent && suggestions.length === 0 && !searching ? (
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
    </SafeAreaView>
  );
}

const RAW_STYLES = {
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
  searchBox: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#1b1d21',
    fontSize: 16,
    paddingVertical: 0,
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
  suggestionsCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 6,
    overflow: 'hidden',
  },
  suggestionsHeading: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 2,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  suggestionDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  suggestionPin: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionSub: {
    color: '#6b7280',
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 1,
  },
  noResults: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  currentCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  currentLabel: {
    color: '#fc4c02',
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardLabel: {
    color: '#4a5565',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  currentCityText: {
    color: '#101828',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
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
} as const;
