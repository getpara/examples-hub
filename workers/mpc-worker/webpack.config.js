const path = require('path');
const webpack = require('webpack');

module.exports = {
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  entry: {
    mpcWorker: './dist/worker.js',
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
    splitChunks: false,
    runtimeChunk: false,
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      DISABLE_WASM_FETCH: 'false',
      NODE_DEBUG: 'false',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      vm: false,
    },
  },
  mode: 'production',
};
