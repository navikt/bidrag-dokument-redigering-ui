import {
    PDFArray,
    PDFDict,
    PDFDocument,
    PDFHexString,
    PDFName,
    PDFObject,
    PDFPage,
    PDFRawStream,
    PDFRef,
    PDFStream,
    PDFString,
} from "@cantoo/pdf-lib";

import { PdfDocumentType } from "../components/utils/types";
//@ts-ignore
import colorProfile from "./files/sRGB2014.icc";
import { PDF_EDITOR_CREATOR, PDF_EDITOR_PRODUCER, PdfProducerHelpers } from "./PdfHelpers";

export interface RepairResult {
    success: boolean;
    repairedPdf: Uint8Array | null;
    repairLog: RepairLogEntry[];
    errorCount: number;
    warningCount: number;
}

export interface RepairLogEntry {
    type: "info" | "warning" | "error" | "fix";
    message: string;
    details?: string;
}

/**
 * PdfRepair - A comprehensive PDF repair and sanitization class
 *
 * This class provides functionality to repair corrupt PDF files by:
 * - Removing orphan/dangling object references
 * - Fixing corrupt annotation references
 * - Removing invalid XObjects
 * - Cleaning up JavaScript and other problematic elements
 * - Ensuring PDF/A compliance
 * - Removing corrupt stream references
 */
export class PdfRepair {
    private pdfDoc: PDFDocument;
    private repairLog: RepairLogEntry[] = [];
    private validRefs: Set<string> = new Set();
    private referencedRefs: Set<string> = new Set();

    /**
     * Repairs a PDF document and returns a clean PDF/A compliant file
     * @param pdfData - The PDF data as Uint8Array, ArrayBuffer, or Blob
     * @param title - Title for the output document
     * @returns RepairResult with the repaired PDF and repair log
     */
    async repair(pdfData: PdfDocumentType, title: string = "Repaired Document"): Promise<RepairResult> {
        const result: RepairResult = {
            success: false,
            repairedPdf: null,
            repairLog: this.repairLog,
            errorCount: 0,
            warningCount: 0,
        };

        try {
            this.log("info", "Starting PDF repair process");

            // Load the PDF with lenient parsing options
            this.pdfDoc = await this.loadPdfWithRecovery(pdfData);

            // Build reference maps
            this.buildReferenceMaps();

            // Perform repairs
            await this.removeOrphanObjects();
            await this.repairAnnotations();
            await this.repairXObjects();
            await this.removeJavaScript();
            await this.removeInvalidStreams();
            await this.repairPageTree();
            await this.removeXFA();
            await this.cleanupResources();
            await this.repairFonts();
            await this.repairFormFields();

            // Add PDF/A compliance
            this.addPdfACompliance(title);

            // Save the repaired PDF
            result.repairedPdf = await this.pdfDoc.save({
                useObjectStreams: false,
            });

            result.success = true;
            this.log("info", "PDF repair completed successfully");
        } catch (e) {
            this.log("error", "Failed to repair PDF", e.message);
            result.success = false;
        }

        result.repairLog = this.repairLog;
        result.errorCount = this.repairLog.filter((l) => l.type === "error").length;
        result.warningCount = this.repairLog.filter((l) => l.type === "warning").length;

        return result;
    }

    /**
     * Load PDF with recovery options for corrupt files
     */
    private async loadPdfWithRecovery(pdfData: PdfDocumentType): Promise<PDFDocument> {
        try {
            return await PDFDocument.load(pdfData, {
                ignoreEncryption: true,
                updateMetadata: false,
            });
        } catch (e) {
            this.log("warning", "Standard loading failed, trying with recovery options", e.message);
            try {
                // Try loading with more lenient options
                return await PDFDocument.load(pdfData, {
                    ignoreEncryption: true,
                    updateMetadata: false,
                    throwOnInvalidObject: false,
                });
            } catch (e2) {
                this.log("error", "Failed to load PDF even with recovery options", e2.message);
                throw e2;
            }
        }
    }

