export const uint8ToBase64 = (arr: Uint8Array): string => btoa(uin8ToString(arr));
export const base64ToUint8 = async (base64Data: string, filetype = "application/pdf"): Promise<Uint8Array> => {
    const blob = await fetch(`data:${filetype};base64,${base64Data}`);

    return new Uint8Array(await blob.arrayBuffer());
};

export function uin8ToString(arr: Uint8Array): string {
    const CHUNK_SZ = 0x8000;
    const c = [];
    for (let i = 0; i < arr.length; i += CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, arr.subarray(i, i + CHUNK_SZ)));
    }
    return c.join("");
}
