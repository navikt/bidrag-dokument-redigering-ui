import { FloppydiskIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, Heading, Modal } from "@navikt/ds-react";
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
                <Modal open onClose={closeModal} closeButton shouldCloseOnEsc shouldCloseOnOverlayClick>
                    <Modal.Content>
                        <Heading spacing size={"medium"}>
                            Lagre og lukk
                        </Heading>
                        <BodyShort>Er du sikker på at du vil avslutte redigering?</BodyShort>
                        <div className={"flex flex-row gap-2 pt-2"}>
                            <Button size="small" variant={"primary"} onClick={_savePdf} loading={savingDocument}>
                                Lagre og lukk
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
