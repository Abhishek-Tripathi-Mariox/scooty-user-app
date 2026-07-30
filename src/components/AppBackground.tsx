import { Image, StyleSheet, View } from 'react-native';
import { STATUS_TOP_INSET } from '../utils/statusBarInset';

type BackgroundVariant = 'default' | 'auth' | 'otp' | 'splash';

export function AppBackground(_props: { variant?: BackgroundVariant } = {}) {
  return (
    <View pointerEvents="none" style={styles.base}>
      <Image
        source={require('../assets/images/userbackground.png')}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    // Bleed the background up underneath the transparent status bar so the
    // screen's own backdrop fills the entire display, edge to edge.
    top: -STATUS_TOP_INSET,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
