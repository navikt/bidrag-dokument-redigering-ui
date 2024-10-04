import {
    PDFArray,
    PDFBool,
    PDFCatalog,
    PDFDict,
    PDFDocument,
    PDFFont,
    PDFHexString,
    PDFInvalidObject,
    PDFName,
    PDFNumber,
    PDFObject,
    PDFPage,
    PDFPageLeaf,
    PDFPageTree,
    PDFRawStream,
    PDFRef,
    PDFStream,
    PDFString,
    StandardFonts,
} from "@cantoo/pdf-lib";
import { LoggerService } from "@navikt/bidrag-ui-common";
export const PDF_EDITOR_PRODUCER = "bidrag-dokument-redigering-ui";
export const PDF_EDITOR_CREATOR = "NAV - Arbeids- og velferdsetaten";

export class PdfProducerHelpers {
    static getCreationDate(pdfDoc: PDFDocument): Date | undefined {
        try {
            return pdfDoc.getCreationDate();
        } catch (e) {
            LoggerService.error(`Kunne ikke hente creation date for dokument`, e);
            return new Date();
        }
    }

    static getModificationDate(pdfDoc: PDFDocument): Date | undefined {
        try {
            return pdfDoc.getModificationDate();
        } catch (e) {
            LoggerService.error(`Kunne ikke hente modification date for dokument`, e);
            return new Date();
        }
    }

    static getCreator(pdfDoc: PDFDocument): string | undefined {
        try {
            return pdfDoc.getCreator();
        } catch (e) {
            LoggerService.error(`Kunne ikke hente creator for dokument`, e);
            return PDF_EDITOR_CREATOR;
        }
    }

    static getProducer(pdfDoc: PDFDocument): string | undefined {
        try {
            return pdfDoc.getProducer();
        } catch (e) {
            LoggerService.error(`Kunne ikke hente producer for dokument`, e);
            return PDF_EDITOR_PRODUCER;
        }
    }

    static getAuthor(pdfDoc: PDFDocument): string | undefined {
        try {
            return pdfDoc.getAuthor();
        } catch (e) {
            LoggerService.error(`Kunne ikke hente author for dokument`, e);
            return;
        }
    }

    static getSubject(pdfDoc: PDFDocument): string | undefined {
        try {
            return pdfDoc.getSubject();
        } catch (e) {
            LoggerService.error(`Kunne ikke hente subject for dokument`, e);
            return;
        }
    }

    static getTitle(pdfDoc: PDFDocument): string | undefined {
        try {
            return pdfDoc.getTitle();
        } catch (e) {
            LoggerService.error(`Kunne ikke hente title for dokument`, e);
            return;
        }
    }
}
export function hasInvalidXObject(pdfdoc: PDFDocument) {
    try {
        return pdfdoc.getPages().some((page, index) => {
            // page.node.context.enumerateIndirectObjects().forEach((indirectObject) => {
            //     const ref = indirectObject[0];
            //     const obj = indirectObject[1];
            //     // console.log(ref.toString(), obj.toString());
            //     if (obj instanceof PDFRawStream) {
            //         console.log(obj.getContentsString());
            //     }
            // });
            return pageHasInvalidXObject(page, pdfdoc, index + 1);
        });
    } catch (e) {
        LoggerService.error("Det skjdde en feil ved sjekk for ugyldig xObject", e);
        return false;
    }
}

export function deleteGroupobjectWithSKey(pdfdoc: PDFDocument) {
    pdfdoc.getPages().some((page, index) => {
        const group = page.node.get(PDFName.of("Group"));
        if (group != null && group instanceof PDFDict) {
            const sObject = group.get(PDFName.of("S"));
            if (sObject != null) {
                LoggerService.info(`Delete Group S object from PDF for page ${index + 1} ${group.toString()}`);
                page.node.delete(PDFName.of("Group"));
            }
        }
    });
}

function pageHasInvalidXObject(page: PDFPage, pdfdoc: PDFDocument, pageNumber: number) {
    const xObject = page.node.Resources().get(PDFName.of("XObject"));
    if (xObject && xObject instanceof PDFDict) {
        const xMap = xObject.asMap();
        return Array.from(xMap.keys()).some((key) => {
            const stream = pdfdoc.context.lookupMaybe(xMap.get(key), PDFStream);
            const type = stream.dict.get(PDFName.of("Type"));
            if (type == undefined && key.toString().includes("FlatWidget")) {
                // console.log(page.node.context, stream.getContentsString(), stream.toString(), stream.getContents());
                console.debug(`Side ${pageNumber} har ugyldig XObject fra PDF ${key}`, {
                    name: "PDFError",
                    message: `Side ${pageNumber} har ugyldig XObject fra PDF ${key}`,
                    stack: `Side ${pageNumber} har ugyldig XObject fra PDF ${key} - ${stream.getContentsString()} - ${stream.dict?.toString()}`,
                });
                return true;
            }
        });
    } else {
        console.debug(
            `pageHasInvalidXObject: XObject is not PDFDict --  type ${getObjectType(
                xObject
            )} -- ref -- ${xObject?.toString()} -- resources -- ${page.node?.Resources()?.toString()}
            `
        );
    }
    return false;
}

