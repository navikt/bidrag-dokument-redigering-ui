import {
    Broadcast,
    BroadcastMessage,
    BroadcastNames,
    EditDocumentBroadcastMessage,
    FileUtils,
} from "@navikt/bidrag-ui-common";
import { PDFDocument } from "pdf-lib";

import { PdfDocumentType } from "../../../components/pdfview/types";

export class PdfProducer {
    private pdfDocument: PDFDocument;
    private pdfBlob: PdfDocumentType;
    private processedDocument: Uint8Array;
    private removedPages: number[];

    constructor(pdfBlob: PdfDocumentType) {
        this.pdfBlob = pdfBlob;
    }

    async init(): Promise<PdfProducer> {
        this.pdfDocument = await PDFDocument.load(this.pdfBlob);
        return this;
    }

    removePages(removePages: number[]): PdfProducer {
        let numberOfRemovedPages = 0;
        this.removedPages = removePages;
        removePages.forEach((page) => {
            this.pdfDocument.removePage(Math.max(0, page - 1 - numberOfRemovedPages));
            numberOfRemovedPages += 1;
        });
        return this;
    }

    broadcast() {
        const message: BroadcastMessage<EditDocumentBroadcastMessage> = Broadcast.convertToBroadcastMessage("someid", {
            document: FileUtils._arrayBufferToBase64(this.processedDocument),
            config: {
                removedPages: this.removedPages,
            },
        });
        Broadcast.sendBroadcast(BroadcastNames.EDIT_DOCUMENT_RESULT, message);
    }

    async serializeToByte(): Promise<PdfProducer> {
        this.processedDocument = await this.pdfDocument.save();
        return this;
    }

    async openInNewTab() {
        await this.serializeToByte();
        FileUtils.openFile(this.processedDocument, true);
        return this;
    }
}
