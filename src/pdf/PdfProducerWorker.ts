// @ts-ignore
import * as pdfjsLib from "pdfjs-dist";
import { PDFWorker } from "pdfjs-dist";

import { PdfDocumentType } from "../components/utils/types";
import { EditDocumentMetadata } from "../types/EditorTypes";
import { PdfProducer } from "./PdfProducer";
interface WorkerMessage {
    config: EditDocumentMetadata;
    existingPdfBytes: PdfDocumentType;
    pdfWorkerPort: SharedWorker;
}

console.log("asdasd", pdfjsLib.GlobalWorkerOptions.workerSrc);
self.onmessage = (message: MessageEvent<WorkerMessage>) => {
    console.log("IN worker", message.data);
    const { config, existingPdfBytes, pdfWorkerPort } = message.data;

    console.log(existingPdfBytes, pdfWorkerPort);
    const port = pdfWorkerPort.port;
    const worker = PDFWorker.fromPort({ port: pdfWorkerPort });
    //@ts-ignore
    pdfjsLib.GlobalWorkerOptions.workerPort = worker;
    new PdfProducer(existingPdfBytes)
        .init(config, () => null)
        .then((p) => p.process())
        .then((p) => p.saveChanges())
        .then((p) => ({
            documentFile: p.getProcessedDocument(),
            config,
        }))
        .then((data) => self.postMessage(data));
};
