import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import Dotenv from "dotenv-webpack";
import fs from "fs";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";
import { merge } from "webpack-merge";

import webpackCommon from "./webpack.common.config.mjs";
const { EnvironmentPlugin } = webpack;
export default (env) => {
    const customenvfile = `env/${env.envfile}`;
    const envfile = fs.existsSync(customenvfile) ? customenvfile : "env/.env.local";
    return merge(webpackCommon, {
        mode: "development",
        devtool: "source-map",
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
            new Dotenv({ path: envfile }),
            new ReactRefreshWebpackPlugin(),
            new HtmlWebpackPlugin({
                publicPath: "/",
                template: "./src/index.html",
            }),
            new EnvironmentPlugin({
                ENABLE_MOCK: "",
            }),
        ],
    });
};
