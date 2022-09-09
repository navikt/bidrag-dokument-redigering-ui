import "./ThumbnailPageDecorator.less";

import { AddCircleFilled, DeleteFilled } from "@navikt/ds-icons";
import React, { CSSProperties, PropsWithChildren, useRef, useState } from "react";

import { usePdfEditorContext } from "./PdfEditorContext";

interface ThumbnailPageDecoratorProps extends PropsWithChildren<unknown> {
    pageNumber: number;
    isLoading: boolean;
}

export default function ThumbnailPageDecorator({ children, pageNumber, isLoading }: ThumbnailPageDecoratorProps) {
    const decoratorRef = useRef<HTMLDivElement>();
    const { removedPages, toggleDeletedPage } = usePdfEditorContext();
    const isDeleted = removedPages.includes(pageNumber);
    const [mouseOver, setMouseOver] = useState(false);

    return (
        <div
            onMouseOver={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            ref={decoratorRef}
            className={`thumbnail_decorator ${isDeleted ? "deleted" : ""}`}
        >
            {children}
            <ThumbnailPageToolbar
                hidden={!mouseOver}
                onToggleDelete={() => toggleDeletedPage(pageNumber)}
                isDeleted={isDeleted}
            />
        </div>
    );
}

interface ThumbnailPageToolbarProps {
    isDeleted: boolean;
    hidden?: boolean;
    onToggleDelete: () => void;
}
function ThumbnailPageToolbar({ hidden, isDeleted, onToggleDelete }: ThumbnailPageToolbarProps) {
    return (
        <div className={`thumbnail_toolbar ${hidden ? "invisible" : ""}`}>
            <div
                className={"bg-white border-solid border border-slate-400 inline-flex rounded-md shadow-sm "}
                role={"group"}
            >
                {!isDeleted && (
                    <>
                        <ToolbarButton
                            onClick={onToggleDelete}
                            className={"rounded-md"}
                            style={{ color: "var(--navds-global-color-nav-red)" }}
                            position={"center"}
                        >
                            <DeleteFilled />
                        </ToolbarButton>
                    </>
                )}
                {isDeleted && (
                    <ToolbarButton
                        onClick={onToggleDelete}
                        style={{ color: "var(--navds-global-color-green-500)" }}
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
