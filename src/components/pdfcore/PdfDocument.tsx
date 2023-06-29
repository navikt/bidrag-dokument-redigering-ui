import "./PdfRenderer.less";
import "./pdf_viewer.css";

import * as pdfjsLib from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist";
import { EventBus, PDFViewer } from "pdfjs-dist/web/pdf_viewer";
// import pdfdoc from "pdfjs-dist/build/pdf.worker.js";
import { MutableRefObject, useRef } from "react";
import React from "react";
import { useEffect } from "react";
import { PropsWithChildren } from "react";
import { useState } from "react";

import { createArrayWithLength, removeDuplicates } from "../utils/ObjectUtils";
import { TimerUtils } from "../utils/TimerUtils";
import { PdfDocumentType } from "../utils/types";
import { PdfDocumentContext } from "./PdfDocumentContext";
import PdfUtils, { ScrollDirection } from "./PdfUtils";

const DEFAULT_SCALE_DELTA = 1.1;
const MIN_SCALE = 0.1;
const MAX_SCALE = 10.0;
// pdfjsLib.GlobalWorkerOptions.workerSrc = `${environment.url.static_url}/pdf.worker.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString();

export interface PdfDocumentRef {
    documentElement: HTMLDivElement;
    currentScale: () => number;
    containerTopLeft: () => number[];
    containerElement: () => HTMLDivElement;
    scrollToPage: (pageNumber: number) => void;
}
export type CURRENT_SCALE = number;
export type IncreaseScaleFn = (ticks?: number, scaleFactor?: number) => CURRENT_SCALE;
export type DecreaseScaleFn = (ticks?: number, scaleFactor?: number) => CURRENT_SCALE;
interface PdfDocumentProps extends PropsWithChildren<unknown> {
    id: string;
    file: PdfDocumentType;
    documentRef?: MutableRefObject<PdfDocumentRef>;
    renderText?: boolean;
    scale?: number;
    overscanCount?: number;
    onLoading?: () => void;
    onDocumentLoaded?: (pagesCount: number, pages: number[], IncreaseScaleFn, DecreaseScaleFn) => void;
    onError?: (message: string) => void;
    onPageChange?: (currentPageNumber: number, previousPageNumber: number) => void;
    onScroll?: (currentPageNumber: number, scrollDirection: ScrollDirection) => void;
}

