import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $isListItemNode, $isListNode, ListItemNode, ListNode } from "@lexical/list";
import { $isHeadingNode, $isQuoteNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $isTableCellNode, $isTableNode, $isTableRowNode, TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import {
    $createParagraphNode,
    $createTextNode,
    $getRoot,
    $insertNodes,
    $isElementNode,
    $isParagraphNode,
    $isTextNode,
    LexicalEditor,
    LexicalNode,
    ParagraphNode,
    TextNode,
} from "lexical";

import { convertRTFToHTML, isRTFContent } from "./rtfConverter";

/**
 * Import HTML content into Lexical editor
 */
export function importHTMLToEditor(editor: LexicalEditor, html: string): void {
    editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");

        const nodes = $generateNodesFromDOM(editor, dom);

        // Clear existing content and insert new nodes
        const root = $getRoot();
        root.clear();

        // Only element nodes can be appended to root
        // Text nodes and other inline nodes must be wrapped in a paragraph
        let currentParagraph: ParagraphNode | null = null;

        nodes.forEach((node) => {
            if ($isElementNode(node)) {
                // Element nodes can be appended directly
                // First, flush any pending paragraph
                if (currentParagraph) {
                    root.append(currentParagraph);
                    currentParagraph = null;
                }
                root.append(node);
            } else {
                // Non-element nodes (TextNode, etc.) need to be wrapped in a paragraph
                if (!currentParagraph) {
                    currentParagraph = $createParagraphNode();
                }
                currentParagraph.append(node);
            }
        });

        // Append any remaining paragraph
        if (currentParagraph) {
            root.append(currentParagraph);
        }

        // Ensure there's at least one paragraph
        if (root.getChildrenSize() === 0) {
            root.append($createParagraphNode());
        }
    });
}

/**
 * Import RTF content into Lexical editor
 * First converts RTF to HTML, then imports into editor
 */
export function importRTFToEditor(editor: LexicalEditor, rtfContent: string): void {
    const html = convertRTFToHTML(rtfContent);
    importHTMLToEditor(editor, html);
}

/**
 * Auto-detect content type and import into editor
 */
export function importContentToEditor(editor: LexicalEditor, content: string): void {
    if (isRTFContent(content)) {
        importRTFToEditor(editor, content);
    } else if (content.trim().startsWith("<")) {
        // Looks like HTML
        importHTMLToEditor(editor, content);
    } else {
        // Plain text
        editor.update(() => {
            const root = $getRoot();
            root.clear();

            const lines = content.split("\n");
            lines.forEach((line) => {
                const paragraph = $createParagraphNode();
                paragraph.append($createTextNode(line));
                root.append(paragraph);
            });
        });
    }
}

/**
 * Export Lexical editor content to HTML
 */
export function exportEditorToHTML(editor: LexicalEditor): Promise<string> {
    return new Promise((resolve) => {
        editor.getEditorState().read(() => {
            const html = $generateHtmlFromNodes(editor);
            resolve(html);
        });
    });
}

/**
 * Export Lexical editor content to JSON
 */
export function exportEditorToJSON(editor: LexicalEditor): string {
    const editorState = editor.getEditorState();
    return JSON.stringify(editorState.toJSON());
}

/**
 * Import JSON content into Lexical editor
 */
export function importJSONToEditor(editor: LexicalEditor, json: string): void {
    const editorState = editor.parseEditorState(json);
    editor.setEditorState(editorState);
}

/**
 * Get plain text from Lexical editor
 */
export function getPlainTextFromEditor(editor: LexicalEditor): Promise<string> {
    return new Promise((resolve) => {
        editor.getEditorState().read(() => {
            const root = $getRoot();
            resolve(root.getTextContent());
        });
    });
}
