/**
 * Extended TextNode that preserves color and background-color styles from HTML import
 */
import {
    $isTextNode,
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedTextNode,
    TextNode,
} from "lexical";

export interface SerializedExtendedTextNode extends SerializedTextNode {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontFamily?: string;
    lineHeight?: string;
}

function extractStyleProperties(style: string | null): { 
    color?: string; 
    backgroundColor?: string;
    fontSize?: string;
    fontFamily?: string;
    lineHeight?: string;
} {
    if (!style) return {};

    const result: { 
        color?: string; 
        backgroundColor?: string;
        fontSize?: string;
        fontFamily?: string;
        lineHeight?: string;
    } = {};

    // Extract color
    const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    if (colorMatch) {
        const color = colorMatch[1].trim();
        // Only save non-black colors
        if (color.toLowerCase() !== "#000000" && color.toLowerCase() !== "black" && color !== "rgb(0, 0, 0)") {
            result.color = color;
        }
    }

    // Extract background-color
    const bgMatch = style.match(/(?:^|;)\s*background-color\s*:\s*([^;]+)/i);
    if (bgMatch) {
        result.backgroundColor = bgMatch[1].trim();
    }

    // Extract font-size
    const fontSizeMatch = style.match(/font-size\s*:\s*([^;]+)/i);
    if (fontSizeMatch) {
        result.fontSize = fontSizeMatch[1].trim();
    }

    // Extract font-family
    const fontFamilyMatch = style.match(/font-family\s*:\s*([^;]+)/i);
    if (fontFamilyMatch) {
        result.fontFamily = fontFamilyMatch[1].trim();
    }

    // Extract line-height
    const lineHeightMatch = style.match(/line-height\s*:\s*([^;]+)/i);
    if (lineHeightMatch) {
        result.lineHeight = lineHeightMatch[1].trim();
    }

    return result;
}

function convertSpanElement(domNode: HTMLElement): DOMConversionOutput {
    const style = domNode.getAttribute("style");
    const { color, backgroundColor, fontSize, fontFamily, lineHeight } = extractStyleProperties(style);

    // Create a text node with the text content
    const node = $createExtendedTextNode(domNode.textContent || "", color, backgroundColor, fontSize, fontFamily, lineHeight);

    // Preserve formatting from parent or inline elements
    if (domNode.closest("strong, b") || style?.includes("font-weight: bold") || style?.includes("font-weight:bold")) {
        node.toggleFormat("bold");
    }
    if (domNode.closest("em, i") || style?.includes("font-style: italic") || style?.includes("font-style:italic")) {
        node.toggleFormat("italic");
    }
    if (domNode.closest("u") || style?.includes("text-decoration: underline") || style?.includes("text-decoration:underline")) {
        node.toggleFormat("underline");
    }
    if (domNode.closest("s, strike") || style?.includes("text-decoration: line-through") || style?.includes("text-decoration:line-through")) {
        node.toggleFormat("strikethrough");
    }

    return { node };
}

export function $createExtendedTextNode(text: string, color?: string, backgroundColor?: string, fontSize?: string, fontFamily?: string, lineHeight?: string): ExtendedTextNode {
    return new ExtendedTextNode(text, color, backgroundColor, fontSize, fontFamily, lineHeight);
}

export function $isExtendedTextNode(node: LexicalNode | null | undefined): node is ExtendedTextNode {
    return node instanceof ExtendedTextNode;
}

export class ExtendedTextNode extends TextNode {
    __color?: string;
    __backgroundColor?: string;
    __fontSize?: string;
    __fontFamily?: string;
    __lineHeight?: string;

    static getType(): string {
        return "extended-text";
    }

