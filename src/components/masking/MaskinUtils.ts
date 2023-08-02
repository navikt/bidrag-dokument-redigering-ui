import { DragEndEvent } from "@dnd-kit/core";

import { ICoordinates } from "./MaskingItem";

export default class MaskingUtils {
    static getDragEndCoordinates(event: DragEndEvent, currentCoordinates: ICoordinates, scale: number): ICoordinates {
        const delta = event.delta;
        return {
            ...currentCoordinates,
            x: delta.x / scale + currentCoordinates.x,
            y: delta.y / scale + currentCoordinates.y,
        };
    }
}
