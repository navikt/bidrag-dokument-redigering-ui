/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Adresse til mottaker hvis dokumentet sendes som brev */
export interface MottakerAdresseTo {
    adresselinje1: string;
    adresselinje2?: string;
    adresselinje3?: string;
    bruksenhetsnummer?: string;
    /** Lankode må være i ISO 3166-1 alpha-2 format */
    landkode?: string;
    /** Lankode må være i ISO 3166-1 alpha-3 format */
    landkode3?: string;
    postnummer?: string;
    poststed?: string;
}

export interface MottakerTo {
    ident?: string;
    språk?: string;
    navn?: string;
    identType?: "FNR" | "SAMHANDLER";
    /** Adresse til mottaker hvis dokumentet sendes som brev */
    adresse?: MottakerAdresseTo;
}

/** Metadata for dokument som skal knyttes til forsendelsen. Første dokument i listen blir automatisk satt som hoveddokument i forsendelsen */
export interface OpprettDokumentForesporsel {
    /** Dokumentets tittel */
    tittel: string;
    /** Språket på inneholdet i dokumentet. */
    språk?: string;
    /** Arkivsystem hvor dokument er lagret */
    arkivsystem?: "JOARK" | "MIDLERTIDLIG_BREVLAGER" | "UKJENT" | "BIDRAG";
    /**
     * Dato dokument ble opprettet
     * @format date-time
     */
    dokumentDato?: string;
    /** Referansen til dokumentet hvis det er allerede er lagret i arkivsystem. Hvis dette ikke settes opprettes det en ny dokumentreferanse som kan brukes ved opprettelse av dokument */
    dokumentreferanse?: string;
    /** JournalpostId til dokumentet hvis det er allerede er lagret i arkivsystem */
    journalpostId?: string;
    /** DokumentmalId sier noe om dokumentets innhold og oppbygning. (Også kjent som brevkode) */
    dokumentmalId?: string;
    /** Dette skal være UNDER_PRODUKSJON for redigerbare dokumenter som ikke er ferdigprodusert. Ellers settes det til FERDIGSTILT */
    status:
        | "IKKE_BESTILT"
        | "BESTILLING_FEILET"
        | "AVBRUTT"
        | "UNDER_PRODUKSJON"
        | "UNDER_REDIGERING"
        | "FERDIGSTILT"
        | "MÅ_KONTROLLERES"
        | "KONTROLLERT";
    /** Om dokumentet med dokumentmalId skal bestilles. Hvis dette er satt til false så antas det at kallende system bestiller dokumentet selv. */
    bestillDokument: boolean;
    /** Dokument metadata */
    metadata?: Record<string, string>;
}

/** Metadata for opprettelse av forsendelse */
export interface OpprettForsendelseForesporsel {
    /** Ident til brukeren som journalposten gjelder */
    gjelderIdent: string;
    mottaker?: MottakerTo;
    /**
     *
     *     Dokumenter som skal knyttes til journalpost.
     *     En journalpost må minst ha et dokument.
     *     Det første dokument i meldingen blir tilknyttet som hoveddokument på journalposten.
     */
    dokumenter: OpprettDokumentForesporsel[];
    /** Bidragsak som forsendelse skal tilknyttes */
    saksnummer: string;
    /** NAV-enheten som oppretter forsendelsen */
    enhet: string;
    /** Identifikator til batch kjøring forsendelsen ble opprettet av */
    batchId?: string;
    /** Tema forsendelsen skal opprettes med */
    tema?: "BID" | "FAR";
    /** Språk forsendelsen skal være på */
    språk?: string;
    /** Ident til saksbehandler som oppretter journalpost. Dette vil prioriteres over ident som tilhører tokenet til kallet. */
    saksbehandlerIdent?: string;
}

/** Metadata til en respons etter dokumenter i forsendelse ble opprettet */
export interface DokumentRespons {
    dokumentreferanse: string;
    tittel: string;
    /** @format date-time */
    dokumentDato: string;
    journalpostId?: string;
    dokumentmalId?: string;
    metadata: Record<string, string>;
    status?:
        | "IKKE_BESTILT"
        | "BESTILLING_FEILET"
        | "AVBRUTT"
        | "UNDER_PRODUKSJON"
        | "UNDER_REDIGERING"
        | "FERDIGSTILT"
        | "MÅ_KONTROLLERES"
        | "KONTROLLERT";
    arkivsystem?: "JOARK" | "MIDLERTIDLIG_BREVLAGER" | "UKJENT" | "BIDRAG";
}

/** Metadata til en respons etter forsendelse ble opprettet */
export interface OpprettForsendelseRespons {
    /**
     * ForsendelseId på forsendelse som ble opprettet
     * @format int64
     */
    forsendelseId?: number;
    /** Liste med dokumenter som er knyttet til journalposten */
    dokumenter: DokumentRespons[];
}

