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
 * Preprocess HTML to convert unsupported elements to Lexical-friendly structures.
 * This handles complex document structures like NAV notat documents.
 */
function preprocessHTML(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove script tags
    const scripts = doc.querySelectorAll("script");
    scripts.forEach((script) => script.remove());

    // Remove style tags (but keep inline styles)
    const styles = doc.querySelectorAll("style");
    styles.forEach((style) => style.remove());

    // Remove SVG elements (logos, icons)
    const svgs = doc.querySelectorAll("svg");
    svgs.forEach((svg) => svg.remove());

    // Remove meta, link, title elements
    const metaElements = doc.querySelectorAll("meta, link, title");
    metaElements.forEach((el) => el.remove());

    // Get the body content or the whole document if no body
    const body = doc.body || doc.documentElement;

    // Process the DOM to convert elements
    processElement(body);

    return body.innerHTML;
}

/**
 * Recursively process DOM elements to make them Lexical-friendly
 */
function processElement(element: Element): void {
    // Skip if element is removed
    if (!element.parentNode) return;

    const children = Array.from(element.children);

    // First, process all children recursively
    children.forEach((child) => processElement(child));

    const tagName = element.tagName.toLowerCase();

    // Handle specific elements
    switch (tagName) {
        case "div":
            // Convert divs with meaningful content to appropriate structures
            handleDivElement(element);
            break;

        case "span":
            // Preserve spans with formatting, convert to semantic elements
            handleSpanElement(element);
            break;

        case "table":
            // Process table to preserve column widths and mark table type
            handleTableElement(element);
            break;

        case "td":
        case "th":
            // Ensure table cells have proper content
            handleTableCellElement(element);
            break;

        case "a":
            // Keep links but ensure they have text content
            if (!element.textContent?.trim()) {
                element.remove();
            }
            break;

        case "colgroup":
            // Keep colgroup - it helps identify data tables
            // Widths are also applied to cells by handleTableElement
            break;

        case "defs":
        case "path":
        case "rect":
        case "circle":
        case "line":
        case "polygon":
        case "polyline":
        case "g":
            // Remove SVG child elements that might have survived
            element.remove();
            break;

        default:
            // Keep other elements as-is
            break;
    }
}

/**
 * Handle table elements - preserve column widths and table layout
 * Also mark data tables vs layout tables
 */
function handleTableElement(element: Element): void {
    // Check if this is a data table (has thead, colgroup, or class="table")
    const hasColgroup = element.querySelector("colgroup") !== null;
    const hasThead = element.querySelector("thead") !== null;
    const hasTableClass = element.classList.contains("table");
    const isDataTable = hasColgroup || hasThead || hasTableClass;

    // Mark data tables with a data attribute (survives Lexical processing)
    if (isDataTable) {
        element.setAttribute("data-table-type", "data");
    } else {
        element.setAttribute("data-table-type", "layout");
    }

    // Get column widths from colgroup/col elements
    const colgroup = element.querySelector("colgroup");
    const cols = colgroup ? Array.from(colgroup.querySelectorAll("col")) : [];
    const columnWidths: (string | null)[] = cols.map((col) => {
        const style = col.getAttribute("style") || "";
        const widthMatch = style.match(/width:\s*([^;]+)/);
        return widthMatch ? widthMatch[1].trim() : null;
    });

    // Get table width from inline style
    const tableStyle = element.getAttribute("style") || "";
    const tableWidthMatch = tableStyle.match(/width:\s*([^;]+)/);
    const tableWidth = tableWidthMatch ? tableWidthMatch[1].trim() : null;

    // Apply widths to ALL row cells, not just first row
    const rows = element.querySelectorAll("tr");
    if (columnWidths.length > 0) {
        rows.forEach((row) => {
            const cells = Array.from(row.querySelectorAll("th, td"));
            let colIndex = 0;

            cells.forEach((cell) => {
                // Check for colspan
                const colspan = parseInt(cell.getAttribute("colspan") || "1", 10);

                // If this column has a defined width and cell doesn't span multiple cols, apply it
                if (colIndex < columnWidths.length && columnWidths[colIndex] && colspan === 1) {
                    let existingStyle = cell.getAttribute("style") || "";
                    // Only add width if not already defined
                    if (!existingStyle.includes("width:")) {
                        existingStyle = `width: ${columnWidths[colIndex]}; ${existingStyle}`;
                        cell.setAttribute("style", existingStyle.trim());
                    }
                }

                colIndex += colspan;
            });
        });
    }

    // Ensure table has proper width style
    let existingStyle = element.getAttribute("style") || "";
    if (tableWidth) {
        if (!existingStyle.includes("width:")) {
            existingStyle = `width: ${tableWidth}; ${existingStyle}`;
        }
    }
    // Add table-layout: fixed for consistent column widths if we have defined widths
    if (columnWidths.some(w => w !== null) && !existingStyle.includes("table-layout:")) {
        existingStyle = `table-layout: fixed; ${existingStyle}`;
    }
    if (existingStyle) {
        element.setAttribute("style", existingStyle.trim());
    }
}

