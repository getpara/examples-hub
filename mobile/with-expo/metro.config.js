const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  crypto: require.resolve("react-native-quick-crypto"),
  buffer: require.resolve("@craftzdog/react-native-buffer"),
  stream: require.resolve("readable-stream"),
};

module.exports = config;
