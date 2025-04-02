const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      crypto: require.resolve("react-native-quick-crypto"),
      buffer: require.resolve("@craftzdog/react-native-buffer"),
      stream: require.resolve("readable-stream"),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