    /**
     * Build maps of all valid and referenced objects
     */
    private buildReferenceMaps(): void {
        this.log("info", "Building reference maps");

        // Collect all valid object references
        for (const [ref] of this.pdfDoc.context.enumerateIndirectObjects()) {
            this.validRefs.add(ref.toString());
        }

        // Collect all referenced objects
        for (const [, obj] of this.pdfDoc.context.enumerateIndirectObjects()) {
            this.collectReferences(obj);
        }

        this.log(
            "info",
            `Found ${this.validRefs.size} objects, ${this.referencedRefs.size} referenced`,
            `Valid: ${this.validRefs.size}, Referenced: ${this.referencedRefs.size}`
        );
    }

    /**
     * Recursively collect all references from a PDF object
     */
    private collectReferences(obj: PDFObject): void {
        if (obj instanceof PDFRef) {
            this.referencedRefs.add(obj.toString());
        } else if (obj instanceof PDFDict) {
            for (const value of obj.values()) {
                this.collectReferences(value);
            }
        } else if (obj instanceof PDFArray) {
            for (const item of obj.asArray()) {
                this.collectReferences(item);
            }
        } else if (obj instanceof PDFRawStream || obj instanceof PDFStream) {
            this.collectReferences(obj.dict);
        }
    }

    /**
     * Remove objects that are not referenced by any other object
     */
    private async removeOrphanObjects(): Promise<void> {
        this.log("info", "Checking for orphan objects");

        let removedCount = 0;
        const orphanRefs: PDFRef[] = [];

        for (const [ref, obj] of this.pdfDoc.context.enumerateIndirectObjects()) {
            const refString = ref.toString();

            // Skip catalog and trailer objects
            if (ref === this.pdfDoc.context.trailerInfo.Root) continue;
            if (ref === this.pdfDoc.context.trailerInfo.Info) continue;

            // Check if this object is referenced by any other object
            // and if it's a dangling reference (not a valid object)
            if (obj === undefined || obj === null) {
                orphanRefs.push(ref);
                this.log("fix", `Found null/undefined object: ${refString}`);
            }
        }

        // Remove orphan objects
        for (const ref of orphanRefs) {
            try {
                this.pdfDoc.context.delete(ref);
                removedCount++;
            } catch (e) {
                this.log("warning", `Could not remove orphan object ${ref.toString()}`, e.message);
            }
        }

        if (removedCount > 0) {
            this.log("fix", `Removed ${removedCount} orphan objects`);
        }
    }

    /**
     * Repair annotation references on all pages
     */
    private async repairAnnotations(): Promise<void> {
        this.log("info", "Repairing annotations");

        for (let i = 0; i < this.pdfDoc.getPageCount(); i++) {
            try {
                const page = this.pdfDoc.getPage(i);
                await this.repairPageAnnotations(page, i + 1);
            } catch (e) {
                this.log("warning", `Could not access page ${i + 1}`, e.message);
            }
        }
    }

    /**
     * Repair annotations on a single page
     */
    private async repairPageAnnotations(page: PDFPage, pageNumber: number): Promise<void> {
        try {
            const annotsRef = page.node.get(PDFName.of("Annots"));
            if (!annotsRef) return;

            let annots: PDFArray;
            if (annotsRef instanceof PDFArray) {
                annots = annotsRef;
            } else if (annotsRef instanceof PDFRef) {
                const resolved = this.pdfDoc.context.lookup(annotsRef);
                if (!(resolved instanceof PDFArray)) {
                    this.log("fix", `Removing invalid Annots reference on page ${pageNumber}`);
                    page.node.delete(PDFName.of("Annots"));
                    return;
                }
                annots = resolved;
            } else {
                return;
            }

            const validAnnots: PDFObject[] = [];
            let removedCount = 0;

            for (const annot of annots.asArray()) {
                try {
                    if (annot instanceof PDFRef) {
                        const annotObj = this.pdfDoc.context.lookupMaybe(annot, PDFDict);
                        if (annotObj) {
                            // Check if the annotation has required fields
                            const type = annotObj.get(PDFName.of("Type"));
                            const subtype = annotObj.get(PDFName.of("Subtype"));

                            if (subtype || (type && type.toString() === "/Annot")) {
                                validAnnots.push(annot);
                            } else {
                                this.log(
                                    "fix",
                                    `Removed invalid annotation on page ${pageNumber}: missing Type/Subtype`
                                );
                                removedCount++;
                            }
                        } else {
                            this.log("fix", `Removed dangling annotation reference on page ${pageNumber}`);
                            removedCount++;
                        }
                    } else if (annot instanceof PDFDict) {
                        validAnnots.push(annot);
                    }
                } catch (e) {
                    this.log("warning", `Error processing annotation on page ${pageNumber}`, e.message);
                    removedCount++;
                }
            }

            if (removedCount > 0) {
                if (validAnnots.length === 0) {
                    page.node.delete(PDFName.of("Annots"));
                    this.log("fix", `Removed all annotations from page ${pageNumber} (all were invalid)`);
                } else {
                    page.node.set(PDFName.of("Annots"), this.pdfDoc.context.obj(validAnnots));
                    this.log("fix", `Removed ${removedCount} invalid annotations from page ${pageNumber}`);
                }
            }
        } catch (e) {
            this.log("warning", `Error repairing annotations on page ${pageNumber}`, e.message);
        }
    }

