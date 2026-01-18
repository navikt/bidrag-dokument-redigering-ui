import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getTableCellNodeFromLexicalNode, $isTableCellNode, $isTableNode } from "@lexical/table";
import { $getNodeByKey, $isTextNode } from "lexical";
import React, { useEffect, useRef, useState } from "react";

interface ResizeHandle {
    type: "column" | "row";
    element: HTMLElement;
    cellIndex?: number;
    rowIndex?: number;
}

export function TableResizeHandlesPlugin() {
    const [editor] = useLexicalComposerContext();
    const containerRef = useRef<HTMLDivElement>(null);
    const resizeHandlesRef = useRef<Map<HTMLElement, ResizeHandle[]>>(new Map());
    const activeResizeRef = useRef<{
        handle: ResizeHandle;
        startX: number;
        startY: number;
        initialColWidth?: number;
        initialRowHeight?: number;
        table: HTMLTableElement;
    } | null>(null);

    // Inject CSS styles
    useEffect(() => {
        const styleElement = document.createElement("style");
        styleElement.textContent = `.table-resize-handle {
    position: absolute;
    background-color: #2563eb;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 100;
}

.table-resize-handle:hover,
.table-resize-handle.active {
    opacity: 1;
}

.table-resize-handle-column {
    right: -4px;
    top: 0;
    bottom: 0;
    width: 8px;
    cursor: col-resize;
}

.table-resize-handle-column:hover {
    background-color: #1d4ed8;
}

.table-resize-handle-row {
    bottom: -4px;
    left: 0;
    right: 0;
    height: 8px;
    cursor: row-resize;
}

.table-resize-handle-row:hover {
    background-color: #1d4ed8;
}

table td:hover .table-resize-handle-column,
table th:hover .table-resize-handle-column,
table tr:hover .table-resize-handle-row {
    opacity: 0.6;
}

.table-resize-handle.resizing {
    opacity: 1;
    background-color: #dc2626;
}`;
        document.head.appendChild(styleElement);
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    useEffect(() => {
        const updateTableHandles = () => {
            const editorDiv = document.querySelector("[contenteditable='true']") as HTMLElement;
            if (!editorDiv) return;

            const tables = editorDiv.querySelectorAll("table");
            tables.forEach((table: HTMLTableElement) => {
                addResizeHandles(table);
            });
        };

        const timer = setTimeout(updateTableHandles, 0);

        const unsubscribe = editor.registerUpdateListener(() => {
            updateTableHandles();
        });

        return () => {
            clearTimeout(timer);
            unsubscribe();
        };
    }, [editor]);

    const addResizeHandles = (table: HTMLTableElement) => {
        if (resizeHandlesRef.current.has(table)) {
            return;
        }

        const rows = Array.from(table.querySelectorAll("tbody tr")) as HTMLTableRowElement[];
        const handles: ResizeHandle[] = [];

        // Add column resize handles
        if (rows.length > 0) {
            const firstRow = rows[0];
            const cells = Array.from(firstRow.querySelectorAll("td, th")) as HTMLTableCellElement[];

            cells.forEach((cell, cellIndex) => {
                if (cellIndex < cells.length - 1) {
                    const handle = document.createElement("div");
                    handle.className = "table-resize-handle table-resize-handle-column";
                    handle.title = "Drag to resize column";
                    cell.style.position = "relative";
                    cell.appendChild(handle);

                    handles.push({
                        type: "column",
                        element: handle,
                        cellIndex,
                    });

                    attachColumnResizeListener(handle, table, cellIndex, cell, editor);
                }
            });
        }

        // Add row resize handles
        rows.forEach((row, rowIndex) => {
            const handle = document.createElement("div");
            handle.className = "table-resize-handle table-resize-handle-row";
            handle.title = "Drag to resize row";

            const firstCell = row.querySelector("td, th") as HTMLTableCellElement;
            if (firstCell) {
                firstCell.style.position = "relative";
                firstCell.appendChild(handle);

                handles.push({
                    type: "row",
                    element: handle,
                    rowIndex,
                });

                attachRowResizeListener(handle, table, rowIndex, row, editor);
            }
        });

        resizeHandlesRef.current.set(table, handles);
    };

    const attachColumnResizeListener = (
        handle: HTMLElement,
        table: HTMLTableElement,
        cellIndex: number,
        cell: HTMLTableCellElement,
        editor: any
    ) => {
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;

        const handleMouseDown = (e: MouseEvent) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = cell.offsetWidth;
            e.preventDefault();

            const handleMouseMove = (moveEvent: MouseEvent) => {
                if (!isResizing) return;

                const diff = moveEvent.clientX - startX;
                const newWidth = Math.max(30, startWidth + diff);

                const rows = Array.from(table.querySelectorAll("tbody tr")) as HTMLTableRowElement[];
                rows.forEach((row) => {
                    const cells = Array.from(row.querySelectorAll("td, th")) as HTMLTableCellElement[];
                    if (cells[cellIndex]) {
                        cells[cellIndex].style.width = `${newWidth}px`;
                        cells[cellIndex].style.minWidth = `${newWidth}px`;
                    }
                });
            };

            const handleMouseUp = () => {
                isResizing = false;
                editor.update(() => {
                    const rows = Array.from(table.querySelectorAll("tbody tr")) as HTMLTableRowElement[];
                    rows.forEach((row) => {
                        const cells = Array.from(row.querySelectorAll("td, th")) as HTMLTableCellElement[];
                        if (cells[cellIndex]) {
                            const newWidth = parseInt(cells[cellIndex].style.width) || cells[cellIndex].offsetWidth;
                        }
                    });
                });
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        };

        handle.addEventListener("mousedown", handleMouseDown);
    };

    const attachRowResizeListener = (
        handle: HTMLElement,
        table: HTMLTableElement,
        rowIndex: number,
        row: HTMLTableRowElement,
        editor: any
    ) => {
        let isResizing = false;
        let startY = 0;
        let startHeight = 0;

        const handleMouseDown = (e: MouseEvent) => {
            isResizing = true;
            startY = e.clientY;
            startHeight = row.offsetHeight;
            e.preventDefault();

            const handleMouseMove = (moveEvent: MouseEvent) => {
                if (!isResizing) return;

                const diff = moveEvent.clientY - startY;
                const newHeight = Math.max(20, startHeight + diff);

                row.style.height = `${newHeight}px`;
            };

            const handleMouseUp = () => {
                isResizing = false;
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        };

        handle.addEventListener("mousedown", handleMouseDown);
    };

    return <div ref={containerRef} />;
}
