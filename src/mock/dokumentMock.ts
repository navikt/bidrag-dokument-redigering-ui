import { rest, RestHandler } from "msw";

import environment from "../environment";

export default function documentMock(): RestHandler[] {
    const baseUrl = environment.url.bidragDokument;
    return [
        rest.get(`${baseUrl}/dokument/:jpId`, async (req, res, ctx) => {
            const imageBuffer = await fetch("http://localhost:5173/test4.pdf").then((res) => res.arrayBuffer());
            return res(
                ctx.set("Content-Length", imageBuffer.byteLength.toString()),
                ctx.set("Content-Type", "application/pdf"),
                // Respond with the "ArrayBuffer".
                ctx.body(imageBuffer)
            );
        }),
    ];
}