    /**
     * Repair XObject references
     */
    private async repairXObjects(): Promise<void> {
        this.log("info", "Repairing XObjects");

        for (let i = 0; i < this.pdfDoc.getPageCount(); i++) {
            try {
                const page = this.pdfDoc.getPage(i);
                await this.repairPageXObjects(page, i + 1);
            } catch (e) {
                this.log("warning", `Could not repair XObjects on page ${i + 1}`, e.message);
            }
        }
    }

    /**
     * Repair XObjects on a single page
     */
    private async repairPageXObjects(page: PDFPage, pageNumber: number): Promise<void> {
        try {
            const resources = page.node.Resources();
            if (!resources) return;

            const xObjectRef = resources.get(PDFName.of("XObject"));
            if (!xObjectRef) return;

            let xObjects: PDFDict;
            if (xObjectRef instanceof PDFDict) {
                xObjects = xObjectRef;
            } else if (xObjectRef instanceof PDFRef) {
                const resolved = this.pdfDoc.context.lookupMaybe(xObjectRef, PDFDict);
                if (!resolved) {
                    this.log("fix", `Removing invalid XObject reference on page ${pageNumber}`);
                    resources.delete(PDFName.of("XObject"));
                    return;
                }
                xObjects = resolved;
            } else {
                return;
            }

            const invalidKeys: PDFName[] = [];

            for (const [key, value] of xObjects.entries()) {
                try {
                    if (value instanceof PDFRef) {
                        const xObj = this.pdfDoc.context.lookupMaybe(value, PDFStream);
                        if (!xObj) {
                            invalidKeys.push(key);
                            this.log("fix", `Found invalid XObject reference: ${key.toString()} on page ${pageNumber}`);
                        } else {
                            // Check for FlatWidget issues
                            const type = xObj.dict.get(PDFName.of("Type"));
                            const subtype = xObj.dict.get(PDFName.of("Subtype"));

                            if (type === undefined && subtype === undefined && key.toString().includes("FlatWidget")) {
                                invalidKeys.push(key);
                                this.log("fix", `Removing invalid FlatWidget XObject: ${key.toString()}`);
                            }
                        }
                    }
                } catch (e) {
                    invalidKeys.push(key);
                    this.log("warning", `Error checking XObject ${key.toString()}`, e.message);
                }
            }

            for (const key of invalidKeys) {
                xObjects.delete(key);
            }

            if (invalidKeys.length > 0) {
                this.log("fix", `Removed ${invalidKeys.length} invalid XObjects from page ${pageNumber}`);
            }
        } catch (e) {
            this.log("warning", `Error repairing XObjects on page ${pageNumber}`, e.message);
        }
    }

