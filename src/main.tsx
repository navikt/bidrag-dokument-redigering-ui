import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";

import DokumentRedigeringPage from "./pages/dokumentredigering/DokumentRedigeringPage";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route
                    path="/rediger/:journalpostId"
                    element={(() => {
                        const { journalpostId } = useParams();
                        return <DokumentRedigeringPage journalpostId={journalpostId} />;
                    })()}
                />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
