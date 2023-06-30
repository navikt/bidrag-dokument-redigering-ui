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
        onZoomIn: (ticks?: number, scaleFactor?: number) => void;
        onZoomOut: (ticks?: number, scaleFactor?: number) => void;
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
    const { zoomIn, zoomOut, resetTransform, centerView, zoomToElement } = useControls();
    const instance = useTransformContext();
    useTransformEffect((ref) => {
        setScale(ref.state.scale);
        // instance.wrapperComponent.style.height = "fit-content";
    });

    function onZoomIn(ticks?: number, scaleFactor?: number) {
        zoomIn(undefined, undefined, "easeInOutCubic");
        // instance.wrapperComponent.style.height = "100%";
        // zoomToElement(document.getElementById(`droppable_page_${currentPage}`), scale + 0.1);
        // setTransform(
        //     instance.transformState.positionX,
        //     instance.transformState.positionY,
        //     instance.transformState.scale + 0.1
        // );
        // setScale((prev) => prev + 0.2);
    }

    function onZoomOut(ticks?: number, scaleFactor?: number) {
        // instance.wrapperComponent.style.height = "100%";
        zoomOut();
        // setScale((prev) => Math.max(0, prev - 0.2));
    }

    function resetZoom() {
        resetTransform();
        // console.log(document.getElementById("droppable_page_3"));
        // zoomToElement(document.getElementById("droppable_page_3"), 2);
    }
    function zoomToFit() {
        centerView();
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
