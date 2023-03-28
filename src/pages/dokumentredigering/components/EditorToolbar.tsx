import "./EditorToolbar.css";

import { EraserIcon, EyeIcon } from "@navikt/aksel-icons";
import { ArrowUndoIcon } from "@navikt/aksel-icons";
import { MinusIcon } from "@navikt/aksel-icons";
import { Add } from "@navikt/ds-icons";
import { Hamburger } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";
import React from "react";

import { useMaskingContainer } from "../../../components/masking/MaskingContainer";
import FinishPdfButton from "./FinishPdfButton";
import { usePdfEditorContext } from "./PdfEditorContext";
import SavePdfButton from "./SavePdfButton";
interface EditorToolbarProps {
    pagesCount: number;
    showSubmitButton?: boolean;
    onZoomIn: () => void;
    onZoomOut: () => void;
    resetZoom: () => void;
    onToggleSidebar: () => void;
    scale: number;
}
export default function EditorToolbar({
    pagesCount,
    onZoomIn,
    onZoomOut,
    resetZoom,
    onToggleSidebar,
    scale,
    showSubmitButton,
}: EditorToolbarProps) {
    const { addItem } = useMaskingContainer();
    const { previewPdf, currentPage, removedPages } = usePdfEditorContext();
    function removedPagesBefore(pageNumber: number) {
        return removedPages.filter((p) => p < pageNumber);
    }
    const currentPageNotIncludingRemoved = currentPage - removedPagesBefore(currentPage).length;
    return (
        <div className={"editor_toolbar"}>
            <div className={"toolbar_content"}>
                <div className={"buttons_left"}>
                    <Button onClick={onToggleSidebar} size={"small"} variant={"tertiary"} style={{ color: "white" }}>
                        <Hamburger />
                    </Button>
                </div>
                <div className={"pages_view"}>
                    <Button
                        onClick={resetZoom}
                        size={"small"}
                        variant={"tertiary-neutral"}
                        style={{ color: "white" }}
                        icon={<ArrowUndoIcon />}
                    />
                    <Button
                        onClick={onZoomOut}
                        size={"small"}
                        variant={"tertiary-neutral"}
                        style={{ color: "white" }}
                        icon={<MinusIcon />}
                    />
                    <Button
                        onClick={onZoomIn}
                        size={"small"}
                        variant={"tertiary-neutral"}
                        style={{ color: "white" }}
                        icon={<Add />}
                    />
                    <div className={"divider"}></div>
                    <div style={{ marginLeft: "10px", marginRight: "10px" }}>
                        {currentPageNotIncludingRemoved} av {pagesCount}
                    </div>
                    <div className={"divider"}></div>
                    <Button
                        onClick={previewPdf}
                        size={"small"}
                        variant={"tertiary-neutral"}
                        style={{ color: "white" }}
                        icon={<EyeIcon />}
                        iconPosition={"left"}
                    >
                        Vis
                    </Button>
                    <Button
                        onClick={() => addItem(currentPage, scale)}
                        size={"small"}
                        variant={"tertiary-neutral"}
                        style={{ color: "white" }}
                        icon={<EraserIcon />}
                        iconPosition={"left"}
                    >
                        Masker
                    </Button>
                </div>
                <div className={"buttons_right"}>
                    <SavePdfButton />
                    {showSubmitButton && <FinishPdfButton />}
                </div>
            </div>
        </div>
    );
}
