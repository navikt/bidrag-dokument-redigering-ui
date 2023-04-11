import { queryParams } from "@navikt/bidrag-ui-common";
import { BroadcastMessage } from "@navikt/bidrag-ui-common";
import { EditDocumentBroadcastMessage } from "@navikt/bidrag-ui-common";
import { Broadcast } from "@navikt/bidrag-ui-common";
import { FileUtils } from "@navikt/bidrag-ui-common";
import { BroadcastNames } from "@navikt/bidrag-ui-common";
import { EditDocumentConfig } from "@navikt/bidrag-ui-common";
import React from "react";
import { useEffect, useState } from "react";

import { lastDokumenter } from "../../api/queries";
import LoadingIndicator from "../../components/LoadingIndicator";
import PageWrapper from "../PageWrapper";
import DokumentRedigering from "./DokumentRedigering";

const url = "http://localhost:5173/test4.pdf";

interface DokumentRedigeringPageProps {
    journalpostId: string;
    dokumentreferanse?: string;
    dokumenter?: string[];
}

export default function DokumentRedigeringPage(props: DokumentRedigeringPageProps) {
    return (
        <PageWrapper name={"dokumentredigering"}>
            <DokumentRedigeringContainer {...props} />
        </PageWrapper>
    );
}

function DokumentRedigeringContainer({ journalpostId, dokumentreferanse, dokumenter }: DokumentRedigeringPageProps) {
    const [isLoading, setIsLoading] = useState(true);

    const { data: dokument } = lastDokumenter(journalpostId, dokumentreferanse, dokumenter, true, false);

    useEffect(() => {
        if (dokument) {
            setIsLoading(false);
        }
    }, [dokument]);

    if (isLoading) {
        return <LoadingIndicator title="Laster dokument..." />;
    }

    if (!isLoading && !dokument) {
        return <div>Det skjedde en feil ved lasting av dokument</div>;
    }
    function broadcast(document: Uint8Array, config: EditDocumentConfig) {
        const params = queryParams();
        const message: BroadcastMessage<EditDocumentBroadcastMessage> = Broadcast.convertToBroadcastMessage(params.id, {
            document: FileUtils._arrayBufferToBase64(document),
            config: config,
        });
        Broadcast.sendBroadcast(BroadcastNames.EDIT_DOCUMENT_RESULT, message);
    }
    function broadcastAndCloseWindow(config: EditDocumentConfig, document: Uint8Array) {
        broadcast(document, config);
        window.close();
    }

    return <DokumentRedigering dokument={dokument} onSave={broadcastAndCloseWindow} />;
}
