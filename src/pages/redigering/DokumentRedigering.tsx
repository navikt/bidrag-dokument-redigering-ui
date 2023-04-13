import "./DokumentRedigering.less";

import { useDroppable } from "@dnd-kit/core";
import { FileUtils } from "@navikt/bidrag-ui-common";
import { EditorConfigStorage } from "@navikt/bidrag-ui-common";
import { queryParams } from "@navikt/bidrag-ui-common";
import { Loader } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import { createPortal } from "react-dom";

import { useMaskingContainer } from "../../components/masking/MaskingContainer";
import MaskingItem from "../../components/masking/MaskingItem";
import { renderPageChildrenFn } from "../../components/pdfviewer/BasePdfViewer";
import PdfViewer from "../../components/pdfviewer/PdfViewer";
import PdfViewerContextProvider from "../../components/pdfviewer/PdfViewerContext";
import { PdfDocumentType } from "../../components/utils/types";
import { PdfProducer } from "../../pdf/PdfProducer";
import { EditDocumentInitialMetadata, EditDocumentMetadata } from "../../types/EditorTypes";
import EditorToolbar from "./components/EditorToolbar";
import { PdfEditorContext } from "./components/PdfEditorContext";
import { usePdfEditorContext } from "./components/PdfEditorContext";
import Sidebar from "./components/Sidebar";

