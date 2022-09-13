import "./DokumentRedigering.less";

import { EditorConfigStorage, queryParams } from "@navikt/bidrag-ui-common";
import { Loader } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { useState } from "react";
import { PropsWithChildren } from "react";

import { PdfDocumentType } from "../../components/pdfview/types";
import PdfViewer from "../../components/pdfviewer/PdfViewer";
import EditorToolbar from "./components/EditorToolbar";
import { PdfEditorContext, usePdfEditorContext } from "./components/PdfEditorContext";
import ThumbnailPageDecorator from "./components/ThumbnailPageDecorator";
import { PdfProducer } from "./pdfproducer/PdfProducer";

interface DokumentRedigeringContainerProps {
    document: PdfDocumentType;
}
export default function DokumentRedigeringContainer({ document }: DokumentRedigeringContainerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [scale, setScale] = useState(1);
    const [thumbnailsHidden, setThumbnailsHidden] = useState(false);
    const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
    const [pagesCount, setPagesCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pages, setPages] = useState<number[]>([]);
    const [removedPages, setRemovedPages] = useState<number[]>([]);

    useEffect(loadInitalConfig, []);

    async function producePdfAndCloseWindow(): Promise<void> {
        let existingPdfBytes = document;
        if (typeof document == "string") {
            existingPdfBytes = await fetch(document).then((res) => res.arrayBuffer());
        }

        return await new PdfProducer(existingPdfBytes)
            .init({
                removedPages: removedPages,
            })
            .then((p) => p.process())
            .then((p) => p.saveChanges())
            .then((p) => p.broadcast())
            .then(window.close);
    }

    function loadInitalConfig() {
        const config = EditorConfigStorage.get(queryParams().id);
        if (config) {
            setRemovedPages(config.removedPages);
        }
    }

    function onZoomIn() {
        setScale((prev) => prev + 0.2);
    }

    function onZoomOut() {
        setScale((prev) => Math.max(0, prev - 0.2));
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

    return (
        <PdfEditorContext.Provider
            value={{
                removedPages,
                producePdf: producePdfAndCloseWindow,
                toggleDeletedPage,
                isDraggingThumbnail,
                pages,
                setIsDraggingThumbnail,
            }}
        >
            {isLoading && <Loader />}
            <div className={"editor"} style={{ visibility: isLoading ? "hidden" : "unset" }}>
                <EditorToolbar
                    onToggleSidebar={onToggleSidebar}
                    onZoomOut={onZoomOut}
                    onZoomIn={onZoomIn}
                    currentPage={currentPage}
                    pagesCount={pagesCount - removedPages.length}
                />
                <PdfViewer
                    thumbnailsHidden={thumbnailsHidden}
                    onDocumentLoaded={(pagesCount, pages) => {
                        setIsLoading(false);
                        setPages(pages);
                        setPagesCount(pagesCount);
                    }}
                    pages={pages}
                    scale={scale}
                    file={document}
                    onPageChange={setCurrentPage}
                    showThumbnails
                    renderPage={(pageNumber, children) => <PageDecorator pageNumber={pageNumber} children={children} />}
                    renderThumbnailPage={(pageNumber, children) => (
                        <ThumbnailPageDecorator isLoading={isLoading} pageNumber={pageNumber} children={children} />
                    )}
                />
            </div>
        </PdfEditorContext.Provider>
    );
}

function PageDecorator({ children, pageNumber }: PropsWithChildren<{ pageNumber: number }>) {
    const { removedPages } = usePdfEditorContext();
    const isDeleted = removedPages.includes(pageNumber);
    return <div className={`page_decorator ${isDeleted ? "deleted" : ""}`}>{children}</div>;
}
