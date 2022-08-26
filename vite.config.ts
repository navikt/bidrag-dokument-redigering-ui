import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
console.log(__dirname);
const { dependencies } = require("./package.json");

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        federation({
            name: "bidrag_redigering_ui",
            filename: "remoteEntry.js",
            exposes: {
                "./DokumentRedigering": "./src/pages/redigeringsklient/DokumentRedigeringPage",
            },
            shared: ["react", "react-dom"],
        }),
    ],
    build: {
        manifest: "asset-manifest.json",
        target: "esnext",
        rollupOptions: {
            output: {
                format: "esm",
            },
        },
    },
});
