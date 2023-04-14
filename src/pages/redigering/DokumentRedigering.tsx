import "./DokumentRedigering.less";

import { useDroppable } from "@dnd-kit/core";
import { Loader } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import { createPortal } from "react-dom";

import { useMaskingContainer } from "../../components/masking/MaskingContainer";
import MaskingItem from "../../components/masking/MaskingItem";
import { renderPageChildrenFn } from "../../components/pdfviewer/BasePdfViewer";
import PdfViewer from "../../components/pdfviewer/PdfViewer";
import PdfViewerContextProvider, { usePdfViewerContext } from "../../components/pdfviewer/PdfViewerContext";
import { PdfDocumentType } from "../../components/utils/types";
import EditorToolbar from "./components/EditorToolbar";
import { usePdfEditorContext } from "./components/PdfEditorContext";
import Sidebar from "./components/Sidebar";

interface DokumentRedigeringContainerProps {
    documentFile: PdfDocumentType;
}
export default function DokumentRedigering({ documentFile }: DokumentRedigeringContainerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const { hideSidebar } = usePdfEditorContext();

    return (
        <PdfViewerContextProvider
            documentFile={documentFile}
            onDocumentLoaded={(pagesCount) => {
                setIsLoading(false);
            }}
        >
            {isLoading && <Loader />}
            <div className={"editor"} style={{ visibility: isLoading ? "hidden" : "unset" }} onClick={hideSidebar}>
                <EditorToolbar />
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
    const { scale } = usePdfViewerContext();
    const { removedPages } = usePdfEditorContext();
    const { isOver, setNodeRef } = useDroppable({
        id,
    });
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

    function updatePageRef() {
        const pageElement = divRef.current?.querySelector(".page");
        if (pageElement.querySelector(".loadingIcon") == null) {
            setPageRef(pageElement);
        }
    }
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
