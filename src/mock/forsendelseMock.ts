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
    status: "MÅ_KONTROLLERES",
    forsendelseStatus: "UNDER_PRODUKSJON",
    redigeringMetadata:
        '{"removedPages":[],"items":[{"parentId":"droppable_page_1","id":"cdf290d4-acae-4741-b605-a2bde41e078f","coordinates":{"x":107.48801095145092,"y":-582.6376124790737,"height":50,"width":200},"pageNumber":1},{"parentId":"droppable_page_1","id":"decd18c6-b0a4-4fd6-b72e-126a9d2ee1c6","coordinates":{"x":297.8571428571429,"y":-699.2857142857143,"height":50,"width":200},"pageNumber":1},{"id":"8cef395a-5088-4ef1-8956-09feae7a15b1","parentId":"droppable_page_9","state":"ITEM","coordinates":{"x":0.010426839192746229,"y":-595.0104141235352,"height":53.33333333333326,"width":105.83333333333331},"pageNumber":9},{"id":"78a11dbc-830c-41e7-87c4-55869bbab172","parentId":"droppable_page_9","state":"ITEM","coordinates":{"x":0.015614827473960702,"y":-65.83328247070308,"height":65.83333333333337,"width":66.66666666666667},"pageNumber":9},{"id":"cc109899-a707-466a-a27a-7428e88891fa","parentId":"droppable_page_9","state":"ITEM","coordinates":{"x":814.5104471842449,"y":-92.50518798828125,"height":92.5,"width":27.5},"pageNumber":9},{"id":"6a53a10f-c591-46e3-bc64-e88e168b0ab7","parentId":"droppable_page_9","state":"ITEM","coordinates":{"x":803.6771138509115,"y":-595.0052134195963,"height":233.33333333333337,"width":38.33333333333337},"pageNumber":9},{"id":"e24762ba-7662-47b7-abee-4583ec78ff2c","parentId":"droppable_page_1","state":"ITEM","coordinates":{"x":544.3072764078777,"y":-558.25,"height":206.66666666666669,"width":35},"pageNumber":1},{"id":"b4078a89-44f7-414d-8eab-49ac503812a5","parentId":"droppable_page_10","state":"ITEM","coordinates":{"x":806.5,"y":-565.375,"height":138,"width":25},"pageNumber":10},{"id":"d9c23243-0db5-4b67-8a64-1f6f8b6b87e6","parentId":"droppable_page_10","state":"ITEM","coordinates":{"x":567,"y":-562.875,"height":41,"width":204},"pageNumber":10},{"id":"2c08d8a1-9f8b-4746-8946-a4c5f7067f46","parentId":"droppable_page_8","state":"ITEM","coordinates":{"x":425,"y":-319.875,"height":219,"width":48},"pageNumber":8},{"id":"2711c682-6dd2-4c92-bd04-b4d0517e7d98","parentId":"droppable_page_8","state":"ITEM","coordinates":{"x":133,"y":-330.875,"height":47,"width":213},"pageNumber":8}]}',
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
