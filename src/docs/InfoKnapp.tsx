import "./InfoKnapp.css";

import { QuestionmarkDiamondIcon } from "@navikt/aksel-icons";
import { Button, Modal } from "@navikt/ds-react";
import { PropsWithChildren, useState } from "react";
type InfoKnappProps = {
    buttonClassName?: string;
    className?: string;
    title?: string;
    buttonText?: string;
    roundedIcon?: boolean;
};
export default function InfoKnapp({
    children,
    className,
    buttonClassName,
    buttonText,
    title,
}: PropsWithChildren<InfoKnappProps>) {
    const [modalOpen, setModalOpen] = useState(false);

    const closeModal = () => {
        setModalOpen(false);
    };
    const openModal = () => setModalOpen(true);
    const onlyIcon = buttonText == undefined;
    return (
        <>
            <Button
                title={title}
                variant="tertiary"
                className={`${buttonClassName} ${onlyIcon ? "p-0" : ""}`}
                size="xsmall"
                icon={<QuestionmarkDiamondIcon />}
                onClick={openModal}
            >
                {buttonText}
            </Button>

            <Modal
                open={modalOpen}
                overlayClassName="test"
                shouldCloseOnEsc
                onClose={closeModal}
                className={`max-w-[1000px] ${className}`}
            >
                <Modal.Content>
                    <div className="max-h-[800px] mdx-content">{children}</div>
                </Modal.Content>
            </Modal>
        </>
    );
}
