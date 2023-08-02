import "./ThumbnailPageDecorator.css";

import { AddCircleFilled, DeleteFilled } from "@navikt/ds-icons";
import React, { CSSProperties, PropsWithChildren, useRef, useState } from "react";

import { useMaskingContainer } from "../../../../components/masking/MaskingContainer";
import MaskingItem from "../../../../components/masking/MaskingItem";
import PdfPage from "../../../../components/pdfcore/PdfPage";
import { usePdfViewerContext } from "../../../../components/pdfviewer/PdfViewerContext";
import { usePdfEditorContext } from "../PdfEditorContext";

interface ThumbnailPageDecoratorProps extends PropsWithChildren<unknown> {
    pageNumber: number;
}

export default function ThumbnailPageDecorator({ pageNumber }: ThumbnailPageDecoratorProps) {
    const decoratorRef = useRef<HTMLDivElement>();
    const { removedPages, toggleDeletedPage, mode } = usePdfEditorContext();
    const { currentPage, onPageChange } = usePdfViewerContext();
    const isDeleted = removedPages.includes(pageNumber);
    const [mouseOver, setMouseOver] = useState(false);
    const isEnabled = mode == "remove_pages_only" || mode == "edit";
    return (
        <div
            onMouseOver={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            ref={decoratorRef}
            className={`thumbnail_decorator ${isDeleted ? "deleted" : ""}`}
        >
            <PageContainer
                pageNumber={pageNumber}
                currentPage={currentPage}
                index={pageNumber - 1}
                key={"pagesection_" + (pageNumber - 1)}
                onPageClick={onPageChange}
            />

            {isEnabled && (
                <ThumbnailPageToolbar
                    hidden={!mouseOver}
                    onToggleDelete={() => toggleDeletedPage(pageNumber)}
                    isDeleted={isDeleted}
                />
            )}
        </div>
    );
}

interface PdfPageContainerProps {
    pageNumber: number;
    currentPage: number;
    onPageClick: (pageNumber: number) => void;
    index: number;
}
const PageContainer = ({ pageNumber, onPageClick, index, currentPage }: PdfPageContainerProps) => {
    const { items } = useMaskingContainer();
    const id = `thumbnail_page_${pageNumber}`;
    return (
        <div
            onClick={() => onPageClick(pageNumber)}
            className={`thumbnail_page_container ${currentPage == pageNumber ? "infocus" : ""}`}
        >
            <PdfPage pageNumber={pageNumber} index={index} key={"tpage_index_" + index}>
                {items
                    .filter((item) => item.pageNumber == pageNumber)
                    .map((item, index) => (
                        <MaskingItem
                            disabled
                            {...item}
                            id={id + "_" + item.id}
                            scale={0.3}
                            key={id + "_" + item.id + index}
                        />
                    ))}
            </PdfPage>
            <div className={"pagenumber"}>{pageNumber}</div>
        </div>
    );
};

interface ThumbnailPageToolbarProps {
    isDeleted: boolean;
    hidden?: boolean;
    onToggleDelete: () => void;
}
function ThumbnailPageToolbar({ hidden, isDeleted, onToggleDelete }: ThumbnailPageToolbarProps) {
    const { isAllowedToDeletePage } = usePdfEditorContext();
    return (
        <div className={`thumbnail_toolbar ${hidden ? "invisible" : ""}`}>
            <div
                className={
                    "bg-white border-solid border border-border-default inline-flex rounded-md shadow-sm hover:border-border-strong"
                }
                role={"group"}
            >
                {!isDeleted && isAllowedToDeletePage() && (
                    <>
                        <ToolbarButton
                            onClick={onToggleDelete}
                            className={"rounded-md text-surface-danger hover:text-surface-danger-hover"}
                            position={"center"}
                        >
                            <DeleteFilled />
                        </ToolbarButton>
                    </>
                )}
                {isDeleted && (
                    <ToolbarButton
                        onClick={onToggleDelete}
                        className="text-surface-success hover:text-surface-success-hover"
                        position={"center"}
                    >
                        <AddCircleFilled />
                    </ToolbarButton>
                )}
            </div>
        </div>
    );
}

interface ToolbarButtonProps {
    position: "left" | "right" | "center";
    style?: CSSProperties;
    onClick?: () => void;
    className?: string;
}
function ToolbarButton({ children, position, style, onClick, className }: PropsWithChildren<ToolbarButtonProps>) {
    function getStyles() {
        switch (position) {
            case "center":
                return "border-t-0 border-b-0 border-l-0 border-r-0";
            case "left":
                return "border-t-0 border-b-0 border-l-2 border-r-0 rounded-l-md";
            case "right":
                return "border-t-0 border-b-0 border-l-0 border-r-2 rounded-r-md";
        }
        return "";
    }
    return (
        <button
            onClick={onClick}
            style={style}
            type="button"
            className={`${className} cursor-pointer z-[100] bg-transparent py-2 px-3 text-sm font-medium text-white-900 hover:bg-slate-200 border-gray-200 shadow-slate-200 shadow-inner ${getStyles()}`}
        >
            {children}
        </button>
    );
}
