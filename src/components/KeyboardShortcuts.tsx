import { useEffect } from "react";

import { usePdfEditorContext } from "../pages/redigering/components/PdfEditorContext";
import { useWindowListener } from "./hooks/useListener";
import { useMaskingContainer } from "./masking/MaskingContainer";

export default function KeyboardShortcuts() {
    const { activeId, removeItem, duplicateItem, initAddItem, exitAddItemMode, isAddNewElementMode } =
        useMaskingContainer();

    const { onUndo, onRedo } = usePdfEditorContext();

    useEffect(() => {
        document.oncontextmenu = (e: MouseEvent) => {
            if (isAddNewElementMode) {
                e.preventDefault();
            }
        };
    }, [isAddNewElementMode]);

    useWindowListener(
        "keydown",
        (e: KeyboardEvent) => {
            onRedoUndoEvent(e);
            keyDownHandler(e);
            if (!activeId) return;
            const isDeleteButtonPressed = e.code.toLowerCase() == "delete";
            if (isDeleteButtonPressed) {
                //e.preventDefault();
                removeItem(activeId);
            } else if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() == "d") {
                e.preventDefault();
                duplicateItem(activeId);
            }
        },
        false
    );

    useWindowListener("keyup", () => {
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
