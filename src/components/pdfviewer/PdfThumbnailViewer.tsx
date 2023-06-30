import "./PdfThumbnail.css";

import React, { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

import PdfDocument, { PdfDocumentRef } from "../pdfcore/PdfDocument";
import PdfPage from "../pdfcore/PdfPage";
import { usePdfViewerContext } from "./PdfViewerContext";

type PAGE_SIZE = "default" | "small" | "minimized" | "hidden";

interface PdfThumbnailRendererProps {
    minimized?: boolean;
    hidden?: boolean;
    onDocumentLoaded: (pagsNumber: number, pages: number[]) => void;
    onPageClick?: (pageNumber: number) => void;
}
export default function PdfThumbnailViewer({
    minimized,
    hidden,
    onPageClick,
    onDocumentLoaded,
}: PdfThumbnailRendererProps) {
    const [pageSize, setPageSize] = useState<PAGE_SIZE>("hidden");
    const containerRef = useRef<HTMLDivElement>();
    const documentRef = useRef<PdfDocumentRef>(null);
    const { pages, currentPage, file: document } = usePdfViewerContext();

    useEffect(() => {
        documentRef.current?.scrollToPage(currentPage);
    }, [currentPage]);
    useEffect(() => {
        const windowWidth = window.innerWidth;
        setPageSize(windowWidth > 1300 ? "default" : "small");
    }, []);

    useEffect(() => {
        if (hidden) {
            setPageSize("hidden");
        } else if (minimized) {
            setPageSize("small");
        } else {
            setPageSize("default");
        }
    }, [minimized, hidden]);

    function getScale() {
        switch (pageSize) {
            case "minimized":
                return 0.05;
            case "small":
                return 0.2;
            case "default":
            case "hidden":
            default:
                return 0.3;
        }
    }

    function _onDocumentLoaded(pagesCount: number, loadedPages: number[]) {
        documentRef.current.scrollToPage(1);
        onDocumentLoaded(pagesCount, loadedPages);
    }

    return (
        <div
            ref={containerRef}
            className={`thumbnail_viewer pagesize_${pageSize}`}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <PdfDocument
                id={"pdf_thumbnail_pages"}
                file={document}
                documentRef={documentRef}
                scale={getScale()}
                overscanCount={10}
                renderText={false}
                onDocumentLoaded={_onDocumentLoaded}
            >
                {pages.map((pageIndex) => (
                    <PageContainer
                        pageNumber={pageIndex + 1}
                        currentPage={currentPage}
                        index={pageIndex}
                        onPageClick={onPageClick}
                    />
                ))}
            </PdfDocument>
        </div>
    );
}
interface PdfPageContainerProps {
    pageNumber: number;
    currentPage: number;
    onPageClick: (pageNumber: number) => void;
    index: number;
}
const PageContainer = React.memo(({ pageNumber, onPageClick, index, currentPage }: PdfPageContainerProps) => {
    return (
        <div
            onClick={() => onPageClick(pageNumber)}
            className={`thumbnail_page_container ${currentPage == pageNumber ? "infocus" : ""}`}
        >
            <PdfPage pageNumber={pageNumber} index={index} key={"tpage_index_" + index} />
            <div className={"pagenumber"}>{pageNumber}</div>
        </div>
    );
});
