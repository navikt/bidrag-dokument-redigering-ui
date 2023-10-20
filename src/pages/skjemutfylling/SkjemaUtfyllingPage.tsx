//@ts-ignore
import styles from "./pdfviewer.lazy.css";
styles.use();
import { EyeIcon } from "@navikt/aksel-icons";
import { LoggerService, queryParams } from "@navikt/bidrag-ui-common";
import { BroadcastMessage } from "@navikt/bidrag-ui-common";
import { Broadcast } from "@navikt/bidrag-ui-common";
import { FileUtils } from "@navikt/bidrag-ui-common";
import { BroadcastNames } from "@navikt/bidrag-ui-common";
import { Button, Loader } from "@navikt/ds-react";
import { useMutation } from "@tanstack/react-query";
import * as pdfjsLib from "pdfjs-dist";
import { AnnotationMode, PDFDocumentProxy } from "pdfjs-dist";
import { EventBus, PDFPageView } from "pdfjs-dist/web/pdf_viewer";
import React, { PropsWithChildren, useContext, useEffect, useRef, useState } from "react";

import { lastDokumenter, RedigeringQueries } from "../../api/queries";
import { useDebounce } from "../../components/hooks/useDebounce";
import Toolbar from "../../components/toolbar/Toolbar";
import { createArrayWithLength } from "../../components/utils/ObjectUtils";
import { PdfDocumentType } from "../../components/utils/types";
import { IDocumentMetadata } from "../../types/EditorTypes";
import PageWrapper from "../PageWrapper";
import FerdigstillButton from "./FerdigstillButton";
import { getFormValues, setAnnotationValue } from "./FormHelper";
import { FormPdfProducer } from "./FormPdfProducer";
import SaveStateIndicator from "./SaveStateIndicator";
import { SkjemautfyllingMetadata } from "./types";
import UnlockSkjemaButton from "./UnlockSkjemaButton";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.js", import.meta.url).toString();

interface SkjemaUtfyllingPageProps {
    forsendelseId: string;
    dokumentreferanse?: string;
    dokumenter?: string[];
}
interface SkjemaUtfyllingContextProps {
    pdfDocument: PDFDocumentProxy;
    getPdfWithFilledForm: () => Promise<Uint8Array>;
    broadcast: () => void;
    forsendelseId: string;
    dokumentreferanse: string;
    dokumentMetadata: IDocumentMetadata<SkjemautfyllingMetadata>;
}
export const useSkjemaUtfyllingContext = () => {
    const context = useContext(SkjemaUtfyllingContext);
    if (context === undefined) {
        throw new Error("usePdfViewerContext must be used within a SkjemaUtfyllingProvider");
    }
    return context;
};
export const SkjemaUtfyllingContext = React.createContext<SkjemaUtfyllingContextProps>(
    {} as SkjemaUtfyllingContextProps
);

export default function SkjemaUtfyllingPage(props: SkjemaUtfyllingPageProps) {
    return (
        <PageWrapper name={"skjemautfylling"}>
            <React.Suspense fallback={<Loader size="large"></Loader>}>
                <SkjemaUtfyllingContainer {...props} />
            </React.Suspense>
        </PageWrapper>
    );
}