/** En avvikshendelse som kan utføres på en journalpost */
export interface Avvikshendelse {
    /** Type avvik */
    avvikType: string;
    /** Manuell beskrivelse av avvik */
    beskrivelse?: string;
    /** Eventuelle detaljer som skal følge avviket */
    detaljer: Record<string, string>;
    /** Saksnummer til sak når journalpost er journalført */
    saksnummer?: string;
    /** Adresse for hvor brev sendes ved sentral print */
    adresse?: DistribuerTilAdresse;
    /** Dokumenter som brukes ved kopiering ny journalpost. Benyttes ved avvik KOPIER_FRA_ANNEN_FAGOMRADE */
    dokumenter?: DokumentDto[];
}

/** Adresse for hvor brev sendes ved sentral print */
export interface DistribuerTilAdresse {
    adresselinje1?: string;
    adresselinje2?: string;
    adresselinje3?: string;
    /** ISO 3166-1 alpha-2 to-bokstavers landkode */
    land?: string;
    postnummer?: string;
    poststed?: string;
}

/** Metadata for et dokument */
export interface DokumentDto {
    /** Referansen til dokumentet i arkivsystemet */
    dokumentreferanse?: string;
    /** Journalpost hvor dokumentet er arkivert. Dette brukes hvis dokumentet er arkivert i annen arkivsystem enn det som er sendt med i forespørsel. */
    journalpostId?: string;
    /**
     * Inngående (I), utgående (U) dokument, (X) internt notat
     * @deprecated
     */
    dokumentType?: string;
    /** Kort oppsummering av dokumentets innhold */
    tittel?: string;
    /** Selve PDF dokumentet formatert som Base64 */
    dokument?: string;
    /**
     * Typen dokument. Brevkoden sier noe om dokumentets innhold og oppbygning. Erstattes av dokumentmalId
     * @deprecated
     */
    brevkode?: string;
    /** Typen dokument. Dokumentmal sier noe om dokumentets innhold og oppbygning. */
    dokumentmalId?: string;
    /** Dokumentets status. Benyttes hvis journalposten er av typen forsendelse */
    status?: "IKKE_BESTILT" | "BESTILLING_FEILET" | "UNDER_PRODUKSJON" | "UNDER_REDIGERING" | "FERDIGSTILT" | "AVBRUTT";
    /** Arkivsystem hvor dokumentet er produsert og lagret */
    arkivSystem?: "JOARK" | "MIDLERTIDLIG_BREVLAGER" | "UKJENT" | "BIDRAG";
    /** Metadata om dokumentet */
    metadata: Record<string, string>;
}

/** Bestill distribusjon av journalpost */
export interface DistribuerJournalpostRequest {
    /** Identifiserer batch som forsendelsen inngår i. Brukes for sporing */
    batchId?: string;
    /** Forsendelsen er skrevet ut og distribuert lokalt. Distribusjon registreres men ingen distribusjon bestilles. */
    lokalUtskrift: boolean;
    /** Adresse for hvor brev sendes ved sentral print */
    adresse?: DistribuerTilAdresse;
}

/** Respons etter bestilt distribusjon */
export interface DistribuerJournalpostResponse {
    /** Journalpostid for dokument som det ble bestilt distribusjon for */
    journalpostId: string;
    /** Bestillingid som unikt identifiserer distribusjonsbestillingen. Vil være null hvis ingen distribusjon er bestilt. */
    bestillingsId?: string;
}

/** Metadata for dokument som skal knyttes til forsendelsen. Første dokument i listen blir automatisk satt som hoveddokument i forsendelsen */
export interface OppdaterDokumentForesporsel {
    /** JournalpostId til dokumentet hvis det er allerede er lagret i arkivsystem */
    journalpostId?: string;
    dokumentmalId?: string;
    dokumentreferanse?: string;
    tittel?: string;
    fjernTilknytning?: boolean;
    /** @format date-time */
    dokumentDato?: string;
    arkivsystem?: "JOARK" | "MIDLERTIDLIG_BREVLAGER" | "UKJENT" | "BIDRAG";
    metadata?: Record<string, string>;
}

/** Metadata for oppdatering av forsendelse */
export interface OppdaterForsendelseForesporsel {
    /** Liste over dokumentene på journalposten der metadata skal oppdateres */
    dokumenter: OppdaterDokumentForesporsel[];
    /**
     * Dato hoveddokument i forsendelsen ble opprettet
     * @format date-time
     */
    dokumentDato?: string;
}

/** Metadata til en respons etter journalpost ble oppdatert */
export interface OppdaterForsendelseResponse {
    /** ForsendelseId på forsendelse som ble opprettet */
    forsendelseId?: string;
    /** Liste med dokumenter som er knyttet til journalposten */
    dokumenter: DokumentRespons[];
}

