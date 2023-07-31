import { FileUtils } from "@navikt/bidrag-ui-common";
import { PDFDocument, PDFPage, PDFPageDrawRectangleOptions, rgb } from "pdf-lib";
import { PDFFont } from "pdf-lib";
import { RotationTypes } from "pdf-lib";
import { StandardFonts } from "pdf-lib/es";

import { ICoordinates, IMaskingItemProps } from "../components/masking/MaskingItem";
import { PdfDocumentType } from "../components/utils/types";
import { EditDocumentMetadata } from "../types/EditorTypes";
import pdf2Image from "./Pdf2Image";

type ProgressState = "MASK_PAGE" | "CONVERT_PAGE_TO_IMAGE" | "REMOVE_PAGE" | "SAVE_PDF";
export interface IProducerProgress {
    state: ProgressState;
    progress: number;
}
export class PdfProducer {
    private pdfDocument: PDFDocument;
    private pdfBlob: PdfDocumentType;
    private processedDocument: Uint8Array;
    private config: EditDocumentMetadata;
    private onProgressUpdate: (process: IProducerProgress) => void;

    private font: PDFFont;
    constructor(pdfBlob: PdfDocumentType) {
        this.pdfBlob = pdfBlob;
    }

    async init(
        config: EditDocumentMetadata,
        onProgressUpdate?: (process: IProducerProgress) => void
    ): Promise<PdfProducer> {
        this.config = config;
        this.onProgressUpdate = onProgressUpdate;
        this.pdfDocument = await PDFDocument.load(this.pdfBlob);
        this.font = await this.pdfDocument.embedFont(StandardFonts.TimesRoman);
        return this;
    }

    private onProgressUpdated(state: ProgressState, pageNumber: number, progress?: number) {
        this.onProgressUpdate?.({
            state,
            progress: this.getProgressByWeight(state, pageNumber, progress),
        });
    }

    private getProgressByWeight(state: ProgressState, pageNumber: number, _progress?: number) {
        const totalPages = this.pdfDocument.getPageCount();
        const progress = _progress ?? pageNumber / totalPages;
        const percentageRange = this.stateToProgressPercentageRate(state);

        return Math.round((percentageRange[1] - percentageRange[0]) * progress + percentageRange[0]);
    }

    private stateToProgressPercentageRate(state: ProgressState): number[] {
        switch (state) {
            case "MASK_PAGE":
                return [0, 20];
            case "CONVERT_PAGE_TO_IMAGE":
                return [20, 80];
            case "REMOVE_PAGE":
                return [80, 90];
            case "SAVE_PDF":
                return [90, 100];
        }
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
        await pdf2Image(byteDoc, async (key, pageUrl) => {
            const pageNumber = maskedPages[key - 1];
            const originalPage = this.pdfDocument.getPage(pageNumber);
            const rotation = originalPage.getRotation().angle;
            const height = rotation == 90 || rotation == 270 ? originalPage.getWidth() : originalPage.getHeight();
            const width = rotation == 90 || rotation == 270 ? originalPage.getHeight() : originalPage.getWidth();
            this.pdfDocument.removePage(pageNumber);
            this.pdfDocument.insertPage(pageNumber);
            const newPage = this.pdfDocument.getPage(pageNumber);
            newPage.setHeight(height);
            newPage.setWidth(width);
            const blob = await fetch(pageUrl).then(async (res) => new Uint8Array(await res.arrayBuffer()));
            const jpgImage = await this.pdfDocument.embedPng(blob);

            newPage.drawImage(jpgImage, jpgImage.scaleToFit(width, height));
            this.onProgressUpdated(
                "CONVERT_PAGE_TO_IMAGE",
                maskedPages[key - 1],
                maskedPages[key - 1] / maskedPages.length
            );
        });
    }

    maskPages(items: IMaskingItemProps[]) {
        items
            .sort((a, b) => (a.pageNumber > b.pageNumber ? 1 : -1))
            .forEach((item) => {
                const page = this.pdfDocument.getPage(item.pageNumber - 1);
                const itemCoordinates = item.coordinates;
                const shortestSide = Math.min(itemCoordinates.height, itemCoordinates.width);
                const coordinatesAdjusted = this.getCoordinatesAfterRotation(page, itemCoordinates);
                const coordinates: PDFPageDrawRectangleOptions = {
                    ...coordinatesAdjusted,
                    color: rgb(1, 1, 1),
                    borderColor: rgb(0, 0, 0),
                    borderWidth: shortestSide < 200 ? 0.5 : 1,
                    opacity: 1,
                };
                page.drawRectangle(coordinates);
                const text = "Skjermet";
                const fontSize = this.getFontsize(coordinates.width, coordinates.height);
                const textCoordinates = this.calculateTextCoordinates(page, coordinates, itemCoordinates, text);
                console.log("ROTATION", textCoordinates, coordinates);
                page.drawText(text, {
                    x: textCoordinates.x,
                    y: textCoordinates.y,
                    size: fontSize,
                    opacity: 0.5,
                    rotate: {
                        type: RotationTypes.Degrees,
                        angle: textCoordinates.angle,
                    },
                    color: rgb(0.1, 0.1, 0.1),
                });
            });
    }

