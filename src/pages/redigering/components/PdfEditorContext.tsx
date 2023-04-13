import { useContext } from "react";
import React from "react";

interface PdfEditorContextProps {
    currentPage: number;
    pagesCount: number;
    removedPages: number[];
    toggleDeletedPage: (page: number) => void;
    savePdf: () => Promise<void>;
    previewPdf: () => Promise<void>;
    finishPdf: () => Promise<void>;
    onToggleSidebar: () => void;
    forsendelseId: string;
    dokumentreferanse: string;
}

export const usePdfEditorContext = () => useContext(PdfEditorContext);
export const PdfEditorContext = React.createContext<PdfEditorContextProps>({} as PdfEditorContextProps);
