const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    mpcWorkerServer: './dist/worker.js',
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
      NODE_DEBUG: 'false',
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  resolve: {
    fallback: {
      vm: false,
    },
  },
  externals: {
    worker_threads: 'commonjs worker_threads',
  },
  mode: 'production',
  target: 'node',
};
