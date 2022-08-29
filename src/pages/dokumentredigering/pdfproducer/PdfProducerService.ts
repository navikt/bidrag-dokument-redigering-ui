import { PDFDocument } from "pdf-lib";

import { PdfDocumentType } from "../../../components/pdfview/types";
import { FileUtils } from "../../../components/utils/FileUtils";

export class PdfProducerService {
    static async removePagesAndOpen(pdfBlob: PdfDocumentType, removePages: number[]) {
        const pdfDoc = await PDFDocument.load(pdfBlob);
        let numberOfRemovedPages = 0;
        removePages.forEach((page) => {
            pdfDoc.removePage(Math.max(0, page - 1 - numberOfRemovedPages));
            numberOfRemovedPages += 1;
        });
        const newPdf = await pdfDoc.save();
        FileUtils.openFile(newPdf, true);
    }

    static async removePages(pdfBlob: PdfDocumentType, removePages: number[]) {
        const pdfDoc = await PDFDocument.load(pdfBlob);
        let numberOfRemovedPages = 0;
        removePages.forEach((page) => {
            pdfDoc.removePage(Math.max(0, page - 1 - numberOfRemovedPages));
            numberOfRemovedPages += 1;
        });
        return await pdfDoc.save();
    }
}
