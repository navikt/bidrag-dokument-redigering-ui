import { CheckmarkCircleFillIcon } from "@navikt/aksel-icons";
import { Heading, Loader } from "@navikt/ds-react";
import { CSSProperties } from "react";
import { useIsMutating } from "react-query";

import { DokumentQueryKeys } from "../../../../api/queries";
import { usePdfEditorContext } from "../PdfEditorContext";
export default function DocumentStateIndicator() {
    const { forsendelseId, dokumentreferanse } = usePdfEditorContext();
    const isSaving = useIsMutating(DokumentQueryKeys.lagreDokumentMetadata(forsendelseId, dokumentreferanse));

    const getStyle = (): CSSProperties => ({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        gap: "5px",
    });

    return (
        <div style={getStyle()} className={"save-state-indicator"}>
            {!isSaving ? (
                <>
                    <CheckmarkCircleFillIcon color={"white"} />
                    <Heading size={"xsmall"}>Lagret</Heading>{" "}
                </>
            ) : (
                <>
                    <Loader title={"Lagrer..."} size={"xsmall"} stroke={"white"} />
                    <Heading size={"xsmall"}>Lagrer...</Heading>
                </>
            )}
        </div>
    );
}
