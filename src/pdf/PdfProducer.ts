import {
    Broadcast,
    BroadcastMessage,
    BroadcastNames,
    EditDocumentBroadcastMessage,
    FileUtils,
    queryParams,
} from "@navikt/bidrag-ui-common";
import { PDFDocument, rgb } from "pdf-lib";
import { PDFFont } from "pdf-lib";
import { RotationTypes } from "pdf-lib";
import { StandardFonts } from "pdf-lib/es";

import { IMaskingItemProps } from "../components/masking/MaskingItem";
import { PdfDocumentType } from "../components/utils/types";
import { EditDocumentMetadata } from "../types/EditorTypes";
import pdf2Image from "./Pdf2Image";

export class PdfProducer {
    private pdfDocument: PDFDocument;
    private pdfBlob: PdfDocumentType;
    private processedDocument: Uint8Array;
    private config: EditDocumentMetadata;

    private font: PDFFont;
    constructor(pdfBlob: PdfDocumentType) {
        this.pdfBlob = pdfBlob;
    }

    async init(config: EditDocumentMetadata): Promise<PdfProducer> {
        this.config = config;
        this.pdfDocument = await PDFDocument.load(this.pdfBlob);
        this.font = await this.pdfDocument.embedFont(StandardFonts.TimesRoman);
        return this;
    }

    async process(): Promise<PdfProducer> {
        this.pdfDocument.getForm().flatten();
        const itemsFiltered = this.config.items.filter((item) => !this.config.removedPages.includes(item.pageNumber));
        // @ts-ignore
        this.maskPages(itemsFiltered);
        // @ts-ignore
        await this.convertMaskedPagesToImage(itemsFiltered);
        this.removePages(this.config.removedPages);
        return this;
    }

    async convertMaskedPagesToImage(items: IMaskingItemProps[]) {
        if (items.length == 0) return;
        const maskedPages = Array.from(new Set(items.map((p) => p.pageNumber - 1)));
        const tempDoc = await PDFDocument.create();
        for (const pageNumber of maskedPages) {
            const [copiedPage] = await tempDoc.copyPages(this.pdfDocument, [pageNumber]);
            tempDoc.addPage(copiedPage);
        }
        const byteDoc = await tempDoc.save();
        const pageDataUrls: string[] = await pdf2Image(byteDoc);
        for (const key in maskedPages) {
            const pageNumber = maskedPages[key];
            const originalPage = this.pdfDocument.getPage(pageNumber);
            this.pdfDocument.removePage(pageNumber);
            this.pdfDocument.insertPage(pageNumber);
            const newPage = this.pdfDocument.getPage(pageNumber);
            const pageUrl = pageDataUrls[key];
            const blob = await fetch(pageUrl).then(async (res) => new Uint8Array(await res.arrayBuffer()));
            const jpgImage = await this.pdfDocument.embedPng(blob);
            newPage.drawImage(jpgImage, jpgImage.scaleToFit(originalPage.getWidth(), originalPage.getHeight()));
        }
    }

    maskPages(items: IMaskingItemProps[]) {
        items
            .sort((a, b) => (a.pageNumber > b.pageNumber ? 1 : -1))
            .forEach((item) => {
                const page = this.pdfDocument.getPage(item.pageNumber - 1);
                const relativeScale = 1;
                const coordinates = {
                    x: item.coordinates.x * relativeScale,
                    y: (-item.coordinates.y - item.coordinates.height) * relativeScale,
                    width: item.coordinates.width * relativeScale,
                    height: item.coordinates.height * relativeScale,
                    color: rgb(1, 1, 1),
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                    opacity: 1,
                };
                page.drawRectangle(coordinates);
                const text = "Skjermet";
                const fontSize = Math.max(text.length, (coordinates.height / coordinates.width) * 10);
                page.drawText(text, {
                    x: coordinates.x + coordinates.width / 2 - text.length * 2,
                    y: coordinates.y + coordinates.height / 2.5,
                    size: fontSize,
                    opacity: 0.5,
                    rotate: {
                        type: RotationTypes.Degrees,
                        angle: -page.getRotation().angle,
                    },
                    color: rgb(0.1, 0.1, 0.1),
                });
            });
    }

    removePages(removePages: number[]): PdfProducer {
        let numberOfRemovedPages = 0;
        removePages
            .sort((a, b) => a - b)
            .forEach((page) => {
                this.pdfDocument.removePage(Math.abs(page - 1 - numberOfRemovedPages));
                numberOfRemovedPages += 1;
            });
        return this;
    }

    broadcast() {
        const params = queryParams();
        const message: BroadcastMessage<EditDocumentBroadcastMessage> = Broadcast.convertToBroadcastMessage(params.id, {
            documentFile: FileUtils._arrayBufferToBase64(this.processedDocument),
            config: JSON.stringify(this.config),
        });
        Broadcast.sendBroadcast(BroadcastNames.EDIT_DOCUMENT_RESULT, message);
    }

    async saveChanges(): Promise<PdfProducer> {
        this.processedDocument = await this.pdfDocument.save();
        return this;
    }

    getProcessedDocument(): Uint8Array {
        return this.processedDocument;
    }

    async openInNewTab() {
        await this.saveChanges();
        FileUtils.openFile(this.processedDocument, true);
        return this;
    }
}
