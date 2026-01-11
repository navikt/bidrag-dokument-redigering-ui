import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalEditor } from "lexical";
import { MutableRefObject, useEffect, useRef } from "react";

import { importContentToEditor, importHTMLToEditor, importJSONToEditor, importRTFToEditor } from "../utils/editorImportExport";
import { isRTFContent } from "../utils/rtfConverter";

interface InitialContentPluginProps {
    content: string;
    contentType?: "html" | "rtf" | "json" | "auto";
    editorRef?: MutableRefObject<LexicalEditor | null>;
}

/**
 * Plugin to load initial content into the Lexical editor.
 * Supports HTML, RTF, JSON, and plain text content.
 */
export default function InitialContentPlugin({
    content,
    contentType = "auto",
    editorRef,
}: InitialContentPluginProps) {
    const [editor] = useLexicalComposerContext();
    const hasLoaded = useRef(false);

    // Store editor reference
    useEffect(() => {
        if (editorRef) {
            editorRef.current = editor;
        }
    }, [editor, editorRef]);

    // Load initial content
    useEffect(() => {
        if (hasLoaded.current || !content) return;
        hasLoaded.current = true;

        // Determine content type if auto
        let detectedType = contentType;
        if (contentType === "auto") {
            if (isRTFContent(content)) {
                detectedType = "rtf";
            } else if (content.trim().startsWith("{") && content.includes('"root"')) {
                detectedType = "json";
            } else if (content.trim().startsWith("<")) {
                detectedType = "html";
            }
        }

        // Import content based on type
        try {
            switch (detectedType) {
                case "rtf":
                    importRTFToEditor(editor, content);
                    break;
                case "json":
                    importJSONToEditor(editor, content);
                    break;
                case "html":
                    importHTMLToEditor(editor, content);
                    break;
                default:
                    importContentToEditor(editor, content);
            }
        } catch (error) {
            console.error("Failed to import content:", error);
            // Fallback: try importing as plain text
            importContentToEditor(editor, content);
        }
    }, [content, contentType, editor]);

    return null;
}
