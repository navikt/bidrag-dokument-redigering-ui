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
    async function readFile(ev: ChangeEvent<HTMLInputElement>) {
        const files = ev.target.files;
        if (files.length == 0) return;
        const file = ev.target.files[0];
        const fileBuffer = await file.arrayBuffer();
        setPdfDoc(new Uint8Array(fileBuffer));
    }
    if (!pdfDoc) {
        return (
            <input type="file" name="upload" accept="application/pdf,application/vnd.ms-excel" onChange={readFile} />
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
