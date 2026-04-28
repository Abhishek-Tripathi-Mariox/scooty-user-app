import { Image, StyleSheet, View } from 'react-native';

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
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
