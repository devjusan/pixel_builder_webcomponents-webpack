const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const path = require("path");
const deps = require("./package.json").dependencies;

module.exports = ({ env }, argv) => ({
  entry: "./src/index.js",
  output: {
    filename: "[name].[fullhash].js",
    path: path.resolve(__dirname, "dist"),
  },
  target: "web",
  resolve: {
    extensions: [".js", ".html", ".css", ".svg"],
    alias: {
      Assets: path.resolve(__dirname, "src/pixel/dependencies/assets"),
    },
    preferRelative: true,
  },
  devtool:
    argv.mode === "production" ? "cheap-source-map" : "inline-source-map",
  devServer: {
    static: "./dist",
    devMiddleware: { writeToDisk: true },
    port: 8080,
    allowedHosts: "all",
    compress: true,
    hot: true,
    historyApiFallback: true,
    allowedHosts: "all",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["raw-loader"],
      },
      { test: /\.html$/, use: ["raw-loader"] },
      {
        test: /\.svg/,
        use: {
          loader: "svg-inline-loader",
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new WebpackManifestPlugin(),
    new ModuleFederationPlugin({
      name: "PixelBuilderValuation",
      filename: "remoteEntry.js",
      exposes: {
        PixelBuilderValuation: "./src/pixelBuilderMFE.js",
        "./PixelBuilderValuation": "./src/pixelBuilderMFE.js",
      },
      shared: { ...deps },
    }),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "index.html",
    }),
    new Dotenv({
      path: `./.env`,
    }),
  ],
  optimization: {
    minimize: argv.mode === "production",
    // runtimeChunk: "single",
  },
});
