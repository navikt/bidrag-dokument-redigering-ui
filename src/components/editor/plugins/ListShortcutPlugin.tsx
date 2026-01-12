import {
    $isListItemNode,
    $isListNode,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_HIGH, KEY_ENTER_COMMAND, TextNode } from "lexical";
import { useEffect } from "react";

/**
 * ListShortcutPlugin - Automatically converts text patterns to lists
 *
 * Patterns supported:
 * - "- " followed by Enter → Bullet list (unordered)
 * - "* " followed by Enter → Bullet list (unordered)
 * - "1. " followed by Enter → Numbered list (ordered)
 * - "1) " followed by Enter → Numbered list (ordered)
 */
export default function ListShortcutPlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        // Listen for text changes to detect list patterns
        const removeTransformListener = editor.registerNodeTransform(TextNode, (node: TextNode) => {
            const text = node.getTextContent();

            // Check if we're at the start of a paragraph with a list pattern
            const parent = node.getParent();
            if (!parent) return;

            // Don't transform if already in a list
            if ($isListNode(parent) || $isListItemNode(parent)) return;

            // Check for bullet list patterns: "- " or "* "
            if (/^[-*]\s$/.test(text)) {
                // We have a bullet pattern, wait for more content or Enter
                return;
            }

            // Check for numbered list patterns: "1. " or "1) "
            if (/^\d+[.)]\s$/.test(text)) {
                // We have a number pattern, wait for more content or Enter
                return;
            }
        });

        // Handle Enter key to convert patterns to lists
        const removeEnterListener = editor.registerCommand(
            KEY_ENTER_COMMAND,
            (event: KeyboardEvent | null) => {
                const selection = $getSelection();

                if (!$isRangeSelection(selection)) {
                    return false;
                }

                const anchorNode = selection.anchor.getNode();
                const topLevelElement = anchorNode.getTopLevelElement();

                if (!topLevelElement) {
                    return false;
                }

                const text = topLevelElement.getTextContent();

                // Check for bullet list patterns at the start
                const bulletMatch = text.match(/^[-*]\s(.*)$/);
                if (bulletMatch) {
                    event?.preventDefault();

                    // Get the content after the bullet marker
                    const content = bulletMatch[1];

                    editor.update(() => {
                        // Clear the current content
                        topLevelElement.clear();

                        // Insert unordered list
                        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);

                        // Get the new selection and insert the remaining content
                        const newSelection = $getSelection();
                        if ($isRangeSelection(newSelection) && content) {
                            newSelection.insertText(content);
                        }
                    });

                    return true;
                }

                // Check for numbered list patterns at the start
                const numberedMatch = text.match(/^\d+[.)]\s(.*)$/);
                if (numberedMatch) {
                    event?.preventDefault();

                    // Get the content after the number marker
                    const content = numberedMatch[1];

                    editor.update(() => {
                        // Clear the current content
                        topLevelElement.clear();

                        // Insert ordered list
                        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);

                        // Get the new selection and insert the remaining content
                        const newSelection = $getSelection();
                        if ($isRangeSelection(newSelection) && content) {
                            newSelection.insertText(content);
                        }
                    });

                    return true;
                }

                return false;
            },
            COMMAND_PRIORITY_HIGH
        );

        return () => {
            removeTransformListener();
            removeEnterListener();
        };
    }, [editor]);

    return null;
}
