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
import { TransformComponent, useTransformEffect } from "react-zoom-pan-pinch";

import { createArrayWithLength, removeDuplicates } from "../utils/ObjectUtils";
import { TimerUtils } from "../utils/TimerUtils";
import { PdfDocumentType } from "../utils/types";
import { PdfDocumentContext } from "./PdfDocumentContext";
import { getVisibleElements } from "./pdfjslib/ui_utils";
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
    onDocumentLoaded?: (pagesCount: number, pages: number[]) => void;
    onError?: (message: string) => void;
    onPageChange?: (currentPageNumber: number, previousPageNumber: number) => void;
    onScroll?: (currentPageNumber: number, scrollDirection: ScrollDirection) => void;
}

export default function PdfDocumentZoom({
    id,
    file,
    documentRef,
    onDocumentLoaded,
    onPageChange,
    overscanCount = 5,
    children,
    onScroll,
    scale,
    renderText = true,
}: PropsWithChildren<PdfDocumentProps>) {
    const divRef = useRef<HTMLDivElement>(null);
    const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy>();
    const [renderPageIndexes, setRenderPageIndexes] = useState<number[]>([]);
    const pages = useRef<Map<number, PDFPageProxy>>(new Map());
    const [currentScale, setCurrentScale] = useState(scale);
    const curretnScaleRef = useRef(1);
    const positionY = useRef(0);
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
    const onMouseWheelHandlerThrottler = useRef(TimerUtils.throttleByAnimation(onMouseWheelHandler));
    useTransformEffect(({ state, instance }) => {
        //console.log("HERER", state, instance); // { previousScale: 1, scale: 1, positionX: 0, positionY: 0 }
        divRef.current?.style.setProperty("--scale-factor", state.scale.toString());
        setCurrentScale(state.scale);
        positionY.current = state.positionY;
    });

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
                    createArrayWithLength(pdfDoc.numPages).map((i) => i + 1)
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
        return Array.from(visiblePages.ids).map((id) => parseInt(id as string));
    }

    function _getVisibleElements() {
        const views = getPageElements().map((elem) => ({
            div: elem as HTMLElement,
            id: parseInt(elem.getAttribute("data-index")),
        }));
        return getVisibleElements({
            scrollEl: getScrollElement() as HTMLElement,
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

    function onMouseWheelHandler(e: React.MouseEvent) {
        if (!divRef.current) return;
        if (e.ctrlKey || e.shiftKey || e.altKey) return;
        const transformContainer = document.querySelector(".pdfViewer-transform") as HTMLDivElement;
        const currentScrollHeight = divRef.current.firstElementChild.scrollTop;
        const transformRect = transformContainer.getBoundingClientRect();
        if (currentScrollHeight == 0 && transformRect.y != 0) {
            if (transformContainer.style.translate) {
                const translationY = parseInt(
                    transformContainer.style.translate?.split(" ")[1]?.replace("px", "") ?? "0"
                );
                const delta = e.deltaY;
                const newValue = Math.max(-(translationY + Math.abs(delta)), positionY.current);
                transformContainer.style.translate = `0 ${-newValue}px`;
            } else {
                transformContainer.style.translate = `0 ${transformRect.y + 10}px`;
            }
        }
    }

    function getScrollElement() {
        return divRef.current.querySelector(".pdfViewer-transform");
    }
    function onScrollHandler() {
        if (!divRef.current) return;
        const currentScrollHeight = divRef.current.firstElementChild.scrollTop;
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
        getScrollElement()?.addEventListener("scroll", () => onScrollHandlerThrottler.current());
        // getScrollElement()?.addEventListener("wheel", (e) => onMouseWheelHandlerThrottler.current(e));
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
                id={`container_${id}`}
                className={"pdfrenderer_container"}
                style={{
                    width: "100%",
                    overflowY: "auto",
                }}
            >
                <TransformComponent
                    contentClass="pdfViewer-transform"
                    wrapperStyle={{
                        width: "100%",
                        height: "100%",
                    }}
                    contentStyle={{
                        width: "100%",
                        height: "100%",
                        overflowY: "auto",
                    }}
                >
                    <div id={id} className="pdfViewer" style={{ margin: "auto" }}>
                        {children}
                    </div>
                </TransformComponent>
            </div>
        </PdfDocumentContext.Provider>
    );
}
