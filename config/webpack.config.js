"use strict";
const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");

const isDev = process.env["NODE_ENV"] === "development";

const paths = require("./paths");

console.log("Webpack build", isDev ? "[development]" : "[production]");

module.exports = {
  mode: isDev ? "development" : "production",

  devtool: "source-map",

  devServer: {
    hot: isDev,
    historyApiFallback: true,
  },

  entry: {
    client: [path.join(paths.appSrc, "./index.tsx")],
  },

  output: {
    filename: "[name].[hash].bundle.js",
    path: paths.appBuild,
    publicPath: isDev ? "/" : paths.publicPath,
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
      "@": paths.appSrc,
    },
  },

  module: {
    rules: [
      // Process source maps in input sources
      //  All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.(jsx?|tsx?)$/,
        loader: "source-map-loader",
        include: [/src\/.+\.tsx?/],
      },

      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
        exclude: [/\.worker\.ts$/],
      },

      {
        test: /\.worker\.ts$/,
        use: "ts-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(paths.appSrc, "index.ejs"),
    }),
  ].filter((x) => x),

  optimization: {
    splitChunks: {
      chunks: "all",
    },
    runtimeChunk: true,
    minimize: !isDev,
  },
};
