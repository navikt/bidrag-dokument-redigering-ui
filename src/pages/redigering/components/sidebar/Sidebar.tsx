import "./Sidebar.css";

import { Checkbox, Heading } from "@navikt/ds-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import PdfDocument, { PdfDocumentRef } from "../../../../components/pdfcore/PdfDocument";
import { usePdfViewerContext } from "../../../../components/pdfviewer/PdfViewerContext";
import { createArrayWithLength } from "../../../../components/utils/ObjectUtils";
import { usePdfEditorContext } from "../PdfEditorContext";
import ThumbnailPageDecorator from "./ThumbnailPageDecorator";

type PAGE_SIZE = "large" | "medium" | "small";

interface PageRangeDetails {
    title?: string;
    range: [number, number];
}
interface SidebarProps {
    onDocumentLoaded?: (pagsNumber: number, pages: number[]) => void;
}
export default function Sidebar({ onDocumentLoaded }: SidebarProps) {
    const { sidebarHidden, dokumentMetadata, hideSidebar } = usePdfEditorContext();
    const containerRef = useRef<HTMLDivElement>();
    const documentRef = useRef<PdfDocumentRef>(null);
    const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
    const { pages, currentPage, file: documentFile } = usePdfViewerContext();

    const documentDetails = dokumentMetadata?.documentDetails ?? [];
    useEffect(() => {
        documentRef.current?.scrollToPage(currentPage);
    }, [currentPage]);

    function _onDocumentLoaded(pagesCount: number, loadedPages: number[]) {
        documentRef.current.scrollToPage(1);
        onDocumentLoaded?.(pagesCount, loadedPages);
        setIsDocumentLoaded(true);
    }

    function getPageRanges(): PageRangeDetails[] {
        const totalPages = documentDetails.reduce((prev, current) => prev + current.antallSider, 0);
        if (documentDetails.length == 0 || totalPages != pages.length) {
            return [{ range: [1, pages.length + 1] }];
        }
        const pageRanges: PageRangeDetails[] = [];
        let lastPageNumber = 1;
        for (const detail of documentDetails) {
            const lastPageInRange = lastPageNumber + detail.antallSider;
            pageRanges.push({ title: detail.tittel, range: [lastPageNumber, lastPageInRange] });
            lastPageNumber = lastPageInRange;
        }

        return pageRanges;
    }

    return (
        <div
            ref={containerRef}
            className={`sidebar_viewer ${sidebarHidden ? "inactive" : "open"}`}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <PdfDocument
                id={"pdf_thumbnail_pages"}
                scale={0.3}
                zoom={false}
                file={documentFile}
                documentRef={documentRef}
                overscanCount={10}
                renderText={false}
                onDocumentLoaded={_onDocumentLoaded}
            >
                <div>
                    <Heading size={"small"} className={"align-middle text-white text-center border-white title "}>
                        Innhold
                    </Heading>
                    {isDocumentLoaded && pages.length > 0 && (
                        <section>
                            {getPageRanges().map((r, index) => (
                                <PageSection title={r.title} pageRange={r.range} index={index} key={r.title + index} />
                            ))}
                        </section>
                    )}
                </div>
            </PdfDocument>
        </div>
    );
}

interface IPageSectionProps {
    title?: string;
    pageRange: [number, number];
    index: number;
}
function PageSection({ title, pageRange, index }: IPageSectionProps) {
    const pagesLength = pageRange[1] - pageRange[0];
    const { toggleDeletedPage, removedPages } = usePdfEditorContext();
    const pagesInSection = useMemo(() => createArrayWithLength(pagesLength, pageRange[0]), [pageRange]);

    const getDeletedPages = () => pagesInSection.filter((pageNumber) => removedPages.includes(pageNumber));
    const getNotDeletedPages = () => pagesInSection.filter((pageNumber) => !removedPages.includes(pageNumber));

    const isAllPagesDeleted = pagesInSection.length == getDeletedPages().length;
    const isSomePagesDeleted = getDeletedPages().length > 0 && pagesInSection.length > getDeletedPages().length;
    function toggleDeletePages() {
        if (isAllPagesDeleted) {
            getDeletedPages().forEach(toggleDeletedPage);
        } else {
            getNotDeletedPages().filter(toggleDeletedPage);
        }
    }
    return (
        <>
            {title && (
                <div className={"pl-3 pagesection"} style={{ top: `${30 * index * 0 + 25}px` }}>
                    <Checkbox
                        onClick={toggleDeletePages}
                        checked={getDeletedPages().length == 0}
                        indeterminate={isSomePagesDeleted}
                        size={"small"}
                        className={"checkbox"}
                    >
                        <Heading size={"xsmall"} style={{ color: "white" }} className={"ml-2 page-section-title"}>
                            {title}
                        </Heading>
                    </Checkbox>
                </div>
            )}
            <div className={"pt-2"}>
                {pagesInSection.map((pagenumber) => (
                    <ThumbnailPageDecorator pageNumber={pagenumber} key={"ThumbnailPageDecorator_" + pagenumber} />
                ))}
            </div>
        </>
    );
}