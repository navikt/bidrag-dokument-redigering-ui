import { DndContext } from "@dnd-kit/core";
import { DragEndEvent } from "@dnd-kit/core";
import { Modifier } from "@dnd-kit/core";
import { ClientRect } from "@dnd-kit/core";
import { Active } from "@dnd-kit/core/dist/store";
import { Transform } from "@dnd-kit/utilities";
import React from "react";
import { PropsWithChildren } from "react";
import { useContext } from "react";
import { useState } from "react";
import { v4 as uuidV4 } from "uuid";

import History from "../history/History";
import { IMaskingItemProps } from "./MaskingItem";
export interface MaskingContainerContextProps {
    items: IMaskingItemProps[];
    init: (items: IMaskingItemProps[]) => void;
    activeId: string;
    addItem: (pageNumber: number, scale: number, pageNumberNotIncludingRemoved: number) => void;
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
        return { items: [] } as MaskingContainerContextProps;
    }
    return context;
}

function MaskingContainer({ children, items }: PropsWithChildren<{ items?: IMaskingItemProps[] }>) {
    const [maskingItems, setMaskingItems] = useState<IMaskingItemProps[]>(items ?? []);
    const [maskingItemsHistory, setMaskingItemsHistory] = useState<History<IMaskingItemProps[]>>(
        new History<IMaskingItemProps[]>()
    );
    const [activeId, setActiveId] = useState(null);
    const [dragDisabled, setDragDisabled] = useState(false);
    function undo(event) {
        console.log("HERE", event.key, event.ctrlKey);
        if (event.ctrlKey && event.key === "z") {
            console.log("HERE");
            const updatedHistory = maskingItemsHistory.undo(maskingItems);
            setMaskingItems(updatedHistory.previous);
            setMaskingItemsHistory(updatedHistory);
        }
    }
    function redo(event) {
        if (event.ctrlKey && event.key === "z") {
            alert("Undo!");
        }
    }
    // useEffect(() => {
    //     document.addEventListener("keydown", undo);
    //     return () => document.removeEventListener("keydown", undo);
    // }, []);
    function handleDragStart(event) {
        setActiveId(event.active.id);
    }

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
    function addItem(pageNumber: number, scale: number, pageNumberNotIncludingRemoved: number) {
        const parentId = `droppable_page_${pageNumber}`;
        const canvasElement = document.getElementById(parentId).querySelector("canvas");
        const pdfContainer = document.querySelector(".pdfviewer_container .pdfrenderer_container");

        const x = canvasElement.clientWidth / 2 / scale;
        const scrollOffsett = pdfContainer.scrollTop - (pageNumberNotIncludingRemoved - 1) * canvasElement.clientHeight;
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
        setMaskingItems((items) => [...items.filter((item) => item.id !== id)]);
    }
    function onDragEnd(event: DragEndEvent) {
        setDragDisabled(false);
        const itemId = event.active.id;
        const delta = event.delta;
        const scale = event.active?.data?.current?.scale ?? 1;
        // setMaskingItemsHistory(maskingItemsHistory.push(maskingItems));
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
                    init: setMaskingItems,
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
                    {children}
                </div>
            </MaskingContainerContext.Provider>
        </DndContext>
    );
}

export { MaskingContainer, useMaskingContainer };
