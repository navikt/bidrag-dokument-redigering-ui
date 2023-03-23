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
    /** Adresse til mottaker hvis dokumentet skal sendes/er sendt gjennom sentral print */
    adresse?: MottakerAdresseTo;
}

/** Adresse til mottaker hvis dokumentet skal sendes/er sendt gjennom sentral print */
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

/** Metadata for opprettelse av journalpost */
export interface OpprettJournalpostRequest {
    /** Om journalposten skal journalføres etter opprettelse. Journalføring betyr at journalpost låses for framtidige endringer */
    skalFerdigstilles: boolean;
    /**
     * Tittel på journalposten (Tittel settes til hoveddokumentes tittel for Joark journalposter)
     * @deprecated
     */
    tittel?: string;
    /** Metadata om en aktør */
    gjelder?: AktorDto;
    /** Ident til brukeren som journalposten gjelder */
    gjelderIdent?: string;
    /**
     *
     * Avsender journalposten ble sendt fra hvis utgående.
     * Mottaker journalposten skal sendes til hvis inngående.
     */
    avsenderMottaker?: AvsenderMottakerDto;
    /**
     *
     *     Dokumenter som skal knyttes til journalpost.
     *     En journalpost må minst ha et dokument.
     *     Det første dokument i meldingen blir tilknyttet som hoveddokument på journalposten.
     */
    dokumenter: OpprettDokumentDto[];
    /** Saksnummer til bidragsaker som journalpost skal tilknyttes */
    tilknyttSaker: string[];
    /** Behandlingstema */
    behandlingstema?: string;
    /**
     * Dato journalposten mottatt. Kan settes for inngående journalposter. Settes til i dag som default hvis ikke satt
     * @format date-time
     */
    datoMottatt?: string;
    /**
     * Dato når selve dokumentet ble opprettet
     * @format date-time
     */
    datoDokument?: string;
    /**
     *
     *     Mottak/Utsendingskanal som settes ved opprettelse av journalpost
     *
     *     DIGITAL - Skal bare settes for inngående journalpost. Oversettes til NAV_NO. Dette er default for inngående
     *
     *     SKANNING_BIDRAG - Skal settes hvis inngående journalpost er mottatt via Bidrag skanning
     *
     *     LOKAL_UTSKRIFT - Skal settes hvis utgående journalpost er sendt via lokal utskrift. Kanal for utgående journalposter blir ellers satt av dokumentdistribusjons løsningen.
     * @default "DIGITALT"
     */
    kanal?: "DIGITALT" | "SKANNING_BIDRAG" | "LOKAL_UTSKRIFT";
    /**
     * Tema (Gyldige verdier er FAR og BID). Hvis det ikke settes opprettes journalpost med tema BID
     * @default "BID"
     */
    tema?: string;
    /** Journalposttype, dette kan enten være Inngående, Utgående eller Notat */
    journalposttype: "INNGÅENDE" | "UTGAAENDE" | "UTGÅENDE" | "NOTAT";
    /** Referanse for journalpost. Hvis journalpost med samme referanse finnes vil tjenesten gå videre uten å opprette journalpost. Kan brukes for å lage løsninger idempotent */
    referanseId?: string;
    /**
     * NAV-enheten som oppretter journalposten
     * @deprecated
     */
    journalfoerendeEnhet?: string;
    /** NAV-enheten som oppretter journalposten */
    journalførendeEnhet?: string;
    /** Ident til saksbehandler som oppretter journalpost. Dette vil prioriteres over ident som tilhører tokenet til kallet. */
    saksbehandlerIdent?: string;
}

