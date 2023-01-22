const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  devtool: "source-map",
  entry: {
    index: "./page/index.ts",
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist_page"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "page", "index.html"),
    }),
  ],
  module: {
    parser: {
      javascript: {
      }
    },
    rules: [
      {
        test: /\.ts$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/", path.resolve(__dirname, 'src/wasm/native/assembly_module/')],
        options: {
          configFile: path.resolve(__dirname, "tsconfig.web.json"),
        },
      },
      {
        test: /\.js$/,
        type: "javascript/auto",
      },
      {
        test: /\.js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", "..."],
  },
  stats: {
    logging: "log",
    loggingDebug: ["emscripten-loader"],
  },
  devServer: {
    static: path.join(__dirname, "dist_page"),
    compress: true,
    port: 8080,
    open: true,
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
