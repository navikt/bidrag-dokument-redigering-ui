import { LoggerService } from "@navikt/bidrag-ui-common";
import { useQuery, UseQueryResult } from "react-query";
import { useMutation } from "react-query";

import { PdfDocumentType } from "../components/utils/types";
import { EditDocumentMetadata, IDocumentMetadata } from "../types/EditorTypes";
import { BIDRAG_DOKUMENT_API } from "./api";
import { BIDRAG_FORSENDELSE_API } from "./api";
import { FerdigstillDokumentRequest } from "./BidragDokumentForsendelseApi";

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
export const lastDokumenter = (
    journalpostId: string,
    dokumentId?: string,
    dokumenter?: string[],
    resizeToA4?: boolean,
    optimizeForPrint = true
): UseQueryResult<PdfDocumentType> => {
    return useQuery({
        queryKey: DokumentQueryKeys.hentDokument(dokumentId, dokumenter),
        queryFn: () => {
            if (dokumenter && dokumenter.length > 0) {
                return BIDRAG_DOKUMENT_API.dokument.hentDokumenter(
                    {
                        dokument: dokumenter,
                        resizeToA4,
                        optimizeForPrint,
                    },
                    {
                        format: "arraybuffer",
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
                        format: "arraybuffer",
                        paramsSerializer: {
                            indexes: null,
                        },
                    }
                );
            }
            return BIDRAG_DOKUMENT_API.dokument.hentDokument(
                journalpostId,
                null,
                {
                    resizeToA4,
                    optimizeForPrint,
                },
                {
                    format: "arraybuffer",
                    paramsSerializer: {
                        indexes: null,
                    },
                }
            );
        },
        select: (response) => response.data,
        onSuccess: (data) => {
            LoggerService.info(`Hentet dokumenter ${dokumenter} og resizeToA4=${resizeToA4}.`);
        },
        onError: (data) => {
            LoggerService.warn(
                `Fant ikke dokument ${dokumentId} eller dokumenter ${dokumenter} for forsendelse/journalpost ${journalpostId}`
            );
        },
    });
};

export const RedigeringQueries = {
    hentRedigeringmetadata: (forsendelseId: string, dokumentId: string) => {
        return useQuery({
            queryKey: DokumentQueryKeys.hentDokumentMetadata(forsendelseId, dokumentId),
            queryFn: () => {
                return BIDRAG_FORSENDELSE_API.api.hentDokumentRedigeringMetadata(forsendelseId, dokumentId);
            },
            select: (data): IDocumentMetadata => {
                const response = data.data;
                return {
                    editorMetadata: response.redigeringMetadata
                        ? (JSON.parse(response.redigeringMetadata) as EditDocumentMetadata)
                        : null,
                    documentDetails: response.dokumenter,
                    title: response.tittel,
                    forsendelseState: response.forsendelseStatus == "UNDER_PRODUKSJON" ? "EDITABLE" : "LOCKED",
                    state:
                        response.status == "MÅ_KONTROLLERES" || response.status == "UNDER_REDIGERING"
                            ? "EDITABLE"
                            : "LOCKED",
                };
            },
        });
    },
    lagreEndringer: (forsendelseId: string, dokumentId: string) => {
        return useMutation({
            mutationKey: DokumentQueryKeys.lagreDokumentMetadata(forsendelseId, dokumentId),
            mutationFn: (config: EditDocumentMetadata) => {
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
        });
    },
};
