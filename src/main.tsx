import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import DokumentRedigeringPage from "./pages/dokumentredigering/DokumentRedigeringPage";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/rediger/:journalpostId" element={<DokumentRedigeringPage journalpostId={""} />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
