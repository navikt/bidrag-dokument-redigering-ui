import { PadlockUnlockedIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, Heading, Modal } from "@navikt/ds-react";
import { useState } from "react";
import React from "react";

import { DokumentQueryKeys, RedigeringQueries } from "../../../../api/queries";
import { queryClient } from "../../../PageWrapper";
import { usePdfEditorContext } from "../PdfEditorContext";

export default function UnlockPdfButton() {
    const { forsendelseId, dokumentreferanse, dokumentMetadata } = usePdfEditorContext();
    const opphevFerdigstillFn = RedigeringQueries.opphevFerdigstillDokument(forsendelseId, dokumentreferanse);
    const [modalOpen, setModalOpen] = useState(false);

    const openModal = () => setModalOpen(true);
    const closeModal = () => {
        setModalOpen(false);
    };

    function unlockDocument() {
        opphevFerdigstillFn.mutate(null, {
            onSuccess: () =>
                queryClient.refetchQueries(DokumentQueryKeys.hentDokumentMetadata(forsendelseId, dokumentreferanse)),
        });
    }
    function renderModal() {
        if (!modalOpen) return null;
        if (dokumentMetadata.forsendelseState == "EDITABLE") {
            return (
                <Modal open onClose={closeModal} closeButton shouldCloseOnEsc shouldCloseOnOverlayClick>
                    <Modal.Content>
                        <Heading spacing size={"large"}>
                            Ønsker du å låse opp dokumentet for redigering?
                        </Heading>
                        <BodyShort spacing>
                            Dokumentet er ferdigstilt og er låst for ytterlige endringer. <br /> Hvis du ønsker å gjøre
                            flere endringer må dokumentet låses opp igjen. <br />
                            Vær oppmerksom på at dokumentet igjen da må ferdigstilles etter redigering er ferdig.
                        </BodyShort>
                        <div className={"flex flex-row gap-2 pt-2"}>
                            <Button
                                variant={"primary"}
                                onClick={unlockDocument}
                                loading={opphevFerdigstillFn.isLoading}
                            >
                                Lås opp for redigering
                            </Button>
                            <Button variant={"tertiary"} onClick={closeModal}>
                                Avbryt
                            </Button>
                        </div>
                    </Modal.Content>
                </Modal>
            );
        }

        return (
            <Modal open onClose={closeModal} closeButton shouldCloseOnEsc shouldCloseOnOverlayClick>
                <Modal.Content>
                    <Heading spacing size={"large"}>
                        Dokumentet kan ikke redigeres
                    </Heading>
                    <BodyShort spacing>
                        Forsendelsen er ferdigstilt og er låst for ytterlige endringer. Det er ikke mulig å gjøre noe
                        endringer på dette dokumentet
                    </BodyShort>
                    <div className={"flex flex-row gap-2 pt-2"}>
                        <Button variant={"tertiary"} onClick={closeModal}>
                            Avbryt
                        </Button>
                    </div>
                </Modal.Content>
            </Modal>
        );
    }
    return (
        <>
            <Button
                loading={opphevFerdigstillFn.isLoading}
                size={"small"}
                onClick={openModal}
                variant={"secondary"}
                icon={<PadlockUnlockedIcon />}
            >
                Lås opp
            </Button>
            {renderModal()}
        </>
    );
}
