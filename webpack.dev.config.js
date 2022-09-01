const { merge } = require("webpack-merge");
const webpackCommon = require("./webpack.common.config.js");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { EnvironmentPlugin } = require("webpack");

module.exports = merge(webpackCommon, {
    mode: "development",
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
        new EnvironmentPlugin({
            ENABLE_MOCK: "",
        }),
    ],
});
