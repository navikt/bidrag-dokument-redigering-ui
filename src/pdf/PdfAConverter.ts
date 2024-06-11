import { LoggerService } from "@navikt/bidrag-ui-common";
import {
    PDFDict,
    PDFDocument,
    PDFHexString,
    PDFName,
    PDFObject,
    PDFPage,
    PDFPageLeaf,
    PDFRawStream,
    PDFRef,
    PDFStream,
    PDFString,
    StandardFonts,
} from "pdf-lib";

import { BIDRAG_FORSENDELSE_API } from "../api/api";
//@ts-ignore
import colorProfile from "./files/sRGB2014.icc";
import { PDF_EDITOR_CREATOR, PDF_EDITOR_PRODUCER, PdfProducerHelpers } from "./PdfHelpers";
export class PdfAConverter {
    private origDoc: PDFDocument;
    private copyPDF: boolean = false;
    private title: string;
    private pdfDoc: PDFDocument;
    async convertAndSave(origDoc: PDFDocument, title: string, copyPDF = false): Promise<Uint8Array> {
        this.origDoc = origDoc;
        this.copyPDF = copyPDF;
        this.title = title;
        this.pdfDoc = await this.copyPdfDocument(this.origDoc, copyPDF);
        const documentDate = new Date();
        const documentId = crypto.randomUUID().replaceAll("-", "");
        //await flattenForm(this.pdfDoc, () => this.loadPDF(true));
        this.addMetadata(origDoc, this.pdfDoc, documentDate, documentId, this.title);
        this.removeXFA(this.pdfDoc);
        this.addDocumentId(this.pdfDoc, documentId);
        // await this.addFont(pdfDoc);
        // this.addColorProfile(pdfDoc);
        this.deleteJavascript(this.pdfDoc);
        return this.pdfDoc.save({
            useObjectStreams: false,
        });
    }

    private async loadPDF(copyPDF: boolean) {
        this.pdfDoc = await this.copyPdfDocument(this.origDoc, copyPDF);
        //this.pdfDoc.registerFontkit(fontkit);
    }
    private copyPdfDocument(originalDoc: PDFDocument, copyPDF = false): Promise<PDFDocument> {
        if (copyPDF) {
            console.debug("Copying PDF file");
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
        try {
            const form = pdfDoc.getForm();

            form.deleteXFA();
        } catch (e) {
            LoggerService.error("Feil ved sletting av XFA", e);
        }
    }

    private deleteJavascript(pdfDoc: PDFDocument) {
        pdfDoc.context.enumerateIndirectObjects().forEach(([ref, obj]) => {
            if (this.isPdfObjectJavascript(obj)) {
                pdfDoc.context.delete(ref);
            }
        });
    }

    private removeInvalidXobjects(pdfdoc: PDFDocument) {
        pdfdoc.getPages().forEach((page, index) => {
            console.log("Page number", index, page.node.toString(), page.node.Resources());
            this.removeInvalidXobject(page, pdfdoc);
        });
    }

    private removeInvalidXobject(page: PDFPage, pdfdoc: PDFDocument) {
        // obj.Resources().delete(PDFName.of("XObject"));
        const xObject = page.node.Resources().get(PDFName.of("XObject")) as PDFDict;
        if (xObject) {
            const xMap = xObject.asMap();
            return Array.from(xMap.keys()).some((key) => {
                const stream = pdfdoc.context.lookupMaybe(xMap.get(key), PDFStream);

                const ref = xMap.get(key) as PDFRef;
                const type = stream.dict.get(PDFName.of("Type"));
                if (type == undefined && key.toString().includes("FlatWidget")) {
                    LoggerService.warn("Fjerner ugyldig XObject fra PDF " + key + " - " + stream.dict.toString());
                    console.log(stream, xMap.get(key), stream.getContentsString());
                    console.log(pdfdoc.context.delete(ref));

                    // console.log(obj.toString());
                    return true;
                }
            });
        }
        return false;
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
        try {
            pdfDoc.setTitle(title, { showInWindowTitleBar: true });
            pdfDoc.setAuthor(author);
            pdfDoc.setProducer(producer);
            pdfDoc.setCreator(creator);
            pdfDoc.setCreationDate(originalCreationDate ?? date);
            pdfDoc.setModificationDate(date);
        } catch (e) {
            LoggerService.error("Feil ved setting av metadata", e);
        }

        // const metadataXML = `
        // <?xpacket begin="" id="${documentId}"?>
        //     <x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.2-c001 63.139439, 2010/09/27-13:37:26">
        //     <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">

        //         <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
        //         <dc:format>application/pdf</dc:format>
        //         <dc:creator>
        //             <rdf:Seq>
        //             <rdf:li>${author}</rdf:li>
        //             </rdf:Seq>
        //         </dc:creator>
        //         <dc:title>
        //             <rdf:Alt>
        //             <rdf:li xml:lang="x-default">${title}</rdf:li>
        //             </rdf:Alt>
        //         </dc:title>
        //         </rdf:Description>

        //         <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
        //         <xmp:CreatorTool>${creator}</xmp:CreatorTool>
        //         <xmp:CreateDate>${this._formatDate(originalCreationDate ?? date)}</xmp:CreateDate>
        //         <xmp:ModifyDate>${this._formatDate(date)}</xmp:ModifyDate>
        //         <xmp:MetadataDate>${this._formatDate(date)}</xmp:MetadataDate>
        //         </rdf:Description>

        //         <rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
        //         <pdf:Producer>${producer}</pdf:Producer>
        //         </rdf:Description>
        //     </rdf:RDF>
        //     </x:xmpmeta>
        // <?xpacket end="w"?>
        // `.trim();
        // const metadataStream = pdfDoc.context.stream(metadataXML, {
        //     Type: "Metadata",
        //     Subtype: "XML",
        //     Length: metadataXML.length,
        // });

        // const metadataStreamRef = pdfDoc.context.register(metadataStream);

        // pdfDoc.catalog.set(PDFName.of("Metadata"), metadataStreamRef);
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

export const convertTOPDFA = async (documentFile: Uint8Array): Promise<string> => {
    try {
        console.log("Konverterer til PDF/A");
        const pdfAResult = await BIDRAG_FORSENDELSE_API.api.convertToPdfa2(
            new File([documentFile], "", {
                type: "application/pdf",
            }),
            { headers: { "Content-Type": "application/pdf" } }
        );
        return pdfAResult.data;
    } catch (e) {
        console.error("Det skjedde en feil ved validering", e);
    }
};
