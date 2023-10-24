export const uint8ToBase64 = (arr: Uint8Array): string => btoa(uin8ToString(arr));

export function uin8ToString(arr: Uint8Array): string {
    const decoder = new TextDecoder("utf8");
    return decoder.decode(arr);
}
