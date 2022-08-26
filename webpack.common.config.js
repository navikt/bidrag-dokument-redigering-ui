const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const { ESBuildMinifyPlugin } = require("esbuild-loader");
const CopyPlugin = require("copy-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const deps = require("./package.json").dependencies;

module.exports = {
    entry: {
        dokument_redigering: "/src/pages/redigeringsklient/index.tsx",
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "./dist"),
    },
    experiments: {
        topLevelAwait: true,
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", "jsx"],
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                include: path.resolve(__dirname, "src"),
                use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
            },
            {
                test: /\.(ts|tsx)?$/,
                loader: "esbuild-loader",
                options: {
                    minify: true,
                    loader: "tsx", // Remove this if you're not using JSX
                    target: "esnext", // Syntax to compile to (see options below for possible values)
                },
            },
            {
                test: /\.less$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "less-loader",
                        options: {
                            lessOptions: {
                                paths: [path.resolve(__dirname, "node_modules")],
                            },
                        },
                    },
                ],
            },
            {
                test: /\.svg$/,
                loader: "svg-inline-loader",
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            ignoreOrder: true,
        }),
        new ModuleFederationPlugin({
            name: "bidrag_redigering_ui",
            filename: "remoteEntry.js",
            exposes: {
                "./DokumentRedigering": "./src/pages/redigeringsklient/DokumentRedigeringPage.tsx",
            },
            shared: {
                react: { singleton: true, requiredVersion: deps.react },
                "react-dom": { singleton: true, requiredVersion: deps.react },
            },
        }),
    ],
};
