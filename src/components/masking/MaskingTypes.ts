export interface ICoordinates {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IMaskingItemProps {
    id: string;
    state?: "GHOSTED" | "DUPLICATED" | "ITEM";
    ghosted?: boolean;
    disabled?: boolean;
    scale?: number;
    coordinates: ICoordinates;
    parentId: string | number;
    pageNumber: number;
}
