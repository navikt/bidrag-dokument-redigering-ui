import { DndContext, MouseSensor, useSensor, useSensors } from "@dnd-kit/core";
import { DragEndEvent } from "@dnd-kit/core";
import { Active } from "@dnd-kit/core/dist/store";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { Transform } from "@dnd-kit/utilities";
import React, { useRef } from "react";
import { PropsWithChildren } from "react";
import { useContext } from "react";
import { useState } from "react";
import { v4 as uuidV4 } from "uuid";

import { IMaskingItemProps } from "./MaskingItem";
import MaskingUtils from "./MaskinUtils";
export interface MaskingContainerContextProps {
    enabled?: boolean;
    items: IMaskingItemProps[];
    initItems: (items: IMaskingItemProps[]) => void;
    isAddNewElementMode: boolean;
    activeId: string;
    addItem: (pageNumber: number, x: number, y: number) => void;
    initAddItem: () => void;
    exitAddItemMode: (removeDuplicateGhostItem: boolean) => void;
    removeItem: (id: string) => void;
    duplicateItem: (id: string) => void;
    focusItem: (id: string) => void;
    updateItemPosition: (itemId: string, x: number, y: number) => void;
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

function MaskingContainer({
    children,
    items,
    enabled = true,
}: PropsWithChildren<{ items?: IMaskingItemProps[]; enabled?: boolean }>) {
    const [maskingItems, setMaskingItems] = useState<IMaskingItemProps[]>(items ?? []);
    const [activeId, setActiveId] = useState(null);
    const [dragDisabled, setDragDisabled] = useState(false);
    const [addNewElementMode, setAddNewElementMode] = useState(false);
    const sensors = useSensors(useSensor(MouseSensor));

    const divRef = useRef<HTMLDivElement>(null);

    const initAddItem = () => setAddNewElementMode(true);
    const exitAddItemMode = (removeDuplicateGhostItem: boolean) => {
        removeDuplicateGhostItem &&
            hasDuplicatedOrGhostItem() &&
            getDuplicatedOrGhostedItem().map((i) => removeItem(i.id));
        setAddNewElementMode(false);
    };
    const hasDuplicatedOrGhostItem = () => getDuplicatedOrGhostedItem().length > 0;
    const getDuplicatedOrGhostedItem = () =>
        maskingItems.filter((item) => ["DUPLICATED", "GHOSTED"].includes(item.state));

    function handleDragStart(event) {
        setActiveId(event.active.id);
    }

    function updateItemPosition(itemId: string, x: number, y: number) {
        setMaskingItems((items) => [
            ...items.map((item) => {
                if (item.id == itemId) {
                    return {
                        ...item,
                        state: "ITEM" as const,
                        coordinates: {
                            ...item.coordinates,
                            x,
                            y,
                        },
                    };
                }
                return item;
            }),
        ]);
        setAddNewElementMode(false);
    }

    function updateItemDimensions(itemId: string, width: number, height: number) {
        setMaskingItems((items) => [
            ...items.map((item) => {
                if (item.id == itemId) {
                    return {
                        ...item,
                        state: "ITEM" as const,
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
    function focusItem(itemId: string) {
        setActiveId(itemId);
    }
    function duplicateItem(itemId: string) {
        if (hasDuplicatedOrGhostItem()) return;
        setMaskingItems((items) => {
            const originalItem = items.find((item) => item.id == itemId);
            if (originalItem == null) return items;
            return [
                ...items,
                {
                    ...originalItem,
                    id: uuidV4(),
                    state: "DUPLICATED",
                },
            ];
        });
    }
    function addItem(pageNumber: number, x: number, y: number) {
        if (hasDuplicatedOrGhostItem()) return;
        const parentId = `droppable_page_${pageNumber}`;

        setMaskingItems((items) => [
            ...items,
            {
                id: uuidV4(),
                parentId,
                state: addNewElementMode ? "GHOSTED" : "ITEM",
                coordinates: { x, y, height: 0, width: 0 },
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
                        parentId: item.parentId,
                        coordinates: {
                            ...MaskingUtils.getDragEndCoordinates(event, item.coordinates, scale),
                        },
                    };
                }
                return item;
            }),
        ]);
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
        <div tabIndex={0} ref={divRef}>
            <DndContext
                onDragStart={handleDragStart}
                onDragEnd={onDragEnd}
                sensors={sensors}
                autoScroll={!dragDisabled}
                modifiers={[restrictToParentElement, disableDrag]}
            >
                <MaskingContainerContext.Provider
                    value={{
                        items: maskingItems,
                        isAddNewElementMode: addNewElementMode,
                        activeId,
                        enabled,
                        initItems: setMaskingItems,
                        initAddItem,
                        exitAddItemMode,
                        addItem,
                        focusItem,
                        duplicateItem,
                        disableDrag: () => setDragDisabled(true),
                        enableDrag: () => setDragDisabled(false),
                        removeItem,
                        updateItemPosition,
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