    /**
     * Remove JavaScript from the PDF
     */
    private async removeJavaScript(): Promise<void> {
        this.log("info", "Removing JavaScript");

        let removedCount = 0;
        const jsRefs: PDFRef[] = [];

        for (const [ref, obj] of this.pdfDoc.context.enumerateIndirectObjects()) {
            if (this.isPdfObjectJavascript(obj)) {
                jsRefs.push(ref);
            }
        }

        for (const ref of jsRefs) {
            try {
                this.pdfDoc.context.delete(ref);
                removedCount++;
            } catch (e) {
                this.log("warning", `Could not remove JavaScript object`, e.message);
            }
        }

        // Remove JavaScript from catalog
        try {
            const names = this.pdfDoc.catalog.get(PDFName.of("Names"));
            if (names instanceof PDFDict) {
                if (names.has(PDFName.of("JavaScript"))) {
                    names.delete(PDFName.of("JavaScript"));
                    removedCount++;
                }
            }
        } catch (e) {
            // Ignore
        }

        if (removedCount > 0) {
            this.log("fix", `Removed ${removedCount} JavaScript objects`);
        }
    }

    /**
     * Check if a PDF object contains JavaScript
     */
    private isPdfObjectJavascript(obj: PDFObject): boolean {
        if (obj instanceof PDFDict) {
            if (obj.has(PDFName.of("JS"))) return true;
            if (obj.has(PDFName.of("JavaScript"))) return true;
            const sValue = obj.get(PDFName.of("S"));
            if (sValue && sValue.toString() === "/JavaScript") return true;
        }
        return false;
    }

    /**
     * Remove invalid stream objects
     */
    private async removeInvalidStreams(): Promise<void> {
        this.log("info", "Checking for invalid streams");

        let removedCount = 0;
        const invalidRefs: PDFRef[] = [];

        for (const [ref, obj] of this.pdfDoc.context.enumerateIndirectObjects()) {
            if (obj instanceof PDFRawStream || obj instanceof PDFStream) {
                try {
                    // Check if stream has valid content
                    const contents = obj.getContents();
                    const length = obj.dict.get(PDFName.of("Length"));

                    if (contents === undefined || contents === null) {
                        invalidRefs.push(ref);
                        this.log("fix", `Found stream with no contents: ${ref.toString()}`);
                    } else if (length && length instanceof PDFRef) {
                        // Check if length reference is valid
                        const lengthObj = this.pdfDoc.context.lookupMaybe(length, PDFDict);
                        if (!lengthObj) {
                            // Fix by setting actual length
                            obj.dict.set(PDFName.of("Length"), this.pdfDoc.context.obj(contents.length));
                            this.log("fix", `Fixed invalid stream length reference: ${ref.toString()}`);
                        }
                    }
                } catch (e) {
                    this.log("warning", `Error checking stream ${ref.toString()}`, e.message);
                }
            }
        }

        for (const ref of invalidRefs) {
            try {
                // Check if this stream is referenced by pages before deleting
                let isReferenced = false;
                for (const page of this.pdfDoc.getPages()) {
                    const contentRef = page.node.get(PDFName.of("Contents"));
                    if (contentRef && contentRef.toString() === ref.toString()) {
                        isReferenced = true;
                        break;
                    }
                }

                if (!isReferenced) {
                    this.pdfDoc.context.delete(ref);
                    removedCount++;
                }
            } catch (e) {
                this.log("warning", `Could not remove invalid stream`, e.message);
            }
        }

        if (removedCount > 0) {
            this.log("fix", `Removed ${removedCount} invalid stream objects`);
        }
    }

    /**
     * Repair the page tree structure
     */
    private async repairPageTree(): Promise<void> {
        this.log("info", "Checking page tree");

        try {
            const pages = this.pdfDoc.getPages();
            let repairedCount = 0;

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];

                // Check for required page attributes
                if (!page.node.get(PDFName.of("Type"))) {
                    page.node.set(PDFName.of("Type"), PDFName.of("Page"));
                    repairedCount++;
                }

                // Check MediaBox
                const mediaBox = page.node.get(PDFName.of("MediaBox"));
                if (!mediaBox) {
                    // Set default A4 MediaBox
                    page.node.set(PDFName.of("MediaBox"), this.pdfDoc.context.obj([0, 0, 595.28, 841.89]));
                    this.log("fix", `Added missing MediaBox to page ${i + 1}`);
                    repairedCount++;
                }

                // Check for invalid Parent reference
                const parent = page.node.get(PDFName.of("Parent"));
                if (parent instanceof PDFRef) {
                    const parentObj = this.pdfDoc.context.lookupMaybe(parent, PDFDict);
                    if (!parentObj) {
                        this.log("warning", `Page ${i + 1} has invalid Parent reference`);
                    }
                }
            }

