import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalEditor } from "lexical";
import { MutableRefObject, useEffect } from "react";

interface EditorRefPluginProps {
    editorRef: MutableRefObject<LexicalEditor | null>;
}

/**
 * Plugin to capture the Lexical editor reference for use outside of the LexicalComposer context.
 */
export default function EditorRefPlugin({ editorRef }: EditorRefPluginProps) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editorRef.current = editor;
    }, [editor, editorRef]);

    return null;
}
