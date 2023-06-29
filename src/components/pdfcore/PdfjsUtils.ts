// Code copied from pdfjs library and adjusted for internal use

import { PDFPageProxy } from "pdfjs-dist";

import { scrollIntoView } from "./pdfjslib/ui_utils";
import PdfUtils from "./PdfUtils";

export default class PdfJsUtils {
    static getLocation(
        firstVisiblePage: { x: number; y: number },
        currentPageView: PDFPageProxy,
        container: HTMLDivElement,
        currentScale: number
    ) {
        const topLeft = currentPageView
            .getViewport({ scale: currentScale })
            .convertToPdfPoint(container.scrollLeft - firstVisiblePage.x, container.scrollTop - firstVisiblePage.y);
        // getVisibleElements();
        const intLeft = Math.round(topLeft[0]);
        const intTop = Math.round(topLeft[1]);

        return {
            top: intTop,
            left: intLeft,
        };
    }
    // Copied from pdfjs-dist/web/pdf_viewer.js#L6635
    // pdfjs-dist/web/pdf_viewer.js#L6762 --> scrollPageIntoView
    static scrollIntoViewAfterScaling(
        scrollPage: PDFPageProxy,
        pageElement: HTMLDivElement,
        destArray: number[],
        scale: number
    ) {
        const x = destArray[0];
        const y = destArray[1];
        const pdfPoint = scrollPage.getViewport({ scale: scale }).convertToViewportPoint(x, y);
        const boundingRect = [pdfPoint, pdfPoint];
        const left = Math.min(boundingRect[0][0], boundingRect[1][0]);
        const top = Math.min(boundingRect[0][1], boundingRect[1][1]);
        console.log("scrollIntoViewAfterScaling", left, top, scale, x, y);

        scrollIntoView(pageElement, {
            left,
            top,
        });
    }

    static cssTransformPageCanvas(
        canvas: HTMLCanvasElement,
        pdfPage: PDFPageProxy,
        prevScale: number,
        nextScale: number
    ) {
        const oldViewPort = pdfPage.getViewport({ scale: prevScale });
        const viewport = pdfPage.getViewport({ scale: nextScale });
        const diffX = oldViewPort.offsetX - viewport.offsetX;
        const diffY = oldViewPort.offsetY - viewport.offsetY;
        // canvas.style.transform = `translate(${diffX}px, ${diffY}px)`;
        canvas.style.height = `${viewport.height}px`;
        canvas.style.width = `${viewport.width}px`;
    }
    static scrollPageIntoView(
        scrollToPagenumber: number,
        pages: Map<number, PDFPageProxy>,
        visiblePages: number[],
        container: HTMLDivElement,
        currentScale: number
    ) {
        const firstVisiblePageIndex = visiblePages[0];
        const firstVisiblePageElement = PdfUtils.getPageContainerElement(container, firstVisiblePageIndex);
        const pageElement = PdfUtils.getPageContainerElement(container, scrollToPagenumber - 1);
        const pageView = pages.get(scrollToPagenumber);
        const location = this.getLocation(firstVisiblePageElement, pageView, container, currentScale);
        console.log(scrollToPagenumber, visiblePages, pages, location);
        this.scrollIntoViewAfterScaling(pageView, pageElement, [location.left, location.top], currentScale);
    }
    static scrollIntoView(pageElement: HTMLDivElement, spot: { left: number; top: number }) {
        let parent = pageElement.offsetParent as HTMLDivElement;
        let offsetY = pageElement.offsetTop + pageElement.clientTop;
        let offsetX = pageElement.offsetLeft + pageElement.clientLeft;
        while (parent.clientHeight === parent.scrollHeight && parent.clientWidth === parent.scrollWidth) {
            offsetY += parent.offsetTop;
            offsetX += parent.offsetLeft;
            parent = parent.offsetParent as HTMLDivElement;
            if (!parent) {
                return;
            }
        }
        offsetY += spot.top ?? 0;
        offsetX += spot.left ?? 0;
        parent.scrollLeft = offsetX;
        parent.scrollTop = offsetY;
        console.log(parent, offsetX, offsetY);
    }
    // #setScale(value, options) {
    //     let scale = parseFloat(value);
    //     if (scale > 0) {
    //       options.preset = false;
    //       this.#setScaleUpdatePages(scale, value, options);
    //     } else {
    //       const currentPage = this._pages[this._currentPageNumber - 1];
    //       if (!currentPage) {
    //         return;
    //       }
    //       let hPadding = _ui_utils.SCROLLBAR_PADDING,
    //         vPadding = _ui_utils.VERTICAL_PADDING;
    //       if (this.isInPresentationMode) {
    //         hPadding = vPadding = 4;
    //         if (this._spreadMode !== _ui_utils.SpreadMode.NONE) {
    //           hPadding *= 2;
    //         }
    //       } else if (this.removePageBorders) {
    //         hPadding = vPadding = 0;
    //       } else if (this._scrollMode === _ui_utils.ScrollMode.HORIZONTAL) {
    //         [hPadding, vPadding] = [vPadding, hPadding];
    //       }
    //       const pageWidthScale = (this.container.clientWidth - hPadding) / currentPage.width * currentPage.scale / this.#pageWidthScaleFactor;
    //       const pageHeightScale = (this.container.clientHeight - vPadding) / currentPage.height * currentPage.scale;
    //       switch (value) {
    //         case "page-actual":
    //           scale = 1;
    //           break;
    //         case "page-width":
    //           scale = pageWidthScale;
    //           break;
    //         case "page-height":
    //           scale = pageHeightScale;
    //           break;
    //         case "page-fit":
    //           scale = Math.min(pageWidthScale, pageHeightScale);
    //           break;
    //         case "auto":
    //           const horizontalScale = (0, _ui_utils.isPortraitOrientation)(currentPage) ? pageWidthScale : Math.min(pageHeightScale, pageWidthScale);
    //           scale = Math.min(_ui_utils.MAX_AUTO_SCALE, horizontalScale);
    //           break;
    //         default:
    //           console.error(`#setScale: "${value}" is an unknown zoom value.`);
    //           return;
    //       }
    //       options.preset = true;
    //       this.#setScaleUpdatePages(scale, value, options);
    //     }
    //   }
}
