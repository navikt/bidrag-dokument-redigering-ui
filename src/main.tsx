import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import DokumentRedigeringPage from "./pages/redigeringsklient/DokumentRedigeringPage";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <DokumentRedigeringPage journalpostId={""} />
    </React.StrictMode>
);