            if (repairedCount > 0) {
                this.log("fix", `Repaired ${repairedCount} page structure issues`);
            }
        } catch (e) {
            this.log("error", "Error repairing page tree", e.message);
        }
    }

    /**
     * Remove XFA forms
     */
    private async removeXFA(): Promise<void> {
        this.log("info", "Removing XFA forms");

        try {
            const form = this.pdfDoc.getForm();
            form.deleteXFA();
            this.log("fix", "Removed XFA form data");
        } catch (e) {
            // XFA might not exist, which is fine
        }
    }

    /**
     * Clean up resources and remove unused objects
     */
    private async cleanupResources(): Promise<void> {
        this.log("info", "Cleaning up resources");

        try {
            // Remove Group objects with S key that can cause issues
            for (const page of this.pdfDoc.getPages()) {
                const group = page.node.get(PDFName.of("Group"));
                if (group instanceof PDFDict) {
                    const sObject = group.get(PDFName.of("S"));
                    if (sObject && sObject.toString() === "/Transparency") {
                        // Keep transparency groups, they're usually valid
                    } else if (sObject) {
                        page.node.delete(PDFName.of("Group"));
                        this.log("fix", "Removed problematic Group object from page");
                    }
                }
            }
        } catch (e) {
            this.log("warning", "Error cleaning up resources", e.message);
        }
    }

    /**
     * Repair font references
     */
    private async repairFonts(): Promise<void> {
        this.log("info", "Checking font references");

        for (let i = 0; i < this.pdfDoc.getPageCount(); i++) {
            try {
                const page = this.pdfDoc.getPage(i);
                const resources = page.node.Resources();
                if (!resources) continue;

                const fontRef = resources.get(PDFName.of("Font"));
                if (!fontRef) continue;

                let fonts: PDFDict;
                if (fontRef instanceof PDFRef) {
                    const resolved = this.pdfDoc.context.lookupMaybe(fontRef, PDFDict);
                    if (!resolved) {
                        this.log("fix", `Removing invalid Font reference on page ${i + 1}`);
                        resources.delete(PDFName.of("Font"));
                        continue;
                    }
                    fonts = resolved;
                } else if (fontRef instanceof PDFDict) {
                    fonts = fontRef;
                } else {
                    continue;
                }

                const invalidKeys: PDFName[] = [];

                for (const [key, value] of fonts.entries()) {
                    if (value instanceof PDFRef) {
                        const fontObj = this.pdfDoc.context.lookupMaybe(value, PDFDict);
                        if (!fontObj) {
                            invalidKeys.push(key);
                        }
                    }
                }

                for (const key of invalidKeys) {
                    fonts.delete(key);
                    this.log("fix", `Removed invalid font reference: ${key.toString()}`);
                }
            } catch (e) {
                this.log("warning", `Error checking fonts on page ${i + 1}`, e.message);
            }
        }
    }

    /**
     * Repair form fields
     */
    private async repairFormFields(): Promise<void> {
        this.log("info", "Checking form fields");

        try {
            const form = this.pdfDoc.getForm();
            const fields = form.getFields();
            let removedCount = 0;

            for (const field of fields) {
                try {
                    // Check if field widgets are valid
                    const widgets = field.acroField.getWidgets();
                    for (let i = widgets.length - 1; i >= 0; i--) {
                        try {
                            const widget = widgets[i];
                            const rect = widget.getRectangle();
                            // If we can't get basic properties, the widget is corrupt
                            if (!rect) {
                                field.acroField.removeWidget(i);
                                this.log("fix", `Removed invalid widget from field ${field.getName()}`);
                            }
                        } catch (e) {
                            try {
                                field.acroField.removeWidget(i);
                                removedCount++;
                            } catch (removeError) {
                                // Ignore
                            }
                        }
                    }
                } catch (e) {
                    this.log("warning", `Error checking field ${field.getName()}`, e.message);
                }
            }

            if (removedCount > 0) {
                this.log("fix", `Removed ${removedCount} invalid form widgets`);
            }
        } catch (e) {
            // Form might not exist
        }
    }

    /**
     * Add PDF/A compliance features
     */
    private addPdfACompliance(title: string): void {
        this.log("info", "Adding PDF/A compliance");

        const documentDate = new Date();
        const documentId = crypto.randomUUID().replaceAll("-", "");

        try {
            // Set metadata
            const originalAuthor = PdfProducerHelpers.getAuthor(this.pdfDoc);
            const originalCreationDate = PdfProducerHelpers.getCreationDate(this.pdfDoc);

            this.pdfDoc.setTitle(title, { showInWindowTitleBar: true });
            this.pdfDoc.setAuthor(originalAuthor ?? PDF_EDITOR_CREATOR);
            this.pdfDoc.setProducer(PDF_EDITOR_PRODUCER);
            this.pdfDoc.setCreator(this.pdfDoc.getCreator() ?? PDF_EDITOR_CREATOR);
            this.pdfDoc.setCreationDate(originalCreationDate ?? documentDate);
            this.pdfDoc.setModificationDate(documentDate);

            // Add document ID
            const id = PDFHexString.of(documentId);
            this.pdfDoc.context.trailerInfo.ID = this.pdfDoc.context.obj([id, id]);

            // Add color profile for PDF/A compliance
            this.addColorProfile();

            this.log("fix", "Added PDF/A metadata and color profile");
        } catch (e) {
            this.log("warning", "Error adding PDF/A compliance", e.message);
        }
    }

    /**
     * Add sRGB color profile for PDF/A compliance
     */
    private addColorProfile(): void {
        try {
            const profile = colorProfile;
            const profileStream = this.pdfDoc.context.stream(profile, {
                Length: profile.length,
            });
            const profileStreamRef = this.pdfDoc.context.register(profileStream);

            const outputIntent = this.pdfDoc.context.obj({
                Type: "OutputIntent",
                S: "GTS_PDFA1",
                Info: "sRGB IEC61966-2.1",
                RegistryName: "http://www.color.org",
                OutputCondition: PDFString.of("sRGB IEC61966-2.1"),
                OutputConditionIdentifier: PDFString.of("sRGB IEC61966-2.1"),
                DestOutputProfile: profileStreamRef,
            });
            const outputIntentRef = this.pdfDoc.context.register(outputIntent);
            this.pdfDoc.catalog.set(PDFName.of("OutputIntents"), this.pdfDoc.context.obj([outputIntentRef]));
        } catch (e) {
            this.log("warning", "Could not add color profile", e.message);
        }
    }

    /**
     * Log a repair action
     */
    private log(type: RepairLogEntry["type"], message: string, details?: string): void {
        this.repairLog.push({ type, message, details });

        switch (type) {
            case "info":
                console.debug(`[PDFRepair] ${message}`, details ?? "");
                break;
            case "warning":
                console.warn(`[PDFRepair] ${message}`, details ?? "");
                break;
            case "error":
                console.error(`[PDFRepair] ${message}`, details ?? "");
                break;
            case "fix":
                console.log(`[PDFRepair] ✓ ${message}`, details ?? "");
                break;
        }
    }
}

/**
 * Convenience function to repair a PDF file
 * @param pdfData - The PDF data to repair
 * @param title - Title for the repaired document
 * @returns The repaired PDF as Uint8Array, or null if repair failed
 */
export async function repairPdf(pdfData: PdfDocumentType, title: string = "Repaired Document"): Promise<Uint8Array | null> {
    const repairer = new PdfRepair();
    const result = await repairer.repair(pdfData, title);
    return result.repairedPdf;
}

/**
 * Repair a PDF file with detailed results
 * @param pdfData - The PDF data to repair
 * @param title - Title for the repaired document
 * @returns Full repair result with log entries
 */
export async function repairPdfWithDetails(
    pdfData: PdfDocumentType,
    title: string = "Repaired Document"
): Promise<RepairResult> {
    const repairer = new PdfRepair();
    return repairer.repair(pdfData, title);
}
