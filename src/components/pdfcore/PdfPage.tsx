import { AnnotationMode } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";
import { EventBus, PDFPageView } from "pdfjs-dist/web/pdf_viewer";
import React, { CSSProperties, useEffect, useRef, useState } from "react";

import { PdfDocumentContextProps, usePdfDocumentContext } from "./PdfDocumentContext";
export type PageRenderedFn = (containerElement: HTMLDivElement) => void;

interface PdfPageProps {
    pageRendered?: PageRenderedFn;
    pageDestroyed?: () => void;
    pageNumber: number;
    index: number;
    onPageClicked?: (pageNumber: number) => void;
    style?: CSSProperties;
}

const PdfPage = (props: PdfPageProps) => {
    const contextProps = usePdfDocumentContext();

    return <PdfPageMemo {...props} {...contextProps} />;
};

type PdfPageMemoProps = PdfPageProps & PdfDocumentContextProps;
const PdfPageMemo = React.memo(
    ({
        pdfDocument,
        renderPageIndexes,
        scale,
        pageDestroyed,
        renderText,
        pageNumber,
        pageRendered,
        style,
        index,
    }: PdfPageMemoProps) => {
        const [renderedPageNumber, setRenderedPageNumber] = useState(pageNumber);
        const divRef = useRef<HTMLDivElement>(null);
        const pdfPageViewRef = useRef<PDFPageView>();
        const isDrawed = useRef<boolean>(false);
        const isDrawing = useRef<boolean>(false);
        const isPageRenderStarted = useRef<boolean>(false);
        const eventBusRef = useRef<EventBus>();
        const renderTimeoutId = useRef<NodeJS.Timeout>();
        const renderQueue = useRef(false);

        useEffect(() => {
            if (hasPageNumberChanged()) {
                divRef.current?.querySelector(".page")?.remove();
            }
            if (pdfDocument && !isPageRenderStarted.current) {
                isPageRenderStarted.current = true;
                renderPage()
                    .then(() => pageRendered(pdfPageViewRef.current.div))
                    .then(() => drawOrDestroyPage(renderPageIndexes))
                    .catch(console.error);
            }

            setRenderedPageNumber(pageNumber);
        }, [pdfDocument, pageNumber]);

        useEffect(() => {
            drawOrDestroyPage(renderPageIndexes);
        }, [renderPageIndexes]);

        useEffect(() => {
            // console.log("HERER");
            if (pdfPageViewRef.current) {
                const scaleAdjusted = scale / pdfjsLib.PixelsPerInch.PDF_TO_CSS_UNITS;
                //console.log(divRef.current.querySelector("canvas"));
                // const ctx = divRef.current.querySelector("canvas") as HTMLCanvasElement;
                //console.log("RESCALE");
                pdfPageViewRef.current.update({ scale: scaleAdjusted, drawingDelay: 400 });
                // console.log(
                //     pdfPageViewRef.current.renderingState,
                //     RenderingStates.FINISHED,
                //     RenderingStates.RUNNING,
                //     RenderingStates.INITIAL
                // );
                // pdfPageViewRef.current.reset();
                // pdfPageViewRef.current.draw();
                if (renderTimeoutId.current == null) {
                    renderTimeoutId.current = setTimeout(() => {
                        redrawPage();
                        renderTimeoutId.current = null;
                    }, 100);
                }

                //ctx.transform(-5000, -50000);
                //ctx.save();
                // ctx.style.transform = "rotate(0deg) scale(1, 1) translate(-500px, -50)";
                // pdfPageViewRef.current.canvas.style.transform = "rotate(0deg) scale(1, 1) translate(-50, -50)";
            }
        }, [scale]);

        function hasPageNumberChanged() {
            return renderedPageNumber != pageNumber && pdfPageViewRef.current;
        }

        function redrawPage() {
            if (!shouldRenderPage(renderPageIndexes) || isDrawing.current) return;

            // pdfPageViewRef.current.div.prepend(pageCanvas.cloneNode(true));
            isDrawing.current = true;

            pdfPageViewRef.current.reset({
                keepAnnotationEditorLayer: true,
                keepAnnotationLayer: true,
                keepTextLayer: true,
                keepXfaLayer: true,
                keepZoomLayer: true,
            });
            pdfPageViewRef.current.draw().then(() => {
                isDrawing.current = false;
                // pageCanvas.remove();
            });
            // pdfPageViewRef.current.draw().then(() => {
            //     pageRendered();
            //     isDrawing.current = false;
            // });
            // const prevPageElement = pdfPageViewRef.current.div;
            // prevPageElement.style = { ...prevPageElement.style, zIndex: -1 };
            // renderPage()
            //     .then(() => pageRendered(pdfPageViewRef.current.div))
            //     .then(() => drawOrDestroyPage(renderPageIndexes))
            //     .catch(console.error)
            //     .finally(() => {
            //         isDrawing.current = false;
            //         prevPageElement.remove();
            //     });
        }

        function drawOrDestroyPage(renderPageIndexes: number[]) {
            if (pdfPageViewRef.current) {
                if (shouldRenderPage(renderPageIndexes) && !isDrawed.current) {
                    pdfPageViewRef.current?.draw().then(() => pageRendered(pdfPageViewRef.current.div));
                    // drawPage();
                    isDrawed.current = true;
                } else if (!shouldRenderPage(renderPageIndexes) && isDrawed.current) {
                    pageDestroyed?.();
                    setTimeout(() => {
                        pdfPageViewRef.current?.destroy();
                        // destroyPage();
                    }, 100);
                    isDrawed.current = false;
                }
            }
        }

        function shouldRenderPage(renderPageIndexes: number[]) {
            return renderPageIndexes.includes(index);
        }

        function renderPage() {
            isDrawed.current = false;
            return pdfDocument.getPage(pageNumber).then((page) => {
                eventBusRef.current = new EventBus();
                const scaleAdjusted = scale / pdfjsLib.PixelsPerInch.PDF_TO_CSS_UNITS;

                // @ts-ignore
                pdfPageViewRef.current = new PDFPageView({
                    container: divRef.current,
                    id: pageNumber,
                    scale: scaleAdjusted,
                    defaultViewport: page.getViewport({ scale: scaleAdjusted }),
                    eventBus: eventBusRef.current,
                    textLayerMode: 2,
                    useOnlyCssZoom: false,
                    annotationMode: AnnotationMode.ENABLE,
                });
                pdfPageViewRef.current.setPdfPage(page);
                return true;
            });
        }
        return <div data-index={index} style={style} className={"pagecontainer"} ref={divRef}></div>;
    },
    (prevProps, nextProps) =>
        !shouldRerenderPage(prevProps.renderPageIndexes, nextProps.renderPageIndexes, nextProps.index) &&
        prevProps.pdfDocument == nextProps.pdfDocument &&
        prevProps.scale == nextProps.scale &&
        nextProps.renderPageIndexes.includes(nextProps.index)
);

function shouldRerenderPage(prevRenderPageIndexes: number[], renderPageIndexes: number[], index: number) {
    const changedFromNotVisibleToVisible = !prevRenderPageIndexes.includes(index) && renderPageIndexes.includes(index);
    const changedFromVisibleToNotVisible = prevRenderPageIndexes.includes(index) && !renderPageIndexes.includes(index);
    return changedFromNotVisibleToVisible || changedFromVisibleToNotVisible;
}

export default PdfPage;
