import { AnnotationMode } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";
import {
    DefaultStructTreeLayerFactory,
    DefaultTextLayerFactory,
    DefaultXfaLayerFactory,
    EventBus,
    PDFPageView,
} from "pdfjs-dist/web/pdf_viewer";
import React, { CSSProperties, useEffect, useRef, useState } from "react";

import { PdfDocumentContextProps, usePdfDocumentContext } from "./PdfDocumentContext";

interface PdfPageProps {
    pageRendered?: () => void;
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
        const isPageRenderStarted = useRef<boolean>(false);

        useEffect(() => {
            if (hasPageNumberChanged()) {
                divRef.current?.querySelector(".page")?.remove();
            }
            if (pdfDocument && !isPageRenderStarted.current) {
                isPageRenderStarted.current = true;
                renderPage()
                    .then(pageRendered)
                    .then(() => drawOrDestroyPage(renderPageIndexes))
                    .catch(console.error);
            }

            setRenderedPageNumber(pageNumber);
        }, [pdfDocument, pageNumber]);

        useEffect(() => {
            drawOrDestroyPage(renderPageIndexes);
        }, [renderPageIndexes]);

        useEffect(() => {
            if (pdfPageViewRef.current) {
                const scaleAdjusted = scale / pdfjsLib.PixelsPerInch.PDF_TO_CSS_UNITS;
                pdfPageViewRef.current.update({ scale: scaleAdjusted });
            }
        }, [scale]);

        function hasPageNumberChanged() {
            return renderedPageNumber != pageNumber && pdfPageViewRef.current;
        }

        function drawOrDestroyPage(renderPageIndexes: number[]) {
            if (pdfPageViewRef.current) {
                if (shouldRenderPage(renderPageIndexes) && !isDrawed.current) {
                    pdfPageViewRef.current?.draw().then(pageRendered);
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
            return pdfDocument.getPage(pageNumber).then((page) => {
                const eventBus = new EventBus();
                const scaleAdjusted = scale / pdfjsLib.PixelsPerInch.PDF_TO_CSS_UNITS;

                // @ts-ignore
                pdfPageViewRef.current = new PDFPageView({
                    container: divRef.current,
                    id: pageNumber,
                    scale: scaleAdjusted,
                    defaultViewport: page.getViewport({ scale: scaleAdjusted }),
                    eventBus,
                    textLayerFactory: renderText
                        ? !pdfDocument.isPureXfa
                            ? new DefaultTextLayerFactory()
                            : null
                        : null,
                    useOnlyCssZoom: true,
                    maxCanvasPixels: -1,
                    annotationMode: AnnotationMode.ENABLE,
                    xfaLayerFactory: renderText ? (pdfDocument.isPureXfa ? new DefaultXfaLayerFactory() : null) : null,
                    structTreeLayerFactory: renderText ? new DefaultStructTreeLayerFactory() : null,
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
