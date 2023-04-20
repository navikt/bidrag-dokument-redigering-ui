import "./DokumentRedigering.less";

import { useDroppable } from "@dnd-kit/core";
import { Loader } from "@navikt/ds-react";
import React, { CSSProperties } from "react";
import { useState } from "react";
import { useRef } from "react";
import { createPortal } from "react-dom";

import { useMaskingContainer } from "../../components/masking/MaskingContainer";
import MaskingItem from "../../components/masking/MaskingItem";
import { renderPageChildrenFn } from "../../components/pdfviewer/BasePdfViewer";
import PdfViewer from "../../components/pdfviewer/PdfViewer";
import PdfViewerContextProvider, { usePdfViewerContext } from "../../components/pdfviewer/PdfViewerContext";
import DomUtils from "../../components/utils/DomUtils";
import { PdfDocumentType } from "../../components/utils/types";
import { usePdfEditorContext } from "./components/PdfEditorContext";
import Sidebar from "./components/sidebar/Sidebar";
import EditorToolbar from "./components/toolbar/EditorToolbar";
import FloatingToolbar from "./components/toolbar/FloatingToolbar";

interface DokumentRedigeringContainerProps {
    documentFile: PdfDocumentType;
}
export default function DokumentRedigering({ documentFile }: DokumentRedigeringContainerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const { hideSidebar } = usePdfEditorContext();
    const { isOver, setNodeRef } = useDroppable({
        id: "document_editor",
    });
    return (
        <PdfViewerContextProvider
            documentFile={documentFile}
            onDocumentLoaded={(pagesCount) => {
                setIsLoading(false);
            }}
        >
            {isLoading && <Loader />}
            <div
                className={"editor"}
                style={{ visibility: isLoading ? "hidden" : "unset" }}
                onClick={hideSidebar}
                ref={setNodeRef}
            >
                <EditorToolbar />
                <FloatingToolbar />
                <div className={"pdfviewer"} style={{ display: "flex", flexDirection: "row" }}>
                    <Sidebar
                        onDocumentLoaded={() => {
                            setIsLoading(false);
                        }}
                    />
                    <PdfViewer
                        renderPage={(pageNumber, children) => (
                            <PageDecorator
                                pageNumber={pageNumber}
                                renderPageFn={children}
                                isLoading={isLoading}
                                key={"page_decorator_" + pageNumber}
                            />
                        )}
                    />
                </div>
            </div>
        </PdfViewerContextProvider>
    );
}

interface IPageDecoratorProps {
    pageNumber: number;
    isLoading: boolean;
    renderPageFn: renderPageChildrenFn;
}
function PageDecorator({ renderPageFn, pageNumber }: IPageDecoratorProps) {
    const id = `droppable_page_${pageNumber}`;
    const divRef = useRef<HTMLDivElement>(null);
    const [pageRef, setPageRef] = useState<Element>(null);
    const { isAddNewElementMode, addItem } = useMaskingContainer();
    const { scale } = usePdfViewerContext();
    const { removedPages } = usePdfEditorContext();
    const { isOver, setNodeRef } = useDroppable({
        id,
    });
    const getPageHeight = () => {
        const element = document.getElementById(id)?.getElementsByClassName("pagecontainer");
        if (element && element.length > 0) {
            return element.item(0).clientHeight;
        }
        return 1000;
    };

    const isDeleted = removedPages.includes(pageNumber);
    const style: CSSProperties = {
        color: isOver ? "green" : undefined,
        width: "min-content",
        maxHeight: `${getPageHeight()}px`,
        margin: "0 auto",
        cursor: isAddNewElementMode ? "crosshair" : "default",
    };

    function updatePageRef() {
        const pageElement = divRef.current?.querySelector(".page");
        if (pageElement.querySelector(".loadingIcon") == null) {
            setPageRef(pageElement);
        }
    }

    function onClick(e: React.MouseEvent) {
        const { x, y } = DomUtils.getMousePosition(id, e);
        addItem(pageNumber, scale, x, y - divRef.current.clientHeight);
    }
    return (
        <div
            id={id}
            onMouseDown={isAddNewElementMode ? onClick : null}
            ref={(ref) => {
                setNodeRef(ref);
                divRef.current = ref;
            }}
            className={`page_decorator ${isDeleted ? "deleted" : ""}`}
            style={style}
        >
            {renderPageFn(
                () => updatePageRef(),
                () => setPageRef(null)
            )}
            <MaskinItemPortal scale={scale} id={id} pageRef={pageRef} pageNumber={pageNumber} />
        </div>
    );
}

interface IMaskinItemPortalProps {
    pageRef: Element;
    scale: number;
    pageNumber: number;
    id: string;
}
const MaskinItemPortal = React.memo(({ pageRef, scale, id, pageNumber }: IMaskinItemPortalProps) => {
    const { items } = useMaskingContainer();

    if (!pageRef) return null;
    return createPortal(
        <>
            {items
                .filter((item) => item.parentId == id)
                .map((item, index) => (
                    <MaskingItem {...item} scale={scale} key={"page_" + id + "_index" + index} />
                ))}
        </>,
        pageRef,
        id + "-" + pageNumber
    );
});