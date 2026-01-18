import "./Editor.css";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { LinkNode } from "@lexical/link";
import { EditorState, LexicalEditor } from "lexical";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { importContentToEditor, exportEditorToJSON, exportEditorToHTML } from "./utils/editorImportExport";
import EditorToolbar from "./EditorToolbar";
import InitialContentPlugin from "./plugins/InitialContentPlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import ComponentPickerPlugin from "./plugins/ComponentPickerPlugin";
import TableActionMenuPlugin from "./plugins/TableActionMenuPlugin";
import { TableResizeHandlesPlugin } from "./plugins/TableResizeHandlesPlugin";
import CommentsPlugin, { CommentsProvider, Comment, useComments } from "./plugins/CommentsPlugin";
import PdfPreviewPlugin from "./plugins/PdfPreviewPlugin";
import ListShortcutPlugin from "./plugins/ListShortcutPlugin";
import ImagePastePlugin from "./plugins/ImagePastePlugin";
import EditorRefPlugin from "./plugins/EditorRefPlugin";
import { ImageNode } from "./nodes/ImageNode";
import { ExtendedTableCellNode } from "./nodes/ExtendedTableCellNode";
import { ExtendedTableNode } from "./nodes/ExtendedTableNode";
import { ExtendedTextNode } from "./nodes/ExtendedTextNode";

export interface WysiwygEditorProps {
    /** Initial content - can be HTML, RTF, or JSON */
    initialContent?: string;
    /** Content type hint */
    contentType?: "html" | "rtf" | "json" | "auto";
    /** Callback when content changes */
    onChange?: (editorState: EditorState, editor: LexicalEditor) => void;
    /** Callback to save content */
    onSave?: (content: { html: string; json: string; notes: Comment[] }) => Promise<void>;
    /** Callback to load notes from backend */
    onLoadNotes?: () => Promise<Comment[]>;
    /** Whether the editor is read-only */
    readonly?: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** Document title */
    title?: string;
    /** Callback when title changes */
    onTitleChange?: (title: string) => void;
}

// Editor theme configuration
const editorTheme = {
    paragraph: "lexical-paragraph",
    text: {
        bold: "lexical-text-bold",
        italic: "lexical-text-italic",
        underline: "lexical-text-underline",
        strikethrough: "lexical-text-strikethrough",
        code: "lexical-text-code",
    },
    heading: {
        h1: "lexical-heading-h1",
        h2: "lexical-heading-h2",
        h3: "lexical-heading-h3",
        h4: "lexical-heading-h4",
        h5: "lexical-heading-h5",
    },
    list: {
        ul: "lexical-list-ul",
        ol: "lexical-list-ol",
        listitem: "lexical-listitem",
        nested: {
            listitem: "lexical-nested-listitem",
        },
    },
    table: "lexical-table",
    tableCell: "lexical-table-cell",
    tableCellHeader: "lexical-table-cell-header",
    tableRow: "lexical-table-row",
    quote: "lexical-quote",
    link: "lexical-link",
};

// Node types supported by the editor
const editorNodes = [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    TableNode,
    ExtendedTableNode,
    TableCellNode,
    ExtendedTableCellNode,
    TableRowNode,
    LinkNode,
    ImageNode,
    ExtendedTextNode,
];

function onError(error: Error): void {
    console.error("Lexical Editor Error:", error);
}

export default function WysiwygEditor({
    initialContent,
    contentType = "auto",
    onChange,
    onSave,
    onLoadNotes,
    readonly = false,
    placeholder = "Start typing your document...",
    title,
    onTitleChange,
}: WysiwygEditorProps) {
    const editorRef = useRef<LexicalEditor | null>(null);
    const floatingAnchorElemRef = useRef<HTMLDivElement | null>(null);
    const [isFloatingAnchorReady, setIsFloatingAnchorReady] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [initialNotes, setInitialNotes] = useState<Comment[]>([]);

    const onContentEditableRef = useCallback((contentEditableElem: HTMLDivElement | null) => {
        if (contentEditableElem !== null && floatingAnchorElemRef.current !== contentEditableElem) {
            floatingAnchorElemRef.current = contentEditableElem;
            setIsFloatingAnchorReady(true);
        }
    }, []);

    // Load notes from backend on mount
    useEffect(() => {
        if (onLoadNotes) {
            onLoadNotes()
                .then(notes => setInitialNotes(notes))
                .catch(error => console.error("Failed to load notes:", error));
        }
    }, [onLoadNotes]);

    const initialConfig = {
        namespace: "BidragWysiwygEditor",
        theme: editorTheme,
        nodes: editorNodes,
        onError,
        editable: !readonly,
    };

    const handleChange = useCallback(
        (editorState: EditorState, editor: LexicalEditor) => {
            // Update word count
            editorState.read(() => {
                const text = editor.getRootElement()?.textContent || "";
                const words = text.trim().split(/\s+/).filter(Boolean).length;
                setWordCount(words);
            });

            // Call external onChange handler
            if (onChange) {
                onChange(editorState, editor);
            }
        },
        [onChange]
    );

    const handleSave = useCallback(async () => {
        if (!editorRef.current || !onSave) return;

        setIsSaving(true);
        try {
            const html = await exportEditorToHTML(editorRef.current);
            const json = exportEditorToJSON(editorRef.current);
            
            // Get notes from CommentsPlugin via context
            const commentsElement = document.querySelector('[data-comments-root]');
            let notes: Comment[] = [];
            if (commentsElement) {
                // Notes will be collected from the CommentsContext via getCommentsForSave
                const event = new CustomEvent('getCommentsForSave');
                document.dispatchEvent(event);
                notes = (event as any).comments || [];
            }
            
            await onSave({ html, json, notes });
            setLastSaved(new Date());
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSaving(false);
        }
    }, [onSave]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                handleSave();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleSave]);

    return (
        <CommentsProvider initialNotes={initialNotes} onSaveNotes={onSave ? async (notes: Comment[]) => {
            // Notes will be saved with the document when user clicks save
        } : undefined}>
            <EditorContentWrapper
                initialContent={initialContent}
                contentType={contentType}
                onChange={onChange}
                onSave={onSave}
                readonly={readonly}
                placeholder={placeholder}
                title={title}
                onTitleChange={onTitleChange}
            />
        </CommentsProvider>
    );
}

