import { LoggerService, SecuritySessionUtils } from "@navikt/bidrag-ui-common";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFHexString, PDFName, PDFString, StandardFonts } from "pdf-lib";

import colorProfile from "./files/sRGB2014.icc";
export class PdfAConverter {
    private PRODUCER = "Bidrag redigeringsklient for skjerming av dokumenter";
    private CREATOR = "NAV - Arbeids- og velferdsetaten";
    async convertAndSave(pdfDoc: PDFDocument, title: string) {
        pdfDoc.registerFontkit(fontkit);
        const author = await SecuritySessionUtils.hentSaksbehandlerNavn();
        const documentDate = new Date();
        const documentId = crypto.randomUUID();
        this._addMetadata(pdfDoc, documentDate, documentId, title, author, this.PRODUCER, this.CREATOR);
        this.addDocumentId(pdfDoc, documentId);
        this.removeAnnots(pdfDoc);
        await this.addFont(pdfDoc);
        this.setColorProfile(pdfDoc);
        this.flattenForm(pdfDoc);

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
        await pdfDoc.embedStandardFont(StandardFonts.Courier);
    }
    private addDocumentId(pdfDoc: PDFDocument, documentId: string) {
        const id = PDFHexString.of(documentId);
        pdfDoc.context.trailerInfo.ID = pdfDoc.context.obj([id, id]);
    }
    private async removeAnnots(pdfDoc: PDFDocument) {
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

    // Copied from https://github.com/Hopding/pdf-lib/issues/1183#issuecomment-1685078941
    private _addMetadata(
        pdfDoc: PDFDocument,
        date: Date,
        documentId: string,
        title: string,
        author: string,
        producer: string,
        creator: string
    ) {
        const metadataXML = `
        <?xpacket begin="" id="${documentId}"?>
          <x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.2-c001 63.139439, 2010/09/27-13:37:26        ">
            <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    
              <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
                <dc:format>application/pdf</dc:format>
                <dc:creator>
                  <rdf:Seq>
                    <rdf:li>${pdfDoc.getAuthor() ?? author}</rdf:li>
                  </rdf:Seq>
                </dc:creator>
                <dc:title>
                   <rdf:Alt>
                      <rdf:li xml:lang="x-default">${title}</rdf:li>
                   </rdf:Alt>
                </dc:title>
              </rdf:Description>
    
              <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
                <xmp:CreatorTool>${pdfDoc.getCreator() ?? creator}</xmp:CreatorTool>
                <xmp:CreateDate>${this._formatDate(pdfDoc.getCreationDate() ?? date)}</xmp:CreateDate>
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

        pdfDoc.setTitle(title);
        pdfDoc.setProducer(this.PRODUCER);
        pdfDoc.setModificationDate(date);
    }

    // remove millisecond from date
    _formatDate(date) {
        return date.toISOString().split(".")[0] + "Z";
    }
}
