import React, { ReactNode, useEffect, useRef } from "react";

import PdfRenderer from "./PdfRenderer";
import PdfUtils, { FocusPageEvent } from "./PdfUtils";
import { PdfDocumentType } from "./types";

interface BasePdfViewerProps {
    document: PdfDocumentType;
    scale?: number;
    onPageChange?: (pageNumber: number) => void;
    onDocumentLoaded?: (pagesCount: number) => void;
    renderPage?: (pageNumber: number, children: ReactNode) => ReactNode;
}
export default function BasePdfViewer({
    scale,
    document,
    renderPage,
    onDocumentLoaded,
    onPageChange,
}: BasePdfViewerProps) {
    const containerRef = useRef<HTMLDivElement>();

    useEffect(() => {
        window.addEventListener(PdfUtils.FOCUS_PAGE_EVENT, (e: CustomEvent<FocusPageEvent>) => {
            PdfUtils.getPageElement(containerRef.current, e.detail.pageNumber).scrollIntoView({ block: "center" });
        });
    }, []);

    function _onPageChange(currentPageNumber: number, previousPageNumber: number) {
        onPageChange(currentPageNumber);
        PdfUtils.sendPageChangedEvent(currentPageNumber, previousPageNumber);
    }

    return (
        <div ref={containerRef} className={"pdfviewer_container"}>
            <PdfRenderer
                id={"pdf_document_pages"}
                document={document}
                scale={scale ?? 1.3}
                renderPage={renderPage}
                onDocumentLoaded={onDocumentLoaded}
                onPageChange={_onPageChange}
                onScroll={PdfUtils.sendPageScrolledEvent}
            />
        </div>
    );
}
