import { SaveFile } from "@navikt/ds-icons";
import { Add, Minus } from "@navikt/ds-icons";
import { Hamburger } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";
import React from "react";

import { PdfDocumentType } from "../../../components/pdfview/types";
import { PdfProducerService } from "../pdfproducer/PdfProducerService";
import { usePdfEditorContext } from "./PdfEditorContext";

interface EditorToolbarProps {
    document: PdfDocumentType;
    currentPage: number;
    pagesCount: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onToggleSidebar: () => void;
}
export default function EditorToolbar({
    pagesCount,
    currentPage,
    document,
    onZoomIn,
    onZoomOut,
    onToggleSidebar,
}: EditorToolbarProps) {
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
                        {currentPage} av {pagesCount}
                    </div>
                </div>
                <div className={"buttons_right"}>
                    <Button onClick={onZoomOut} size={"small"} variant={"tertiary"} style={{ color: "white" }}>
                        <Minus />
                    </Button>
                    <Button onClick={onZoomIn} size={"small"} variant={"tertiary"} style={{ color: "white" }}>
                        <Add />
                    </Button>

                    <div className={"divider"}></div>
                    <SavePdfButton dokumentSrc={document} />
                </div>
            </div>
        </div>
    );
}

interface SavePdfButtonProps {
    dokumentSrc: PdfDocumentType;
}
function SavePdfButton({ dokumentSrc }: SavePdfButtonProps) {
    const { deletedPages } = usePdfEditorContext();
    async function producePdf() {
        let existingPdfBytes = dokumentSrc;
        if (typeof dokumentSrc == "string") {
            existingPdfBytes = await fetch(dokumentSrc).then((res) => res.arrayBuffer());
        }
        await PdfProducerService.removePagesAndOpen(existingPdfBytes, deletedPages);
    }
    return (
        <Button size={"small"} onClick={producePdf} variant={"tertiary"} style={{ color: "white" }}>
            <SaveFile />
        </Button>
    );
}