function getObjectType(pdfObject: PDFObject): string {
    if (pdfObject instanceof PDFDict) {
        return "PDFDict";
    } else if (pdfObject instanceof PDFRawStream) {
        return "PDFRawStream";
    } else if (pdfObject instanceof PDFArray) {
        return "PDFArray";
    } else if (pdfObject instanceof PDFString) {
        return "PDFString";
    } else if (pdfObject instanceof PDFBool) {
        return "PDFBool";
    } else if (pdfObject instanceof PDFHexString) {
        return "PDFHexString";
    } else if (pdfObject instanceof PDFInvalidObject) {
        return "PDFInvalidObject";
    } else if (pdfObject instanceof PDFName) {
        return "PDFName";
    } else if (pdfObject instanceof PDFNumber) {
        return "PDFNumber";
    } else if (pdfObject instanceof PDFRef) {
        return "PDFRef";
    } else if (pdfObject instanceof PDFStream) {
        return "PDFStream";
    }
    return "Ukjent";
}

export async function flattenForm(pdfDoc: PDFDocument, onError: () => void, ignoreError: boolean) {
    try {
        const form = pdfDoc.getForm();
        form.flatten();
        if (hasInvalidXObject(pdfDoc) && !ignoreError) {
            LoggerService.warn(`Dokument er korrupt etter flatning av form felter. Ruller tilbake endringer`);
            await onError();
        }
    } catch (e) {
        if (ignoreError) {
            LoggerService.error(
                "Det skjedde en feil ved 'flatning' av form felter i PDF. Gjør om feltene read-only fordi det er noen sider som er maskert",
                e
            );
            flattenFormV2(pdfDoc);
            makeFieldsReadOnly(pdfDoc);
        } else {
            try {
                flattenFormV2(pdfDoc);
            } catch (error) {
                LoggerService.error(
                    "Det skjedde en feil ved 'flatning' av form felter i PDF. Laster PDF på nytt uten å flatne form for å unngå korrupt PDF",
                    e
                );
                await onError();
            }
        }
    }
}

export async function repairPDF(pdfDoc: PDFDocument, debug: boolean = false) {
    try {
        await removeUnlinkedAnnots(pdfDoc);
        if (debug) {
            debugRepairPDF(pdfDoc);
            pdfDoc.getPages().forEach((page, index) => {
                console.debug("Page number", index, page.node.toString(), page.node.Resources());
            });
        }
    } catch (e) {
        LoggerService.error("Det skjedde en feil ved reparasjon av PDF", e);
    }
}

async function debugRepairPDF(pdfDoc: PDFDocument) {
    try {
        pdfDoc.getPages().forEach((page, index) => {
            console.log("Page number", index, page.node.toString(), page.node.Resources());
            pageHasInvalidXObject(page, pdfDoc, index + 1);
            const group = page.node.get(PDFName.of("Group"));
            if (group != null && group instanceof PDFDict) {
                const sObject = group.get(PDFName.of("S"));
                console.log("Group S object", group.toString(), sObject, sObject.toString());
            }
        });

        //console.log(pdfdoc.getForm().acroForm.getAllFields());
        pdfDoc
            .getForm()
            .acroForm.getAllFields()
            .forEach((field) => console.log(field[1].toString(), field));
    } catch (e) {
        console.debug("Det skjedde en feil i debugRepairPDF funksjonen", e);
    }
}

