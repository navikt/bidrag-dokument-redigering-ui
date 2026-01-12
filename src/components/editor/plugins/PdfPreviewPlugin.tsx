import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface PdfPreviewPluginProps {
    isOpen: boolean;
    onClose: () => void;
}

// CSS styles to inject into the PDF HTML
const PDF_STYLES = `
    body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.5;
        color: #000;
        max-width: 210mm;
        margin: 0 auto;
        padding: 20mm;
        background: white;
    }
    h1 { font-size: 24pt; font-weight: bold; margin: 24pt 0 12pt 0; }
    h2 { font-size: 20pt; font-weight: bold; margin: 20pt 0 10pt 0; }
    h3 { font-size: 16pt; font-weight: bold; margin: 16pt 0 8pt 0; }
    h4 { font-size: 14pt; font-weight: bold; margin: 14pt 0 7pt 0; }
    h5 { font-size: 12pt; font-weight: bold; margin: 12pt 0 6pt 0; }
    p { margin: 0 0 12pt 0; }
    ul, ol { margin: 8pt 0 16pt 0; padding-left: 32pt; }
    ul { list-style-type: disc; }
    ol { list-style-type: decimal; }
    li { margin: 4pt 0; }
    table { width: 100%; border-collapse: collapse; margin: 16pt 0; }
    th, td { border: 1px solid #000; padding: 8pt 12pt; text-align: left; }
    th { background-color: #f0f0f0; font-weight: bold; }
    blockquote { margin: 16pt 0; padding: 12pt 20pt; border-left: 4pt solid #333; background-color: #f5f5f5; font-style: italic; }
    a { color: #0000EE; text-decoration: underline; }
    .lexical-text-bold { font-weight: bold; }
    .lexical-text-italic { font-style: italic; }
    .lexical-text-underline { text-decoration: underline; }
    .lexical-text-strikethrough { text-decoration: line-through; }
    
    /* Image styles for PDF */
    img, .lexical-image {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 12pt 0;
        page-break-inside: avoid;
    }
    
    /* Hide comment markers in PDF - remove all comment styling */
    .comment-mark,
    .comment-mark-active {
        background: none !important;
        background-color: transparent !important;
        border: none !important;
        border-bottom: none !important;
        border-right: none !important;
        padding: 0 !important;
        margin: 0 !important;
    }
    /* Remove inline comment styles applied to spans */
    span[style*="--is-commented"],
    span[style*="--comment-id"] {
        background: none !important;
        background-color: transparent !important;
        border: none !important;
        border-bottom: none !important;
        border-right: none !important;
        padding: 0 !important;
        margin: 0 !important;
    }
    
    @media print {
        body { padding: 0; }
        @page { margin: 20mm; }
        /* Ensure comment styling is hidden in print */
        .comment-mark,
        .comment-mark-active,
        span[style*="--is-commented"],
        span[style*="--comment-id"] {
            background: none !important;
            border: none !important;
        }
    }
`;

export default function PdfPreviewPlugin({ isOpen, onClose }: PdfPreviewPluginProps) {
    const [editor] = useLexicalComposerContext();
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const generatePdfPreview = useCallback(async () => {
        setIsGenerating(true);
        setError(null);

        try {
            // Get HTML content from editor
            let htmlContent = "";
            editor.update(
                () => {
                    htmlContent = $generateHtmlFromNodes(editor, null);
                },
                { discrete: true }
            );

            // Create a complete HTML document for printing
            const fullHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Document Preview</title>
                    <style>${PDF_STYLES}</style>
                </head>
                <body>
                    ${htmlContent}
                </body>
                </html>
            `;

            // Create a blob URL for the HTML
            const blob = new Blob([fullHtml], { type: "text/html" });
            const blobUrl = URL.createObjectURL(blob);
            setPdfBlobUrl(blobUrl);
        } catch (err) {
            console.error("Failed to generate PDF preview:", err);
            setError("Failed to generate PDF preview. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    }, [editor]);

    useEffect(() => {
        if (isOpen) {
            generatePdfPreview();
        } else {
            // Cleanup blob URL when closing
            if (pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
                setPdfBlobUrl(null);
            }
        }
    }, [isOpen, generatePdfPreview]);

    const handlePrint = useCallback(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.print();
        }
    }, []);

    const handleDownload = useCallback(async () => {
        if (!pdfBlobUrl) return;

        // For actual PDF download, we need to use the browser's print to PDF
        // or a library like jspdf/html2pdf
        // For now, we'll trigger print dialog which allows "Save as PDF"
        handlePrint();
    }, [pdfBlobUrl, handlePrint]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="pdf-preview-overlay"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="pdf-preview-modal"
                style={{
                    width: "90%",
                    maxWidth: "900px",
                    height: "90%",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        borderBottom: "1px solid #e0e0e0",
                        backgroundColor: "#f5f5f5",
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                        📄 PDF Preview
                    </h2>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            onClick={handlePrint}
                            disabled={isGenerating || !pdfBlobUrl}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#1976d2",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: isGenerating ? "not-allowed" : "pointer",
                                fontSize: "14px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                            </svg>
                            Print / Save as PDF
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#f0f0f0",
                                color: "#333",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px",
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div
                    style={{
                        flex: 1,
                        padding: "20px",
                        backgroundColor: "#e0e0e0",
                        overflow: "auto",
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    {isGenerating ? (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#666",
                            }}
                        >
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    border: "4px solid #e0e0e0",
                                    borderTopColor: "#1976d2",
                                    borderRadius: "50%",
                                    animation: "spin 1s linear infinite",
                                }}
                            />
                            <p style={{ marginTop: "16px" }}>Generating preview...</p>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : error ? (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#d32f2f",
                            }}
                        >
                            <p>{error}</p>
                            <button
                                onClick={generatePdfPreview}
                                style={{
                                    marginTop: "12px",
                                    padding: "8px 16px",
                                    backgroundColor: "#1976d2",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                Retry
                            </button>
                        </div>
                    ) : pdfBlobUrl ? (
                        <div
                            style={{
                                width: "210mm",
                                minHeight: "297mm",
                                backgroundColor: "white",
                                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                                overflow: "hidden",
                            }}
                        >
                            <iframe
                                ref={iframeRef}
                                src={pdfBlobUrl}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    minHeight: "297mm",
                                    border: "none",
                                }}
                                title="PDF Preview"
                            />
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "12px 20px",
                        borderTop: "1px solid #e0e0e0",
                        backgroundColor: "#f5f5f5",
                        fontSize: "12px",
                        color: "#666",
                        textAlign: "center",
                    }}
                >
                    💡 Tip: Use "Print / Save as PDF" to save this document as a PDF file
                </div>
            </div>
        </div>,
        document.body
    );
}
