import { ApiError, DefaultRestService, LoggerService } from "@navikt/bidrag-ui-common";
import { FileData } from "@navikt/bidrag-ui-common";

import environment from "../environment";

export default class DokumentService extends DefaultRestService {
    constructor() {
        super("bidrag-dokument", environment.url.bidragDokument);
    }

    async getDokument(
        journalpostId: string,
        dokumentId: string,
        resizeToA4?: boolean,
        optimizeForPrint = true
    ): Promise<FileData> {
        const dokumentReferansePath = dokumentId ? `/${dokumentId}` : "";

        const response = await this.get<ArrayBuffer>(
            `/dokument/${journalpostId}${dokumentReferansePath}?resizeToA4=${resizeToA4}&optimizeForPrint=${optimizeForPrint}`
        );
        LoggerService.info(
            `Hentet dokument med journalpostId ${journalpostId} og dokumentId ${dokumentId} og resizeToA4=${resizeToA4}.`
        );
        if (!response.ok) {
            throw new ApiError("Det skjedde en feil ved henting av dokument", "", "", response.status);
        }

        return response.data;
    }

    async getDokumenter(dokumenter: string[], printable: boolean, optimizeForPrint = true): Promise<FileData> {
        const dokumenterPath = dokumenter.map((dokument) => `dokument=${dokument}`).join("&");
        const response = await this.get<ArrayBuffer>(
            `/dokument?${dokumenterPath}&resizeToA4=${printable}&optimizeForPrint=${optimizeForPrint}`
        );
        LoggerService.info(`Hentet dokumenter ${dokumenter} og resizeToA4=${printable}.`);
        if (!response.ok) {
            throw new ApiError("Det skjedde en feil ved henting av dokument", "", "", response.status);
        }
        return response.data;
    }
}
