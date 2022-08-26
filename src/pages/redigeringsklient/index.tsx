import Navspa from "@navikt/navspa";
import React from "react";

import DokumentRedigeringPage from "./DokumentRedigeringPage";

interface DokumentRedigeringProps {
    journalpostId: string;
    dokumentreferanse?: string;
    dokumenter?: string[];
    sessionState: string;
    paloggetEnhet: string;
}

function DokumentRedigering(props: DokumentRedigeringProps) {
    return <DokumentRedigeringPage {...props} />;
}

Navspa.eksporter("dokument_redigering", DokumentRedigeringPage);
