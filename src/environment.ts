// @ts-nocheck
const system = {
    isTest: process.env.NODE_ENV === "TEST",
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    environment: process.env.ENVIRONMENT,
    legacyEnvironment: process.env.LEGACY_ENVIRONMENT,
};

const feature = {
    validatePDF: process.env.VALIDATE_PDF == "true" || window.localStorage.getItem("validate_pdf") == "true",
    debugPage: process.env.ENABLE_DEBUG_PAGE == "true",
};

const url = {
    static_url: process.env.STATIC_FILES_URL,
    bidragDokument: process.env.BIDRAG_DOKUMENT_URL,
    bidragDokumentForsendelse: process.env.BIDRAG_DOKUMENT_FORSENDELSE_URL,
    bidragDokumentProduksjon: process.env.BIDRAG_DOKUMENT_PRODUKSJON_URL,
};

export default { url, system, feature };
