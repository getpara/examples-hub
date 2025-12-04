// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Para SDK requires crypto and buffer polyfills
config.resolver.extraNodeModules = {
  crypto: require.resolve('react-native-quick-crypto'),
  buffer: require.resolve('@craftzdog/react-native-buffer'),
};

module.exports = withNativeWind(config, { input: './global.css' });
