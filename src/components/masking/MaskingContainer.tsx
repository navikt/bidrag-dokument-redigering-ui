import { DndContext } from "@dnd-kit/core";
import { DragEndEvent } from "@dnd-kit/core";
import { useSensors } from "@dnd-kit/core";
import { useSensor } from "@dnd-kit/core";
import { Modifier } from "@dnd-kit/core";
import { ClientRect } from "@dnd-kit/core";
import { Active } from "@dnd-kit/core/dist/store";
import { Transform } from "@dnd-kit/utilities";
import React from "react";
import { PropsWithChildren } from "react";
import { useContext } from "react";
import { useState } from "react";
import { v4 as uuidV4 } from "uuid";

import { FocusKeyboardSensor } from "./GhostElementSensor";
import { IMaskingItemProps } from "./MaskingItem";
export interface MaskingContainerContextProps {
    items: IMaskingItemProps[];
    activeId: string;
    addItem: (pageNumber: number, scale: number) => void;
    removeItem: (id: string) => void;
    updateItemDimensions: (itemId: string, width: number, height: number) => void;
    disableDrag: () => void;
    enableDrag: () => void;
}

export const MaskingContainerContext = React.createContext<MaskingContainerContextProps>(
    {} as MaskingContainerContextProps
);
function useMaskingContainer() {
    const context = useContext(MaskingContainerContext);
    if (context === undefined) {
        throw new Error("useDokumenter must be used within a ForsendelseProvider");
    }
    return context;
}

function MaskingContainer({ children }: PropsWithChildren<unknown>) {
    const [maskingItems, setMaskingItems] = useState<IMaskingItemProps[]>([]);
    const [activeId, setActiveId] = useState(null);
    const [dragDisabled, setDragDisabled] = useState(false);
    const sensors = useSensors(useSensor(FocusKeyboardSensor));
    function handleDragStart(event) {
        setActiveId(event.active.id);
    }
    // useEffect(() => {
    //     document.querySelector(".pdfviewer_container .pdfrenderer_container").addEventListener("scroll", () => {
    //         console.log(document.querySelector(".pdfviewer_container .pdfrenderer_container").scrollTop);
    //     });
    // }, []);
    function simulateMouseEvent(el, eventName) {
        let event;
        if (window.MouseEvent && typeof window.MouseEvent === "function") {
            console.log("HERE", eventName);
            event = new MouseEvent(eventName);
            el.dispatchEvent(event);
            const evt_2 = new DragEvent("dragstart");
            el.dispatchEvent(evt_2);
        }
    }
    // function onMouseMove(e) {
    //     const ghosted = maskingItems.find((it) => it.ghosted);
    //     console.log("HERsssE", ghosted);
    //     if (ghosted) {
    //         const itemElement = document.getElementById(ghosted.id).parentElement;
    //         console.log("HERE", itemElement);
    //         simulateMouseEvent(itemElement, "mousedown");
    //     }
    // }
    // useEffect(() => {
    //     const fun = (e) => onMouseMove(e);
    //     document.addEventListener("mousemove", onMouseMove);
    //     return () => document.removeEventListener("mousemove", onMouseMove);
    // }, [maskingItems]);
    function updateItemDimensions(itemId: string, width: number, height: number) {
        setMaskingItems((items) => [
            ...items.map((item) => {
                if (item.id == itemId) {
                    return {
                        ...item,
                        coordinates: {
                            ...item.coordinates,
                            width,
                            height,
                        },
                    };
                }
                return item;
            }),
        ]);
    }
    function addItem(pageNumber: number, scale: number) {
        const parentId = `droppable_page_${pageNumber}`;
        const canvasElement = document.getElementById(parentId).querySelector("canvas");
        const pdfContainer = document.querySelector(".pdfviewer_container .pdfrenderer_container");

        const x = canvasElement.clientWidth / 2 / scale;
        const scrollOffsett = pdfContainer.scrollTop - (pageNumber - 1) * canvasElement.clientHeight;
        const y = (-canvasElement.clientHeight + scrollOffsett + 200) / scale;
        setMaskingItems((items) => [
            ...items,
            {
                parentId,
                id: uuidV4(),
                coordinates: { x: x, y: y, height: 50, width: 200 },
                pageNumber,
            },
        ]);
    }

    function removeItem(id: string) {
        console.log("REMOVE", id);
        setMaskingItems((items) => [...items.filter((item) => item.id !== id)]);
    }
    function onDragEnd(event: DragEndEvent) {
        setDragDisabled(false);
        const itemId = event.active.id;
        const delta = event.delta;
        const scale = event.active?.data?.current?.scale ?? 1;
        setMaskingItems((items) => [
            ...items.map((item) => {
                if (item.id == itemId) {
                    const isAnotherParent = event.over?.id;
                    return {
                        ...item,
                        parentId: event.over?.id ?? item.parentId,
                        coordinates: {
                            ...item.coordinates,
                            x: item.coordinates.x + delta.x / scale,
                            y: item.coordinates.y + delta.y / scale,
                        },
                    };
                }
                return item;
            }),
        ]);
    }
    const restrictToParentElemen2t: Modifier = ({ containerNodeRect, draggingNodeRect, transform }) => {
        if (!draggingNodeRect || !containerNodeRect) {
            return transform;
        }

        return restrictToBoundingRect(transform, draggingNodeRect, containerNodeRect);
    };
    function restrictToBoundingRect(transform: Transform, rect: ClientRect, boundingRect: ClientRect): Transform {
        const value = {
            ...transform,
        };

        if (rect.top + transform.y <= boundingRect.top) {
            value.y = boundingRect.top - rect.top;
        } else if (rect.bottom + transform.y >= boundingRect.top + boundingRect.height) {
            value.y = boundingRect.top + boundingRect.height - rect.bottom;
        }

        if (rect.left + transform.x <= boundingRect.left) {
            value.x = boundingRect.left - rect.left;
        } else if (rect.right + transform.x >= boundingRect.left + boundingRect.width) {
            value.x = boundingRect.left + boundingRect.width - rect.right;
        }

        return value;
    }
    function disableDrag(args: { active: Active | null; transform: Transform }) {
        const { transform } = args;

        if (dragDisabled) {
            return {
                ...transform,
                x: 0,
                y: 0,
            };
        }
        return {
            ...transform,
            x: transform.x,
            y: transform.y,
        };
    }
    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={onDragEnd}
            autoScroll={!dragDisabled}
            modifiers={[restrictToParentElemen2t, disableDrag]}
        >
            <MaskingContainerContext.Provider
                value={{
                    items: maskingItems,
                    activeId,
                    addItem,
                    disableDrag: () => setDragDisabled(true),
                    enableDrag: () => setDragDisabled(false),
                    removeItem,
                    updateItemDimensions,
                }}
            >
                <div
                    onClick={() => {
                        setActiveId(null);
                    }}
                >
                    {/*<DragOverlay>{draggingItem ? <MaskingItem {...draggingItem} /> : null}</DragOverlay>*/}
                    {children}
                </div>
            </MaskingContainerContext.Provider>
        </DndContext>
    );
}

export { MaskingContainer, useMaskingContainer };
