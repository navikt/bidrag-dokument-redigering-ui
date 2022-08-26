import { PDFDocumentProxy } from "pdfjs-dist";
import { useContext } from "react";
import React from "react";

export interface PdfDocumentContextProps {
    pdfDocument: PDFDocumentProxy;
    renderPageIndexes: number[];
    scale: number;
    renderText: boolean;
}

export const usePdfDocumentContext = () => useContext(PdfDocumentContext);
export const PdfDocumentContext = React.createContext<PdfDocumentContextProps>({} as PdfDocumentContextProps);