/** Metadata for dokument som skal knyttes til journalpost */
export interface OpprettDokumentDto {
    /** Dokumentets tittel */
    tittel: string;
    /** Typen dokument. Brevkoden sier noe om dokumentets innhold og oppbygning. */
    brevkode?: string;
    /** Referansen til dokumentet hvis det er lagret i et annet arkivsystem */
    dokumentreferanse?: string;
    /**
     * Selve PDF dokumentet formatert som Base64
     * @deprecated
     */
    dokument?: string;
    /** @format byte */
    fysiskDokument?: string;
}

/** Metadata til en respons etter journalpost ble opprettet */
export interface OpprettJournalpostResponse {
    /** Journalpostid på journalpost som ble opprettet */
    journalpostId?: string;
    /** Liste med dokumenter som er knyttet til journalposten */
    dokumenter: OpprettDokumentDto[];
}

/** Metadata for endring av et dokument */
export interface EndreDokument {
    /** Brevkoden til dokumentet */
    brevkode?: string;
    /**
     * Identifikator av dokument informasjon
     * @deprecated
     */
    dokId?: string;
    /** Identifikator til dokumentet */
    dokumentreferanse?: string;
    /** Tittel på dokumentet */
    tittel?: string;
}

/** Metadata for endring av en journalpost */
export interface EndreJournalpostCommand {
    /** Identifikator av journalpost */
    journalpostId?: string;
    /**
     * Avsenders navn (med eventuelt fornavn bak komma)
     * @deprecated
     */
    avsenderNavn?: string;
    /** Avsender/Mottakers navn (med eventuelt fornavn bak komma) */
    avsenderMottakerNavn?: string;
    /** Avsender/Mottakers id */
    avsenderMottakerId?: string;
    /** Kort oppsummert av journalført innhold */
    beskrivelse?: string;
    /**
     * Dato for dokument i journalpost
     * @format date
     */
    dokumentDato?: string;
    /** Fnr/dnr/bostnr eller orgnr for hvem/hva dokumentet gjelder */
    gjelder?: string;
    /**
     * Dato dokument ble journalført
     * @format date
     */
    journaldato?: string;
    /** Saksnummer til bidragsaker som journalpost skal tilknyttes */
    tilknyttSaker: string[];
    /** En liste over endringer i dokumenter */
    endreDokumenter: EndreDokument[];
    /** Behandlingstema */
    behandlingstema?: string;
    /** Endre fagområde */
    fagomrade?: string;
    /** Type ident for gjelder: FNR, ORGNR, AKTOERID */
    gjelderType?: string;
    /** Tittel på journalposten */
    tittel?: string;
    /** Skal journalposten journalføres aka. registreres */
    skalJournalfores: boolean;
    /** Liste med retur detaljer som skal endres */
    endreReturDetaljer?: EndreReturDetaljer[];
}

/** Metadata for endring av et retur detalj */
export interface EndreReturDetaljer {
    /**
     * Dato på retur detaljer som skal endres
     * @format date
     */
    originalDato?: string;
    /**
     * Ny dato på retur detaljer
     * @format date
     */
    nyDato?: string;
    /** Beskrivelse av retur (eks. addresse forsøkt sendt) */
    beskrivelse: string;
}

export interface DokumentMetadata {
    /** Journalpostid med arkiv prefiks som skal benyttes når dokumentet hentes */
    journalpostId?: string;
    dokumentreferanse?: string;
    /** Hvilken format dokument er på. Dette forteller hvordan dokumentet må åpnes. */
    format: "PDF" | "MBDOK" | "HTML";
    /** Status på dokumentet */
    status: "IKKE_BESTILT" | "BESTILLING_FEILET" | "UNDER_PRODUKSJON" | "UNDER_REDIGERING" | "FERDIGSTILT" | "AVBRUTT";
    /** Hvilken arkivsystem dokumentet er lagret på */
    arkivsystem: "JOARK" | "MIDLERTIDLIG_BREVLAGER" | "UKJENT" | "BIDRAG";
}

/** Metadata om forsendelse */
export interface ForsendelseResponsTo {
    /** Ident til brukeren som journalposten gjelder */
    gjelderIdent?: string;
    mottaker?: MottakerTo;
    /** Liste over dokumentene på journalposten der metadata skal oppdateres */
    dokumenter: DokumentRespons[];
    /** Bidragsak som forsendelsen er knyttet til */
    saksnummer?: string;
    /** NAV-enheten som oppretter forsendelsen */
    enhet?: string;
    /** Tema på forsendelsen */
    tema?: string;
    /** Ident på saksbehandler eller applikasjon som opprettet forsendelsen */
    opprettetAvIdent?: string;
    /** Navn på saksbehandler eller applikasjon som opprettet forsendelsen */
    opprettetAvNavn?: string;
    /** Tittel på hoveddokumentet i forsendelsen */
    tittel?: string;
    /** Journalpostid som forsendelsen ble arkivert på. Dette vil bli satt hvis status er FERDIGSTILT */
    arkivJournalpostId?: string;
    /** Type på forsendelse. Kan være NOTAT eller UTGÅENDE */
    forsendelseType?: "UTGÅENDE" | "NOTAT";
    /** Status på forsendelsen */
    status?: "UNDER_PRODUKSJON" | "FERDIGSTILT" | "SLETTET" | "DISTRIBUERT" | "DISTRIBUERT_LOKALT";
    /**
     * Dato forsendelsen ble opprettet
     * @format date
     */
    opprettetDato?: string;
    /**
     * Dato på hoveddokumentet i forsendelsen
     * @format date
     */
    dokumentDato?: string;
    /**
     * Dato forsendelsen ble distribuert
     * @format date
     */
    distribuertDato?: string;
}

