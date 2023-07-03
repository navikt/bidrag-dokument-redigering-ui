import "./MaskinItem.css";

import { DragEndEvent, useDndMonitor, useDraggable } from "@dnd-kit/core";
import { TrashIcon } from "@navikt/aksel-icons";
import { FilesIcon } from "@navikt/aksel-icons";
import { Button } from "@navikt/ds-react";
import { Resizable } from "re-resizable";
import React, { CSSProperties, useMemo, useState } from "react";
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

const getStyle = (coordinatesScaled: ICoordinates, transform?: { x: number; y: number }): CSSProperties => ({
    position: "relative",
    backgroundColor: "white",
    //@ts-ignore
    "--masking-top": `${coordinatesScaled.y}px`,
    "--masking-left": `${coordinatesScaled.x}px`,
    top: transform ? `calc(var(--masking-top) + ${transform.y}px/var(--scale-factor))` : `var(--masking-top)`,
    left: transform ? `calc(var(--masking-left) + ${transform.x}px/var(--scale-factor))` : `var(--masking-left)`,
    bottom: 0,
    zIndex: 100000,
    width: `calc(var(--scale-factor)*${coordinatesScaled.width}px)`,
    height: `calc(var(--scale-factor)*${coordinatesScaled.height}px)`,
    marginBottom: `calc(var(--scale-factor)*${-coordinatesScaled.height}px)`,
    transformOrigin: "0px 0px",
    transform: "scale(calc(1/var(--scale-factor)))",
});

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

    const coordinates = useMemo(
        () => ({
            ...currentCoordinates,
            width: currentCoordinates.width == 0 ? _coordinates.width : currentCoordinates.width,
            height: currentCoordinates.height == 0 ? _coordinates.height : currentCoordinates.height,
        }),
        [currentCoordinates, _coordinates]
    );

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
    }, [state, _coordinates]);

    useEffect(() => {
        const element = document.getElementById(id);
        element.style.height = `calc(var(--scale-factor) * ${coordinates.height}px)`;
        element.style.width = `calc(var(--scale-factor) * ${coordinates.width}px)`;
    }, [state, coordinates]);

    const getCoordinatesAfterResize = (delta: IResizeDelta): ICoordinates => {
        return {
            ...coordinatesResizeStart,
            width: coordinatesResizeStart.width + delta.width / scale,
            height: coordinatesResizeStart.height + delta.height / scale,
        };
    };

    const isSelected = activeId == id;

    if (disabled || !isMaskingEnabled) {
        return (
            <div
                className={`maskingitem ${isSelected ? "highlighted" : ""} ${isDragging ? "dragging" : ""}`}
                id={id}
                style={getStyle(coordinates)}
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
            {isSelected && !isDragging && <Toolbar scale={scale} id={id} coordinates={coordinates} />}
            <Resizable
                className={`maskingitem ${isSelected ? "highlighted" : ""} ${isDragging ? "dragging" : ""}`}
                {...listeners}
                //@ts-ignore
                id={id}
                //@ts-ignore
                tabIndex={isSelected ? 0 : 10000}
                {...attributes}
                style={{
                    ...getStyle(coordinates, transform),
                    transform: undefined,
                    scale: "calc(1/var(--scale-factor))",
                }}
                onResize={(e, direction, ref, d) => {
                    const coordinates = getCoordinatesAfterResize(d);
                    setCurrentCoordinates((prevState) => ({
                        ...prevState,
                        width: coordinates.width,
                        height: coordinates.height,
                    }));
                    document.getElementById(
                        id
                    ).style.marginBottom = `calc(var(--scale-factor)*${-coordinates.height}px)`;
                }}
                onResizeStart={() => {
                    disabledRef.current = true;
                    disableDrag();
                    setCoordinatesResizeStart(coordinates);
                }}
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
        const yRelative = y / scale - parentElement.clientHeight;
        const deltaX = x / scale - currentCoordinates.x;
        const deltaY = yRelative - currentCoordinates.y;
        const newX = Math.min(
            parentElement.clientWidth - currentCoordinates.width,
            Math.max(0, currentCoordinates.x + deltaX - currentCoordinates.width / 2)
        );
        const newY = Math.min(
            -currentCoordinates.height,
            Math.max(-parentElement.clientHeight, currentCoordinates.y + deltaY - currentCoordinates.height / 2)
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

    return <div onMouseDown={onMouseDown} id={id} className={"maskingitem"} style={getStyle(currentCoordinates)}></div>;
}

function GhostedMaskingItem({ id, coordinates: _coordinates, parentId, scale }: IMaskingItemProps) {
    const [currentCoordinates, setCurrentCoordinates] = useState<ICoordinates>(_coordinates);
    const { updateItemDimensions, removeItem } = useMaskingContainer();
    const hasMouseMoved = useRef(false);
    function calculateWidthHeight(e: MouseEvent) {
        const parentElement = document.getElementById(parentId as string);
        const { x, y } = DomUtils.getMousePosition(parentId as string, e);
        const yRelative = y / scale - parentElement.clientHeight;
        const deltaX = x / scale - currentCoordinates.x;
        const deltaY = yRelative - currentCoordinates.y;
        const width = Math.max(10 / scale, currentCoordinates.width + deltaX);
        const height = Math.max(10 / scale, currentCoordinates.height + deltaY);
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

    return <div id={id} className={"maskingitem"} style={getStyle(currentCoordinates)}></div>;
}

interface IToolbarProps {
    id: string;
    scale: number;
    coordinates: ICoordinates;
}
function Toolbar({ id, coordinates, scale }: IToolbarProps) {
    const { removeItem, duplicateItem } = useMaskingContainer();

    return (
        <>
            <div
                className={"toolbar"}
                id={`toolbar_${id}`}
                style={{
                    position: "relative",
                    top: `calc(${coordinates.y}px - calc(35px/var(--scale-factor))`,
                    left: `${coordinates.x}px`,
                    transform: "scale(calc(1/var(--scale-factor)))",
                    transformOrigin: "0px 0px",
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
        </>
    );
}
