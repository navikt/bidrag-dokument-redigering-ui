import "./EditorToolbar.css";

import { Hamburger } from "@navikt/ds-icons";
import { Button, Detail } from "@navikt/ds-react";
import React from "react";

import { usePdfEditorContext } from "../PdfEditorContext";
import DocumentStateIndicator from "./DocumentStateIndicator";
import PreviewDocumentButton from "./PreviewDocumentButton";
import SavePdfButton from "./SavePdfButton";
import SubmitPdfButton from "./SubmitPdfButton";
import UnlockPdfButton from "./UnlockPdfButton";

export default function EditorToolbar() {
    const { onToggleSidebar, mode, dokumentMetadata } = usePdfEditorContext();

    const isEditable = dokumentMetadata?.state == "EDITABLE" || mode == "remove_pages_only";
    const isEditMode = mode == "edit";

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
                    {dokumentMetadata?.title && (
                        <Detail className={"pl-2 document-title text-white m-auto"}>{dokumentMetadata.title}</Detail>
                    )}
                </div>
                {isEditable ? (
                    <div className={"buttons_right"}>
                        <DocumentStateIndicator />
                        <PreviewDocumentButton />
                        <SavePdfButton />
                        {isEditMode && <SubmitPdfButton />}
                    </div>
                ) : (
                    <div className={"buttons_right"}>
                        <UnlockPdfButton />
                    </div>
                )}
            </div>
        </div>
    );
}
