import webpack from "webpack";
import { merge } from "webpack-merge";

import webpackCommon from "./webpack.common.config.mjs";
const { EnvironmentPlugin } = webpack;

export default merge(webpackCommon, {
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
