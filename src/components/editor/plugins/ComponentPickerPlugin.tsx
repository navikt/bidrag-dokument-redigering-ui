import React, { useCallback, useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    LexicalTypeaheadMenuPlugin,
    MenuOption,
    useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createHeadingNode, HeadingTagType } from "@lexical/rich-text";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { $createTableNodeWithDimensions } from "@lexical/table";
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    LexicalEditor,
    TextNode,
} from "lexical";
import * as ReactDOM from "react-dom";

class ComponentPickerOption extends MenuOption {
    title: string;
    icon: React.ReactNode;
    keywords: Array<string>;
    keyboardShortcut?: string;
    onSelect: (queryString: string) => void;

    constructor(
        title: string,
        options: {
            icon: React.ReactNode;
            keywords?: Array<string>;
            keyboardShortcut?: string;
            onSelect: (queryString: string) => void;
        }
    ) {
        super(title);
        this.title = title;
        this.keywords = options.keywords || [];
        this.icon = options.icon;
        this.keyboardShortcut = options.keyboardShortcut;
        this.onSelect = options.onSelect.bind(this);
    }
}

function ComponentPickerMenuItem({
    index,
    isSelected,
    onClick,
    onMouseEnter,
    option,
}: {
    index: number;
    isSelected: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    option: ComponentPickerOption;
}) {
    return (
        <li
            key={option.key}
            tabIndex={-1}
            className={`component-picker-item ${isSelected ? "selected" : ""}`}
            ref={option.setRefElement}
            role="option"
            aria-selected={isSelected}
            id={"typeahead-item-" + index}
            onMouseEnter={onMouseEnter}
            onClick={onClick}
        >
            <span className="component-picker-icon">{option.icon}</span>
            <span className="component-picker-text">
                <span className="component-picker-title">{option.title}</span>
                {option.keyboardShortcut && (
                    <span className="component-picker-shortcut">
                        {option.keyboardShortcut}
                    </span>
                )}
            </span>
        </li>
    );
}

function getBaseOptions(editor: LexicalEditor): Array<ComponentPickerOption> {
    return [
        new ComponentPickerOption("Paragraph", {
            icon: <span className="icon paragraph-icon">¶</span>,
            keywords: ["normal", "paragraph", "p", "text"],
            onSelect: () =>
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        selection.insertNodes([$createParagraphNode()]);
                    }
                }),
        }),
        ...([1, 2, 3] as const).map(
            (n) =>
                new ComponentPickerOption(`Heading ${n}`, {
                    icon: <span className="icon heading-icon">H{n}</span>,
                    keywords: ["heading", "header", `h${n}`],
                    onSelect: () =>
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                                selection.insertNodes([
                                    $createHeadingNode(`h${n}` as HeadingTagType),
                                ]);
                            }
                        }),
                })
        ),
        new ComponentPickerOption("Bulleted List", {
            icon: <span className="icon list-icon">•</span>,
            keywords: ["bulleted list", "unordered list", "ul"],
            onSelect: () =>
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const listNode = $createListNode("bullet");
                        listNode.append($createListItemNode());
                        selection.insertNodes([listNode]);
                    }
                }),
        }),
        new ComponentPickerOption("Numbered List", {
            icon: <span className="icon list-icon">1.</span>,
            keywords: ["numbered list", "ordered list", "ol"],
            onSelect: () =>
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const listNode = $createListNode("number");
                        listNode.append($createListItemNode());
                        selection.insertNodes([listNode]);
                    }
                }),
        }),
        new ComponentPickerOption("Table", {
            icon: <span className="icon table-icon">⊞</span>,
            keywords: ["table", "grid", "spreadsheet"],
            onSelect: () =>
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const tableNode = $createTableNodeWithDimensions(3, 3, true);
                        selection.insertNodes([tableNode]);
                    }
                }),
        }),
        new ComponentPickerOption("Horizontal Rule", {
            icon: <span className="icon hr-icon">—</span>,
            keywords: ["horizontal rule", "divider", "hr"],
            onSelect: () =>
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const paragraph = $createParagraphNode();
                        selection.insertNodes([paragraph]);
                    }
                }),
        }),
    ];
}

export default function ComponentPickerPlugin(): React.ReactElement {
    const [editor] = useLexicalComposerContext();
    const [queryString, setQueryString] = useState<string | null>(null);

    const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
        minLength: 0,
    });

    const options = useMemo(() => {
        const baseOptions = getBaseOptions(editor);

        if (!queryString) {
            return baseOptions;
        }

        const regex = new RegExp(queryString, "i");

        return baseOptions.filter(
            (option) =>
                regex.test(option.title) ||
                option.keywords.some((keyword) => regex.test(keyword))
        );
    }, [editor, queryString]);

    const onSelectOption = useCallback(
        (
            selectedOption: ComponentPickerOption,
            nodeToRemove: TextNode | null,
            closeMenu: () => void,
            matchingString: string
        ) => {
            editor.update(() => {
                nodeToRemove?.remove();
                selectedOption.onSelect(matchingString);
                closeMenu();
            });
        },
        [editor]
    );

    return (
        <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
            onQueryChange={setQueryString}
            onSelectOption={onSelectOption}
            triggerFn={checkForTriggerMatch}
            options={options}
            menuRenderFn={(
                anchorElementRef,
                { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
            ) =>
                anchorElementRef.current && options.length
                    ? ReactDOM.createPortal(
                          <div className="component-picker-menu">
                              <ul className="component-picker-list">
                                  {options.map((option, i: number) => (
                                      <ComponentPickerMenuItem
                                          index={i}
                                          isSelected={selectedIndex === i}
                                          onClick={() => {
                                              setHighlightedIndex(i);
                                              selectOptionAndCleanUp(option);
                                          }}
                                          onMouseEnter={() => {
                                              setHighlightedIndex(i);
                                          }}
                                          key={option.key}
                                          option={option}
                                      />
                                  ))}
                              </ul>
                          </div>,
                          anchorElementRef.current
                      )
                    : null
            }
        />
    );
}
