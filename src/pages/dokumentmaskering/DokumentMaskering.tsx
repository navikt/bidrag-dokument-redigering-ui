import { Broadcast, BroadcastMessage, BroadcastNames, queryParams } from "@navikt/bidrag-ui-common";
import { Alert, Heading } from "@navikt/ds-react";
import { AxiosError } from "axios";
import { useEffect } from "react";

import { RedigeringQueries } from "../../api/queries";
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
    function broadcast() {
        const params = queryParams();
        //@ts-ignore
        const message: BroadcastMessage<void> = Broadcast.convertToBroadcastMessage(params.id);
        Broadcast.sendBroadcast(BroadcastNames.EDIT_DOCUMENT_RESULT, message);
    }
    function broadcastAndCloseWindow() {
        broadcast();
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
            broadcastAndCloseWindow();
            return true;
        });
    }

    function saveAndFinishDocument(config: EditDocumentMetadata, fysiskDokument: string) {
        return new Promise<boolean>((resolve, reject) => {
            ferdigstillDokumentFn.mutate(
                {
                    fysiskDokument: fysiskDokument,
                    redigeringMetadata: JSON.stringify(config),
                },
                {
                    onSuccess: () => {
                        resolve(true);
                        broadcastAndCloseWindow();
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
