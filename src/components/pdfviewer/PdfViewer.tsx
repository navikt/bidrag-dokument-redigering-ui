import React, { useEffect, useRef, useState } from "react";

import { PdfDocumentRef } from "../pdfcore/PdfDocument";
import PdfUtils from "../pdfcore/PdfUtils";
import BasePdfViewer from "./BasePdfViewer";
import { renderPageFn } from "./BasePdfViewer";
import PdfThumbnailViewer from "./PdfThumbnailViewer";
import { usePdfViewerContext } from "./PdfViewerContext";

interface PdfViewerProps {
    scale?: number;
    onScaleUpdated?: (scale: number) => void;
    thumbnailsHidden?: boolean;
    thumbnailsMinimized?: boolean;
    showThumbnails?: boolean;
    renderPage?: renderPageFn;
    renderThumbnailPage?: renderPageFn;
}

export default function PdfViewer({
    showThumbnails = false,
    scale,
    onScaleUpdated,
    thumbnailsMinimized,
    thumbnailsHidden,
    renderPage,
    renderThumbnailPage,
}: PdfViewerProps) {
    const hasThumbnailsLoaded = useRef(!showThumbnails);
    const hasDocumentLoaded = useRef(false);
    const thumbnailDocumentRef = useRef<PdfDocumentRef>(null);
    const baseDocumentRef = useRef<PdfDocumentRef>(null);

    const [pageInView, setPageInView] = useState(1);
    const { currentPage, onPageChange, onDocumentLoaded } = usePdfViewerContext();

    useEffect(() => {
        if (pageInView != currentPage) {
            baseDocumentRef.current.scrollToPage(currentPage);
        }
    }, [currentPage, pageInView]);
    function listener(event) {
        if (event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            const mousePosition = { x: event.pageX, y: event.pageY };
            const containerElement = PdfUtils.getPdfContainerElement();
            const pagesElement = PdfUtils.getPdfPagesElement();
            // Get mouse cursor position
            const mouseX = event.clientX - containerElement.offsetLeft;
            const mouseY = event.clientY - containerElement.offsetTop;

            // Calculate new scale
            const delta = event.deltaY > 0 ? -0.1 : 0.1;
            const newScale = scale + delta;
            const xt = mouseX - newScale * (mouseX - containerElement.scrollLeft / 2);
            const yt = mouseY - newScale * (mouseY - containerElement.scrollTop / 2);
            // containerElement.scrollLeft = xt;
            // containerElement.scrollTop = -yt;
            // PdfUtils.getPdfPagesElement().style.transform = `translate(${xt}px,${yt}px)`;
            onScaleUpdated?.(newScale);
        }
    }
    useEffect(() => {
        PdfUtils.getPdfContainerElement().addEventListener("wheel", listener, {
            capture: true,
            passive: false,
        });
        return () => PdfUtils.getPdfContainerElement().removeEventListener("wheel", listener);
    }, [scale]);

    function _onThumbnailLoaded(pagesCount: number, pages: number[]) {
        hasThumbnailsLoaded.current = true;
        if (hasDocumentLoaded.current) onDocumentLoaded(pagesCount, pages);
    }

    function _onDocumentLoaded(pagesCount: number, pages: number[]) {
        hasDocumentLoaded.current = true;
        if (hasThumbnailsLoaded.current || !showThumbnails) onDocumentLoaded(pagesCount, pages);
    }

    function _renderThumbnails() {
        return (
            <PdfThumbnailViewer
                minimized={thumbnailsMinimized}
                hidden={thumbnailsHidden}
                onPageClick={(pageNumber) => onPageChange(pageNumber)}
                onDocumentLoaded={_onThumbnailLoaded}
                renderPage={renderThumbnailPage}
            />
        );
    }

    function _onPageChange(pageNumber: number) {
        setPageInView(pageNumber);
        onPageChange(pageNumber);
    }

    function _onScroll(pageNumber: number) {
        thumbnailDocumentRef.current?.scrollToPage(pageNumber);
    }

    return (
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
    );
}
