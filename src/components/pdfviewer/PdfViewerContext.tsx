import { PropsWithChildren, useContext, useState } from "react";
import React from "react";

import { PdfDocumentType } from "../utils/types";

export interface PdfViewerContextProps {
    file: PdfDocumentType;
    pages: number[];
    currentPage: number;

    onPageChange: (pagenumber: number) => void;
    onDocumentLoaded?: (pagesCount: number, pages: number[]) => void;
}

export const usePdfViewerContext = () => {
    const context = useContext(PdfViewerContext);
    if (context === undefined) {
        throw new Error("usePdfViewerContext must be used within a PdfViewerContextProvider");
    }
    return context;
};
export const PdfViewerContext = React.createContext<PdfViewerContextProps>({} as PdfViewerContextProps);

interface IPdfViewerContextProviderProps {
    pages?: number[];
    documentFile: PdfDocumentType;
    onPageChange?: (pageNumber: number) => void;
    onDocumentLoaded?: (pagesCount: number, pages: number[]) => void;
}
export default function PdfViewerContextProvider({
    children,
    pages,
    documentFile,
    onDocumentLoaded: _onDocumentLoaded,
    onPageChange: _onPageChange,
}: PropsWithChildren<IPdfViewerContextProviderProps>) {
    const [_pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    function onDocumentLoaded(pagesCount: number, pages: number[]) {
        setPages(pages);
        _onDocumentLoaded(pagesCount, pages);
    }
    function onPageChange(pagenumber: number) {
        setCurrentPage(pagenumber);
        _onPageChange(pagenumber);
    }
    return (
        <PdfViewerContext.Provider
            value={{ pages: pages ?? _pages, file: documentFile, currentPage, onDocumentLoaded, onPageChange }}
        >
            {children}
        </PdfViewerContext.Provider>
    );
}
