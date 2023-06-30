import { useEffect } from "react";

import { usePdfEditorContext } from "../pages/redigering/components/PdfEditorContext";
import { useWindowListener } from "./hooks/useListener";
import { useMaskingContainer } from "./masking/MaskingContainer";

export default function KeyboardShortcuts() {
    const { activeId, removeItem, duplicateItem, initAddItem, exitAddItemMode, addNewElementMode } =
        useMaskingContainer();

    const { onUndo, onRedo } = usePdfEditorContext();

    useEffect(() => {
        document.oncontextmenu = (e) => {
            if (addNewElementMode) {
                e.preventDefault();
            }
        };
    }, [addNewElementMode]);

    useWindowListener("keydown", (e: KeyboardEvent) => {
        console.log(e.key);
        onRedoUndoEvent(e);
        keyDownHandler(e);
        if (!activeId) return;
        const isDeleteButtonPressed = e.code.toLowerCase() == "delete";
        if (isDeleteButtonPressed) {
            removeItem(activeId);
        } else if (e.ctrlKey && e.key?.toLowerCase() == "d") {
            duplicateItem(activeId);
        }
    });

    useWindowListener("keyup", (e: KeyboardEvent) => {
        exitAddItemMode(false);
    });

    function onRedoUndoEvent(event) {
        if (event.ctrlKey && !event.shiftKey && event.key === "z") {
            onUndo();
        } else if (event.ctrlKey && event.shiftKey && event.key === "Z") {
            onRedo();
        }
    }

    function keyDownHandler(e: KeyboardEvent) {
        if (e.key == "Escape") {
            exitAddItemMode(true);
        } else if (e.key == "+" || e.ctrlKey) {
            initAddItem();
        }
    }

    return null;
}
