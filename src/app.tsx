import "./index.css";

import React from "react";
import { BrowserRouter, Route, Routes, useParams, useSearchParams } from "react-router-dom";

import environment from "./environment";
import DebugPage from "./pages/debug/DebugPage";
import DokumentMaskeringPage from "./pages/dokumentmaskering/DokumentMaskeringPage";
import DokumentRedigeringPage from "./pages/dokumentredigering/DokumentRedigeringPage";
const SkjemaUtfyllingPage = React.lazy(() => import("./pages/skjemutfylling/SkjemaUtfyllingPage"));

// This file is only used for development. The entrypoint is under pages folder

export default function App() {
    return (
        <React.StrictMode>
            <BrowserRouter>
                <Routes>
                    <Route path="/rediger/" element={<DokumentRedigeringPageWrapper />} />
                    <Route path="/rediger/:journalpostId" element={<DokumentRedigeringPageWrapper />} />
                    <Route
                        path="/rediger/:journalpostId/:dokumentreferanse"
                        element={<DokumentRedigeringPageWrapper />}
                    />
                    <Route
                        path="/rediger/masker/:forsendelseId/:dokumentreferanse"
                        element={<DokumentMaskeringPageWrapper />}
                    />
                    <Route
                        path="/rediger/skjemautfylling/:forsendelseId/:dokumentreferanse"
                        element={<SkjemaUtfyllingPageWrapper />}
                    />
                    {environment.feature.debugPage && (
                        <Route path="/rediger/debug/:forsendelseId/:dokumentreferanse" element={<DebugWrapper />} />
                    )}
                </Routes>
            </BrowserRouter>
        </React.StrictMode>
    );
}

function DokumentRedigeringPageWrapper() {
    const [params, _] = useSearchParams();
    const { journalpostId, dokumentreferanse } = useParams<{ journalpostId: string; dokumentreferanse: string }>();
    return (
        <DokumentRedigeringPage
            journalpostId={journalpostId!}
            dokumentreferanse={dokumentreferanse}
            dokumenter={params.getAll("dokument")}
        />
    );
}

function DokumentMaskeringPageWrapper() {
    const { forsendelseId, dokumentreferanse } = useParams();
    return <DokumentMaskeringPage forsendelseId={forsendelseId} dokumentreferanse={dokumentreferanse} />;
}

function SkjemaUtfyllingPageWrapper() {
    const { forsendelseId, dokumentreferanse } = useParams();
    return <SkjemaUtfyllingPage forsendelseId={forsendelseId} dokumentreferanse={dokumentreferanse} />;
}

function DebugWrapper() {
    const { forsendelseId, dokumentreferanse } = useParams();

    return <DebugPage forsendelseId={forsendelseId} dokumentreferanse={dokumentreferanse} />;
}
