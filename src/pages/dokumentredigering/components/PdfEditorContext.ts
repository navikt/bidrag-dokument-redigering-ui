import { useContext } from "react";
import React from "react";

interface PdfViewerProviderProps {
    pages: number[];
    removedPages: number[];
    toggleDeletedPage: (page: number) => void;
    setIsDraggingThumbnail: (value: boolean) => void;
    isDraggingThumbnail: boolean;
    producePdf: () => Promise<void>;
}

export const usePdfEditorContext = () => useContext(PdfEditorContext);
export const PdfEditorContext = React.createContext<PdfViewerProviderProps>({} as PdfViewerProviderProps);
