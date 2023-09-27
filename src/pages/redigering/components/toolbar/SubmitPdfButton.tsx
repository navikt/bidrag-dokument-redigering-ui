import { FileCheckmarkIcon } from "@navikt/aksel-icons";
import { LoggerService } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, Heading, Modal } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import React from "react";

import { usePdfEditorContext } from "../PdfEditorContext";
import ProduceDocumentStateIndicator from "./ProduceDocumentStateIndicator";

export default function SubmitPdfButton() {
    const { finishPdf, dokumentreferanse, forsendelseId } = usePdfEditorContext();
    const [producingDocument, setProducingDocument] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isConfirmedFinishedEditing, setConfirmedFinishedEditing] = useState(false);
    const [error, setError] = useState(false);
    const [submitError, setSubmitError] = useState<string>();
    async function _producePdf() {
        // if (!isConfirmedFinishedEditing) {
        //     setError(true);
        //     return;
        // }
        setProducingDocument(true);

        await finishPdf()
            .finally(() => {
                setProducingDocument(false);
            })
            .then(closeModal)
            .catch((error) => {
                LoggerService.error(
                    `Det skjedde en feil ved produsering av dokument ${dokumentreferanse} i forsendelse ${forsendelseId}`,
                    error
                );
                if (typeof error == "string") {
                    setSubmitError(error ?? "ukjent feil");
                } else {
                    setSubmitError(error?.message ?? "ukjent feil");
                }
            });
    }
    useEffect(() => {
        Modal.setAppElement("body");
    }, []);
    const openModal = () => setModalOpen(true);
    const closeModal = () => {
        setModalOpen(false);
        setConfirmedFinishedEditing(false);
    };
    return (
        <>
            <Button
                loading={producingDocument}
                size={"small"}
                onClick={openModal}
                variant={"primary"}
                icon={<FileCheckmarkIcon />}
            >
                Ferdigstill
            </Button>
            {modalOpen && (
                <Modal open onClose={closeModal} closeButton shouldCloseOnEsc shouldCloseOnOverlayClick>
                    <Modal.Content className="max-w-[800px]">
                        <Heading spacing size={"large"}>
                            Er du ferdig med å kontrollere dokumentet?
                        </Heading>
                        <BodyShort spacing>
                            Velger du å ferdigstille dokumentet vil redigert dokument lagres og status på dokumentet bli
                            satt til "KONTROLLERT". Det er mulig å låse opp for redigering senere hvis du ombestemmer
                            deg.
                        </BodyShort>
                        <Alert variant="warning" size="small" className="w-max">
                            Før du ferdigstiller er det viktig at du har sett gjennom HELE dokumentet og "slettet"
                            sensitiv informasjon som mottaker ikke skal ha innsyn på.
                        </Alert>
                        {/* <ConfirmationPanel
                            size="small"
                            checked={isConfirmedFinishedEditing}
                            label="Ja, jeg bekrefter at jeg har kontrollert dokumentet."
                            error={error ? "Du må bekrefte før kan ferdigstille" : false}
                            onChange={() => setConfirmedFinishedEditing((x) => !x)}
                        >
                            Bekreft at du har sett gjennom dokumentet og "slettet" sensitiv informasjon som mottaker ikke skal ha innsyn på.
                        </ConfirmationPanel> */}
                        <ProduceDocumentStateIndicator />
                        {submitError && (
                            <Alert
                                variant="error"
                                size="small"
                                className="mt-3 mb-3"
                            >{`Kunne ikke ferdigstille dokument: ${submitError}`}</Alert>
                        )}
                        <div className={"flex flex-row gap-2 pt-2"}>
                            <Button size="small" variant={"primary"} onClick={_producePdf} loading={producingDocument}>
                                Ferdigstill og lukk
                            </Button>
                            <Button size="small" variant={"tertiary"} onClick={closeModal}>
                                Avbryt
                            </Button>
                        </div>
                    </Modal.Content>
                </Modal>
            )}
        </>
    );
}
