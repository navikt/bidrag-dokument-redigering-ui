/**
 * Extended TableNode that preserves table type (data vs layout) from HTML import
 */
import { SerializedTableNode, TableNode } from "@lexical/table";
import { DOMConversionMap, DOMConversionOutput, DOMExportOutput, EditorConfig, LexicalNode, NodeKey } from "lexical";

export type TableType = "data" | "layout";

export interface SerializedExtendedTableNode extends SerializedTableNode {
    tableType?: TableType;
}

function convertTableElement(domNode: HTMLElement): DOMConversionOutput {
    const tableType = domNode.getAttribute("data-table-type") as TableType | null;
    const hasThead = domNode.querySelector("thead") !== null;
    const hasColgroup = domNode.querySelector("colgroup") !== null;
    const hasTableClass = domNode.classList.contains("table");

    const isDataTable = tableType === "data" || hasThead || hasColgroup || hasTableClass;

    const tableNode = $createExtendedTableNode(isDataTable ? "data" : "layout");
    return { node: tableNode };
}

export function $createExtendedTableNode(tableType: TableType = "layout"): ExtendedTableNode {
    return new ExtendedTableNode(tableType);
}

export function $isExtendedTableNode(node: LexicalNode | null | undefined): node is ExtendedTableNode {
    return node instanceof ExtendedTableNode;
}

export class ExtendedTableNode extends TableNode {
    __tableType: TableType;

    static getType(): string {
        return "extended-table";
    }

    static clone(node: ExtendedTableNode): ExtendedTableNode {
        const clone = new ExtendedTableNode(node.__tableType, node.__key);
        return clone;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            table: () => ({
                conversion: convertTableElement,
                priority: 1, // Higher priority than default TableNode
            }),
        };
    }

    static importJSON(serializedNode: SerializedExtendedTableNode): ExtendedTableNode {
        const node = $createExtendedTableNode(serializedNode.tableType || "layout");
        return node;
    }

    constructor(tableType: TableType = "layout", key?: NodeKey) {
        super(key);
        this.__tableType = tableType;
    }

    getTableType(): TableType {
        return this.getLatest().__tableType;
    }

    setTableType(tableType: TableType): void {
        const writable = this.getWritable();
        writable.__tableType = tableType;
    }

    exportDOM(editor: import("lexical").LexicalEditor): DOMExportOutput {
        const result = super.exportDOM(editor);
        if (result.element && result.element instanceof HTMLElement) {
            result.element.setAttribute("data-table-type", this.__tableType);
        }
        return result;
    }

    exportJSON(): SerializedExtendedTableNode {
        return {
            ...super.exportJSON(),
            type: "extended-table",
            tableType: this.__tableType,
        };
    }

    createDOM(config: EditorConfig): HTMLElement {
        const element = super.createDOM(config);
        element.setAttribute("data-table-type", this.__tableType);
        return element;
    }

    updateDOM(): boolean {
        // Table node doesn't need DOM updates for the table type attribute
        return false;
    }
}
