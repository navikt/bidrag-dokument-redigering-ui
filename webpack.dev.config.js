const { merge } = require("webpack-merge");
const webpackCommon = require("./webpack.common.config.js");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(webpackCommon, {
    mode: "development",
    devtool: "eval-source-map",
    devServer: {
        historyApiFallback: true,
        devMiddleware: {
            writeToDisk: true,
        },
        client: {
            webSocketTransport: "ws",
        },
        webSocketServer: "ws",
        port: 5173,
        hot: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
        },
    },
    plugins: [
        new Dotenv({ path: "env/.env.local" }),
        new HtmlWebpackPlugin({
            publicPath: "/",
            template: "./src/index.html",
        }),
    ],
});
