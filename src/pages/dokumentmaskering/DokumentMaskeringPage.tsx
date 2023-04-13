import { queryParams } from "@navikt/bidrag-ui-common";
import { BroadcastMessage } from "@navikt/bidrag-ui-common";
import { EditDocumentBroadcastMessage } from "@navikt/bidrag-ui-common";
import { Broadcast } from "@navikt/bidrag-ui-common";
import { FileUtils } from "@navikt/bidrag-ui-common";
import { BroadcastNames } from "@navikt/bidrag-ui-common";
import React from "react";

import { lastDokumenter, RedigeringQueries } from "../../api/queries";
import LoadingIndicator from "../../components/LoadingIndicator";
import { MaskingContainer } from "../../components/masking/MaskingContainer";
import { uint8ToBase64 } from "../../components/utils/DocumentUtils";
import { EditDocumentMetadata } from "../../types/EditorTypes";
import PageWrapper from "../PageWrapper";
import DokumentRedigering from "../redigering/DokumentRedigering";

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
    const { data: documentFile, isLoading } = lastDokumenter(forsendelseId, dokumentreferanse, null, true, false);
    const { data: documentMetadata } = RedigeringQueries.hentRedigeringmetadata(forsendelseId, dokumentreferanse);
    const lagreEndringerFn = RedigeringQueries.lagreEndringer(forsendelseId, dokumentreferanse);
    const ferdigstillDokumentFn = RedigeringQueries.ferdigstillDokument(forsendelseId, dokumentreferanse);

    if (isLoading) {
        return <LoadingIndicator title="Laster dokument..." />;
    }

    if (!isLoading && !documentFile) {
        return <div>Det skjedde en feil ved lasting av dokument</div>;
    }
    function broadcast(document: Uint8Array, config: EditDocumentMetadata) {
        const params = queryParams();
        const message: BroadcastMessage<EditDocumentBroadcastMessage> = Broadcast.convertToBroadcastMessage(params.id, {
            documentFile: FileUtils._arrayBufferToBase64(document),
            config: JSON.stringify(config),
        });
        Broadcast.sendBroadcast(BroadcastNames.EDIT_DOCUMENT_RESULT, message);
    }
    function broadcastAndCloseWindow(document: Uint8Array, config: EditDocumentMetadata) {
        broadcast(document, config);
        window.close();
    }

    function saveDocument(config: EditDocumentMetadata) {
        lagreEndringerFn.mutate(config);
    }

    function saveAndFinishDocument(fysiskDokument: Uint8Array, config: EditDocumentMetadata) {
        ferdigstillDokumentFn.mutate(
            {
                fysiskDokument: uint8ToBase64(fysiskDokument),
                redigeringMetadata: JSON.stringify(config),
            },
            {
                onSuccess: () => broadcastAndCloseWindow(fysiskDokument, config),
            }
        );
    }

    return (
        <MaskingContainer items={documentMetadata.editorMetadata?.items}>
            <DokumentRedigering
                forsendelseId={forsendelseId}
                dokumentreferanse={dokumentreferanse}
                documentFile={documentFile}
                onSave={saveDocument}
                onSubmit={saveAndFinishDocument}
                documentMetadata={documentMetadata}
            />
        </MaskingContainer>
    );
}
