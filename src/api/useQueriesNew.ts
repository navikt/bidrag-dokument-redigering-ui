import { useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { IDocumentMetadata } from "../types/EditorTypes";
import { BIDRAG_FORSENDELSE_API } from "./api";
import { DokumentStatusTo } from "./BidragDokumentForsendelseApi";
import { DokumentQueryKeys } from "./queries";

 export const useHentRedigeringmetadata = <T>(forsendelseId: string, dokumentId: string) => {
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
    }


    export const useHentHtml = (journalpostId: string, dokumentId: string): UseSuspenseQueryResult<string> => {
        return useSuspenseQuery({
            queryKey: ["hentHtmlDokument", journalpostId, dokumentId],
            queryFn: () => {
                // return BIDRAG_DOKUMENT_PRODUKSJON_API.api.generateHtmlDebug();
                return BIDRAG_FORSENDELSE_API.api.hentDokument(journalpostId, dokumentId);
            },
            select: (response) => {
                console.log(`Hentet HTML dokument ${dokumentId} for journalpost ${journalpostId}.`, response.data);
                return response.data;
            },
        });
    };
   export const useLagreEndringer = <T>(forsendelseId: string, dokumentId: string) => {
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
    }