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
 * Extract CSS rules from style elements and return a map of selectors to styles
 */
function extractCSSRules(doc: Document): Map<string, Record<string, string>> {
    const cssMap = new Map<string, Record<string, string>>();
    const styleElements = doc.querySelectorAll("style");

    styleElements.forEach((styleEl) => {
        const cssText = styleEl.textContent || "";
        // Parse CSS rules using regex - matches .className { properties }
        const ruleRegex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g;
        let match;

        while ((match = ruleRegex.exec(cssText)) !== null) {
            const className = match[1];
            const propertiesText = match[2];

            // Parse properties
            const properties: Record<string, string> = {};
            const propRegex = /([a-zA-Z-]+)\s*:\s*([^;]+)/g;
            let propMatch;

            while ((propMatch = propRegex.exec(propertiesText)) !== null) {
                const propName = propMatch[1].trim();
                const propValue = propMatch[2].trim();
                properties[propName] = propValue;
            }

            if (Object.keys(properties).length > 0) {
                cssMap.set(className, properties);
            }
        }
    });

    return cssMap;
}

/**
 * Apply CSS class rules as inline styles to elements
 */
function applyClassStylesToElements(doc: Document, cssMap: Map<string, Record<string, string>>): void {
    // Get all elements with class attributes
    const elements = doc.querySelectorAll("[class]");

    elements.forEach((element) => {
        const classes = element.getAttribute("class")?.split(/\s+/) || [];
        const existingStyle = element.getAttribute("style") || "";
        const styleParts: string[] = existingStyle ? [existingStyle.replace(/;$/, "")] : [];
        const tagName = element.tagName.toLowerCase();

        classes.forEach((className) => {
            const classStyles = cssMap.get(className);
            if (classStyles) {
                // Properties for text styling (includes line-height for proper text spacing)
                const textProps = ["color", "font-weight", "font-style", "text-decoration", "font-size", "font-family", "line-height", "background-color", "background"];
                
                // Properties for layout (tables, columns, rows, cells)
                const layoutProps = ["width", "height", "min-width", "max-width", "vertical-align", "text-align"];
                
                // Properties for table cell styling
                const cellProps = tagName === "td" || tagName === "th" || tagName === "table"
                    ? ["padding", "padding-top", "padding-right", "padding-bottom", "padding-left", 
                       "border", "border-top", "border-right", "border-bottom", "border-left", "border-width", "border-style", "border-color",
                       "table-layout"]
                    : [];
                
                const allProps = [...textProps, ...layoutProps, ...cellProps];
                
                // Apply properties, being careful not to duplicate (use word boundary check)
                allProps.forEach((prop) => {
                    if (classStyles[prop]) {
                        // Check if this exact property (with colon) already exists in style
                        const propPattern = new RegExp(`(^|;)\\s*${prop}\\s*:`, 'i');
                        if (!propPattern.test(existingStyle)) {
                            styleParts.push(`${prop}: ${classStyles[prop]}`);
                        }
                    }
                });

                // Handle shorthand font property
                if (classStyles["font"] && !existingStyle.includes("font")) {
                    const fontValue = classStyles["font"];
                    // Extract bold from font shorthand
                    if (fontValue.includes("bold") && !existingStyle.includes("font-weight")) {
                        styleParts.push("font-weight: bold");
                    }
                    // Extract italic from font shorthand
                    if (fontValue.includes("italic") && !existingStyle.includes("font-style")) {
                        styleParts.push("font-style: italic");
                    }
                    // Extract font-size from font shorthand (e.g., "bold 14.67px 'Times New Roman'")
                    const fontSizeMatch = fontValue.match(/(\d+(?:\.\d+)?)(px|pt|em|rem)/i);
                    if (fontSizeMatch && !existingStyle.includes("font-size")) {
                        styleParts.push(`font-size: ${fontSizeMatch[1]}${fontSizeMatch[2]}`);
                    }
                    // Extract font-family from font shorthand
                    const fontFamilyMatch = fontValue.match(/(["'][^"']+["'](?:,\s*["'][^"']+["'])*(?:,\s*\w+)*)/i);
                    if (fontFamilyMatch && !existingStyle.includes("font-family")) {
                        styleParts.push(`font-family: ${fontFamilyMatch[1]}`);
                    }
                }

                // Remove position: absolute from page classes to prevent content from being positioned off-screen
                if (className.startsWith("page") && classStyles["position"] === "absolute") {
                    // Don't apply position, top, left, right, bottom for page elements
                    // They should flow normally in the editor
                }
            }
        });

        if (styleParts.length > 0) {
            element.setAttribute("style", styleParts.join("; "));
        }
    });
}

