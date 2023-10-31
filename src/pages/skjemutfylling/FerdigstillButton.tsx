import { FileCheckmarkIcon } from "@navikt/aksel-icons";
import { FileUtils } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, Modal } from "@navikt/ds-react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";

import { BIDRAG_FORSENDELSE_API } from "../../api/api";
import { parseErrorMessageFromAxiosError } from "../../types/ErrorUtils";
import { useSkjemaUtfyllingContext } from "./SkjemaUtfyllingPage";

export default function FerdigstillButton() {
    const { getPdfWithFilledForm, dokumentreferanse, forsendelseId, broadcast } = useSkjemaUtfyllingContext();
    const [modalOpen, setModalOpen] = useState(false);
    async function broadcastAndCloseWindow() {
        broadcast();
        window.close();
        return true;
    }
    const ferdigstillFn = useMutation<unknown, AxiosError>({
        mutationFn: () =>
            getPdfWithFilledForm().then(async (fysiskDokument) =>
                BIDRAG_FORSENDELSE_API.api.ferdigstillDokument(forsendelseId, dokumentreferanse, {
                    fysiskDokument: FileUtils._arrayBufferToBase64(fysiskDokument),
                })
            ),
        onSuccess: () => {
            broadcastAndCloseWindow();
        },
    });

    const errorMessage = ferdigstillFn.error ? parseErrorMessageFromAxiosError(ferdigstillFn.error) : "";

    const openModal = () => setModalOpen(true);
    const closeModal = () => {
        setModalOpen(false);
    };
    return (
        <>
            <Button
                loading={ferdigstillFn.isPending}
                size={"small"}
                onClick={openModal}
                variant={"primary"}
                icon={<FileCheckmarkIcon />}
            >
                Ferdigstill
            </Button>
            {modalOpen && (
                <Modal
                    open
                    onClose={closeModal}
                    closeOnBackdropClick
                    header={{
                        heading: "Er du ferdig med å fylle ut skjemaet?",
                        closeButton: true,
                    }}
                >
                    <Modal.Body className="max-w-[800px]">
                        <BodyShort>
                            Etter skjemaet er ferdigstilt vil den bli låst for endringer og være klar for distribusjon.
                            Du kan senere låse opp skjemaet og endre innholdet før forsendelsen er distribuert.
                        </BodyShort>
                        {ferdigstillFn.isError && (
                            <Alert
                                variant="error"
                                size="small"
                                className="mt-3 mb-3"
                            >{`Kunne ikke ferdigstille dokument: ${errorMessage}`}</Alert>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            size="small"
                            variant={"primary"}
                            onClick={() => ferdigstillFn.mutate()}
                            loading={ferdigstillFn.isPending}
                        >
                            Ferdigstill og lukk
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
