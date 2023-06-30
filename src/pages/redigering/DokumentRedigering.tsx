import "./DokumentRedigering.less";

import { useDroppable } from "@dnd-kit/core";
import { Loader } from "@navikt/ds-react";
import React, { CSSProperties, PropsWithChildren, useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import { ReactZoomPanPinchRef, TransformWrapper } from "react-zoom-pan-pinch";

import KeyboardShortcuts from "../../components/KeyboardShortcuts";
import { useMaskingContainer } from "../../components/masking/MaskingContainer";
import MaskingItem from "../../components/masking/MaskingItem";
import PdfPage from "../../components/pdfcore/PdfPage";
import PdfViewer from "../../components/pdfviewer/PdfViewer";
import PdfViewerContextProvider, { usePdfViewerContext } from "../../components/pdfviewer/PdfViewerContext";
import DomUtils from "../../components/utils/DomUtils";
import { PdfDocumentType } from "../../components/utils/types";
import RedigeringInfoKnapp from "../../docs/RedigeringInfoKnapp";
import { usePdfEditorContext } from "./components/PdfEditorContext";
import Sidebar from "./components/sidebar/Sidebar";
import EditorToolbar from "./components/toolbar/EditorToolbar";
import PopoverToolbar from "./components/toolbar/PopoverToolbar";

interface DokumentRedigeringContainerProps {
    documentFile: PdfDocumentType;
}
export default function DokumentRedigering({ documentFile }: DokumentRedigeringContainerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const { hideSidebar } = usePdfEditorContext();
    const [pages, setPages] = useState([]);
    const { isOver, setNodeRef } = useDroppable({
        id: "document_editor",
    });
    const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);
    useEffect(() => {
        window.addEventListener("wheel", handleMouseWheelEvent, {
            passive: false,
        });
        return () => window?.removeEventListener("wheel", handleMouseWheelEvent);
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScrollWheelEvent, {
            passive: false,
        });
        return () => window?.removeEventListener("scroll", handleScrollWheelEvent);
    }, []);

    function handleScrollWheelEvent(evt) {
        const keyboardEvent = new KeyboardEvent("keydown", { key: "Control" });
        if (evt.ctrlKey) {
            transformComponentRef.current.instance.setKeyPressed(keyboardEvent);
        } else {
            transformComponentRef.current.instance.setKeyUnPressed(keyboardEvent);
        }
    }

    function handleMouseWheelEvent(evt) {
        const keyboardEvent = new KeyboardEvent("keydown", { key: "Control" });
        if (evt.ctrlKey) {
            evt.preventDefault();
            transformComponentRef.current.instance.setKeyPressed(keyboardEvent);
        } else {
            transformComponentRef.current.instance.setKeyUnPressed(keyboardEvent);
        }
    }

    return (
        <TransformWrapper
            initialScale={1}
            minScale={1}
            centerZoomedOut
            centerOnInit
            disablePadding
            ref={transformComponentRef}
            wheel={{
                step: 0.5,
                activationKeys: ["Control"],
            }}
            panning={{
                activationKeys: ["Shift", " "],
            }}
            onTransformed={(props) => {
                document
                    .getElementById("container_pdf_document_pages")
                    ?.style.setProperty("--scale-factor", props.state.scale.toString());
                const keyboardEvent = new KeyboardEvent("keydown", { key: "Control" });
                transformComponentRef.current.instance.setKeyUnPressed(keyboardEvent);
            }}
        >
            <PdfViewerContextProvider
                documentFile={documentFile}
                onDocumentLoaded={(pagesCount, pages) => {
                    setPages(pages);
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
                    {/* <FloatingToolbar /> */}
                    <KeyboardShortcuts />
                    <PopoverToolbar />
                    <RedigeringInfoKnapp />
                    <div className={"pdfviewer"} style={{ display: "flex", flexDirection: "row" }}>
                        <Sidebar
                            onDocumentLoaded={() => {
                                setIsLoading(false);
                            }}
                        />
                        <PdfViewer>
                            {pages.map((pageNumber) => (
                                <PageDecorator
                                    pageNumber={pageNumber}
                                    isLoading={isLoading}
                                    key={"page_decorator_" + pageNumber}
                                />
                            ))}
                        </PdfViewer>
                    </div>
                </div>
            </PdfViewerContextProvider>
        </TransformWrapper>
    );
}

interface IPageDecoratorProps {
    pageNumber: number;
    isLoading: boolean;
}
function PageDecorator({ children, pageNumber }: PropsWithChildren<IPageDecoratorProps>) {
    const id = `droppable_page_${pageNumber}`;
    const divRef = useRef<HTMLDivElement>(null);
    const pageRef = useRef<HTMLDivElement>();
    const { isAddNewElementMode, addItem } = useMaskingContainer();
    const { scale } = usePdfViewerContext();
    const { removedPages } = usePdfEditorContext();
    const { isOver, setNodeRef } = useDroppable({
        id,
    });

    const isDeleted = removedPages.includes(pageNumber);
    const style: CSSProperties = {
        color: isOver ? "green" : undefined,
        width: "min-content",
        margin: "0 auto",
        cursor: isAddNewElementMode ? "crosshair" : "default",
    };

    function onClick(e: React.MouseEvent) {
        const { x, y } = DomUtils.getMousePosition(id, e);
        addItem(pageNumber, scale, x / scale, y / scale - divRef.current.clientHeight);
        return;
    }

    const index = pageNumber - 1;

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
            <PdfPage pageRef={pageRef} pageNumber={pageNumber} index={index} key={"doc_page_index_" + index}>
                <MaskinItemPortal scale={scale} id={id} />
            </PdfPage>
        </div>
    );
}

interface IMaskinItemPortalProps {
    scale: number;
    id: string;
}
const MaskinItemPortal = React.memo(({ scale, id }: IMaskinItemPortalProps) => {
    const { items } = useMaskingContainer();

    return (
        <>
            {items
                .filter((item) => item.parentId == id)
                .map((item, index) => (
                    <MaskingItem {...item} scale={scale} key={"page_" + id + "_index" + index} />
                ))}
        </>
    );
});