/**
 * Preprocess HTML to convert unsupported elements to Lexical-friendly structures.
 * This handles complex document structures like NAV notat documents.
 */
function preprocessHTML(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Extract CSS rules from style tags BEFORE removing them
    const cssMap = extractCSSRules(doc);

    // Apply CSS class styles as inline styles to preserve formatting
    applyClassStylesToElements(doc, cssMap);

    // Remove script tags
    const scripts = doc.querySelectorAll("script");
    scripts.forEach((script) => script.remove());

    // Remove style tags (inline styles are now preserved)
    const styles = doc.querySelectorAll("style");
    styles.forEach((style) => style.remove());

    // Remove SVG elements (logos, icons)
    const svgs = doc.querySelectorAll("svg");
    svgs.forEach((svg) => svg.remove());

    // Remove meta, link, title elements
    const metaElements = doc.querySelectorAll("meta, link, title");
    metaElements.forEach((el) => el.remove());

    // Handle absolute positioning intelligently - preserve tables but convert to relative flow
    // The original HTML uses position: absolute with large top/left values, which breaks the editor flow
    // We need to convert all positioned elements to normal flow while preserving their content
    // First, handle page wrapper divs - these define page boundaries and may have absolute positioning
    const pageElements = doc.querySelectorAll("[class*='page']");
    pageElements.forEach((page) => {
        const style = page.getAttribute("style") || "";
        // Remove positioning from page wrappers so content flows naturally
        if (style.includes("position")) {
            const cleanedStyle = style
                .replace(/position\s*:\s*[^;]+;?/gi, "")
                .replace(/(?:^|;)\s*top\s*:\s*[^;]+;?/gi, ";")
                .replace(/(?:^|;)\s*left\s*:\s*[^;]+;?/gi, ";")
                .replace(/(?:^|;)\s*right\s*:\s*[^;]+;?/gi, ";")
                .replace(/(?:^|;)\s*bottom\s*:\s*[^;]+;?/gi, ";")
                .replace(/(?:^|;)\s*width\s*:\s*[^;]+;?/gi, ";")
                .replace(/(?:^|;)\s*height\s*:\s*[^;]+;?/gi, ";")
                .replace(/^;+/, "")
                .replace(/;+/g, ";")
                .trim();
            if (cleanedStyle && cleanedStyle !== ";") {
                page.setAttribute("style", cleanedStyle);
            } else {
                page.removeAttribute("style");
            }
        }
    });

    // Then handle all other absolutely positioned elements
    const allElements = doc.querySelectorAll("*");
    allElements.forEach((el) => {
        const style = el.getAttribute("style") || "";
        if (style.includes("position") && style.includes("absolute")) {
            // For tables and data-heavy elements, preserve them but convert to relative positioning
            if (el.tagName.toLowerCase() === "table" || el.classList.toString().includes("table")) {
                // Convert position: absolute to relative so it flows naturally
                const convertedStyle = style
                    .replace(/position\s*:\s*absolute/gi, "position: relative")
                    .replace(/(?:^|;)\s*top\s*:\s*[^;]+;?/gi, ";")
                    .replace(/(?:^|;)\s*left\s*:\s*[^;]+;?/gi, ";")
                    .replace(/(?:^|;)\s*right\s*:\s*[^;]+;?/gi, ";")
                    .replace(/(?:^|;)\s*bottom\s*:\s*[^;]+;?/gi, ";")
                    .replace(/^;+/, "")
                    .replace(/;+/g, ";")
                    .trim();
                if (convertedStyle && convertedStyle !== ";") {
                    el.setAttribute("style", convertedStyle);
                } else {
                    el.removeAttribute("style");
                }
            } else if (el.tagName.toLowerCase() === "div") {
                // For divs with absolute positioning, check if they contain tables
                const containsTable = el.querySelector("table") !== null;
                if (containsTable) {
                    // Unwrap the div - move its children to its parent
                    const parent = el.parentNode;
                    if (parent) {
                        while (el.firstChild) {
                            parent.insertBefore(el.firstChild, el);
                        }
                        parent.removeChild(el);
                    }
                } else {
                    // For non-table divs, remove positioning completely
                    const cleanedStyle = style
                        .replace(/position\s*:\s*[^;]+;?/gi, "")
                        .replace(/(?:^|;)\s*top\s*:\s*[^;]+;?/gi, ";")
                        .replace(/(?:^|;)\s*left\s*:\s*[^;]+;?/gi, ";")
                        .replace(/(?:^|;)\s*right\s*:\s*[^;]+;?/gi, ";")
                        .replace(/(?:^|;)\s*bottom\s*:\s*[^;]+;?/gi, ";")
                        .replace(/^;+/, "")
                        .replace(/;+/g, ";")
                        .trim();
                    if (cleanedStyle && cleanedStyle !== ";") {
                        el.setAttribute("style", cleanedStyle);
                    } else {
                        el.removeAttribute("style");
                    }
                }
            } else {
                // For non-table elements, remove positioning completely
                const cleanedStyle = style
                    .replace(/position\s*:\s*[^;]+;?/gi, "")
                    .replace(/(?:^|;)\s*top\s*:\s*[^;]+;?/gi, ";")
                    .replace(/(?:^|;)\s*left\s*:\s*[^;]+;?/gi, ";")
                    .replace(/(?:^|;)\s*right\s*:\s*[^;]+;?/gi, ";")
                    .replace(/(?:^|;)\s*bottom\s*:\s*[^;]+;?/gi, ";")
                    .replace(/^;+/, "")
                    .replace(/;+/g, ";")
                    .trim();
                if (cleanedStyle && cleanedStyle !== ";") {
                    el.setAttribute("style", cleanedStyle);
                } else {
                    el.removeAttribute("style");
                }
            }
        } else if (style.includes("top:") || style.includes("left:") || style.includes("right:") || style.includes("bottom:")) {
            // Also clean up positioning values even without explicit position property
            const cleanedStyle = style
                .replace(/(?:^|;)\s*top\s*:\s*[^;]+;?/gi, ";")
                .replace(/(?:^|;)\s*left\s*:\s*[^;]+;?/gi, ";")
                .replace(/(?:^|;)\s*right\s*:\s*[^;]+;?/gi, ";")
                .replace(/(?:^|;)\s*bottom\s*:\s*[^;]+;?/gi, ";")
                .replace(/^;+/, "")
                .replace(/;+/g, ";")
                .trim();
            if (cleanedStyle && cleanedStyle !== ";") {
                el.setAttribute("style", cleanedStyle);
            } else {
                el.removeAttribute("style");
            }
        }
    });

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

function hasVisibleBorder(style: string | null, borderAttr?: string | null): boolean {
    if (borderAttr && borderAttr.trim() !== "" && borderAttr.trim() !== "0") {
        return true;
    }

    if (!style) return false;

    const normalized = style.toLowerCase();

    // Explicitly declared no-border wins
    if (/(border(?:-(?:top|right|bottom|left))?|border-style)\s*:\s*none/.test(normalized)) {
        return false;
    }
    if (/(border(?:-(?:top|right|bottom|left))?|border-width)\s*:\s*0\b/.test(normalized)) {
        return false;
    }

    // Look for any border declarations that imply a visible line (width, style keyword, or numeric value)
    return (
        /border(?:-(?:top|right|bottom|left))?\s*:\s*[^;]*(\d|solid|dashed|dotted)/.test(normalized) ||
        /border-width\s*:\s*(?!0\b)\d/.test(normalized)
    );
}

/**
 * Handle table elements - preserve column widths and table layout
 * Also mark data tables vs layout tables
 */
function handleTableElement(element: Element): void {
    let tableStyle = element.getAttribute("style") || "";
    const borderAttr = element.getAttribute("border");

    const hasColgroup = element.querySelector("colgroup") !== null;
    const hasThead = element.querySelector("thead") !== null;
    const hasTableClass = element.classList.contains("table");

    const hasBorderInCells = Array.from(element.querySelectorAll("th, td")).some((cell) => {
        const cellStyle = cell.getAttribute("style") || "";
        const cellBorderAttr = cell.getAttribute("border");
        return hasVisibleBorder(cellStyle, cellBorderAttr);
    });

    const hasExplicitBorder = hasVisibleBorder(tableStyle, borderAttr) || hasBorderInCells;

    // Mark tables with an explicit border as data tables. Colgroup alone should not force a border.
    const isDataTable = hasThead || hasTableClass || hasExplicitBorder;

    element.setAttribute("data-table-type", isDataTable ? "data" : "layout");
    element.setAttribute("data-has-border", hasExplicitBorder ? "true" : "false");

    // Get column widths from colgroup/col elements
    const colgroup = element.querySelector("colgroup");
    const cols = colgroup ? Array.from(colgroup.querySelectorAll("col")) : [];
    const columnWidths: (string | null)[] = cols.map((col) => {
        const style = col.getAttribute("style") || "";
        const widthMatch = style.match(/width:\s*([^;]+)/);
        return widthMatch ? widthMatch[1].trim() : null;
    });

    // Get table width from inline style or parent wrapper div
    let tableWidthMatch = tableStyle.match(/width:\s*([^;]+)/);
    let tableWidth = tableWidthMatch ? tableWidthMatch[1].trim() : null;

    // If table doesn't have width, check parent div for width
    if (!tableWidth) {
        const parentDiv = element.parentElement;
        if (parentDiv && parentDiv.tagName.toLowerCase() === "div") {
            const parentStyle = parentDiv.getAttribute("style") || "";
            const parentWidthMatch = parentStyle.match(/width:\s*([^;]+)/);
            if (parentWidthMatch) {
                tableWidth = parentWidthMatch[1].trim();
            }
        }
    }

    // Calculate total width from cell widths if no table width found
    if (!tableWidth) {
        const firstRow = element.querySelector("tr");
        if (firstRow) {
            let totalWidth = 0;
            const cells = firstRow.querySelectorAll("th, td");
            cells.forEach((cell) => {
                const cellStyle = cell.getAttribute("style") || "";
                const cellWidthMatch = cellStyle.match(/width:\s*(\d+(?:\.\d+)?)(px)?/);
                if (cellWidthMatch) {
                    totalWidth += parseFloat(cellWidthMatch[1]);
                }
            });
            if (totalWidth > 0) {
                tableWidth = `${totalWidth}px`;
            }
        }
    }

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
                    const widthPattern = /width\s*:/i;
                    if (!widthPattern.test(existingStyle)) {
                        existingStyle = `width: ${columnWidths[colIndex]}; min-width: ${columnWidths[colIndex]}; ${existingStyle}`;
                        cell.setAttribute("style", existingStyle.trim());
                    }
                }

                colIndex += colspan;
            });
        });
    }

    // Ensure table has proper width style and table-layout
    let existingStyle = element.getAttribute("style") || "";
    if (tableWidth) {
        const widthPattern = /width\s*:/i;
        if (!widthPattern.test(existingStyle)) {
            existingStyle = `width: ${tableWidth}; ${existingStyle}`;
        }
    }
    // Add table-layout: fixed for consistent column widths if we have cell widths defined
    const hasCellWidths = Array.from(element.querySelectorAll("th, td")).some(cell => {
        const cellStyle = cell.getAttribute("style") || "";
        return /width\s*:/i.test(cellStyle);
    });
    const tableLayoutPattern = /table-layout\s*:/i;
    if ((columnWidths.some(w => w !== null) || hasCellWidths) && !tableLayoutPattern.test(existingStyle)) {
        existingStyle = `table-layout: fixed; ${existingStyle}`;
    }
    
    // Ensure table has minimum width to prevent collapse
    if (!tableWidth && !existingStyle.includes("width:")) {
        existingStyle = `width: 100%; ${existingStyle}`;
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
 * Handle span elements - preserve formatting including color
 */
function handleSpanElement(element: Element): void {
    const style = element.getAttribute("style") || "";
    let innerElement: Element = element;

    // Check for font-weight: bold in style
    if (style.includes("font-weight") && (style.includes("bold") || style.includes("600") || style.includes("700"))) {
        // Wrap content in strong
        const strong = element.ownerDocument.createElement("strong");
        while (innerElement.firstChild) {
            strong.appendChild(innerElement.firstChild);
        }
        innerElement.appendChild(strong);
        innerElement = strong;
    }

    // Check for font-style: italic
    if (style.includes("font-style") && style.includes("italic")) {
        const em = element.ownerDocument.createElement("em");
        while (innerElement.firstChild) {
            em.appendChild(innerElement.firstChild);
        }
        innerElement.appendChild(em);
        innerElement = em;
    }

    // Check for text-decoration: underline
    if (style.includes("text-decoration") && style.includes("underline")) {
        const u = element.ownerDocument.createElement("u");
        while (innerElement.firstChild) {
            u.appendChild(innerElement.firstChild);
        }
        innerElement.appendChild(u);
        innerElement = u;
    }

    // Preserve important text styles in the span
    // Extract color, font-size, font-family, and line-height to keep text formatting
    const preservedStyles: string[] = [];

    // Preserve font-weight even after wrapping in <strong> to ensure bold survives theme overrides
    const fontWeightMatch = style.match(/font-weight\s*:\s*([^;]+)/i);
    if (fontWeightMatch) {
        preservedStyles.push(`font-weight: ${fontWeightMatch[1].trim()}`);
    }

    // Preserve font-style (italic) inline as a fallback
    const fontStyleMatch = style.match(/font-style\s*:\s*([^;]+)/i);
    if (fontStyleMatch) {
        preservedStyles.push(`font-style: ${fontStyleMatch[1].trim()}`);
    }

    // Preserve text-decoration inline (e.g., underline)
    const textDecorationMatch = style.match(/text-decoration\s*:\s*([^;]+)/i);
    if (textDecorationMatch) {
        preservedStyles.push(`text-decoration: ${textDecorationMatch[1].trim()}`);
    }
    
    // Preserve color (non-black only)
    const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    if (colorMatch) {
        const colorValue = colorMatch[1].trim();
        if (colorValue.toLowerCase() !== "#000000" && colorValue.toLowerCase() !== "black" && colorValue !== "rgb(0, 0, 0)") {
            preservedStyles.push(`color: ${colorValue}`);
        }
    }
    
    // Preserve font-size
    const fontSizeMatch = style.match(/font-size\s*:\s*([^;]+)/i);
    if (fontSizeMatch) {
        preservedStyles.push(`font-size: ${fontSizeMatch[1].trim()}`);
    }
    
    // Preserve font-family
    const fontFamilyMatch = style.match(/font-family\s*:\s*([^;]+)/i);
    if (fontFamilyMatch) {
        preservedStyles.push(`font-family: ${fontFamilyMatch[1].trim()}`);
    }
    
    // Preserve line-height
    const lineHeightMatch = style.match(/line-height\s*:\s*([^;]+)/i);
    if (lineHeightMatch) {
        preservedStyles.push(`line-height: ${lineHeightMatch[1].trim()}`);
    }
    
    // Set the preserved styles or remove the style attribute if none
    if (preservedStyles.length > 0) {
        element.setAttribute("style", preservedStyles.join("; "));
    } else {
        element.removeAttribute("style");
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
