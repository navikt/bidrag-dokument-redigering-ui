import React from "react";

import { lastDokumenter } from "../../api/queries";
import PageWrapper from "../PageWrapper";
import DokumentMaskering from "./DokumentMaskering";

const url = "http://localhost:5173/test4.pdf";

interface DokumentMaskeringPageProps {
    forsendelseId: string;
    dokumentreferanse: string;
}

export default function DokumentMaskeringPage(props: DokumentMaskeringPageProps) {
    return (
        <PageWrapper name={"dokumentredigering"}>
            <DokumentMaskeringContainer {...props} />
        </PageWrapper>
    );
}

function DokumentMaskeringContainer({ forsendelseId, dokumentreferanse }: DokumentMaskeringPageProps) {
    const { data: documentFile, isFetching } = lastDokumenter(forsendelseId, dokumentreferanse, null, true, false);
    return (
        <DokumentMaskering
            documentFile={documentFile}
            isLoading={isFetching}
            forsendelseId={forsendelseId}
            dokumentreferanse={dokumentreferanse}
        />
    );
}
