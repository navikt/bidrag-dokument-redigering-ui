/**
 * Extended TableCellNode that preserves width and other styling from HTML import
 */
import {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
} from "lexical";
import {
    TableCellHeaderStates,
    TableCellNode,
    SerializedTableCellNode,
} from "@lexical/table";

function parseWidthToNumber(widthStr: string | undefined): number | undefined {
    if (!widthStr) return undefined;
    // Remove 'px' and parse as number
    const match = widthStr.match(/^(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : undefined;
}

function convertTableCellElement(domNode: HTMLElement): DOMConversionOutput {
    const cell = domNode as HTMLTableCellElement;
    const isHeader = cell.tagName === "TH";
    const headerState = isHeader ? TableCellHeaderStates.ROW : TableCellHeaderStates.NO_STATUS;
    const colSpan = cell.colSpan || 1;
    const rowSpan = cell.rowSpan || 1;

    // Extract width from style (inline style takes precedence)
    const style = cell.getAttribute("style") || "";
    const widthMatch = style.match(/width:\s*([^;]+)/);
    const widthStr = widthMatch ? widthMatch[1].trim() : undefined;
    const width = parseWidthToNumber(widthStr);

    // Extract background color
    const bgMatch = style.match(/background(?:-color)?:\s*([^;]+)/);
    const backgroundColor = bgMatch ? bgMatch[1].trim() : undefined;

    // Extract all border properties
    const borderProps = [
        "border", "border-top", "border-right", "border-bottom", "border-left",
        "border-width", "border-style", "border-color"
    ];
    const borderStyles: Record<string, string> = {};
    borderProps.forEach(prop => {
        const regex = new RegExp(`${prop}:\\s*([^;]+)`, "i");
        const match = style.match(regex);
        if (match) {
            borderStyles[prop] = match[1].trim();
        }
    });

    const tableCellNode = $createExtendedTableCellNode(headerState, colSpan, width);
    tableCellNode.setRowSpan(rowSpan);
    if (backgroundColor) {
        tableCellNode.setBackgroundColor(backgroundColor);
    }
    if (Object.keys(borderStyles).length > 0) {
        tableCellNode.__borderStyles = borderStyles;
    }

    return { node: tableCellNode };
}

export function $createExtendedTableCellNode(
    headerState: number = TableCellHeaderStates.NO_STATUS,
    colSpan = 1,
    width?: number
): ExtendedTableCellNode {
    return new ExtendedTableCellNode(headerState, colSpan, width);
}

export function $isExtendedTableCellNode(
    node: LexicalNode | null | undefined
): node is ExtendedTableCellNode {
    return node instanceof ExtendedTableCellNode;
}

export class ExtendedTableCellNode extends TableCellNode {
    __borderStyles?: Record<string, string>;

    static getType(): string {
        return "extended-table-cell";
    }

    static clone(node: ExtendedTableCellNode): ExtendedTableCellNode {
        const clone = new ExtendedTableCellNode(
            node.__headerState,
            node.__colSpan,
            node.__width,
            node.__key
        );
        clone.__rowSpan = node.__rowSpan;
        clone.__backgroundColor = node.__backgroundColor;
        clone.__borderStyles = node.__borderStyles;
        return clone;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            td: () => ({
                conversion: convertTableCellElement,
                priority: 1, // Higher priority than default TableCellNode
            }),
            th: () => ({
                conversion: convertTableCellElement,
                priority: 1,
            }),
        };
    }

    static importJSON(serializedNode: SerializedTableCellNode): ExtendedTableCellNode {
        const node = $createExtendedTableCellNode(
            serializedNode.headerState,
            serializedNode.colSpan,
            serializedNode.width
        );
        node.setRowSpan(serializedNode.rowSpan || 1);
        if (serializedNode.backgroundColor) {
            node.setBackgroundColor(serializedNode.backgroundColor);
        }
        return node;
    }

    constructor(
        headerState: number = TableCellHeaderStates.NO_STATUS,
        colSpan = 1,
        width?: number,
        key?: NodeKey
    ) {
        super(headerState, colSpan, width, key);
    }

    exportDOM(editor: import("lexical").LexicalEditor): DOMExportOutput {
        const element = document.createElement(
            this.getHeaderStyles() !== TableCellHeaderStates.NO_STATUS ? "th" : "td"
        ) as HTMLTableCellElement;

        if (this.__colSpan > 1) {
            element.colSpan = this.__colSpan;
        }
        if (this.__rowSpan > 1) {
            element.rowSpan = this.__rowSpan;
        }

        // Apply width and background styles
        const styles: string[] = [];
        const width = this.getWidth();
        if (width) {
            styles.push(`width: ${width}px`);
            styles.push(`min-width: ${width}px`);
        }
        const bgColor = this.getBackgroundColor();
        if (bgColor) {
            styles.push(`background-color: ${bgColor}`);
        }
        // Apply border styles
        if (this.__borderStyles) {
            Object.entries(this.__borderStyles).forEach(([prop, value]) => {
                styles.push(`${prop}: ${value}`);
            });
        }
        if (styles.length > 0) {
            element.style.cssText = styles.join("; ");
        }

        return { element };
    }

    createDOM(config: EditorConfig): HTMLTableCellElement {
        const element = super.createDOM(config);

        // Apply width style if set - use both width and min-width
        const width = this.getWidth();
        if (width) {
            element.style.width = `${width}px`;
            element.style.minWidth = `${width}px`;
        }

        // Apply border styles if set
        if (this.__borderStyles) {
            Object.entries(this.__borderStyles).forEach(([prop, value]) => {
                // Convert property name to camelCase for style object
                const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
                (element.style as any)[camelProp] = value;
            });
        }

        return element;
    }
}
