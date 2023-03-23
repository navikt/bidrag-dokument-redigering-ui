import { EraserIcon, EyeIcon } from "@navikt/aksel-icons";
import { Add, Minus } from "@navikt/ds-icons";
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
    onToggleSidebar: () => void;
}
export default function EditorToolbar({
    pagesCount,
    onZoomIn,
    onZoomOut,
    onToggleSidebar,
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
                    <div>
                        {currentPageNotIncludingRemoved} av {pagesCount}
                    </div>
                </div>
                <div className={"buttons_right"}>
                    <Button
                        onClick={previewPdf}
                        size={"small"}
                        variant={"tertiary"}
                        style={{ color: "white" }}
                        icon={<EyeIcon />}
                    />
                    <Button
                        onClick={() => addItem(currentPage)}
                        size={"small"}
                        variant={"tertiary"}
                        style={{ color: "white" }}
                        icon={<EraserIcon />}
                    />
                    <Button onClick={onZoomOut} size={"small"} variant={"tertiary"} style={{ color: "white" }}>
                        <Minus />
                    </Button>
                    <Button onClick={onZoomIn} size={"small"} variant={"tertiary"} style={{ color: "white" }}>
                        <Add />
                    </Button>

                    <div className={"divider"}></div>
                    <SavePdfButton />
                    {showSubmitButton && <FinishPdfButton />}
                </div>
            </div>
        </div>
    );
}
