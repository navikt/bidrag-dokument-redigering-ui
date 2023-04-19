import React, { MutableRefObject, ReactNode, useRef } from "react";

import PdfDocument, { PdfDocumentRef } from "../pdfcore/PdfDocument";
import PdfPage from "../pdfcore/PdfPage";
import { ScrollDirection } from "../pdfcore/PdfUtils";
import { usePdfViewerContext } from "./PdfViewerContext";

export type emptyFn = () => void;
export type renderPageChildrenFn = (emptyFn, emptyFn2) => ReactNode;
export type renderPageFn = (pageNumber: number, children: renderPageChildrenFn) => ReactNode;
interface BasePdfRendererProps {
    scale?: number;
    pages?: number[];
    baseDocumentRef: MutableRefObject<PdfDocumentRef>;
    onPageChange?: (pageNumber: number, previousPageNumber: number) => void;
    onDocumentLoaded?: (pagesCount: number, pages: number[]) => void;
    renderPage?: renderPageFn;
    onScroll?: (currentPageNumber: number, scrollDirection: ScrollDirection) => void;
}
export default function BasePdfViewer({
    baseDocumentRef,
    onScroll,
    scale,
    onDocumentLoaded,
    renderPage,
    onPageChange,
}: BasePdfRendererProps) {
    const { pages, file } = usePdfViewerContext();
    const documentRef = useRef<PdfDocumentRef>(null);

    function _onDocumentLoaded(pagesCount: number, pages: number[]) {
        baseDocumentRef.current = documentRef.current;
        onDocumentLoaded(pagesCount, pages);
    }
    return (
        <PdfDocument
            id={"pdf_document_pages"}
            file={file}
            documentRef={documentRef}
            scale={scale}
            overscanCount={10}
            renderText={false}
            onPageChange={onPageChange}
            onScroll={onScroll}
            onDocumentLoaded={_onDocumentLoaded}
        >
            {pages.map((pageNumber, index) => {
                const pageToRender = (onPageRendered?: emptyFn, onPageDestroyed?: emptyFn): ReactNode => (
                    <PdfPage
                        pageNumber={pageNumber}
                        index={index}
                        key={"doc_page_index_" + index}
                        pageRendered={onPageRendered}
                        pageDestroyed={onPageDestroyed}
                    />
                );

                return renderPage ? renderPage(pageNumber, pageToRender) : pageToRender();
            })}
        </PdfDocument>
    );
}
