export async function initMock() {
    if (process.env.NODE_ENV === "development" && process.env.ENABLE_MOCK == "true") {
        const { worker } = require("./browser");
        await worker
            .start({
                onUnhandledRequest: "warn",
                waitUntilReady: true,
                serviceWorker: {
                    url: `/api/external/assets/?url=http://localhost:5173/mockServiceWorker.js`,
                    options: {
                        scope: "/",
                    },
                },
            })
            .then(console.log)
            .catch((e) => console.log(e));
    }
}
