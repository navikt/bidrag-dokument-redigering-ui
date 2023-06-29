import "./FloatingToolbar.css";

import { DndContext, DragEndEvent, useDndMonitor, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { EraserIcon, MinusIcon } from "@navikt/aksel-icons";
import { DragHorizontalIcon } from "@navikt/aksel-icons";
import { ShrinkIcon } from "@navikt/aksel-icons";
import { FileXMarkIcon } from "@navikt/aksel-icons";
import { ArrowRedoIcon, ArrowUndoIcon } from "@navikt/aksel-icons";
import { Add } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";
import React, { useEffect, useRef, useState } from "react";

import { useMaskingContainer } from "../../../../components/masking/MaskingContainer";
import { usePdfViewerContext } from "../../../../components/pdfviewer/PdfViewerContext";
import { usePdfEditorContext } from "../PdfEditorContext";
const id = "floating-toolbar";
const getInitialPosition = () => {
    const height = window.innerHeight / 2;
    const width = window.innerWidth - 200;
    return {
        left: width,
        top: height,
    };
};

export default function FloatingToolbar() {
    return (
        <DndContext>
            <FloatingToolbarContainer />
        </DndContext>
    );
}
function FloatingToolbarContainer() {
    const [position, setPosition] = useState(getInitialPosition());
    const { scale, zoom, pagesCount, currentPage } = usePdfViewerContext();
    const { resetZoom, onZoomOut, onZoomIn } = zoom;
    const { removedPages, mode, dokumentMetadata, toggleDeletedPage } = usePdfEditorContext();
    const { initAddItem } = useMaskingContainer();

    const { setNodeRef, attributes, listeners, transform } = useDraggable({
        id,
    });
    useDndMonitor({
        onDragEnd(event: DragEndEvent) {
            if (event.active.id == id) {
                setPosition((preValue) => ({
                    ...preValue,
                    left: preValue.left + event.delta.x,
                    top: preValue.top + event.delta.y,
                }));
            }
        },
    });

    const windowWidth = useRef(window.innerWidth);
    const windowHeight = useRef(window.innerHeight);
    function updatePositionOnResize() {
        const deltaW = windowWidth.current - window.innerWidth;
        const deltaH = windowHeight.current - window.innerHeight;
        windowHeight.current = window.innerHeight;
        windowWidth.current = window.innerWidth;
        setPosition((prevState) => {
            return {
                top: Math.min(Math.max(200, prevState.top - deltaH), window.innerHeight - 200),
                left: Math.min(Math.max(400, prevState.left - deltaW), window.innerWidth - 200),
            };
        });
    }

    useEffect(() => {
        window.addEventListener("resize", updatePositionOnResize);
        return () => window.removeEventListener("resize", updatePositionOnResize);
    }, []);

    function removedPagesBefore(pageNumber: number) {
        return removedPages.filter((p) => p < pageNumber);
    }
    const style = {
        transform: CSS.Translate.toString(transform),
    };
    const currentPageNotIncludingRemoved = currentPage - removedPagesBefore(currentPage).length;
    const isEditMode = mode == "edit";

    const isEditable = dokumentMetadata?.state == "EDITABLE" || mode == "remove_pages_only";
    const editedPagesCount = pagesCount - removedPages.length;
    return (
        <div ref={setNodeRef} className={"floating-toolbar"} style={{ ...style, ...position }}>
            <Button
                {...listeners}
                {...attributes}
                className={"handle"}
                variant={"tertiary-neutral"}
                size={"small"}
                icon={<DragHorizontalIcon />}
            ></Button>
            <div className={"buttons_row"}>
                <div className={"zoom_buttons"}>
                    <Button onClick={resetZoom} size={"xsmall"} variant={"tertiary-neutral"} icon={<ShrinkIcon />} />
                    <Button
                        onClick={() => onZoomOut()}
                        size={"xsmall"}
                        variant={"tertiary-neutral"}
                        icon={<MinusIcon />}
                    />
                    <Button onClick={() => onZoomIn()} size={"xsmall"} variant={"tertiary-neutral"} icon={<Add />} />
                </div>
                <div className={"divider"}></div>
                <div style={{ marginLeft: "10px", marginRight: "10px" }}>
                    {currentPageNotIncludingRemoved} av {editedPagesCount}
                </div>
                <div className={"divider"}></div>
                {isEditMode && isEditable && (
                    <div className={"editor_buttons"}>
                        <Button
                            // onClick={() => initAddItem(currentPage, scale, currentPageNotIncludingRemoved)}
                            onClick={initAddItem}
                            size={"small"}
                            variant={"tertiary-neutral"}
                            icon={<EraserIcon />}
                            iconPosition={"left"}
                        >
                            Masker
                        </Button>

                        <Button
                            onClick={() => {
                                toggleDeletedPage(currentPage);
                            }}
                            size={"small"}
                            variant={"tertiary-neutral"}
                            icon={<FileXMarkIcon />}
                            iconPosition={"left"}
                        >
                            Fjern side
                        </Button>
                        <UndoRedoButtons />
                    </div>
                )}
            </div>
        </div>
    );
}

function UndoRedoButtons() {
    const { onRedo, onUndo, history } = usePdfEditorContext();

    return (
        <div className={"undo_redo_buttons"}>
            <Button
                onClick={onUndo}
                size={"small"}
                disabled={!history.canUndo}
                variant={"tertiary-neutral"}
                icon={<ArrowUndoIcon />}
                iconPosition={"left"}
            ></Button>
            <Button
                onClick={onRedo}
                disabled={!history.canRedo}
                size={"small"}
                variant={"tertiary-neutral"}
                icon={<ArrowRedoIcon />}
                iconPosition={"left"}
            ></Button>
        </div>
    );
}
