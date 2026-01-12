import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes, COMMAND_PRIORITY_HIGH, PASTE_COMMAND } from "lexical";
import { useEffect } from "react";

import { $createImageNode, ImageNode } from "../nodes/ImageNode";

/**
 * ImagePastePlugin - Handles pasting images from clipboard
 *
 * Supports:
 * - Pasting images directly from clipboard (screenshots, copied images)
 * - Drag and drop images
 * - Converts clipboard image data to base64 data URLs
 */
export default function ImagePastePlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        // Handle paste events
        const removePasteListener = editor.registerCommand(
            PASTE_COMMAND,
            (event: ClipboardEvent) => {
                const clipboardData = event.clipboardData;
                if (!clipboardData) {
                    return false;
                }

                // Check for image files in clipboard
                const items = clipboardData.items;
                let hasImage = false;

                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.type.startsWith("image/")) {
                        hasImage = true;
                        const file = item.getAsFile();
                        if (file) {
                            // Convert image to base64 and insert
                            const reader = new FileReader();
                            reader.onload = () => {
                                const base64 = reader.result as string;
                                editor.update(() => {
                                    const imageNode = $createImageNode({
                                        altText: file.name || "Pasted image",
                                        src: base64,
                                        maxWidth: 800,
                                    });
                                    $insertNodes([imageNode]);
                                });
                            };
                            reader.readAsDataURL(file);
                        }
                    }
                }

                // If we handled an image, prevent default paste behavior
                if (hasImage) {
                    event.preventDefault();
                    return true;
                }

                return false;
            },
            COMMAND_PRIORITY_HIGH
        );

        // Handle drop events for images
        const handleDrop = (event: DragEvent) => {
            const dataTransfer = event.dataTransfer;
            if (!dataTransfer) return;

            const files = dataTransfer.files;
            let hasImage = false;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.type.startsWith("image/")) {
                    hasImage = true;
                    event.preventDefault();
                    event.stopPropagation();

                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64 = reader.result as string;
                        editor.update(() => {
                            const imageNode = $createImageNode({
                                altText: file.name || "Dropped image",
                                src: base64,
                                maxWidth: 800,
                            });
                            $insertNodes([imageNode]);
                        });
                    };
                    reader.readAsDataURL(file);
                }
            }

            return hasImage;
        };

        const rootElement = editor.getRootElement();
        if (rootElement) {
            rootElement.addEventListener("drop", handleDrop);
        }

        return () => {
            removePasteListener();
            if (rootElement) {
                rootElement.removeEventListener("drop", handleDrop);
            }
        };
    }, [editor]);

    return null;
}

// Export INSERT_IMAGE_COMMAND for toolbar use
export { ImageNode, $createImageNode } from "../nodes/ImageNode";
