import { PadlockUnlockedIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, Modal } from "@navikt/ds-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import React from "react";

import { DokumentQueryKeys, RedigeringQueries } from "../../api/queries";
import { useSkjemaUtfyllingContext } from "./SkjemaUtfyllingPage";

export default function UnlockSkjemaButton() {
    const { forsendelseId, dokumentreferanse, dokumentMetadata } = useSkjemaUtfyllingContext();
    const opphevFerdigstillFn = RedigeringQueries.opphevFerdigstillDokument(forsendelseId, dokumentreferanse);
    const [modalOpen, setModalOpen] = useState(false);

    const queryClient = useQueryClient();
    const openModal = () => setModalOpen(true);
    const closeModal = () => {
        setModalOpen(false);
    };

    function unlockDocument() {
        opphevFerdigstillFn.mutate(null, {
            onSuccess: () => {
                queryClient.refetchQueries({
                    queryKey: DokumentQueryKeys.hentDokumentMetadata(forsendelseId, dokumentreferanse),
                });
                queryClient.refetchQueries({ queryKey: DokumentQueryKeys.hentDokument(dokumentreferanse, null) });
            },
        });
    }
    function renderModal() {
        if (!modalOpen) return null;
        if (dokumentMetadata.forsendelseState == "EDITABLE") {
            return (
                <Modal
                    open
                    onClose={closeModal}
                    closeOnBackdropClick
                    header={{
                        heading: "Ønsker du å låse opp dokumentet for redigering?",
                        closeButton: true,
                    }}
                >
                    <Modal.Body>
                        <BodyShort>
                            Dokumentet er ferdigstilt og er låst for ytterlige endringer. <br /> Hvis du ønsker å gjøre
                            flere endringer må dokumentet låses opp igjen. <br />
                            Vær oppmerksom på at dokumentet igjen da må ferdigstilles etter redigering er ferdig.
                        </BodyShort>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            size="small"
                            variant={"primary"}
                            onClick={unlockDocument}
                            loading={opphevFerdigstillFn.isPending}
                        >
                            Lås opp for redigering
                        </Button>
                        <Button size="small" variant={"tertiary"} onClick={closeModal}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </Modal>
            );
        }

        return (
            <Modal
                open
                onClose={closeModal}
                closeOnBackdropClick
                header={{
                    heading: "Dokumentet kan ikke redigeres",
                    closeButton: true,
                }}
            >
                <Modal.Body>
                    <BodyShort>
                        Forsendelsen er ferdigstilt og er låst for ytterlige endringer. Det er ikke mulig å gjøre noe
                        endringer på dette dokumentet
                    </BodyShort>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant={"tertiary"} onClick={closeModal}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
    return (
        <>
            <Button
                loading={opphevFerdigstillFn.isPending}
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
