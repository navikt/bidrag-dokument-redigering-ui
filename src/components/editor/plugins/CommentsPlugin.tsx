import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $createTextNode, TextNode, ElementNode, $getNodeByKey, NodeKey, LexicalEditor, RangeSelection, $isTextNode, COMMAND_PRIORITY_LOW } from "lexical";
import { DecoratorNode } from "lexical";
import { mergeRegister } from "@lexical/utils";
import React, { useCallback, useEffect, useRef, useState, createContext, useContext } from "react";
import { createPortal } from "react-dom";

// Comment data structure
export interface Comment {
    id: string;
    text: string;
    author?: string;
    createdAt: Date;
    startOffset: number;
    endOffset: number;
    anchorKey: NodeKey;
    focusKey: NodeKey;
    isResolved: boolean;
}

// Context for sharing comments state
interface CommentsContextType {
    comments: Comment[];
    addComment: (comment: Comment) => void;
    updateComment: (id: string, text: string) => void;
    deleteComment: (id: string) => void;
    resolveComment: (id: string) => void;
    activeCommentId: string | null;
    setActiveCommentId: (id: string | null) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    isSaving: boolean;
    lastSaved: Date | null;
}

export const CommentsContext = createContext<CommentsContextType | null>(null);

// Generate unique ID
function generateUID(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Local storage key for comments
const COMMENTS_STORAGE_KEY = "lexical-editor-comments";

// Load comments from localStorage
function loadCommentsFromStorage(): Comment[] {
    try {
        const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Convert date strings back to Date objects
            return parsed.map((c: Comment) => ({
                ...c,
                createdAt: new Date(c.createdAt),
            }));
        }
    } catch (e) {
        console.error("Failed to load comments from storage:", e);
    }
    return [];
}

// Save comments to localStorage (fallback when no backend save is configured)
function saveCommentsToStorage(comments: Comment[]): void {
    try {
        localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
    } catch (e) {
        console.error("Failed to save comments to storage:", e);
    }
}

// CommentsProvider component
export function CommentsProvider({ 
    children, 
    initialNotes,
    onSaveNotes 
}: { 
    children: React.ReactNode;
    initialNotes?: Comment[];
    onSaveNotes?: (notes: Comment[]) => Promise<void> | void;
}) {
    const [comments, setComments] = useState<Comment[]>(() => {
        // Use initialNotes if provided (from backend), otherwise load from localStorage
        if (initialNotes && initialNotes.length > 0) {
            return initialNotes.map(c => ({
                ...c,
                createdAt: c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt)
            }));
        }
        return loadCommentsFromStorage();
    });
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Show by default
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-save comments when they change
    useEffect(() => {
        // Debounce the save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        setIsSaving(true);
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                // Try to save to backend if callback provided, otherwise use localStorage
                if (onSaveNotes) {
                    await onSaveNotes(comments);
                } else {
                    saveCommentsToStorage(comments);
                }
                setIsSaving(false);
                setLastSaved(new Date());
            } catch (error) {
                console.error("Failed to auto-save comments:", error);
                setIsSaving(false);
            }
        }, 500);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [comments, onSaveNotes]);

    const addComment = useCallback((comment: Comment) => {
        setComments((prev) => [...prev, comment]);
    }, []);

    const updateComment = useCallback((id: string, text: string) => {
        setComments((prev) =>
            prev.map((c) => (c.id === id ? { ...c, text } : c))
        );
    }, []);

    const deleteComment = useCallback((id: string) => {
        setComments((prev) => prev.filter((c) => c.id !== id));
    }, []);

    const resolveComment = useCallback((id: string) => {
        setComments((prev) =>
            prev.map((c) => (c.id === id ? { ...c, isResolved: !c.isResolved } : c))
        );
    }, []);

    return (
        <CommentsContext.Provider
            value={{
                comments,
                addComment,
                updateComment,
                deleteComment,
                resolveComment,
                activeCommentId,
                setActiveCommentId,
                isSidebarOpen,
                setIsSidebarOpen,
                isSaving,
                lastSaved,
            }}
        >
            {children}
        </CommentsContext.Provider>
    );
}

export function useComments() {
    const context = useContext(CommentsContext);
    if (!context) {
        throw new Error("useComments must be used within a CommentsProvider");
    }
    return context;
}

