import { LoggerService } from "@navikt/bidrag-ui-common";
import { useQuery } from "react-query";
import { useMutation } from "react-query";

import { PdfDocumentType } from "../components/pdfview/types";
import { BIDRAG_DOKUMENT_API } from "./api";
import { BIDRAG_FORSENDELSE_API } from "./api";

export const lastDokumenter = (
    journalpostId: string,
    dokumentId?: string,
    dokumenter?: string[],
    resizeToA4?: boolean,
    optimizeForPrint = true
): PdfDocumentType => {
    const { data: response } = useQuery({
        queryKey: `dokument_${dokumenter?.join(",") ?? dokumentId}`,
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
        onSuccess: (data) => {
            LoggerService.info(`Hentet dokumenter ${dokumenter} og resizeToA4=${resizeToA4}.`);
        },
    });

    return response.data;
};

export const ferdigstillDokument = (forsendelseId: string, dokument: string) => {
    return useMutation({
        mutationFn: () => {
            return BIDRAG_FORSENDELSE_API.api.ferdigstillDokument(forsendelseId, dokument);
        },
    });
};
