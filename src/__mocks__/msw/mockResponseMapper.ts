import { MockedResponse, ResponseFunction, RestContext } from "msw";
import { compose } from "msw";

import { ResponseData } from "./types";
import { isResponseData } from "./types";

export function mapToMockedResponse<T>(
    res: ResponseFunction,
    ctx: RestContext,
    responseData?: ResponseData<T> | T,
    delay?: number
): MockedResponse<T> | Promise<MockedResponse<T>> {
    const delayResponse = ctx.delay(delay ?? 500);
    if (isResponseData(responseData)) {
        return res(
            compose(
                delayResponse,
                ctx.set("Warning", responseData.errorMessage),
                ctx.status(responseData?.status ?? 404),
                ctx.json(responseData?.data)
            )
        );
    }
    return res(delayResponse, ctx.status(200), ctx.json(responseData));
}
