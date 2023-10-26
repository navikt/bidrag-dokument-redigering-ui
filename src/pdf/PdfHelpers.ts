import { LoggerService } from "@navikt/bidrag-ui-common"
import { PDFDocument } from "pdf-lib"

export function getCreationDate(pdfDoc: PDFDocument){
    try {
        return pdfDoc.getCreationDate()
    } catch(e){
        LoggerService.error(`Kunne ikke hente creation date for dokument ${this.title}`, e)
        return new Date()
    }
}

export function getModificationDate(pdfDoc: PDFDocument){
    try {
        return pdfDoc.getModificationDate()
    } catch(e){
        LoggerService.error(`Kunne ikke hente creation date for dokument ${this.title}`, e)
        return new Date()
    }
}