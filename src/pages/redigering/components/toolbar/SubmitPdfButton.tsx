import { FileCheckmarkIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, ConfirmationPanel, Heading, Modal } from "@navikt/ds-react";
import { useState } from "react";
import React from "react";

import { usePdfEditorContext } from "../PdfEditorContext";

export default function SubmitPdfButton() {
    const { finishPdf } = usePdfEditorContext();
    const [producingDocument, setProducingDocument] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isConfirmedFinishedEditing, setConfirmedFinishedEditing] = useState(false);
    const [error, setError] = useState(false);
    async function _producePdf() {
        if (!isConfirmedFinishedEditing) {
            setError(true);
            return;
        }
        setProducingDocument(true);

        await finishPdf().finally(() => {
            setProducingDocument(false);
            closeModal();
        });
    }

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
                    <Modal.Content>
                        <Heading spacing size={"large"}>
                            Er du ferdig med å kontrollere dokumentet?
                        </Heading>
                        <BodyShort spacing>
                            Velger du å ferdigstille dokumentet vil redigert dokument lagres og status på dokumentet bli
                            satt til "KONTROLLERT".
                            <br /> Dokumentet vil da kunne distribueres.
                        </BodyShort>
                        <ConfirmationPanel
                            size="small"
                            checked={isConfirmedFinishedEditing}
                            label="Ja, jeg bekrefter at jeg har kontrollert dokumentet."
                            error={error ? "Du må bekrefte før kan ferdigstille" : false}
                            onChange={() => setConfirmedFinishedEditing((x) => !x)}
                        >
                            Bekreft at du har sett gjennom dokumentet og "slettet" sensitiv informasjon som ikke skal
                            være med i forsendelsen.
                        </ConfirmationPanel>
                        <div className={"flex flex-row gap-2 pt-2"}>
                            <Button variant={"primary"} onClick={_producePdf} loading={producingDocument}>
                                Ferdigstill
                            </Button>
                            <Button variant={"tertiary"} onClick={closeModal}>
                                Avbryt
                            </Button>
                        </div>
                    </Modal.Content>
                </Modal>
            )}
        </>
    );
}