/**
 * Handle thead/tbody elements - unwrap them as Lexical doesn't support them directly
 */
function handleTheadTbodyElement(element: Element): void {
    const parent = element.parentNode;
    if (!parent) return;

    // Move all children (rows) to parent and remove the wrapper
    const fragment = element.ownerDocument.createDocumentFragment();
    while (element.firstChild) {
        fragment.appendChild(element.firstChild);
    }
    parent.replaceChild(fragment, element);
}

/**
 * Handle div elements - convert to paragraphs or appropriate block elements
 * Preserve two-column and multi-column layouts
 */
function handleDivElement(element: Element): void {
    const parent = element.parentNode;
    if (!parent) return;

    // Check for multi-column layout classes (both custom and Tailwind-style)
    const classList = element.classList;
    const classStr = element.className || "";
    const isTwoColumn = classList.contains("two_column_view") || classList.contains("two_column_view_v2");
    const isThreeColumn = classList.contains("three_column_view");
    const isFlexRow = classStr.includes("flex-row") || classStr.includes("flex") && classStr.includes("justify-between");
    
    // Convert multi-column layouts to inline-block for better rendering
    if (isTwoColumn || isThreeColumn) {
        // Create a wrapper that preserves the layout
        const wrapper = element.ownerDocument.createElement("div");
        wrapper.setAttribute("style", `display: inline-block; vertical-align: top; width: ${isTwoColumn ? '48%' : '32%'}; margin-right: 2%;`);
        wrapper.setAttribute("data-layout", isTwoColumn ? "two-column" : "three-column");
        
        // Move all children to wrapper
        while (element.firstChild) {
            wrapper.appendChild(element.firstChild);
        }
        parent.replaceChild(wrapper, element);
        return;
    }

    // Handle flex-row layouts (used for side-by-side content like Mottatt dato / Søkt fra dato)
    if (isFlexRow && element.children.length > 1) {
        // Create a container that uses flexbox-like layout with inline-block
        const container = element.ownerDocument.createElement("div");
        container.setAttribute("style", "display: flex; gap: 24px; flex-wrap: wrap;");
        container.setAttribute("data-layout", "flex-row");
        
        // Move all children to the container
        while (element.firstChild) {
            container.appendChild(element.firstChild);
        }
        parent.replaceChild(container, element);
        return;
    }

    // If div only contains text (no child elements), convert to paragraph
    if (element.children.length === 0 && element.textContent?.trim()) {
        const p = element.ownerDocument.createElement("p");
        // Preserve inline styles for text formatting
        const style = element.getAttribute("style");
        if (style) {
            p.setAttribute("style", style);
        }
        p.textContent = element.textContent;
        parent.replaceChild(p, element);
        return;
    }

    // If div contains only block-level content, unwrap it
    const blockTags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "table", "ul", "ol", "blockquote", "hr"];
    const hasOnlyBlockContent = Array.from(element.children).every((child) =>
        blockTags.includes(child.tagName.toLowerCase())
    );

    if (hasOnlyBlockContent && element.children.length > 0) {
        // Unwrap: replace div with its children
        const fragment = element.ownerDocument.createDocumentFragment();
        while (element.firstChild) {
            fragment.appendChild(element.firstChild);
        }
        parent.replaceChild(fragment, element);
        return;
    }

    // If div contains mixed content, convert to paragraph
    if (element.textContent?.trim()) {
        const p = element.ownerDocument.createElement("p");
        // Move all children to the paragraph
        while (element.firstChild) {
            p.appendChild(element.firstChild);
        }
        parent.replaceChild(p, element);
    } else {
        // Empty div - remove it
        element.remove();
    }
}

