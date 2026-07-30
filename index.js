import { AppRegistry, Image, Platform, StatusBar, StyleSheet, View } from 'react-native';
import App from './App';

// The app window draws edge-to-edge (behind the transparent status and
// navigation bars). This root wrapper paints the shared background across
// the FULL screen — including behind the system bars — and then pads the
// actual app content below the status bar so headers and back buttons
// stay fully tappable.
// Android 15+ (API 35) forces edge-to-edge, so only there does the content
// need to be pushed below the status bar; older Androids already inset it.
const IS_EDGE_TO_EDGE = Platform.OS === 'android' && Number(Platform.Version) >= 35;
const STATUS_BAR_HEIGHT = IS_EDGE_TO_EDGE ? StatusBar.currentHeight ?? 0 : 0;

function Root() {
  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <Image
        source={require('./src/assets/images/userbackground.png')}
        style={styles.background}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <App />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  content: {
    flex: 1,
    paddingTop: STATUS_BAR_HEIGHT,
  },
});

AppRegistry.registerComponent('App', () => Root);
