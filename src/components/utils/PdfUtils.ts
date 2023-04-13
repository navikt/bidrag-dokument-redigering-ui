import { PDFViewer } from "pdfjs-dist/web/pdf_viewer";

export type ScrollDirection = "up" | "down";
export interface PageChangedEvent {
    currentPageNumber: number;
    previousPageNumber: number;
    scrollDirection: ScrollDirection;
}

export interface PageScrolledEvent {
    currentPageNumber: number;
}

export interface FocusPageEvent {
    pageNumber: number;
}

export default class PdfUtils {
    static PAGE_SCROLL_EVENT = "pageScrolled";
    static PAGE_CHANGE_EVENT = "pageChanged";
    static FOCUS_PAGE_EVENT = "focusPage";
    static RENDER_PAGES_EVENT = "renderPages";

    static sendPageChangedEvent(currentPageNumber: number, previousPageNumber: number) {
        const pageChangedEvent = new CustomEvent(PdfUtils.PAGE_CHANGE_EVENT, {
            detail: { currentPageNumber, previousPageNumber } as PageChangedEvent,
        });
        window.dispatchEvent(pageChangedEvent);
    }

    static sendRenderPagesEvent(renderPages: number[]) {
        const renderPagesEvent = new CustomEvent(PdfUtils.RENDER_PAGES_EVENT, {
            detail: renderPages,
        });
        window.dispatchEvent(renderPagesEvent);
    }
    static sendPageScrolledEvent(currentPageNumber: number, scrollDirection: ScrollDirection) {
        const pageScrolledEvent = new CustomEvent(PdfUtils.PAGE_SCROLL_EVENT, {
            detail: { currentPageNumber, scrollDirection } as PageScrolledEvent,
        });
        window.dispatchEvent(pageScrolledEvent);
    }

    static focusPageEvent(pageNumber: number) {
        window.dispatchEvent(
            new CustomEvent(PdfUtils.FOCUS_PAGE_EVENT, {
                detail: { pageNumber: pageNumber } as FocusPageEvent,
            })
        );
    }

    static getPageElement(containerElement: HTMLDivElement, pageNumber: number) {
        return containerElement.querySelector(`.page[data-page-number="${pageNumber}"]`);
    }

    static getPageContainerElement(containerElement: HTMLDivElement, pageNumber: number) {
        return containerElement.querySelector(`div.pagecontainer[data-page-number="${pageNumber}"]`);
    }

    static getPage(viewer: PDFViewer, pageNumber: number) {
        return viewer.getPageView(pageNumber);
    }

    static calculatePdfScale(scaleType: "thumbnail" | "regular") {
        const scaleFactor = scaleType === "thumbnail" ? 0.3 : 0.9;
        const width = window.innerWidth;
        return (width / 1000) * scaleFactor;
    }

    static backtrackBeforeAllVisibleElements(index, views, top) {
        if (index < 2) {
            return index;
        }

        let elt = views[index].div;
        let pageTop = elt.offsetTop + elt.clientTop;

        if (pageTop >= top) {
            elt = views[index - 1].div;
            pageTop = elt.offsetTop + elt.clientTop;
        }

        for (let i = index - 2; i >= 0; --i) {
            elt = views[i].div;

            if (elt.offsetTop + elt.clientTop + elt.clientHeight <= pageTop) {
                break;
            }

            index = i;
        }

        return index;
    }

    static binarySearchFirstItem(items, condition, start = 0) {
        let minIndex = start;
        let maxIndex = items.length - 1;

        if (maxIndex < 0 || !condition(items[maxIndex])) {
            return items.length;
        }

        if (condition(items[minIndex])) {
            return minIndex;
        }

        while (minIndex < maxIndex) {
            const currentIndex = (minIndex + maxIndex) >> 1;
            const currentItem = items[currentIndex];

            if (condition(currentItem)) {
                maxIndex = currentIndex;
            } else {
                minIndex = currentIndex + 1;
            }
        }

        return minIndex;
    }

    static getElementDimensions(element: HTMLDivElement) {
        const currentWidth = element.offsetLeft + element.clientLeft;
        const currentHeight = element.offsetTop + element.clientTop;
        const viewWidth = element.clientWidth;
        const viewHeight = element.clientHeight;
        const viewRight = currentWidth + viewWidth;
        const viewBottom = currentHeight + viewHeight;

        return {
            currentHeight,
            currentWidth,
            viewBottom,
            viewRight,
            viewHeight,
            viewWidth,
        };
    }
    static isPageVisible(parentElement: HTMLDivElement, pageElement: HTMLDivElement) {
        const { top, bottom, left, right } = this.getBoundingCoordinates(parentElement);
        const { viewBottom, currentHeight, viewRight, currentWidth } = this.getElementDimensions(pageElement);

        return !(viewBottom <= top || currentHeight >= bottom || viewRight <= left || currentWidth >= right);
    }

    static getBoundingCoordinates(element: Element) {
        const top = element.scrollTop;
        const left = element.scrollLeft;
        return {
            top,
            bottom: top + element.clientHeight,
            left,
            right: left + element.clientWidth,
        };
    }

    static getVisiblePageIndexes(parentElement: HTMLDivElement, pageElements: Element[]) {
        return pageElements
            .map((pageElement, pageIndex) => ({
                pageIndex,
                pageElement: pageElement as HTMLDivElement,
            }))
            .filter(({ pageElement }) => this.isPageVisible(parentElement, pageElement))
            .map(({ pageIndex, pageElement }) => {
                const { top, bottom, left, right } = this.getBoundingCoordinates(parentElement);
                const { viewBottom, currentHeight, viewRight, currentWidth, viewHeight, viewWidth } =
                    this.getElementDimensions(pageElement);

                const hiddenHeight = Math.max(0, top - currentHeight) + Math.max(0, viewBottom - bottom);
                const hiddenWidth = Math.max(0, left - currentWidth) + Math.max(0, viewRight - right);
                const fractionHeight = (viewHeight - hiddenHeight) / viewHeight;
                const fractionWidth = (viewWidth - hiddenWidth) / viewWidth;
                const percent = (fractionHeight * fractionWidth * 100) | 0;
                return {
                    pageIndex,
                    percent,
                };
            })
            .sort(function (a, b) {
                const pc = a.percent - b.percent;

                if (Math.abs(pc) > 0.001) {
                    return -pc;
                }

                return a.pageIndex - b.pageIndex;
            })
            .map((p) => p.pageIndex);
    }
}
