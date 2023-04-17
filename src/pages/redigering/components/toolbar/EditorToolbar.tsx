import "./EditorToolbar.css";

import { EyeIcon } from "@navikt/aksel-icons";
import { Hamburger } from "@navikt/ds-icons";
import { Button, Heading } from "@navikt/ds-react";
import React from "react";

import { usePdfEditorContext } from "../PdfEditorContext";
import DocumentStateIndicator from "./DocumentStateIndicator";
import SavePdfButton from "./SavePdfButton";
import SubmitPdfButton from "./SubmitPdfButton";
import UnlockPdfButton from "./UnlockPdfButton";

export default function EditorToolbar() {
    const { previewPdf, onToggleSidebar, mode, dokumentMetadata } = usePdfEditorContext();

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
                        <Heading size={"xsmall"} className={"pl-2 document-title"}>
                            {dokumentMetadata.title}
                        </Heading>
                    )}
                </div>
                {isEditable ? (
                    <div className={"buttons_right"}>
                        <DocumentStateIndicator />
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
