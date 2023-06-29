import React, { useRef, useState } from "react";

import { DecreaseScaleFn, IncreaseScaleFn, PdfDocumentRef } from "../pdfcore/PdfDocument";
import PdfUtils from "../pdfcore/PdfUtils";
import BasePdfViewer from "./BasePdfViewer";
import { renderPageFn } from "./BasePdfViewer";
import PdfThumbnailViewer from "./PdfThumbnailViewer";
import { usePdfViewerContext } from "./PdfViewerContext";
const FORCE_PAGES_LOADED_TIMEOUT = 10000; // ms
const WHEEL_ZOOM_DISABLED_TIMEOUT = 1000; // ms
interface PdfViewerProps {
    thumbnailsHidden?: boolean;
    thumbnailsMinimized?: boolean;
    showThumbnails?: boolean;
    renderPage?: renderPageFn;
    renderThumbnailPage?: renderPageFn;
}

function initMap() {
    const tickMap = new Map();
    tickMap["_wheelUnusedTicks"] = 0;
    tickMap["_wheelUnusedFactor"] = 1;
    return tickMap;
}

export default function PdfViewer({
    showThumbnails = false,
    thumbnailsMinimized,
    thumbnailsHidden,
    renderPage,
    renderThumbnailPage,
}: PdfViewerProps) {
    const hasThumbnailsLoaded = useRef(!showThumbnails);
    const hasDocumentLoaded = useRef(false);
    const thumbnailDocumentRef = useRef<PdfDocumentRef>(null);
    const baseDocumentRef = useRef<PdfDocumentRef>(null);
    const zoomDisabledTimeout = useRef<NodeJS.Timeout>(null);
    const ticksMap = useRef<Map<string, number>>(initMap());

    const [pageInView, setPageInView] = useState(1);
    const {
        currentPage,
        onPageChange,
        onDocumentLoaded,
        scale,
        updateScale,
        zoom: { onZoomIn, onZoomOut },
    } = usePdfViewerContext();

    // useEffect(() => {
    //     if (pageInView != currentPage) {
    //         baseDocumentRef.current.scrollToPage(currentPage);
    //     }
    // }, [currentPage, pageInView]);
    function listener(event) {
        if (event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            const mousePosition = { x: event.pageX, y: event.pageY };
            const containerElement = PdfUtils.getPdfContainerElement();
            const pagesElement = PdfUtils.getPdfPagesElement();
            // Get mouse cursor position
            const mouseX = event.clientX - containerElement.offsetLeft;
            const mouseY = event.clientY - containerElement.offsetTop;

            // Calculate new scale
            const delta = event.deltaY > 0 ? -0.1 : 0.1;
            const newScale = scale + delta;
            const xt = mouseX - newScale * (mouseX - containerElement.scrollLeft / 2);
            const yt = mouseY - newScale * (mouseY - containerElement.scrollTop / 2);
            // containerElement.scrollLeft = xt;
            // containerElement.scrollTop = -yt;
            // PdfUtils.getPdfPagesElement().style.transform = `translate(${xt}px,${yt}px)`;
            updateScale?.(newScale);
        }
    }
    // useEffect(() => {
    //     window.addEventListener("wheel", handleMouseZoomEvent, {
    //         passive: false,
    //     });
    //     return () => window?.removeEventListener("wheel", handleMouseZoomEvent);
    // }, [scale]);

    function setZoomDisabledTimeout() {
        if (zoomDisabledTimeout.current) {
            clearTimeout(zoomDisabledTimeout.current);
        }
        zoomDisabledTimeout.current = setTimeout(function () {
            zoomDisabledTimeout.current = null;
        }, WHEEL_ZOOM_DISABLED_TIMEOUT);
    }

    function accumulateTicks(ticks, prop: string) {
        if ((ticksMap.current[prop] > 0 && ticks < 0) || (ticksMap.current[prop] < 0 && ticks > 0)) {
            ticksMap.current[prop] = 0;
        }
        ticksMap.current[prop] += ticks;
        const wholeTicks = Math.trunc(ticksMap.current[prop]);
        ticksMap.current[prop] -= wholeTicks;
        return wholeTicks;
    }
    function handleMouseZoomEvent(evt) {
        const deltaMode = evt.deltaMode;

        // console.log(deltaMode);
        // The following formula is a bit strange but it comes from:
        // https://searchfox.org/mozilla-central/rev/d62c4c4d5547064487006a1506287da394b64724/widget/InputData.cpp#618-626
        let scaleFactor = Math.exp(-evt.deltaY / 100);
        const isPinchToZoom =
            evt.ctrlKey &&
            deltaMode === WheelEvent.DOM_DELTA_PIXEL &&
            evt.deltaX === 0 &&
            Math.abs(scaleFactor - 1) < 0.05 &&
            evt.deltaZ === 0;

        if (evt.ctrlKey || evt.metaKey || isPinchToZoom) {
            evt.preventDefault();
            if (zoomDisabledTimeout.current) {
                return;
            }

            const previousScale = baseDocumentRef.current.currentScale();
            if (isPinchToZoom) {
                scaleFactor = accumulateFactor(previousScale, scaleFactor, "_wheelUnusedFactor");
                if (scaleFactor < 1) {
                    onZoomOut(null, scaleFactor);
                } else if (scaleFactor > 1) {
                    onZoomIn(null, scaleFactor);
                } else {
                    return;
                }
            } else {
                const delta = normalizeWheelEventDirection2(evt);
                let ticks = 0;
                if (deltaMode === WheelEvent.DOM_DELTA_LINE || deltaMode === WheelEvent.DOM_DELTA_PAGE) {
                    if (Math.abs(delta) >= 1) {
                        ticks = Math.sign(delta);
                    } else {
                        ticks = accumulateTicks(delta, "_wheelUnusedTicks");
                    }
                } else {
                    const PIXELS_PER_LINE_SCALE = 30;
                    ticks = accumulateTicks(delta / PIXELS_PER_LINE_SCALE, "_wheelUnusedTicks");
                }
                // console.log("ticks", ticks, deltaMode);
                if (ticks < 0) {
                    onZoomOut(-ticks);
                } else if (ticks > 0) {
                    onZoomIn(ticks);
                } else {
                    return;
                }
            }

            centerAtPos(previousScale, evt.clientX, evt.clientY);
        } else {
            setZoomDisabledTimeout();
        }
    }

    function accumulateFactor(previousScale, factor, prop) {
        if (factor === 1) {
            return 1;
        }
        // If the direction changed, reset the accumulated factor.
        if ((ticksMap.current[prop] > 1 && factor < 1) || (ticksMap.current[prop] < 1 && factor > 1)) {
            ticksMap.current[prop] = 1;
        }

        const newFactor = Math.floor(previousScale * factor * ticksMap.current[prop] * 100) / (100 * previousScale);
        ticksMap.current[prop] = factor / newFactor;

        return newFactor;
    }
    function normalizeWheelEventDirection2(evt) {
        let delta = Math.hypot(evt.deltaX, evt.deltaY);
        const angle = Math.atan2(evt.deltaY, evt.deltaX);
        if (-0.25 * Math.PI < angle && angle < 0.75 * Math.PI) {
            delta = -delta;
        }
        return delta;
    }

    function centerAtPos(previousScale, x, y) {
        const scaleDiff = baseDocumentRef.current.currentScale() / previousScale - 1;
        // console.log("centerAtPos", scaleDiff, previousScale, baseDocumentRef.current.currentScale());
        if (scaleDiff !== 0) {
            const [top, left] = baseDocumentRef.current.containerTopLeft();
            const pdfViewerContainer = baseDocumentRef.current.containerElement();
            // console.log(
            //     "container",
            //     pdfViewerContainer,
            //     left,
            //     top,
            //     scaleDiff,
            //     (x - left) * scaleDiff,
            //     (y - top) * scaleDiff
            // );
            pdfViewerContainer.scrollLeft += (x - left) * scaleDiff;
            pdfViewerContainer.scrollTop += (y - top) * scaleDiff;
        }
    }

    function _onThumbnailLoaded(pagesCount: number, pages: number[]) {
        hasThumbnailsLoaded.current = true;
        if (hasDocumentLoaded.current)
            onDocumentLoaded(
                pagesCount,
                pages,
                () => null,
                () => null
            );
    }

    function _onDocumentLoaded(
        pagesCount: number,
        pages: number[],
        increaseScale: IncreaseScaleFn,
        decreaseScale: DecreaseScaleFn
    ) {
        hasDocumentLoaded.current = true;
        if (hasThumbnailsLoaded.current || !showThumbnails)
            onDocumentLoaded(pagesCount, pages, increaseScale, decreaseScale);
    }

    function _renderThumbnails() {
        return (
            <PdfThumbnailViewer
                minimized={thumbnailsMinimized}
                hidden={thumbnailsHidden}
                onPageClick={(pageNumber) => onPageChange(pageNumber)}
                onDocumentLoaded={_onThumbnailLoaded}
                renderPage={renderThumbnailPage}
            />
        );
    }

    function _onPageChange(pageNumber: number) {
        setPageInView(pageNumber);
        onPageChange(pageNumber);
    }

    function _onScroll(pageNumber: number) {
        thumbnailDocumentRef.current?.scrollToPage(pageNumber);
    }

    return (
        <div className={"pdfviewer"} style={{ display: "flex", flexDirection: "row" }}>
            {showThumbnails && _renderThumbnails()}
            <div className={"pdfviewer_container"}>
                <BasePdfViewer
                    scale={scale}
                    baseDocumentRef={baseDocumentRef}
                    onDocumentLoaded={_onDocumentLoaded}
                    onPageChange={_onPageChange}
                    renderPage={renderPage}
                    onScroll={_onScroll}
                />
            </div>
        </div>
    );
}
