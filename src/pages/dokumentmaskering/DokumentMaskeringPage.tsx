import { queryParams } from "@navikt/bidrag-ui-common";
import { BroadcastMessage } from "@navikt/bidrag-ui-common";
import { EditDocumentBroadcastMessage } from "@navikt/bidrag-ui-common";
import { Broadcast } from "@navikt/bidrag-ui-common";
import { FileUtils } from "@navikt/bidrag-ui-common";
import { BroadcastNames } from "@navikt/bidrag-ui-common";
import { EditDocumentConfig } from "@navikt/bidrag-ui-common";
import React from "react";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";

import { BIDRAG_FORSENDELSE_API } from "../../api/api";
import { lastDokumenter } from "../../api/queries";
import LoadingIndicator from "../../components/LoadingIndicator";
import { MaskingContainer } from "../../components/masking/MaskingContainer";
import DokumentRedigering from "../dokumentredigering/DokumentRedigering";
import PageWrapper from "../PageWrapper";

const url = "http://localhost:5173/test4.pdf";

interface DokumentMaskeringPageProps {
    journalpostId: string;
    dokumentreferanse: string;
}

export default function DokumentMaskeringPage(props: DokumentMaskeringPageProps) {
    return (
        <PageWrapper name={"dokumentredigering"}>
            <DokumentMaskeringContainer {...props} />
        </PageWrapper>
    );
}

function DokumentMaskeringContainer({ journalpostId, dokumentreferanse }: DokumentMaskeringPageProps) {
    const [isLoading, setIsLoading] = useState(true);

    const dokument = lastDokumenter(journalpostId, dokumentreferanse, null, true, false);
    const ferdigstillDokument = useMutation<any, any, { journalpostId: string; dokumentreferanse: string }>(
        "ferdigstillDokument",
        ({ journalpostId, dokumentreferanse }) => {
            return BIDRAG_FORSENDELSE_API.api.ferdigstillDokument(journalpostId, dokumentreferanse);
        }
    );
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
    function broadcastAndCloseWindow(document: Uint8Array, config: EditDocumentConfig) {
        broadcast(document, config);
        window.close();
    }

    function saveAndFinishDocument(document: Uint8Array, config: EditDocumentConfig) {
        ferdigstillDokument.mutate(
            { journalpostId, dokumentreferanse },
            {
                onSuccess: () => broadcastAndCloseWindow(document, config),
            }
        );
    }

    return (
        <MaskingContainer>
            <DokumentRedigering dokument={dokument} onSave={broadcastAndCloseWindow} onSubmit={saveAndFinishDocument} />
        </MaskingContainer>
    );
}
