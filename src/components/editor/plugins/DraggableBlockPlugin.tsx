import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
    $createParagraphNode,
    $createTextNode,
    $getNearestNodeFromDOMNode,
    $getNodeByKey,
    $getSelection,
    $isParagraphNode,
    $isRangeSelection,
    $isTextNode,
    FORMAT_ELEMENT_COMMAND,
    NodeKey,
} from "lexical";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as ReactDOM from "react-dom";

const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";

type PickerState = {
    insertBefore: boolean;
    targetNodeKey: NodeKey;
};

interface ComponentPickerOption {
    key: string;
    title: string;
    icon: React.ReactNode;
    keywords: string[];
    onSelect: (queryString: string) => void;
}

function isOnMenu(element: HTMLElement): boolean {
    return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
}

// Basic component options with full functionality
function getBaseOptions(editor: ReturnType<typeof useLexicalComposerContext>[0]): ComponentPickerOption[] {
    return [
        {
            key: "paragraph",
            title: "Paragraph",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 4v16h-2V4H5V2h14v2h-6z" />
                </svg>
            ),
            keywords: ["paragraph", "p", "text", "normal"],
            onSelect: () => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $setBlocksType(selection, () => $createParagraphNode());
                    }
                });
            },
        },
        {
            key: "heading1",
            title: "Heading 1",
            icon: <span style={{ fontWeight: 700, fontSize: "14px" }}>H1</span>,
            keywords: ["heading", "h1", "title", "header"],
            onSelect: () => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $setBlocksType(selection, () => $createHeadingNode("h1"));
                    }
                });
            },
        },
        {
            key: "heading2",
            title: "Heading 2",
            icon: <span style={{ fontWeight: 600, fontSize: "13px" }}>H2</span>,
            keywords: ["heading", "h2", "subtitle"],
            onSelect: () => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $setBlocksType(selection, () => $createHeadingNode("h2"));
                    }
                });
            },
        },
        {
            key: "heading3",
            title: "Heading 3",
            icon: <span style={{ fontWeight: 600, fontSize: "12px" }}>H3</span>,
            keywords: ["heading", "h3"],
            onSelect: () => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $setBlocksType(selection, () => $createHeadingNode("h3"));
                    }
                });
            },
        },
        {
            key: "bullet-list",
            title: "Bullet List",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                </svg>
            ),
            keywords: ["bullet", "list", "ul", "unordered"],
            onSelect: () => {
                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            },
        },
        {
            key: "numbered-list",
            title: "Numbered List",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
                </svg>
            ),
            keywords: ["numbered", "list", "ol", "ordered"],
            onSelect: () => {
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
            },
        },
        {
            key: "quote",
            title: "Quote",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                </svg>
            ),
            keywords: ["quote", "blockquote", "cite"],
            onSelect: () => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $setBlocksType(selection, () => $createQuoteNode());
                    }
                });
            },
        },
        {
            key: "table",
            title: "Table",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z" />
                </svg>
            ),
            keywords: ["table", "grid", "spreadsheet", "rows", "columns"],
            onSelect: () => {
                editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: "3", columns: "3" });
            },
        },
        {
            key: "horizontal-rule",
            title: "Horizontal Rule",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="11" width="18" height="2" />
                </svg>
            ),
            keywords: ["horizontal", "rule", "divider", "hr", "line"],
            onSelect: () => {
                editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
            },
        },
        {
            key: "page-break",
            title: "Page Break",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9h2v6H3V9zm4 0h2v6H7V9zm4 0h2v6h-2V9zm4 0h2v6h-2V9zm4 0h2v6h-2V9zM3 19h18v2H3v-2zM3 3h18v2H3V3z" />
                </svg>
            ),
            keywords: ["page", "break", "divider", "print"],
            onSelect: () => {
                // Insert a simple page break indicator
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const paragraph = $createParagraphNode();
                        const textNode = $createTextNode("--- Page Break ---");
                        paragraph.append(textNode);
                        selection.insertNodes([paragraph]);
                    }
                });
            },
        },
        {
            key: "align-left",
            title: "Align Left",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
                </svg>
            ),
            keywords: ["align", "left", "alignment"],
            onSelect: () => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
            },
        },
        {
            key: "align-center",
            title: "Align Center",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
                </svg>
            ),
            keywords: ["align", "center", "alignment", "middle"],
            onSelect: () => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
            },
        },
        {
            key: "align-right",
            title: "Align Right",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
                </svg>
            ),
            keywords: ["align", "right", "alignment"],
            onSelect: () => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
            },
        },
        {
            key: "align-justify",
            title: "Justify",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zM3 3v2h18V3H3z" />
                </svg>
            ),
            keywords: ["align", "justify", "alignment", "full"],
            onSelect: () => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
            },
        },
    ];
}

