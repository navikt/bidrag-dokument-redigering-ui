import { LoggerService } from "@navikt/bidrag-ui-common";
import { PDFDocument } from "pdf-lib";
export const PDF_EDITOR_PRODUCER = "bidrag-dokument-redigering-ui";
export const PDF_EDITOR_CREATOR = "NAV - Arbeids- og velferdsetaten";

export class PdfProducerHelpers {
    static getCreationDate(pdfDoc: PDFDocument): Date | undefined {
        try {
            return pdfDoc.getCreationDate();
        } catch (e) {
            LoggerService.error(`Kunne ikke hente creation date for dokument`, e);
            return new Date();
        }
    }

    static getModificationDate(pdfDoc: PDFDocument): Date | undefined {
        try {
            return pdfDoc.getModificationDate();
        } catch (e) {
            LoggerService.error(`Kunne ikke hente modification date for dokument`, e);
            return new Date();
        }
    }

    static getCreator(pdfDoc: PDFDocument): string | undefined {
        try {
            return pdfDoc.getCreator();
        } catch (e) {
            LoggerService.error(`Kunne ikke hente creator for dokument`, e);
            return PDF_EDITOR_CREATOR;
        }
    }

    static getProducer(pdfDoc: PDFDocument): string | undefined {
        try {
            return pdfDoc.getProducer();
        } catch (e) {
            LoggerService.error(`Kunne ikke hente producer for dokument`, e);
            return PDF_EDITOR_PRODUCER;
        }
    }

    static getAuthor(pdfDoc: PDFDocument): string | undefined {
        try {
            return pdfDoc.getAuthor();
        } catch (e) {
            LoggerService.error(`Kunne ikke hente author for dokument`, e);
            return;
        }
    }

    static getSubject(pdfDoc: PDFDocument): string | undefined {
        try {
            return pdfDoc.getSubject();
        } catch (e) {
            LoggerService.error(`Kunne ikke hente subject for dokument`, e);
            return;
        }
    }

    static getTitle(pdfDoc: PDFDocument): string | undefined {
        try {
            return pdfDoc.getTitle();
        } catch (e) {
            LoggerService.error(`Kunne ikke hente title for dokument`, e);
            return;
        }
    }
}
