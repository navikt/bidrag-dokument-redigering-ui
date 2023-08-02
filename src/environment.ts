// @ts-nocheck
const system = {
    isTest: process.env.NODE_ENV === "TEST",
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
};

const url = {
    static_url: process.env.STATIC_FILES_URL,
    bidragDokument: process.env.BIDRAG_DOKUMENT_URL,
    bidragDokumentForsendelse: process.env.BIDRAG_DOKUMENT_FORSENDELSE_URL,
};

export default { url, system };