/** Metadata til en respons etter journalpost ble opprettet */
export interface OpprettJournalpostResponse {
    /** Journalpostid på journalpost som ble opprettet */
    journalpostId?: string;
    /** Liste med dokumenter som er knyttet til journalposten */
    dokumenter: OpprettDokumentDto[];
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

/** Responsen til en avvikshendelse */
export interface BehandleAvvikshendelseResponse {
    /** Type avvik */
    avvikType: string;
    /**
     * Oppgave id for oppgaven som ble opprettet på bakgrunn av avviket
     * @format int64
     */
    oppgaveId?: number;
    /** Enhetsnummer til enheten som oppgaven er tildelt */
    tildeltEnhetsnr?: string;
    /** Oppgavens tema */
    tema?: string;
    /** Oppgavens type */
    oppgavetype?: string;
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

/** Metadata for en url til et fysisk dokument */
export interface DokumentTilgangResponse {
    /** url til et fysisk dokument */
    dokumentUrl: string;
    /** type system som er ansvarlig for dokumentet, eks: BREVLAGER */
    type: string;
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
            baseURL: axiosConfig.baseURL || "https://bidrag-dokument-feature.dev.intern.nav.no/bidrag-dokument",
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
 * @title bidrag-dokument
 * @version v1
 * @baseUrl https://bidrag-dokument-feature.dev.intern.nav.no/bidrag-dokument
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    journalpost = {
        /**
         * @description Opprett notat eller utgående journalpost i midlertidlig brevlager. Opprett inngående, notat eller utgående journalpost i Joark
         *
         * @tags journalpost-controller
         * @name OpprettJournalpost
         * @request POST:/journalpost/{arkivSystem}
         * @secure
         */
        opprettJournalpost: (
            arkivSystem: "JOARK" | "BIDRAG",
            data: OpprettJournalpostRequest,
            params: RequestParams = {}
        ) =>
            this.request<OpprettJournalpostResponse, OpprettJournalpostResponse>({
                path: `/journalpost/${arkivSystem}`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),
    };
    journal = {
        /**
         * @description Henter mulige avvik for en journalpost, id på formatet [BID|JOARK]-<journalpostId>
         *
         * @tags journalpost-controller
         * @name HentAvvik
         * @request GET:/journal/{journalpostIdForKildesystem}/avvik
         * @secure
         */
        hentAvvik: (
            journalpostIdForKildesystem: string,
            query?: {
                /** journalposten tilhører sak */
                saksnummer?: string;
            },
            params: RequestParams = {}
        ) =>
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
                path: `/journal/${journalpostIdForKildesystem}/avvik`,
                method: "GET",
                query: query,
                secure: true,
                ...params,
            }),

