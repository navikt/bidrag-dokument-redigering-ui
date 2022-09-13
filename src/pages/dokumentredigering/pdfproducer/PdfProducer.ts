import {
    Broadcast,
    BroadcastMessage,
    BroadcastNames,
    EditDocumentBroadcastMessage,
    EditDocumentConfig,
    FileUtils,
    queryParams,
} from "@navikt/bidrag-ui-common";
import { PDFDocument } from "pdf-lib";

import { PdfDocumentType } from "../../../components/pdfview/types";

export class PdfProducer {
    private pdfDocument: PDFDocument;
    private pdfBlob: PdfDocumentType;
    private processedDocument: Uint8Array;
    private config: EditDocumentConfig;

    constructor(pdfBlob: PdfDocumentType) {
        this.pdfBlob = pdfBlob;
    }

    async init(config: EditDocumentConfig): Promise<PdfProducer> {
        this.config = config;
        this.pdfDocument = await PDFDocument.load(this.pdfBlob);
        return this;
    }

    async process(): Promise<PdfProducer> {
        this.removePages(this.config.removedPages);
        return this;
    }

    removePages(removePages: number[]): PdfProducer {
        let numberOfRemovedPages = 0;
        removePages.sort().forEach((page) => {
            this.pdfDocument.removePage(Math.max(0, page - 1 - numberOfRemovedPages));
            numberOfRemovedPages += 1;
        });
        return this;
    }

    broadcast() {
        const params = queryParams();
        const message: BroadcastMessage<EditDocumentBroadcastMessage> = Broadcast.convertToBroadcastMessage(params.id, {
            document: FileUtils._arrayBufferToBase64(this.processedDocument),
            config: this.config,
        });
        Broadcast.sendBroadcast(BroadcastNames.EDIT_DOCUMENT_RESULT, message);
    }

    async saveChanges(): Promise<PdfProducer> {
        this.processedDocument = await this.pdfDocument.save();
        return this;
    }

    async openInNewTab() {
        await this.saveChanges();
        FileUtils.openFile(this.processedDocument, true);
        return this;
    }
}
