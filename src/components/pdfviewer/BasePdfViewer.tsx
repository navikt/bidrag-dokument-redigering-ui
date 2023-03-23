import React, { MutableRefObject, ReactNode, useRef } from "react";

import PdfDocument, { PdfDocumentRef } from "../pdfcore/PdfDocument";
import PdfPage from "../pdfcore/PdfPage";
import { ScrollDirection } from "../pdfcore/PdfUtils";
import { usePdfViewerContext } from "./PdfViewerContext";
class PixelsPerInch {
    static CSS = 96.0;

    static PDF = 72.0;

    static PDF_TO_CSS_UNITS = this.CSS / this.PDF;
}
interface BasePdfRendererProps {
    scale?: number;
    pages?: number[];
    baseDocumentRef: MutableRefObject<PdfDocumentRef>;
    onPageChange?: (pageNumber: number, previousPageNumber: number) => void;
    onDocumentLoaded?: (pagesCount: number, pages: number[]) => void;
    renderPage?: (pageNumber: number, children: ReactNode) => ReactNode;
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
    const scaleAdjusted = (scale ?? 1.3) / PixelsPerInch.PDF_TO_CSS_UNITS;
    console.log("scaleadjusted", scaleAdjusted, "actual", scale);
    return (
        <PdfDocument
            id={"pdf_document_pages"}
            file={file}
            documentRef={documentRef}
            scale={scaleAdjusted}
            overscanCount={10}
            renderText={true}
            onPageChange={onPageChange}
            onScroll={onScroll}
            onDocumentLoaded={_onDocumentLoaded}
        >
            {pages.map((pageNumber, index) => {
                const pageToRender = <PdfPage pageNumber={pageNumber} index={index} key={"doc_page_index_" + index} />;
                return renderPage ? renderPage(pageNumber, pageToRender) : pageToRender;
            })}
        </PdfDocument>
    );
}
