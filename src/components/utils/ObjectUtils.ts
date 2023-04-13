export function removeDuplicates(arr: any[]) {
    return Array.from(new Set(arr));
}

export function createArrayWithLength(length: number, offset = 0): number[] {
    return [...Array(length).keys()].map((_, index) => index + offset);
}
