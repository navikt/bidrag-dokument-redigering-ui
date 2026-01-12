import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import {
    $deleteTableColumnAtSelection,
    $deleteTableRowAtSelection,
    $getTableCellNodeFromLexicalNode,
    $getTableNodeFromLexicalNodeOrThrow,
    $insertTableColumnAtSelection,
    $insertTableRowAtSelection,
    $isTableCellNode,
    $isTableSelection,
    getTableElement,
    getTableObserverFromTableElement,
    TableCellNode,
} from "@lexical/table";
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_LOW } from "lexical";
import { mergeRegister } from "@lexical/utils";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface TableCellActionMenuProps {
    tableCellNode: TableCellNode;
    onClose: () => void;
    anchorPosition: { x: number; y: number };
}

function TableCellActionMenu({ tableCellNode, onClose, anchorPosition }: TableCellActionMenuProps) {
    const [editor] = useLexicalComposerContext();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const insertRowAbove = useCallback(() => {
        editor.update(() => {
            $insertTableRowAtSelection(false);
        });
        onClose();
    }, [editor, onClose]);

    const insertRowBelow = useCallback(() => {
        editor.update(() => {
            $insertTableRowAtSelection(true);
        });
        onClose();
    }, [editor, onClose]);

    const insertColumnBefore = useCallback(() => {
        editor.update(() => {
            $insertTableColumnAtSelection(false);
        });
        onClose();
    }, [editor, onClose]);

    const insertColumnAfter = useCallback(() => {
        editor.update(() => {
            $insertTableColumnAtSelection(true);
        });
        onClose();
    }, [editor, onClose]);

    const deleteRow = useCallback(() => {
        editor.update(() => {
            $deleteTableRowAtSelection();
        });
        onClose();
    }, [editor, onClose]);

    const deleteColumn = useCallback(() => {
        editor.update(() => {
            $deleteTableColumnAtSelection();
        });
        onClose();
    }, [editor, onClose]);

    const deleteTable = useCallback(() => {
        editor.update(() => {
            const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
            tableNode.remove();
        });
        onClose();
    }, [editor, tableCellNode, onClose]);

    return createPortal(
        <div
            ref={menuRef}
            className="table-action-menu"
            style={{
                position: "fixed",
                left: anchorPosition.x,
                top: anchorPosition.y,
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                zIndex: 1000,
                minWidth: "180px",
                padding: "4px 0",
            }}
        >
            <div style={{ padding: "4px 12px", fontSize: "11px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>
                Rows
            </div>
            <button className="table-action-menu-item" onClick={insertRowAbove}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                </svg>
                Insert row above
            </button>
            <button className="table-action-menu-item" onClick={insertRowBelow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <polyline points="19 12 12 19 5 12" />
                </svg>
                Insert row below
            </button>
            <button className="table-action-menu-item table-action-menu-item-danger" onClick={deleteRow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete row
            </button>

            <div style={{ borderTop: "1px solid #e0e0e0", margin: "4px 0" }} />
            
            <div style={{ padding: "4px 12px", fontSize: "11px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>
                Columns
            </div>
            <button className="table-action-menu-item" onClick={insertColumnBefore}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 5 5 12 12 19" />
                </svg>
                Insert column left
            </button>
            <button className="table-action-menu-item" onClick={insertColumnAfter}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 19 19 12 12 5" />
                </svg>
                Insert column right
            </button>
            <button className="table-action-menu-item table-action-menu-item-danger" onClick={deleteColumn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete column
            </button>

            <div style={{ borderTop: "1px solid #e0e0e0", margin: "4px 0" }} />
            
            <button className="table-action-menu-item table-action-menu-item-danger" onClick={deleteTable}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                </svg>
                Delete table
            </button>
        </div>,
        document.body
    );
}

interface TableActionButtonProps {
    tableCellNode: TableCellNode;
    anchorElem: HTMLElement;
}

function TableActionButton({ tableCellNode, anchorElem }: TableActionButtonProps) {
    const [editor] = useLexicalComposerContext();
    const [showMenu, setShowMenu] = useState(false);
    const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const updatePosition = () => {
            const cellElement = editor.getElementByKey(tableCellNode.getKey());
            if (cellElement) {
                const cellRect = cellElement.getBoundingClientRect();
                setButtonPosition({
                    x: cellRect.right - 24,
                    y: cellRect.top + 4,
                });
            }
        };

        updatePosition();
        const observer = new ResizeObserver(updatePosition);
        observer.observe(anchorElem);

        return () => observer.disconnect();
    }, [editor, tableCellNode, anchorElem]);

    const handleClick = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                x: rect.left,
                y: rect.bottom + 4,
            });
        }
        setShowMenu(!showMenu);
    };

    return (
        <>
            <button
                ref={buttonRef}
                className="table-cell-action-button"
                style={{
                    position: "fixed",
                    left: buttonPosition.x,
                    top: buttonPosition.y,
                    width: "20px",
                    height: "20px",
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 100,
                    padding: 0,
                }}
                onClick={handleClick}
                title="Table options"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#666">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                </svg>
            </button>
            {showMenu && (
                <TableCellActionMenu
                    tableCellNode={tableCellNode}
                    onClose={() => setShowMenu(false)}
                    anchorPosition={menuPosition}
                />
            )}
        </>
    );
}

export default function TableActionMenuPlugin({ anchorElem }: { anchorElem: HTMLElement }) {
    const [editor] = useLexicalComposerContext();
    const isEditable = useLexicalEditable();
    const [tableCellNode, setTableCellNode] = useState<TableCellNode | null>(null);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
                        const anchorNode = selection.anchor.getNode();
                        const cellNode = $getTableCellNodeFromLexicalNode(anchorNode);
                        setTableCellNode(cellNode);
                    } else {
                        setTableCellNode(null);
                    }
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
                        const anchorNode = selection.anchor.getNode();
                        const cellNode = $getTableCellNodeFromLexicalNode(anchorNode);
                        setTableCellNode(cellNode);
                    } else {
                        setTableCellNode(null);
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW
            )
        );
    }, [editor]);

    if (!isEditable || !tableCellNode) {
        return null;
    }

    return <TableActionButton tableCellNode={tableCellNode} anchorElem={anchorElem} />;
}
