export interface ResponseData<T> {
    data: T;
    status: number;
}

export function isResponseData<T>(object: ResponseData<T> | T): object is ResponseData<T> {
    if (!object) {
        return false;
    }
    return "status" in object;
}
