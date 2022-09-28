import { rest, RestHandler } from "msw";

export default function tokenMock(): RestHandler[] {
    return [
        rest.post(`/token`, (req, res, ctx) => {
            return res(ctx.status(200), ctx.body("some token"));
        }),
    ];
}
