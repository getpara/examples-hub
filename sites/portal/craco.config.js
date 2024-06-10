const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env }) => {
      if (env === 'production') {
        // disable source maps in production
        webpackConfig.devtool = false;
      }

      // ts-loader is required to reference external typescript projects/files (non-transpiled)
      webpackConfig.module.rules.push({
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          configFile: 'tsconfig.json',
        },
      });
      webpackConfig.resolve.fallback = {
        // crypto and stream needed for @celo/utils
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      };
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
      ];

      return webpackConfig;
    },
  },
};
