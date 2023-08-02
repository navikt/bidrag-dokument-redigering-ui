import "./PopoverToolbar.css";

import { EraserIcon, MinusIcon } from "@navikt/aksel-icons";
import { ExpandIcon, ShrinkIcon } from "@navikt/aksel-icons";
import { FileXMarkIcon } from "@navikt/aksel-icons";
import { ArrowRedoIcon, ArrowUndoIcon } from "@navikt/aksel-icons";
import { Add } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";
import React from "react";

import { useMaskingContainer } from "../../../../components/masking/MaskingContainer";
import { usePdfViewerContext } from "../../../../components/pdfviewer/PdfViewerContext";
import { usePdfEditorContext } from "../PdfEditorContext";

export default function PopoverToolbar() {
    const { scale, zoom, pagesCount, currentPage } = usePdfViewerContext();
    const { resetZoom, onZoomOut, onZoomIn, zoomToFit } = zoom;
    const { removedPages, mode, dokumentMetadata, toggleDeletedPage, isAllowedToDeletePage } = usePdfEditorContext();
    const { initAddItem } = useMaskingContainer();

    function removedPagesBefore(pageNumber: number) {
        return removedPages.filter((p) => p < pageNumber);
    }

    const currentPageNotIncludingRemoved = currentPage - removedPagesBefore(currentPage).length;
    const isEditMode = mode == "edit";

    const isEditable = dokumentMetadata?.state == "EDITABLE" || mode == "remove_pages_only";
    const editedPagesCount = pagesCount - removedPages.length;
    return (
        <div className={"popover-toolbar"}>
            <div className={"buttons_row"}>
                <div className={"zoom_buttons flex flex-row gap-3 text-white"}>
                    {scale > 1 ? (
                        <Button
                            onClick={resetZoom}
                            size={"xsmall"}
                            variant={"tertiary-neutral"}
                            icon={<ShrinkIcon />}
                            title="Tilpass til siden"
                        />
                    ) : (
                        <Button
                            onClick={zoomToFit}
                            size={"xsmall"}
                            variant={"tertiary-neutral"}
                            icon={<ExpandIcon />}
                            title="Tilpass til bredde"
                        />
                    )}
                    <Button
                        onClick={() => onZoomOut()}
                        size={"xsmall"}
                        variant={"tertiary-neutral"}
                        icon={<MinusIcon />}
                        title="Zoom ut"
                    />
                    <div>{Math.round(scale * 100)}%</div>
                    <Button
                        onClick={() => onZoomIn()}
                        size={"xsmall"}
                        variant={"tertiary-neutral"}
                        icon={<Add />}
                        title="Zoom inn"
                    />
                </div>
                <div className={"divider"}></div>
                <div style={{ marginLeft: "10px", marginRight: "10px" }} className="flex flex-row gap-2 text-white">
                    <div>{currentPageNotIncludingRemoved}</div> <div>av</div> <div>{editedPagesCount}</div>
                </div>
                <div className={"divider"}></div>
                {isEditable && (
                    <div className={"editor_buttons"}>
                        {isEditMode && (
                            <Button
                                onClick={initAddItem}
                                size={"small"}
                                variant={"tertiary-neutral"}
                                icon={<EraserIcon />}
                                iconPosition={"left"}
                                title="Ny maskering"
                            >
                                Masker
                            </Button>
                        )}

                        <Button
                            onClick={() => {
                                toggleDeletedPage(currentPage);
                            }}
                            disabled={!isAllowedToDeletePage()}
                            size={"small"}
                            variant={"tertiary-neutral"}
                            icon={<FileXMarkIcon />}
                            iconPosition={"left"}
                            title={isAllowedToDeletePage() ? "Fjern side" : "Kan ikke fjerne alle sider"}
                        >
                            Fjern side
                        </Button>
                        {isEditMode && <UndoRedoButtons />}
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
                title="Angre"
                disabled={!history.canUndo}
                variant={"tertiary-neutral"}
                icon={<ArrowUndoIcon />}
                iconPosition={"left"}
            ></Button>
            <Button
                onClick={onRedo}
                disabled={!history.canRedo}
                size={"small"}
                title="Gjør om"
                variant={"tertiary-neutral"}
                icon={<ArrowRedoIcon />}
                iconPosition={"left"}
            ></Button>
        </div>
    );
}
