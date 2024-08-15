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

      webpackConfig.module.rules.push({
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      });

      webpackConfig.resolve.fallback = {
        // crypto and stream needed for @celo/utils
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('stream-http'),
        zlib: require.resolve('browserify-zlib'),
        url: require.resolve('url/'),
        vm: false,
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
