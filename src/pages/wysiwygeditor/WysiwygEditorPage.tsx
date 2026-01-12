import { Loader } from "@navikt/ds-react";
import React, { Suspense } from "react";

import { useHentRTFDokument } from "../../api/queries";
import { WysiwygEditor } from "../../components/editor";
import PageWrapper from "../PageWrapper";

interface WysiwygEditorPageProps {
    journalpostId: string;
    dokumentreferanse: string;
}

/**
 * Page component for the WYSIWYG document editor.
 * Fetches RTF content by journalpostId and dokumentreferanse,
 * then opens it in the Lexical-based WYSIWYG editor.
 */
export default function WysiwygEditorPage({ journalpostId, dokumentreferanse }: WysiwygEditorPageProps) {
    console.log("WysiwygEditorPage props:", { journalpostId, dokumentreferanse });
    return (
        <PageWrapper name="wysiwyg-editor">
            <Suspense
                fallback={
                    <div className="flex items-center justify-center min-h-[600px]">
                        <Loader size="3xlarge" title="Laster dokument..." />
                    </div>
                }
            >
                <WysiwygEditorContainer journalpostId={journalpostId} dokumentreferanse={dokumentreferanse} />
            </Suspense>
        </PageWrapper>
    );
}

function WysiwygEditorContainer({ journalpostId, dokumentreferanse }: WysiwygEditorPageProps) {
    const { data: rtfContent, isLoading, isError, error } = useHentRTFDokument(journalpostId, dokumentreferanse);

    console.log("WysiwygEditorContainer state:", { rtfContent, isLoading, isError, error });
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <Loader size="3xlarge" title="Laster dokument..." />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
                <div className="text-red-600 text-lg">Det oppstod en feil ved lasting av dokumentet</div>
                <div className="text-gray-600 text-sm">{error instanceof Error ? error.message : "Ukjent feil"}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Prøv igjen
                </button>
            </div>
        );
    }

    if (!rtfContent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px]">
                <div className="text-gray-600">Ingen dokumentinnhold funnet</div>
            </div>
        );
    }

    const handleSave = async (content: { html: string; json: string }) => {
        console.log("Saving document:", {
            journalpostId,
            dokumentreferanse,
            content,
        });
        // TODO: Implement save to backend
        // await BIDRAG_FORSENDELSE_API.api.lagreDokument(journalpostId, dokumentreferanse, content);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
                <h1 className="text-lg font-semibold text-gray-800">Dokumentredigering</h1>
                <p className="text-sm text-gray-500">
                    Journalpost: {journalpostId} | Dokument: {dokumentreferanse}
                </p>
            </div>

            <div className="flex-1 overflow-hidden">
                <WysiwygEditor
                    initialContent={rtfContent}
                    contentType="auto"
                    onSave={handleSave}
                    placeholder="Start å skrive dokumentet ditt..."
                />
            </div>
        </div>
    );
}
