import React, { useRef, useState } from "react";

import { PdfDocumentType } from "../.././basepdfviewer/types";
import PdfDocument, { PdfDocumentRef } from "../PdfDocument";
import PdfPage from "../PdfPage";

interface BasePdfRendererProps {
    file: PdfDocumentType;
    scale?: number;
    onPageChange?: (pageNumber: number) => void;
    onDocumentLoaded?: (pagesCount: number, pages: number[]) => void;
}
export default function BasePdfViewer({ scale, file, onDocumentLoaded, onPageChange }: BasePdfRendererProps) {
    const [pages, setPages] = useState([]);
    const documentRef = useRef<PdfDocumentRef>(null);

    function _onDocumentLoaded(pagesNumber: number, pages: number[]) {
        setPages(pages);
        onDocumentLoaded(pagesNumber, pages);
    }

    return (
        <PdfDocument
            id={"pdf_document_pages"}
            file={file}
            documentRef={documentRef}
            scale={scale}
            overscanCount={10}
            onPageChange={onPageChange}
            onDocumentLoaded={_onDocumentLoaded}
        >
            {pages.map((pageNumber, index) => (
                <PdfPage pageNumber={pageNumber} index={index} key={"page_index_" + index} />
            ))}
        </PdfDocument>
    );
}
