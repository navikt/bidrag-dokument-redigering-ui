export type ScrollDirection = "up" | "down";

export const PDF_MARGIN_PIXELS = 15;
export default class PdfUtils {
    static getPdfContainerElement() {
        return document.querySelector(".pdfviewer_container .pdfrenderer_container");
    }
    static getCanvasSize(containerElement: HTMLElement): {
        height: number;
        width: number;
        canvasHeight: number;
        canvasWidth: number;
    } {
        const canvas = containerElement.querySelector(`.page canvas`) as HTMLCanvasElement;
        return {
            height: canvas.clientHeight,
            width: canvas.clientWidth,
            canvasHeight: canvas.height,
            canvasWidth: canvas.width,
        };
    }
    static getPageElement(containerElement: HTMLDivElement, pageNumber: number) {
        return containerElement.querySelector(`.page[data-page-number="${pageNumber}"]`);
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