/** Metadata om en aktør */
export interface AktorDto {
    /** Identifaktor til aktøren */
    ident: string;
    /** Hvilken identtype som skal brukes */
    type?: string;
}

/**
 *
 * Avsender journalposten ble sendt fra hvis utgående.
 * Mottaker journalposten skal sendes til hvis inngående.
 */
export interface AvsenderMottakerDto {
    /** Avsenders/Mottakers navn (med eventuelt fornavn bak komma). Skal ikke oppgis hvis ident er en FNR */
    navn?: string;
    /** Person ident eller organisasjonsnummer */
    ident?: string;
    /** Identtype */
    type: "FNR" | "SAMHANDLER" | "ORGNR" | "UTENLANDSK_ORGNR" | "UKJENT";
    /** Adresse til mottaker hvis dokumentet sendes som brev */
    adresse?: MottakerAdresseTo;
}

/** Metadata til en journalpost */
export interface JournalpostDto {
    /**
     * Avsenders navn (med eventuelt fornavn bak komma)
     * @deprecated
     */
    avsenderNavn?: string;
    /**
     *
     * Avsender journalposten ble sendt fra hvis utgående.
     * Mottaker journalposten skal sendes til hvis inngående.
     */
    avsenderMottaker?: AvsenderMottakerDto;
    /** Dokumentene som følger journalposten */
    dokumenter: DokumentDto[];
    /**
     * Dato for dokument i journalpost
     * @format date
     */
    dokumentDato?: string;
    /**
     * Tidspunkt for dokument i journalpost
     * @format date-time
     */
    dokumentTidspunkt?: string;
    /**
     * Dato dokumentene på journalposten ble sendt til bruker.
     * @format date
     */
    ekspedertDato?: string;
    /** Fagområdet for journalposten. BID for bidrag og FAR for farskap */
    fagomrade?: string;
    /** Ident for hvem/hva dokumente(t/ne) gjelder */
    gjelderIdent?: string;
    /** Metadata om en aktør */
    gjelderAktor?: AktorDto;
    /** Kort oppsummert av journalført innhold */
    innhold?: string;
    /** Enhetsnummer hvor journalføring ble gjort */
    journalforendeEnhet?: string;
    /** Saksbehandler som var journalfører */
    journalfortAv?: string;
    /**
     * Dato dokument ble journalført
     * @format date
     */
    journalfortDato?: string;
    /** Identifikator av journalpost i midlertidig brevlager eller fra joark på formatet [BID|JOARK]-<journalpostId> */
    journalpostId?: string;
    /**
     * Journalposten ble mottatt/sendt ut i kanal
     * @deprecated
     */
    kilde?:
        | "NAV_NO_BID"
        | "SKAN_BID"
        | "NAV_NO"
        | "SKAN_NETS"
        | "LOKAL_UTSKRIFT"
        | "SENTRAL_UTSKRIFT"
        | "SDP"
        | "INGEN_DISTRIBUSJON";
    /** Journalposten ble mottatt/sendt ut i kanal */
    kanal?:
        | "NAV_NO_BID"
        | "SKAN_BID"
        | "NAV_NO"
        | "SKAN_NETS"
        | "LOKAL_UTSKRIFT"
        | "SENTRAL_UTSKRIFT"
        | "SDP"
        | "INGEN_DISTRIBUSJON";
    /**
     * Dato for når dokument er mottat, dvs. dato for journalføring eller skanning
     * @format date
     */
    mottattDato?: string;
    /** Inngående (I), utgående (U) journalpost; (X) internt notat */
    dokumentType?: string;
    /** Journalpostens status, (A, D, J, M, O, R, S, T, U, KP, EJ, E) */
    journalstatus?: string;
    /** Om journalposten er feilført på bidragssak */
    feilfort?: boolean;
    /** Metadata for kode vs dekode i et kodeobjekt */
    brevkode?: KodeDto;
    /** Metadata for retur detaljer */
    returDetaljer?: ReturDetaljer;
    /** Joark journalpostid for bidrag journalpost som er arkivert i Joark */
    joarkJournalpostId?: string;
    /** Adresse for hvor brev sendes ved sentral print */
    distribuertTilAdresse?: DistribuerTilAdresse;
    /** Informasjon om returdetaljer til journalpost */
    sakstilknytninger: string[];
    /** Språket til dokumentet i Journalposten */
    språk?: string;
    /** Saksbehandler som opprettet journalposten */
    opprettetAvIdent?: string;
    /** Referanse til originale kilden til journalposten. Kan være referanse til forsendelse eller bidrag journalpost med prefiks. Feks BID_12323 eller BIF_123213 */
    eksternReferanseId?: string;
}

