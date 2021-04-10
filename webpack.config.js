const path = require("path");
const webpack = require("webpack");

const autoprefixer = require("autoprefixer");
const precss = require("precss");
const atImport = require("postcss-import");
const cssnano = require("cssnano");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const TerserPlugin = require("terser-webpack-plugin");

const isDev = process.env.NODE_ENV == "development";

module.exports = {
  mode: isDev ? "development" : "production",
  entry: {
    main: "./src/index.ts",
    vwclient: "./src/vw-client.worker.ts",
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new MiniCssExtractPlugin({ filename: "main.css" }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "babel-loader",
        include: [path.resolve(__dirname, "src")],
        exclude: ["/node_modules/"],
      },
      {
        test: /.p?css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              sourceMap: isDev,
              url: false,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  atImport,
                  precss,
                  autoprefixer,
                  cssnano({ preset: "default" }),
                ],
                minimize: !isDev,
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
  },
  output: {
    path: path.resolve(__dirname, "public"),
  },
  optimization: {
    minimize: !isDev,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
    splitChunks: {
      cacheGroups: {
        vendors: {
          priority: -10,
          test: /[\\/]node_modules[\\/]/,
        },
      },
      chunks: "async",
      minChunks: 1,
      minSize: 30000,
      name: false,
    },
  },
  devServer: {
    contentBase: path.join(__dirname, "public"),
    port: 9000,
  },
};
