import { PDFArray, PDFDict, PDFDocument, PDFName, PDFPage, PDFPageLeaf, PDFRawStream } from "@cantoo/pdf-lib";
import { Checkbox, Heading } from "@navikt/ds-react";
import { ChangeEvent, useState } from "react";

import { PdfDocumentType } from "../../components/utils/types";
import { convertTOPDFA } from "../../pdf/PdfAConverter";
import { fixMissingPages, repairPDF } from "../../pdf/PdfHelpers";
import DokumentMaskering from "../dokumentmaskering/DokumentMaskering";
import PageWrapper from "../PageWrapper";

type DebugPageProps = {
    forsendelseId: string;
    dokumentreferanse: string;
};
export default function DebugPage({ forsendelseId, dokumentreferanse }: DebugPageProps) {
    const [pdfdocument, setPdfdocument] = useState<PdfDocumentType>();
    const [removeImages, setRemoveImages] = useState<"all" | "masked" | "none">("none");
    const [enableDebugFunctions, setEnableDebugFunctions] = useState(true);
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
    async function loadFileAndRepairPDF(ev: ChangeEvent<HTMLInputElement>) {
        const fileBuffer = await readFile(ev);
        const pdfdoc = await PDFDocument.load(fileBuffer);
        await fixMissingPages(pdfdoc);

        await repairPDF(pdfdoc, enableDebugFunctions);
        return pdfdoc;
    }

    async function repairPDFAndOpen(ev: ChangeEvent<HTMLInputElement>) {
        const pdfdoc = await loadFileAndRepairPDF(ev);
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
                        <Checkbox
                            defaultChecked={enableDebugFunctions}
                            onChange={(value) => setEnableDebugFunctions(value.target.checked)}
                        >
                            Skru på debug funksjonalitet
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
                            onChange={loadFileAndRepairPDF}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <Heading className="text-white" size="medium">
                        Reparer og åpne
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
