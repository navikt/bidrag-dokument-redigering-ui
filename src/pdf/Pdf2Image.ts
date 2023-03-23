import * as pdfjs from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
// Copied from https://github.com/ol-th/pdf-img-convert.js/blob/master/pdf-img-convert.js
export default async function pdf2Image(pdfData: Uint8Array): Promise<string[]> {
    const outputPages = [];
    const loadingTask = pdfjs.getDocument({ data: pdfData, disableFontFace: false, verbosity: 0 });

    const pdfDocument = await loadingTask.promise;

    for (let i = 1; i <= pdfDocument.numPages; i++) {
        const currentPage = await doc_render(pdfDocument, i);
        if (currentPage != null) {
            outputPages.push(currentPage);
        }
    }

    return outputPages;
}

async function doc_render(pdfDocument: PDFDocumentProxy, pageNo) {
    // Page number sanity check
    if (pageNo < 1 || pageNo > pdfDocument.numPages) {
        console.error("Invalid page number " + pageNo);
        return;
    }
    const page = await pdfDocument.getPage(pageNo);
    // Create a viewport at 100% scale
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const ctx = canvas.getContext("2d");
    const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
    };
    await page.render(renderContext).promise;
    return canvas.toDataURL();
}
