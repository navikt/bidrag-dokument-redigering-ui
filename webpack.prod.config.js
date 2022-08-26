const { merge } = require("webpack-merge");
const webpackCommon = require("./webpack.common.config.js");
const { EnvironmentPlugin } = require("webpack");

module.exports = merge(webpackCommon, {
    mode: "production",
    plugins: [
        // Defined as variable: default-value
        new EnvironmentPlugin({
            BIDRAG_ORGANISASJON_URL: "",
            BIDRAG_DOKUMENT_URL: "",
            BIDRAG_DOKUMENT_ARKIVERING_URL: "",
            BIDRAG_PERSON_URL: "",
            BIDRAG_SAK_URL: "",
            BISYS_URL: "",
            BIDRAGDOKUMENTUI_URL: "",
        }),
    ],
});