// Inner component that has access to CommentsContext
function EditorContentWrapper({
    initialContent,
    contentType,
    onChange,
    onSave,
    readonly,
    placeholder,
    title,
    onTitleChange,
}: WysiwygEditorProps) {
    const { comments } = useComments();
    const editorRef = useRef<LexicalEditor | null>(null);
    const floatingAnchorElemRef = useRef<HTMLDivElement | null>(null);
    const [isFloatingAnchorReady, setIsFloatingAnchorReady] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    const onContentEditableRef = useCallback((contentEditableElem: HTMLDivElement | null) => {
        if (contentEditableElem !== null && floatingAnchorElemRef.current !== contentEditableElem) {
            floatingAnchorElemRef.current = contentEditableElem;
            setIsFloatingAnchorReady(true);
        }
    }, []);

    const initialConfig = {
        namespace: "BidragWysiwygEditor",
        theme: editorTheme,
        nodes: editorNodes,
        onError,
        editable: !readonly,
    };

    const handleChange = useCallback(
        (editorState: EditorState, editor: LexicalEditor) => {
            // Update word count
            editorState.read(() => {
                const text = editor.getRootElement()?.textContent || "";
                const words = text.trim().split(/\s+/).filter(Boolean).length;
                setWordCount(words);
            });

            // Call external onChange handler
            if (onChange) {
                onChange(editorState, editor);
            }
        },
        [onChange]
    );

    const handleSave = useCallback(async () => {
        if (!editorRef.current || !onSave) return;

        setIsSaving(true);
        try {
            const html = await exportEditorToHTML(editorRef.current);
            const json = exportEditorToJSON(editorRef.current);
            
            // Pass comments collected from context
            await onSave({ html, json, notes: comments });
            setLastSaved(new Date());
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSaving(false);
        }
    }, [onSave, comments]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                handleSave();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleSave]);

    return (
        <div className="lexical-editor-container">
            <LexicalComposer initialConfig={initialConfig}>
                <EditorToolbar 
                    onSave={handleSave} 
                    isSaving={isSaving} 
                    editorRef={editorRef}
                    onPreviewPdf={() => setShowPdfPreview(true)}
                />
            
            <div className="lexical-editor-content-wrapper">
                <RichTextPlugin
                    contentEditable={
                        <div ref={onContentEditableRef} className="lexical-editor-content-area">
                            <ContentEditable className="lexical-editor-content" />
                        </div>
                    }
                    placeholder={
                        <div className="lexical-editor-placeholder">
                            {placeholder}
                        </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />
            </div>

            {/* Plugins */}
            <HistoryPlugin />
            <ListPlugin />
            <TablePlugin />
            <TabIndentationPlugin />
            <AutoFocusPlugin />
            <ComponentPickerPlugin />
            <ListShortcutPlugin />
            <ImagePastePlugin />
            <TableResizeHandlesPlugin />
            
            {/* Capture editor reference for use in save handlers */}
            <EditorRefPlugin editorRef={editorRef} />
            
            {/* Draggable block plugin - only render when anchor element is ready */}
            {isFloatingAnchorReady && floatingAnchorElemRef.current && (
                <>
                    <DraggableBlockPlugin anchorElem={floatingAnchorElemRef.current} />
                    <TableActionMenuPlugin anchorElem={floatingAnchorElemRef.current} />
                    <CommentsPlugin anchorElem={floatingAnchorElemRef.current} />
                </>
            )}
            
            <OnChangePlugin onChange={handleChange} />
            
            {/* PDF Preview Plugin */}
            <PdfPreviewPlugin 
                isOpen={showPdfPreview} 
                onClose={() => setShowPdfPreview(false)} 
            />
            
            {/* Initial content loading plugin */}
            {initialContent && (
                <InitialContentPlugin 
                    content={initialContent} 
                    contentType={contentType}
                />
            )}

            {/* Status bar */}
            <div className="lexical-editor-statusbar">
                <div className="lexical-editor-statusbar-left">
                    <span>Words: {wordCount}</span>
                </div>
                <div className="lexical-editor-statusbar-right">
                    {isSaving && <span>Saving...</span>}
                    {lastSaved && !isSaving && (
                        <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                    )}
                </div>
            </div>
        </LexicalComposer>
    </div>
    );
}
