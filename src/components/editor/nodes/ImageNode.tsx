import {
    $applyNodeReplacement,
    DecoratorNode,
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from "lexical";
import React, { ReactElement, Suspense } from "react";

export interface ImagePayload {
    altText: string;
    height?: number;
    key?: NodeKey;
    maxWidth?: number;
    src: string;
    width?: number;
}

export type SerializedImageNode = Spread<
    {
        altText: string;
        height?: number;
        maxWidth?: number;
        src: string;
        width?: number;
    },
    SerializedLexicalNode
>;

function ImageComponent({
    src,
    altText,
    width,
    height,
    maxWidth,
}: {
    src: string;
    altText: string;
    width?: number;
    height?: number;
    maxWidth?: number;
}): ReactElement {
    return (
        <img
            className="lexical-image"
            src={src}
            alt={altText}
            style={{
                maxWidth: maxWidth ? `${maxWidth}px` : "100%",
                width: width ? `${width}px` : "auto",
                height: height ? `${height}px` : "auto",
                display: "block",
                margin: "8px 0",
            }}
            draggable="false"
        />
    );
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
    if (domNode instanceof HTMLImageElement) {
        const { alt: altText, src, width, height } = domNode;
        const node = $createImageNode({ altText, src, width, height });
        return { node };
    }
    return null;
}

export class ImageNode extends DecoratorNode<ReactElement> {
    __src: string;
    __altText: string;
    __width?: number;
    __height?: number;
    __maxWidth?: number;

    static getType(): string {
        return "image";
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(node.__src, node.__altText, node.__maxWidth, node.__width, node.__height, node.__key);
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { altText, height, width, maxWidth, src } = serializedNode;
        const node = $createImageNode({
            altText,
            height,
            maxWidth,
            src,
            width,
        });
        return node;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            img: () => ({
                conversion: convertImageElement,
                priority: 0,
            }),
        };
    }

    constructor(src: string, altText: string, maxWidth?: number, width?: number, height?: number, key?: NodeKey) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__maxWidth = maxWidth;
        this.__width = width;
        this.__height = height;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement("img");
        element.setAttribute("src", this.__src);
        element.setAttribute("alt", this.__altText);
        if (this.__width) {
            element.setAttribute("width", this.__width.toString());
        }
        if (this.__height) {
            element.setAttribute("height", this.__height.toString());
        }
        element.style.maxWidth = this.__maxWidth ? `${this.__maxWidth}px` : "100%";
        return { element };
    }

    exportJSON(): SerializedImageNode {
        return {
            altText: this.__altText,
            height: this.__height,
            maxWidth: this.__maxWidth,
            src: this.__src,
            type: "image",
            version: 1,
            width: this.__width,
        };
    }

    setWidthAndHeight(width: number, height: number): void {
        const writable = this.getWritable();
        writable.__width = width;
        writable.__height = height;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement("span");
        const theme = config.theme;
        const className = theme.image;
        if (className !== undefined) {
            span.className = className;
        }
        return span;
    }

    updateDOM(): false {
        return false;
    }

    getSrc(): string {
        return this.__src;
    }

    getAltText(): string {
        return this.__altText;
    }

    decorate(): ReactElement {
        return (
            <Suspense fallback={null}>
                <ImageComponent
                    src={this.__src}
                    altText={this.__altText}
                    width={this.__width}
                    height={this.__height}
                    maxWidth={this.__maxWidth}
                />
            </Suspense>
        );
    }
}

export function $createImageNode({ altText, height, maxWidth, src, width, key }: ImagePayload): ImageNode {
    return $applyNodeReplacement(new ImageNode(src, altText, maxWidth, width, height, key));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
    return node instanceof ImageNode;
}
