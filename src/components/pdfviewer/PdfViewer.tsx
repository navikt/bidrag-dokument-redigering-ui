import React, { PropsWithChildren } from "react";

import PdfDocument from "../pdfcore/PdfDocument";
import { usePdfViewerContext } from "./PdfViewerContext";
export default function PdfViewer({ children }: PropsWithChildren<unknown>) {
    const { onPageChange, onDocumentLoaded, scale, file, dokumentRef } = usePdfViewerContext();

    return (
        <PdfDocument
            id={"pdf_document_pages"}
            file={file}
            documentRef={dokumentRef}
            scale={scale}
            overscanCount={10}
            renderText={false}
            onPageChange={onPageChange}
            onDocumentLoaded={(pagesCount: number, pages: number[]) => {
                onDocumentLoaded(pagesCount, pages);
            }}
        >
            {children}
        </PdfDocument>
    );
}
