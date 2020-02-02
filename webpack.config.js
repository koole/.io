const MinifyPlugin = require("babel-minify-webpack-plugin")
const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: ["./src/index.ts"],
  output: {
    filename: "bundle.js",
    path: __dirname + "/public",
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "babel-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new MinifyPlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, 'public')
  }
};