import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
    const app = express();

    // Create Vite server in middleware mode and configure the app type as
    // 'custom', disabling Vite's own HTML serving logic so parent server
    // can take control
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "custom",
        publicDir: "dist",
    });

    // use vite's connect instance as middleware
    // if you use your own express router (express.Router()), you should use router.use
    app.use(vite.middlewares);

    app.listen(5173);
}

createServer();
