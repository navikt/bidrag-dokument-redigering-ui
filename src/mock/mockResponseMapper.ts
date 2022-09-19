import { MockedResponse, ResponseFunction, RestContext } from "msw";

import { isResponseData, ResponseData } from "./types";

export function mapToMockedResponse<T>(
    res: ResponseFunction,
    ctx: RestContext,
    responseData?: ResponseData<T> | T,
    delay?: number
): MockedResponse<T> | Promise<MockedResponse<T>> {
    const delayResponse = ctx.delay(delay ?? 500);
    if (isResponseData(responseData)) {
        return res(delayResponse, ctx.status(responseData?.status ?? 404), ctx.json(responseData?.data));
    }
    return res(delayResponse, ctx.status(200), ctx.json(responseData));
}
