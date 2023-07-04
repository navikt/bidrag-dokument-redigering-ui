export async function initMock() {
    if (process.env.NODE_ENV === "development" && process.env.ENABLE_MOCK == "true") {
        const { worker } = require("../mock/browser");
        worker
            .start({
                onUnhandledRequest: "warn",
                waitUntilReady: true,
                serviceWorker: {
                    url: `/mockServiceWorker.js`,
                    options: {
                        scope: "/",
                    },
                },
            })
            .then(console.log)
            .catch((e) => console.log(e));
    }
}
