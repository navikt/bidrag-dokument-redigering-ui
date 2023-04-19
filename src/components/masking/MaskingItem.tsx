import "./MaskinItem.css";

import { DragEndEvent, useDndMonitor, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { TrashIcon } from "@navikt/aksel-icons";
import { Resizable } from "re-resizable";
import React, { CSSProperties, useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

import DomUtils from "../utils/DomUtils";
import { useMaskingContainer } from "./MaskingContainer";
import MaskingUtils from "./MaskinUtils";
export interface ICoordinates {
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
    ghosted?: boolean;
    disabled?: boolean;
    scale?: number;
    coordinates: ICoordinates;
    parentId: string | number;
    pageNumber: number;
}

const getStyle = (coordinatesScaled: ICoordinates): CSSProperties => ({
    position: "relative",
    backgroundColor: "white",
    top: `${coordinatesScaled.y}px`,
    bottom: 0,
    zIndex: 100000,
    left: `${coordinatesScaled.x}px`,
    width: `${coordinatesScaled.width}px`,
    height: `${coordinatesScaled.height}px`,
    marginBottom: `${-coordinatesScaled.height}px`,
});

const getCoordinatesScaled = (coordinates: ICoordinates, scale: number): ICoordinates => {
    return {
        x: coordinates.x * scale,
        y: coordinates.y * scale,
        width: coordinates.width * scale,
        height: coordinates.height * scale,
    };
};
export default function MaskingItem(props: IMaskingItemProps) {
    const { id, coordinates: _coordinates, scale, disabled = false, ghosted } = props;
    const [coordinatesResizeStart, setCoordinatesResizeStart] = useState<ICoordinates>(_coordinates);
    const [currentCoordinates, setCurrentCoordinates] = useState<ICoordinates>(_coordinates);
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

    useDndMonitor({
        onDragEnd(event: DragEndEvent) {
            const itemId = event.active.id;
            if (itemId == id) {
                setCurrentCoordinates((prev) => MaskingUtils.getDragEndCoordinates(event, prev, scale));
            }
        },
    });

    const { updateItemDimensions, enableDrag, disableDrag, activeId, removeItem } = useMaskingContainer();

    function onKeyDown(e: KeyboardEvent) {
        const isDeleteButtonPressed = e.code.toLowerCase() == "delete";
        if (isSelected && isDeleteButtonPressed) {
            removeItem(id);
        }
    }

    useEffect(() => {
        scaleRef.current = scale;
        setCurrentCoordinates(_coordinates);
    }, [scale, _coordinates]);

    useEffect(() => {
        const element = document.getElementById(id);
        setNodeRef(element);
        setActivatorNodeRef(element);
    }, []);

    const coordinates = currentCoordinates;

    const getCoordinatesAfterResize = (delta: IResizeDelta): ICoordinates => {
        return {
            ...coordinatesResizeStart,
            width: coordinatesResizeStart.width + delta.width / scale,
            height: coordinatesResizeStart.height + delta.height / scale,
        };
    };

    const coordinatesScaled = getCoordinatesScaled(coordinates, scale);
    const isSelected = activeId == id;
    const transformDraggable = transform ? { ...transform, scaleX: 1, scaleY: 1 } : undefined;

    if (disabled) {
        return (
            <div
                className={`maskingitem ${isSelected ? "highlighted" : ""} ${isDragging ? "dragging" : ""}`}
                id={id}
                style={getStyle(coordinatesScaled)}
            ></div>
        );
    }
    if (ghosted) {
        return <GhostedMaskingItem {...props} />;
    }
    return (
        <>
            {isSelected && !isDragging && <Toolbar id={id} coordinates={coordinatesScaled} />}
            <Resizable
                className={`maskingitem ${isSelected ? "highlighted" : ""} ${isDragging ? "dragging" : ""}`}
                {...listeners}
                //@ts-ignore
                onKeyDown={(e) => {
                    onKeyDown(e);
                    listeners.onKeyDown?.(e);
                }}
                //@ts-ignore
                id={id}
                //@ts-ignore
                tabIndex={-1}
                {...attributes}
                style={{
                    ...getStyle(coordinatesScaled),
                    transform: CSS.Transform.toString(transformDraggable),
                }}
                onResize={(e, direction, ref, d) => {
                    const coordinates = getCoordinatesAfterResize(d);
                    setCurrentCoordinates((prevState) => ({
                        ...prevState,
                        width: coordinates.width,
                        height: coordinates.height,
                    }));
                    // updateItemDimensions(id, coordinates.width, coordinates.height);
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

function GhostedMaskingItem({ id, coordinates: _coordinates, parentId, scale }: IMaskingItemProps) {
    const [currentCoordinates, setCurrentCoordinates] = useState<ICoordinates>(_coordinates);
    const { updateItemDimensions, removeItem } = useMaskingContainer();
    const hasMouseMoved = useRef(false);
    function calculateWidthHeight(e: MouseEvent) {
        const parentElement = document.getElementById(parentId as string);
        const { x, y } = DomUtils.getMousePosition(parentId as string, e);
        const yRelative = y - parentElement.clientHeight;
        const deltaX = x - currentCoordinates.x * scale;
        const deltaY = yRelative - currentCoordinates.y * scale;
        const width = Math.max(10, currentCoordinates.width + deltaX) / scale;
        const height = Math.max(10, currentCoordinates.height + deltaY) / scale;
        return { height, width };
    }

    function onMouseMove(e: MouseEvent) {
        hasMouseMoved.current = true;
        const { height, width } = calculateWidthHeight(e);
        setCurrentCoordinates((prevState) => ({
            ...prevState,
            width,
            height,
        }));
    }

    function onMouseUp(e: MouseEvent) {
        if (hasMouseMoved.current == false) {
            removeItem(id);
            return;
        }
        const { height, width } = calculateWidthHeight(e);
        setCurrentCoordinates((prevState) => ({
            ...prevState,
            width,
            height,
        }));
        if (width == 0 || height == 0) {
            removeItem(id);
        } else {
            updateItemDimensions(id, width, height);
        }
    }

    useEffect(() => {
        const parentElement = document.getElementById(parentId as string);
        parentElement.addEventListener("mousemove", onMouseMove);
        return () => parentElement.removeEventListener("mousemove", onMouseMove);
    }, []);

    useEffect(() => {
        const parentElement = document.getElementById(parentId as string);
        parentElement.addEventListener("mouseup", onMouseUp);
        return () => parentElement.removeEventListener("mouseup", onMouseUp);
    }, []);

    const coordinatesScaled = getCoordinatesScaled(currentCoordinates, scale);

    return <div id={id} className={"maskingitem"} style={getStyle(coordinatesScaled)}></div>;
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
