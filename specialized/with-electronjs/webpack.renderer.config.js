const rules = require("./webpack.rules");
const webpack = require("webpack");
const path = require("path");

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

module.exports = {
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".jsx"],
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
      vm: require.resolve("vm-browserify"),
      process: require.resolve("process/browser.js"),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser.js",
    }),
  ],
  output: {
    path: path.resolve(__dirname, ".webpack/renderer"),
    filename: "index.js",
  },
};
