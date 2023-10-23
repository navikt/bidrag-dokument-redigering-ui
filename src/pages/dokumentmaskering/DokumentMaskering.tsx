import {
    Broadcast,
    BroadcastMessage,
    BroadcastNames,
    EditDocumentBroadcastMessage,
    FileUtils,
    queryParams,
} from "@navikt/bidrag-ui-common";
import { Alert, Heading } from "@navikt/ds-react";
import { AxiosError } from "axios";
import { useEffect } from "react";

import { RedigeringQueries } from "../../api/queries";
import { uint8ToBase64 } from "../../components/utils/DocumentUtils";
import { PdfDocumentType } from "../../components/utils/types";
import environment from "../../environment";
import { EditDocumentMetadata } from "../../types/EditorTypes";
import { parseErrorMessageFromAxiosError } from "../../types/ErrorUtils";
import PdfEditorContextProvider, { PdfEditorMode } from "../redigering/components/PdfEditorContext";
import DokumentRedigering from "../redigering/DokumentRedigering";

type DokumentMaskeringProps = {
    documentFile: PdfDocumentType;
    forsendelseId: string;
    dokumentreferanse: string;
    isLoading: boolean;
};
export default function DokumentMaskering({
    documentFile,
    forsendelseId,
    dokumentreferanse,
    isLoading,
}: DokumentMaskeringProps) {
    const { data: dokumentMetadata } = RedigeringQueries.hentRedigeringmetadata<EditDocumentMetadata>(
        forsendelseId,
        dokumentreferanse
    );
    const lagreEndringerFn = RedigeringQueries.lagreEndringer(forsendelseId, dokumentreferanse);
    const ferdigstillDokumentFn = RedigeringQueries.ferdigstillDokument(forsendelseId, dokumentreferanse);
    function onWindowClose(e) {
        return broadcast();
    }

    useEffect(() => {
        window.addEventListener("beforeunload", onWindowClose);
        return () => window.removeEventListener("beforeunload", onWindowClose);
    }, []);

    if (!isLoading && !documentFile) {
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
        environment.system.isProduction && window.close();
    }

    function saveDocument(config: EditDocumentMetadata) {
        return new Promise<any>((resolve, reject) => {
            lagreEndringerFn.mutate(config, {
                onSuccess: resolve,
                onError: (error: AxiosError) => {
                    reject(parseErrorMessageFromAxiosError(error));
                },
            });
        });
    }
    function saveDocumentAndClose(config: EditDocumentMetadata) {
        return saveDocument(config).then(() => {
            broadcastAndCloseWindow(config);
            return true;
        });
    }

    function saveAndFinishDocument(config: EditDocumentMetadata, fysiskDokument: Uint8Array) {
        return new Promise<boolean>((resolve, reject) => {
            ferdigstillDokumentFn.mutate(
                {
                    fysiskDokument: uint8ToBase64(fysiskDokument),
                    redigeringMetadata: JSON.stringify(config),
                },
                {
                    onSuccess: () => {
                        resolve(true);
                        broadcastAndCloseWindow(config, fysiskDokument);
                    },
                    onError: (error: AxiosError) => {
                        reject(parseErrorMessageFromAxiosError(error));
                    },
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