export default function DraggableBlockPlugin({ anchorElem }: { anchorElem: HTMLElement }): React.ReactElement | null {
    const [editor] = useLexicalComposerContext();
    const menuRef = useRef<HTMLDivElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const targetLineRef = useRef<HTMLDivElement>(null);
    const [draggableElement, setDraggableElement] = useState<HTMLElement | null>(null);
    const [pickerState, setPickerState] = useState<PickerState | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [queryString, setQueryString] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [pickerPosition, setPickerPosition] = useState<{ left: number; top: number } | null>(null);

    const options = useMemo(() => {
        const baseOptions = getBaseOptions(editor);

        if (!queryString) {
            return baseOptions;
        }

        const regex = new RegExp(queryString, "i");
        return baseOptions.filter(
            (option) => regex.test(option.title) || option.keywords.some((keyword) => regex.test(keyword))
        );
    }, [editor, queryString]);

    useEffect(() => {
        if (isPickerOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isPickerOpen]);

    useEffect(() => {
        if (!isPickerOpen || !options.length) {
            return;
        }
        setHighlightedIndex((current) => Math.min(current, Math.max(options.length - 1, 0)));
    }, [isPickerOpen, options.length]);

    // Handle click outside to close picker
    useEffect(() => {
        if (!isPickerOpen) {
            return;
        }
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (
                (pickerRef.current && pickerRef.current.contains(target)) ||
                (menuRef.current && menuRef.current.contains(target))
            ) {
                return;
            }
            setIsPickerOpen(false);
            setPickerState(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isPickerOpen]);

    const selectOption = useCallback(
        (option: ComponentPickerOption) => {
            if (!pickerState) {
                setIsPickerOpen(false);
                return;
            }
            setIsPickerOpen(false);
            editor.update(() => {
                const node = $getNodeByKey(pickerState.targetNodeKey);
                if (!node) {
                    return;
                }
                const placeholder = $createParagraphNode();
                const textNode = $createTextNode("");
                placeholder.append(textNode);
                if (pickerState.insertBefore) {
                    node.insertBefore(placeholder);
                } else {
                    node.insertAfter(placeholder);
                }
                textNode.select();
                option.onSelect(queryString);
                const latestPlaceholder = placeholder.getLatest();
                if ($isParagraphNode(latestPlaceholder)) {
                    const onlyChild = latestPlaceholder.getFirstChild();
                    if (
                        $isTextNode(onlyChild) &&
                        onlyChild.getTextContent().length === 0 &&
                        latestPlaceholder.getChildrenSize() === 1
                    ) {
                        latestPlaceholder.remove();
                    }
                }
            });
        },
        [editor, pickerState, queryString]
    );

    // Keyboard navigation for picker
    useEffect(() => {
        if (!isPickerOpen) {
            return;
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isPickerOpen || !options.length) {
                return;
            }
            if (event.key === "ArrowDown") {
                event.preventDefault();
                setHighlightedIndex((index) => (index + 1 >= options.length ? 0 : index + 1));
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setHighlightedIndex((index) => (index - 1 < 0 ? options.length - 1 : index - 1));
            } else if (event.key === "Enter") {
                event.preventDefault();
                const option = options[highlightedIndex];
                if (option) {
                    selectOption(option);
                }
            } else if (event.key === "Escape") {
                event.preventDefault();
                setIsPickerOpen(false);
                setPickerState(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [highlightedIndex, isPickerOpen, options, selectOption]);

    function openComponentPicker(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();

        if (!draggableElement || !editor) {
            return;
        }

        let targetNodeKey: NodeKey | null = null;
        editor.read(() => {
            const resolvedNode = $getNearestNodeFromDOMNode(draggableElement);
            if (resolvedNode) {
                targetNodeKey = resolvedNode.getKey();
            }
        });

        if (!targetNodeKey) {
            return;
        }

        const insertBefore = e.altKey || e.ctrlKey;
        const rect = menuRef.current?.getBoundingClientRect();
        setPickerPosition(
            rect
                ? {
                      left: rect.left + rect.width + window.scrollX + 8,
                      top: rect.top + window.scrollY,
                  }
                : null
        );
        setPickerState({ insertBefore, targetNodeKey });
        setQueryString("");
        setHighlightedIndex(0);
        setIsPickerOpen(true);
    }

    return (
        <>
            {isPickerOpen && pickerPosition
                ? ReactDOM.createPortal(
                      <div
                          className="draggable-block-component-picker"
                          ref={pickerRef}
                          style={{
                              left: pickerPosition.left,
                              position: "absolute",
                              top: pickerPosition.top,
                              zIndex: 1000,
                          }}
                      >
                          <input
                              className="component-picker-search"
                              placeholder="Filter blocks..."
                              value={queryString}
                              ref={searchInputRef}
                              onChange={(event) => setQueryString(event.target.value)}
                          />
                          <ul className="component-picker-list">
                              {options.map((option, i: number) => (
                                  <li
                                      key={option.key}
                                      className={`component-picker-item ${highlightedIndex === i ? "selected" : ""}`}
                                      onClick={() => {
                                          setHighlightedIndex(i);
                                          selectOption(option);
                                      }}
                                      onMouseEnter={() => setHighlightedIndex(i)}
                                  >
                                      <span className="component-picker-icon">{option.icon}</span>
                                      <span className="component-picker-title">{option.title}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>,
                      document.body
                  )
                : null}
            <DraggableBlockPlugin_EXPERIMENTAL
                anchorElem={anchorElem}
                menuRef={menuRef}
                targetLineRef={targetLineRef}
                menuComponent={
                    <div ref={menuRef} className={DRAGGABLE_BLOCK_MENU_CLASSNAME}>
                        <button
                            type="button"
                            className="draggable-block-add-button"
                            onClick={openComponentPicker}
                            title="Click to add block below (Alt/Ctrl+Click to add above)"
                            aria-label="Add block"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 2a1 1 0 011 1v4h4a1 1 0 110 2H9v4a1 1 0 11-2 0V9H3a1 1 0 110-2h4V3a1 1 0 011-1z" />
                            </svg>
                        </button>
                        <div className="draggable-block-handle" title="Drag to move block">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <circle cx="5" cy="3" r="1.5" />
                                <circle cx="11" cy="3" r="1.5" />
                                <circle cx="5" cy="8" r="1.5" />
                                <circle cx="11" cy="8" r="1.5" />
                                <circle cx="5" cy="13" r="1.5" />
                                <circle cx="11" cy="13" r="1.5" />
                            </svg>
                        </div>
                    </div>
                }
                targetLineComponent={<div ref={targetLineRef} className="draggable-block-target-line" />}
                isOnMenu={isOnMenu}
                onElementChanged={setDraggableElement}
            />
        </>
    );
}
