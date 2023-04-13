import "./EditorToolbar.css";

import { EraserIcon, EyeIcon } from "@navikt/aksel-icons";
import { ArrowUndoIcon } from "@navikt/aksel-icons";
import { MinusIcon } from "@navikt/aksel-icons";
import { Add } from "@navikt/ds-icons";
import { Hamburger } from "@navikt/ds-icons";
import { Button, Heading } from "@navikt/ds-react";
import React from "react";

import { useMaskingContainer } from "../../../components/masking/MaskingContainer";
import { EditDocumentInitialMetadata } from "../../../types/EditorTypes";
import { usePdfEditorContext } from "./PdfEditorContext";
import SavePdfButton from "./SavePdfButton";
import SubmitPdfButton from "./SubmitPdfButton";
import UnlockPdfButton from "./UnlockPdfButton";
interface EditorToolbarProps {
    pagesCount: number;
    showSubmitButton?: boolean;
    onZoomIn: () => void;
    onZoomOut: () => void;
    resetZoom: () => void;
    onToggleSidebar: () => void;
    scale: number;
    documentMetadata?: EditDocumentInitialMetadata;
}
export default function EditorToolbar({
    pagesCount,
    onZoomIn,
    onZoomOut,
    documentMetadata,
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

    const isEditable = documentMetadata.state == "EDITABLE";
    return (
        <div
            className={"editor_toolbar"}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <div className={"toolbar_content"}>
                <div className={"buttons_left"}>
                    <Button onClick={onToggleSidebar} size={"small"} variant={"tertiary"}>
                        <Hamburger />
                    </Button>
                    {documentMetadata?.title && (
                        <Heading size={"xsmall"} className={"pl-2 document-title"}>
                            {documentMetadata.title}
                        </Heading>
                    )}
                </div>
                <div className={"pages_view"}>
                    <Button onClick={resetZoom} size={"small"} variant={"tertiary-neutral"} icon={<ArrowUndoIcon />} />
                    <Button onClick={onZoomOut} size={"small"} variant={"tertiary-neutral"} icon={<MinusIcon />} />
                    <Button onClick={onZoomIn} size={"small"} variant={"tertiary-neutral"} icon={<Add />} />
                    <div className={"divider"}></div>
                    <div style={{ marginLeft: "10px", marginRight: "10px" }}>
                        {currentPageNotIncludingRemoved} av {pagesCount}
                    </div>
                    <div className={"divider"}></div>
                    {showSubmitButton && isEditable && (
                        <Button
                            onClick={() => addItem(currentPage, scale, currentPageNotIncludingRemoved)}
                            size={"small"}
                            variant={"tertiary-neutral"}
                            icon={<EraserIcon />}
                            iconPosition={"left"}
                        >
                            Masker
                        </Button>
                    )}
                </div>
                {isEditable ? (
                    <div className={"buttons_right"}>
                        <Button
                            onClick={previewPdf}
                            size={"small"}
                            variant={"tertiary-neutral"}
                            icon={<EyeIcon />}
                            iconPosition={"left"}
                        >
                            Vis
                        </Button>
                        <SavePdfButton />
                        {showSubmitButton && <SubmitPdfButton />}
                    </div>
                ) : (
                    <div className={"buttons_right"}>
                        <UnlockPdfButton dokumentMetadata={documentMetadata} />
                    </div>
                )}
            </div>
        </div>
    );
}
