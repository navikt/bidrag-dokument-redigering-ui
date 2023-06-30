import { InformationSquareIcon } from "@navikt/aksel-icons";
import { Button, Modal } from "@navikt/ds-react";
import { PropsWithChildren, useState } from "react";

type InfoKnappProps = {
    className?: string;
};
export default function InfoKnapp({ children, className }: PropsWithChildren<InfoKnappProps>) {
    const [modalOpen, setModalOpen] = useState(false);

    const closeModal = () => setModalOpen(false);
    const openModal = () => setModalOpen(true);
    return (
        <>
            <Button variant="tertiary" size="xsmall" icon={<InformationSquareIcon />} onClick={openModal}></Button>
            {modalOpen && (
                <Modal open shouldCloseOnEsc onClose={closeModal} className={`max-w-[900px] ${className}`}>
                    <Modal.Content>{children}</Modal.Content>
                </Modal>
            )}
        </>
    );
}
