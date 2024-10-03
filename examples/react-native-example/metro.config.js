const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const nodeLibs = require('node-libs-react-native');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '../..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  projectRoot,
  watchFolders: [workspaceRoot],
  resolver: {
    extraNodeModules: {
      ...nodeLibs,
      'crypto': require.resolve('react-native-quick-crypto'),
      'buffer': require.resolve('@craftzdog/react-native-buffer'),
      'process': require.resolve('process/browser'),
      '@usecapsule/react-native-wallet': path.resolve(workspaceRoot, 'node_modules/@usecapsule/react-native-wallet'),
    },
    nodeModulesPaths: [path.resolve(projectRoot, 'node_modules'), path.resolve(workspaceRoot, 'node_modules')],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