/** Metadata for kode vs dekode i et kodeobjekt */
export interface KodeDto {
    /** Koden */
    kode?: string;
    /** Dekode (kodebeskrivelse) */
    dekode?: string;
    /** Om kodeobjektet inneholder en gyldig verdi */
    erGyldig: boolean;
}

/** Metadata for retur detaljer */
export interface ReturDetaljer {
    /**
     * Dato for siste retur
     * @format date
     */
    dato?: string;
    /**
     * Totalt antall returer
     * @format int32
     */
    antall?: number;
    /** Liste med logg av alle registrerte returer */
    logg?: ReturDetaljerLog[];
}

/** Metadata for retur detaljer log */
export interface ReturDetaljerLog {
    /**
     * Dato for retur
     * @format date
     */
    dato?: string;
    /** Beskrivelse av retur (eks. addresse forsøkt sendt) */
    beskrivelse?: string;
    /** Returdetalje er låst for endring. Dette blir satt etter en ny distribusjon er bestilt */
    locked?: boolean;
}

/** Metadata til en respons etter journalpost med tilhørende data */
export interface JournalpostResponse {
    /** Metadata til en journalpost */
    journalpost?: JournalpostDto;
    /** alle saker som journalposten er tilknyttet */
    sakstilknytninger: string[];
}

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
    /** set parameter to `true` for call `securityWorker` for this request */
    secure?: boolean;
    /** request path */
    path: string;
    /** content type of request body */
    type?: ContentType;
    /** query params */
    query?: QueryParamsType;
    /** format of response (i.e. response.json() -> format: "json") */
    format?: ResponseType;
    /** request body */
    body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
    securityWorker?: (
        securityData: SecurityDataType | null
    ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
    secure?: boolean;
    format?: ResponseType;
}

export enum ContentType {
    Json = "application/json",
    FormData = "multipart/form-data",
    UrlEncoded = "application/x-www-form-urlencoded",
    Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
    public instance: AxiosInstance;
    private securityData: SecurityDataType | null = null;
    private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
    private secure?: boolean;
    private format?: ResponseType;

    constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
        this.instance = axios.create({
            ...axiosConfig,
            baseURL: axiosConfig.baseURL || "https://bidrag-dokument-forsendelse-feature.dev.intern.nav.no",
        });
        this.secure = secure;
        this.format = format;
        this.securityWorker = securityWorker;
    }

    public setSecurityData = (data: SecurityDataType | null) => {
        this.securityData = data;
    };

    protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
        const method = params1.method || (params2 && params2.method);

        return {
            ...this.instance.defaults,
            ...params1,
            ...(params2 || {}),
            headers: {
                ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
                ...(params1.headers || {}),
                ...((params2 && params2.headers) || {}),
            },
        };
    }

    protected stringifyFormItem(formItem: unknown) {
        if (typeof formItem === "object" && formItem !== null) {
            return JSON.stringify(formItem);
        } else {
            return `${formItem}`;
        }
    }

    protected createFormData(input: Record<string, unknown>): FormData {
        return Object.keys(input || {}).reduce((formData, key) => {
            const property = input[key];
            const propertyContent: any[] = property instanceof Array ? property : [property];

            for (const formItem of propertyContent) {
                const isFileType = formItem instanceof Blob || formItem instanceof File;
                formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
            }

            return formData;
        }, new FormData());
    }

    public request = async <T = any, _E = any>({
        secure,
        path,
        type,
        query,
        format,
        body,
        ...params
    }: FullRequestParams): Promise<AxiosResponse<T>> => {
        const secureParams =
            ((typeof secure === "boolean" ? secure : this.secure) &&
                this.securityWorker &&
                (await this.securityWorker(this.securityData))) ||
            {};
        const requestParams = this.mergeRequestParams(params, secureParams);
        const responseFormat = format || this.format || undefined;

        if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
            body = this.createFormData(body as Record<string, unknown>);
        }

        if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
            body = JSON.stringify(body);
        }

        return this.instance.request({
            ...requestParams,
            headers: {
                ...(requestParams.headers || {}),
                ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
            },
            params: query,
            responseType: responseFormat,
            data: body,
            url: path,
        });
    };
}

