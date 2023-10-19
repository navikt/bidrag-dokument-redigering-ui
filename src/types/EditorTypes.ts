import { DokumentDetaljer } from "../api/BidragDokumentForsendelseApi";
import { IMaskingItemProps } from "../components/masking/MaskingItem";

export interface IDocumentMetadata<T> {
    editorMetadata?: T;
    state: "EDITABLE" | "LOCKED";
    forsendelseState: "EDITABLE" | "LOCKED";
    title: string;
    documentDetails: DocumentDetails[];
}

export type DocumentDetails = DokumentDetaljer;

export interface EditDocumentMetadata {
    items: IMaskingItemProps[];
    removedPages: number[];
}

export type ClosingWindow = boolean;
