import {
    PDFArray,
    PDFDict,
    PDFDocument,
    PDFName,
    PDFPage,
    PDFPageLeaf,
    PDFRawStream,
    PDFStream,
} from "@cantoo/pdf-lib";
import { Checkbox, Heading } from "@navikt/ds-react";
import { ChangeEvent, useState } from "react";

import { PdfDocumentType } from "../../components/utils/types";
import { convertTOPDFA } from "../../pdf/PdfAConverter";
import DokumentMaskering from "../dokumentmaskering/DokumentMaskering";
import PageWrapper from "../PageWrapper";

type DebugPageProps = {
    forsendelseId: string;
    dokumentreferanse: string;
};
export default function DebugPage({ forsendelseId, dokumentreferanse }: DebugPageProps) {
    const [pdfdocument, setPdfdocument] = useState<PdfDocumentType>();
    const [removeImages, setRemoveImages] = useState<"all" | "masked" | "none">("none");
    async function openFile(ev: ChangeEvent<HTMLInputElement>) {
        const fileBuffer = await readFile(ev);
        //@ts-ignore
        setPdfdocument(new Blob([fileBuffer]));
    }

    async function readFile(ev: ChangeEvent<HTMLInputElement>) {
        const files = ev.target.files;
        if (files.length == 0) return;
        const file = ev.target.files[0];
        const fileBuffer = await file.arrayBuffer();
        return fileBuffer;
    }
    async function repairPDF(ev: ChangeEvent<HTMLInputElement>) {
        const fileBuffer = await readFile(ev);
        const pdfdoc = await PDFDocument.load(fileBuffer);

        pdfdoc.getPages().forEach((page, index) => {
            console.log("Page number", index, page.node.toString(), page.node.Resources());
            checkForInvalidXObjects(page, pdfdoc);
            const group = page.node.get(PDFName.of("Group"));
            if (group != null && group instanceof PDFDict) {
                const sObject = group.get(PDFName.of("S"));
                console.log("Group S object", group.toString(), sObject, sObject.toString());
            }
        });

        //console.log(pdfdoc.getForm().acroForm.getAllFields());
        pdfdoc
            .getForm()
            .acroForm.getAllFields()
            .forEach((field) => console.log(field[1].toString(), field));
    }
    async function removeUnlinkedAnnots(pdfdoc: PDFDocument) {
        for (const page of pdfdoc.getPages()) {
            console.debug("Starting to remove unlinked annots from page", page);
            try {
                const annots = page.node.get(PDFName.of("Annots")) as PDFArray;
                if (annots == undefined) return;
                for (const annot of annots.asArray()) {
                    try {
                        const annotDict = pdfdoc.context.lookupMaybe(annot, PDFDict);
                        console.debug("Annot dict", annotDict);
                        if (annotDict == undefined) {
                            console.warn("Fjerner annotasjon som ikke har noe kilde fra side: " + annot.toString());
                            // page.node.removeAnnot(annotRef);
                            page.node.delete(PDFName.of("Annots"));
                        }
                    } catch (e) {
                        console.error("Kunne ikke fjerne annotasjon", e);
                    }
                }
            } catch (e) {
                console.error("Det skjedde en feil ved fjerning ulinket annoteringer", e);
            }
        }
    }
    async function repairPDFAndOpen(ev: ChangeEvent<HTMLInputElement>) {
        const fileBuffer = await readFile(ev);
        const pdfdoc = await PDFDocument.load(fileBuffer);

        pdfdoc.getPages().forEach((page, index) => {
            console.log("Page number", index, page.node.toString(), page.node.Resources());
            checkForInvalidXObjects(page, pdfdoc);
            const group = page.node.get(PDFName.of("Group"));
            if (group != null && group instanceof PDFDict) {
                const sObject = group.get(PDFName.of("S"));
                console.log("Group S object", group.toString(), sObject, sObject.toString());
            }
        });

        //console.log(pdfdoc.getForm().acroForm.getAllFields());
        pdfdoc
            .getForm()
            .acroForm.getAllFields()
            .forEach((field) => console.log(field[1].toString(), field));
        removeUnlinkedAnnots(pdfdoc);
        const savedUpdatedPdfUint8Array = await pdfdoc.save();

        //@ts-ignore
        setPdfdocument(new Blob([savedUpdatedPdfUint8Array]));
    }
    async function convertPDF(ev: ChangeEvent<HTMLInputElement>) {
        const fileBuffer = await readFile(ev);
        const pdfdoc = await PDFDocument.load(fileBuffer);

        const pdfa = convertTOPDFA(new Uint8Array(fileBuffer));
        console.log(pdfa);
    }
    function checkForInvalidXObjects(page: PDFPage, pdfdoc: PDFDocument) {
        const xObject = page.node.Resources().get(PDFName.of("XObject")) as PDFDict;
        if (xObject) {
            const xMap = xObject.asMap();
            Array.from(xMap.keys()).forEach((key) => {
                const stream = pdfdoc.context.lookupMaybe(xMap.get(key), PDFStream);

                const type = stream.dict.get(PDFName.of("Type"));
                if (type == undefined && key.toString().includes("FlatWidget")) {
                    console.log("Is invalid", key, xObject.toString(), stream.dict.toString(), type);
                }
            });
        }
        return false;
    }
    async function recoverAndReadFile(ev: ChangeEvent<HTMLInputElement>) {
        const fileBuffer = await readFile(ev);
        const pdfdoc = await PDFDocument.load(fileBuffer);

        console.log("Before adding - PDF has", pdfdoc.getPageCount(), "pages");
        console.log("Before adding - PDF has", pdfdoc.getPageIndices(), "page indices");
        console.log("Before adding - PDF has", pdfdoc.getPages(), "pages");

        const pdfRecovered = await recoverPages(pdfdoc);

        console.log("PDF has", pdfRecovered.getPageCount(), "pages");
        console.log("PDF has", pdfRecovered.getPageIndices(), "page indices");
        console.log("PDF has", pdfRecovered.getPages(), "pages");

        if (removeImages == "all") {
            removeImagesFromPDF(pdfRecovered);
        }
        if (removeImages == "masked") {
            removeImagesFromPDFV2(pdfRecovered);
        }
        const savedUpdatedPdfUint8Array = await pdfRecovered.save();

        //@ts-ignore
        setPdfdocument(new Blob([savedUpdatedPdfUint8Array]));
    }

    async function recoverPages(pdfdoc: PDFDocument): Promise<PDFDocument> {
        const existingPages = pdfdoc.getPages();
        let pagenumber = existingPages.length;
        const pageLeafs = pdfdoc.context.enumerateIndirectObjects().filter(([ref, obj]) => obj instanceof PDFPageLeaf);
        console.log("PDF has", existingPages.length, "pages", pagenumber);
        console.log("PDF has actually", pageLeafs.length, "pages");
        if (pageLeafs.length != existingPages.length) {
            const blankPage = PDFPage.create(pdfdoc);
            pdfdoc.addPage(blankPage);
            blankPage.drawText("Gjenopprettet sider", { size: 30, x: 100, y: 500 });
            pagenumber += 1;
        }

        pageLeafs.forEach(([ref, obj], i) => {
            if (!existingPages.some((ep) => ep.ref == ref)) {
                console.log("Recovered page", pagenumber, ref.toString(), obj, obj.toString());
                pdfdoc.catalog.insertLeafNode(ref, pagenumber);
                pagenumber += 1;
            }
        });
        const savedPdfUint8Array = await pdfdoc.save();

        const pdfdocReloaded = await PDFDocument.load(savedPdfUint8Array);
        return pdfdocReloaded;
    }
    function removeImagesFromPDF(pdfdoc: PDFDocument) {
        console.log("Removing images from PDF");
        pdfdoc.context.enumerateIndirectObjects().forEach(([ref, obj]) => {
            // console.log("Element", ref.toString(), obj.toString(), obj);
            if (obj instanceof PDFRawStream) {
                const subtype = obj.dict.get(PDFName.of("Subtype"));
                if (subtype?.toString() == "/Image") {
                    console.log("Removing image", ref.toString());
                    pdfdoc.context.delete(ref);
                }
            } else if (obj instanceof PDFDict) {
                const procset = obj.get(PDFName.of("ProcSet"));
                if (procset instanceof PDFArray) {
                    const arr = procset.asArray();
                    const hasImage = arr.some((a) => a.toString().includes("Image"));
                    if (hasImage) {
                        console.log("Removing proceset", procset.toString());
                        pdfdoc.context.delete(ref);
                    }
                }
            }
        });
    }

    function removeImagesFromPDFV2(pdfdoc: PDFDocument) {
        console.log("Removing images from PDF V2");
        const pages = pdfdoc.getPages();
        pages.forEach((page, i) => {
            // console.log("Page ", i, page.node.toString(), page.node.entries(), page.ref.toString());
            const resources = page.node.Resources();
            const xObject = resources.get(PDFName.of("XObject"));
            if (xObject instanceof PDFDict) {
                const isImage = xObject.keys().some((value) => value.asString()?.includes("Image"));
                console.log("Delete ", xObject.toString(), "from page ", i + 1);
                if (isImage) resources.delete(PDFName.of("XObject"));
            }
        });
    }
    if (!pdfdocument) {
        return (
            <div className="text-white flex flex-row gap-2">
                <div className="flex flex-col gap-4">
                    <Heading className="text-white" size="medium">
                        Gjenopprett
                    </Heading>
                    <div>
                        <input
                            type="file"
                            name="Gjenopprett"
                            accept="application/pdf,application/vnd.ms-excel"
                            onChange={recoverAndReadFile}
                        />
                        <Checkbox onChange={(value) => setRemoveImages(value.target.checked ? "all" : "none")}>
                            Fjern bilder
                        </Checkbox>
                        <Checkbox onChange={(value) => setRemoveImages(value.target.checked ? "masked" : "none")}>
                            Fjern bilder bare fra maskerte sider
                        </Checkbox>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <Heading className="text-white" size="medium">
                        Reparer
                    </Heading>
                    <div>
                        <input
                            type="file"
                            name="Reparer"
                            accept="application/pdf,application/vnd.ms-excel"
                            onChange={repairPDFAndOpen}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <Heading className="text-white" size="medium">
                        Konverter og sjekk
                    </Heading>
                    <div>
                        <input
                            type="file"
                            name="Reparer"
                            accept="application/pdf,application/vnd.ms-excel"
                            onChange={convertPDF}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <Heading className="text-white" size="medium">
                        Åpne:
                    </Heading>
                    <input
                        type="file"
                        name="Åpne"
                        accept="application/pdf,application/vnd.ms-excel"
                        onChange={openFile}
                    />
                </div>
            </div>
        );
    }

    return (
        <PageWrapper name={"dokumentredigering_debug"}>
            <DokumentMaskering documentFile={pdfdocument} isLoading={false} mode="remove_pages_only" />
        </PageWrapper>
    );
}