function SkjemaUtfyllingContainer({ forsendelseId, dokumentreferanse, dokumenter }: SkjemaUtfyllingPageProps) {
    const { data: documentFile, isLoading } = lastDokumenter(forsendelseId, dokumentreferanse, dokumenter, true, false);
    const { data: dokumentMetadata } = RedigeringQueries.hentRedigeringmetadata<SkjemautfyllingMetadata>(
        forsendelseId,
        dokumentreferanse
    );
    if (!isLoading && !documentFile) {
        return <div>Det skjedde en feil ved lasting av dokument</div>;
    }

    return (
        <DocumentView
            file={documentFile}
            forsendelseId={forsendelseId}
            dokumentreferanse={dokumentreferanse}
            dokumentMetadata={dokumentMetadata}
        />
    );
}
interface DocumentViewProps extends PropsWithChildren<unknown> {
    file: PdfDocumentType;
    forsendelseId: string;
    dokumentreferanse: string;
    dokumentMetadata?: IDocumentMetadata<SkjemautfyllingMetadata>;
}
function DocumentView({ file, dokumentreferanse, forsendelseId, dokumentMetadata }: DocumentViewProps) {
    const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy>();
    const [pagesLoaded, setPagesLoaded] = useState([]);
    const [scale, setScale] = useState(1.3);
    const pdfDocumentRef = useRef<PDFDocumentProxy>();
    const pdfViewerDivRef = useRef<HTMLDivElement>();
    const isRendering = useRef<boolean>(false);
    const producerRef = useRef(new FormPdfProducer(file));
    const lagreEndringerFn = RedigeringQueries.lagreEndringer(forsendelseId, dokumentreferanse);

    const onSaveDebounced = useDebounce(saveChanges);
    function broadcast() {
        const params = queryParams();
        const message: BroadcastMessage<unknown> = Broadcast.convertToBroadcastMessage(params.id, {});
        Broadcast.sendBroadcast(BroadcastNames.EDIT_DOCUMENT_RESULT, message);
    }

    function onWindowClose(e) {
        return broadcast();
    }

    useEffect(() => {
        window.addEventListener("beforeunload", onWindowClose);
        return () => window.removeEventListener("beforeunload", onWindowClose);
    }, []);

    useEffect(() => {
        if (isRendering.current) return;
        isRendering.current = true;
        loadDocument();
    }, []);

    useEffect(() => {
        return subscribeToChanges();
    }, [pdfViewerDivRef.current]);

    function saveChanges() {
        if (!pdfDocument) return;
        getFormValues(pdfDocument).then((formValues) => {
            lagreEndringerFn.mutate({
                formValues: Array.from(formValues.entries()),
            } as SkjemautfyllingMetadata);
        });
    }
    function subscribeToChanges() {
        if (!pdfViewerDivRef.current) return () => null;
        pdfViewerDivRef.current.addEventListener("keyup", onSaveDebounced);
        pdfViewerDivRef.current.addEventListener("mouseup", onSaveDebounced);

        return () => {
            pdfViewerDivRef.current.removeEventListener("keyup", onSaveDebounced);
            pdfViewerDivRef.current.removeEventListener("mouseup", onSaveDebounced);
        };
    }

    useEffect(loadInitialData, [pagesLoaded]);

    function loadInitialData() {
        const initialSkjemadata = dokumentMetadata?.editorMetadata;
        if (initialSkjemadata?.formValues) {
            const formValues = new Map(initialSkjemadata.formValues);
            for (const pageNumber of formValues.keys()) {
                if (pagesLoaded.includes(pageNumber)) {
                    formValues.get(pageNumber).forEach(setAnnotationValue);
                }
            }
        }
    }

    async function loadDocument() {
        const documentBuffer = file instanceof Blob ? await file.arrayBuffer() : file;
        return pdfjsLib
            .getDocument({ data: documentBuffer, enableXfa: true })
            .promise.then((pdfDoc) => {
                pdfDocumentRef.current = pdfDoc;
                return pdfDoc;
            })
            .then((pdfDoc) => {
                setPdfDocument(pdfDoc);
            })
            .catch(function (reason) {
                LoggerService.error(
                    `Det skjedde en feil ved lasting av dokument ${forsendelseId} - ${dokumentreferanse}`,
                    reason
                );
            });
    }

    async function getPdfWithFilledForm(): Promise<Uint8Array> {
        return producerRef.current
            .init(pdfDocument)
            .then((a) => a.process())
            .then((a) => a.saveChanges())
            .then((a) => a.getProcessedDocument());
    }

    if (!pdfDocument) {
        return null;
    }
    return (
        <SkjemaUtfyllingContext.Provider
            value={{ pdfDocument, getPdfWithFilledForm, forsendelseId, dokumentreferanse, broadcast, dokumentMetadata }}
        >
            <EditorToolbar />
            <div className="pdfViewer overflow-auto h-[calc(100%_-_100px)]" ref={pdfViewerDivRef}>
                {createArrayWithLength(pdfDocument.numPages).map((pageNumber) => (
                    <DocumentPage
                        pageNumber={pageNumber + 1}
                        scale={scale}
                        onPageLoaded={() => setPagesLoaded((prev) => [...prev, pageNumber + 1])}
                    />
                ))}
            </div>
        </SkjemaUtfyllingContext.Provider>
    );
}

function EditorToolbar() {
    const { getPdfWithFilledForm, dokumentMetadata } = useSkjemaUtfyllingContext();
    const previewDocumentFn = useMutation({
        mutationKey: ["previewDocumentFn"],
        mutationFn: () => getPdfWithFilledForm().then((doc) => FileUtils.openFile(doc)),
    });

    function renderToolbarButtons() {
        if (dokumentMetadata.state == "LOCKED") {
            return <UnlockSkjemaButton />;
        }
        return (
            <>
                <SaveStateIndicator />
                <Button
                    onClick={() => previewDocumentFn.mutate()}
                    size={"small"}
                    variant={"tertiary-neutral"}
                    icon={<EyeIcon />}
                    loading={previewDocumentFn.isPending}
                    iconPosition={"left"}
                >
                    Vis
                </Button>
                <FerdigstillButton />
            </>
        );
    }
    return (
        <Toolbar>
            <div className={"buttons_right w-full"}>{renderToolbarButtons()}</div>
        </Toolbar>
    );
}

interface DocumentPageProps {
    pageNumber: number;
    scale: number;
    onPageLoaded?: () => void;
}
function DocumentPage({ pageNumber, onPageLoaded, scale }: DocumentPageProps) {
    const { pdfDocument } = useSkjemaUtfyllingContext();
    const divRef = useRef<HTMLDivElement>();
    const isDrawn = useRef(false);
    const pdfPageViewRef = useRef<PDFPageView>();

    useEffect(() => {
        if (isDrawn.current) return;
        isDrawn.current = true;
        drawPage();
    }, []);

    useEffect(() => {
        pdfPageViewRef.current?.draw().then(onPageLoaded);
    }, [scale]);
    async function drawPage() {
        const container = divRef.current;
        const pdfPage = await pdfDocument.getPage(pageNumber);

        const eventBus = new EventBus();
        // Creating the page view with default parameters.
        pdfPageViewRef.current = new PDFPageView({
            container,
            id: pageNumber,
            scale,
            defaultViewport: pdfPage.getViewport({ scale }),
            eventBus: eventBus,
            annotationMode: AnnotationMode.ENABLE_FORMS,
        });
        // Associate the actual page with the view, and draw it.
        pdfPageViewRef.current.setPdfPage(pdfPage);
        pdfPageViewRef.current.draw().then(onPageLoaded);
    }

    return <div ref={divRef}></div>;
}
