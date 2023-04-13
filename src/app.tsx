import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";

import DokumentMaskeringPage from "./pages/dokumentmaskering/DokumentMaskeringPage";
import DokumentRedigeringPage from "./pages/dokumentredigering/DokumentRedigeringPage";

// This file is only used for development. The entrypoint is under pages folder

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/rediger/:journalpostId" element={<DokumentRedigeringPageWrapper />} />
                <Route
                    path="/rediger/masker/:forsendelseId/:dokumentreferanse"
                    element={<DokumentMaskeringPageWrapper />}
                />
                <Route path="/" element={<div>Hello world</div>} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

function DokumentRedigeringPageWrapper() {
    const { journalpostId } = useParams();
    return <DokumentRedigeringPage journalpostId={journalpostId} />;
}

function DokumentMaskeringPageWrapper() {
    const { forsendelseId, dokumentreferanse } = useParams();
    return <DokumentMaskeringPage forsendelseId={forsendelseId} dokumentreferanse={dokumentreferanse} />;
}
