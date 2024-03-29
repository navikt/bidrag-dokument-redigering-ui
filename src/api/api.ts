import { useApi } from "@navikt/bidrag-ui-common";

import environment from "../environment";
import { Api as BidragDokumentApi } from "./BidragDokumentApi";
import { Api as BidragForsendelseApi } from "./BidragDokumentForsendelseApi";

export const BIDRAG_DOKUMENT_API = useApi(
    new BidragDokumentApi({ baseURL: environment.url.bidragDokument }),
    "bidrag-dokument",
    "fss"
);
export const BIDRAG_FORSENDELSE_API = useApi(
    new BidragForsendelseApi({ baseURL: environment.url.bidragDokumentForsendelse }),
    "bidrag-dokument-forsendelse",
    "gcp"
);