// Comment highlight mark component
interface CommentMarkProps {
    commentId: string;
    children: React.ReactNode;
}

function CommentMark({ commentId, children }: CommentMarkProps) {
    const { activeCommentId, setActiveCommentId } = useComments();
    const isActive = activeCommentId === commentId;

    return (
        <span
            className={`comment-mark ${isActive ? "comment-mark-active" : ""}`}
            onClick={() => setActiveCommentId(commentId)}
            style={{
                backgroundColor: isActive ? "#fff59d" : "#fffde7",
                borderBottom: isActive ? "2px solid #ffc107" : "2px solid #fff176",
                cursor: "pointer",
                padding: "0 2px",
            }}
        >
            {children}
        </span>
    );
}

// Comment input popup
interface CommentInputPopupProps {
    position: { x: number; y: number };
    onSubmit: (text: string) => void;
    onCancel: () => void;
}

function CommentInputPopup({ position, onSubmit, onCancel }: CommentInputPopupProps) {
    const [text, setText] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = () => {
        if (text.trim()) {
            onSubmit(text.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === "Escape") {
            onCancel();
        }
    };

    return createPortal(
        <div
            className="comment-input-popup"
            style={{
                position: "fixed",
                left: position.x,
                top: position.y,
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                padding: "12px",
                zIndex: 1000,
                width: "280px",
            }}
        >
            <div style={{ marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>Add Comment</div>
            <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your comment..."
                style={{
                    width: "100%",
                    minHeight: "80px",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    resize: "vertical",
                    fontSize: "13px",
                    boxSizing: "border-box",
                }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px", justifyContent: "flex-end" }}>
                <button
                    onClick={onCancel}
                    style={{
                        padding: "6px 12px",
                        backgroundColor: "#f0f0f0",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!text.trim()}
                    style={{
                        padding: "6px 12px",
                        backgroundColor: text.trim() ? "#1976d2" : "#ccc",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: text.trim() ? "pointer" : "not-allowed",
                        fontSize: "12px",
                    }}
                >
                    Add Comment
                </button>
            </div>
        </div>,
        document.body
    );
}

// Floating comment preview popup (shown on hover when sidebar is closed)
interface CommentPreviewPopupProps {
    comment: Comment;
    position: { x: number; y: number };
    onClose: () => void;
    onOpenSidebar: () => void;
}

function CommentPreviewPopup({ comment, position, onClose, onOpenSidebar }: CommentPreviewPopupProps) {
    const { resolveComment, deleteComment, isSaving } = useComments();

    return createPortal(
        <div
            className="comment-preview-popup"
            style={{
                position: "fixed",
                left: Math.min(position.x, window.innerWidth - 300),
                top: position.y,
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                padding: "12px",
                zIndex: 1001,
                width: "280px",
                maxWidth: "90vw",
            }}
            onMouseLeave={onClose}
        >
            {/* Header with comment icon and save indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffc107">
                        <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                    </svg>
                    <span style={{ fontSize: "11px", color: "#999" }}>
                        {comment.createdAt.toLocaleString()}
                    </span>
                </div>
                {isSaving && (
                    <span style={{ fontSize: "10px", color: "#ff9800", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ 
                            width: "6px", 
                            height: "6px", 
                            borderRadius: "50%", 
                            backgroundColor: "#ff9800",
                            animation: "pulse 1s infinite"
                        }} />
                        Saving
                    </span>
                )}
            </div>

            {/* Comment text */}
            <p style={{ 
                margin: "0 0 12px 0", 
                fontSize: "13px", 
                lineHeight: "1.5",
                color: "#333",
                maxHeight: "100px",
                overflow: "auto",
            }}>
                {comment.text}
            </p>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "4px" }}>
                    <button
                        onClick={() => resolveComment(comment.id)}
                        style={{
                            padding: "4px 8px",
                            backgroundColor: "#e8f5e9",
                            color: "#2e7d32",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "11px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                        }}
                    >
                        ✓ Resolve
                    </button>
                    <button
                        onClick={() => deleteComment(comment.id)}
                        style={{
                            padding: "4px 8px",
                            backgroundColor: "#ffebee",
                            color: "#c62828",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "11px",
                            cursor: "pointer",
                        }}
                    >
                        🗑️
                    </button>
                </div>
                <button
                    onClick={onOpenSidebar}
                    style={{
                        padding: "4px 8px",
                        backgroundColor: "#e3f2fd",
                        color: "#1565c0",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "11px",
                        cursor: "pointer",
                    }}
                >
                    View all →
                </button>
            </div>
        </div>,
        document.body
    );
}

// Comment markers overlay - shows comment cards on the side of commented text
interface CommentMarkersOverlayProps {
    editor: LexicalEditor;
    anchorElem: HTMLElement;
}

function CommentMarkersOverlay({ editor, anchorElem }: CommentMarkersOverlayProps) {
    const { comments, activeCommentId, setActiveCommentId, isSidebarOpen, setIsSidebarOpen, resolveComment, deleteComment } = useComments();
    const [markers, setMarkers] = useState<{ comment: Comment; rect: DOMRect }[]>([]);
    const [editorBounds, setEditorBounds] = useState<DOMRect | null>(null);

    // Update marker positions when comments change or editor updates
    useEffect(() => {
        const updateMarkers = () => {
            const newMarkers: { comment: Comment; rect: DOMRect }[] = [];
            const editorRoot = editor.getRootElement();
            
            if (editorRoot) {
                setEditorBounds(editorRoot.getBoundingClientRect());
            }
            
            comments.filter(c => !c.isResolved).forEach(comment => {
                // Find elements with this comment's ID in their style
                if (!editorRoot) return;

                // Look for spans with the comment ID in style
                const allSpans = editorRoot.querySelectorAll('span[style*="--comment-id"]');
                allSpans.forEach(span => {
                    const style = span.getAttribute('style') || '';
                    if (style.includes(comment.id)) {
                        const rect = span.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) {
                            newMarkers.push({ comment, rect });
                        }
                    }
                });
            });

            setMarkers(newMarkers);
        };

        updateMarkers();

        // Update on scroll and resize
        const handleScroll = () => updateMarkers();
        const handleResize = () => updateMarkers();

        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);

        // Update on editor changes
        const unregister = editor.registerUpdateListener(() => {
            setTimeout(updateMarkers, 50);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize);
            unregister();
        };
    }, [comments, editor]);

    const handleCardClick = (comment: Comment) => {
        setActiveCommentId(comment.id);
    };

    // Don't show side comments when sidebar is open
    if (isSidebarOpen) {
        return null;
    }

    // Calculate card width based on available space
    const cardWidth = 220;
    const cardGap = 8;

    return (
        <>
            {/* Always visible comment cards on the side */}
            {markers.map(({ comment, rect }, index) => {
                const isActive = activeCommentId === comment.id;
                // Position to the right of the editor content
                const rightPosition = editorBounds 
                    ? Math.max(editorBounds.right + 20, rect.right + 30)
                    : rect.right + 30;

                return (
                    <div
                        key={`${comment.id}-${index}`}
                        className={`comment-side-card ${isActive ? 'comment-side-card-active' : ''}`}
                        style={{
                            position: "fixed",
                            left: rightPosition,
                            top: rect.top,
                            width: `${cardWidth}px`,
                            backgroundColor: isActive ? "#fff8e1" : "#fff",
                            border: isActive ? "2px solid #ffc107" : "1px solid #e0e0e0",
                            borderRadius: "8px",
                            boxShadow: isActive 
                                ? "0 4px 12px rgba(255, 193, 7, 0.3)" 
                                : "0 2px 8px rgba(0,0,0,0.1)",
                            padding: "10px 12px",
                            zIndex: isActive ? 101 : 100,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            maxWidth: "calc(100vw - 40px)",
                        }}
                        onClick={() => handleCardClick(comment)}
                    >
                        {/* Connector line to the commented text */}
                        <div
                            style={{
                                position: "absolute",
                                left: "-20px",
                                top: "12px",
                                width: "20px",
                                height: "2px",
                                backgroundColor: isActive ? "#ffc107" : "#e0e0e0",
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                left: "-24px",
                                top: "8px",
                                width: "10px",
                                height: "10px",
                                backgroundColor: "#ffc107",
                                borderRadius: "50%",
                                border: "2px solid #fff",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            }}
                        />

                        {/* Header */}
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between",
                            marginBottom: "6px" 
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffc107">
                                    <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
                                </svg>
                                <span style={{ fontSize: "10px", color: "#999" }}>
                                    {comment.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            
                            {/* Quick actions */}
                            <div style={{ display: "flex", gap: "2px" }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        resolveComment(comment.id);
                                    }}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "2px",
                                        fontSize: "12px",
                                        opacity: 0.6,
                                    }}
                                    title="Resolve"
                                >
                                    ✓
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteComment(comment.id);
                                    }}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "2px",
                                        fontSize: "12px",
                                        opacity: 0.6,
                                        color: "#d32f2f",
                                    }}
                                    title="Delete"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Comment text */}
                        <p style={{ 
                            margin: 0, 
                            fontSize: "12px", 
                            lineHeight: "1.4",
                            color: "#333",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                        }}>
                            {comment.text}
                        </p>

                        {/* View all link when active */}
                        {isActive && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsSidebarOpen(true);
                                }}
                                style={{
                                    marginTop: "8px",
                                    padding: "4px 8px",
                                    backgroundColor: "#e3f2fd",
                                    color: "#1565c0",
                                    border: "none",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    cursor: "pointer",
                                    width: "100%",
                                }}
                            >
                                Open all comments →
                            </button>
                        )}
                    </div>
                );
            })}
        </>
    );
}

