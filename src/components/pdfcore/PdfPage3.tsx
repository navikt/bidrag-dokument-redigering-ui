import * as pdfjsLib from "pdfjs-dist";
import { RenderTask } from "pdfjs-dist";
import { PDFPageProxy } from "pdfjs-dist/types/web/pdf_viewer";
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

const PdfPage3 = (props: PdfPageProps) => {
    const contextProps = usePdfDocumentContext();

    return <PdfPageMemo {...props} {...contextProps} />;
};

type PdfPageMemoProps = PdfPageProps & PdfDocumentContextProps;
const PdfPageMemo = React.memo(
    ({
        pdfDocument,
        renderPageIndexes,
        scale,
        onPageLoaded,
        renderText,
        pageNumber,
        pageRendered,
        style,
        index,
    }: PdfPageMemoProps) => {
        const [renderedPageNumber, setRenderedPageNumber] = useState(pageNumber);
        const [pageObject, setPageObject] = useState<PDFPageProxy>();
        const divRef = useRef<HTMLDivElement>(null);
        const isDrawed = useRef<boolean>(false);
        const isPageRenderStarted = useRef<boolean>(false);

        useEffect(() => {
            if (hasPageNumberChanged()) {
                divRef.current?.querySelector(".page")?.remove();
            }
            if (pdfDocument && !isPageRenderStarted.current) {
                isPageRenderStarted.current = true;
                renderPage().catch(console.error);
            }

            setRenderedPageNumber(pageNumber);
        }, [pdfDocument, pageNumber]);

        function hasPageNumberChanged() {
            return renderedPageNumber != pageNumber && isDrawed.current;
        }

        function shouldRenderPage(renderPageIndexes: number[]) {
            return renderPageIndexes.includes(index);
        }

        function renderPage() {
            isDrawed.current = false;
            return pdfDocument.getPage(pageNumber).then((page) => {
                setPageObject(page);
                onPageLoaded(pageNumber, page);
            });
        }

        function getStyle() {
            if (pageObject == null) return {};
            const scaleAdjusted = scale / pdfjsLib.PixelsPerInch.PDF_TO_CSS_UNITS;
            const { pageWidth, pageHeight } = pageObject.getViewport().rawDims as any;
            // return {
            //     width: viewPort.width,
            //     height: viewPort.height,
            // };

            return {
                width: `calc(var(--scale-factor) * ${pageWidth}px)`,
                height: `calc(var(--scale-factor) * ${pageHeight}px)`,
            };
        }

        return (
            <div
                data-index={index}
                style={{
                    ...style,
                    ...getStyle(),
                }}
                className={"pagecontainer page"}
                ref={divRef}
                data-page-number={pageNumber}
            >
                {shouldRenderPage(renderPageIndexes) && (
                    <PDFCanvas
                        pdfPage={pageObject}
                        scale={scale}
                        pageNumber={pageNumber}
                        onRender={() => pageRendered(divRef.current)}
                    />
                )}
            </div>
        );
    },
    (prevProps, nextProps) =>
        !shouldRerenderPage(prevProps.renderPageIndexes, nextProps.renderPageIndexes, nextProps.index) &&
        prevProps.pdfDocument == nextProps.pdfDocument &&
        prevProps.scale == nextProps.scale &&
        nextProps.renderPageIndexes.includes(nextProps.index)
);

interface PDFCanvasProps {
    pdfPage: PDFPageProxy;
    pageNumber: number;
    scale: number;
    onRender: () => void;
}
function PDFCanvas({ pdfPage, scale, pageNumber, onRender }: PDFCanvasProps) {
    const [renderedScale, setRenderedScale] = useState(scale);
    const pageRenderTask = useRef<RenderTask>();
    const pageRenderNextScale = useRef<number>();
    const timeoutId = useRef<NodeJS.Timeout>();
    const canvasRef = useRef<HTMLDivElement>();
    useEffect(() => {
        drawPage(scale);
    }, [pdfPage]);

    useEffect(() => {
        // scalePage(scale);

        pageRenderNextScale.current = scale;
        if (timeoutId.current !== null) {
            clearTimeout(timeoutId.current);
        }
        timeoutId.current = setTimeout(() => {
            drawPage(pageRenderNextScale.current);
            if (timeoutId.current !== null) {
                clearTimeout(timeoutId.current);
                timeoutId.current = null;
            }
        }, 1000);
    }, [scale]);

    // function scalePage(scale: number) {
    //     if (pdfPage == null) return null;
    //     const canvas = canvasRef.current.querySelector("canvas") as HTMLCanvasElement;
    //     // const oldViewPort = pdfPage.getViewport({ scale: renderedScale });
    //     // const viewport = pdfPage.getViewport({ scale: scale });
    //     // const diffX = -oldViewPort.offsetX + viewport.offsetX;
    //     // const diffY = -oldViewPort.offsetY + viewport.offsetY;
    //     // canvas.style.transform = `translate(${diffX}px, ${diffY}px)`;
    //     // canvas.style.height = `${viewport.height}px`;
    //     // canvas.style.width = `${viewport.width}px`;
    //     PdfJsUtils.cssTransformPageCanvas(canvas, pdfPage, renderedScale, scale);
    // }
    function drawPage(scale: number) {
        if (pdfPage == null) return;
        if (pageRenderTask.current != null) {
            pageRenderNextScale.current = scale;
            return;
        }
        const scaleAdjusted = scale / pdfjsLib.PixelsPerInch.PDF_TO_CSS_UNITS;
        const viewport = pdfPage.getViewport({ scale: scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };
        pageRenderTask.current = pdfPage.render(renderContext);
        return pageRenderTask.current.promise
            .then(() => {
                canvasRef.current.querySelector("canvas").replaceWith(canvas);
                onRender();
                // canvasWrapper.prepend(canvas);
                // prevCanvas && canvasWrapper.removeChild(prevCanvas);
            })
            .catch((e) => {
                console.debug("RENDERING CANCELLED", pageNumber, e);
            })
            .finally(() => {
                pageRenderTask.current = null;
                if (pageRenderNextScale.current !== null && pageRenderNextScale.current != scale) {
                    drawPage(pageRenderNextScale.current);
                    pageRenderNextScale.current = null;
                }
                setRenderedScale(scale);
            });
    }
    return (
        <div
            className="canvasWrapper"
            ref={canvasRef}
            style={{
                width: "100%",
                height: "100%",
                zIndex: 1,
                overflow: "hidden",
                position: "absolute",
            }}
        >
            <canvas style={{ transform: "rotate(0deg) scale(1, 1)" }} />
        </div>
    );
}

function shouldRerenderPage(prevRenderPageIndexes: number[], renderPageIndexes: number[], index: number) {
    const changedFromNotVisibleToVisible = !prevRenderPageIndexes.includes(index) && renderPageIndexes.includes(index);
    const changedFromVisibleToNotVisible = prevRenderPageIndexes.includes(index) && !renderPageIndexes.includes(index);
    return changedFromNotVisibleToVisible || changedFromVisibleToNotVisible;
}

export default PdfPage3;
