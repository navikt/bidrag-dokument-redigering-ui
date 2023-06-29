import { PropsWithChildren, useContext, useRef, useState } from "react";
import React from "react";

import { DecreaseScaleFn, IncreaseScaleFn } from "../pdfcore/PdfDocument";
import { PdfDocumentType } from "../utils/types";

export interface PdfViewerContextProps {
    file: PdfDocumentType;
    pages: number[];
    currentPage: number;
    scale: number;

    pagesCount: number;

    onPageChange: (pagenumber: number) => void;
    onDocumentLoaded?: (
        pagesCount: number,
        pages: number[],
        increaseScale: IncreaseScaleFn,
        decreaseScale: DecreaseScaleFn
    ) => void;
    updateScale: (newScale: number) => void;
    zoom: {
        onZoomIn: (ticks?: number, scaleFactor?: number) => void;
        onZoomOut: (ticks?: number, scaleFactor?: number) => void;
        onZoomChange: (scale: number) => void;
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
    const increaseScaleFn = useRef<IncreaseScaleFn>();
    const decreaseScaleFn = useRef<DecreaseScaleFn>();
    function onZoomIn(ticks?: number, scaleFactor?: number) {
        increaseScaleFn.current(ticks, scaleFactor);
        // setScale((prev) => prev + 0.2);
    }

    function onZoomOut(ticks?: number, scaleFactor?: number) {
        decreaseScaleFn.current(ticks, scaleFactor);
        // setScale((prev) => Math.max(0, prev - 0.2));
    }

    function resetZoom() {
        setScale(1.4);
    }
    function zoomToFit() {
        setScale(3);
    }
    function onDocumentLoaded(
        pagesCount: number,
        pages: number[],
        increaseScale: IncreaseScaleFn,
        decreaseScale: DecreaseScaleFn
    ) {
        setPages(pages);
        setPagesCount(pagesCount);
        _onDocumentLoaded?.(pagesCount, pages);
        increaseScaleFn.current = increaseScale;
        decreaseScaleFn.current = decreaseScale;
    }
    function onPageChange(pagenumber: number) {
        setCurrentPage(pagenumber);
        _onPageChange?.(pagenumber);
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
                updateScale: setScale,
                zoom: {
                    onZoomIn,
                    onZoomOut,
                    resetZoom,
                    onZoomChange: setScale,
                    zoomToFit,
                },
            }}
        >
            {children}
        </PdfViewerContext.Provider>
    );
}
