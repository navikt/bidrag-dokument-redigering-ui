import { FloppydiskIcon } from "@navikt/aksel-icons";
import { Button } from "@navikt/ds-react";
import { useState } from "react";
import React from "react";

import { usePdfEditorContext } from "./PdfEditorContext";

export default function SavePdfButton() {
    const { savePdf } = usePdfEditorContext();
    const [producingDocument, setProducingDocument] = useState(false);
    async function _producePdf() {
        setProducingDocument(true);

        await savePdf().finally(() => {
            setProducingDocument(false);
        });
    }
    return (
        <Button
            loading={producingDocument}
            size={"small"}
            onClick={_producePdf}
            variant={"tertiary-neutral"}
            style={{ color: "white" }}
            icon={<FloppydiskIcon />}
        >
            Lagre endringer
        </Button>
    );
}
