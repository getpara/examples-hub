const webpack = require("webpack");
const path = require("path");

module.exports = {
  entry: "./src/main.js",
  module: {
    rules: require("./webpack.rules"),
  },
  resolve: {
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
      vm: require.resolve("vm-browserify"),
      process: require.resolve("process/browser"),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    }),
  ],
  output: {
    path: path.resolve(__dirname, ".webpack/main"),
    filename: "index.js",
  },
};
