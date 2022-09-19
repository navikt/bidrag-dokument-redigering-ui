import { SaveFile } from "@navikt/ds-icons";
import { Add, Minus } from "@navikt/ds-icons";
import { Hamburger } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";
import React, { useState } from "react";

import { usePdfEditorContext } from "./PdfEditorContext";

interface EditorToolbarProps {
    currentPage: number;
    pagesCount: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onToggleSidebar: () => void;
}
export default function EditorToolbar({
    pagesCount,
    currentPage,
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
                    <SavePdfButton />
                </div>
            </div>
        </div>
    );
}

function SavePdfButton() {
    const { producePdf } = usePdfEditorContext();
    const [producingDocument, setProducingDocument] = useState(false);
    async function _producePdf() {
        setProducingDocument(true);

        await producePdf().finally(() => {
            setProducingDocument(false);
        });
    }
    return (
        <Button
            loading={producingDocument}
            size={"small"}
            onClick={_producePdf}
            variant={"tertiary"}
            style={{ color: "white" }}
            icon={<SaveFile />}
        >
            Lagre endringer
        </Button>
    );
}
