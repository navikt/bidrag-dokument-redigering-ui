import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode, $createHeadingNode, HeadingTagType } from "@lexical/rich-text";
import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
    $isListNode,
    ListNode,
} from "@lexical/list";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    $isRootOrShadowRoot,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    FORMAT_TEXT_COMMAND,
    LexicalEditor,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
} from "lexical";
import React, { MutableRefObject, useCallback, useEffect, useState } from "react";

interface EditorToolbarProps {
    onSave?: () => void;
    isSaving?: boolean;
    editorRef?: MutableRefObject<LexicalEditor | null>;
}

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

const HEADING_OPTIONS: { label: string; value: HeadingTagType | "paragraph" }[] = [
    { label: "Normal", value: "paragraph" },
    { label: "Heading 1", value: "h1" },
    { label: "Heading 2", value: "h2" },
    { label: "Heading 3", value: "h3" },
    { label: "Heading 4", value: "h4" },
    { label: "Heading 5", value: "h5" },
];

export default function EditorToolbar({ onSave, isSaving, editorRef }: EditorToolbarProps) {
    const [editor] = useLexicalComposerContext();
    
    // Formatting state
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    
    // History state
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    
    // Block type state
    const [blockType, setBlockType] = useState<string>("paragraph");

    // Store editor reference
    useEffect(() => {
        if (editorRef) {
            editorRef.current = editor;
        }
    }, [editor, editorRef]);

    // Update toolbar state based on selection
    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            // Update text format buttons
            setIsBold(selection.hasFormat("bold"));
            setIsItalic(selection.hasFormat("italic"));
            setIsUnderline(selection.hasFormat("underline"));
            setIsStrikethrough(selection.hasFormat("strikethrough"));

            // Update block type
            const anchorNode = selection.anchor.getNode();
            let element =
                anchorNode.getKey() === "root"
                    ? anchorNode
                    : $findMatchingParent(anchorNode, (e) => {
                          const parent = e.getParent();
                          return parent !== null && $isRootOrShadowRoot(parent);
                      });

            if (element === null) {
                element = anchorNode.getTopLevelElementOrThrow();
            }

            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);

            if (elementDOM !== null) {
                if ($isListNode(element)) {
                    const parentList = $findMatchingParent(anchorNode, $isListNode);
                    const type = parentList
                        ? (parentList as ListNode).getListType()
                        : (element as ListNode).getListType();
                    setBlockType(type);
                } else {
                    const type = $isHeadingNode(element)
                        ? element.getTag()
                        : element.getType();
                    setBlockType(type);
                }
            }
        }
    }, [editor]);

    // Register listeners
    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateToolbar();
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL
            )
        );
    }, [editor, updateToolbar]);

    // Format handlers
    const formatBold = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
    };

    const formatItalic = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
    };

    const formatUnderline = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
    };

    const formatStrikethrough = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
    };

    const handleUndo = () => {
        editor.dispatchCommand(UNDO_COMMAND, undefined);
    };

    const handleRedo = () => {
        editor.dispatchCommand(REDO_COMMAND, undefined);
    };

    const formatHeading = (headingType: HeadingTagType | "paragraph") => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                if (headingType === "paragraph") {
                    $setBlocksType(selection, () => $createParagraphNode());
                } else {
                    $setBlocksType(selection, () => $createHeadingNode(headingType));
                }
            }
        });
    };

    const formatBulletList = () => {
        if (blockType !== "bullet") {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
    };

    const formatNumberedList = () => {
        if (blockType !== "number") {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
    };

    // Table state
    const [showTablePicker, setShowTablePicker] = useState(false);
    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(3);

    const insertTable = (rows: number, cols: number) => {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: String(rows), columns: String(cols) });
        setShowTablePicker(false);
    };

    return (
        <div className="lexical-editor-toolbar">
            {/* Undo/Redo */}
            <div className="lexical-editor-toolbar-group">
                <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    title="Undo (Ctrl+Z)"
                    aria-label="Undo"
                >
                    ↶
                </button>
                <button
                    onClick={handleRedo}
                    disabled={!canRedo}
                    title="Redo (Ctrl+Y)"
                    aria-label="Redo"
                >
                    ↷
                </button>
            </div>

            <div className="lexical-editor-toolbar-divider" />

            {/* Block type selector */}
            <div className="lexical-editor-toolbar-group">
                <select
                    value={blockType}
                    onChange={(e) => formatHeading(e.target.value as HeadingTagType | "paragraph")}
                    aria-label="Block type"
                >
                    {HEADING_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="lexical-editor-toolbar-divider" />

            {/* Text formatting */}
            <div className="lexical-editor-toolbar-group">
                <button
                    onClick={formatBold}
                    className={isBold ? "active" : ""}
                    title="Bold (Ctrl+B)"
                    aria-label="Bold"
                >
                    <strong>B</strong>
                </button>
                <button
                    onClick={formatItalic}
                    className={isItalic ? "active" : ""}
                    title="Italic (Ctrl+I)"
                    aria-label="Italic"
                >
                    <em>I</em>
                </button>
                <button
                    onClick={formatUnderline}
                    className={isUnderline ? "active" : ""}
                    title="Underline (Ctrl+U)"
                    aria-label="Underline"
                >
                    <u>U</u>
                </button>
                <button
                    onClick={formatStrikethrough}
                    className={isStrikethrough ? "active" : ""}
                    title="Strikethrough"
                    aria-label="Strikethrough"
                >
                    <s>S</s>
                </button>
            </div>

            <div className="lexical-editor-toolbar-divider" />

            {/* Lists */}
            <div className="lexical-editor-toolbar-group">
                <button
                    onClick={formatBulletList}
                    className={blockType === "bullet" ? "active" : ""}
                    title="Bullet List"
                    aria-label="Bullet List"
                >
                    •
                </button>
                <button
                    onClick={formatNumberedList}
                    className={blockType === "number" ? "active" : ""}
                    title="Numbered List"
                    aria-label="Numbered List"
                >
                    1.
                </button>
            </div>

            <div className="lexical-editor-toolbar-divider" />

            {/* Table */}
            <div className="lexical-editor-toolbar-group" style={{ position: "relative" }}>
                <button
                    onClick={() => setShowTablePicker(!showTablePicker)}
                    title="Insert Table"
                    aria-label="Insert Table"
                >
                    ⊞
                </button>
                {showTablePicker && (
                    <div
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            backgroundColor: "#fff",
                            border: "1px solid #e0e0e0",
                            borderRadius: "4px",
                            padding: "12px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            zIndex: 100,
                            minWidth: "200px",
                        }}
                    >
                        <div style={{ marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                            Insert Table
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                            <div>
                                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>
                                    Rows
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={tableRows}
                                    onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                                    style={{
                                        width: "60px",
                                        padding: "4px 8px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>
                                    Columns
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={tableCols}
                                    onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                                    style={{
                                        width: "60px",
                                        padding: "4px 8px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                onClick={() => insertTable(tableRows, tableCols)}
                                style={{
                                    flex: 1,
                                    padding: "6px 12px",
                                    backgroundColor: "#1976d2",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                }}
                            >
                                Insert
                            </button>
                            <button
                                onClick={() => setShowTablePicker(false)}
                                style={{
                                    padding: "6px 12px",
                                    backgroundColor: "#f0f0f0",
                                    color: "#333",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                        {/* Quick grid picker */}
                        <div style={{ marginTop: "12px", borderTop: "1px solid #e0e0e0", paddingTop: "12px" }}>
                            <div style={{ fontSize: "12px", marginBottom: "8px", color: "#666" }}>
                                Quick select:
                            </div>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(5, 20px)",
                                    gap: "2px",
                                }}
                            >
                                {[...Array(5)].map((_, rowIndex) =>
                                    [...Array(5)].map((_, colIndex) => (
                                        <div
                                            key={`${rowIndex}-${colIndex}`}
                                            onClick={() => insertTable(rowIndex + 1, colIndex + 1)}
                                            onMouseEnter={() => {
                                                setTableRows(rowIndex + 1);
                                                setTableCols(colIndex + 1);
                                            }}
                                            style={{
                                                width: "18px",
                                                height: "18px",
                                                border: "1px solid #ccc",
                                                borderRadius: "2px",
                                                cursor: "pointer",
                                                backgroundColor:
                                                    rowIndex < tableRows && colIndex < tableCols
                                                        ? "#1976d2"
                                                        : "#fff",
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                            <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
                                {tableRows} × {tableCols}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="lexical-editor-toolbar-divider" />

            {/* Save button */}
            {onSave && (
                <div className="lexical-editor-toolbar-group">
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        title="Save (Ctrl+S)"
                        aria-label="Save"
                        style={{ 
                            backgroundColor: "#1976d2", 
                            color: "white",
                            width: "auto",
                            padding: "0 12px"
                        }}
                    >
                        {isSaving ? "Saving..." : "💾 Save"}
                    </button>
                </div>
            )}
        </div>
    );
}
