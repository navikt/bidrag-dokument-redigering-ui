import { EditorConfigStorage, FileUtils, objectsDeepEqual, queryParams } from "@navikt/bidrag-ui-common";
import { PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import React from "react";

import { MaskingContainer, useMaskingContainer } from "../../../components/masking/MaskingContainer";
import { TimerUtils } from "../../../components/utils/TimerUtils";
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
    isSavingEditDocumentConfig: boolean;
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
    onSave?: (config: EditDocumentMetadata) => Promise<void>;
    onSaveAndClose?: (config: EditDocumentMetadata) => Promise<void>;
    onSubmit?: (config: EditDocumentMetadata, document: Uint8Array) => Promise<void>;
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
    onSaveAndClose,
    onSubmit,
    children,
}: PropsWithChildren<IPdfEditorContextProviderProps>) {
    const { items } = useMaskingContainer();
    const [sidebarHidden, setSidebarHidden] = useState(true);
    const [removedPages, setRemovedPages] = useState<number[]>(getInitialRemovedPages());
    const [lastSavedData, setLastSavedData] = useState(getEditDocumentMetadata());
    const [isSavingEditDocumentConfig, setIsSavingDocumentConfig] = useState(false);
    const saveChanges = useRef(TimerUtils.debounce(savePdf, 500));
    useEffect(() => {
        const hasChanged = !objectsDeepEqual(lastSavedData, getEditDocumentMetadata());
        if (hasChanged) saveChanges.current(getEditDocumentMetadata());
    }, [items, removedPages]);
    function getEditDocumentMetadata(): EditDocumentMetadata {
        return {
            removedPages: removedPages,
            items: items,
        };
    }

    async function finishPdf(): Promise<void> {
        if (!onSubmit) return;
        const { documentFile, config } = await getProcessedPdf();
        onSubmit(config, documentFile);
    }

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

    async function onSavePdf(closeAfterSave?: boolean): Promise<void> {
        return savePdf(getEditDocumentMetadata(), closeAfterSave);
    }
    async function savePdf(saveEditDocumentData: EditDocumentMetadata, closeAfterSave?: boolean): Promise<void> {
        setIsSavingDocumentConfig(true);
        setLastSavedData(saveEditDocumentData);
        if (closeAfterSave) await onSaveAndClose?.(saveEditDocumentData);
        else await onSave?.(saveEditDocumentData);
        setIsSavingDocumentConfig(false);
        return Promise.resolve();
    }

    function getInitialRemovedPages(): number[] {
        const config = dokumentMetadata ?? EditorConfigStorage.get(queryParams().id);
        return config?.editorMetadata?.removedPages ?? [];
    }

    function onToggleSidebar() {
        setSidebarHidden((prev) => !prev);
    }

    function toggleDeletedPage(pageNumber: number) {
        setRemovedPages((prev) => {
            if (prev.includes(pageNumber)) {
                return prev.filter((p) => p !== pageNumber).sort();
            } else {
                return [...prev, pageNumber].sort();
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
                isSavingEditDocumentConfig,
                sidebarHidden,
                hideSidebar: () => setSidebarHidden(true),
                removedPages,
                previewPdf,
                onToggleSidebar,
                toggleDeletedPage,
                savePdf: onSavePdf,
                finishPdf,
            }}
        >
            {children}
        </PdfEditorContext.Provider>
    );
}