export default function PdfDocument({
    id,
    file,
    scale = 1.3,
    onError,
    documentRef,
    onDocumentLoaded,
    onPageChange,
    overscanCount = 5,
    children,
    onScroll,
    renderText = true,
}: PropsWithChildren<PdfDocumentProps>) {
    const divRef = useRef<HTMLDivElement>(null);
    const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy>();
    const [renderPageIndexes, setRenderPageIndexes] = useState<number[]>([]);
    const [currentScale, setCurrentScale] = useState(1);
    const curretnScaleRef = useRef(1);
    const isMouseOver = useRef(false);
    const pdfDocumentRef = useRef<PDFDocumentProxy>();
    const pdfViewerRef = useRef<PDFViewer>();
    const isRendering = useRef<boolean>(false);
    const pdfEventBus = useRef<EventBus>();
    const pageElements = useRef<Element[]>([]);
    const lastKnownScrollPosition = useRef(0);
    const currentPageNumberRef = useRef(1);
    const onScrollThrottler = useRef(
        TimerUtils.throttleByAnimation((pageNumber: number, scrollDirection: ScrollDirection) =>
            onScroll?.(pageNumber, scrollDirection)
        )
    );

    const onScrollHandlerThrottler = useRef(TimerUtils.throttleByAnimation(onScrollHandler));

    useEffect(() => {
        if (!isRendering.current) {
            isRendering.current = true;
            loadDocument().then(() => initEventListeners());
        }
    }, []);

    // useEffect(() => {
    //     if (pdfViewerRef.current) {
    //         console.log(scale, pdfViewerRef.current.currentScale);
    //         if (pdfViewerRef.current.currentScale < scale) {
    //             pdfViewerRef.current.increaseScale();
    //         } else {
    //             pdfViewerRef.current.decreaseScale();
    //         }
    //         pdfViewerRef.current.update();
    //     }
    // }, [scale]);
    function getPageElements() {
        if (!divRef.current || !pdfDocumentRef.current) return;
        if (pageElements.current.length != pdfDocumentRef.current.numPages) {
            pageElements.current = createArrayWithLength(pdfDocumentRef.current.numPages).map((i) => {
                return divRef.current!.querySelector(`[data-index="${i}"]`) as HTMLDivElement;
            });
        }
        return pageElements.current;
    }

    function scrollToPage(pageNumber: number) {
        if (!divRef.current) return;
        const pageElement = PdfUtils.getPageElement(divRef.current, pageNumber);
        pageElement?.scrollIntoView({ block: "center", behavior: "auto" });
    }
    function increaseScale2(ticks?: number, scaleFactor?: number) {
        let newScale = curretnScaleRef.current;
        if (scaleFactor > 1) {
            newScale = Math.round(newScale * scaleFactor * 100) / 100;
        } else {
            let steps = ticks ?? 1;
            console.log(steps, newScale, DEFAULT_SCALE_DELTA);
            do {
                //@ts-ignore
                newScale = Math.ceil((newScale * DEFAULT_SCALE_DELTA).toFixed(2) * 10) / 10;
            } while (--steps > 0 && newScale < MAX_SCALE);
        }
        const newScaleAdjusted = Math.min(MAX_SCALE, newScale);
        console.log("Increase scale 2", ticks, scaleFactor, newScaleAdjusted);
        setCurrentScale(newScaleAdjusted);
        curretnScaleRef.current = newScaleAdjusted;
    }

    function decreaseScale2(ticks?: number, scaleFactor?: number) {
        let newScale = curretnScaleRef.current;
        if (scaleFactor > 0 && scaleFactor < 1) {
            newScale = Math.round(newScale * scaleFactor * 100) / 100;
        } else {
            let steps = ticks ?? 1;
            do {
                //@ts-ignore
                newScale = Math.floor((newScale / DEFAULT_SCALE_DELTA).toFixed(2) * 10) / 10;
            } while (--steps > 0 && newScale > MIN_SCALE);
        }
        const newScaleAdjusted = Math.max(MIN_SCALE, newScale);
        console.log("Decrease scale 2", ticks, scaleFactor, newScaleAdjusted);

        setCurrentScale(newScaleAdjusted);
        curretnScaleRef.current = newScaleAdjusted;
    }

    function increaseScale(ticks: number, scaleFactor?: number) {
        console.log(pdfViewerRef.current.currentScale);
        pdfViewerRef.current.increaseScale({ drawingDelay: 5000, steps: ticks, scaleFactor });
        cssTransform();
        return pdfViewerRef.current.currentScale;
    }

    function decreaseScale(ticks: number, scaleFactor?: number) {
        pdfViewerRef.current.decreaseScale({ drawingDelay: 5000, steps: ticks, scaleFactor });
        cssTransform();
        return pdfViewerRef.current.currentScale;
    }

    function cssTransform() {
        const visible = pdfViewerRef.current._getVisiblePages();
        console.log(visible);
        // visible.views.forEach((v) => {
        //     const pdfPage = v.view as PDFPageView;
        //     const canvas = pdfPage.canvas;
        //     const viewport = pdfPage.viewport;
        //     canvas.style.height = `${viewport.height}px`;
        //     canvas.style.width = `${viewport.width}px`;
        // });
    }
    async function loadDocument() {
        const documentBuffer = file instanceof Blob ? await file.arrayBuffer() : file;
        return pdfjsLib
            .getDocument(documentBuffer)
            .promise.then((pdfDoc) => {
                console.log("HEREr", pdfDoc);
                pdfDocumentRef.current = pdfDoc;
                pdfEventBus.current = new EventBus();
                pdfViewerRef.current = new PDFViewer({
                    eventBus: pdfEventBus.current,
                    container: divRef.current,
                    useOnlyCssZoom: false,
                    annotationMode: 0,
                    isOffscreenCanvasSupported: false,
                    removePageBorders: true,
                    maxCanvasPixels: -1,
                });
                // pdfViewerRef.current.defaultRenderingQueue = false;
                pdfViewerRef.current.setDocument(pdfDoc);
                // pdfViewerRef.current.renderingQueue.idleTimeout = 100;
                pdfEventBus.current.on(
                    "pagesinit",
                    (e) => {
                        const pdfViewer = e.source as PDFViewer;
                        const pagesCount = pdfViewer.pagesCount;
                        // pdfViewerRef.current.currentScale = 1;
                        // console.log(pdfViewerRef.current.getPageView(0));
                        // const viewPort = pdfViewerRef.current.getPageView(0).viewPort;
                        // viewPort.style.setProperty("--scale-factor", viewPort.scale);
                        pdfViewerRef.current.currentScaleValue = "auto";
                        onDocumentLoaded?.(
                            pagesCount,
                            createArrayWithLength(pagesCount).map((i) => i + 1),
                            increaseScale,
                            decreaseScale
                        );
                    },
                    { once: true }
                );

                pdfEventBus.current.on("pagerendered", (e) => {
                    const pageView = pdfViewerRef.current.getPageView(e.pageNumber - 1);
                    const scale = pdfViewerRef.current.currentScale;
                    // pageView.draw();
                    // pageView.canvas.style = `transform: rotate(0deg) scale(${scale}, ${scale});`;
                    // console.log(pageView, e);
                });

                pdfEventBus.current.on("updateviewarea", (e) => {
                    const visiblePages = pdfViewerRef.current._getVisiblePages();
                    const scale = pdfViewerRef.current.currentScale;
                    // visiblePages.views.forEach((_view) => {
                    //     const pageView = _view.view as PDFPageView;
                    //     pageView.reset();
                    //     pageView.draw();
                    // });
                    // console.log(visiblePages.views);

                    // pdfViewerRef.current.forceRendering(null);
                    // pdfViewerRef.current.update();
                    // pageView.draw();
                    // pageView.canvas.style = `transform: rotate(0deg) scale(${scale}, ${scale});`;
                    // console.log(visiblePages, e);
                });

                return pdfDoc;
            })
            .then((pdfDoc) => {
                const currentVisiblePageIndexes = createArrayWithLength(
                    Math.min(Math.max(3, overscanCount), pdfDoc.numPages - 1)
                );
                updateRenderPages(currentVisiblePageIndexes, 0);
                return pdfDoc;
            })
            .then((pdfDoc) => {
                setPdfDocument(pdfDoc);
                if (documentRef) {
                    documentRef.current = {
                        documentElement: divRef.current!,
                        containerTopLeft: () => pdfViewerRef.current.containerTopLeft,
                        containerElement: () => pdfViewerRef.current.container,
                        currentScale: () => pdfViewerRef.current.currentScale,
                        scrollToPage,
                    };
                    // documentRef.current = {
                    //     documentElement: divRef.current!,
                    //     containerTopLeft: () => [divRef.current.offsetTop, divRef.current.offsetLeft],
                    //     containerElement: () => divRef.current,
                    //     currentScale: () => curretnScaleRef.current,
                    //     scrollToPage,
                    // };
                }
                // onDocumentLoaded?.(
                //     pdfDoc.numPages,
                //     createArrayWithLength(pdfDoc.numPages).map((i) => i + 1),
                //     increaseScale2,
                //     decreaseScale2
                // );
            })
            .catch(function (reason) {
                console.error("Error: " + reason + "asdasd -- " + id, reason);
            })
            .finally();
    }

    function getVisiblePageIndexes() {
        // return PdfUtils.getVisiblePageIndexes(divRef.current!, getPageElements()!);
        return [1];
    }

    function updateRenderPages(visiblePages: number[], currentPageIndex: number) {
        const nextPagesByOverscan = removeDuplicates(
            createArrayWithLength(overscanCount).map((index) =>
                Math.min(currentPageIndex + index, pdfDocumentRef.current!.numPages - 1)
            )
        );
        const prevPagesByOverscan = removeDuplicates(
            createArrayWithLength(overscanCount).map((_, index) => Math.max(currentPageIndex - index, 0))
        );

        const updatedRenderPages = removeDuplicates([...visiblePages, ...nextPagesByOverscan, ...prevPagesByOverscan]);

        setRenderPageIndexes(updatedRenderPages);
    }

    function updateCurrentPage(currentPageNumber: number) {
        if (currentPageNumberRef.current != currentPageNumber) {
            onPageChange?.(currentPageNumber, currentPageNumberRef.current);
            currentPageNumberRef.current = currentPageNumber;
        }
    }

    function onScrollHandler() {
        if (!divRef.current) return;
        const currentScrollHeight = divRef.current.scrollTop;
        const currentVisiblePageIndexes = getVisiblePageIndexes();
        const currentPageIndex = currentVisiblePageIndexes[0];
        const currentPageNumber = currentPageIndex + 1;
        if (isUserScrolling()) {
            onScrollThrottler.current(
                currentPageNumber,
                currentScrollHeight < lastKnownScrollPosition.current ? "up" : "down"
            );
            lastKnownScrollPosition.current = currentScrollHeight;
        }

        updateRenderPages(currentVisiblePageIndexes, currentPageNumber);
        updateCurrentPage(currentPageNumber);
    }

    function initEventListeners() {
        divRef.current?.addEventListener("scroll", () => onScrollHandlerThrottler.current());
    }

    function isUserScrolling() {
        return isMouseOver.current;
    }

    return (
        <PdfDocumentContext.Provider
            value={{
                renderPageIndexes,
                pdfDocument,
                scale: currentScale,
                renderText,
                pdfEventBus: pdfEventBus,
                pdfViewerRef,
            }}
        >
            <div
                ref={divRef}
                tabIndex={0}
                className={"pdfrenderer_container"}
                onMouseOver={() => (isMouseOver.current = true)}
                onMouseLeave={() => (isMouseOver.current = false)}
            >
                {/* <div id={id} className="pdfViewer" /> */}
                <div id={id} className="pdfViewer">
                    {/* {children} */}
                </div>
            </div>
        </PdfDocumentContext.Provider>
    );
}
