import { EditorConfigStorage, FileUtils, objectsDeepEqual, queryParams } from "@navikt/bidrag-ui-common";
import { PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import React from "react";

import StateHistory from "../../../components/history/StateHistory";
import { MaskingContainer, useMaskingContainer } from "../../../components/masking/MaskingContainer";
import { TimerUtils } from "../../../components/utils/TimerUtils";
import { PdfDocumentType } from "../../../components/utils/types";
import { IProducerProgress, PdfProducer } from "../../../pdf/PdfProducer";
import { ClosingWindow, EditDocumentMetadata, IDocumentMetadata } from "../../../types/EditorTypes";

export type PdfEditorMode = "view_only_unlockable" | "edit" | "remove_pages_only" | "view_only_locked";

type ProduceAndSaveState = "PRODUCING" | "SAVING_DOCUMENT" | "SAVING_METADATA" | "IDLE" | "ERROR" | "CLOSING_WINDOW";
interface IProduceAndSaveDocumentProgress {
    state: ProduceAndSaveState;
    progress?: number;
}
interface PdfEditorContextProps {
    mode: PdfEditorMode;
    produceAndSaveProgress: IProduceAndSaveDocumentProgress;
    history: StateHistory<EditDocumentMetadata>;
    removedPages: number[];
    toggleDeletedPage: (page: number) => void;
    savePdf: (closeAfterSave?: boolean) => Promise<ClosingWindow>;
    previewPdf: () => Promise<void>;
    finishPdf: () => Promise<ClosingWindow>;
    onToggleSidebar: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onInit: (totalPages: number) => void;
    isAllowedToDeletePage: () => boolean;
    hideSidebar: () => void;
    forsendelseId: string;
    sidebarHidden: boolean;
    isSavingEditDocumentConfig: boolean;
    dokumentreferanse: string;
    dokumentMetadata?: IDocumentMetadata;
}

export const usePdfEditorContext = () => useContext(PdfEditorContext);
export const PdfEditorContext = React.createContext<PdfEditorContextProps>({} as PdfEditorContextProps);
export type SaveState = "PENDING" | "ERROR" | "IDLE";
interface IPdfEditorContextProviderProps {
    mode: PdfEditorMode;
    submitOnSave?: boolean;
    journalpostId: string;
    dokumentreferanse: string;
    dokumentMetadata?: IDocumentMetadata;
    documentFile: PdfDocumentType;
    onSave?: (config: EditDocumentMetadata) => Promise<ClosingWindow>;
    onSaveAndClose?: (config: EditDocumentMetadata) => Promise<ClosingWindow>;
    onSubmit?: (config: EditDocumentMetadata, document: Uint8Array) => Promise<ClosingWindow>;
}

export default function PdfEditorContextProvider(props: PropsWithChildren<IPdfEditorContextProviderProps>) {
    const items = props.dokumentMetadata?.editorMetadata?.items ?? [];
    const isEditMode = props.mode == "edit";
    return (
        <MaskingContainer items={isEditMode ? items : []} enabled={isEditMode}>
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
    submitOnSave,
    onSave,
    onSaveAndClose,
    onSubmit,
    children,
}: PropsWithChildren<IPdfEditorContextProviderProps>) {
    const { items, initItems } = useMaskingContainer();
    const [produceAndSaveProgress, setProduceAndSaveProgress] = useState<IProduceAndSaveDocumentProgress>({
        state: "IDLE",
    });
    const [sidebarHidden, setSidebarHidden] = useState(false);
    const [removedPages, setRemovedPages] = useState<number[]>(getInitialRemovedPages());
    const totalPages = useRef(-1);
    const [lastSavedData, setLastSavedData] = useState(getEditDocumentMetadata());
    const [history, setHistory] = useState(new StateHistory<EditDocumentMetadata>(getEditDocumentMetadata()));
    const [isSavingEditDocumentConfig, setIsSavingDocumentConfig] = useState(false);
    const saveChanges = useRef(TimerUtils.debounce(onSaveChanges, 500));
    const isUndoRedoChange = useRef(false);
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => divRef.current.focus(), []);
    useEffect(() => {
        const hasChanged = !objectsDeepEqual(history.current, getEditDocumentMetadata());
        if (!isUndoRedoChange.current && hasChanged) {
            setHistory((prevHistory) => prevHistory.push(getEditDocumentMetadata()));
        }
        isUndoRedoChange.current = false;
    }, [items, removedPages, history]);

    useEffect(() => {
        const hasChanged = !objectsDeepEqual(lastSavedData, getEditDocumentMetadata());
        if (hasChanged) {
            saveChanges.current(getEditDocumentMetadata());
        }
    }, [items, removedPages]);

    function updateSaveState(state: ProduceAndSaveState, progress?: number) {
        setProduceAndSaveProgress({
            state,
            progress,
        });
    }
    function onSaveChanges(editDocumentMetadata: EditDocumentMetadata) {
        updateSaveState("SAVING_METADATA");
        return savePdf(editDocumentMetadata)
            .then(() => updateSaveState("IDLE"))
            .catch((e) => {
                updateSaveState("ERROR");
                throw e;
            });
    }

    function undoState() {
        if (history.canUndo) {
            const updatedHistory = history.undo(getEditDocumentMetadata());
            initItems(updatedHistory.previous.items);
            setRemovedPages(updatedHistory.previous.removedPages);
            setHistory(updatedHistory);
            isUndoRedoChange.current = true;
        }
    }
    function redoState() {
        if (history.canRedo) {
            const nextHistory = history.next;
            initItems(nextHistory.items);
            setRemovedPages(nextHistory.removedPages);
            setHistory(history.redo(nextHistory));
            isUndoRedoChange.current = true;
        }
    }

    function getEditDocumentMetadata(): EditDocumentMetadata {
        return {
            removedPages: removedPages,
            items: items.filter((item) => item.state == "ITEM" || item.state == undefined),
        };
    }

    async function finishPdf(): Promise<ClosingWindow> {
        if (!onSubmit) return;
        const { documentFile, config } = await getProcessedPdf();
        updateSavingDocumentState(0);
        return await onSubmit(config, documentFile)
            .then((closingWindow: ClosingWindow) => {
                updateSaveState(closingWindow ? "CLOSING_WINDOW" : "IDLE");
                return closingWindow;
            })
            .catch((e) => {
                updateSaveState("ERROR");
                throw e;
            });
    }

    function updateSavingDocumentState(currentValue: number) {
        updateSaveState("SAVING_DOCUMENT", currentValue);
        if (currentValue >= 95) {
            return;
        }
        setTimeout(() => {
            updateSavingDocumentState(currentValue + 5);
        }, 200);
    }

    function onProducePdfProgressUpdated(process: IProducerProgress) {
        updateSaveState("PRODUCING", process.progress);
    }
    async function getProcessedPdf(): Promise<{ documentFile: Uint8Array; config: EditDocumentMetadata }> {
        let existingPdfBytes = documentFile;
        if (typeof documentFile == "string") {
            existingPdfBytes = await fetch(documentFile).then((res) => res.arrayBuffer());
        }

        if (documentFile instanceof Blob) {
            existingPdfBytes = await documentFile.arrayBuffer();
        }

        const config = getEditDocumentMetadata();
        return await new PdfProducer(existingPdfBytes)
            .init(config, onProducePdfProgressUpdated)
            .then((p) => p.process())
            .then((p) => p.saveChanges())
            .then((p) => ({
                documentFile: p.getProcessedDocument(),
                config,
            }));
    }

    async function previewPdf(): Promise<void> {
        updateSaveState("PRODUCING", 0);
        const { documentFile } = await getProcessedPdf();
        updateSaveState("IDLE");
        FileUtils.openFile(documentFile);
    }

    async function onSavePdf(closeAfterSave?: boolean): Promise<ClosingWindow> {
        return savePdf(getEditDocumentMetadata(), closeAfterSave, submitOnSave);
    }
    async function savePdf(
        saveEditDocumentData: EditDocumentMetadata,
        closeAfterSave?: boolean,
        submit?: boolean
    ): Promise<ClosingWindow> {
        setIsSavingDocumentConfig(true);
        setLastSavedData(saveEditDocumentData);
        return new Promise<ClosingWindow>((resolve, reject) => {
            if (closeAfterSave) {
                if (submit) {
                    finishPdf().then(resolve).catch(reject);
                } else {
                    onSaveAndClose?.(saveEditDocumentData).then(resolve).catch(reject);
                }
            } else {
                onSave?.(saveEditDocumentData).then(resolve).catch(reject);
            }
        }).finally(() => {
            setIsSavingDocumentConfig(false);
        });
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

    function isAllowedToDeletePage() {
        return removedPages.length + 1 < totalPages.current;
    }

    function onInit(_totalPages: number) {
        totalPages.current = _totalPages;
    }

    return (
        <div tabIndex={-1} ref={divRef}>
            <PdfEditorContext.Provider
                value={{
                    mode,
                    produceAndSaveProgress,
                    forsendelseId: journalpostId,
                    history,
                    onUndo: () => undoState(),
                    onRedo: () => redoState(),
                    onInit,
                    dokumentreferanse,
                    dokumentMetadata,
                    isSavingEditDocumentConfig,
                    sidebarHidden,
                    hideSidebar: () => setSidebarHidden(true),
                    removedPages,
                    isAllowedToDeletePage,
                    previewPdf,
                    onToggleSidebar,
                    toggleDeletedPage,
                    savePdf: onSavePdf,
                    finishPdf,
                }}
            >
                {children}
            </PdfEditorContext.Provider>
        </div>
    );
}
