import "./PdfRenderer.less";
import "./pdf_viewer.css";

import * as pdfjsLib from "pdfjs-dist";
import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
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
import { getVisibleElements } from "./pdfjslib/ui_utils";
import PdfJsUtils from "./PdfjsUtils";
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

export default function PdfDocumentOld({
    id,
    file,
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
    const pages = useRef<Map<number, PDFPageProxy>>(new Map());
    const [currentScale, setCurrentScale] = useState(1);
    const curretnScaleRef = useRef(1);
    const isMouseOver = useRef(false);
    const pdfDocumentRef = useRef<PDFDocumentProxy>();
    const isRendering = useRef<boolean>(false);
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
            // console.log(steps, newScale, DEFAULT_SCALE_DELTA);
            do {
                //@ts-ignore
                newScale = Math.ceil((newScale * DEFAULT_SCALE_DELTA).toFixed(2) * 10) / 10;
            } while (--steps > 0 && newScale < MAX_SCALE);
        }
        const newScaleAdjusted = Math.min(MAX_SCALE, newScale);
        console.log("Increase scale 2", ticks, scaleFactor, newScaleAdjusted);
        setCurrentScale(newScaleAdjusted);
        cssScaleVisiblePages(curretnScaleRef.current, newScaleAdjusted);
        curretnScaleRef.current = newScaleAdjusted;
        scrollCurrentPageIntoView();
        return newScaleAdjusted;
    }

    function cssScaleVisiblePages(prevScale: number, nextScale: number) {
        divRef.current?.style.setProperty("--scale-factor", nextScale.toString());
        // const visiblePages = getPageElements();
        createArrayWithLength(pdfDocumentRef.current.numPages).forEach((pageIndex) => {
            cssScalePage(pageIndex + 1, prevScale, nextScale);
        });
    }
    function cssScalePage(pagenumber: number, prevScale: number, nextScale: number) {
        const container = divRef.current;
        const pageView = pages.current.get(pagenumber);
        const pageElement = PdfUtils.getPageContainerElement(container, pagenumber - 1);
        PdfJsUtils.cssTransformPageCanvas(pageElement.querySelector("canvas"), pageView, prevScale, nextScale);
    }
    function scrollCurrentPageIntoView() {
        const container = divRef.current;
        const scrollToPagenumber = currentPageNumberRef.current;
        const visiblePages = _getVisibleElements();
        const firstVisiblePage = visiblePages.first;
        const firstVisiblePageNumber = parseInt(visiblePages.first.id);
        const pageElement = PdfUtils.getPageContainerElement(container, scrollToPagenumber - 1);
        const firstVisiblePageView = pages.current.get(firstVisiblePageNumber + 1);
        const pageView = pages.current.get(scrollToPagenumber);
        const location = PdfJsUtils.getLocation(
            firstVisiblePage,
            firstVisiblePageView,
            divRef.current,
            curretnScaleRef.current
        );
        console.log("scrollCurrentPageIntoView", scrollToPagenumber, visiblePages.ids, pageView.pageNumber);
        PdfJsUtils.scrollIntoViewAfterScaling(
            pageView,
            pageElement,
            [location.left, location.top],
            curretnScaleRef.current
        );
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
        cssScaleVisiblePages(curretnScaleRef.current, newScaleAdjusted);
        curretnScaleRef.current = newScaleAdjusted;
        scrollCurrentPageIntoView();

        return newScaleAdjusted;
    }

    async function loadDocument() {
        const documentBuffer = file instanceof Blob ? await file.arrayBuffer() : file;
        return pdfjsLib
            .getDocument(documentBuffer)
            .promise.then((pdfDoc) => {
                pdfDocumentRef.current = pdfDoc;
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
                divRef.current?.style.setProperty("--scale-factor", curretnScaleRef.current.toString());
                if (documentRef) {
                    documentRef.current = {
                        documentElement: divRef.current!,
                        containerTopLeft: () => [divRef.current.offsetTop, divRef.current.offsetLeft],
                        containerElement: () => divRef.current,
                        currentScale: () => curretnScaleRef.current,
                        scrollToPage,
                    };
                }
                onDocumentLoaded?.(
                    pdfDoc.numPages,
                    createArrayWithLength(pdfDoc.numPages).map((i) => i + 1),
                    increaseScale2,
                    decreaseScale2
                );
            })
            .catch(function (reason) {
                console.error("Error: " + reason + "asdasd -- " + id, reason);
            })
            .finally();
    }

    function getVisiblePageIndexes(sortByVisibility = true) {
        const views = getPageElements().map((elem) => ({
            div: elem as HTMLElement,
            id: elem.getAttribute("data-index"),
        }));
        const visiblePages = getVisibleElements({
            scrollEl: divRef.current as HTMLElement,
            views,
            sortByVisibility,
            rtl: true,
        });
        const visiblePages2 = PdfUtils.getVisiblePageIndexes(divRef.current!, getPageElements()!);
        console.log("Get visible pages", visiblePages.ids);
        return Array.from(visiblePages.ids).map((id) => parseInt(id as string));
    }

    function _getVisibleElements() {
        const views = getPageElements().map((elem) => ({
            div: elem as HTMLElement,
            id: parseInt(elem.getAttribute("data-index")),
        }));
        return getVisibleElements({
            scrollEl: divRef.current as HTMLElement,
            views,
            sortByVisibility: true,
        });
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
    function onPageLoaded(pageNumber: number, page: PDFPageProxy) {
        pages.current.set(pageNumber, page);
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
        const visible = _getVisibleElements();
        const visiblePages = visible.views;
        let stillFullyVisible = false;

        const currentPageIndex = currentPageNumberRef.current - 1;
        const currentVisiblePageIndexes = getVisiblePageIndexes();
        for (const page of visiblePages) {
            if (page.percent < 100) {
                break;
            }
            if (page.id === currentPageIndex) {
                stillFullyVisible = true;
                break;
            }
        }
        const updatedPageIndex = stillFullyVisible ? currentPageIndex : visiblePages[0]?.id ?? 0;
        const currentPageNumber = updatedPageIndex + 1;

        console.log("inScrollHandler", currentPageNumber, visiblePages, stillFullyVisible);
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
            value={{ renderPageIndexes, pdfDocument, scale: currentScale, renderText, onPageLoaded }}
        >
            <div
                ref={divRef}
                tabIndex={0}
                className={"pdfrenderer_container"}
                onMouseOver={() => (isMouseOver.current = true)}
                onMouseLeave={() => (isMouseOver.current = false)}
            >
                <div id={id} className="pdfViewer">
                    {children}
                </div>
            </div>
        </PdfDocumentContext.Provider>
    );
}
