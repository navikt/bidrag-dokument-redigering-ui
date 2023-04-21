import "./MaskinItem.css";

import { DragEndEvent, useDndMonitor, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { TrashIcon } from "@navikt/aksel-icons";
import { FilesIcon } from "@navikt/aksel-icons";
import { Button } from "@navikt/ds-react";
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
    state?: "GHOSTED" | "DUPLICATED" | "ITEM";
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
    const { id, coordinates: _coordinates, scale, disabled = false, state } = props;
    const [coordinatesResizeStart, setCoordinatesResizeStart] = useState<ICoordinates>(_coordinates);
    const [currentCoordinates, setCurrentCoordinates] = useState<ICoordinates>(_coordinates);
    const disabledRef = useRef(false);
    const scaleRef = useRef(scale);
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
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

    const {
        updateItemDimensions,
        enableDrag,
        disableDrag,
        activeId,
        enabled: isMaskingEnabled,
    } = useMaskingContainer();

    useEffect(() => {
        scaleRef.current = scale;
        setCurrentCoordinates(_coordinates);
    }, [scale, _coordinates]);

    useEffect(() => {
        const element = document.getElementById(id);
        setNodeRef(element);
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

    if (disabled || !isMaskingEnabled) {
        return (
            <div
                className={`maskingitem ${isSelected ? "highlighted" : ""} ${isDragging ? "dragging" : ""}`}
                id={id}
                style={getStyle(coordinatesScaled)}
            ></div>
        );
    }
    if (state == "GHOSTED") {
        return <GhostedMaskingItem {...props} />;
    } else if (state == "DUPLICATED") {
        return <DuplicatedMaskingItem {...props} />;
    }
    return (
        <>
            {isSelected && !isDragging && <Toolbar id={id} coordinates={coordinatesScaled} />}
            <Resizable
                className={`maskingitem ${isSelected ? "highlighted" : ""} ${isDragging ? "dragging" : ""}`}
                {...listeners}
                //@ts-ignore
                id={id}
                //@ts-ignore
                tabIndex={isSelected ? 0 : 10000}
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

function DuplicatedMaskingItem({ id, coordinates: _coordinates, parentId, scale }: IMaskingItemProps) {
    const [currentCoordinates, setCurrentCoordinates] = useState<ICoordinates>(_coordinates);
    const { updateItemPosition, focusItem } = useMaskingContainer();
    const hasMouseMoved = useRef(false);
    function calculateCurrentPosition(e: MouseEvent | React.MouseEvent) {
        const parentElement = document.getElementById(parentId as string);
        const { x, y } = DomUtils.getMousePosition(parentId as string, e);
        const coordiantesScaled = getCoordinatesScaled(currentCoordinates, scale);
        const yRelative = y - parentElement.clientHeight;
        const deltaX = x - coordiantesScaled.x;
        const deltaY = yRelative - coordiantesScaled.y;
        const newX = Math.min(
            (parentElement.clientWidth - currentCoordinates.width) / scale,
            Math.max(0, (coordiantesScaled.x + deltaX - coordiantesScaled.width / 2) / scale)
        );
        const newY = Math.min(
            -currentCoordinates.height / scale,
            Math.max(
                -parentElement.clientHeight / scale,
                (coordiantesScaled.y + deltaY - coordiantesScaled.height / 2) / scale
            )
        );
        return { x: newX, y: newY };
    }
    function onMouseMove(e: MouseEvent) {
        hasMouseMoved.current = true;
        const { x, y } = calculateCurrentPosition(e);
        setCurrentCoordinates((prevState) => ({
            ...prevState,
            x,
            y,
        }));
    }

    function onMouseDown(e: React.MouseEvent) {
        e.stopPropagation();
        const { x, y } = calculateCurrentPosition(e);
        setCurrentCoordinates((prevState) => ({
            ...prevState,
            x,
            y,
        }));
        updateItemPosition(id, x, y);
        focusItem(id);
    }

    useEffect(() => {
        const parentElement = document.getElementById(parentId as string);
        parentElement.addEventListener("mousemove", onMouseMove);
        return () => parentElement.removeEventListener("mousemove", onMouseMove);
    }, []);

    const coordinatesScaled = getCoordinatesScaled(currentCoordinates, scale);

    return <div onMouseDown={onMouseDown} id={id} className={"maskingitem"} style={getStyle(coordinatesScaled)}></div>;
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
    const { removeItem, duplicateItem } = useMaskingContainer();

    return (
        <div
            className={"toolbar"}
            style={{
                position: "relative",
                top: `${coordinates.y - 35}px`,
                left: `${coordinates.x}px`,
            }}
        >
            <Button
                onClick={(e) => {
                    removeItem(id);
                }}
                title={"Slett"}
                icon={<TrashIcon fontSize="1.5rem" />}
                className={"toolbar-item"}
                size={"xsmall"}
                variant={"tertiary-neutral"}
            />
            <div className={"separator"} />
            <Button
                title={"Kopier"}
                icon={<FilesIcon fontSize="1.5rem" />}
                className={"toolbar-item"}
                size={"xsmall"}
                variant={"tertiary-neutral"}
                onClick={(e) => {
                    duplicateItem(id);
                }}
            />
        </div>
    );
}
