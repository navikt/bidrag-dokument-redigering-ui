import { EyeIcon } from "@navikt/aksel-icons";
import { BodyLong, Button, Popover } from "@navikt/ds-react";
import React, { useRef } from "react";

import { usePdfEditorContext } from "../PdfEditorContext";
import ProduceDocumentStateIndicator from "./ProduceDocumentStateIndicator";

export default function PreviewDocumentButton() {
    const { previewPdf, produceAndSaveProgress } = usePdfEditorContext();
    const divRef = useRef(null);

    return (
        <>
            <Button
                onClick={previewPdf}
                ref={divRef}
                size={"small"}
                loading={produceAndSaveProgress.state == "PRODUCING"}
                variant={"tertiary-neutral"}
                icon={<EyeIcon />}
                iconPosition={"left"}
            >
                Vis
            </Button>
            {produceAndSaveProgress.state == "PRODUCING" && (
                <Popover open onClose={() => null} anchorEl={divRef?.current} placement={"bottom"}>
                    <Popover.Content>
                        <BodyLong style={{ maxWidth: 300, padding: "10px" }}>
                            <ProduceDocumentStateIndicator />
                        </BodyLong>
                    </Popover.Content>
                </Popover>
            )}
        </>
    );
}