interface DokumentRedigeringContainerProps {
    forsendelseId?: string;
    dokumentreferanse?: string;
    documentMetadata?: EditDocumentInitialMetadata;
    documentFile: PdfDocumentType;
    onSave: (config: EditDocumentMetadata, document?: Uint8Array) => void;
    onSubmit?: (document: Uint8Array, config: EditDocumentMetadata) => void;
}
export default function DokumentRedigering({
    dokumentreferanse,
    forsendelseId,
    documentFile,
    onSave,
    onSubmit,
    documentMetadata,
}: DokumentRedigeringContainerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const { items } = useMaskingContainer();
    const [scale, setScale] = useState(1.4);
    const [sidebarHidden, setSidebarHidden] = useState(true);
    const [pagesCount, setPagesCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [removedPages, setRemovedPages] = useState<number[]>([]);

    useEffect(loadInitalConfig, []);
    async function finishPdf(): Promise<void> {
        const { documentFile, config } = await getProcessedPdf();
        onSubmit(documentFile, config);
    }

    async function getProcessedPdf(): Promise<{ documentFile: Uint8Array; config: EditDocumentMetadata }> {
        let existingPdfBytes = documentFile;
        if (typeof documentFile == "string") {
            existingPdfBytes = await fetch(documentFile).then((res) => res.arrayBuffer());
        }

        const config = {
            removedPages: removedPages,
            items: items,
        };
        return await new PdfProducer(existingPdfBytes)
            .init(config)
            .then((p) => p.process())
            .then((p) => p.saveChanges())
            .then((p) => ({
                documentFile: p.getProcessedDocument(),
                config,
            }));
    }

    async function previewPdf(): Promise<void> {
        const { documentFile } = await getProcessedPdf();
        FileUtils.openFile(documentFile);
    }
    async function savePdf(): Promise<void> {
        const { documentFile, config } = await getProcessedPdf();
        onSave(config, documentFile);
    }

    function loadInitalConfig() {
        const config = documentMetadata ?? EditorConfigStorage.get(queryParams().id);
        if (config) {
            setRemovedPages(config.editorMetadata?.removedPages ?? []);
            // initMasking(config.editorMetadata.items ?? []);
        }
    }

    function onZoomIn() {
        setScale((prev) => prev + 0.2);
    }

    function onZoomOut() {
        setScale((prev) => Math.max(0, prev - 0.2));
    }

    function resetZoom() {
        setScale(1.4);
    }

    function onToggleSidebar() {
        setSidebarHidden((prev) => !prev);
    }

    function toggleDeletedPage(pageNumber: number) {
        setRemovedPages((prev) => {
            if (prev.includes(pageNumber)) {
                return prev.filter((p) => p !== pageNumber);
            } else {
                return [...prev, pageNumber];
            }
        });
    }

    const editedPagesCount = pagesCount - removedPages.length;
    return (
        <PdfEditorContext.Provider
            value={{
                forsendelseId,
                dokumentreferanse,
                removedPages,
                previewPdf,
                onToggleSidebar,
                pagesCount,
                currentPage,
                toggleDeletedPage,
                savePdf,
                finishPdf,
            }}
        >
            <PdfViewerContextProvider
                documentFile={documentFile}
                onDocumentLoaded={(pagesCount) => {
                    setIsLoading(false);
                    setPagesCount(pagesCount);
                }}
                onPageChange={setCurrentPage}
            >
                {isLoading && <Loader />}
                <div
                    className={"editor"}
                    style={{ visibility: isLoading ? "hidden" : "unset" }}
                    onClick={() => {
                        setSidebarHidden(true);
                    }}
                >
                    <EditorToolbar
                        documentMetadata={documentMetadata}
                        onToggleSidebar={onToggleSidebar}
                        resetZoom={resetZoom}
                        onZoomOut={onZoomOut}
                        onZoomIn={onZoomIn}
                        pagesCount={editedPagesCount}
                        scale={scale}
                        showSubmitButton={onSubmit != undefined}
                    />
                    <div className={"pdfviewer"} style={{ display: "flex", flexDirection: "row" }}>
                        <Sidebar
                            onDocumentLoaded={() => {
                                setIsLoading(false);
                            }}
                            documentDetails={documentMetadata?.documentDetails ?? []}
                            hidden={sidebarHidden}
                        />
                        <PdfViewer
                            scale={scale}
                            onScaleUpdated={setScale}
                            renderPage={(pageNumber, children) => (
                                <PageDecorator
                                    pageNumber={pageNumber}
                                    renderPageFn={children}
                                    scale={scale}
                                    isLoading={isLoading}
                                />
                            )}
                        />
                    </div>
                </div>
            </PdfViewerContextProvider>
        </PdfEditorContext.Provider>
    );
}

interface IPageDecoratorProps {
    pageNumber: number;
    scale: number;
    isLoading: boolean;
    renderPageFn: renderPageChildrenFn;
}
function PageDecorator({ renderPageFn, pageNumber, scale }: IPageDecoratorProps) {
    const id = `droppable_page_${pageNumber}`;
    const divRef = useRef<HTMLDivElement>(null);
    const [pageRef, setPageRef] = useState<Element>(null);
    const { removedPages } = usePdfEditorContext();
    const { isOver, setNodeRef } = useDroppable({
        id,
    });
    const { items } = useMaskingContainer();
    const [height, setHeight] = useState<number>(1000);
    const getPageHeight = () => {
        const element = document.getElementById(id)?.getElementsByClassName("pagecontainer");
        if (element && element.length > 0) {
            return element.item(0).clientHeight;
        }
        return 0;
    };

    const isDeleted = removedPages.includes(pageNumber);
    const style = {
        color: isOver ? "green" : undefined,
        width: "min-content",
        maxHeight: `${height}px`,
        margin: "0 auto",
    };

    useEffect(() => {
        setHeight(getPageHeight());
    });

    return (
        <div
            id={id}
            ref={(ref) => {
                setNodeRef(ref);
                divRef.current = ref;
            }}
            className={`page_decorator ${isDeleted ? "deleted" : ""}`}
            style={style}
        >
            {renderPageFn(() => {
                setPageRef(divRef.current?.querySelector(".page"));
            })}
            <MaskinItemPortal scale={scale} id={id} pageRef={pageRef} />
        </div>
    );
}

interface IMaskinItemPortalProps {
    pageRef: Element;
    scale: number;
    id: string;
}
const MaskinItemPortal = React.memo(({ pageRef, scale, id }: IMaskinItemPortalProps) => {
    const { items } = useMaskingContainer();

    if (!pageRef) return null;
    return createPortal(
        <>
            {items
                .filter((item) => item.parentId == id)
                .map((item) => (
                    <MaskingItem {...item} scale={scale} />
                ))}
        </>,
        pageRef,
        id + "_masking"
    );
});