        /**
         * @description Lagrer et avvik for en journalpost, id på formatet [BID|JOARK]-<journalpostId>
         *
         * @tags journalpost-controller
         * @name BehandleAvvik
         * @request POST:/journal/{journalpostIdForKildesystem}/avvik
         * @secure
         */
        behandleAvvik: (journalpostIdForKildesystem: string, data: Avvikshendelse, params: RequestParams = {}) =>
            this.request<BehandleAvvikshendelseResponse, BehandleAvvikshendelseResponse>({
                path: `/journal/${journalpostIdForKildesystem}/avvik`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Bestill distribusjon av journalpost
         *
         * @tags journalpost-controller
         * @name DistribuerJournalpost
         * @request POST:/journal/distribuer/{joarkJournalpostId}
         * @secure
         */
        distribuerJournalpost: (
            joarkJournalpostId: string,
            data: DistribuerJournalpostRequest,
            query?: {
                batchId?: string;
            },
            params: RequestParams = {}
        ) =>
            this.request<DistribuerJournalpostResponse, DistribuerJournalpostResponse>({
                path: `/journal/distribuer/${joarkJournalpostId}`,
                method: "POST",
                query: query,
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Hent en journalpost for en id på formatet [BID|JOARK]-<journalpostId>
         *
         * @tags journalpost-controller
         * @name HentJournalpost
         * @request GET:/journal/{journalpostIdForKildesystem}
         * @secure
         */
        hentJournalpost: (
            journalpostIdForKildesystem: string,
            query?: {
                /** journalposten tilhører sak */
                saksnummer?: string;
            },
            params: RequestParams = {}
        ) =>
            this.request<JournalpostResponse, JournalpostResponse>({
                path: `/journal/${journalpostIdForKildesystem}`,
                method: "GET",
                query: query,
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags journalpost-controller
         * @name PatchJournalpost
         * @summary Endre eksisterende journalpost, id på formatet [BID|JOARK]-<journalpostId>
         * @request PATCH:/journal/{journalpostIdForKildesystem}
         * @secure
         */
        patchJournalpost: (
            journalpostIdForKildesystem: string,
            data: EndreJournalpostCommand,
            params: RequestParams = {}
        ) =>
            this.request<void, void>({
                path: `/journal/${journalpostIdForKildesystem}`,
                method: "PATCH",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Sjekk om distribusjon av journalpost kan bestilles
         *
         * @tags journalpost-controller
         * @name KanDistribuerJournalpost
         * @request GET:/journal/distribuer/{journalpostId}/enabled
         * @secure
         */
        kanDistribuerJournalpost: (journalpostId: string, params: RequestParams = {}) =>
            this.request<void, void>({
                path: `/journal/distribuer/${journalpostId}/enabled`,
                method: "GET",
                secure: true,
                ...params,
            }),
    };
    dokument = {
        /**
         * No description
         *
         * @tags dokument-controller
         * @name HentDokument
         * @request GET:/dokument/{journalpostId}
         * @secure
         */
        hentDokument: (
            journalpostId: string,
            dokumentreferanse: string,
            query?: {
                resizeToA4?: boolean;
                /** @default true */
                optimizeForPrint?: boolean;
            },
            params: RequestParams = {}
        ) =>
            this.request<string, any>({
                path: `/dokument/${journalpostId}`,
                method: "GET",
                query: query,
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags dokument-controller
         * @name HentDokumentMetadata
         * @request OPTIONS:/dokument/{journalpostId}
         * @secure
         */
        hentDokumentMetadata: (journalpostId: string, dokumentreferanse: string, params: RequestParams = {}) =>
            this.request<DokumentMetadata[], any>({
                path: `/dokument/${journalpostId}`,
                method: "OPTIONS",
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags dokument-controller
         * @name HentDokument1
         * @request GET:/dokument/{journalpostId}/{dokumentreferanse}
         * @secure
         */
        hentDokument1: (
            journalpostId: string,
            dokumentreferanse: string,
            query?: {
                resizeToA4?: boolean;
                /** @default true */
                optimizeForPrint?: boolean;
            },
            params: RequestParams = {}
        ) =>
            this.request<string, any>({
                path: `/dokument/${journalpostId}/${dokumentreferanse}`,
                method: "GET",
                query: query,
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags dokument-controller
         * @name HentDokumentMetadata1
         * @request OPTIONS:/dokument/{journalpostId}/{dokumentreferanse}
         * @secure
         */
        hentDokumentMetadata1: (journalpostId: string, dokumentreferanse: string, params: RequestParams = {}) =>
            this.request<DokumentMetadata[], any>({
                path: `/dokument/${journalpostId}/${dokumentreferanse}`,
                method: "OPTIONS",
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags dokument-controller
         * @name HentDokumenter
         * @request GET:/dokument
         * @secure
         */
        hentDokumenter: (
            query: {
                /** Liste med dokumenter formatert <Kilde>-<journalpostId>:<dokumentReferanse> */
                dokument: string[];
                /** @default true */
                optimizeForPrint?: boolean;
                resizeToA4?: boolean;
            },
            params: RequestParams = {}
        ) =>
            this.request<string, any>({
                path: `/dokument`,
                method: "GET",
                query: query,
                secure: true,
                ...params,
            }),
    };
    tilgang = {
        /**
         * No description
         *
         * @tags dokument-controller
         * @name GiTilgangTilDokument
         * @request GET:/tilgang/{journalpostId}/{dokumentreferanse}
         * @secure
         */
        giTilgangTilDokument: (journalpostId: string, dokumentreferanse: string, params: RequestParams = {}) =>
            this.request<DokumentTilgangResponse, any>({
                path: `/tilgang/${journalpostId}/${dokumentreferanse}`,
                method: "GET",
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags dokument-controller
         * @name GiTilgangTilDokument1
         * @request GET:/tilgang/dokumentreferanse/{dokumentreferanse}
         * @secure
         */
        giTilgangTilDokument1: (journalpostId: string, dokumentreferanse: string, params: RequestParams = {}) =>
            this.request<DokumentTilgangResponse, any>({
                path: `/tilgang/dokumentreferanse/${dokumentreferanse}`,
                method: "GET",
                secure: true,
                ...params,
            }),
    };
    sak = {
        /**
         * No description
         *
         * @tags journalpost-controller
         * @name HentJournal
         * @summary Finn saksjournal for et saksnummer, samt parameter 'fagomrade' (FAR - farskapsjournal) og (BID - bidragsjournal)
         * @request GET:/sak/{saksnummer}/journal
         * @secure
         */
        hentJournal: (
            saksnummer: string,
            query?: {
                fagomrade?: string[];
            },
            params: RequestParams = {}
        ) =>
            this.request<JournalpostDto[], JournalpostDto[]>({
                path: `/sak/${saksnummer}/journal`,
                method: "GET",
                query: query,
                secure: true,
                ...params,
            }),
    };
    dokumentreferanse = {
        /**
         * No description
         *
         * @tags dokument-controller
         * @name HentDokument2
         * @request GET:/dokumentreferanse/{dokumentreferanse}
         * @secure
         */
        hentDokument2: (
            journalpostId: string,
            dokumentreferanse: string,
            query?: {
                resizeToA4?: boolean;
                /** @default true */
                optimizeForPrint?: boolean;
            },
            params: RequestParams = {}
        ) =>
            this.request<string, any>({
                path: `/dokumentreferanse/${dokumentreferanse}`,
                method: "GET",
                query: query,
                secure: true,
                ...params,
            }),
    };
}
