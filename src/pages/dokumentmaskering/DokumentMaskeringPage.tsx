import { queryParams } from "@navikt/bidrag-ui-common";
import { BroadcastMessage } from "@navikt/bidrag-ui-common";
import { EditDocumentBroadcastMessage } from "@navikt/bidrag-ui-common";
import { Broadcast } from "@navikt/bidrag-ui-common";
import { FileUtils } from "@navikt/bidrag-ui-common";
import { BroadcastNames } from "@navikt/bidrag-ui-common";
import { Alert, Heading } from "@navikt/ds-react";
import React, { useEffect } from "react";

import { lastDokumenter, RedigeringQueries } from "../../api/queries";
import LoadingIndicator from "../../components/LoadingIndicator";
import { uint8ToBase64 } from "../../components/utils/DocumentUtils";
import { EditDocumentMetadata } from "../../types/EditorTypes";
import PageWrapper from "../PageWrapper";
import PdfEditorContextProvider, { PdfEditorMode } from "../redigering/components/PdfEditorContext";
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
    const { data: documentFile, isFetching } = lastDokumenter(forsendelseId, dokumentreferanse, null, true, false);
    const { data: dokumentMetadata } = RedigeringQueries.hentRedigeringmetadata(forsendelseId, dokumentreferanse);
    const lagreEndringerFn = RedigeringQueries.lagreEndringer(forsendelseId, dokumentreferanse);
    const ferdigstillDokumentFn = RedigeringQueries.ferdigstillDokument(forsendelseId, dokumentreferanse);
    function onWindowClose(e) {
        return broadcast();
    }

    useEffect(() => {
        window.addEventListener("beforeunload", onWindowClose);
        return () => window.removeEventListener("beforeunload", onWindowClose);
    }, []);

    if (isFetching) {
        return <LoadingIndicator title="Laster dokumentet..." />;
    }

    if (!isFetching && !documentFile) {
        return (
            <Alert variant="error" size={"small"} style={{ margin: "0 auto", width: "50%" }}>
                <Heading spacing size="small" level="3">
                    Det skjedde en feil ved lasting av dokument
                </Heading>
                Fant ingen dokument {dokumentreferanse} i forsendelse #{forsendelseId}
            </Alert>
        );
    }
    function broadcast(config?: EditDocumentMetadata, documentFile?: Uint8Array) {
        const params = queryParams();
        const documentFileAsBase64 = documentFile ? FileUtils._arrayBufferToBase64(documentFile) : null;
        const message: BroadcastMessage<EditDocumentBroadcastMessage> = Broadcast.convertToBroadcastMessage(params.id, {
            documentFile: documentFileAsBase64,
            document: documentFileAsBase64,
            config: config ? JSON.stringify(config) : undefined,
        });
        Broadcast.sendBroadcast(BroadcastNames.EDIT_DOCUMENT_RESULT, message);
    }
    function broadcastAndCloseWindow(config: EditDocumentMetadata, documentFile?: Uint8Array) {
        broadcast(config, documentFile);
        // window.close();
    }

    function saveDocument(config: EditDocumentMetadata) {
        return new Promise<any>((resolve, reject) => {
            lagreEndringerFn.mutate(config, {
                onSuccess: resolve,
                onError: reject,
            });
        });
    }
    function saveDocumentAndClose(config: EditDocumentMetadata) {
        return saveDocument(config).then(() => broadcastAndCloseWindow(config));
    }

    function saveAndFinishDocument(config: EditDocumentMetadata, fysiskDokument: Uint8Array) {
        return new Promise<void>((resolve, reject) => {
            ferdigstillDokumentFn.mutate(
                {
                    fysiskDokument: uint8ToBase64(fysiskDokument),
                    redigeringMetadata: JSON.stringify(config),
                },
                {
                    onSuccess: () => {
                        resolve();
                        broadcastAndCloseWindow(config, fysiskDokument);
                    },
                    onError: reject,
                }
            );
        });
    }

    const getPdfEditorMode = (): PdfEditorMode => {
        if (dokumentMetadata?.forsendelseState == "LOCKED") return "view_only_unlockable";
        if (dokumentMetadata?.state == "LOCKED") return "view_only_unlockable";
        return "edit";
    };

    return (
        <PdfEditorContextProvider
            mode={getPdfEditorMode()}
            journalpostId={forsendelseId}
            dokumentreferanse={dokumentreferanse}
            documentFile={documentFile}
            onSave={saveDocument}
            onSaveAndClose={saveDocumentAndClose}
            onSubmit={saveAndFinishDocument}
            dokumentMetadata={dokumentMetadata}
        >
            <DokumentRedigering documentFile={documentFile} />
        </PdfEditorContextProvider>
    );
}
