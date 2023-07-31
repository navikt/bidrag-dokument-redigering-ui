import { BodyLong, BodyShort } from "@navikt/ds-react";
import React from "react";

import { usePdfEditorContext } from "../PdfEditorContext";

export default function ProduceDocumentStateIndicator() {
    const { produceAndSaveProgress } = usePdfEditorContext();

    if (produceAndSaveProgress.state == "IDLE") {
        return null;
    }
    function renderText() {
        if (produceAndSaveProgress.state == "PRODUCING") {
            return "Klargjør dokumentet. Vennligst vent (Ikke lukk vinduet/fanen).";
        } else if (produceAndSaveProgress.state == "SAVING_DOCUMENT") {
            return "Lagrer dokumentet. Vennligst vent (Ikke lukk vinduet/fanen).";
        }
    }

    const progress = Math.min(100, produceAndSaveProgress.progress ?? 0);
    return (
        <BodyLong className="w-full p-2">
            <BodyShort>{renderText()}</BodyShort>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4 dark:bg-gray-400 mt-2">
                <div
                    className="bg-lightblue-700 h-1.5 rounded-full dark:bg-lightblue-500"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </BodyLong>
    );
}
