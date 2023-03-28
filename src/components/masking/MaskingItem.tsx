import "./MaskinItem.css";

import { useDraggable } from "@dnd-kit/core";
import { TrashIcon } from "@navikt/aksel-icons";
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
    parentId: string | number;
    pageNumber: number;
}
export default function MaskingItem({ id, coordinates, ghosted, scale }: IMaskingItemProps) {
    const [height, setHeight] = useState(coordinates.height);
    const [coordinatesResizeStart, setCoordinatesResizeStart] = useState<ICoordinates>(coordinates);
    const disabled = useRef(false);
    const scaleRef = useRef(scale);
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
        id,
        disabled: disabled.current,
        data: {
            disabled: disabled.current,
            scale: scaleRef.current,
        },
    });

    const { updateItemDimensions, enableDrag, disableDrag, activeId } = useMaskingContainer();

    useEffect(() => {
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

    const getCoordinatesScaled = (): ICoordinates => {
        return {
            x: coordinates.x * scale,
            y: coordinates.y * scale,
            width: coordinates.width * scale,
            height: coordinates.height * scale,
        };
    };

    const coordinatesScaled = getCoordinatesScaled();
    // console.log("MaskinItem", id, coordinates.x, coordinates.y, scale, coordinatesScaled.x, coordinatesScaled.y);
    const isHighlighted = activeId == id;

    return (
        <>
            {isHighlighted && !isDragging && <Toolbar id={id} coordinates={coordinatesScaled} />}
            <Resizable
                className={`maskingitem ${isHighlighted ? "highlighted" : ""} ${isDragging ? "dragging" : ""}`}
                {...listeners}
                //@ts-ignore
                id={id}
                {...attributes}
                style={{
                    position: "relative",
                    backgroundColor: ghosted ? "green" : "white",
                    top: `${coordinatesScaled.y}px`,
                    bottom: 0,
                    zIndex: 100000,
                    left: `${coordinatesScaled.x}px`,
                    width: `${coordinatesScaled.width}px`,
                    height: `${coordinatesScaled.height}px`,
                    marginBottom: `${-height * scale}px`,
                    ...style,
                }}
                onResize={(e, direction, ref, d) => {
                    setHeight(coordinates.height + d.height / scale);
                }}
                onResizeStart={() => {
                    disabled.current = true;
                    disableDrag();
                }}
                size={{ width: `${coordinatesScaled.width}px`, height: `${coordinatesScaled.height}px` }}
                onResizeStop={(e, direction, ref, d) => {
                    updateItemDimensions(
                        id,
                        coordinates.width + d.width / scale,
                        coordinates.height + d.height / scale
                    );
                    setHeight(coordinates.height + d.height / scale);
                    disabled.current = false;
                    enableDrag();
                }}
            ></Resizable>
        </>
    );
}

interface IToolbarProps {
    id: string;
    coordinates: ICoordinates;
}
function Toolbar({ id, coordinates }: IToolbarProps) {
    const { removeItem } = useMaskingContainer();

    return (
        <div
            className={"toolbar"}
            style={{
                position: "relative",
                top: `${coordinates.y - 35}px`,
                left: `${coordinates.x}px`,
            }}
        >
            <div
                className={"toolbar-item"}
                onClick={(e) => {
                    removeItem(id);
                }}
            >
                <TrashIcon fontSize="1.5rem" />
            </div>
        </div>
    );
}
