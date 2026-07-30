import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { ArrowLeftIcon } from '../components/RideIcons';
import { MapPinIcon } from '../components/HomeIcons';

const CITIES = [
  'Bengaluru, Karnataka',
  'Mumbai, Maharashtra',
  'Delhi, Delhi',
  'Hyderabad, Telangana',
  'Chennai, Tamil Nadu',
  'Pune, Maharashtra',
  'Kolkata, West Bengal',
  'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan',
  'Surat, Gujarat',
  'Lucknow, Uttar Pradesh',
  'Kanpur, Uttar Pradesh',
  'Nagpur, Maharashtra',
  'Indore, Madhya Pradesh',
  'Bhopal, Madhya Pradesh',
  'Visakhapatnam, Andhra Pradesh',
  'Patna, Bihar',
  'Vadodara, Gujarat',
  'Ghaziabad, Uttar Pradesh',
  'Ludhiana, Punjab',
  'Coimbatore, Tamil Nadu',
  'Agra, Uttar Pradesh',
  'Madurai, Tamil Nadu',
  'Nashik, Maharashtra',
  'Faridabad, Haryana',
  'Meerut, Uttar Pradesh',
  'Rajkot, Gujarat',
  'Varanasi, Uttar Pradesh',
  'Srinagar, Jammu and Kashmir',
  'Aurangabad, Maharashtra',
  'Amritsar, Punjab',
  'Allahabad, Uttar Pradesh',
  'Ranchi, Jharkhand',
  'Howrah, West Bengal',
  'Jabalpur, Madhya Pradesh',
  'Gwalior, Madhya Pradesh',
  'Vijayawada, Andhra Pradesh',
  'Jodhpur, Rajasthan',
  'Raipur, Chhattisgarh',
  'Kota, Rajasthan',
  'Chandigarh, Chandigarh',
  'Guwahati, Assam',
  'Solapur, Maharashtra',
  'Hubli, Karnataka',
  'Mysore, Karnataka',
  'Tiruchirappalli, Tamil Nadu',
  'Bareilly, Uttar Pradesh',
  'Aligarh, Uttar Pradesh',
  'Tiruppur, Tamil Nadu',
  'Gurgaon, Haryana',
  'Noida, Uttar Pradesh',
  'Thiruvananthapuram, Kerala',
  'Kochi, Kerala',
  'Dehradun, Uttarakhand',
  'Jamshedpur, Jharkhand',
];

export function CityPickerScreen({
  onBack,
  currentCity,
  onSelect,
}: {
  onBack: () => void;
  currentCity?: string;
  onSelect: (city: string) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter((c) => c.toLowerCase().includes(q));
  }, [search]);

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>Choose City</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search city or state"
          placeholderTextColor="rgba(15,23,42,0.4)"
          style={styles.searchInput}
          autoCorrect={false}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No cities match your search.</Text>
        ) : (
          filtered.map((city) => {
            const isCurrent = city === currentCity;
            return (
              <Pressable
                key={city}
                style={[styles.row, isCurrent && styles.rowActive]}
                onPress={() => onSelect(city)}
              >
                <MapPinIcon size={18} />
                <Text style={[styles.rowText, isCurrent && styles.rowTextActive]} numberOfLines={1}>
                  {city}
                </Text>
                {isCurrent ? <Text style={styles.currentTag}>Current</Text> : null}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
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
    marginLeft: 8,
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 32,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  searchInput: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    color: '#0f172a',
    fontSize: 15,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  rowActive: {
    borderColor: '#fc4c02',
    backgroundColor: 'rgba(252, 76, 2, 0.08)',
  },
  rowText: {
    flex: 1,
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '500',
  },
  rowTextActive: {
    color: '#fc4c02',
  },
  currentTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fc4c02',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  emptyText: {
    paddingVertical: 28,
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
  },
});
