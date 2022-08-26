import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
    const app = express();

    app.use("*", express.static(path.join(__dirname, "/dist/")));
    app.listen(5173);
}

createServer();