// Comments sidebar
interface CommentsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    editor: LexicalEditor;
}

function CommentsSidebar({ isOpen, onClose, editor }: CommentsSidebarProps) {
    const { comments, activeCommentId, setActiveCommentId, deleteComment, resolveComment, updateComment, isSaving, lastSaved } = useComments();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");

    const handleEdit = (comment: Comment) => {
        setEditingId(comment.id);
        setEditText(comment.text);
    };

    const handleSaveEdit = (id: string) => {
        if (editText.trim()) {
            updateComment(id, editText.trim());
        }
        setEditingId(null);
        setEditText("");
    };

    const scrollToComment = (comment: Comment) => {
        setActiveCommentId(comment.id);
        editor.update(() => {
            const node = $getNodeByKey(comment.anchorKey);
            if (node) {
                const element = editor.getElementByKey(comment.anchorKey);
                element?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    };

    const activeComments = comments.filter((c) => !c.isResolved);
    const resolvedComments = comments.filter((c) => c.isResolved);

    // Format last saved time
    const formatLastSaved = (date: Date | null) => {
        if (!date) return "";
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 5) return "Just now";
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return date.toLocaleTimeString();
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className="comments-sidebar"
            style={{
                position: "fixed",
                right: 0,
                top: 0,
                bottom: 0,
                width: "320px",
                backgroundColor: "#fff",
                borderLeft: "1px solid #e0e0e0",
                boxShadow: "-4px 0 16px rgba(0,0,0,0.1)",
                zIndex: 999,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    borderBottom: "1px solid #e0e0e0",
                }}
            >
                <div>
                    <h3 style={{ margin: 0, fontSize: "16px" }}>Comments ({activeComments.length})</h3>
                    {/* Auto-save indicator */}
                    <div style={{ fontSize: "11px", color: "#888", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                        {isSaving ? (
                            <>
                                <span style={{ 
                                    display: "inline-block", 
                                    width: "8px", 
                                    height: "8px", 
                                    borderRadius: "50%", 
                                    backgroundColor: "#ff9800",
                                    animation: "pulse 1s infinite"
                                }} />
                                Saving...
                            </>
                        ) : lastSaved ? (
                            <>
                                <span style={{ 
                                    display: "inline-block", 
                                    width: "8px", 
                                    height: "8px", 
                                    borderRadius: "50%", 
                                    backgroundColor: "#4caf50"
                                }} />
                                Saved {formatLastSaved(lastSaved)}
                            </>
                        ) : null}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        fontSize: "18px",
                        color: "#666",
                    }}
                    title="Hide comments"
                >
                    ✕
                </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                {activeComments.length === 0 && resolvedComments.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#999", padding: "40px 20px" }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="#ccc" style={{ marginBottom: "12px" }}>
                            <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                        </svg>
                        <p style={{ margin: 0, fontSize: "14px" }}>No comments yet</p>
                        <p style={{ margin: "8px 0 0", fontSize: "12px" }}>
                            Select text and click the comment button to add notes
                        </p>
                    </div>
                ) : (
                    <>
                        {activeComments.map((comment) => (
                            <div
                                key={comment.id}
                                onClick={() => scrollToComment(comment)}
                                className={`comment-card ${activeCommentId === comment.id ? "comment-card-active" : ""}`}
                                style={{
                                    padding: "12px",
                                    marginBottom: "8px",
                                    borderRadius: "8px",
                                    backgroundColor: activeCommentId === comment.id ? "#fff8e1" : "#f5f5f5",
                                    border: activeCommentId === comment.id ? "1px solid #ffc107" : "1px solid transparent",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "11px", color: "#999" }}>
                                        {comment.createdAt.toLocaleString()}
                                    </span>
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(comment);
                                            }}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                padding: "2px",
                                                color: "#666",
                                                fontSize: "12px",
                                            }}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                resolveComment(comment.id);
                                            }}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                padding: "2px",
                                                color: "#666",
                                                fontSize: "12px",
                                            }}
                                            title="Resolve"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteComment(comment.id);
                                            }}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                padding: "2px",
                                                color: "#d32f2f",
                                                fontSize: "12px",
                                            }}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                {editingId === comment.id ? (
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "8px",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                fontSize: "13px",
                                                boxSizing: "border-box",
                                            }}
                                        />
                                        <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                                            <button
                                                onClick={() => handleSaveEdit(comment.id)}
                                                style={{
                                                    padding: "4px 8px",
                                                    backgroundColor: "#1976d2",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    fontSize: "11px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                style={{
                                                    padding: "4px 8px",
                                                    backgroundColor: "#f0f0f0",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    fontSize: "11px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.4" }}>{comment.text}</p>
                                )}
                            </div>
                        ))}

                        {resolvedComments.length > 0 && (
                            <>
                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#999",
                                        fontWeight: 600,
                                        marginTop: "16px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    RESOLVED ({resolvedComments.length})
                                </div>
                                {resolvedComments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        onClick={() => scrollToComment(comment)}
                                        style={{
                                            padding: "12px",
                                            marginBottom: "8px",
                                            borderRadius: "8px",
                                            backgroundColor: "#e8f5e9",
                                            border: "1px solid #c8e6c9",
                                            cursor: "pointer",
                                            opacity: 0.7,
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span style={{ fontSize: "11px", color: "#999" }}>
                                                {comment.createdAt.toLocaleString()}
                                            </span>
                                            <div style={{ display: "flex", gap: "4px" }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        resolveComment(comment.id);
                                                    }}
                                                    style={{
                                                        background: "none",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        padding: "2px",
                                                        color: "#4caf50",
                                                        fontSize: "12px",
                                                    }}
                                                    title="Reopen"
                                                >
                                                    ↩️
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteComment(comment.id);
                                                    }}
                                                    style={{
                                                        background: "none",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        padding: "2px",
                                                        color: "#d32f2f",
                                                        fontSize: "12px",
                                                    }}
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "13px",
                                                lineHeight: "1.4",
                                                textDecoration: "line-through",
                                            }}
                                        >
                                            {comment.text}
                                        </p>
                                    </div>
                                ))}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}

