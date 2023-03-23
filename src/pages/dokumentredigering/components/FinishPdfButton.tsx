import { FileCheckmarkIcon } from "@navikt/aksel-icons";
import { Button } from "@navikt/ds-react";
import { useState } from "react";
import React from "react";

import { usePdfEditorContext } from "./PdfEditorContext";

export default function FinishPdfButton() {
    const { finishPdf } = usePdfEditorContext();
    const [producingDocument, setProducingDocument] = useState(false);
    async function _producePdf() {
        setProducingDocument(true);

        await finishPdf().finally(() => {
            setProducingDocument(false);
        });
    }
    return (
        <Button
            loading={producingDocument}
            size={"small"}
            onClick={_producePdf}
            variant={"primary-neutral"}
            style={{ color: "white" }}
            icon={<FileCheckmarkIcon />}
        >
            Ferdigstill
        </Button>
    );
}
