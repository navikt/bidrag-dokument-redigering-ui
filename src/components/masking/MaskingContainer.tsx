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
    addItem: (pageNumber: number) => void;
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
    function addItem(pageNumber: number) {
        const parentId = `droppable_page_${pageNumber}`;
        const parentElement = document.getElementById(parentId).firstElementChild;
        console.log(parentElement.clientHeight, parentElement.scrollHeight, parentId);
        const x = parentElement.clientWidth / 2;
        // const scrollTop = document.getElementById("pdf_document_pages").parentElement.scrollTop;
        const y = -parentElement.clientHeight / 2;
        setMaskingItems((items) => [
            ...items,
            {
                parentId,
                id: uuidV4(),
                coordinates: { x: x, y: y, height: 50, width: 200 },
                pageNumber,
                parentCoordinates: {
                    maxHeight: parentElement.clientHeight,
                    maxWidth: parentElement.clientWidth,
                },
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
        setMaskingItems((items) => [
            ...items.map((item) => {
                if (item.id == itemId) {
                    console.log("PARENT", event.over?.id ?? item.parentId);
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
        const scale = args.active?.data?.current?.scale ?? 1;
        console.log("HERE", transform, scale);
        return {
            ...transform,
            x: transform.x,
            y: transform.y,
        };
    }
    const draggingItem = maskingItems.find((item) => item.id == activeId);
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
                    addItem,
                    disableDrag: () => setDragDisabled(true),
                    enableDrag: () => setDragDisabled(false),
                    removeItem,
                    updateItemDimensions,
                }}
            >
                <>
                    {/*<DragOverlay>{draggingItem ? <MaskingItem {...draggingItem} /> : null}</DragOverlay>*/}
                    {children}
                </>
            </MaskingContainerContext.Provider>
        </DndContext>
    );
}

export { MaskingContainer, useMaskingContainer };
