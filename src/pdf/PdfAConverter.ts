import { LoggerService } from "@navikt/bidrag-ui-common";
import fontkit from "@pdf-lib/fontkit";
import {
    PDFDict,
    PDFDocument,
    PDFHexString,
    PDFName,
    PDFObject,
    PDFPageLeaf,
    PDFRawStream,
    PDFString,
    StandardFonts,
} from "pdf-lib";

import { BIDRAG_FORSENDELSE_API } from "../api/api";
//@ts-ignore
import colorProfile from "./files/sRGB2014.icc";
import { PDF_EDITOR_CREATOR, PDF_EDITOR_PRODUCER, PdfProducerHelpers } from "./PdfHelpers";
export class PdfAConverter {
    async convertAndSave(origDoc: PDFDocument, title: string, copyPDF = false): Promise<Uint8Array> {
        const pdfDoc = await this.copyPdfDocument(origDoc, copyPDF);
        pdfDoc.registerFontkit(fontkit);
        const documentDate = new Date();
        const documentId = crypto.randomUUID();
        this.flattenForm(pdfDoc);
        this.addMetadata(origDoc, pdfDoc, documentDate, documentId, title);
        this.removeXFA(pdfDoc);
        // await this.addFont(pdfDoc);
        // this.addColorProfile(pdfDoc);
        this.deleteJavascript(pdfDoc);
        return pdfDoc.save({
            useObjectStreams: false,
        });
    }
    private copyPdfDocument(originalDoc: PDFDocument, copyPDF = false): Promise<PDFDocument> {
        if (copyPDF) {
            return originalDoc.copy();
        }
        return Promise.resolve(originalDoc);
    }
    addColorProfile(doc: PDFDocument) {
        const profile = colorProfile;
        const profileStream = doc.context.stream(profile, {
            Length: profile.length,
        });
        const profileStreamRef = doc.context.register(profileStream);

        const outputIntent = doc.context.obj({
            Type: "OutputIntent",
            S: "GTS_PDFA1",
            Info: "sRGB IEC61966-2.1",
            RegistryName: "http://www.color.org",
            OutputCondition: PDFString.of("sRGB IEC61966-2.1"),
            OutputConditionIdentifier: PDFString.of("sRGB IEC61966-2.1"),
            DestOutputProfile: profileStreamRef,
        });
        const outputIntentRef = doc.context.register(outputIntent);
        doc.catalog.set(PDFName.of("OutputIntents"), doc.context.obj([outputIntentRef]));
    }

    private async addFont(pdfDoc: PDFDocument) {
        await pdfDoc.embedFont(StandardFonts.TimesRoman);
        await pdfDoc.embedStandardFont(StandardFonts.TimesRoman);
    }
    private addDocumentId(pdfDoc: PDFDocument, documentId: string) {
        const id = PDFHexString.of(documentId);
        pdfDoc.context.trailerInfo.ID = pdfDoc.context.obj([id, id]);
    }
    private async removeXFA(pdfDoc: PDFDocument) {
        const form = pdfDoc.getForm();

        form.deleteXFA();
    }

    private flattenForm(pdfDoc: PDFDocument) {
        const form = pdfDoc.getForm();
        try {
            form.flatten();
        } catch (e) {
            LoggerService.error(
                "Det skjedde en feil ved 'flatning' av form felter i PDF. Prøver å sette felter read-only istedenfor",
                e
            );
            this.makeFieldsReadOnly(pdfDoc);
        }
    }

    private makeFieldsReadOnly(pdfDoc: PDFDocument) {
        const form = pdfDoc.getForm();
        try {
            form.getFields().forEach((field) => {
                field.enableReadOnly();
            });
            form.flatten();
        } catch (e) {
            LoggerService.error("Det skjedde en feil ved markering av form felter som read-only PDF", e);
        }
    }

    private deleteJavascript(pdfDoc: PDFDocument) {
        pdfDoc.context.enumerateIndirectObjects().forEach(([ref, obj]) => {
            if (this.isPdfObjectJavascript(obj)) {
                pdfDoc.context.delete(ref);
            }
        });
    }
    // Copied from https://github.com/Hopding/pdf-lib/issues/1183#issuecomment-1685078941
    private _addMetadata(pdfDoc: PDFDocument, date: Date, title: string, author: string) {
        pdfDoc.setTitle(title);
        pdfDoc.setAuthor(pdfDoc.getAuthor() ?? author);
        pdfDoc.setProducer(PDF_EDITOR_PRODUCER);
        pdfDoc.setCreator(pdfDoc.getCreator() ?? PDF_EDITOR_CREATOR);
        pdfDoc.setModificationDate(date);
    }

