import { LoggerService } from "@navikt/bidrag-ui-common";
import { useMutation } from "@tanstack/react-query";
import { useSuspenseQuery, UseSuspenseQueryResult } from "@tanstack/react-query";

import { PdfDocumentType } from "../components/utils/types";
import { IDocumentMetadata } from "../types/EditorTypes";
import { BIDRAG_DOKUMENT_API } from "./api";
import { BIDRAG_FORSENDELSE_API } from "./api";
import { DokumentStatusTo, FerdigstillDokumentRequest } from "./BidragDokumentForsendelseApi";

export const DokumentQueryKeys = {
    dokument: ["dokument"],
    hentDokument: (dokumentId?: string, dokumenter?: string[]) => [
        ...DokumentQueryKeys.dokument,
        dokumenter?.join(",") ?? "",
        dokumentId,
    ],
    hentDokumentMetadata: (forsendelseId: string, dokumentId: string) => [
        ...DokumentQueryKeys.dokument,
        "metadata",
        forsendelseId,
        dokumentId,
    ],
    lagreDokumentMetadata: (forsendelseId: string, dokumentId: string) => [
        ...DokumentQueryKeys.dokument,
        "lagre_metadata",
        forsendelseId,
        dokumentId,
    ],
    ferdigstill: (forsendelseId: string, dokumentId: string) => [
        ...DokumentQueryKeys.dokument,
        "ferdigstill",
        forsendelseId,
        dokumentId,
    ],
    opphevFerdigstil: (forsendelseId: string, dokumentId: string) => [
        ...DokumentQueryKeys.dokument,
        "opphev_ferdigstill",
        forsendelseId,
        dokumentId,
    ],
};

export const useHentRTFDokument = (
    journalpostId: string,
    dokumentId: string
): UseSuspenseQueryResult<string> => {
    return useSuspenseQuery({
        queryKey: DokumentQueryKeys.hentDokument(dokumentId),
        queryFn: () => {
            return BIDRAG_DOKUMENT_API.dokument.hentDokument1(journalpostId, dokumentId, {rtf: true});
        },
        select: (response) => {
            LoggerService.info(`Hentet RTF dokument ${dokumentId} for journalpost ${journalpostId}.`);
            return response.data;
        },
    });
}
export const lastDokumenter = (
    journalpostId: string,
    dokumentId?: string,
    dokumenter?: string[],
    resizeToA4?: boolean,
    optimizeForPrint = true
): UseSuspenseQueryResult<PdfDocumentType> => {
    return useSuspenseQuery({
        queryKey: DokumentQueryKeys.hentDokument(dokumentId, dokumenter),
        queryFn: () => {
            try {
                if (dokumenter && dokumenter.length > 0) {
                    return BIDRAG_DOKUMENT_API.dokument.hentDokumenter(
                        {
                            dokument: dokumenter,
                            resizeToA4,
                            optimizeForPrint,
                        },
                        {
                            format: "blob",
                            paramsSerializer: {
                                indexes: null,
                            },
                        }
                    );
                }
                if (dokumentId) {
                    return BIDRAG_DOKUMENT_API.dokument.hentDokument1(
                        journalpostId,
                        dokumentId,
                        {
                            resizeToA4,
                            optimizeForPrint,
                        },
                        {
                            format: "blob",
                            paramsSerializer: {
                                indexes: null,
                            },
                        }
                    );
                }
                return BIDRAG_DOKUMENT_API.dokument.hentDokument(
                    journalpostId,
                    {
                        resizeToA4,
                        optimizeForPrint,
                    },
                    {
                        format: "blob",
                        paramsSerializer: {
                            indexes: null,
                        },
                    }
                );
            } catch (e) {
                LoggerService.warn(
                    `Fant ikke dokument ${dokumentId} eller dokumenter ${dokumenter} for forsendelse/journalpost ${journalpostId}`
                );
                throw e;
            }
        },
        select: (response) => {
            LoggerService.info(`Hentet dokumenter ${dokumenter} og resizeToA4=${resizeToA4}.`);
            return response.data;
        },
    });
};

export const RedigeringQueries = {
    hentRedigeringmetadata: <T>(forsendelseId: string, dokumentId: string) => {
        return useSuspenseQuery({
            queryKey: DokumentQueryKeys.hentDokumentMetadata(forsendelseId, dokumentId),
            queryFn: () => {
                if (forsendelseId == undefined && dokumentId == undefined) return { data: null };
                return BIDRAG_FORSENDELSE_API.api.hentDokumentRedigeringMetadata(forsendelseId, dokumentId);
            },
            select: (data): IDocumentMetadata<T> => {
                if (!data?.data) return;
                const response = data.data;
                if (![DokumentStatusTo.MAKONTROLLERES, DokumentStatusTo.UNDER_REDIGERING].includes(response.status)) {
                    return {
                        documentDetails: response.dokumenter,
                        title: response.tittel,
                        forsendelseState: response.forsendelseStatus == "UNDER_PRODUKSJON" ? "EDITABLE" : "LOCKED",
                        state: "LOCKED",
                    };
                }
                return {
                    editorMetadata: response.redigeringMetadata ? (JSON.parse(response.redigeringMetadata) as T) : null,
                    documentDetails: response.dokumenter,
                    title: response.tittel,
                    forsendelseState: response.forsendelseStatus == "UNDER_PRODUKSJON" ? "EDITABLE" : "LOCKED",
                    state: "EDITABLE",
                };
            },
        });
    },
    lagreEndringer: <T>(forsendelseId: string, dokumentId: string) => {
        return useMutation({
            mutationKey: DokumentQueryKeys.lagreDokumentMetadata(forsendelseId, dokumentId),
            mutationFn: (config: T) => {
                return BIDRAG_FORSENDELSE_API.api.oppdaterDokumentRedigeringmetadata(
                    forsendelseId,
                    dokumentId,
                    JSON.stringify(config)
                );
            },
        });
    },
    ferdigstillDokument: (forsendelseId: string, dokumentId: string) => {
        return useMutation({
            mutationKey: DokumentQueryKeys.ferdigstill(forsendelseId, dokumentId),
            mutationFn: (request: FerdigstillDokumentRequest) => {
                return BIDRAG_FORSENDELSE_API.api.ferdigstillDokument(forsendelseId, dokumentId, request);
            },
        });
    },
    opphevFerdigstillDokument: (forsendelseId: string, dokumentId: string) => {
        return useMutation({
            mutationKey: DokumentQueryKeys.opphevFerdigstil(forsendelseId, dokumentId),
            mutationFn: () => {
                return BIDRAG_FORSENDELSE_API.api.opphevFerdigstillDokument(forsendelseId, dokumentId);
            },
            onSuccess: () => {
                window.location.reload();
            },
        });
    },
};
