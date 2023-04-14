import { EditorConfigStorage, FileUtils, queryParams } from "@navikt/bidrag-ui-common";
import { PropsWithChildren, useContext, useEffect, useState } from "react";
import React from "react";

import { MaskingContainer, useMaskingContainer } from "../../../components/masking/MaskingContainer";
import { PdfDocumentType } from "../../../components/utils/types";
import { PdfProducer } from "../../../pdf/PdfProducer";
import { EditDocumentMetadata, IDocumentMetadata } from "../../../types/EditorTypes";

type PdfEditorMode = "view_only" | "edit" | "remove_pages_only";
interface PdfEditorContextProps {
    mode: PdfEditorMode;
    removedPages: number[];
    toggleDeletedPage: (page: number) => void;
    savePdf: () => Promise<void>;
    previewPdf: () => Promise<void>;
    finishPdf: () => Promise<void>;
    onToggleSidebar: () => void;
    hideSidebar: () => void;
    forsendelseId: string;
    sidebarHidden: boolean;
    dokumentreferanse: string;
    dokumentMetadata?: IDocumentMetadata;
}

export const usePdfEditorContext = () => useContext(PdfEditorContext);
export const PdfEditorContext = React.createContext<PdfEditorContextProps>({} as PdfEditorContextProps);

interface IPdfEditorContextProviderProps {
    mode: PdfEditorMode;
    journalpostId: string;
    dokumentreferanse: string;
    dokumentMetadata?: IDocumentMetadata;
    documentFile: PdfDocumentType;
    onSave?: (config: EditDocumentMetadata) => void;
    onSubmit?: (config: EditDocumentMetadata, document: Uint8Array) => void;
}

export default function PdfEditorContextProvider(props: PropsWithChildren<IPdfEditorContextProviderProps>) {
    return (
        <MaskingContainer items={props.dokumentMetadata?.editorMetadata?.items}>
            <PdfEditorContextProviderWithMasking {...props} />
        </MaskingContainer>
    );
}

function PdfEditorContextProviderWithMasking({
    journalpostId,
    mode,
    dokumentreferanse,
    dokumentMetadata,
    documentFile,
    onSave,
    onSubmit,
    children,
}: PropsWithChildren<IPdfEditorContextProviderProps>) {
    const { items } = useMaskingContainer();
    const [sidebarHidden, setSidebarHidden] = useState(true);
    const [removedPages, setRemovedPages] = useState<number[]>([]);

    useEffect(loadInitalConfig, []);
    async function finishPdf(): Promise<void> {
        if (!onSubmit) return;
        const { documentFile, config } = await getProcessedPdf();
        onSubmit(config, documentFile);
    }

    const getEditDocumentMetadata = (): EditDocumentMetadata => ({
        removedPages: removedPages,
        items: items,
    });

    async function getProcessedPdf(): Promise<{ documentFile: Uint8Array; config: EditDocumentMetadata }> {
        let existingPdfBytes = documentFile;
        if (typeof documentFile == "string") {
            existingPdfBytes = await fetch(documentFile).then((res) => res.arrayBuffer());
        }

        const config = getEditDocumentMetadata();
        return await new PdfProducer(existingPdfBytes)
            .init(config)
            .then((p) => p.process())
            .then((p) => p.saveChanges())
            .then((p) => ({
                documentFile: p.getProcessedDocument(),
                config,
            }));
    }

    async function previewPdf(): Promise<void> {
        const { documentFile } = await getProcessedPdf();
        FileUtils.openFile(documentFile);
    }
    async function savePdf(): Promise<void> {
        onSave && onSave(getEditDocumentMetadata());
    }

    function loadInitalConfig() {
        const config = dokumentMetadata ?? EditorConfigStorage.get(queryParams().id);
        if (config) {
            setRemovedPages(config.editorMetadata?.removedPages ?? []);
            // initMasking(config.editorMetadata.items ?? []);
        }
    }

    function onToggleSidebar() {
        setSidebarHidden((prev) => !prev);
    }

    function toggleDeletedPage(pageNumber: number) {
        setRemovedPages((prev) => {
            if (prev.includes(pageNumber)) {
                return prev.filter((p) => p !== pageNumber);
            } else {
                return [...prev, pageNumber];
            }
        });
    }

    return (
        <PdfEditorContext.Provider
            value={{
                mode,
                forsendelseId: journalpostId,
                dokumentreferanse,
                dokumentMetadata,
                sidebarHidden,
                hideSidebar: () => setSidebarHidden(true),
                removedPages,
                previewPdf,
                onToggleSidebar,
                toggleDeletedPage,
                savePdf,
                finishPdf,
            }}
        >
            {children}
        </PdfEditorContext.Provider>
    );
}