// Main Comments Plugin
interface CommentsPluginProps {
    anchorElem: HTMLElement;
}

export default function CommentsPlugin({ anchorElem }: CommentsPluginProps) {
    const [editor] = useLexicalComposerContext();
    const { comments, addComment, setActiveCommentId, isSidebarOpen, setIsSidebarOpen } = useComments();
    const [showInput, setShowInput] = useState(false);
    const [inputPosition, setInputPosition] = useState({ x: 0, y: 0 });
    const [selectionInfo, setSelectionInfo] = useState<{
        anchorKey: NodeKey;
        focusKey: NodeKey;
        startOffset: number;
        endOffset: number;
        text: string;
    } | null>(null);

    const handleAddCommentClick = useCallback(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection) && !selection.isCollapsed()) {
                const anchorNode = selection.anchor.getNode();
                const focusNode = selection.focus.getNode();
                const text = selection.getTextContent();
                
                // Get the DOM selection for positioning
                const domSelection = window.getSelection();
                if (domSelection && domSelection.rangeCount > 0) {
                    const range = domSelection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    
                    setInputPosition({
                        x: Math.min(rect.left, window.innerWidth - 300),
                        y: rect.bottom + 8,
                    });
                    
                    setSelectionInfo({
                        anchorKey: anchorNode.getKey(),
                        focusKey: focusNode.getKey(),
                        startOffset: selection.anchor.offset,
                        endOffset: selection.focus.offset,
                        text,
                    });
                    
                    setShowInput(true);
                }
            }
        });
    }, [editor]);

    const handleSubmitComment = useCallback(
        (text: string) => {
            if (selectionInfo) {
                const comment: Comment = {
                    id: generateUID(),
                    text,
                    createdAt: new Date(),
                    startOffset: selectionInfo.startOffset,
                    endOffset: selectionInfo.endOffset,
                    anchorKey: selectionInfo.anchorKey,
                    focusKey: selectionInfo.focusKey,
                    isResolved: false,
                };
                
                addComment(comment);
                setShowInput(false);
                setSelectionInfo(null);
                setIsSidebarOpen(true);
                setActiveCommentId(comment.id);
                
                // Apply highlight to the selected text using CSS class
                editor.update(() => {
                    const anchorNode = $getNodeByKey(selectionInfo.anchorKey);
                    if ($isTextNode(anchorNode)) {
                        // Store comment ID in node's style/data attribute
                        // Use a custom CSS variable and specific background for comment marking
                        const currentStyle = anchorNode.getStyle();
                        const newStyle = `${currentStyle}; --comment-id: ${comment.id}; --is-commented: true; background: linear-gradient(to bottom, transparent 0%, transparent 85%, #ffc107 85%, #ffc107 100%); border-right: 3px solid #ffc107; padding-right: 4px; margin-right: 2px;`;
                        anchorNode.setStyle(newStyle);
                    }
                });
            }
        },
        [selectionInfo, addComment, editor, setActiveCommentId]
    );

    // Check if there's a valid selection for commenting
    const [hasSelection, setHasSelection] = useState(false);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                setHasSelection($isRangeSelection(selection) && !selection.isCollapsed());
            });
        });
    }, [editor]);

    return (
        <>
            {/* Comment markers overlay - shows icons on commented text */}
            <CommentMarkersOverlay editor={editor} anchorElem={anchorElem} />

            {/* Comment button in toolbar area or floating */}
            {hasSelection && (
                <button
                    onClick={handleAddCommentClick}
                    className="add-comment-button"
                    style={{
                        position: "fixed",
                        bottom: "80px",
                        right: isSidebarOpen ? "340px" : "20px",
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "#1976d2",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
                        zIndex: 998,
                        transition: "right 0.3s ease",
                    }}
                    title="Add comment to selection"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM17 11h-4v4h-2v-4H7V9h4V5h2v4h4v2z" />
                    </svg>
                </button>
            )}

            {/* Toggle sidebar button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="toggle-comments-button"
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: isSidebarOpen ? "340px" : "20px",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: comments.filter(c => !c.isResolved).length > 0 ? "#ff9800" : "#757575",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    zIndex: 998,
                    transition: "right 0.3s ease",
                }}
                title={`${isSidebarOpen ? "Hide" : "Show"} comments (${comments.filter(c => !c.isResolved).length})`}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                </svg>
                {comments.filter(c => !c.isResolved).length > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: "-4px",
                            right: "-4px",
                            backgroundColor: "#d32f2f",
                            color: "white",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            fontSize: "11px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                        }}
                    >
                        {comments.filter(c => !c.isResolved).length}
                    </span>
                )}
            </button>

            {/* Comment input popup */}
            {showInput && (
                <CommentInputPopup
                    position={inputPosition}
                    onSubmit={handleSubmitComment}
                    onCancel={() => {
                        setShowInput(false);
                        setSelectionInfo(null);
                    }}
                />
            )}

            {/* Comments sidebar */}
            <CommentsSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} editor={editor} />
        </>
    );
}
