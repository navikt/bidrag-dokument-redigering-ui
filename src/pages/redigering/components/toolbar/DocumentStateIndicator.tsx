import { CheckmarkCircleFillIcon } from "@navikt/aksel-icons";
import { XMarkOctagonIcon } from "@navikt/aksel-icons";
import { Heading, Loader } from "@navikt/ds-react";
import { CSSProperties } from "react";

import { usePdfEditorContext } from "../PdfEditorContext";
export default function DocumentStateIndicator() {
    const { produceAndSaveProgress } = usePdfEditorContext();

    const getStyle = (): CSSProperties => ({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        gap: "5px",
    });

    function renderSaveState() {
        if (produceAndSaveProgress.state == "SAVING_METADATA") {
            return (
                <>
                    <Loader title={"Lagrer..."} size={"xsmall"} variant="inverted" />
                    <Heading size={"xsmall"}>Lagrer...</Heading>
                </>
            );
        } else if (produceAndSaveProgress.state == "ERROR") {
            return (
                <>
                    <XMarkOctagonIcon color={"white"} />
                    <Heading size={"xsmall"}>Kunne ikke lagre</Heading>
                </>
            );
        }
        return (
            <>
                <CheckmarkCircleFillIcon color={"white"} />
                <Heading size={"xsmall"}>Lagret</Heading>{" "}
            </>
        );
    }

    return (
        <div style={getStyle()} className={"save-state-indicator"}>
            {renderSaveState()}
        </div>
    );
}