    private calculateTextCoordinates(
        page: PDFPage,
        coordinates: PDFPageDrawRectangleOptions,
        itemCoordinates: ICoordinates,
        text: string
    ) {
        const shouldRotateText = itemCoordinates.height > itemCoordinates.width;
        const fontSize = this.getFontsize(coordinates.width, coordinates.height);
        const rotation = page.getRotation().angle;
        const textRotation = rotation == 180 ? 180 : rotation == 90 ? 90 : rotation == 270 ? -90 : 0;
        const textLenght = this.font.widthOfTextAtSize(text, fontSize);
        const textHeight = this.font.heightAtSize(fontSize);
        let x = coordinates.x + coordinates.width / 2;
        let y = coordinates.y + coordinates.height / 2;
        if (rotation == 90) {
            x -= shouldRotateText ? -textLenght / 2 : textHeight / 2;
            y -= shouldRotateText ? -textHeight / 2 : textLenght / 2;
        } else if (rotation == 270) {
            x -= shouldRotateText ? textLenght / 2 : textHeight / 2;
            y -= shouldRotateText ? textHeight / 2 : -textLenght / 2;
        } else if (rotation == 180) {
            x -= shouldRotateText ? textHeight / 2 : -textLenght / 2;
            y -= shouldRotateText ? -textLenght / 2 : -textHeight / 2;
        } else {
            x -= shouldRotateText ? -textHeight / 2 : textLenght / 2;
            y -= shouldRotateText ? textLenght / 2 : textHeight / 2;
        }
        return {
            x,
            y,
            angle: textRotation + (shouldRotateText ? 90 : 0),
        };
    }

    private getCoordinatesAfterRotation(page: PDFPage, itemCoordinates: ICoordinates) {
        const pageRotation = page.getRotation().angle;
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();

        //These coords are now from bottom/left
        const coordsFromBottomLeft = {
            x: itemCoordinates.x,
            y: itemCoordinates.y,
        };

        let drawX = null;
        let drawY = null;
        let height = itemCoordinates.height;
        let width = itemCoordinates.width;
        if (pageRotation === 90) {
            //Reference point is on the top left corner.
            //Down is positive. Adjust item coordinates to be top left
            drawY = coordsFromBottomLeft.x;
            drawX = coordsFromBottomLeft.y + pageWidth;
            height = itemCoordinates.width;
            width = itemCoordinates.height;
        } else if (pageRotation === 180) {
            //Reference point is on the top right corner.
            coordsFromBottomLeft.y = -itemCoordinates.height - itemCoordinates.y;
            drawX = -coordsFromBottomLeft.x + pageWidth - itemCoordinates.width;
            drawY = -coordsFromBottomLeft.y + pageHeight - itemCoordinates.height;
        } else if (pageRotation === 270) {
            //Reference point is on the bottom right corner.
            drawX = -coordsFromBottomLeft.y - itemCoordinates.height;
            drawY = pageHeight - coordsFromBottomLeft.x - itemCoordinates.width;
            height = itemCoordinates.width;
            width = itemCoordinates.height;
        } else {
            //Reference point is on the bottom left corner.
            coordsFromBottomLeft.y = -itemCoordinates.height - itemCoordinates.y;
            drawX = coordsFromBottomLeft.x;
            drawY = coordsFromBottomLeft.y;
        }
        return {
            x: drawX,
            y: drawY,
            width,
            height,
        };
    }
    private getFontsize(width: number, height: number) {
        const longestSide = Math.max(height, width);
        if (longestSide < 30) {
            return 2;
        } else if (longestSide < 50) {
            return 4;
        } else if (longestSide < 80) {
            return 7;
        } else if (longestSide < 150) {
            return 8;
        } else if (longestSide < 200) {
            return 12;
        } else if (longestSide < 300) {
            return 14;
        }
        return 16;
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

    async saveChanges(): Promise<PdfProducer> {
        this.processedDocument = await this.pdfDocument.save();
        this.onProgressUpdate?.({
            state: "SAVE_PDF",
            progress: 100,
        });
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