export async function fixMissingPages(pdfDoc: PDFDocument) {
    try {
        pdfDoc.getPages();
    } catch (e) {
        console.error("Kunne hente sider for PDF. Prøver å fikse", e);
        // const rootRef = this.context.trailerInfo.Root;
        // console.log(this.context.trailerInfo.Root);

        // for (const [ref, obj] of this.context.enumerateIndirectObjects()) {
        //     if (obj instanceof PDFPageTree) {
        //         console.log("YES", obj.asMap(), PDFCatalog.withContextAndPages(this.context, obj));
        //         console.log(ref.toString(), obj.toString(), obj);
        //     }
        //     if (obj instanceof PDFCatalog) {
        //         console.log("CATALOG", obj.toString(), obj);
        //     }
        //     if (ref == rootRef) {
        //         console.log("ROOT", obj.toString(), obj);
        //     }
        // }

        try {
            // const pdfDoc = this;
            let pdfPageTree;
            let pdfPageLeaf;
            for (const [ref, obj] of pdfDoc.context.enumerateIndirectObjects()) {
                if (obj instanceof PDFPageTree) {
                    pdfPageTree = obj;
                }
                if (obj instanceof PDFFont) {
                    console.log("FONT", obj);
                }
                if (
                    ref == pdfDoc.context.trailerInfo.Root &&
                    !(obj instanceof PDFCatalog) &&
                    obj instanceof PDFPageLeaf
                ) {
                    pdfPageLeaf = obj;
                    console.log("REF er ikke catalog", obj.toString(), obj);
                }
            }

            if (pdfPageTree) {
                const map = pdfPageLeaf ? pdfPageLeaf.asMap() : new Map();
                map.set(PDFName.of("Pages"), pdfPageTree);
                map.set(PDFName.of("Type"), PDFName.of("Catalog"));
                const catalog = PDFCatalog.fromMapWithContext(map, pdfDoc.context);
                console.debug("Fant PDFCatalog", catalog);
                //@ts-ignore
                pdfDoc.catalog = catalog;
                pdfDoc.context.trailerInfo.Root = catalog;
            }

            console.log("$$$$LOGPAGES$$$");
            pdfDoc.getPages().forEach((page, index) => {
                console.log("Page number", index, page.node.toString(), page.node.Resources());
                const fontRef = page.node.Resources().get(PDFName.of("Font"));
                if (fontRef) {
                    const font = pdfDoc.context.lookupMaybe(fontRef, PDFDict);
                    font.asMap().forEach((value, key) => {
                        console.log("Font key", key.toString(), value.toString());
                        console.log("Font ref", pdfDoc.context.getObjectRef(value));
                    });
                    console.log("Font", font.toString(), fontRef.toString());
                    page.node.Resources().set(PDFName.of("Font"), font);
                }
            });
            console.log("$$$$LOGPAGES_END$$$");

            await pdfDoc.embedFont(StandardFonts.Courier);
            await pdfDoc.embedFont(StandardFonts.Symbol);
            await pdfDoc.embedFont(StandardFonts.Helvetica);
        } catch (e) {
            console.error("Kunne ikke fikse manglende catalog pages", e);
        }
    }
}

async function removeUnlinkedAnnots(pdfdoc: PDFDocument) {
    for (const page of pdfdoc.getPages()) {
        console.debug("Starting to remove unlinked annots from page", page);
        try {
            const annots = page.node.get(PDFName.of("Annots")) as PDFArray;
            if (annots == undefined) continue;
            for (const annot of annots.asArray()) {
                try {
                    const annotDict = pdfdoc.context.lookupMaybe(annot, PDFDict);
                    console.debug("Found annotation dictionary", annotDict);
                    if (annotDict == undefined) {
                        LoggerService.warn("Fjerner annotasjon som ikke har noe kilde fra side: " + annot.toString());
                        // page.node.removeAnnot(annotRef);
                        page.node.delete(PDFName.of("Annots"));
                    }
                } catch (e) {
                    console.error("Kunne ikke fjerne annotasjon", e);
                    LoggerService.warn("Kunne ikke fjerne annotasjon", e);
                }
            }
        } catch (e) {
            console.error("Det skjedde en feil ved fjerning ulinket annoteringer", e);
        }
    }
}

export function flattenFormV2(pdfDoc: PDFDocument) {
    const form = pdfDoc.getForm();
    const formFields = form.getFields();

    for (const field of formFields) {
        try {
            while (field.acroField.getWidgets().length) {
                try {
                    field.acroField.removeWidget(0);
                } catch (e) {
                    console.warn("Kunne ikke fjerne widget", e);
                }
            }
            form.removeField(field);
        } catch (e) {
            // Ignorer feil
            console.warn("Kunne ikke fjerne alle felter", e);
        }
    }
    try {
        form.flatten();
    } catch (e) {
        if (e.message.includes("Tried to remove inexistent field")) {
            LoggerService.error("Ignorer feil ved fjerning av form felter som ikke eksisterer i PDF.", e);
            return;
        }
        throw e;
    }
}

export function makeFieldsReadOnly(pdfDoc: PDFDocument) {
    const form = pdfDoc.getForm();
    try {
        form.getFields().forEach((field) => {
            form.removeField(field);
        });
        form.flatten();
    } catch (e) {
        LoggerService.error("Det skjedde en feil ved markering av form felter som read-only PDF", e);
    }
}
//
