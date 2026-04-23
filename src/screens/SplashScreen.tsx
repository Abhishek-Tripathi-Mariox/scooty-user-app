import { SafeAreaView, StyleSheet, View } from 'react-native';
import { AppBackground } from '../components/AppBackground';
import { BrandHeader } from '../components/BrandHeader';

export function SplashScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground variant="auth" />
      <View style={styles.content}>
        <BrandHeader />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffd1b0',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
