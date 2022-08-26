import "./PdfRenderer.less";
import "../pdfcore/pdf_viewer.css";

import * as pdfjsLib from "pdfjs-dist";
import { EventBus, GenericL10n, PDFLinkService, PDFViewer } from "pdfjs-dist/web/pdf_viewer";
import { useRef } from "react";
import React from "react";
import { useEffect } from "react";
import { PropsWithChildren } from "react";
import { ReactNode } from "react";
import { useState } from "react";

import PdfUtils from "./PdfUtils";
import { ScrollDirection } from "./PdfUtils";
import { PdfDocumentType } from "./types";
import {TimerUtils} from "../utils/TimerUtils";

const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfRendererProps extends PropsWithChildren<unknown> {
    id: string;
    document: PdfDocumentType;
    renderText?: boolean;
    scale?: number;
    onDocumentLoaded?: (pagesCount: number) => void;
    onPageClicked?: (pageNumber: number) => void;
    onPageChange?: (currentPageNumber: number, previousPageNumber: number) => void;
    onScroll?: (currentPageNumber: number, scrollDirection: ScrollDirection) => void;
    renderPage?: (pages: number, pageElement: ReactNode) => ReactNode;
}

export default function PdfRenderer({
    id,
    document,
    scale = 1.3,
    onDocumentLoaded,
    onPageChange,
    onScroll,
    renderText = true,
    renderPage,
}: PdfRendererProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const viewer = useRef<PDFViewer>(null);
    const pdfLinkService = useRef<PDFLinkService>(null);
    const eventBus = useRef<EventBus>(null);
    const [hasDocumentLoaded, setHasDocumentLoaded] = useState(false);
    const isMouseOver = useRef(false);
    const lastKnownScrollPosition = useRef(0);
    const onScrollThrottler = useRef(
        TimerUtils.throttleByAnimation((pageNumber: number, scrollDirection: ScrollDirection) =>
            onScroll?.(pageNumber, scrollDirection)
        )
    );

    const onPageChangeThrottler = useRef(
        TimerUtils.throttleByAnimation((pageNumber: number, prev: number) => onPageChange?.(pageNumber, prev))
    );

    useEffect(() => {
        viewer.current?._setScaleUpdatePages(scale, scale);
    }, [scale]);

    useEffect(() => {
        initPdfRenderer().then(loadDocument).then(initEventListeners);
    }, []);

    function handleDocumentLoadedEvent() {
        eventBus.current.on("pagesloaded", (e) => {
            onDocumentLoaded(viewer.current.pagesCount);
            setHasDocumentLoaded(true);
        });
    }

    async function loadDocument() {
        const documentBuffer = document instanceof Blob ? await document.arrayBuffer() : document;
        // @ts-ignore
        return pdfjsLib.getDocument(documentBuffer).promise.then((pdf) => {
            viewer.current.setDocument(pdf);
            pdfLinkService.current.setDocument(pdf, null);
        });
    }

    function initEventListeners() {
        eventBus.current.on("pagechanging", (e) => {
            onPageChangeThrottler.current(e.pageNumber, e.previous);
        });
        divRef.current.addEventListener("scroll", (e) => {
            if (isMouseOver.current) {
                const currentScrollHeight = divRef.current.scrollTop;
                onScrollThrottler.current(
                    viewer.current.currentPageNumber,
                    currentScrollHeight < lastKnownScrollPosition.current ? "up" : "down"
                );
                lastKnownScrollPosition.current = currentScrollHeight;
            }
        });
    }

    function initPdfRenderer() {
        eventBus.current = new EventBus();
        const l10n = new GenericL10n("no-nb");
        pdfLinkService.current = new PDFLinkService({ eventBus: eventBus.current, ignoreDestinationZoom: true });
        viewer.current = new PDFViewer({
            container: divRef.current,
            eventBus: eventBus.current,
            l10n: l10n,
            textLayerMode: renderText ? 1 : 0,
            linkService: renderText ? pdfLinkService.current : undefined,
        });
        viewer.current._setScale(scale, true);
        pdfLinkService.current.setViewer(viewer.current);
        handleDocumentLoadedEvent();
        return Promise.resolve();
    }

    return (
        <div
            ref={divRef}
            className={"pdfrenderer_container"}
            onMouseOver={() => (isMouseOver.current = true)}
            onMouseLeave={() => (isMouseOver.current = false)}
        >
            <div id={id} className="pdfViewer">
                {hasDocumentLoaded && (
                    <PdfPages
                        pagesCount={viewer.current.pagesCount}
                        renderPage={renderPage}
                        containerElement={divRef.current}
                    />
                )}
            </div>
        </div>
    );
}

interface PdfPagesProps {
    pagesCount: number;
    renderPage?: (pages: number, children: ReactNode) => ReactNode;
    containerElement: HTMLDivElement;
}

const PdfPages = ({ pagesCount, renderPage, containerElement }: PdfPagesProps) => {
    if (!renderPage) {
        return null;
    }
    return (
        <>
            {[...new Array(pagesCount)]
                .map((_, index) => index + 1)
                .map((pageNumber) => {
                    const pageElement = PdfUtils.getPageElement(containerElement, pageNumber);
                    return renderPage(pageNumber, <PdfPage pageNumber={pageNumber} pageElement={pageElement} />);
                })}
        </>
    );
};

interface PdfPageProps {
    pageElement: Element;
    pageNumber: number;
}

const PdfPage = React.memo(
    ({ pageElement, pageNumber }: PdfPageProps) => {
        const divRef = useRef<HTMLDivElement>();

        useEffect(() => {
            if (divRef.current) {
                divRef.current.appendChild(pageElement);
            }
        }, []);
        return <div data-page-number={pageNumber} className={"pagecontainer"} ref={divRef}></div>;
    },
    () => true
);
