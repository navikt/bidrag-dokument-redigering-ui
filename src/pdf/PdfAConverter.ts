import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFHexString, PDFName, PDFString, StandardFonts } from "pdf-lib";

import colorProfile from "./files/sRGB2014.icc";
export class PdfAConverter {
    private PRODUCER = "Bidrag redigeringsklient for skjerming av dokumenter";
    private CREATOR = "NAV - Arbeids- og velferdsetaten";
    async convertAndSave(pdfDoc: PDFDocument, title: string) {
        pdfDoc.registerFontkit(fontkit);
        const documentDate = new Date();
        this._addMetadata(pdfDoc, documentDate, title);
        this.addDocumentId(pdfDoc);
        this.removeAnnots(pdfDoc);
        await this.addFont(pdfDoc);
        this.setColorProfile(pdfDoc);

        return pdfDoc.save({
            useObjectStreams: false,
        });
    }
    setColorProfile(doc: PDFDocument) {
        const profile = colorProfile;
        const profileStream = doc.context.stream(profile, {
            Length: profile.length,
        });
        const profileStreamRef = doc.context.register(profileStream);

        const outputIntent = doc.context.obj({
            Type: "OutputIntent",
            S: "GTS_PDFA1",
            OutputConditionIdentifier: PDFString.of("sRGB"),
            DestOutputProfile: profileStreamRef,
        });
        const outputIntentRef = doc.context.register(outputIntent);
        doc.catalog.set(PDFName.of("OutputIntents"), doc.context.obj([outputIntentRef]));
    }
    private async addFont(pdfDoc: PDFDocument) {
        await pdfDoc.embedStandardFont(StandardFonts.Courier);
        await pdfDoc.embedFont(StandardFonts.Courier);
    }
    private addDocumentId(pdfDoc: PDFDocument) {
        const documentId = crypto.randomUUID();
        const id = PDFHexString.of(documentId);
        pdfDoc.context.trailerInfo.ID = pdfDoc.context.obj([id, id]);
    }
    private async removeAnnots(pdfDoc: PDFDocument) {
        const form = pdfDoc.getForm();

        form.deleteXFA();
    }

    // Copied from https://github.com/Hopding/pdf-lib/issues/1183#issuecomment-1685078941
    private _addMetadata(pdfDoc: PDFDocument, date: Date, title: string) {
        pdfDoc.setTitle(title);
        pdfDoc.setProducer(this.PRODUCER);
        pdfDoc.setModificationDate(date);
    }

    // remove millisecond from date
    _formatDate(date) {
        return date.toISOString().split(".")[0] + "Z";
    }
}
