import { MutableRefObject, PropsWithChildren, useContext, useRef, useState } from "react";
import React from "react";
import { useControls, useTransformContext, useTransformEffect } from "react-zoom-pan-pinch";

import { PdfDocumentRef } from "../pdfcore/PdfDocument";
import { PdfDocumentType } from "../utils/types";

export interface PdfViewerContextProps {
    file: PdfDocumentType;
    dokumentRef: MutableRefObject<PdfDocumentRef>;
    pages: number[];
    currentPage: number;
    scale: number;
    pagesCount: number;
    onPageChange: (pagenumber: number) => void;
    onDocumentLoaded?: (pagesCount: number, pages: number[]) => void;
    zoom: {
        onZoomIn: () => void;
        onZoomOut: () => void;
        resetZoom: () => void;
        zoomToFit: () => void;
    };
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
    const [pagesCount, setPagesCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1);
    const dokumentRef = useRef<PdfDocumentRef>();
    const { getContext } = useTransformContext();
    const { zoomIn, zoomOut, setTransform, zoomToElement } = useControls();
    useTransformEffect((ref) => {
        setScale(ref.state.scale);
    });

    function onZoomIn() {
        zoomIn(undefined, undefined, "easeInOutCubic");
    }

    function onZoomOut() {
        zoomOut();
    }

    function resetZoom() {
        getContext().centerView(1);
    }

    function zoomToFit() {
        const element = document
            .getElementById("container_pdf_document_pages")
            .querySelector(`.page[data-page-number="${currentPage}"]`);
        zoomToElement(element as HTMLElement, 2.5, undefined, "easeInCubic");
    }
    function onDocumentLoaded(pagesCount: number, pages: number[]) {
        setPages(pages);
        setPagesCount(pagesCount);
        _onDocumentLoaded?.(pagesCount, pages);
    }
    function onPageChange(pagenumber: number) {
        setCurrentPage(pagenumber);
        _onPageChange?.(pagenumber);
        dokumentRef.current.scrollToPage(pagenumber);
    }

    return (
        <PdfViewerContext.Provider
            value={{
                pages: pages ?? _pages,
                file: documentFile,
                currentPage,
                pagesCount,
                onDocumentLoaded,
                onPageChange,
                scale,
                dokumentRef,
                zoom: {
                    onZoomIn,
                    onZoomOut,
                    resetZoom,
                    zoomToFit,
                },
            }}
        >
            {children}
        </PdfViewerContext.Provider>
    );
}
