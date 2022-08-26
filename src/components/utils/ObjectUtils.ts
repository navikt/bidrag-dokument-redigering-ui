export function isEmpty(value: { trim?: any; }) {
    if (!value) {
        return true;
    }

    if (value && typeof value === "string") {
        return value.trim().length === 0;
    }
    return Object.keys(value).length === 0;
}

export function isTrue(value: boolean | undefined) {
    if (value === undefined) {
        return false;
    }
    return value;
}

export function removeNullOrUndefinedKeys<T>(obj?: T) {
    if (!obj) {
        return;
    }

    for (const propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined) {
            delete obj[propName];
        }
    }
    return obj;
}

export function removeDuplicates(arr: any[]) {
    return Array.from(new Set(arr));
}

export function createArrayWithLength(length: number): number[] {
    return [...Array(length).keys()].map((_, index) => index);
}
