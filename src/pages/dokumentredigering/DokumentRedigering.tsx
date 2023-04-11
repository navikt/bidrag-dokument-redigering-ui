import "./DokumentRedigering.less";

import { useDroppable } from "@dnd-kit/core";
import { EditDocumentConfig } from "@navikt/bidrag-ui-common";
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
import PdfUtils from "../../components/pdfcore/PdfUtils";
import { PdfDocumentType } from "../../components/pdfview/types";
import { renderPageChildrenFn } from "../../components/pdfviewer/BasePdfViewer";
import PdfViewer from "../../components/pdfviewer/PdfViewer";
import { PdfProducer } from "../../pdf/PdfProducer";
import EditorToolbar from "./components/EditorToolbar";
import { PdfEditorContext } from "./components/PdfEditorContext";
import { usePdfEditorContext } from "./components/PdfEditorContext";
import ThumbnailPageDecorator from "./components/ThumbnailPageDecorator";

interface DokumentRedigeringContainerProps {
    defaultConfig?: EditDocumentConfig;
    dokument: PdfDocumentType;
    onSave: (config: EditDocumentConfig, document?: Uint8Array) => void;
    onSubmit?: (document: Uint8Array, config: EditDocumentConfig) => void;
}
export default function DokumentRedigering({
    dokument,
    onSave,
    onSubmit,
    defaultConfig,
}: DokumentRedigeringContainerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const { items, init: initMasking } = useMaskingContainer();
    const [scale, setScale] = useState(1.4);
    const [thumbnailsHidden, setThumbnailsHidden] = useState(false);
    const [pagesCount, setPagesCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [removedPages, setRemovedPages] = useState<number[]>([]);

    useEffect(loadInitalConfig, []);
    async function finishPdf(): Promise<void> {
        const { dokument, config } = await getProcessedPdf();
        onSubmit(dokument, config);
    }

    function listener(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            const mousePosition = { x: e.pageX, y: e.pageY };
            // console.log("MOUSE POST", mousePosition);
            const wheelDelta = e.wheelDelta;
            const containerElement = PdfUtils.getPdfContainerElement();
            const scrollY = containerElement.scrollTop;
            const scrollX = containerElement.scrollLeft;
            const rect = containerElement.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const delta = e.deltaY;
            const newZoom = scale + delta * 0.001;
            const newScale = newZoom / scale;
            const newScrollX = mouseX * newScale - mouseX;
            const newScrollY = mouseY * newScale - mouseY;
            console.log(
                "scrollY",
                newScrollY,
                "scrollX",
                newScrollX,
                "delta",
                mouseX,
                mouseY,
                newZoom,
                newZoom / scale,
                scale
            );

            // setScale(newScale);
            // containerElement.scrollLeft += newScrollX;
            // containerElement.scrollTop += newScrollY;
        }
    }
    useEffect(() => {
        PdfUtils.getPdfContainerElement().addEventListener("wheel", listener, {
            capture: true,
            passive: false,
        });
        return () => PdfUtils.getPdfContainerElement().removeEventListener("wheel", listener);
    }, [scale]);

    async function getProcessedPdf(): Promise<{ dokument: Uint8Array; config: EditDocumentConfig }> {
        let existingPdfBytes = dokument;
        if (typeof dokument == "string") {
            existingPdfBytes = await fetch(dokument).then((res) => res.arrayBuffer());
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
                dokument: p.getProcessedDocument(),
                config,
            }));
    }

    async function previewPdf(): Promise<void> {
        const { dokument, config } = await getProcessedPdf();
        FileUtils.openFile(dokument);
    }
    async function savePdf(): Promise<void> {
        const { dokument, config } = await getProcessedPdf();
        onSave(config, dokument);
    }

    function loadInitalConfig() {
        const config = defaultConfig ?? EditorConfigStorage.get(queryParams().id);
        if (config) {
            setRemovedPages(config.removedPages ?? []);
            // @ts-ignore
            initMasking(config.items ?? []);
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
        setThumbnailsHidden((prev) => !prev);
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
            {isLoading && <Loader />}
            <div
                className={"editor"}
                style={{ visibility: isLoading ? "hidden" : "unset" }}
                onClick={() => {
                    setThumbnailsHidden(true);
                }}
            >
                <EditorToolbar
                    onToggleSidebar={onToggleSidebar}
                    resetZoom={resetZoom}
                    onZoomOut={onZoomOut}
                    onZoomIn={onZoomIn}
                    pagesCount={editedPagesCount}
                    scale={scale}
                    showSubmitButton={onSubmit != undefined}
                />
                <PdfViewer
                    thumbnailsHidden={thumbnailsHidden}
                    onDocumentLoaded={(pagesCount) => {
                        setIsLoading(false);
                        setPagesCount(pagesCount);
                    }}
                    scale={scale}
                    file={dokument}
                    onPageChange={setCurrentPage}
                    showThumbnails
                    renderPage={(pageNumber, children) => (
                        <PageDecorator
                            pageNumber={pageNumber}
                            renderPageFn={children}
                            scale={scale}
                            isLoading={isLoading}
                        />
                    )}
                    renderThumbnailPage={(pageNumber, children) => (
                        <ThumbnailPageDecorator isLoading={isLoading} pageNumber={pageNumber} renderPageFn={children} />
                    )}
                />
            </div>
        </PdfEditorContext.Provider>
    );
}

interface IPageDecoratorProps {
    pageNumber: number;
    scale: number;
    isLoading: boolean;
    renderPageFn: renderPageChildrenFn;
}
function PageDecorator({ renderPageFn, pageNumber, scale, isLoading }: IPageDecoratorProps) {
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

    console.log(
        "ITEMST",
        items.filter((item) => item.parentId == id),
        pageRef
    );
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
