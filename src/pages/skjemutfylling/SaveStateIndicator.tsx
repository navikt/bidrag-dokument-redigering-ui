import { CheckmarkCircleFillIcon } from "@navikt/aksel-icons";
import { XMarkOctagonIcon } from "@navikt/aksel-icons";
import { Heading, Loader } from "@navikt/ds-react";
import { CSSProperties } from "react";

import { DokumentQueryKeys } from "../../api/queries";
import useMutationState from "../../components/hooks/useMutationState";
import { useSkjemaUtfyllingContext } from "./SkjemaUtfyllingPage";
export default function SaveStateIndicator() {
    const { forsendelseId, dokumentreferanse } = useSkjemaUtfyllingContext();
    const saveState = useMutationState(DokumentQueryKeys.lagreDokumentMetadata(forsendelseId, dokumentreferanse));

    const getStyle = (): CSSProperties => ({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        gap: "5px",
    });

    function renderSaveState() {
        if (saveState == "pending") {
            return (
                <>
                    <Loader title={"Lagrer..."} size={"xsmall"} variant="inverted" />
                    <Heading size={"xsmall"}>Lagrer...</Heading>
                </>
            );
        } else if (saveState == "error") {
            return (
                <>
                    <XMarkOctagonIcon color="white" />
                    <Heading size={"xsmall"}>Lagring feilet :/</Heading>
                </>
            );
        }
        return (
            <>
                <CheckmarkCircleFillIcon color="white" />
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
