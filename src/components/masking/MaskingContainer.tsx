import { DndContext, MouseSensor, useSensor, useSensors } from "@dnd-kit/core";
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

import { IMaskingItemProps } from "./MaskingItem";
import MaskingUtils from "./MaskinUtils";
export interface MaskingContainerContextProps {
    items: IMaskingItemProps[];
    initItems: (items: IMaskingItemProps[]) => void;
    isAddNewElementMode: boolean;
    activeId: string;
    addItem: (pageNumber: number, scale: number, x: number, y: number) => void;
    initAddItem: () => void;
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
    const [activeId, setActiveId] = useState(null);
    const [dragDisabled, setDragDisabled] = useState(false);
    const [addNewElementMode, setAddNewElementMode] = useState(false);
    const sensors = useSensors(useSensor(MouseSensor));

    const initAddItem = () => setAddNewElementMode(true);
    const hasGhostItem = () => getGhostedItem() != null;
    const getGhostedItem = () => maskingItems.find((item) => item.ghosted);

    function keyDownHandler(e: React.KeyboardEvent) {
        if (e.key == "Escape") {
            hasGhostItem() && removeItem(getGhostedItem().id);
            setAddNewElementMode(false);
        } else if (e.key == "+") {
            initAddItem();
        }
    }

    function handleDragStart(event) {
        setActiveId(event.active.id);
    }

    function updateItemDimensions(itemId: string, width: number, height: number) {
        setMaskingItems((items) => [
            ...items.map((item) => {
                if (item.id == itemId) {
                    return {
                        ...item,
                        ghosted: false,
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
        setAddNewElementMode(false);
    }

    function addItem(pageNumber: number, scale: number, x: number, y: number) {
        if (hasGhostItem()) return;
        const parentId = `droppable_page_${pageNumber}`;

        setMaskingItems((items) => [
            ...items,
            {
                id: uuidV4(),
                parentId,
                ghosted: addNewElementMode,
                coordinates: { x: x / scale, y: y / scale, height: 0, width: 0 },
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
        const scale = event.active?.data?.current?.scale ?? 1;
        setMaskingItems((items) => [
            ...items.map((item) => {
                if (item.id == itemId) {
                    return {
                        ...item,
                        parentId: event.over?.id ?? item.parentId,
                        coordinates: {
                            ...MaskingUtils.getDragEndCoordinates(event, item.coordinates, scale),
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
        <div tabIndex={-1} onKeyDown={keyDownHandler}>
            <DndContext
                onDragStart={handleDragStart}
                onDragEnd={onDragEnd}
                sensors={sensors}
                autoScroll={!dragDisabled}
                modifiers={[restrictToParentElemen2t, disableDrag]}
            >
                <MaskingContainerContext.Provider
                    value={{
                        items: maskingItems,
                        isAddNewElementMode: addNewElementMode,
                        activeId,
                        initItems: setMaskingItems,
                        initAddItem,
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
        </div>
    );
}

export { MaskingContainer, useMaskingContainer };
