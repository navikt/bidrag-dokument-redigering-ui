import { queryParams } from "@navikt/bidrag-ui-common";
import { BroadcastMessage } from "@navikt/bidrag-ui-common";
import { EditDocumentBroadcastMessage } from "@navikt/bidrag-ui-common";
import { Broadcast } from "@navikt/bidrag-ui-common";
import { FileUtils } from "@navikt/bidrag-ui-common";
import { BroadcastNames } from "@navikt/bidrag-ui-common";
import { EditDocumentConfig } from "@navikt/bidrag-ui-common";
import React from "react";

import { ferdigstillDokument, lastDokumenter } from "../../api/queries";
import { lagreEndringer } from "../../api/queries";
import { hentRedigeringmetadata } from "../../api/queries";
import LoadingIndicator from "../../components/LoadingIndicator";
import { MaskingContainer } from "../../components/masking/MaskingContainer";
import { uint8ToBase64 } from "../../components/utils/DocumentUtils";
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
    const { data: dokument, isLoading } = lastDokumenter(journalpostId, dokumentreferanse, null, true, false);
    const defaultConfig = hentRedigeringmetadata(journalpostId, dokumentreferanse).data;
    const lagreEndringerFn = lagreEndringer(journalpostId, dokumentreferanse);
    const ferdigstillDokumentFn = ferdigstillDokument(journalpostId, dokumentreferanse);

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

    function saveDocument(config: EditDocumentConfig) {
        lagreEndringerFn.mutate(config);
    }

    function saveAndFinishDocument(fysiskDokument: Uint8Array, config: EditDocumentConfig) {
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
        // @ts-ignore
        <MaskingContainer items={defaultConfig.items}>
            <DokumentRedigering
                dokument={dokument}
                onSave={saveDocument}
                onSubmit={saveAndFinishDocument}
                defaultConfig={defaultConfig as EditDocumentConfig}
            />
        </MaskingContainer>
    );
}
