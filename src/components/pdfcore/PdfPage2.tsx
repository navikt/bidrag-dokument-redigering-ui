import { PDFPageView } from "pdfjs-dist/web/pdf_viewer";
import { CSSProperties, useEffect, useRef } from "react";
import React from "react";

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

const PdfPage2 = (props: PdfPageProps) => {
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
        const { pdfEventBus, pdfViewerRef } = usePdfDocumentContext();
        const divRef = useRef<HTMLDivElement>(null);
        const isInitialized = useRef(false);
        const pdfPageViewRef = useRef<PDFPageView>();

        useEffect(() => {
            if (isInitialized.current) return;
            isInitialized.current = true;
            pdfEventBus.current._on("pagerendered", (e) => {
                if (e.pageNumber != pageNumber) return;
                // pageRendered(null);

                const pageView = pdfViewerRef.current.getPageView(e.pageNumber - 1) as PDFPageView;
                const scale = pdfViewerRef.current.currentScale;
                // console.log("PAGRE RENDERED", e.pageNumber, pageView.div);
                // const sourceCanvas = pageView.canvas;
                // divRef.current.appendChild(pageView.div);
                // divRef.current.querySelector("canvas").remove();

                // // const destCanvas = document.createElement("canvas");
                // // const context = destCanvas.getContext("2d");
                // // context.drawImage(sourceCanvas, 0, 0);
                // // sourceCanvas.getAttributeNames().forEach((att) => {
                // //     destCanvas.setAttribute(att, sourceCanvas.getAttribute(att));
                // // });
                // divRef.current.querySelector(".page .canvasWrapper").appendChild(sourceCanvas);

                // console.log(divRef.current.querySelector("canvas"));
                // // pageView.div.remove();
                // pageView.div = divRef.current.querySelector(".page");
                // pageView.canvas = divRef.current.querySelector("canvas");
                pageRendered(pageView.div);
                // divRef.current.appendChild(pageView.div);
                // pageView.div.remove();
                // pageView.draw();
                // pageView.canvas.style = `transform: rotate(0deg) scale(${scale}, ${scale});`;
                // console.log(pageView, e);
            });
            // pdfEventBus.current._off("pagerendered", (e) => {
            //     if (e.pageNumber != pageNumber) return;
            //     console.log("PAGRE DESTROYED", e.pageNumber);
            // });
        }, []);
        return null;
        // return <div data-page-number={index} style={style} className={"page pagecontainer"} ref={divRef}></div>;
        // return <div data-index={index} style={style} className={"pagecontainer"} ref={divRef}></div>;
    },
    (prevProps, nextProps) => true
);

export default PdfPage2;
