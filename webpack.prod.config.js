const { merge } = require("webpack-merge");
const webpackCommon = require("./webpack.common.config.js");
const { EnvironmentPlugin } = require("webpack");

module.exports = merge(webpackCommon, {
    mode: "production",
    plugins: [
        // Defined as variable: default-value
        new EnvironmentPlugin({
            STATIC_FILES_URL: "",
            BIDRAG_DOKUMENT_URL: "",
            BIDRAG_DOKUMENT_FORSENDELSE_URL: "",
            VALIDATE_PDF: "false",
            ENABLE_DEBUG_PAGE: "false",
        }),
    ],
});
