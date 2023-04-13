import { DokumentDetaljer } from "../api/BidragDokumentForsendelseApi";
import { IMaskingItemProps } from "../components/masking/MaskingItem";

export interface EditDocumentInitialMetadata {
    editorMetadata?: EditDocumentMetadata;
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