    // remove millisecond from date
    private _formatDate(date) {
        return date.toISOString().split(".")[0] + "Z";
    }

    private removeColorspace(obj: PDFObject) {
        if (obj instanceof PDFPageLeaf) {
            obj.Resources().delete(PDFName.of("ColorSpace"));
        }
    }

    private addMetadata(originalDoc: PDFDocument, pdfDoc: PDFDocument, date: Date, documentId: string, title: string) {
        const originalAuthor = PdfProducerHelpers.getAuthor(originalDoc);
        const originalCreationDate = PdfProducerHelpers.getCreationDate(originalDoc);
        const producer = PDF_EDITOR_PRODUCER;
        const creator = originalDoc.getCreator() ?? PDF_EDITOR_CREATOR;
        const author = originalAuthor ?? PDF_EDITOR_CREATOR;
        pdfDoc.setTitle(title, { showInWindowTitleBar: true });
        pdfDoc.setAuthor(author);
        pdfDoc.setProducer(producer);
        pdfDoc.setCreator(creator);
        pdfDoc.setModificationDate(date);
        const metadataXML = `
        <?xpacket begin="" id="${documentId}"?>
            <x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.2-c001 63.139439, 2010/09/27-13:37:26">
            <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            
                <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
                <dc:format>application/pdf</dc:format>
                <dc:creator>
                    <rdf:Seq>
                    <rdf:li>${author}</rdf:li>
                    </rdf:Seq>
                </dc:creator>
                <dc:title>
                    <rdf:Alt>
                    <rdf:li xml:lang="x-default">${title}</rdf:li>
                    </rdf:Alt>
                </dc:title>
                </rdf:Description>
            
                <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
                <xmp:CreatorTool>${creator}</xmp:CreatorTool>
                <xmp:CreateDate>${this._formatDate(originalCreationDate ?? date)}</xmp:CreateDate>
                <xmp:ModifyDate>${this._formatDate(date)}</xmp:ModifyDate>
                <xmp:MetadataDate>${this._formatDate(date)}</xmp:MetadataDate>
                </rdf:Description>
            
                <rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
                <pdf:Producer>${producer}</pdf:Producer>
                </rdf:Description>
            
                <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
                <pdfaid:part>1</pdfaid:part>
                <pdfaid:conformance>B</pdfaid:conformance>
                </rdf:Description>
            </rdf:RDF>
            </x:xmpmeta>
        <?xpacket end="w"?>
        `.trim();
        const metadataStream = pdfDoc.context.stream(metadataXML, {
            Type: "Metadata",
            Subtype: "XML",
            Length: metadataXML.length,
        });

        const metadataStreamRef = pdfDoc.context.register(metadataStream);

        pdfDoc.catalog.set(PDFName.of("Metadata"), metadataStreamRef);
    }

    private deleteExistingMetadata(pdfDoc: PDFDocument) {
        pdfDoc.context.enumerateIndirectObjects().forEach(([ref, obj]) => {
            if (this.isPdfObjectMetadata(obj)) {
                const isDeleted = pdfDoc.context.delete(ref);
                console.log("Deleted Metadata", obj.toString(), isDeleted);
            }
        });
    }
    private isPdfObjectMetadata(obj: PDFObject) {
        if (obj instanceof PDFRawStream) {
            return obj.dict.values().some((v) => v.toString() == "/Metadata");
        }
        return false;
    }

    private isPdfObjectJavascript(obj: PDFObject) {
        if (obj instanceof PDFDict) {
            return obj.has(PDFName.of("JS"));
        }
        return false;
    }
}

export const validatePDFBytes = async (documentFile: Uint8Array): Promise<void> => {
    try {
        console.log("Validerer PDF/A kompatibilitet");
        const pdfAResult = await BIDRAG_FORSENDELSE_API.api.validerPdf(
            new File([documentFile], "", {
                type: "application/pdf",
            }),
            { headers: { "Content-Type": "application/pdf" } }
        );
        console.log("Validering resultat", pdfAResult.data);
    } catch (e) {
        console.error("Det skjedde en feil ved validering", e);
    }
};
