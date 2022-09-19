import React from "react";
import { useEffect, useState } from "react";

import LoadingIndicator from "../../components/LoadingIndicator";
import { PdfDocumentType } from "../../components/pdfview/types";
import DokumentService from "../../service/DokumentService";
import PageWrapper from "../PageWrapper";
import DokumentRedigeringContainer from "./DokumentRedigeringContainer";

const url = "http://localhost:5173/test4.pdf";

interface DokumentRedigeringPageProps {
    journalpostId: string;
    dokumentreferanse?: string;
    dokumenter?: string[];
}

export default function DokumentRedigeringPage({
    journalpostId,
    dokumentreferanse,
    dokumenter,
}: DokumentRedigeringPageProps) {
    const [isLoading, setIsLoading] = useState(true);

    const [document, setDocument] = useState<PdfDocumentType>();
    useEffect(() => {
        lastDokument();
    }, []);

    async function lastDokument() {
        if (dokumenter && dokumenter.length > 0) {
            await new DokumentService()
                .getDokumenter(dokumenter, true, false)
                .then((doc) => (doc instanceof Blob ? doc.arrayBuffer() : doc))
                .then(setDocument)
                .finally(() => setIsLoading(false));
        } else if (journalpostId) {
            await new DokumentService()
                .getDokument(journalpostId, dokumentreferanse, true, false)
                .then((doc) => (doc instanceof Blob ? doc.arrayBuffer() : doc))
                .then(setDocument)
                .finally(() => setIsLoading(false));
        }
    }

    return (
        <PageWrapper name={"dokumentredigering"}>
            <DokumentRedigering isLoading={isLoading} isError={!isLoading && !document} document={document} />
        </PageWrapper>
    );
}

interface DokumentRedigeringProps {
    document: PdfDocumentType;
    isLoading: boolean;
    isError: boolean;
}
function DokumentRedigering({ isLoading, isError, document }: DokumentRedigeringProps) {
    if (isLoading) {
        return <LoadingIndicator title="Laster dokument..." />;
    }

    if (isError) {
        return <div>Det skjedde en feil ved lasting av dokument</div>;
    }

    return <DokumentRedigeringContainer document={document} />;
}
