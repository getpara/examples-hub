const webpack = require('webpack');
const CracoAliasPlugin = require('craco-alias');

module.exports = {
  plugins: [
    {
      plugin: CracoAliasPlugin,
      options: {
        source: 'options',
        aliases: {
          '@tanstack/react-query': '../../node_modules/@tanstack/react-query',
        },
      },
    },
  ],
  babel: {
    plugins: [
      // some plugins needed for ethers providers to work
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ['@babel/plugin-transform-classes', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    ],
  },
  webpack: {
    configure: webpackConfig => {
      // Remove import from src restriction so we can alias the proper @tanstack/react-query package
      // Partners won't have to do this, we have two versions of react-query in the monorepo due to the Wagmi V1 integration
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(({ constructor }) => {
        return constructor && constructor.name === 'ModuleScopePlugin';
      });

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);

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
        test: /\.m?js/, // fix:issue: https://github.com/webpack/webpack/issues/11467
        resolve: {
          fullySpecified: false,
        },
      });
      webpackConfig.resolve.fallback = {
        // crypto and stream needed for @celo/utils
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        vm: require.resolve('vm-browserify'),
        url: false,
        zlib: false,
        https: false,
        http: false,
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
