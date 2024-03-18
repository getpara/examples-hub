const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    'mpcWorker': './dist/worker.js',
  },
  output: {
    filename: '[name]-bundle.js', // This will be replaced with each entry point key
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimize: true,
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      'DISABLE_WASM_FETCH': 'false',
      'NODE_DEBUG': 'false',
    }),
  ],
  resolve: {
    fallback: {
      assert: require.resolve("assert"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
    },
  },
  mode: 'production',
};
