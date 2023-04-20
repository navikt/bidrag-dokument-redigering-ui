import { BodyLong, BodyShort } from "@navikt/ds-react";
import ProgressBar from "@ramonak/react-progress-bar";
import React from "react";

import { usePdfEditorContext } from "../PdfEditorContext";

export default function ProduceDocumentStateIndicator() {
    const { produceAndSaveProgress } = usePdfEditorContext();

    if (produceAndSaveProgress.state == "IDLE") {
        return null;
    }
    function renderText() {
        if (produceAndSaveProgress.state == "PRODUCING") {
            return "Klargjør dokumentet. Vennligst vent";
        } else if (produceAndSaveProgress.state == "SAVING_DOCUMENT") {
            return "Lagrer dokumentet. Vennligst vent";
        }
    }
    return (
        <BodyLong style={{ maxWidth: 300, padding: "10px" }}>
            <BodyShort>{renderText()}</BodyShort>
            <ProgressBar
                className={"progress-bar"}
                completed={produceAndSaveProgress.progress ?? 100}
                bgColor={"var(--a-surface-success)"}
                baseBgColor={"var(--a-surface-subtle)"}
                borderRadius={"var(--a-border-radius-xlarge)"}
            />
        </BodyLong>
    );
}
