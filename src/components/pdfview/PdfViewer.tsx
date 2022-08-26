import "./PdfThumbnail.less";

import React from "react";
import { useRef } from "react";
import { ReactNode } from "react";

import BasePdfViewer from "./BasePdfViewer";
import PdfThumbnailViewer from "./PdfThumbnailViewer";
import { PdfDocumentType } from "./types";
interface PdfViewerProps {
    document: PdfDocumentType;
    onDocumentLoaded?: (pagesCount: number) => void;
    scale?: number;
    thumbnailsHidden?: boolean;
    thumbnailsMinimized?: boolean;
    showThumbnails?: boolean;
    onPageChange?: (currentPageNumber: number) => void;
    renderPage?: (pageNumber: number, children: ReactNode) => ReactNode;
    renderThumbnailPage?: (pageNumber: number, children: ReactNode) => ReactNode;
    renderThumbnails?: (children: ReactNode) => ReactNode;
}
export default function PdfViewer({
    document,
    onDocumentLoaded,
    thumbnailsHidden,
    thumbnailsMinimized,
    showThumbnails = true,
    scale = 1.3,
    renderThumbnailPage,
    onPageChange,
    renderPage,
    renderThumbnails,
}: PdfViewerProps) {
    const hasThumbnailsLoaded = useRef(!showThumbnails);
    const hasDocumentLoaded = useRef(false);
    function _onDocumentLoaded(pagesCount: number) {
        hasDocumentLoaded.current = true;
        if (hasThumbnailsLoaded.current) onDocumentLoaded(pagesCount);
    }

    function _onThumbnailLoaded(pagesCount: number) {
        hasThumbnailsLoaded.current = true;
        if (hasDocumentLoaded.current) onDocumentLoaded(pagesCount);
    }

    function _renderThumbnails() {
        return (
            <PdfThumbnailViewer
                minimized={thumbnailsMinimized}
                hidden={thumbnailsHidden}
                document={document}
                onDocumentLoaded={_onThumbnailLoaded}
                renderPage={renderThumbnailPage}
            />
        );
    }

    return (
        <div className={"pdfviewer"} style={{ display: "flex", flexDirection: "row" }}>
            {showThumbnails && _renderThumbnails()}
            <div className={"pdfviewer_container"}>
                <BasePdfViewer
                    scale={scale}
                    document={document}
                    onPageChange={onPageChange}
                    onDocumentLoaded={_onDocumentLoaded}
                    renderPage={renderPage}
                />
            </div>
        </div>
    );
}
