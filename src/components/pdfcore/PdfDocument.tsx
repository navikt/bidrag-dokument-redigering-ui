import "./PdfRenderer.less";
import "./pdf_viewer.css";

import * as pdfjsLib from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist";
import { MutableRefObject, useRef } from "react";
import React from "react";
import { useEffect } from "react";
import { PropsWithChildren } from "react";
import { useState } from "react";

import environment from "../../environment";
import { createArrayWithLength, removeDuplicates } from "../utils/ObjectUtils";
import { TimerUtils } from "../utils/TimerUtils";
import { PdfDocumentType } from "../utils/types";
import { PdfDocumentContext } from "./PdfDocumentContext";
import PdfUtils, { ScrollDirection } from "./PdfUtils";

pdfjsLib.GlobalWorkerOptions.workerSrc = `${environment.url.static_url}/pdf.worker.js`;
export interface PdfDocumentRef {
    documentElement: HTMLDivElement;
    scrollToPage: (pageNumber: number) => void;
}
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
    const isMouseOver = useRef(false);
    const pdfDocumentRef = useRef<PDFDocumentProxy>();
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
        loadDocument().then(() => initEventListeners());
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
        return (
            pdfjsLib
                // @ts-ignore
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
                    if (documentRef) {
                        documentRef.current = {
                            documentElement: divRef.current!,
                            scrollToPage,
                        };
                    }
                    onDocumentLoaded?.(
                        pdfDoc.numPages,
                        createArrayWithLength(pdfDoc.numPages).map((i) => i + 1)
                    );
                })
                .catch(onError)
                .finally()
        );
    }

    function getVisiblePageIndexes() {
        return PdfUtils.getVisiblePageIndexes(divRef.current!, getPageElements()!);
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
        <PdfDocumentContext.Provider value={{ renderPageIndexes, pdfDocument, scale, renderText }}>
            <div
                ref={divRef}
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
