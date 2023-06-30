import { RenderTask } from "pdfjs-dist";
import { PDFPageProxy } from "pdfjs-dist/types/web/pdf_viewer";
import React, { CSSProperties, MutableRefObject, PropsWithChildren, useEffect, useRef, useState } from "react";

import { PdfDocumentContextProps, usePdfDocumentContext } from "./PdfDocumentContext";
export type PageRenderedFn = (containerElement: HTMLDivElement) => void;

interface PdfPageProps {
    pageRendered?: PageRenderedFn;
    pageDestroyed?: () => void;
    pageNumber: number;
    index: number;
    onPageClicked?: (pageNumber: number) => void;
    style?: CSSProperties;
    pageRef?: MutableRefObject<HTMLDivElement>;
}

const PdfPage = (props: PropsWithChildren<PdfPageProps>) => {
    const contextProps = usePdfDocumentContext();

    return <PdfPageMemo {...props} {...contextProps} />;
};

type PdfPageMemoProps = PdfPageProps & PdfDocumentContextProps;
const PdfPageMemo = React.memo(
    ({
        pdfDocument,
        renderPageIndexes,
        scale,
        children,
        renderText,
        pageNumber,
        style,
        index,
    }: PropsWithChildren<PdfPageMemoProps>) => {
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
            });
        }

        function getStyle() {
            if (pageObject == null) return {};
            const { pageWidth, pageHeight } = pageObject.getViewport().rawDims as any;

            return {
                "--page-width": `${pageWidth}px`,
                "--page-height": `${pageHeight}px`,
                width: "var(--page-width)",
                height: "var(--page-height)",
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
                    <PDFCanvas pdfPage={pageObject} scale={scale} pageNumber={pageNumber} />
                )}
                {children}
            </div>
        );
    },
    (prevProps, nextProps) =>
        !shouldRerenderPage(prevProps.renderPageIndexes, nextProps.renderPageIndexes, nextProps.index) &&
        prevProps.pdfDocument == nextProps.pdfDocument &&
        prevProps.scale == nextProps.scale &&
        prevProps.children == nextProps.children &&
        nextProps.renderPageIndexes.includes(nextProps.index)
);

interface PDFCanvasProps {
    pdfPage: PDFPageProxy;
    pageNumber: number;
    scale: number;
}
function PDFCanvas({ pdfPage, scale, pageNumber, children }: PropsWithChildren<PDFCanvasProps>) {
    const pageRenderTask = useRef<RenderTask>();
    const pageRenderNextScale = useRef<number>();
    const timeoutId = useRef<NodeJS.Timeout>();
    const canvasRef = useRef<HTMLDivElement>();

    useEffect(() => {
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
        }, 400);
    }, [scale]);

    useEffect(() => {
        drawPage(scale);
    }, [pdfPage]);

    function fitCanvasToPage(scale: number) {
        const canvasElement = canvasRef.current.querySelector("canvas");
        canvasElement.style.transformOrigin = "0px 0px";
        canvasElement.style.transform = `scale(${1 / scale})`;
    }
    function drawPage(scale: number) {
        if (pdfPage == null || !scale) return;
        if (pageRenderTask.current != null) {
            pageRenderNextScale.current = scale;
            return;
        }
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
                fitCanvasToPage(scale);
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
            });
    }
    return (
        <div className="canvasWrapper" ref={canvasRef}>
            <canvas className="canvas" />
            {children}
        </div>
    );
}

function shouldRerenderPage(prevRenderPageIndexes: number[], renderPageIndexes: number[], index: number) {
    const changedFromNotVisibleToVisible = !prevRenderPageIndexes.includes(index) && renderPageIndexes.includes(index);
    const changedFromVisibleToNotVisible = prevRenderPageIndexes.includes(index) && !renderPageIndexes.includes(index);
    return changedFromNotVisibleToVisible || changedFromVisibleToNotVisible;
}

export default PdfPage;
