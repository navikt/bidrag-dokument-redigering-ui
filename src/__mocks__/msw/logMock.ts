import { rest, RestHandler, RestRequest } from "msw";

export default function logMock(): RestHandler[] {
    return [
        rest.post(`/log`, async (req: RestRequest, res, ctx) => {
            const requestBody = await req.json();
            console.log("Logging", requestBody);
            return res(ctx.status(200), ctx.body("some token"));
        }),
    ];
}
