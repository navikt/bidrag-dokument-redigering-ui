import "./PdfThumbnail.less";

import React, { MutableRefObject, useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { ReactNode } from "react";

import PdfDocument, { PdfDocumentRef } from "../pdfcore/PdfDocument";
import PdfPage from "../pdfcore/PdfPage";
import PdfUtils from "../pdfcore/PdfUtils";
import { PdfDocumentType } from "../pdfview/types";
import { emptyFn } from "./BasePdfViewer";
import { renderPageFn } from "./BasePdfViewer";
import { usePdfViewerContext } from "./PdfViewerContext";

const FOCUSED_PAGE_CLASSNAME = "infocus";
type PAGE_SIZE = "default" | "small" | "minimized" | "hidden";

export interface ThumbnailDocumentRef extends PdfDocumentRef {
    updateFocusedPage: (pageNumber: number) => void;
}
interface PdfThumbnailRendererProps {
    document: PdfDocumentType;
    thumbnailDocumentRef: MutableRefObject<ThumbnailDocumentRef>;
    minimized?: boolean;
    hidden?: boolean;
    onDocumentLoaded: (pagsNumber: number, pages: number[]) => void;
    onPageClick?: (pageNumber: number) => void;
    renderPage?: renderPageFn;
}
export default function PdfThumbnailViewer({
    minimized,
    hidden,
    document,
    thumbnailDocumentRef,
    renderPage,
    onPageClick,
    onDocumentLoaded,
}: PdfThumbnailRendererProps) {
    const currentPageNumberRef = useRef<number>(1);
    const [pageSize, setPageSize] = useState<PAGE_SIZE>("hidden");
    const containerRef = useRef<HTMLDivElement>();
    const documentRef = useRef<PdfDocumentRef>(null);
    const { pages } = usePdfViewerContext();

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

    function updateFocusedPage(pageNumber: number) {
        const currentPage = PdfUtils.getPageElement(documentRef.current.documentElement, pageNumber);
        if (currentPage && !currentPage?.classList?.contains(FOCUSED_PAGE_CLASSNAME)) {
            currentPage.classList.add(FOCUSED_PAGE_CLASSNAME);
        }

        const prevPage = PdfUtils.getPageElement(documentRef.current.documentElement, currentPageNumberRef.current);
        if (
            currentPageNumberRef.current &&
            currentPageNumberRef.current != pageNumber &&
            prevPage?.classList?.contains(FOCUSED_PAGE_CLASSNAME)
        ) {
            prevPage.classList.remove(FOCUSED_PAGE_CLASSNAME);
        }

        currentPageNumberRef.current = pageNumber;
    }

    function _onDocumentLoaded(pagesCount: number, loadedPages: number[]) {
        updateFocusedPage(1);
        thumbnailDocumentRef.current = {
            ...documentRef.current,
            updateFocusedPage,
        };
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
                {pages.map((pageNumber, index) => {
                    const pageToRender = (onPageRendered?: emptyFn): ReactNode => (
                        <PageContainer
                            pageNumber={pageNumber}
                            index={index}
                            onPageClick={onPageClick}
                            pageRendered={onPageRendered}
                        />
                    );
                    return renderPage ? renderPage(pageNumber, pageToRender) : pageToRender();
                })}
            </PdfDocument>
        </div>
    );
}
interface PdfPageContainerProps {
    pageNumber: number;
    onPageClick: (pageNumber: number) => void;
    index: number;
    pageRendered?: () => void;
}
const PageContainer = React.memo(({ pageNumber, onPageClick, index, pageRendered }: PdfPageContainerProps) => {
    return (
        <div onClick={() => onPageClick(pageNumber)} className={`thumbnail_page_container`}>
            <PdfPage pageNumber={pageNumber} index={index} key={"tpage_index_" + index} pageRendered={pageRendered} />
            <div className={"pagenumber"}>{pageNumber}</div>
        </div>
    );
});