/**
 * @title bidrag-dokument-forsendelse
 * @version v1
 * @baseUrl https://bidrag-dokument-forsendelse-feature.dev.intern.nav.no
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    api = {
        /**
         * No description
         *
         * @tags opprett-forsendelse-kontroller
         * @name OpprettForsendelse
         * @summary Oppretter ny forsendelse
         * @request POST:/api/forsendelse
         * @secure
         */
        opprettForsendelse: (data: OpprettForsendelseForesporsel, params: RequestParams = {}) =>
            this.request<OpprettForsendelseRespons, OpprettForsendelseRespons>({
                path: `/api/forsendelse`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags endre-forsendelse-kontroller
         * @name KnyttTilDokument
         * @summary Knytt eller opprett ny dokument til forsendelse
         * @request POST:/api/forsendelse/{forsendelseIdMedPrefix}/dokument
         * @secure
         */
        knyttTilDokument: (
            forsendelseIdMedPrefix: string,
            data: OpprettDokumentForesporsel,
            params: RequestParams = {}
        ) =>
            this.request<DokumentRespons, any>({
                path: `/api/forsendelse/${forsendelseIdMedPrefix}/dokument`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Hent gyldige avvikstyper for forsendelse
         *
         * @tags avvik-kontroller
         * @name HentAvvik
         * @request GET:/api/forsendelse/journal/{forsendelseIdMedPrefix}/avvik
         * @secure
         */
        hentAvvik: (forsendelseIdMedPrefix: string, params: RequestParams = {}) =>
            this.request<
                (
                    | "ARKIVERE_JOURNALPOST"
                    | "BESTILL_ORIGINAL"
                    | "BESTILL_RESKANNING"
                    | "BESTILL_SPLITTING"
                    | "ENDRE_FAGOMRADE"
                    | "SEND_TIL_FAGOMRADE"
                    | "KOPIER_FRA_ANNEN_FAGOMRADE"
                    | "SEND_KOPI_TIL_FAGOMRADE"
                    | "FEILFORE_SAK"
                    | "INNG_TIL_UTG_DOKUMENT"
                    | "OVERFOR_TIL_ANNEN_ENHET"
                    | "SLETT_JOURNALPOST"
                    | "TREKK_JOURNALPOST"
                    | "REGISTRER_RETUR"
                    | "MANGLER_ADRESSE"
                    | "BESTILL_NY_DISTRIBUSJON"
                )[],
                (
                    | "ARKIVERE_JOURNALPOST"
                    | "BESTILL_ORIGINAL"
                    | "BESTILL_RESKANNING"
                    | "BESTILL_SPLITTING"
                    | "ENDRE_FAGOMRADE"
                    | "SEND_TIL_FAGOMRADE"
                    | "KOPIER_FRA_ANNEN_FAGOMRADE"
                    | "SEND_KOPI_TIL_FAGOMRADE"
                    | "FEILFORE_SAK"
                    | "INNG_TIL_UTG_DOKUMENT"
                    | "OVERFOR_TIL_ANNEN_ENHET"
                    | "SLETT_JOURNALPOST"
                    | "TREKK_JOURNALPOST"
                    | "REGISTRER_RETUR"
                    | "MANGLER_ADRESSE"
                    | "BESTILL_NY_DISTRIBUSJON"
                )[]
            >({
                path: `/api/forsendelse/journal/${forsendelseIdMedPrefix}/avvik`,
                method: "GET",
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags avvik-kontroller
         * @name UtforAvvik
         * @summary Utfør avvikshåndtering
         * @request POST:/api/forsendelse/journal/{forsendelseIdMedPrefix}/avvik
         * @secure
         */
        utforAvvik: (forsendelseIdMedPrefix: string, data: Avvikshendelse, params: RequestParams = {}) =>
            this.request<any, void>({
                path: `/api/forsendelse/journal/${forsendelseIdMedPrefix}/avvik`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Bestill distribusjon av forsendelse
         *
         * @tags distribusjon-kontroller
         * @name DistribuerForsendelse
         * @request POST:/api/forsendelse/journal/distribuer/{forsendelseIdMedPrefix}
         * @secure
         */
        distribuerForsendelse: (
            forsendelseIdMedPrefix: string,
            data: DistribuerJournalpostRequest,
            query?: {
                batchId?: string;
            },
            params: RequestParams = {}
        ) =>
            this.request<DistribuerJournalpostResponse, DistribuerJournalpostResponse>({
                path: `/api/forsendelse/journal/distribuer/${forsendelseIdMedPrefix}`,
                method: "POST",
                query: query,
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags endre-forsendelse-kontroller
         * @name OppdaterForsendelse
         * @summary Endre forsendelse
         * @request PATCH:/api/forsendelse/{forsendelseIdMedPrefix}
         * @secure
         */
        oppdaterForsendelse: (
            forsendelseIdMedPrefix: string,
            data: OppdaterForsendelseForesporsel,
            params: RequestParams = {}
        ) =>
            this.request<OppdaterForsendelseResponse, OppdaterForsendelseResponse>({
                path: `/api/forsendelse/${forsendelseIdMedPrefix}`,
                method: "PATCH",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags endre-forsendelse-kontroller
         * @name FerdigstillForsendelse
         * @summary Ferdigstiller forsendelse ved å arkivere forsendelsen i Joark og dermed klargjør for eventuell distribuering
         * @request PATCH:/api/forsendelse/{forsendelseIdMedPrefix}/ferdigstill
         * @secure
         */
        ferdigstillForsendelse: (forsendelseIdMedPrefix: string, params: RequestParams = {}) =>
            this.request<OpprettJournalpostResponse, OpprettJournalpostResponse>({
                path: `/api/forsendelse/${forsendelseIdMedPrefix}/ferdigstill`,
                method: "PATCH",
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags endre-forsendelse-kontroller
         * @name OppdaterDokument
         * @summary Oppdater dokument i en forsendelsee
         * @request PATCH:/api/forsendelse/{forsendelseIdMedPrefix}/dokument/{dokumentreferanse}
         * @secure
         */
        oppdaterDokument: (
            forsendelseIdMedPrefix: string,
            dokumentreferanse: string,
            data: OppdaterDokumentForesporsel,
            params: RequestParams = {}
        ) =>
            this.request<DokumentRespons, any>({
                path: `/api/forsendelse/${forsendelseIdMedPrefix}/dokument/${dokumentreferanse}`,
                method: "PATCH",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags endre-forsendelse-kontroller
         * @name OpphevFerdigstillingAvDokument
         * @summary Ferdigstill dokument i en forsendelse
         * @request PATCH:/api/forsendelse/{forsendelseIdMedPrefix}/dokument/{dokumentreferanse}/opphevFerdigstill
         * @secure
         */
        opphevFerdigstillingAvDokument: (
            forsendelseIdMedPrefix: string,
            dokumentreferanse: string,
            params: RequestParams = {}
        ) =>
            this.request<DokumentRespons, any>({
                path: `/api/forsendelse/${forsendelseIdMedPrefix}/dokument/${dokumentreferanse}/opphevFerdigstill`,
                method: "PATCH",
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags endre-forsendelse-kontroller
         * @name FerdigstillDokument
         * @summary Ferdigstill dokument i en forsendelse
         * @request PATCH:/api/forsendelse/{forsendelseIdMedPrefix}/dokument/{dokumentreferanse}/ferdigstill
         * @secure
         */
        ferdigstillDokument: (forsendelseIdMedPrefix: string, dokumentreferanse: string, params: RequestParams = {}) =>
            this.request<DokumentRespons, any>({
                path: `/api/forsendelse/${forsendelseIdMedPrefix}/dokument/${dokumentreferanse}/ferdigstill`,
                method: "PATCH",
                secure: true,
                ...params,
            }),

        /**
         * @description Hent forsendelse med forsendelseid
         *
         * @tags forsendelse-journal-kontroller
         * @name HentForsendelse1
         * @request GET:/api/forsendelse/journal/{forsendelseIdMedPrefix}
         * @secure
         */
        hentForsendelse1: (
            forsendelseIdMedPrefix: string,
            query?: {
                /** journalposten tilhører sak */
                saksnummer?: string;
            },
            params: RequestParams = {}
        ) =>
            this.request<any, JournalpostResponse>({
                path: `/api/forsendelse/journal/${forsendelseIdMedPrefix}`,
                method: "GET",
                query: query,
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags endre-forsendelse-kontroller
         * @name OppdaterForsendelseLegacy
         * @summary Endre forsendelse
         * @request PATCH:/api/forsendelse/journal/{forsendelseIdMedPrefix}
         * @secure
         */
        oppdaterForsendelseLegacy: (
            forsendelseIdMedPrefix: string,
            data: EndreJournalpostCommand,
            params: RequestParams = {}
        ) =>
            this.request<void, void>({
                path: `/api/forsendelse/journal/${forsendelseIdMedPrefix}`,
                method: "PATCH",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Henter dokumentmaler som er støttet av applikasjonen
         *
         * @tags forsendelse-innsyn-kontroller
         * @name StottedeDokumentmaler
         * @request OPTIONS:/api/forsendelse/v2/dokumentmaler
         * @secure
         */
        stottedeDokumentmaler: (params: RequestParams = {}) =>
            this.request<string[], any>({
                path: `/api/forsendelse/v2/dokumentmaler`,
                method: "OPTIONS",
                secure: true,
                ...params,
            }),

        /**
         * @description Henter dokumentmaler som er støttet av applikasjonen
         *
         * @tags forsendelse-journal-kontroller
         * @name StottedeDokumentmaler1
         * @request OPTIONS:/api/forsendelse/dokumentmaler
         * @secure
         */
        stottedeDokumentmaler1: (params: RequestParams = {}) =>
            this.request<string[], any>({
                path: `/api/forsendelse/dokumentmaler`,
                method: "OPTIONS",
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags dokument-kontroller
         * @name HentDokumentMetadata
         * @summary Hent metadata om dokument
         * @request OPTIONS:/api/forsendelse/dokument/{forsendelseIdMedPrefix}
         * @secure
         */
        hentDokumentMetadata: (forsendelseIdMedPrefix: string, dokumentreferanse: string, params: RequestParams = {}) =>
            this.request<DokumentMetadata[], any>({
                path: `/api/forsendelse/dokument/${forsendelseIdMedPrefix}`,
                method: "OPTIONS",
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags dokument-kontroller
         * @name HentDokument
         * @summary Hent fysisk dokument som byte
         * @request GET:/api/forsendelse/dokument/{forsendelseIdMedPrefix}/{dokumentreferanse}
         * @secure
         */
        hentDokument: (forsendelseIdMedPrefix: string, dokumentreferanse: string, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/forsendelse/dokument/${forsendelseIdMedPrefix}/${dokumentreferanse}`,
                method: "GET",
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags dokument-kontroller
         * @name HentDokumentMetadata1
         * @summary Hent metadata om dokument
         * @request OPTIONS:/api/forsendelse/dokument/{forsendelseIdMedPrefix}/{dokumentreferanse}
         * @secure
         */
        hentDokumentMetadata1: (
            forsendelseIdMedPrefix: string,
            dokumentreferanse: string,
            params: RequestParams = {}
        ) =>
            this.request<DokumentMetadata[], any>({
                path: `/api/forsendelse/dokument/${forsendelseIdMedPrefix}/${dokumentreferanse}`,
                method: "OPTIONS",
                secure: true,
                ...params,
            }),

        /**
         * @description Hent forsendelse med forsendelseid
         *
         * @tags forsendelse-innsyn-kontroller
         * @name HentForsendelse
         * @request GET:/api/forsendelse/v2/{forsendelseIdMedPrefix}
         * @secure
         */
        hentForsendelse: (
            forsendelseIdMedPrefix: string,
            query?: {
                /** journalposten tilhører sak */
                saksnummer?: string;
            },
            params: RequestParams = {}
        ) =>
            this.request<any, ForsendelseResponsTo>({
                path: `/api/forsendelse/v2/${forsendelseIdMedPrefix}`,
                method: "GET",
                query: query,
                secure: true,
                ...params,
            }),

        /**
         * @description Hent alle forsendelse med saksnummer
         *
         * @tags forsendelse-innsyn-kontroller
         * @name HentJournal
         * @request GET:/api/forsendelse/v2/sak/{saksnummer}/journal
         * @secure
         */
        hentJournal: (saksnummer: string, params: RequestParams = {}) =>
            this.request<ForsendelseResponsTo[], any>({
                path: `/api/forsendelse/v2/sak/${saksnummer}/journal`,
                method: "GET",
                secure: true,
                ...params,
            }),

        /**
         * @description Hent alle forsendelse som har saksnummer
         *
         * @tags forsendelse-journal-kontroller
         * @name HentJournal1
         * @request GET:/api/forsendelse/sak/{saksnummer}/journal
         * @secure
         */
        hentJournal1: (
            saksnummer: string,
            query?: {
                fagomrade?: ("BID" | "FAR")[];
            },
            params: RequestParams = {}
        ) =>
            this.request<JournalpostDto[], any>({
                path: `/api/forsendelse/sak/${saksnummer}/journal`,
                method: "GET",
                query: query,
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags distribusjon-kontroller
         * @name KanDistribuere
         * @summary Sjekk om forsendelse kan distribueres
         * @request GET:/api/forsendelse/journal/distribuer/{forsendelseIdMedPrefix}/enabled
         * @secure
         */
        kanDistribuere: (forsendelseIdMedPrefix: string, params: RequestParams = {}) =>
            this.request<void, void>({
                path: `/api/forsendelse/journal/distribuer/${forsendelseIdMedPrefix}/enabled`,
                method: "GET",
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags endre-forsendelse-kontroller
         * @name FjernDokumentFraForsendelse
         * @summary Slett dokument fra forsendelse
         * @request DELETE:/api/forsendelse/{forsendelseIdMedPrefix}/{dokumentreferanse}
         * @secure
         */
        fjernDokumentFraForsendelse: (
            forsendelseIdMedPrefix: string,
            dokumentreferanse: string,
            params: RequestParams = {}
        ) =>
            this.request<OppdaterForsendelseResponse, any>({
                path: `/api/forsendelse/${forsendelseIdMedPrefix}/${dokumentreferanse}`,
                method: "DELETE",
                secure: true,
                ...params,
            }),
    };
}
