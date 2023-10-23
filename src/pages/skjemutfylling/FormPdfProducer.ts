import { FileUtils, LoggerService, SecureLoggerService } from "@navikt/bidrag-ui-common";
import { PDFCheckBox, PDFDocument, PDFField, PDFName } from "pdf-lib";
import { PDFFont } from "pdf-lib";
import { StandardFonts } from "pdf-lib/es";
import { PDFDocumentProxy } from "pdfjs-dist";

import { PdfDocumentType } from "../../components/utils/types";
import { PdfAConverter } from "../../pdf/PdfAConverter";
import { getFormValues } from "./FormHelper";
import { PageFormProps, SingleFormProps } from "./types";

type ProgressState = "MASK_PAGE" | "CONVERT_PAGE_TO_IMAGE" | "REMOVE_PAGE" | "SAVE_PDF";
export interface IProducerProgress {
    state: ProgressState;
    progress: number;
}

export class FormPdfProducer {
    private title: string;
    private pdfDocument: PDFDocument;
    private formDocument: PDFDocumentProxy;
    private pdfBlob: PdfDocumentType;
    private processedDocument: Uint8Array;

    private font: PDFFont;
    constructor(pdfBlob: PdfDocumentType) {
        this.pdfBlob = pdfBlob;
    }

    async init(formDocument: PDFDocumentProxy, title: string): Promise<FormPdfProducer> {
        let pdfBytes = this.pdfBlob;
        if (this.pdfBlob instanceof Blob) {
            pdfBytes = await this.pdfBlob.arrayBuffer();
        }
        this.pdfDocument = await PDFDocument.load(pdfBytes);
        this.font = await this.pdfDocument.embedFont(StandardFonts.TimesRoman);
        this.formDocument = formDocument;
        this.title = title;
        return this;
    }

    async process(): Promise<FormPdfProducer> {
        try {
            await this.fillForm();
            this.flattenForm();
        } catch (e) {
            console.error(e);
        }

        return this;
    }

    private async fillForm() {
        const formValues = await getFormValues(this.formDocument);
        for (const pageNumber of formValues.keys()) {
            const annotations = formValues.get(pageNumber);
            await this.fillFormForPage(pageNumber, annotations);
        }

        this.removeSubmitButton(formValues);
    }

    private removeSubmitButton(formValues: PageFormProps) {
        const form = this.pdfDocument.getForm();
        for (const [_, annotations] of formValues.entries()) {
            annotations.forEach((props) => {
                if (props.type == "Btn" && props.name == "nullstill") {
                    const field = form.getFieldMaybe(props.name);
                    form.removeField(field);
                }
            });
        }
    }
    private async fillFormForPage(pageNumber: number, formProps: SingleFormProps[]) {
        for (const formProp of formProps) {
            console.debug(
                `Processing annotation in page ${pageNumber} with name ${formProp.name} and type ${formProp.type} and value ${formProp?.value}`
            );
            this.fillFormField(formProp);
        }
    }

    private fillFormField(props: SingleFormProps) {
        const form = this.pdfDocument.getForm();
        try {
            if (typeof props.value == "string") {
                const field = form.getTextField(props.name);
                field.setText(props.value);
            } else {
                const field = form.getFieldMaybe(props.name);
                if (field instanceof PDFCheckBox && props.value) {
                    const widgets = field.acroField.getWidgets();
                    const widget = this.getWidget(field, props.exportValue, props.name);
                    form.markFieldAsDirty(field.ref);
                    const onValue = widget.getOnValue();
                    field.acroField.dict.set(PDFName.of("V"), onValue);
                    widget?.setAppearanceState(onValue);

                    for (const otherWidget of widgets) {
                        if (otherWidget.getOnValue() != onValue) {
                            otherWidget?.setAppearanceState(PDFName.of("Off"));
                        }
                    }
                }
            }
        } catch (e) {
            LoggerService.error(`Det skjedde en feil ved prosessering av skjemautfylling`, e);
            SecureLoggerService.error(
                `Det skjedde en feil ved prosessering av skjemautfylling: ${JSON.stringify(props)}`,
                e
            );
        }
    }

    private getWidget(field: PDFField, fieldWidgetName: string, fieldName?: string) {
        const widget = field.acroField
            .getWidgets()
            .find((w) => w.getOnValue()?.asString()?.substring(1)?.replaceAll("#20", " ") == fieldWidgetName);
        console.debug("WIDGET", fieldName, fieldWidgetName, widget, widget.getAppearances());
        return widget;
    }

    private flattenForm() {
        const form = this.pdfDocument.getForm();
        try {
            form.flatten();
        } catch (e) {
            LoggerService.error(
                "Det skjedde en feil ved 'flatning' av form felter i PDF. Prøver å sette felter read-only istedenfor",
                e
            );
            this.makeFieldsReadOnly();
        }
    }

    private makeFieldsReadOnly() {
        const form = this.pdfDocument.getForm();
        try {
            form.getFields().forEach((field) => {
                field.enableReadOnly();
            });
            form.flatten();
        } catch (e) {
            LoggerService.error("Det skjedde en feil ved markering av form felter som read-only PDF", e);
        }
    }

    async saveChanges(): Promise<FormPdfProducer> {
        this.processedDocument = await new PdfAConverter().convertAndSave(this.pdfDocument, this.title);
        return this;
    }

    getProcessedDocument(): Uint8Array {
        return this.processedDocument;
    }

    async openInNewTab() {
        await this.saveChanges();
        FileUtils.openFile(this.processedDocument, true);
        return this;
    }
}
