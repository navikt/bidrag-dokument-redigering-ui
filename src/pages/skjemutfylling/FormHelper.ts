import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

import { createArrayWithLength } from "../../components/utils/ObjectUtils";
import { PageFormProps, SingleFormProps } from "./types";
export async function getFormValues(formDocument: PDFDocumentProxy): Promise<PageFormProps> {
    if (!formDocument) return new Map();
    const numpages = formDocument.numPages;
    const formValuesMap: PageFormProps = new Map<number, SingleFormProps[]>();
    for (const pageIndex of createArrayWithLength(numpages)) {
        const page = await formDocument.getPage(pageIndex + 1);
        const annotations = await page.getAnnotations();
        const result = await getFormValuesForPage(page, annotations);
        formValuesMap.set(pageIndex + 1, result);
    }
    console.log(formValuesMap);
    return formValuesMap;
}
async function getFormValuesForPage(domPage: PDFPageProxy, annotations: any[]) {
    const formValues = [];
    for (const annotation of annotations) {
        const result = await getAnnotationValue(annotation);
        console.debug(
            `Processing annotation in page ${domPage.pageNumber} with name ${annotation.fieldName} and type ${annotation.fieldType} and value ${result?.value}`
        );
        result && formValues.push(result);
    }
    return formValues;
}

function getAnnotationValue(annotation: any): SingleFormProps | null {
    const type = annotation.fieldType;
    const name = annotation.fieldName;
    const exportValue = annotation.exportValue;
    // console.log(name, annotation)
    const element = document.querySelector(`[data-element-id="${annotation.id}"]`) as HTMLInputElement;
    if (!element) return;
    const defaultValues = { type, name, exportValue, id: annotation.id };
    switch (type) {
        case "Tx":
            return { value: element.value, ...defaultValues };
        case "Btn":
            return { value: element.checked as boolean, ...defaultValues };
    }
    return null;
}

export function setAnnotationValue(annotation: SingleFormProps): SingleFormProps | null {
    console.log(annotation);
    // console.log(name, annotation)
    const element = document.querySelector(`[data-element-id="${annotation.id}"]`) as HTMLInputElement;
    if (!element) return;
    switch (annotation.type) {
        case "Tx":
            element.value = annotation.value as string;
            break;
        case "Btn":
            element.checked = annotation.value as boolean;
    }
}
