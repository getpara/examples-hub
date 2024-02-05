const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    'mpcWorker': './dist/workers/worker.js',
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
    }),
  ],
  mode: 'production'
};
