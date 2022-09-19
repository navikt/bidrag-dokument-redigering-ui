import React, { ReactNode, useRef, useState } from "react";

import { PdfDocumentRef } from "../pdfcore/PdfDocument";
import { PdfDocumentType } from "../pdfview/types";
import BasePdfViewer from "./BasePdfViewer";
import PdfThumbnailViewer, { ThumbnailDocumentRef } from "./PdfThumbnailViewer";
import { PdfViewerContext } from "./PdfViewerContext";
interface PdfViewerProps {
    file: PdfDocumentType;
    scale?: number;
    pages?: number[];
    thumbnailsHidden?: boolean;
    thumbnailsMinimized?: boolean;
    showThumbnails?: boolean;
    onPageChange?: (pageNumber: number) => void;
    onDocumentLoaded?: (pagesCount: number, pages: number[]) => void;
    renderPage?: (pageNumber: number, children: ReactNode) => ReactNode;
    renderThumbnailPage?: (pageNumber: number, children: ReactNode) => ReactNode;
}

export default function PdfViewer({
    showThumbnails = true,
    scale,
    file,
    thumbnailsMinimized,
    thumbnailsHidden,
    onDocumentLoaded,
    onPageChange,
    renderPage,
    pages,
    renderThumbnailPage,
}: PdfViewerProps) {
    const hasThumbnailsLoaded = useRef(!showThumbnails);
    const hasDocumentLoaded = useRef(false);
    const thumbnailDocumentRef = useRef<ThumbnailDocumentRef>(null);
    const baseDocumentRef = useRef<PdfDocumentRef>(null);

    const [_pages, setPages] = useState([]);

    function _onThumbnailLoaded(pagesCount: number, pages: number[]) {
        setPages(pages);
        hasThumbnailsLoaded.current = true;
        if (hasDocumentLoaded.current) onDocumentLoaded(pagesCount, pages);
    }

    function _onDocumentLoaded(pagesCount: number, pages: number[]) {
        setPages(pages);
        hasDocumentLoaded.current = true;
        if (hasThumbnailsLoaded.current) onDocumentLoaded(pagesCount, pages);
    }

    function _renderThumbnails() {
        return (
            <PdfThumbnailViewer
                minimized={thumbnailsMinimized}
                hidden={thumbnailsHidden}
                thumbnailDocumentRef={thumbnailDocumentRef}
                document={file}
                onPageClick={(pageNumber) => baseDocumentRef.current.scrollToPage(pageNumber)}
                onDocumentLoaded={_onThumbnailLoaded}
                renderPage={renderThumbnailPage}
            />
        );
    }

    function _onPageChange(pageNumber: number) {
        thumbnailDocumentRef.current.updateFocusedPage(pageNumber);
        onPageChange(pageNumber);
    }

    function _onScroll(pageNumber: number) {
        thumbnailDocumentRef.current.scrollToPage(pageNumber);
    }

    return (
        <PdfViewerContext.Provider value={{ pages: pages ?? _pages, file }}>
            <div className={"pdfviewer"} style={{ display: "flex", flexDirection: "row" }}>
                {showThumbnails && _renderThumbnails()}
                <div className={"pdfviewer_container"}>
                    <BasePdfViewer
                        scale={scale}
                        baseDocumentRef={baseDocumentRef}
                        onDocumentLoaded={_onDocumentLoaded}
                        onPageChange={_onPageChange}
                        renderPage={renderPage}
                        onScroll={_onScroll}
                    />
                </div>
            </div>
        </PdfViewerContext.Provider>
    );
}
