import { PDFDocument, PDFPageLeaf } from "pdf-lib";
import { ChangeEvent, useState } from "react";

import { PdfDocumentType } from "../../components/utils/types";
import DokumentMaskering from "../dokumentmaskering/DokumentMaskering";
import PageWrapper from "../PageWrapper";

type DebugPageProps = {
    forsendelseId: string;
    dokumentreferanse: string;
};
export default function DebugPage({ forsendelseId, dokumentreferanse }: DebugPageProps) {
    const [pdfDoc, setPdfDoc] = useState<PdfDocumentType>();
    async function openFile(ev: ChangeEvent<HTMLInputElement>) {
        const fileBuffer = await readFile(ev);
        setPdfDoc(new Blob([fileBuffer]));
    }

    async function readFile(ev: ChangeEvent<HTMLInputElement>) {
        const files = ev.target.files;
        if (files.length == 0) return;
        const file = ev.target.files[0];
        const fileBuffer = await file.arrayBuffer();
        return fileBuffer;
    }
    async function recoverAndReadFile(ev: ChangeEvent<HTMLInputElement>) {
        const fileBuffer = await readFile(ev);
        const pdfdoc = await PDFDocument.load(fileBuffer);
        let pagenumber = 0;
        const existingPages = pdfdoc.getPages();
        pdfdoc.context.enumerateIndirectObjects().forEach(([ref, obj]) => {
            if (obj instanceof PDFPageLeaf) {
                console.log(obj);
                if (!existingPages.some((ep) => ep.ref == ref)) {
                    console.log("Adding page to PDF", ref);
                    pdfdoc.catalog.insertLeafNode(ref, pagenumber);
                }
                pagenumber += 1;
            }
        });
        console.log("PDF has", pdfdoc.getPageCount(), "pages");
        const array = await pdfdoc.save();
        setPdfDoc(new Blob([array]));
    }
    if (!pdfDoc) {
        return (
            <>
                <label className="text-white" htmlFor="Gjenopprett">
                    Gjenopprett:
                </label>
                <input
                    type="file"
                    name="Gjenopprett"
                    accept="application/pdf,application/vnd.ms-excel"
                    onChange={recoverAndReadFile}
                />
                <label className="text-white" htmlFor="Åpne">
                    Åpne:
                </label>
                <input type="file" name="Åpne" accept="application/pdf,application/vnd.ms-excel" onChange={openFile} />
            </>
        );
    }

    return (
        <PageWrapper name={"dokumentredigering_debug"}>
            <DokumentMaskering
                documentFile={pdfDoc}
                forsendelseId={forsendelseId}
                dokumentreferanse={dokumentreferanse}
                isLoading={false}
            />
        </PageWrapper>
    );
}
