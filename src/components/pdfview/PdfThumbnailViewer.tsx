import "./PdfThumbnail.less";

import React, { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { ReactNode } from "react";

import PdfRenderer from "./PdfRenderer";
import PdfUtils from "./PdfUtils";
import { PageChangedEvent } from "./PdfUtils";
import { PdfDocumentType } from "./types";

const FOCUSED_PAGE_CLASSNAME = "infocus";
type PAGE_SIZE = "default" | "small" | "minimized" | "hidden";
interface PdfThumbnailRendererProps {
    document: PdfDocumentType;
    minimized?: boolean;
    hidden?: boolean;
    onDocumentLoaded: (pagsNumber: number) => void;
    renderPage?: (pageNumber: number, children: ReactNode) => ReactNode;
}
export default function PdfThumbnailViewer({
    minimized,
    hidden,
    document,
    renderPage,
    onDocumentLoaded,
}: PdfThumbnailRendererProps) {
    const currentPageNumber = useRef<number>(1);
    const [pageSize, setPageSize] = useState<PAGE_SIZE>("hidden");
    const containerRef = useRef<HTMLDivElement>();

    useEffect(() => {
        addEventListener(PdfUtils.PAGE_SCROLL_EVENT, (value: CustomEvent<PageChangedEvent>) => {
            scrollPageToView(value.detail.currentPageNumber);
        });
        addEventListener(PdfUtils.PAGE_CHANGE_EVENT, (value: CustomEvent<PageChangedEvent>) => {
            setPageInFocus(value.detail.currentPageNumber);
        });

        const windowWidth = window.innerWidth;
        setPageSize(windowWidth > 1300 ? "default" : "small");
    }, []);

    useEffect(() => {
        if (hidden) {
            setPageSize("hidden");
        } else if (minimized) {
            setPageSize("small");
        } else {
            setPageSize("default");
        }
    }, [minimized, hidden]);

    function getScale() {
        switch (pageSize) {
            case "minimized":
                return 0.05;
            case "small":
                return 0.2;
            case "default":
            case "hidden":
            default:
                return 0.3;
        }
    }
    function scrollPageToView(pageNumber: number) {
        const pageElement = PdfUtils.getPageElement(containerRef.current, pageNumber);
        pageElement.scrollIntoView({ block: "center" });
    }
    function setPageInFocus(pageNumber: number) {
        const currentPage = PdfUtils.getPageElement(containerRef.current, pageNumber);
        if (currentPage && !currentPage?.classList?.contains(FOCUSED_PAGE_CLASSNAME)) {
            currentPage.classList.add(FOCUSED_PAGE_CLASSNAME);
        }

        const prevPage = PdfUtils.getPageElement(containerRef.current, currentPageNumber.current);
        if (
            currentPageNumber.current &&
            currentPageNumber.current != pageNumber &&
            prevPage?.classList?.contains(FOCUSED_PAGE_CLASSNAME)
        ) {
            prevPage.classList.remove(FOCUSED_PAGE_CLASSNAME);
        }

        currentPageNumber.current = pageNumber;
    }

    return (
        <div ref={containerRef} className={`thumbnail_viewer pagesize_${pageSize}`}>
            <PdfRenderer
                id={"thumbnail_pages"}
                renderText={false}
                document={document}
                scale={getScale()}
                onDocumentLoaded={(pagesCount) => {
                    setPageInFocus(1);
                    scrollPageToView(1);
                    onDocumentLoaded(pagesCount);
                }}
                renderPage={(pageNumber: number, pageElement: ReactNode) => {
                    const pageContainer = <PageContainer pageNumber={pageNumber} pageElement={pageElement} />;
                    return renderPage ? renderPage(pageNumber, pageContainer) : pageContainer;
                }}
            />
        </div>
    );
}

interface PdfPageContainerProps {
    pageNumber: number;
    pageElement: ReactNode | Element;
}
const PageContainer = React.memo(({ pageNumber, pageElement }: PdfPageContainerProps) => {
    return (
        <div onClick={() => PdfUtils.focusPageEvent(pageNumber)} className={`thumbnail_page_container`}>
            {/*
            <div className={"thumbnail_background"}></div>
*/}
            <>{pageElement}</>
            <div className={"pagenumber"}>{pageNumber}</div>
        </div>
    );
});

function ThumbnailToolbar() {
    return <div></div>;
}
