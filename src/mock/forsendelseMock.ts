import { rest, RestHandler, RestRequest } from "msw";

import { DokumentRedigeringMetadataResponsDto } from "../api/BidragDokumentForsendelseApi";
import environment from "../environment";

export default function forsendelseMock(): RestHandler[] {
    const baseUrl = environment.url.bidragDokumentForsendelse;
    return [
        rest.get(
            `${baseUrl}/api/forsendelse/redigering/:forsendelseId/:dokumentreferanse`,
            async (req: RestRequest, res, ctx) => {
                return res(ctx.status(200), ctx.body(JSON.stringify(dokumentMetadata)));
            }
        ),
    ];
}

const dokumentMetadata: DokumentRedigeringMetadataResponsDto = {
    tittel: "Søknad om barnebidrag",
    redigeringMetadata:
        '{"removedPages":[],"items":[{"parentId":"droppable_page_1","id":"cdf290d4-acae-4741-b605-a2bde41e078f","coordinates":{"x":107.48801095145092,"y":-582.6376124790737,"height":50,"width":200},"pageNumber":1},{"parentId":"droppable_page_1","id":"decd18c6-b0a4-4fd6-b72e-126a9d2ee1c6","coordinates":{"x":297.8571428571429,"y":-699.2857142857143,"height":50,"width":200},"pageNumber":1}]}',
    dokumenter: [
        {
            tittel: "Søknad om barnebidrag",
            dokumentreferanse: "123213123",
            antallSider: 2,
        },
        {
            tittel: "Vedlegg 1",
            dokumentreferanse: "123213123",
            antallSider: 3,
        },
        {
            tittel: "Vedlegg 2",
            dokumentreferanse: "123213123",
            antallSider: 3,
        },
    ],
};
