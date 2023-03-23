import { useDraggable } from "@dnd-kit/core";
import { Resizable } from "re-resizable";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

import { useMaskingContainer } from "./MaskingContainer";

interface ICoordinates {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface IMaskingItemProps {
    id: string;
    ghosted?: boolean;
    scale?: number;
    coordinates: ICoordinates;
    parentCoordinates: {
        maxHeight: number;
        maxWidth: number;
    };
    parentId: string | number;
    pageNumber: number;
}
export default function MaskingItem({ id, coordinates, ghosted, scale }: IMaskingItemProps) {
    const [height, setHeight] = useState(coordinates.height);
    const [coordinatesScaled2, setCoordinatesScaled] = useState<ICoordinates>(coordinates);
    const disabled = useRef(false);
    const scaleRef = useRef(scale);
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, active, isDragging } = useDraggable({
        id,
        disabled: disabled.current,
        data: {
            scale: scaleRef.current,
        },
    });

    const { updateItemDimensions, enableDrag, disableDrag } = useMaskingContainer();

    useEffect(() => {
        setCoordinatesScaled(getCoordinatesScaled());
        scaleRef.current = scale;
    }, [scale, coordinates]);

    useEffect(() => {
        const element = document.getElementById(id);
        setNodeRef(element);
        setActivatorNodeRef(element);
    }, []);

    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          }
        : {};

    console.log(scale);
    const getCoordinatesScaled = (): ICoordinates => {
        return {
            x: coordinates.x * scale,
            y: coordinates.y * scale,
            width: coordinates.width * scale,
            height: coordinates.height * scale,
        };
    };

    const coordinatesScaled = getCoordinatesScaled();
    console.log(coordinates, coordinatesScaled);
    return (
        <Resizable
            className={id}
            //@ts-ignore
            id={id}
            style={{
                position: "relative",
                backgroundColor: ghosted ? "green" : "white",
                border: "2px solid black",
                top: `${coordinatesScaled.y}px`,
                bottom: 0,
                zIndex: 1000,
                left: `${coordinatesScaled.x}px`,
                width: `${coordinatesScaled.width}px`,
                height: `${coordinatesScaled.height}px`,
                marginBottom: `${-height / scale}px`,
                ...style,
            }}
            {...listeners}
            {...attributes}
            bounds={"parent"}
            onResize={(e, direction, ref, d) => {
                setHeight(coordinatesScaled.height + d.height / scale);
            }}
            onResizeStart={() => {
                disabled.current = true;
                disableDrag();
            }}
            size={{ width: `${coordinatesScaled.width}px`, height: `${coordinatesScaled.height}px` }}
            onResizeStop={(e, direction, ref, d) => {
                const heightScaled = d.height / scale;
                updateItemDimensions(id, coordinates.width + d.width / scale, coordinates.height + d.height / scale);
                setHeight(coordinates.height + d.height / scale);
                disabled.current = false;
                enableDrag();
            }}
        ></Resizable>
    );
}
