import { useContext } from "react";
import React from "react";

interface PdfViewerProviderProps {
    currentPage: number;
    pagesCount: number;
    removedPages: number[];
    toggleDeletedPage: (page: number) => void;
    savePdf: () => Promise<void>;
    previewPdf: () => Promise<void>;
    finishPdf: () => Promise<void>;
    onToggleSidebar: () => void;
}

export const usePdfEditorContext = () => useContext(PdfEditorContext);
export const PdfEditorContext = React.createContext<PdfViewerProviderProps>({} as PdfViewerProviderProps);