    static clone(node: ExtendedTextNode): ExtendedTextNode {
        const clone = new ExtendedTextNode(
            node.__text, 
            node.__color, 
            node.__backgroundColor, 
            node.__fontSize, 
            node.__fontFamily, 
            node.__lineHeight, 
            node.__key
        );
        clone.__format = node.__format;
        clone.__style = node.__style;
        clone.__mode = node.__mode;
        clone.__detail = node.__detail;
        return clone;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            span: (domNode: HTMLElement) => {
                const style = domNode.getAttribute("style");
                // Handle spans with styling properties we want to preserve
                if (style && (
                    style.includes("color:") || 
                    style.includes("background-color:") ||
                    style.includes("font-size:") ||
                    style.includes("font-family:") ||
                    style.includes("line-height:")
                )) {
                    return {
                        conversion: convertSpanElement,
                        priority: 1, // Higher priority than default
                    };
                }
                return null; // Let default handling take over
            },
        };
    }

    static importJSON(serializedNode: SerializedExtendedTextNode): ExtendedTextNode {
        const node = $createExtendedTextNode(
            serializedNode.text,
            serializedNode.color,
            serializedNode.backgroundColor,
            serializedNode.fontSize,
            serializedNode.fontFamily,
            serializedNode.lineHeight
        );
        node.setFormat(serializedNode.format);
        node.setDetail(serializedNode.detail);
        node.setMode(serializedNode.mode);
        node.setStyle(serializedNode.style);
        return node;
    }

    constructor(text: string, color?: string, backgroundColor?: string, fontSize?: string, fontFamily?: string, lineHeight?: string, key?: NodeKey) {
        super(text, key);
        this.__color = color;
        this.__backgroundColor = backgroundColor;
        this.__fontSize = fontSize;
        this.__fontFamily = fontFamily;
        this.__lineHeight = lineHeight;
    }

    getColor(): string | undefined {
        return this.getLatest().__color;
    }

    setColor(color: string | undefined): this {
        const writable = this.getWritable();
        writable.__color = color;
        return this;
    }

    getBackgroundColor(): string | undefined {
        return this.getLatest().__backgroundColor;
    }

    setBackgroundColor(backgroundColor: string | undefined): this {
        const writable = this.getWritable();
        writable.__backgroundColor = backgroundColor;
        return this;
    }

    getFontSize(): string | undefined {
        return this.getLatest().__fontSize;
    }

    setFontSize(fontSize: string | undefined): this {
        const writable = this.getWritable();
        writable.__fontSize = fontSize;
        return this;
    }

    getFontFamily(): string | undefined {
        return this.getLatest().__fontFamily;
    }

    setFontFamily(fontFamily: string | undefined): this {
        const writable = this.getWritable();
        writable.__fontFamily = fontFamily;
        return this;
    }

    getLineHeight(): string | undefined {
        return this.getLatest().__lineHeight;
    }

    setLineHeight(lineHeight: string | undefined): this {
        const writable = this.getWritable();
        writable.__lineHeight = lineHeight;
        return this;
    }

    exportDOM(editor: import("lexical").LexicalEditor): DOMExportOutput {
        const element = document.createElement("span");
        element.textContent = this.__text;

        // Apply styles
        const styles: string[] = [];
        if (this.__color) {
            styles.push(`color: ${this.__color}`);
        }
        if (this.__backgroundColor) {
            styles.push(`background-color: ${this.__backgroundColor}`);
        }
        if (this.__fontSize) {
            styles.push(`font-size: ${this.__fontSize}`);
        }
        if (this.__fontFamily) {
            styles.push(`font-family: ${this.__fontFamily}`);
        }
        if (this.__lineHeight) {
            styles.push(`line-height: ${this.__lineHeight}`);
        }
        if (styles.length > 0) {
            element.style.cssText = styles.join("; ");
        }

        return { element };
    }

    exportJSON(): SerializedExtendedTextNode {
        return {
            ...super.exportJSON(),
            type: "extended-text",
            color: this.__color,
            backgroundColor: this.__backgroundColor,
            fontSize: this.__fontSize,
            fontFamily: this.__fontFamily,
            lineHeight: this.__lineHeight,
        };
    }

    createDOM(config: EditorConfig): HTMLElement {
        const element = super.createDOM(config);

        // Apply text styles
        if (this.__color) {
            element.style.color = this.__color;
        }
        if (this.__backgroundColor) {
            element.style.backgroundColor = this.__backgroundColor;
        }
        if (this.__fontSize) {
            element.style.fontSize = this.__fontSize;
        }
        if (this.__fontFamily) {
            element.style.fontFamily = this.__fontFamily;
        }
        if (this.__lineHeight) {
            element.style.lineHeight = this.__lineHeight;
        }

        return element;
    }

    updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
        const isUpdated = super.updateDOM(prevNode, dom, config);
        let hasChanged = false;

        // Check if prevNode is an ExtendedTextNode
        if ($isExtendedTextNode(prevNode)) {
            // Update color styles if changed
            if (prevNode.__color !== this.__color) {
                if (this.__color) {
                    dom.style.color = this.__color;
                } else {
                    dom.style.removeProperty("color");
                }
                hasChanged = true;
            }
            if (prevNode.__backgroundColor !== this.__backgroundColor) {
                if (this.__backgroundColor) {
                    dom.style.backgroundColor = this.__backgroundColor;
                } else {
                    dom.style.removeProperty("background-color");
                }
                hasChanged = true;
            }
            if (prevNode.__fontSize !== this.__fontSize) {
                if (this.__fontSize) {
                    dom.style.fontSize = this.__fontSize;
                } else {
                    dom.style.removeProperty("font-size");
                }
                hasChanged = true;
            }
            if (prevNode.__fontFamily !== this.__fontFamily) {
                if (this.__fontFamily) {
                    dom.style.fontFamily = this.__fontFamily;
                } else {
                    dom.style.removeProperty("font-family");
                }
                hasChanged = true;
            }
            if (prevNode.__lineHeight !== this.__lineHeight) {
                if (this.__lineHeight) {
                    dom.style.lineHeight = this.__lineHeight;
                } else {
                    dom.style.removeProperty("line-height");
                }
                hasChanged = true;
            }
            return isUpdated || hasChanged;
        }

        // If prevNode is not an ExtendedTextNode, apply styles unconditionally
        if (this.__color) {
            dom.style.color = this.__color;
        }
        if (this.__backgroundColor) {
            dom.style.backgroundColor = this.__backgroundColor;
        }
        if (this.__fontSize) {
            dom.style.fontSize = this.__fontSize;
        }
        if (this.__fontFamily) {
            dom.style.fontFamily = this.__fontFamily;
        }
        if (this.__lineHeight) {
            dom.style.lineHeight = this.__lineHeight;
        }

        return isUpdated;
    }
}
