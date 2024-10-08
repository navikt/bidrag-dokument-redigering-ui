const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const deps = require("./package.json").dependencies;
const { EsbuildPlugin } = require("esbuild-loader");

module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "[name].[fullhash].js",
        path: path.resolve(__dirname, "./dist"),
    },
    experiments: {
        topLevelAwait: true,
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".jsx", ".mjs"],
        fallback: {
            fs: false,
        },
    },
    // optimization: {
    //     minimizer: [
    //         new EsbuildPlugin({
    //             target: "es2022",
    //             minify: false,
    //             format: "esm",
    //             minifyIdentifiers: false,
    //             minifyWhitespace: true,
    //             minifySyntax: false,
    //             globalName: "bidrag_dokument_redigering_ui",
    //             css: true,
    //             exclude: [new RegExp("(.*)worker(.*)")],
    //             keepNames: true,
    //         }),
    //     ],
    // },
    optimization: {
        minimizer: [
            (compiler) => {
                const TerserPlugin = require("terser-webpack-plugin");
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            passes: 2,
                        },
                        mangle: false,
                    },
                }).apply(compiler);
            },
        ],
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /\.lazy\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
            },
            {
                test: /\.lazy\.css$/i,
                use: [{ loader: "style-loader", options: { injectType: "lazyStyleTag" } }, "css-loader"],
            },
            {
                test: /\.(png|jpg|gif|mov|icc)$/i,
                type: "asset/inline",
            },
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false,
                },
            },
            {
                test: /\.mdx?$/,
                use: [
                    {
                        loader: "@mdx-js/loader",
                        /** @type {import('@mdx-js/loader').Options} */
                        options: {
                            providerImportSource: "@mdx-js/react",
                        },
                    },
                ],
            },
            {
                test: /\.([jt]sx?)?$/,
                exclude: /node_modules/,
                loader: "esbuild-loader",
                options: {
                    target: "ESNext",
                },
            },
            {
                test: /\.svg$/,
                loader: "svg-inline-loader",
            },
            {
                test: /\.pdf.worker.mjs/,
                type: "asset/resource",
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: "process/browser",
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].[fullhash].css",
            ignoreOrder: true,
        }),
        new ModuleFederationPlugin({
            name: "bidrag_dokument_redigering_ui",
            filename: "remoteEntry.js",
            exposes: {
                "./DokumentRedigering": "./src/app.tsx",
                "./DokumentMaskering": "./src/pages/dokumentmaskering/DokumentMaskeringPage.tsx",
            },
            shared: {
                react: { singleton: true, requiredVersion: deps.react },
                "react-dom": { singleton: true, requiredVersion: deps.react },
            },
        }),
        new CopyPlugin({
            patterns: [{ from: "node_modules/pdfjs-dist/build/pdf.worker.mjs", to: "" }],
        }),
    ],
};
