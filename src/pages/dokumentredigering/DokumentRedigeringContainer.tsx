import "./DokumentRedigering.less";

import { Loader } from "@navikt/ds-react";
import React from "react";
import { useState } from "react";
import { PropsWithChildren } from "react";

import { PdfDocumentType } from "../../components/pdfview/types";
import PdfViewer from "../../components/pdfviewer/PdfViewer";
import EditorToolbar from "./components/EditorToolbar";
import { PdfEditorContext, usePdfEditorContext } from "./components/PdfEditorContext";
import ThumbnailPageDecorator from "./components/ThumbnailPageDecorator";

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
    const [deletedPages, setDeletePages] = useState<number[]>([]);

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
        setDeletePages((prev) => {
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
                deletedPages,
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
                    document={document}
                    onZoomOut={onZoomOut}
                    onZoomIn={onZoomIn}
                    currentPage={currentPage}
                    pagesCount={pagesCount}
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
    const { deletedPages } = usePdfEditorContext();
    const isDeleted = deletedPages.includes(pageNumber);
    return <div className={`page_decorator ${isDeleted ? "deleted" : ""}`}>{children}</div>;
}
