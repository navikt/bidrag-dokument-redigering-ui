import { useApi } from "@navikt/bidrag-ui-common";

import environment from "../environment";
import { Api as BidragDokumentApi } from "./BidragDokumentApi";
import { Api as BidragForsendelseApi } from "./BidragDokumentForsendelseApi";

export const BIDRAG_DOKUMENT_API = useApi(new BidragDokumentApi({ baseURL: environment.url.bidragDokument }), {
    app: "bidrag-dokument",
    cluster: "fss",
    env: environment.system.legacyEnvironment,
});
export const BIDRAG_FORSENDELSE_API = useApi(
    new BidragForsendelseApi({ baseURL: environment.url.bidragDokumentForsendelse }),
    {
        app: "bidrag-dokument-forsendelse",
        cluster: "gcp",
        env: environment.system.legacyEnvironment,
    }
);