/**
 * Handle span elements - preserve formatting
 */
function handleSpanElement(element: Element): void {
    const style = element.getAttribute("style") || "";

    // Check for font-weight: bold in style
    if (style.includes("font-weight") && (style.includes("bold") || style.includes("600") || style.includes("700"))) {
        // Wrap content in strong
        const strong = element.ownerDocument.createElement("strong");
        while (element.firstChild) {
            strong.appendChild(element.firstChild);
        }
        element.appendChild(strong);
    }

    // Check for font-style: italic
    if (style.includes("font-style") && style.includes("italic")) {
        const em = element.ownerDocument.createElement("em");
        while (element.firstChild) {
            em.appendChild(element.firstChild);
        }
        element.appendChild(em);
    }

    // Check for text-decoration: underline
    if (style.includes("text-decoration") && style.includes("underline")) {
        const u = element.ownerDocument.createElement("u");
        while (element.firstChild) {
            u.appendChild(element.firstChild);
        }
        element.appendChild(u);
    }
}

/**
 * Handle table cell elements - preserve font-weight and other styles
 */
function handleTableCellElement(element: Element): void {
    const style = element.getAttribute("style") || "";
    const isBold = style.includes("font-weight") && (style.includes("bold") || style.includes("600") || style.includes("700"));

    // If cell contains only text (no elements), wrap in paragraph for Lexical
    if (element.children.length === 0 && element.textContent?.trim()) {
        const text = element.textContent;
        element.textContent = "";
        const p = element.ownerDocument.createElement("p");
        
        // If the cell has bold font-weight, wrap text in strong tag
        if (isBold) {
            const strong = element.ownerDocument.createElement("strong");
            strong.textContent = text;
            p.appendChild(strong);
        } else {
            p.textContent = text;
        }
        element.appendChild(p);
    } else if (isBold && element.children.length > 0) {
        // If cell has child elements but is bold, wrap text nodes in strong
        Array.from(element.childNodes).forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
                const strong = element.ownerDocument.createElement("strong");
                strong.textContent = node.textContent;
                node.parentNode?.replaceChild(strong, node);
            }
        });
    }
}

/**
 * Import HTML content into Lexical editor
 */
export function importHTMLToEditor(editor: LexicalEditor, html: string): void {
    // Preprocess HTML for better Lexical compatibility
    const processedHTML = preprocessHTML(html);

    editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(processedHTML, "text/html");

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
    return new Promise((resolve, reject) => {
        try {
            // Must use update context to properly handle exportDOM calls
            editor.update(
                () => {
                    try {
                        const html = $generateHtmlFromNodes(editor);
                        resolve(html);
                    } catch (e) {
                        reject(e);
                    }
                },
                { discrete: true } // Mark as discrete update to avoid batching issues
            );
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Export Lexical editor content to JSON
 */
export function exportEditorToJSON(editor: LexicalEditor): string {
    let json = "";
    try {
        const editorState = editor.getEditorState();
        json = JSON.stringify(editorState.toJSON());
    } catch (error) {
        console.error("Error exporting JSON:", error);
    }
    return json;
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
