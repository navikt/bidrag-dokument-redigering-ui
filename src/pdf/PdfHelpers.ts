import { LoggerService } from "@navikt/bidrag-ui-common";
import { PDFDict, PDFDocument, PDFName, PDFPage, PDFStream } from "pdf-lib";
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
export function hasInvalidXObject(pdfdoc: PDFDocument) {
    try {
        return pdfdoc.getPages().some((page, index) => {
            // page.node.context.enumerateIndirectObjects().forEach((indirectObject) => {
            //     const ref = indirectObject[0];
            //     const obj = indirectObject[1];
            //     // console.log(ref.toString(), obj.toString());
            //     if (obj instanceof PDFRawStream) {
            //         console.log(obj.getContentsString());
            //     }
            // });
            return pageHasInvalidXObject(page, pdfdoc, index + 1);
        });
    } catch (e) {
        LoggerService.error("Det skjdde en feil ved sjekk for ugyldig xObject", e);
        return false;
    }
}

function pageHasInvalidXObject(page: PDFPage, pdfdoc: PDFDocument, pageNumber: number) {
    const xObject = page.node.Resources().get(PDFName.of("XObject"));
    if (xObject && xObject instanceof PDFDict) {
        const xMap = xObject.asMap();
        return Array.from(xMap.keys()).some((key) => {
            const stream = pdfdoc.context.lookupMaybe(xMap.get(key), PDFStream);
            const type = stream.dict.get(PDFName.of("Type"));
            if (type == undefined && key.toString().includes("FlatWidget")) {
                // console.log(page.node.context, stream.getContentsString(), stream.toString(), stream.getContents());
                LoggerService.warn(`Side ${pageNumber} har ugyldig XObject fra PDF ${key}`, {
                    name: "PDFError",
                    message: `Side ${pageNumber} har ugyldig XObject fra PDF ${key}`,
                    stack: `Side ${pageNumber} har ugyldig XObject fra PDF ${key} - ${stream.getContentsString()} - ${stream.dict?.toString()}`,
                });
                return true;
            }
        });
    } else {
        LoggerService.warn(`pageHasInvalidXObject: XObject is not PDFDict ${xObject?.toString()}`);
    }
    return false;
}

export async function flattenForm(pdfDoc: PDFDocument, onError: () => void) {
    const form = pdfDoc.getForm();
    try {
        form.flatten();
        if (hasInvalidXObject(pdfDoc)) {
            LoggerService.warn(`Dokument er korrupt etter flatning av form felter. Ruller tilbake endringer`);
            await onError();
        }
    } catch (e) {
        LoggerService.error(
            "Det skjedde en feil ved 'flatning' av form felter i PDF. Laster PDF på nytt uten å flatne form for å unngå korrupt PDF",
            e
        );
        await onError();
        //this.makeFieldsReadOnly(pdfDoc);
    }
}

export function makeFieldsReadOnly() {
    const form = this.pdfDocument.getForm();
    try {
        form.getFields().forEach((field) => {
            form.removeField(field);
        });
        form.flatten();
    } catch (e) {
        LoggerService.error("Det skjedde en feil ved markering av form felter som read-only PDF", e);
    }
}
//
