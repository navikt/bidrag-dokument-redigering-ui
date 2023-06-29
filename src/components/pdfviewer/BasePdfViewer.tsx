import React, { MutableRefObject, ReactNode, useEffect, useRef } from "react";
import { ReactZoomPanPinchRef, TransformWrapper } from "react-zoom-pan-pinch";

import { PdfDocumentRef } from "../pdfcore/PdfDocument";
import PdfDocumentZoom from "../pdfcore/PdfDocumentZoom";
import PdfPage4 from "../pdfcore/PdfPage4";
import { ScrollDirection } from "../pdfcore/PdfUtils";
import { usePdfViewerContext } from "./PdfViewerContext";

export type emptyFn = () => void;
export type renderPageChildrenFn = (emptyFn1, emptyFn2) => ReactNode;
export type renderPageFn = (pageNumber: number, children: renderPageChildrenFn) => ReactNode;
interface BasePdfRendererProps {
    scale?: number;
    pages?: number[];
    baseDocumentRef: MutableRefObject<PdfDocumentRef>;
    onPageChange?: (pageNumber: number, previousPageNumber: number) => void;
    onDocumentLoaded?: (pagesCount: number, pages: number[], IncreaseScaleFn, DecreaseScaleFn) => void;
    renderPage?: renderPageFn;
    onScroll?: (currentPageNumber: number, scrollDirection: ScrollDirection) => void;
}
export default function BasePdfViewer({
    baseDocumentRef,
    onScroll,
    scale,
    onDocumentLoaded,
    renderPage,
    onPageChange,
}: BasePdfRendererProps) {
    const {
        pages,
        file,
        zoom: { onZoomChange },
    } = usePdfViewerContext();
    const documentRef = useRef<PdfDocumentRef>(null);
    const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);
    useEffect(() => {
        window.addEventListener("wheel", handleMouseWheelEvent, {
            passive: false,
        });
        return () => window?.removeEventListener("wheel", handleMouseWheelEvent);
    }, []);

    // useEffect(() => {
    //     window.addEventListener("scroll", handleScrollWheelEvent, {
    //         passive: false,
    //     });
    //     return () => window?.removeEventListener("scroll", handleScrollWheelEvent);
    // }, []);

    function handleScrollWheelEvent(evt) {
        const keyboardEvent = new KeyboardEvent("keydown", { key: "Control" });
        console.log("On panning start", keyboardEvent.key, evt);
        if (evt.ctrlKey) {
            console.log("On panning start", keyboardEvent.key, evt);
            transformComponentRef.current.instance.setKeyPressed(keyboardEvent);
        } else {
            transformComponentRef.current.instance.setKeyUnPressed(keyboardEvent);
        }
    }

    function handleMouseWheelEvent(evt) {
        const keyboardEvent = new KeyboardEvent("keydown", { key: "Control" });
        console.log("On panning start", keyboardEvent.key, evt);
        if (evt.ctrlKey) {
            evt.preventDefault();
            console.log("On panning start", keyboardEvent.key, evt);
            transformComponentRef.current.instance.setKeyPressed(keyboardEvent);
        } else {
            transformComponentRef.current.instance.setKeyUnPressed(keyboardEvent);
        }
    }
    return (
        <TransformWrapper
            initialScale={scale}
            minScale={1}
            centerZoomedOut
            centerOnInit
            initialPositionX={0}
            initialPositionY={0}
            ref={transformComponentRef}
            wheel={{
                step: 0.5,
                activationKeys: ["Control"],
            }}
            panning={{
                activationKeys: ["Shift"],
            }}
            onZoomStart={(props) => {
                onZoomChange(props.state.scale);
            }}
            onZoom={(props) => {
                document
                    .getElementById("container_pdf_document_pages")
                    ?.style.setProperty("--scale-factor", props.state.scale.toString());
            }}
            onTransformed={(props) => {
                onZoomChange(props.state.scale);
                const keyboardEvent = new KeyboardEvent("keydown", { key: "Control" });
                transformComponentRef.current.instance.setKeyUnPressed(keyboardEvent);
            }}
        >
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <PdfDocumentZoom
                    id={"pdf_document_pages"}
                    file={file}
                    documentRef={documentRef}
                    scale={scale}
                    overscanCount={10}
                    renderText={false}
                    onPageChange={onPageChange}
                    onScroll={onScroll}
                    onDocumentLoaded={(pagesCount: number, pages: number[]) => {
                        baseDocumentRef.current = documentRef.current;
                        onDocumentLoaded(
                            pagesCount,
                            pages,
                            () => {
                                zoomIn();
                            },
                            zoomOut
                        );
                    }}
                >
                    {pages.map((pageNumber, index) => {
                        const pageToRender = (onPageRendered?: emptyFn, onPageDestroyed?: emptyFn): ReactNode => (
                            <PdfPage4
                                pageNumber={pageNumber}
                                index={index}
                                key={"doc_page_index_" + index}
                                pageRendered={onPageRendered}
                                pageDestroyed={onPageDestroyed}
                            />
                        );

                        return renderPage ? renderPage(pageNumber, pageToRender) : pageToRender();
                    })}
                </PdfDocumentZoom>
            )}
        </TransformWrapper>
    );
}
