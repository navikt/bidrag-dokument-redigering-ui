import { FloppydiskIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, Modal } from "@navikt/ds-react";
import { useState } from "react";
import React from "react";

import { usePdfEditorContext } from "../PdfEditorContext";

export default function SavePdfButton() {
    const { savePdf } = usePdfEditorContext();
    const [savingDocument, setSavingDocument] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    async function _savePdf() {
        setSavingDocument(true);

        await savePdf(true).finally(() => {
            setSavingDocument(false);
        });
    }
    const openModal = () => setModalOpen(true);
    const closeModal = () => {
        setModalOpen(false);
    };
    return (
        <>
            <Button
                loading={savingDocument}
                size={"small"}
                onClick={openModal}
                variant={"tertiary-neutral"}
                icon={<FloppydiskIcon />}
            >
                Lagre og lukk
            </Button>
            {modalOpen && (
                <Modal
                    open
                    onClose={closeModal}
                    closeOnBackdropClick
                    portal
                    header={{
                        heading: "Lagre og lukk",
                        closeButton: true,
                    }}
                >
                    <Modal.Body>
                        <BodyShort>Er du sikker på at du vil avslutte redigering?</BodyShort>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="small" variant={"primary"} onClick={_savePdf} loading={savingDocument}>
                            Lagre og lukk
                        </Button>
                        <Button size="small" variant={"tertiary"} onClick={closeModal}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
}
