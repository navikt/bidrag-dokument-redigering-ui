import { PadlockUnlockedIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, Heading, Modal } from "@navikt/ds-react";
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
