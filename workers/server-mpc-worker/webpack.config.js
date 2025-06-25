const path = require('path');
const webpack = require('webpack');

// Common configuration shared between CJS and ESM builds
const getCommonConfig = () =>
  /** @type {import('webpack').Configuration} */ ({
    entry: {
      mpcWorkerServer: './dist/worker.js',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      fallback: {
        vm: false,
      },
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
    mode: 'production',
    target: 'node',
  });

// CJS configuration (original)
const cjsConfig = getCommonConfig();
cjsConfig.output = {
  filename: '[name]-bundle.js',
  path: path.resolve(__dirname, 'dist'),
};
cjsConfig.externals = {
  worker_threads: 'commonjs worker_threads',
};

// ESM configuration
const esmConfig = getCommonConfig();
esmConfig.output = {
  filename: '[name]-esm.js',
  path: path.resolve(__dirname, 'dist'),
  library: {
    type: 'module',
  },
  chunkFormat: 'module',
  module: true,
};
esmConfig.experiments = {
  outputModule: true,
};
esmConfig.externals = {
  worker_threads: 'module worker_threads',
};
esmConfig.target = ['node', 'es2020'];

/** @type {import('webpack').Configuration[]} */
module.exports = [cjsConfig, esmConfig];
