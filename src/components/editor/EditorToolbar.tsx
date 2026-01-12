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
import { $setBlocksType, $patchStyleText } from "@lexical/selection";
import { $findMatchingParent, mergeRegister, $getNearestNodeOfType } from "@lexical/utils";
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    $isRootOrShadowRoot,
    $isTextNode,
    $isElementNode,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    LexicalEditor,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
    ElementFormatType,
} from "lexical";
import React, { MutableRefObject, useCallback, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface EditorToolbarProps {
    onSave?: () => void;
    isSaving?: boolean;
    editorRef?: MutableRefObject<LexicalEditor | null>;
    onPreviewPdf?: () => void;
}

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 72;
const DEFAULT_FONT_SIZE = 12;

const HEADING_OPTIONS: { label: string; value: HeadingTagType | "paragraph" }[] = [
    { label: "Normal", value: "paragraph" },
    { label: "Heading 1", value: "h1" },
    { label: "Heading 2", value: "h2" },
    { label: "Heading 3", value: "h3" },
    { label: "Heading 4", value: "h4" },
    { label: "Heading 5", value: "h5" },
];

// Calculate next font size based on increment/decrement
const calculateNextFontSize = (currentSize: number, type: "increment" | "decrement"): number => {
    if (type === "decrement") {
        if (currentSize > 48) return currentSize - 12;
        if (currentSize >= 24) return currentSize - 4;
        if (currentSize >= 14) return currentSize - 2;
        return Math.max(MIN_FONT_SIZE, currentSize - 1);
    } else {
        if (currentSize < 14) return currentSize + 1;
        if (currentSize < 24) return currentSize + 2;
        if (currentSize < 48) return currentSize + 4;
        return Math.min(MAX_FONT_SIZE, currentSize + 12);
    }
};

export default function EditorToolbar({ onSave, isSaving, editorRef, onPreviewPdf }: EditorToolbarProps) {
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

    // Font size state
    const [fontSize, setFontSize] = useState<string>(`${DEFAULT_FONT_SIZE}`);
    const [fontSizeInputValue, setFontSizeInputValue] = useState<string>(`${DEFAULT_FONT_SIZE}`);

    // Alignment state
    const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");

    // Font color state
    const [fontColor, setFontColor] = useState<string>("#000000");
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [colorPickerPosition, setColorPickerPosition] = useState({ top: 0, left: 0 });
    const colorButtonRef = useRef<HTMLButtonElement>(null);

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

            // Get font size from selection
            const nodes = selection.getNodes();
            let currentFontSize = `${DEFAULT_FONT_SIZE}`;
            if (nodes.length > 0) {
                const firstNode = nodes[0];
                if ($isTextNode(firstNode)) {
                    const style = firstNode.getStyle();
                    const fontSizeMatch = style.match(/font-size:\s*(\d+(?:\.\d+)?)(px|pt)?/);
                    if (fontSizeMatch) {
                        let size = parseFloat(fontSizeMatch[1]);
                        const unit = fontSizeMatch[2] || "px";
                        // Convert pt to px (1pt ≈ 1.333px)
                        if (unit === "pt") {
                            size = Math.round(size * 1.333);
                        }
                        currentFontSize = String(Math.round(size));
                    } else {
                        // No inline style, try to get computed style from DOM
                        const nodeKey = firstNode.getKey();
                        const domElement = editor.getElementByKey(nodeKey);
                        if (domElement) {
                            const computedStyle = window.getComputedStyle(domElement);
                            const computedFontSize = computedStyle.fontSize;
                            if (computedFontSize) {
                                currentFontSize = String(Math.round(parseFloat(computedFontSize)));
                            }
                        }
                    }
                } else {
                    // For non-text nodes, try to get computed style from the parent element
                    const anchorNode = selection.anchor.getNode();
                    const topElement = anchorNode.getTopLevelElement();
                    if (topElement) {
                        const domElement = editor.getElementByKey(topElement.getKey());
                        if (domElement) {
                            const computedStyle = window.getComputedStyle(domElement);
                            const computedFontSize = computedStyle.fontSize;
                            if (computedFontSize) {
                                currentFontSize = String(Math.round(parseFloat(computedFontSize)));
                            }
                        }
                    }
                }
            }
            setFontSize(currentFontSize);
            setFontSizeInputValue(currentFontSize);

            // Get font color from selection
            let currentFontColor = "#000000";
            if (nodes.length > 0) {
                const firstNode = nodes[0];
                if ($isTextNode(firstNode)) {
                    const style = firstNode.getStyle();
                    const colorMatch = style.match(/(?:^|;)\s*color:\s*([^;]+)/i);
                    if (colorMatch) {
                        currentFontColor = colorMatch[1].trim();
                    } else {
                        // Try to get from DOM computed style
                        const nodeKey = firstNode.getKey();
                        const domElement = editor.getElementByKey(nodeKey);
                        if (domElement) {
                            const computedStyle = window.getComputedStyle(domElement);
                            const computedColor = computedStyle.color;
                            if (computedColor) {
                                // Convert rgb to hex
                                const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                                if (rgbMatch) {
                                    const r = parseInt(rgbMatch[1]);
                                    const g = parseInt(rgbMatch[2]);
                                    const b = parseInt(rgbMatch[3]);
                                    currentFontColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                                }
                            }
                        }
                    }
                }
            }
            setFontColor(currentFontColor);

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
                    const type = $isHeadingNode(element) ? element.getTag() : element.getType();
                    setBlockType(type);
                }
            }

            // Get element format (alignment)
            if ($isElementNode(element)) {
                const elementFormat = element.getFormatType() ?? "left";
                setElementFormat(elementFormat as ElementFormatType);
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

    // Close color picker when clicking outside
    useEffect(() => {
        if (!showColorPicker) return;
        
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.color-picker-dropdown') && !target.closest('[aria-label="Text color"]')) {
                setShowColorPicker(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showColorPicker]);

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

    // Font size handlers
    const updateFontSizeInSelection = (newSize: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, {
                    "font-size": newSize + "px",
                });
            }
        });
    };

    const handleFontSizeDecrement = () => {
        const currentSize = parseInt(fontSize) || DEFAULT_FONT_SIZE;
        const nextSize = calculateNextFontSize(currentSize, "decrement");
        setFontSize(String(nextSize));
        setFontSizeInputValue(String(nextSize));
        updateFontSizeInSelection(String(nextSize));
    };

    const handleFontSizeIncrement = () => {
        const currentSize = parseInt(fontSize) || DEFAULT_FONT_SIZE;
        const nextSize = calculateNextFontSize(currentSize, "increment");
        setFontSize(String(nextSize));
        setFontSizeInputValue(String(nextSize));
        updateFontSizeInSelection(String(nextSize));
    };

    const handleFontSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFontSizeInputValue(e.target.value);
    };

    const handleFontSizeInputBlur = () => {
        let size = parseInt(fontSizeInputValue);
        if (isNaN(size) || size < MIN_FONT_SIZE) {
            size = MIN_FONT_SIZE;
        } else if (size > MAX_FONT_SIZE) {
            size = MAX_FONT_SIZE;
        }
        setFontSize(String(size));
        setFontSizeInputValue(String(size));
        updateFontSizeInSelection(String(size));
    };

    const handleFontSizeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleFontSizeInputBlur();
            e.preventDefault();
        }
    };

    // Alignment handlers
    const formatAlignment = (alignment: ElementFormatType) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
    };

    // Font color handlers
    const handleColorChange = (color: string) => {
        setFontColor(color);
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, {
                    color: color,
                });
            }
        });
    };

    const PRESET_COLORS = [
        "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
        "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
        "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
        "#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd",
        "#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#6fa8dc", "#8e7cc3", "#c27ba0",
        "#a61c00", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#3d85c6", "#674ea7", "#a64d79",
        "#85200c", "#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#0b5394", "#351c75", "#741b47",
        "#5b0f00", "#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#1c4587", "#073763", "#20124d", "#4c1130",
    ];

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
                    className="toolbar-item"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 14L4 9l5-5" />
                        <path d="M4 9h11a4 4 0 1 1 0 8h-1" />
                    </svg>
                </button>
                <button
                    onClick={handleRedo}
                    disabled={!canRedo}
                    title="Redo (Ctrl+Y)"
                    aria-label="Redo"
                    className="toolbar-item"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 14l5-5-5-5" />
                        <path d="M20 9H9a4 4 0 1 0 0 8h1" />
                    </svg>
                </button>
            </div>

            <div className="lexical-editor-toolbar-divider" />

            {/* Block type selector */}
            <div className="lexical-editor-toolbar-group">
                <select
                    value={blockType}
                    onChange={(e) => formatHeading(e.target.value as HeadingTagType | "paragraph")}
                    aria-label="Block type"
                    className="toolbar-item block-type-select"
                >
                    {HEADING_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="lexical-editor-toolbar-divider" />

            {/* Font Size */}
            <div className="lexical-editor-toolbar-group font-size-group">
                <button
                    onClick={handleFontSizeDecrement}
                    disabled={parseInt(fontSize) <= MIN_FONT_SIZE}
                    title="Decrease font size"
                    aria-label="Decrease font size"
                    className="toolbar-item font-size-btn"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
                <input
                    type="number"
                    className="font-size-input"
                    value={fontSizeInputValue}
                    onChange={handleFontSizeInputChange}
                    onBlur={handleFontSizeInputBlur}
                    onKeyDown={handleFontSizeInputKeyDown}
                    min={MIN_FONT_SIZE}
                    max={MAX_FONT_SIZE}
                    title="Font size"
                    aria-label="Font size"
                />
                <button
                    onClick={handleFontSizeIncrement}
                    disabled={parseInt(fontSize) >= MAX_FONT_SIZE}
                    title="Increase font size"
                    aria-label="Increase font size"
                    className="toolbar-item font-size-btn"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            </div>

            <div className="lexical-editor-toolbar-divider" />

            {/* Text formatting */}
            <div className="lexical-editor-toolbar-group">
                <button
                    onClick={formatBold}
                    className={`toolbar-item ${isBold ? "active" : ""}`}
                    title="Bold (Ctrl+B)"
                    aria-label="Bold"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
                    </svg>
                </button>
                <button
                    onClick={formatItalic}
                    className={`toolbar-item ${isItalic ? "active" : ""}`}
                    title="Italic (Ctrl+I)"
                    aria-label="Italic"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
                    </svg>
                </button>
                <button
                    onClick={formatUnderline}
                    className={`toolbar-item ${isUnderline ? "active" : ""}`}
                    title="Underline (Ctrl+U)"
                    aria-label="Underline"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
                    </svg>
                </button>
                <button
                    onClick={formatStrikethrough}
                    className={`toolbar-item ${isStrikethrough ? "active" : ""}`}
                    title="Strikethrough"
                    aria-label="Strikethrough"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
                    </svg>
                </button>
                {/* Color Picker */}
                <div style={{ position: "relative" }}>
                    <button
                        ref={colorButtonRef}
                        onClick={() => {
                            if (colorButtonRef.current) {
                                const rect = colorButtonRef.current.getBoundingClientRect();
                                setColorPickerPosition({
                                    top: rect.bottom + 4,
                                    left: rect.left + rect.width / 2 - 110, // Center the 220px dropdown
                                });
                            }
                            setShowColorPicker(!showColorPicker);
                        }}
                        className="toolbar-item"
                        title="Text color"
                        aria-label="Text color"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11 2L5.5 16h2.25l1.12-3h6.25l1.12 3h2.25L13 2h-2zm-1.38 9L12 4.67 14.38 11H9.62z" />
                        </svg>
                        <div
                            style={{
                                position: "absolute",
                                bottom: "2px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "14px",
                                height: "3px",
                                backgroundColor: fontColor,
                                borderRadius: "1px",
                            }}
                        />
                    </button>
                    {showColorPicker && createPortal(
                        <div
                            className="color-picker-dropdown"
                            style={{
                                position: "fixed",
                                top: colorPickerPosition.top,
                                left: colorPickerPosition.left,
                                backgroundColor: "#fff",
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                                padding: "12px",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                                zIndex: 10000,
                                minWidth: "220px",
                            }}
                        >
                            <div style={{ marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>Text Color</div>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(10, 18px)",
                                    gap: "3px",
                                    marginBottom: "12px",
                                }}
                            >
                                {PRESET_COLORS.map((color, index) => (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            handleColorChange(color);
                                            setShowColorPicker(false);
                                        }}
                                        style={{
                                            width: "18px",
                                            height: "18px",
                                            backgroundColor: color,
                                            border: fontColor === color ? "2px solid #1976d2" : "1px solid #ccc",
                                            borderRadius: "2px",
                                            cursor: "pointer",
                                        }}
                                        title={color}
                                    />
                                ))}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <label style={{ fontSize: "12px" }}>Custom:</label>
                                <input
                                    type="color"
                                    value={fontColor}
                                    onChange={(e) => {
                                        handleColorChange(e.target.value);
                                    }}
                                    style={{
                                        width: "32px",
                                        height: "24px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        padding: 0,
                                    }}
                                />
                                <input
                                    type="text"
                                    value={fontColor}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                                            handleColorChange(val);
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: "4px 8px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                    }}
                                />
                            </div>
                            <button
                                onClick={() => setShowColorPicker(false)}
                                style={{
                                    marginTop: "8px",
                                    width: "100%",
                                    padding: "6px",
                                    backgroundColor: "#f0f0f0",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                }}
                            >
                                Close
                            </button>
                        </div>,
                        document.body
                    )}
                </div>
            </div>

            <div className="lexical-editor-toolbar-divider" />

            {/* Alignment */}
            <div className="lexical-editor-toolbar-group">
                <button
                    onClick={() => formatAlignment("left")}
                    className={`toolbar-item ${elementFormat === "left" ? "active" : ""}`}
                    title="Align left"
                    aria-label="Align left"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
                    </svg>
                </button>
                <button
                    onClick={() => formatAlignment("center")}
                    className={`toolbar-item ${elementFormat === "center" ? "active" : ""}`}
                    title="Align center"
                    aria-label="Align center"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
                    </svg>
                </button>
                <button
                    onClick={() => formatAlignment("right")}
                    className={`toolbar-item ${elementFormat === "right" ? "active" : ""}`}
                    title="Align right"
                    aria-label="Align right"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
                    </svg>
                </button>
                <button
                    onClick={() => formatAlignment("justify")}
                    className={`toolbar-item ${elementFormat === "justify" ? "active" : ""}`}
                    title="Justify"
                    aria-label="Justify"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zM3 3v2h18V3H3z" />
                    </svg>
                </button>
            </div>

            <div className="lexical-editor-toolbar-divider" />

            {/* Lists */}
            <div className="lexical-editor-toolbar-group">
                <button
                    onClick={formatBulletList}
                    className={`toolbar-item ${blockType === "bullet" ? "active" : ""}`}
                    title="Bullet List"
                    aria-label="Bullet List"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                    </svg>
                </button>
                <button
                    onClick={formatNumberedList}
                    className={`toolbar-item ${blockType === "number" ? "active" : ""}`}
                    title="Numbered List"
                    aria-label="Numbered List"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
                    </svg>
                </button>
            </div>

            <div className="lexical-editor-toolbar-divider" />

            {/* Table */}
            <div className="lexical-editor-toolbar-group" style={{ position: "relative" }}>
                <button
                    onClick={() => setShowTablePicker(!showTablePicker)}
                    className="toolbar-item"
                    title="Insert Table"
                    aria-label="Insert Table"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z" />
                    </svg>
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
                        <div style={{ marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>Insert Table</div>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                            <div>
                                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Rows</label>
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
                            <div style={{ fontSize: "12px", marginBottom: "8px", color: "#666" }}>Quick select:</div>
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
                                                    rowIndex < tableRows && colIndex < tableCols ? "#1976d2" : "#fff",
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
                            padding: "0 12px",
                        }}
                    >
                        {isSaving ? "Saving..." : "💾 Save"}
                    </button>
                </div>
            )}

            {/* PDF Preview button */}
            {onPreviewPdf && (
                <div className="lexical-editor-toolbar-group">
                    <button
                        onClick={onPreviewPdf}
                        title="Preview as PDF"
                        aria-label="Preview as PDF"
                        className="toolbar-item"
                        style={{
                            backgroundColor: "#e53935",
                            color: "white",
                            width: "auto",
                            padding: "0 12px",
                            gap: "4px",
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
                        </svg>
                        PDF
                    </button>
                </div>
            )}
        </div>
    );
}
