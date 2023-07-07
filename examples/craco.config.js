module.exports = {
  webpack: {
    configure: webpackConfig => {

      // ts-loader is required to reference external typescript projects/files (non-transpiled)
      webpackConfig.module.rules.push({
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          configFile: 'tsconfig.json',
        },
      })
      webpackConfig.resolve.fallback = {
        // crypto and stream needed for @celo/utils
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "url" : false,
        "zlib": false,
        "https": false,
        "http": false,
      }

      return webpackConfig;
    },
  }
};
