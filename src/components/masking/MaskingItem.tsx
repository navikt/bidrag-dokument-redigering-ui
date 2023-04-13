import "./MaskinItem.css";

import { useDraggable } from "@dnd-kit/core";
import { TrashIcon } from "@navikt/aksel-icons";
import { Resizable } from "re-resizable";
import { CSSProperties, useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

import { useMaskingContainer } from "./MaskingContainer";
interface ICoordinates {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface IResizeDelta {
    width: number;
    height: number;
}
export interface IMaskingItemProps {
    id: string;
    disabled?: boolean;
    scale?: number;
    coordinates: ICoordinates;
    parentId: string | number;
    pageNumber: number;
}
export default function MaskingItem({ id, coordinates, scale, disabled = false }: IMaskingItemProps) {
    const [coordinatesResizeStart, setCoordinatesResizeStart] = useState<ICoordinates>(coordinates);
    const disabledRef = useRef(false);
    const scaleRef = useRef(scale);
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
        id,
        disabled: disabledRef.current ?? disabled,
        data: {
            disabled: disabledRef.current ?? disabled,
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

    const getCoordinatesAfterResize = (delta: IResizeDelta): ICoordinates => {
        return {
            ...coordinatesResizeStart,
            width: coordinatesResizeStart.width + delta.width / scale,
            height: coordinatesResizeStart.height + delta.height / scale,
        };
    };

    const getStyle = (): CSSProperties => ({
        position: "relative",
        backgroundColor: "white",
        top: `${coordinatesScaled.y}px`,
        bottom: 0,
        zIndex: 100000,
        left: `${coordinatesScaled.x}px`,
        width: `${coordinatesScaled.width}px`,
        height: `${coordinatesScaled.height}px`,
        marginBottom: `${-coordinatesScaled.height}px`,
        ...style,
    });

    const coordinatesScaled = getCoordinatesScaled();
    const isHighlighted = activeId == id;

    if (disabled) {
        return (
            <div
                className={`maskingitem ${isHighlighted ? "highlighted" : ""} ${isDragging ? "dragging" : ""}`}
                id={id}
                style={getStyle()}
            ></div>
        );
    }
    return (
        <>
            {isHighlighted && !isDragging && <Toolbar id={id} coordinates={coordinatesScaled} />}
            <Resizable
                className={`maskingitem ${isHighlighted ? "highlighted" : ""} ${isDragging ? "dragging" : ""}`}
                {...listeners}
                //@ts-ignore
                id={id}
                {...attributes}
                style={getStyle()}
                onResize={(e, direction, ref, d) => {
                    const coordinates = getCoordinatesAfterResize(d);
                    updateItemDimensions(id, coordinates.width, coordinates.height);
                    document.getElementById(id).style.marginBottom = `${-coordinates.height * scale}px`;
                }}
                onResizeStart={() => {
                    disabledRef.current = true;
                    disableDrag();
                    setCoordinatesResizeStart(coordinates);
                }}
                size={{ width: `${coordinatesScaled.width}px`, height: `${coordinatesScaled.height}px` }}
                onResizeStop={(e, direction, ref, d) => {
                    const coordinates = getCoordinatesAfterResize(d);
                    updateItemDimensions(id, coordinates.width, coordinates.height);
                    disabledRef.current = false;
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
