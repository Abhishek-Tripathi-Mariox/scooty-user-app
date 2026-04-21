const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const {assetExts, sourceExts} = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 */
const config = {
  resetCache: true,
  assetRegistryPath: require.resolve(
    '@react-native/assets-registry/registry',
  ),
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer/react-native'),
    assetRegistryPath: require.resolve('@react-native/assets-registry/registry'),
  },
};

module.exports = mergeConfig(defaultConfig, config);
