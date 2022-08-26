import { useContext } from "react";
import React from "react";

import { PdfDocumentType } from "../pdfview/types";

export interface PdfViewerContextProps {
    file: PdfDocumentType;
    pages: number[];
}

export const usePdfViewerContext = () => useContext(PdfViewerContext);
export const PdfViewerContext = React.createContext<PdfViewerContextProps>({} as PdfViewerContextProps);
