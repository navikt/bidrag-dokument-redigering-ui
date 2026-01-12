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

type UtilRequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export interface Arbeidsforhold {
    periode: TypeArManedsperiode;
    arbeidsgiver: string;
    stillingProsent?: string;
    /** @format date */
    lønnsendringDato?: string;
}

export enum Behandlingstema {
    AVSKRIVNING = "AVSKRIVNING",
    BIDRAG = "BIDRAG",
    BIDRAG_PLUSS_TILLEGGSBIDRAG = "BIDRAG_PLUSS_TILLEGGSBIDRAG",
    DIREKTEOPPGJOR = "DIREKTE_OPPGJØR",
    EKTEFELLEBIDRAG = "EKTEFELLEBIDRAG",
    ETTERGIVELSE = "ETTERGIVELSE",
    ERSTATNING = "ERSTATNING",
    FARSSKAP = "FARSSKAP",
    KUNNSKAP_OM_BIOLOGISK_FAR = "KUNNSKAP_OM_BIOLOGISK_FAR",
    FORSKUDD = "FORSKUDD",
    GEBYR = "GEBYR",
    INNKREVING = "INNKREVING",
    MORSSKAP = "MORSSKAP",
    MOTREGNING = "MOTREGNING",
    OPPFOSTRINGSBIDRAG = "OPPFOSTRINGSBIDRAG",
    REFUSJON_BIDRAG = "REFUSJON_BIDRAG",
    SAKSOMKOSTNINGER = "SAKSOMKOSTNINGER",
    SAeRBIDRAG = "SÆRBIDRAG",
    TILLEGGSBIDRAG = "TILLEGGSBIDRAG",
    TILBAKEKREVING_ETTERGIVELSE = "TILBAKEKREVING_ETTERGIVELSE",
    TILBAKEKREVING = "TILBAKEKREVING",
    TILBAKEKREVING_BIDRAG = "TILBAKEKREVING_BIDRAG",
    BIDRAG18ARPLUSSTILLEGGSBIDRAG = "BIDRAG_18_ÅR_PLUSS_TILLEGGSBIDRAG",
    BIDRAG18AR = "BIDRAG_18_ÅR",
    REISEKOSTNADER = "REISEKOSTNADER",
}

export enum Behandlingstype {
    ENDRING = "ENDRING",
    EGET_TILTAK = "EGET_TILTAK",
    SOKNAD = "SØKNAD",
    INNKREVINGSGRUNNLAG = "INNKREVINGSGRUNNLAG",
    FORHOLDSMESSIG_FORDELING = "FORHOLDSMESSIG_FORDELING",
    ALDERSJUSTERING = "ALDERSJUSTERING",
    INDEKSREGULERING = "INDEKSREGULERING",
    KLAGE_BEGRENSET_SATS = "KLAGE_BEGRENSET_SATS",
    KLAGE = "KLAGE",
    FOLGERKLAGE = "FØLGER_KLAGE",
    KORRIGERING = "KORRIGERING",
    KONVERTERING = "KONVERTERING",
    OPPHOR = "OPPHØR",
    PRIVAT_AVTALE = "PRIVAT_AVTALE",
    BEGRENSET_REVURDERING = "BEGRENSET_REVURDERING",
    REVURDERING = "REVURDERING",
    OPPJUSTERT_FORSKUDD = "OPPJUSTERT_FORSKUDD",
    OMGJORING = "OMGJØRING",
    OMGJORINGBEGRENSETSATS = "OMGJØRING_BEGRENSET_SATS",
    PARAGRAF35C = "PARAGRAF_35_C",
    PARAGRAF35CBEGRENSETSATS = "PARAGRAF_35_C_BEGRENSET_SATS",
    MANEDLIGPALOP = "MÅNEDLIG_PÅLOP",
}

export interface Belop {
    verdi: number;
    valutakode?: Valutakode;
}

export enum BeregnTil {
    OPPRINNELIG_VEDTAKSTIDSPUNKT = "OPPRINNELIG_VEDTAKSTIDSPUNKT",
    INNEVAeRENDEMANED = "INNEVÆRENDE_MÅNED",
    ETTERFOLGENDEMANUELLVEDTAK = "ETTERFØLGENDE_MANUELL_VEDTAK",
}

export interface BeregnetBidragBarnDto {
    saksnummer: string;
    løpendeBeløp: number;
    valutakode: string;
    samværsklasse: Samvaersklasse;
    samværsfradrag: number;
    beregnetBeløp: number;
    faktiskBeløp: number;
    reduksjonUnderholdskostnad: number;
    beregnetBidrag: number;
}

export interface BeregnetBidragPerBarn {
    gjelderBarn: string;
    saksnummer: string;
    løpendeBeløp: number;
    valutakode: string;
    samværsklasse: Samvaersklasse;
    samværsfradrag: number;
    beregnetBeløp: number;
    faktiskBeløp: number;
    reduksjonUnderholdskostnad: number;
    beregnetBidrag: number;
}

export interface BidragPeriodeBeregningsdetaljer {
    bpHarEvne: boolean;
    /** @format double */
    antallBarnIHusstanden?: number;
    forskuddssats: number;
    barnetilleggBM?: DokumentmalDelberegningBarnetilleggDto;
    barnetilleggBP?: DokumentmalDelberegningBarnetilleggDto;
    voksenIHusstanden?: boolean;
    enesteVoksenIHusstandenErEgetBarn?: boolean;
    bpsAndel?: DelberegningBidragspliktigesAndel;
    inntekter?: DokumentmalResultatBeregningInntekterDto;
    delberegningBidragsevne?: DokumentmalDelberegningBidragsevneDto;
    samværsfradrag?: NotatBeregningsdetaljerSamvaersfradrag;
    endringUnderGrense?: DelberegningEndringSjekkGrensePeriode;
    sluttberegning?: DokumentmalSluttberegningBarnebidragDetaljer;
    delberegningUnderholdskostnad?: DelberegningUnderholdskostnad;
    indeksreguleringDetaljer?: IndeksreguleringDetaljer;
    sluttberegningAldersjustering?: SluttberegningBarnebidragAldersjustering;
    delberegningBidragspliktigesBeregnedeTotalBidrag?: DokumentmalDelberegningBidragspliktigesBeregnedeTotalbidragDto;
    forholdsmessigFordelingBeregningsdetaljer?: DokumentmalForholdsmessigFordelingBeregningsdetaljer;
    deltBosted: boolean;
}

export interface BoforholdBarn {
    gjelder: DokumentmalPersonDto;
    medIBehandling: boolean;
    kilde: Kilde;
    opplysningerFraFolkeregisteret: OpplysningerFraFolkeregisteretMedDetaljerBostatuskodeUnit[];
    opplysningerBruktTilBeregning: OpplysningerBruktTilBeregningBostatuskode[];
}

export enum Bostatuskode {
    MED_FORELDER = "MED_FORELDER",
    DOKUMENTERT_SKOLEGANG = "DOKUMENTERT_SKOLEGANG",
    IKKE_MED_FORELDER = "IKKE_MED_FORELDER",
    DELT_BOSTED = "DELT_BOSTED",
    REGNES_IKKE_SOM_BARN = "REGNES_IKKE_SOM_BARN",
    BOR_MED_ANDRE_VOKSNE = "BOR_MED_ANDRE_VOKSNE",
    BOR_IKKE_MED_ANDRE_VOKSNE = "BOR_IKKE_MED_ANDRE_VOKSNE",
    UNNTAK_HOS_ANDRE = "UNNTAK_HOS_ANDRE",
    UNNTAK_ALENE = "UNNTAK_ALENE",
    UNNTAKENSLIGASYLSOKER = "UNNTAK_ENSLIG_ASYLSØKER",
    MED_VERGE = "MED_VERGE",
    ALENE = "ALENE",
}

export interface DatoperiodeDto {
    /** @format date */
    fom: string;
    /** @format date */
    tom?: string;
}

export interface DelberegningBarnetilleggSkattesats {
    periode: TypeArManedsperiode;
    skattFaktor: number;
    minstefradrag: number;
    skattAlminneligInntekt: number;
    trygdeavgift: number;
    trinnskatt: number;
    sumSkatt: number;
    sumInntekt: number;
}

export interface DelberegningBidragspliktigesAndel {
    periode: TypeArManedsperiode;
    endeligAndelFaktor: number;
    andelBeløp: number;
    beregnetAndelFaktor: number;
    barnEndeligInntekt: number;
    barnetErSelvforsørget: boolean;
}

export interface DelberegningBoforhold {
    periode: TypeArManedsperiode;
    /** @format double */
    antallBarn: number;
    borMedAndreVoksne: boolean;
}

export interface DelberegningEndringSjekkGrensePeriode {
    periode: TypeArManedsperiode;
    løpendeBidragBeløp?: number;
    løpendeBidragFraPrivatAvtale: boolean;
    beregnetBidragBeløp?: number;
    faktiskEndringFaktor?: number;
    endringErOverGrense: boolean;
}

export interface DelberegningSumInntekt {
    periode: TypeArManedsperiode;
    totalinntekt: number;
    kontantstøtte?: number;
    skattepliktigInntekt?: number;
    barnetillegg?: number;
    utvidetBarnetrygd?: number;
    småbarnstillegg?: number;
}

export interface DelberegningUnderholdskostnad {
    periode: TypeArManedsperiode;
    forbruksutgift: number;
    boutgift: number;
    barnetilsynMedStønad?: number;
    nettoTilsynsutgift?: number;
    barnetrygd: number;
    underholdskostnad: number;
    forpleining?: number;
}

export interface DelberegningUtgift {
    periode: TypeArManedsperiode;
    sumBetaltAvBp: number;
    sumGodkjent: number;
}

export interface DokumentmalBarnetilleggDetaljerDto {
    bruttoBeløp: number;
    nettoBeløp: number;
    visningsnavn: string;
}

export interface DokumentmalBidragsevneUtgifterBolig {
    borMedAndreVoksne: boolean;
    boutgiftBeløp: number;
    underholdBeløp: number;
}

export interface DokumentmalDelberegningBarnetilleggDto {
    barnetillegg: DokumentmalBarnetilleggDetaljerDto[];
    skattFaktor: number;
    delberegningSkattesats?: DelberegningBarnetilleggSkattesats;
    sumBruttoBeløp: number;
    sumNettoBeløp: number;
}

export interface DokumentmalDelberegningBidragsevneDto {
    sumInntekt25Prosent: number;
    bidragsevne: number;
    skatt: DokumentmalSkattBeregning;
    underholdEgneBarnIHusstand: DokumentmalUnderholdEgneBarnIHusstand;
    utgifter: DokumentmalBidragsevneUtgifterBolig;
}

export interface DokumentmalDelberegningBidragspliktigesBeregnedeTotalbidragDto {
    beregnetBidragPerBarnListe: NotatBeregnetBidragPerBarnDto[];
    bidragspliktigesBeregnedeTotalbidrag: number;
    periode: TypeArManedsperiode;
}

export interface DokumentmalForholdsmessigFordelingBeregningsdetaljer {
    sumBidragTilFordeling: number;
    finnesBarnMedLøpendeBidragSomIkkeErSøknadsbarn: boolean;
    sumBidragTilFordelingSPrioritertBidrag: number;
    sumBidragTilFordelingSøknadsbarn: number;
    sumBidragTilFordelingIkkeSøknadsbarn: number;
    sumPrioriterteBidragTilFordeling: number;
    bidragTilFordelingForBarnet: number;
    andelAvSumBidragTilFordelingFaktor: number;
    andelAvEvneBeløp: number;
    bidragEtterFordeling: number;
    harBPFullEvne: boolean;
    erKompletteGrunnlagForAlleLøpendeBidrag: boolean;
    erForholdsmessigFordelt: boolean;
    bidragTilFordelingAlle: DokumentmalForholdsmessigFordelingBidragTilFordelingBarn[];
}

export interface DokumentmalForholdsmessigFordelingBidragTilFordelingBarn {
    prioritertBidrag: boolean;
    privatAvtale: boolean;
    erSøknadsbarn: boolean;
    beregnetBidrag?: BeregnetBidragBarnDto;
    bidragTilFordeling: number;
    barn: DokumentmalPersonDto;
}

export interface DokumentmalManuellVedtak {
    valgt: boolean;
    /** @format date-time */
    fattetTidspunkt: string;
    /** @format date */
    virkningsDato: string;
    vedtakstype: Vedtakstype;
    resultatSistePeriode: string;
    privatAvtale: boolean;
    begrensetRevurdering: boolean;
    søknadstype: string;
}

export interface DokumentmalPersonDto {
    rolle?: Rolletype;
    navn?: string;
    /** @format date */
    fødselsdato?: string;
    ident?: string;
    erBeskyttet: boolean;
    innbetaltBeløp?: number;
    /** @format date */
    opphørsdato?: string;
    /** @format date */
    virkningstidspunkt?: string;
    saksnummer?: string;
    bidragsmottakerIdent?: string;
    revurdering: boolean;
}

export interface DokumentmalResultatBeregningInntekterDto {
    inntektBM?: number;
    inntektBP?: number;
    inntektBarn?: number;
    barnEndeligInntekt?: number;
    inntektBarnMånedlig?: number;
    totalEndeligInntekt: number;
    inntektBPMånedlig?: number;
    inntektBMMånedlig?: number;
}

export type DokumentmalResultatBidragsberegningBarnDto = UtilRequiredKeys<VedtakResultatInnhold, "type"> & {
    barn: DokumentmalPersonDto;
    /** @format int32 */
    indeksår?: number;
    innkrevesFraDato?: {
        /** @format int32 */
        year?: number;
        month?: DokumentmalResultatBidragsberegningBarnDtoMonthEnum;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    erAvvistRevurdering: boolean;
    erAvvisning: boolean;
    minstEnPeriodeHarSlåttUtTilFF: boolean;
    perioderSlåttUtTilFF: PeriodeSlattUtTilFF[];
    orkestrertVedtak?: EndeligOrkestrertVedtak;
    perioder: ResultatBarnebidragsberegningPeriodeDto[];
};

export interface DokumentmalSkattBeregning {
    sumSkatt: number;
    skattAlminneligInntekt: number;
    trinnskatt: number;
    trygdeavgift: number;
    skattAlminneligInntektMånedsbeløp: number;
    trinnskattMånedsbeløp: number;
    trygdeavgiftMånedsbeløp: number;
    skattMånedsbeløp: number;
}

export interface DokumentmalSluttberegningBarnebidragDetaljer {
    beregnetBeløp?: number;
    resultatBeløp?: number;
    uMinusNettoBarnetilleggBM?: number;
    bruttoBidragEtterBarnetilleggBM: number;
    nettoBidragEtterBarnetilleggBM: number;
    bruttoBidragJustertForEvneOg25Prosent: number;
    bruttoBidragEtterBegrensetRevurdering: number;
    bruttoBidragEtterBarnetilleggBP: number;
    nettoBidragEtterSamværsfradrag: number;
    bpAndelAvUVedDeltBostedFaktor: number;
    bpAndelAvUVedDeltBostedBeløp: number;
    løpendeForskudd?: number;
    løpendeBidrag?: number;
    barnetErSelvforsørget: boolean;
    bidragJustertForDeltBosted: boolean;
    bidragJustertForNettoBarnetilleggBP: boolean;
    bidragJustertForNettoBarnetilleggBM: boolean;
    bidragJustertNedTilEvne: boolean;
    bidragJustertNedTil25ProsentAvInntekt: boolean;
    bidragJustertTilForskuddssats: boolean;
    bidragJustertManueltTilForskuddssats: boolean;
    begrensetRevurderingUtført: boolean;
    ikkeOmsorgForBarnet: boolean;
    bpEvneVedForholdsmessigFordeling?: number;
    bpAndelAvUVedForholdsmessigFordelingFaktor?: number;
    bpSumAndelAvU?: number;
    resultat?: Resultatkode;
    resultatVisningsnavn?: Visningsnavn;
    uminusNettoBarnetilleggBM: number;
}

export interface DokumentmalUnderholdEgneBarnIHusstand {
    getårsbeløp: number;
    sjablon: number;
    /** @format double */
    antallBarnIHusstanden: number;
    måndesbeløp: number;
}

export interface EndeligOrkestrertVedtak {
    type?: Vedtakstype;
    perioder: ResultatBarnebidragsberegningPeriodeDto[];
}

export interface IndeksreguleringDetaljer {
    sluttberegning?: SluttberegningIndeksregulering;
    faktor: number;
}

export interface InntekterPerRolle {
    gjelder: DokumentmalPersonDto;
    arbeidsforhold: Arbeidsforhold[];
    årsinntekter: NotatInntektDto[];
    barnetillegg: NotatInntektDto[];
    utvidetBarnetrygd: NotatInntektDto[];
    småbarnstillegg: NotatInntektDto[];
    kontantstøtte: NotatInntektDto[];
    beregnetInntekter: NotatBeregnetInntektDto[];
    harInntekter: boolean;
}

export enum Inntektsrapportering {
    AINNTEKT = "AINNTEKT",
    AINNTEKTBEREGNET3MND = "AINNTEKT_BEREGNET_3MND",
    AINNTEKTBEREGNET12MND = "AINNTEKT_BEREGNET_12MND",
    AINNTEKTBEREGNET3MNDFRAOPPRINNELIGVEDTAKSTIDSPUNKT = "AINNTEKT_BEREGNET_3MND_FRA_OPPRINNELIG_VEDTAKSTIDSPUNKT",
    AINNTEKTBEREGNET12MNDFRAOPPRINNELIGVEDTAKSTIDSPUNKT = "AINNTEKT_BEREGNET_12MND_FRA_OPPRINNELIG_VEDTAKSTIDSPUNKT",
    AINNTEKTBEREGNET3MNDFRAOPPRINNELIGVEDTAK = "AINNTEKT_BEREGNET_3MND_FRA_OPPRINNELIG_VEDTAK",
    AINNTEKTBEREGNET12MNDFRAOPPRINNELIGVEDTAK = "AINNTEKT_BEREGNET_12MND_FRA_OPPRINNELIG_VEDTAK",
    KAPITALINNTEKT = "KAPITALINNTEKT",
    LIGNINGSINNTEKT = "LIGNINGSINNTEKT",
    KONTANTSTOTTE = "KONTANTSTØTTE",
    SMABARNSTILLEGG = "SMÅBARNSTILLEGG",
    UTVIDET_BARNETRYGD = "UTVIDET_BARNETRYGD",
    AAP = "AAP",
    DAGPENGER = "DAGPENGER",
    FORELDREPENGER = "FORELDREPENGER",
    INTRODUKSJONSSTONAD = "INTRODUKSJONSSTØNAD",
    KVALIFISERINGSSTONAD = "KVALIFISERINGSSTØNAD",
    OVERGANGSSTONAD = "OVERGANGSSTØNAD",
    PENSJON = "PENSJON",
    SYKEPENGER = "SYKEPENGER",
    BARNETILLEGG = "BARNETILLEGG",
    BARNETILSYN = "BARNETILSYN",
    PERSONINNTEKT_EGNE_OPPLYSNINGER = "PERSONINNTEKT_EGNE_OPPLYSNINGER",
    KAPITALINNTEKT_EGNE_OPPLYSNINGER = "KAPITALINNTEKT_EGNE_OPPLYSNINGER",
    SAKSBEHANDLER_BEREGNET_INNTEKT = "SAKSBEHANDLER_BEREGNET_INNTEKT",
    LONNMANUELTBEREGNET = "LØNN_MANUELT_BEREGNET",
    NAeRINGSINNTEKTMANUELTBEREGNET = "NÆRINGSINNTEKT_MANUELT_BEREGNET",
    YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET = "YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET",
    AINNTEKT_KORRIGERT_FOR_BARNETILLEGG = "AINNTEKT_KORRIGERT_FOR_BARNETILLEGG",
    BARNETRYGD_MANUELL_VURDERING = "BARNETRYGD_MANUELL_VURDERING",
    BARNS_SYKDOM = "BARNS_SYKDOM",
    SKJONNMANGLERDOKUMENTASJON = "SKJØNN_MANGLER_DOKUMENTASJON",
    FORDELSAeRFRADRAGENSLIGFORSORGER = "FORDEL_SÆRFRADRAG_ENSLIG_FORSØRGER",
    FODSELADOPSJON = "FØDSEL_ADOPSJON",
    INNTEKTSOPPLYSNINGER_FRA_ARBEIDSGIVER = "INNTEKTSOPPLYSNINGER_FRA_ARBEIDSGIVER",
    LIGNINGSOPPLYSNINGER_MANGLER = "LIGNINGSOPPLYSNINGER_MANGLER",
    LIGNING_FRA_SKATTEETATEN = "LIGNING_FRA_SKATTEETATEN",
    LONNSOPPGAVEFRASKATTEETATEN = "LØNNSOPPGAVE_FRA_SKATTEETATEN",
    LONNSOPPGAVEFRASKATTEETATENKORRIGERTFORBARNETILLEGG = "LØNNSOPPGAVE_FRA_SKATTEETATEN_KORRIGERT_FOR_BARNETILLEGG",
    SKJONNMANGLENDEBRUKAVEVNE = "SKJØNN_MANGLENDE_BRUK_AV_EVNE",
    NETTO_KAPITALINNTEKT = "NETTO_KAPITALINNTEKT",
    PENSJON_KORRIGERT_FOR_BARNETILLEGG = "PENSJON_KORRIGERT_FOR_BARNETILLEGG",
    REHABILITERINGSPENGER = "REHABILITERINGSPENGER",
    SKATTEGRUNNLAG_KORRIGERT_FOR_BARNETILLEGG = "SKATTEGRUNNLAG_KORRIGERT_FOR_BARNETILLEGG",
}

export enum Inntektstype {
    AAP = "AAP",
    DAGPENGER = "DAGPENGER",
    FORELDREPENGER = "FORELDREPENGER",
    INTRODUKSJONSSTONAD = "INTRODUKSJONSSTØNAD",
    KVALIFISERINGSSTONAD = "KVALIFISERINGSSTØNAD",
    OVERGANGSSTONAD = "OVERGANGSSTØNAD",
    PENSJON = "PENSJON",
    SYKEPENGER = "SYKEPENGER",
    KONTANTSTOTTE = "KONTANTSTØTTE",
    SMABARNSTILLEGG = "SMÅBARNSTILLEGG",
    UTVIDET_BARNETRYGD = "UTVIDET_BARNETRYGD",
    KAPITALINNTEKT = "KAPITALINNTEKT",
    LONNSINNTEKT = "LØNNSINNTEKT",
    NAeRINGSINNTEKT = "NÆRINGSINNTEKT",
    BARNETILSYN = "BARNETILSYN",
    BARNETILLEGG_PENSJON = "BARNETILLEGG_PENSJON",
    BARNETILLEGGUFORETRYGD = "BARNETILLEGG_UFØRETRYGD",
    BARNETILLEGG_DAGPENGER = "BARNETILLEGG_DAGPENGER",
    BARNETILLEGGKVALIFISERINGSSTONAD = "BARNETILLEGG_KVALIFISERINGSSTØNAD",
    BARNETILLEGG_AAP = "BARNETILLEGG_AAP",
    BARNETILLEGG_DNB = "BARNETILLEGG_DNB",
    BARNETILLEGG_NORDEA = "BARNETILLEGG_NORDEA",
    BARNETILLEGG_STOREBRAND = "BARNETILLEGG_STOREBRAND",
    BARNETILLEGG_KLP = "BARNETILLEGG_KLP",
    BARNETILLEGG_SPK = "BARNETILLEGG_SPK",
    BARNETILLEGG_TILTAKSPENGER = "BARNETILLEGG_TILTAKSPENGER",
    BARNETILLEGG_SUMMERT = "BARNETILLEGG_SUMMERT",
}

export enum Kilde {
    MANUELL = "MANUELL",
    OFFENTLIG = "OFFENTLIG",
}

export interface KlageOmgjoringDetaljer {
    /** @format date-time */
    resultatFraVedtakVedtakstidspunkt?: string;
    beregnTilDato?: {
        /** @format int32 */
        year?: number;
        month?: KlageOmgjoringDetaljerMonthEnum;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    manuellAldersjustering: boolean;
    delAvVedtaket: boolean;
    kanOpprette35c: boolean;
    skalOpprette35c: boolean;
}

export interface NotatAndreVoksneIHusstanden {
    opplysningerFraFolkeregisteret: OpplysningerFraFolkeregisteretMedDetaljerBostatuskodeNotatAndreVoksneIHusstandenDetaljerDto[];
    opplysningerBruktTilBeregning: OpplysningerBruktTilBeregningBostatuskode[];
}

export interface NotatAndreVoksneIHusstandenDetaljerDto {
    /** @format int32 */
    totalAntallHusstandsmedlemmer: number;
    husstandsmedlemmer: NotatVoksenIHusstandenDetaljerDto[];
}

export interface NotatBarnetilsynOffentligeOpplysninger {
    periode: TypeArManedsperiode;
    tilsynstype?: NotatBarnetilsynOffentligeOpplysningerTilsynstypeEnum;
    skolealder?: NotatBarnetilsynOffentligeOpplysningerSkolealderEnum;
}

/** Notat begrunnelse skrevet av saksbehandler */
export interface NotatBegrunnelseDto {
    innhold?: string;
    innholdFraOmgjortVedtak?: string;
    /** @deprecated */
    intern?: string;
    gjelder?: DokumentmalPersonDto;
}

export interface NotatBehandlingDetaljerDto {
    /** @format date */
    klageMottattDato?: string;
    vedtakstype?: Vedtakstype;
    opprinneligVedtakstype?: Vedtakstype;
    kategori?: NotatSaerbidragKategoriDto;
    søktAv?: SoktAvType;
    /** @format date */
    mottattDato?: string;
    søktFraDato?: {
        /** @format int32 */
        year?: number;
        month?: NotatBehandlingDetaljerDtoMonthEnum;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    søknadstype?: string;
    /**
     * Hent informasjon fra virkningstidspunkt
     * @deprecated
     * @format date
     */
    virkningstidspunkt?: string;
    /**
     * Hent informasjon fra virkningstidspunkt
     * @deprecated
     */
    avslag?: Resultatkode;
    avslagVisningsnavn?: string;
    avslagVisningsnavnUtenPrefiks?: string;
    kategoriVisningsnavn?: string;
    vedtakstypeVisningsnavn?: string;
    erAvvisning: boolean;
}

export interface NotatBeregnetBidragPerBarnDto {
    beregnetBidragPerBarn: BeregnetBidragPerBarn;
    personidentBarn: string;
}

export interface NotatBeregnetInntektDto {
    gjelderBarn: DokumentmalPersonDto;
    summertInntektListe: DelberegningSumInntekt[];
}

export interface NotatBeregnetPrivatAvtalePeriodeDto {
    periode: DatoperiodeDto;
    indeksfaktor: number;
    beløp: number;
}

export interface NotatBeregningsdetaljerSamvaersfradrag {
    samværsfradrag: number;
    samværsklasse: Samvaersklasse;
    gjennomsnittligSamværPerMåned: number;
    samværsklasseVisningsnavn: string;
}

export interface NotatBoforholdDto {
    barn: BoforholdBarn[];
    andreVoksneIHusstanden?: NotatAndreVoksneIHusstanden;
    boforholdBMSøknadsbarn: NotatBoforholdTilBMMedSoknadsbarn[];
    sivilstand: NotatSivilstand;
    /** Notat begrunnelse skrevet av saksbehandler */
    begrunnelse: NotatBegrunnelseDto;
    /**
     * Bruk begrunnelse
     * @deprecated
     */
    notat: NotatBegrunnelseDto;
    beregnetBoforhold: DelberegningBoforhold[];
}

export interface NotatBoforholdTilBMMedSoknadsbarn {
    gjelderBarn: DokumentmalPersonDto;
    perioder: OpplysningerFraFolkeregisteretMedDetaljerBostatuskodeUnit[];
}

export interface NotatFaktiskTilsynsutgiftDto {
    periode: DatoperiodeDto;
    utgift: number;
    kostpenger?: number;
    kommentar?: string;
    total: number;
}

export interface NotatGebyrDetaljerDto {
    søknad?: NotatGebyrSoknadDetaljerDto;
    inntekt: NotatGebyrInntektDto;
    manueltOverstyrtGebyr?: NotatManueltOverstyrGebyrDto;
    beregnetIlagtGebyr: boolean;
    endeligIlagtGebyr: boolean;
    begrunnelse?: string;
    beløpGebyrsats: number;
    /** @deprecated */
    rolle: DokumentmalPersonDto;
    erManueltOverstyrt: boolean;
    gebyrResultatVisningsnavn: string;
}

export interface NotatGebyrInntektDto {
    skattepliktigInntekt: number;
    maksBarnetillegg?: number;
    totalInntekt: number;
}

export interface NotatGebyrRolleV2Dto {
    gebyrDetaljer: NotatGebyrDetaljerDto[];
    rolle: DokumentmalPersonDto;
}

export interface NotatGebyrSoknadDetaljerDto {
    saksnummer: string;
    /** @format int64 */
    søknadsid: number;
    /** @format date */
    mottattDato: string;
    /** @format date */
    søknadFomDato?: string;
    søktAvType: SoktAvType;
    behandlingstype?: Behandlingstype;
    behandlingstema?: Behandlingstema;
    behandlingstypeVisningsnavn?: string;
    søktAvTypeVisningsnavn?: string;
    behandlingstemaVisningsnavn?: string;
}

export interface NotatGebyrV2Dto {
    gebyrRoller: NotatGebyrRolleV2Dto[];
}

export interface NotatInntektDto {
    periode?: TypeArManedsperiode;
    opprinneligPeriode?: TypeArManedsperiode;
    beløp: number;
    kilde: Kilde;
    type: Inntektsrapportering;
    medIBeregning: boolean;
    gjelderBarn?: DokumentmalPersonDto;
    historisk: boolean;
    inntektsposter: NotatInntektspostDto[];
    /** Avrundet månedsbeløp for barnetillegg */
    månedsbeløp?: number;
    visningsnavn: string;
}

export interface NotatInntekterDto {
    inntekterPerRolle: InntekterPerRolle[];
    offentligeInntekterPerRolle: InntekterPerRolle[];
    /** Notat begrunnelse skrevet av saksbehandler */
    notat: NotatBegrunnelseDto;
    /** @uniqueItems true */
    notatPerRolle: NotatBegrunnelseDto[];
    /** @uniqueItems true */
    begrunnelsePerRolle: NotatBegrunnelseDto[];
}

export interface NotatInntektspostDto {
    kode?: string;
    inntektstype?: Inntektstype;
    beløp: number;
    visningsnavn?: string;
}

export interface NotatMaksGodkjentBelopDto {
    taMed: boolean;
    beløp?: number;
    begrunnelse?: string;
}

export enum NotatMalType {
    FORSKUDD = "FORSKUDD",
    SAeRBIDRAG = "SÆRBIDRAG",
    BIDRAG = "BIDRAG",
}

export interface NotatManueltOverstyrGebyrDto {
    begrunnelse?: string;
    /** Skal bare settes hvis det er avslag */
    ilagtGebyr?: boolean;
}

export interface NotatOffentligeOpplysningerUnderhold {
    offentligeOpplysningerBarn: NotatOffentligeOpplysningerUnderholdBarn[];
    andreBarnTilBidragsmottaker: DokumentmalPersonDto[];
    bidragsmottakerHarInnvilgetTilleggsstønad: boolean;
}

export interface NotatOffentligeOpplysningerUnderholdBarn {
    gjelder: DokumentmalPersonDto;
    gjelderBarn?: DokumentmalPersonDto;
    barnetilsyn: NotatBarnetilsynOffentligeOpplysninger[];
    harTilleggsstønad: boolean;
}

export interface NotatPrivatAvtaleDto {
    gjelderBarn: DokumentmalPersonDto;
    /** @format date */
    avtaleDato?: string;
    avtaleType?: PrivatAvtaleType;
    skalIndeksreguleres: boolean;
    utlandsbidrag: boolean;
    /** Notat begrunnelse skrevet av saksbehandler */
    begrunnelse?: NotatBegrunnelseDto;
    perioder: NotatPrivatAvtalePeriodeDto[];
    vedtakslisteUtenInnkreving: DokumentmalManuellVedtak[];
    beregnetPrivatAvtalePerioder: NotatBeregnetPrivatAvtalePeriodeDto[];
    avtaleTypeVisningsnavn?: string;
}

export interface NotatPrivatAvtalePeriodeDto {
    periode: DatoperiodeDto;
    beløp: number;
    samværsklasse?: Samvaersklasse;
    valutakode?: Valutakode;
}

export type NotatResultatForskuddBeregningBarnDto = UtilRequiredKeys<VedtakResultatInnhold, "type"> & {
    barn: DokumentmalPersonDto;
    perioder: NotatResultatPeriodeDto[];
};

export interface NotatResultatPeriodeDto {
    periode: TypeArManedsperiode;
    beløp: number;
    resultatKode: Resultatkode;
    regel: string;
    sivilstand?: Sivilstandskode;
    inntekt: number;
    vedtakstype?: Vedtakstype;
    /** @format int32 */
    antallBarnIHusstanden: number;
    resultatKodeVisningsnavn: string;
    sivilstandVisningsnavn?: string;
}

export type NotatResultatSaerbidragsberegningDto = UtilRequiredKeys<VedtakResultatInnhold, "type"> & {
    periode: TypeArManedsperiode;
    bpsAndel?: DelberegningBidragspliktigesAndel;
    beregning?: UtgiftBeregningDto;
    forskuddssats?: number;
    maksGodkjentBeløp?: number;
    inntekter?: DokumentmalResultatBeregningInntekterDto;
    delberegningBidragspliktigesBeregnedeTotalbidrag?: DokumentmalDelberegningBidragspliktigesBeregnedeTotalbidragDto;
    delberegningBidragsevne?: DokumentmalDelberegningBidragsevneDto;
    delberegningUtgift?: DelberegningUtgift;
    resultat: number;
    resultatKode: Resultatkode;
    /** @format double */
    antallBarnIHusstanden?: number;
    voksenIHusstanden?: boolean;
    enesteVoksenIHusstandenErEgetBarn?: boolean;
    erDirekteAvslag: boolean;
    bpHarEvne: boolean;
    beløpSomInnkreves: number;
    resultatVisningsnavn: string;
};

export interface NotatSamvaerBarnDto {
    gjelderBarn: DokumentmalPersonDto;
    /** Notat begrunnelse skrevet av saksbehandler */
    begrunnelse?: NotatBegrunnelseDto;
    perioder: NotatSamvaersperiodeDto[];
}

export interface NotatSamvaerDto {
    erSammeForAlle: boolean;
    barn: NotatSamvaerBarnDto[];
}

export interface NotatSamvaersperiodeDto {
    periode: DatoperiodeDto;
    samværsklasse: Samvaersklasse;
    gjennomsnittligSamværPerMåned: number;
    beregning?: SamvaerskalkulatorDetaljer;
    samværsklasseVisningsnavn: string;
    ferieVisningsnavnMap: Record<string, string>;
    frekvensVisningsnavnMap: Record<string, string>;
}

export interface NotatSivilstand {
    opplysningerFraFolkeregisteret: OpplysningerFraFolkeregisteretMedDetaljerSivilstandskodePDLUnit[];
    opplysningerBruktTilBeregning: OpplysningerBruktTilBeregningSivilstandskode[];
}

export interface NotatStonadTilBarnetilsynDto {
    periode: DatoperiodeDto;
    skolealder: NotatStonadTilBarnetilsynDtoSkolealderEnum;
    tilsynstype: NotatStonadTilBarnetilsynDtoTilsynstypeEnum;
    kilde: Kilde;
    skoleaderVisningsnavn: string;
    tilsynstypeVisningsnavn: string;
}

export interface NotatSaerbidragKategoriDto {
    kategori: Saerbidragskategori;
    beskrivelse?: string;
}

export interface NotatSaerbidragUtgifterDto {
    beregning?: NotatUtgiftBeregningDto;
    maksGodkjentBeløp?: NotatMaksGodkjentBelopDto;
    /** Notat begrunnelse skrevet av saksbehandler */
    begrunnelse: NotatBegrunnelseDto;
    /**
     * Bruk begrunnelse
     * @deprecated
     */
    notat: NotatBegrunnelseDto;
    utgifter: NotatUtgiftspostDto[];
    totalBeregning: NotatTotalBeregningUtgifterDto[];
}

export interface NotatTilleggsstonadDto {
    periode: DatoperiodeDto;
    dagsats: number;
    total: number;
}

export interface NotatTilsynsutgiftBarn {
    gjelderBarn: DokumentmalPersonDto;
    totalTilsynsutgift: number;
    beløp: number;
    kostpenger?: number;
    tilleggsstønad?: number;
}

export interface NotatTotalBeregningUtgifterDto {
    betaltAvBp: boolean;
    utgiftstype: string;
    totalKravbeløp: number;
    totalGodkjentBeløp: number;
    utgiftstypeVisningsnavn: string;
}

export interface NotatUnderholdBarnDto {
    gjelderBarn: DokumentmalPersonDto;
    harTilsynsordning?: boolean;
    stønadTilBarnetilsyn: NotatStonadTilBarnetilsynDto[];
    faktiskTilsynsutgift: NotatFaktiskTilsynsutgiftDto[];
    tilleggsstønad: NotatTilleggsstonadDto[];
    underholdskostnad: NotatUnderholdskostnadBeregningDto[];
    /** Notat begrunnelse skrevet av saksbehandler */
    begrunnelse?: NotatBegrunnelseDto;
}

export interface NotatUnderholdDto {
    underholdskostnaderBarn: NotatUnderholdBarnDto[];
    offentligeOpplysninger: NotatOffentligeOpplysningerUnderholdBarn[];
    offentligeOpplysningerV2: NotatOffentligeOpplysningerUnderhold;
}

export interface NotatUnderholdskostnadBeregningDto {
    periode: DatoperiodeDto;
    forbruk: number;
    boutgifter: number;
    stønadTilBarnetilsyn: number;
    tilsynsutgifter: number;
    barnetrygd: number;
    total: number;
    beregningsdetaljer?: NotatUnderholdskostnadPeriodeBeregningsdetaljer;
}

export interface NotatUnderholdskostnadPeriodeBeregningsdetaljer {
    tilsynsutgifterBarn: NotatTilsynsutgiftBarn[];
    sjablonMaksTilsynsutgift: number;
    sjablonMaksFradrag: number;
    /** @format int32 */
    antallBarnBMUnderTolvÅr: number;
    /** @format int32 */
    antallBarnBMBeregnet: number;
    /** @format int32 */
    antallBarnMedTilsynsutgifter: number;
    skattesatsFaktor: number;
    totalTilsynsutgift: number;
    sumTilsynsutgifter: number;
    bruttoTilsynsutgift: number;
    justertBruttoTilsynsutgift: number;
    nettoTilsynsutgift: number;
    erBegrensetAvMaksTilsyn: boolean;
    fordelingFaktor: number;
    skattefradragPerBarn: number;
    maksfradragAndel: number;
    skattefradrag: number;
    skattefradragMaksFradrag: number;
    skattefradragTotalTilsynsutgift: number;
}

export interface NotatUtgiftBeregningDto {
    /** Beløp som er direkte betalt av BP */
    beløpDirekteBetaltAvBp: number;
    /** Summen av godkjente beløp som brukes for beregningen */
    totalGodkjentBeløp: number;
    /** Summen av kravbeløp */
    totalKravbeløp: number;
    /** Summen av godkjente beløp som brukes for beregningen */
    totalGodkjentBeløpBp?: number;
    /** Summen av godkjent beløp for utgifter BP har betalt plus beløp som er direkte betalt av BP */
    totalBeløpBetaltAvBp: number;
}

export interface NotatUtgiftspostDto {
    /**
     * Når utgifter gjelder. Kan være feks dato på kvittering
     * @format date
     */
    dato: string;
    /** Type utgift. Kan feks være hva som ble kjøpt for kravbeløp (bugnad, klær, sko, etc) */
    type: Utgiftstype | string;
    /** Beløp som er betalt for utgiften det gjelder */
    kravbeløp: number;
    /** Beløp som er godkjent for beregningen */
    godkjentBeløp: number;
    /** Begrunnelse for hvorfor godkjent beløp avviker fra kravbeløp. Må settes hvis godkjent beløp er ulik kravbeløp */
    begrunnelse?: string;
    /** Om utgiften er betalt av BP */
    betaltAvBp: boolean;
    utgiftstypeVisningsnavn: string;
}

export interface NotatVedtakDetaljerDto {
    erFattet: boolean;
    fattetAvSaksbehandler?: string;
    /** @format date-time */
    fattetTidspunkt?: string;
    resultat: (
        | DokumentmalResultatBidragsberegningBarnDto
        | NotatResultatForskuddBeregningBarnDto
        | NotatResultatSaerbidragsberegningDto
    )[];
}

export interface NotatVirkningstidspunktBarnDto {
    rolle: DokumentmalPersonDto;
    behandlingstype?: Behandlingstype;
    /**
     * Bruk behandlingstype
     * @deprecated
     */
    søknadstype?: string;
    vedtakstype?: Vedtakstype;
    søktAv?: SoktAvType;
    /**
     * @format date
     * @example "01.12.2025"
     */
    mottattDato?: string;
    /**
     * @format date
     * @example "01.12.2025"
     */
    søktFraDato?: string;
    beregnTilDato?: {
        /** @format int32 */
        year?: number;
        month?: NotatVirkningstidspunktBarnDtoMonthEnum;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    opphørsdato?: {
        /** @format int32 */
        year?: number;
        month?: NotatVirkningstidspunktBarnDtoMonthEnum1;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    beregnTil?: BeregnTil;
    etterfølgendeVedtakVirkningstidspunkt?: {
        /** @format int32 */
        year?: number;
        month?: NotatVirkningstidspunktBarnDtoMonthEnum2;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    /**
     * @format date
     * @example "01.12.2025"
     */
    virkningstidspunkt?: string;
    avslag?: Resultatkode;
    årsak?: TypeArsakstype;
    /** Notat begrunnelse skrevet av saksbehandler */
    begrunnelse: NotatBegrunnelseDto;
    /** Notat begrunnelse skrevet av saksbehandler */
    begrunnelseVurderingAvSkolegang?: NotatBegrunnelseDto;
    /**
     * Bruk begrunnelse
     * @deprecated
     */
    notat: NotatBegrunnelseDto;
    behandlingstypeVisningsnavn?: string;
    avslagVisningsnavn?: string;
    avslagVisningsnavnUtenPrefiks?: string;
    erAvvisning: boolean;
    årsakVisningsnavn?: string;
}

export interface NotatVirkningstidspunktDto {
    /** Hvis det er likt for alle bruk avslag/årsak fra ett av barna */
    erLikForAlle: boolean;
    erVirkningstidspunktLikForAlle: boolean;
    erAvslagForAlle: boolean;
    eldsteVirkningstidspunkt: {
        /** @format int32 */
        year?: number;
        month?: NotatVirkningstidspunktDtoMonthEnum;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    barn: NotatVirkningstidspunktBarnDto[];
}

export interface NotatVoksenIHusstandenDetaljerDto {
    navn: string;
    /** @format date */
    fødselsdato?: string;
    erBeskyttet: boolean;
    harRelasjonTilBp: boolean;
}

export interface OpplysningerBruktTilBeregningBostatuskode {
    periode: TypeArManedsperiode;
    status: Bostatuskode;
    kilde: Kilde;
    statusVisningsnavn?: string;
}

export interface OpplysningerBruktTilBeregningSivilstandskode {
    periode: TypeArManedsperiode;
    status: Sivilstandskode;
    kilde: Kilde;
    statusVisningsnavn?: string;
}

export interface OpplysningerFraFolkeregisteretMedDetaljerBostatuskodeNotatAndreVoksneIHusstandenDetaljerDto {
    periode: TypeArManedsperiode;
    status?: Bostatuskode;
    detaljer?: NotatAndreVoksneIHusstandenDetaljerDto;
    statusVisningsnavn?: string;
}

export interface OpplysningerFraFolkeregisteretMedDetaljerBostatuskodeUnit {
    periode: TypeArManedsperiode;
    status?: Bostatuskode;
    statusVisningsnavn?: string;
}

export interface OpplysningerFraFolkeregisteretMedDetaljerSivilstandskodePDLUnit {
    periode: TypeArManedsperiode;
    status?: SivilstandskodePDL;
    statusVisningsnavn?: string;
}

export interface PeriodeSlattUtTilFF {
    periode: TypeArManedsperiode;
    erEvneJustertNedTil25ProsentAvInntekt: boolean;
}

export enum PrivatAvtaleType {
    PRIVAT_AVTALE = "PRIVAT_AVTALE",
    DOM_RETTSFORLIK = "DOM_RETTSFORLIK",
    VEDTAK_FRA_NAV = "VEDTAK_FRA_NAV",
}

export interface ResultatBarnebidragsberegningPeriodeDto {
    periode: TypeArManedsperiode;
    underholdskostnad: number;
    bpsAndelU: number;
    bpsAndelBeløp: number;
    samværsfradrag: number;
    beregnetBidrag: number;
    faktiskBidrag: number;
    resultatKode?: Resultatkode;
    erOpphør: boolean;
    erDirekteAvslag: boolean;
    vedtakstype: Vedtakstype;
    beregningsdetaljer?: BidragPeriodeBeregningsdetaljer;
    klageOmgjøringDetaljer?: KlageOmgjoringDetaljer;
    delvedtakstypeVisningsnavn: string;
    resultatkodeVisningsnavn: string;
    resultatFraVedtak?: ResultatFraVedtakGrunnlag;
}

export interface ResultatFraVedtakGrunnlag {
    /** @format int32 */
    vedtaksid?: number;
    omgjøringsvedtak: boolean;
    beregnet: boolean;
    opprettParagraf35c: boolean;
    /** @format date-time */
    vedtakstidspunkt?: string;
    vedtakstype?: Vedtakstype;
}

export enum Resultatkode {
    OPPHOR = "OPPHØR",
    GEBYR_FRITATT = "GEBYR_FRITATT",
    GEBYR_ILAGT = "GEBYR_ILAGT",
    BARNETERSELVFORSORGET = "BARNET_ER_SELVFORSØRGET",
    DIREKTEOPPGJOR = "DIREKTE_OPPGJØR",
    IKKE_DOKUMENTERT_SKOLEGANG = "IKKE_DOKUMENTERT_SKOLEGANG",
    AVSLUTTET_SKOLEGANG = "AVSLUTTET_SKOLEGANG",
    IKKESTERKNOKGRUNNOGBIDRAGETHAROPPHORT = "IKKE_STERK_NOK_GRUNN_OG_BIDRAGET_HAR_OPPHØRT",
    IKKE_OMSORG_FOR_BARNET = "IKKE_OMSORG_FOR_BARNET",
    BARNETERDODT = "BARNET_ER_DØDT",
    BIDRAGSMOTTAKER_HAR_OMSORG_FOR_BARNET = "BIDRAGSMOTTAKER_HAR_OMSORG_FOR_BARNET",
    BIDRAGSPLIKTIGERDOD = "BIDRAGSPLIKTIG_ER_DØD",
    BEREGNET_BIDRAG = "BEREGNET_BIDRAG",
    REDUSERTFORSKUDD50PROSENT = "REDUSERT_FORSKUDD_50_PROSENT",
    ORDINAeRTFORSKUDD75PROSENT = "ORDINÆRT_FORSKUDD_75_PROSENT",
    FORHOYETFORSKUDD100PROSENT = "FORHØYET_FORSKUDD_100_PROSENT",
    FORHOYETFORSKUDD11AR125PROSENT = "FORHØYET_FORSKUDD_11_ÅR_125_PROSENT",
    SAeRTILSKUDDINNVILGET = "SÆRTILSKUDD_INNVILGET",
    SAeRBIDRAGINNVILGET = "SÆRBIDRAG_INNVILGET",
    SAeRTILSKUDDIKKEFULLBIDRAGSEVNE = "SÆRTILSKUDD_IKKE_FULL_BIDRAGSEVNE",
    SAeRBIDRAGIKKEFULLBIDRAGSEVNE = "SÆRBIDRAG_IKKE_FULL_BIDRAGSEVNE",
    SAeRBIDRAGMANGLERBIDRAGSEVNE = "SÆRBIDRAG_MANGLER_BIDRAGSEVNE",
    AVSLAG = "AVSLAG",
    AVSLAG2 = "AVSLAG2",
    PARTENBEROMOPPHOR = "PARTEN_BER_OM_OPPHØR",
    AVSLAGOVER18AR = "AVSLAG_OVER_18_ÅR",
    AVSLAGIKKEREGISTRERTPAADRESSE = "AVSLAG_IKKE_REGISTRERT_PÅ_ADRESSE",
    AVSLAGHOYINNTEKT = "AVSLAG_HØY_INNTEKT",
    PAGRUNNAVBARNEPENSJON = "PÅ_GRUNN_AV_BARNEPENSJON",
    IKKE_OMSORG = "IKKE_OMSORG",
    BARNETS_EKTESKAP = "BARNETS_EKTESKAP",
    BARNETS_INNTEKT = "BARNETS_INNTEKT",
    PAGRUNNAVYTELSEFRAFOLKETRYGDEN = "PÅ_GRUNN_AV_YTELSE_FRA_FOLKETRYGDEN",
    FULLT_UNDERHOLDT_AV_OFFENTLIG = "FULLT_UNDERHOLDT_AV_OFFENTLIG",
    IKKE_OPPHOLD_I_RIKET = "IKKE_OPPHOLD_I_RIKET",
    MANGLENDE_DOKUMENTASJON = "MANGLENDE_DOKUMENTASJON",
    PAGRUNNAVSAMMENFLYTTING = "PÅ_GRUNN_AV_SAMMENFLYTTING",
    OPPHOLD_I_UTLANDET = "OPPHOLD_I_UTLANDET",
    UTENLANDSK_YTELSE = "UTENLANDSK_YTELSE",
    AVSLAG_PRIVAT_AVTALE_BIDRAG = "AVSLAG_PRIVAT_AVTALE_BIDRAG",
    IKKESOKTOMINNKREVINGAVBIDRAG = "IKKE_SØKT_OM_INNKREVING_AV_BIDRAG",
    IKKE_INNKREVING_AV_BIDRAG = "IKKE_INNKREVING_AV_BIDRAG",
    UTGIFTER_DEKKES_AV_BARNEBIDRAGET = "UTGIFTER_DEKKES_AV_BARNEBIDRAGET",
    IKKENODVENDIGEUTGIFTER = "IKKE_NØDVENDIGE_UTGIFTER",
    PRIVAT_AVTALE = "PRIVAT_AVTALE",
    AVSLAGPRIVATAVTALEOMSAeRBIDRAG = "AVSLAG_PRIVAT_AVTALE_OM_SÆRBIDRAG",
    ALLE_UTGIFTER_ER_FORELDET = "ALLE_UTGIFTER_ER_FORELDET",
    GODKJENTBELOPERLAVEREENNFORSKUDDSSATS = "GODKJENT_BELØP_ER_LAVERE_ENN_FORSKUDDSSATS",
    INGEN_ENDRING_UNDER_GRENSE = "INGEN_ENDRING_UNDER_GRENSE",
    INNVILGET_VEDTAK = "INNVILGET_VEDTAK",
    SKJONNUTLANDET = "SKJØNN_UTLANDET",
    LAVERE_ENN_INNTEKTSEVNE_BEGGE_PARTER = "LAVERE_ENN_INNTEKTSEVNE_BEGGE_PARTER",
    LAVERE_ENN_INNTEKTSEVNE_BIDRAGSPLIKTIG = "LAVERE_ENN_INNTEKTSEVNE_BIDRAGSPLIKTIG",
    LAVERE_ENN_INNTEKTSEVNE_BIDRAGSMOTTAKER = "LAVERE_ENN_INNTEKTSEVNE_BIDRAGSMOTTAKER",
    MANGLER_DOKUMENTASJON_AV_INNTEKT_BEGGE_PARTER = "MANGLER_DOKUMENTASJON_AV_INNTEKT_BEGGE_PARTER",
    MANGLER_DOKUMENTASJON_AV_INNTEKT_BIDRAGSPLIKTIG = "MANGLER_DOKUMENTASJON_AV_INNTEKT_BIDRAGSPLIKTIG",
    MANGLER_DOKUMENTASJON_AV_INNTEKT_BIDRAGSMOTTAKER = "MANGLER_DOKUMENTASJON_AV_INNTEKT_BIDRAGSMOTTAKER",
    INNTIL1ARTILBAKE = "INNTIL_1_ÅR_TILBAKE",
    MAKS25PROSENTAVINNTEKT = "MAKS_25_PROSENT_AV_INNTEKT",
    MANGLER_BIDRAGSEVNE = "MANGLER_BIDRAGSEVNE",
    KOSTNADSBEREGNET_BIDRAG = "KOSTNADSBEREGNET_BIDRAG",
    INNKREVINGSGRUNNLAG = "INNKREVINGSGRUNNLAG",
    INDEKSREGULERING = "INDEKSREGULERING",
    BIDRAG_JUSTERT_FOR_DELT_BOSTED = "BIDRAG_JUSTERT_FOR_DELT_BOSTED",
    BIDRAG_JUSTERT_FOR_NETTO_BARNETILLEGG_BP = "BIDRAG_JUSTERT_FOR_NETTO_BARNETILLEGG_BP",
    BIDRAG_JUSTERT_FOR_NETTO_BARNETILLEGG_BM = "BIDRAG_JUSTERT_FOR_NETTO_BARNETILLEGG_BM",
    BIDRAG_JUSTERT_TIL_FORSKUDDSSATS = "BIDRAG_JUSTERT_TIL_FORSKUDDSSATS",
    BIDRAG_JUSTERT_MANUELT_TIL_FORSKUDDSSATS = "BIDRAG_JUSTERT_MANUELT_TIL_FORSKUDDSSATS",
}

export enum Rolletype {
    BA = "BA",
    BM = "BM",
    BP = "BP",
    FR = "FR",
    RM = "RM",
}

export interface SamvaerskalkulatorDetaljer {
    ferier: SamvaerskalkulatorFerie[];
    regelmessigSamværNetter: number;
}

export interface SamvaerskalkulatorFerie {
    type: SamvaerskalkulatorFerietype;
    bidragsmottakerNetter: number;
    bidragspliktigNetter: number;
    frekvens: SamvaerskalkulatorNetterFrekvens;
}

export enum SamvaerskalkulatorFerietype {
    JULNYTTAR = "JUL_NYTTÅR",
    VINTERFERIE = "VINTERFERIE",
    PASKE = "PÅSKE",
    SOMMERFERIE = "SOMMERFERIE",
    HOSTFERIE = "HØSTFERIE",
    ANNET = "ANNET",
}

export enum SamvaerskalkulatorNetterFrekvens {
    HVERTAR = "HVERT_ÅR",
    ANNETHVERTAR = "ANNET_HVERT_ÅR",
}

export enum Samvaersklasse {
    SAMVAeRSKLASSE0 = "SAMVÆRSKLASSE_0",
    SAMVAeRSKLASSE1 = "SAMVÆRSKLASSE_1",
    SAMVAeRSKLASSE2 = "SAMVÆRSKLASSE_2",
    SAMVAeRSKLASSE3 = "SAMVÆRSKLASSE_3",
    SAMVAeRSKLASSE4 = "SAMVÆRSKLASSE_4",
    DELT_BOSTED = "DELT_BOSTED",
}

export enum Sivilstandskode {
    GIFT_SAMBOER = "GIFT_SAMBOER",
    BOR_ALENE_MED_BARN = "BOR_ALENE_MED_BARN",
    ENSLIG = "ENSLIG",
    SAMBOER = "SAMBOER",
    UKJENT = "UKJENT",
}

export enum SivilstandskodePDL {
    GIFT = "GIFT",
    UGIFT = "UGIFT",
    UOPPGITT = "UOPPGITT",
    ENKE_ELLER_ENKEMANN = "ENKE_ELLER_ENKEMANN",
    SKILT = "SKILT",
    SEPARERT = "SEPARERT",
    REGISTRERT_PARTNER = "REGISTRERT_PARTNER",
    SEPARERT_PARTNER = "SEPARERT_PARTNER",
    SKILT_PARTNER = "SKILT_PARTNER",
    GJENLEVENDE_PARTNER = "GJENLEVENDE_PARTNER",
}

export interface SluttberegningBarnebidragAldersjustering {
    periode: TypeArManedsperiode;
    beregnetBeløp: number;
    resultatBeløp: number;
    bpAndelBeløp: number;
    bpAndelFaktorVedDeltBosted?: number;
    deltBosted: boolean;
}

export interface SluttberegningIndeksregulering {
    periode: TypeArManedsperiode;
    beløp: Belop;
    originaltBeløp: Belop;
    nesteIndeksreguleringsår?: {
        /** @format int32 */
        value?: number;
        leap?: boolean;
    };
}

export enum Stonadstype {
    BIDRAG = "BIDRAG",
    FORSKUDD = "FORSKUDD",
    BIDRAG18AAR = "BIDRAG18AAR",
    EKTEFELLEBIDRAG = "EKTEFELLEBIDRAG",
    MOTREGNING = "MOTREGNING",
    OPPFOSTRINGSBIDRAG = "OPPFOSTRINGSBIDRAG",
}

export enum Saerbidragskategori {
    KONFIRMASJON = "KONFIRMASJON",
    TANNREGULERING = "TANNREGULERING",
    OPTIKK = "OPTIKK",
    ANNET = "ANNET",
}

export enum SoktAvType {
    BIDRAGSMOTTAKER = "BIDRAGSMOTTAKER",
    BIDRAGSPLIKTIG = "BIDRAGSPLIKTIG",
    BARN18AR = "BARN_18_ÅR",
    BM_I_ANNEN_SAK = "BM_I_ANNEN_SAK",
    NAV_BIDRAG = "NAV_BIDRAG",
    FYLKESNEMDA = "FYLKESNEMDA",
    NAV_INTERNASJONALT = "NAV_INTERNASJONALT",
    KOMMUNE = "KOMMUNE",
    NORSKE_MYNDIGHET = "NORSKE_MYNDIGHET",
    UTENLANDSKE_MYNDIGHET = "UTENLANDSKE_MYNDIGHET",
    VERGE = "VERGE",
    TRYGDEETATEN_INNKREVING = "TRYGDEETATEN_INNKREVING",
    KLAGE_ANKE = "KLAGE_ANKE",
    KONVERTERING = "KONVERTERING",
}

export interface UtgiftBeregningDto {
    /** Beløp som er direkte betalt av BP */
    beløpDirekteBetaltAvBp: number;
    /** Summen av godkjente beløp som brukes for beregningen */
    totalGodkjentBeløp: number;
    /** Summen av kravbeløp */
    totalKravbeløp: number;
    /** Summen av godkjente beløp som brukes for beregningen */
    totalGodkjentBeløpBp?: number;
    /** Summen av godkjent beløp for utgifter BP har betalt plus beløp som er direkte betalt av BP */
    totalBeløpBetaltAvBp: number;
}

export enum Utgiftstype {
    KONFIRMASJONSAVGIFT = "KONFIRMASJONSAVGIFT",
    KONFIRMASJONSLEIR = "KONFIRMASJONSLEIR",
    SELSKAP = "SELSKAP",
    KLAeR = "KLÆR",
    REISEUTGIFT = "REISEUTGIFT",
    TANNREGULERING = "TANNREGULERING",
    OPTIKK = "OPTIKK",
    ANNET = "ANNET",
}

export enum Valutakode {
    ALL = "ALL",
    ANG = "ANG",
    AUD = "AUD",
    BAM = "BAM",
    BGN = "BGN",
    BRL = "BRL",
    CAD = "CAD",
    CHF = "CHF",
    CNY = "CNY",
    CZK = "CZK",
    DKK = "DKK",
    EEK = "EEK",
    EUR = "EUR",
    GBP = "GBP",
    HKD = "HKD",
    HRK = "HRK",
    HUF = "HUF",
    INR = "INR",
    ISK = "ISK",
    JPY = "JPY",
    LTL = "LTL",
    LVL = "LVL",
    MAD = "MAD",
    NOK = "NOK",
    NZD = "NZD",
    PKR = "PKR",
    PLN = "PLN",
    RON = "RON",
    RSD = "RSD",
    SEK = "SEK",
    THB = "THB",
    TND = "TND",
    TRY = "TRY",
    UAH = "UAH",
    USD = "USD",
    VND = "VND",
    ZAR = "ZAR",
    PHP = "PHP",
}

export interface VedtakNotatDto {
    type: NotatMalType;
    erOrkestrertVedtak: boolean;
    stønadstype?: Stonadstype;
    medInnkreving: boolean;
    saksnummer: string;
    behandling: NotatBehandlingDetaljerDto;
    saksbehandlerNavn?: string;
    virkningstidspunkt: NotatVirkningstidspunktDto;
    utgift?: NotatSaerbidragUtgifterDto;
    boforhold: NotatBoforholdDto;
    samvær: NotatSamvaerBarnDto[];
    samværV2?: NotatSamvaerDto;
    gebyr?: NotatGebyrDetaljerDto[];
    gebyrV2?: NotatGebyrV2Dto;
    underholdskostnader?: NotatUnderholdDto;
    personer: DokumentmalPersonDto[];
    privatavtale: NotatPrivatAvtaleDto[];
    roller: DokumentmalPersonDto[];
    inntekter: NotatInntekterDto;
    vedtak: NotatVedtakDetaljerDto;
}

export interface VedtakResultatInnhold {
    type: NotatMalType;
}

export enum Vedtakstype {
    INDEKSREGULERING = "INDEKSREGULERING",
    ALDERSJUSTERING = "ALDERSJUSTERING",
    OPPHOR = "OPPHØR",
    ALDERSOPPHOR = "ALDERSOPPHØR",
    REVURDERING = "REVURDERING",
    FASTSETTELSE = "FASTSETTELSE",
    INNKREVING = "INNKREVING",
    KLAGE = "KLAGE",
    ENDRING = "ENDRING",
    ENDRING_MOTTAKER = "ENDRING_MOTTAKER",
}

export interface Visningsnavn {
    intern: string;
    bruker: Record<string, string>;
}

export interface TypeArManedsperiode {
    /**
     * @pattern YYYY-MM
     * @example "2023-01"
     */
    fom: string;
    /**
     * @pattern YYYY-MM
     * @example "2023-01"
     */
    til?: string;
}

export enum TypeArsakstype {
    FRABARNETSFODSEL = "FRA_BARNETS_FØDSEL",
    FRA_SAMLIVSBRUDD = "FRA_SAMLIVSBRUDD",
    FRABARNETSFLYTTEMANED = "FRA_BARNETS_FLYTTEMÅNED",
    FRAMANEDENETTERFYLTE18AR = "FRA_MÅNEDEN_ETTER_FYLTE_18_ÅR",
    FRA_KRAVFREMSETTELSE = "FRA_KRAVFREMSETTELSE",
    TREMANEDERTILBAKE = "TRE_MÅNEDER_TILBAKE",
    FRASOKNADSTIDSPUNKT = "FRA_SØKNADSTIDSPUNKT",
    TREARSREGELEN = "TRE_ÅRS_REGELEN",
    FRA_OPPHOLDSTILLATELSE = "FRA_OPPHOLDSTILLATELSE",
    AUTOMATISK_JUSTERING = "AUTOMATISK_JUSTERING",
    FRASAMMEMANEDSOMINNTEKTENBLEREDUSERT = "FRA_SAMME_MÅNED_SOM_INNTEKTEN_BLE_REDUSERT",
    FRAMANEDETTERENDRETSOKNAD = "FRA_MÅNED_ETTER_ENDRET_SØKNAD",
    FORHOYELSETILBAKEITID = "FORHØYELSE_TILBAKE_I_TID",
    FRAMANEDETTERINNTEKTENOKTE = "FRA_MÅNED_ETTER_INNTEKTEN_ØKTE",
    SOKNADSTIDSPUNKTENDRING = "SØKNADSTIDSPUNKT_ENDRING",
    NEDSETTELSE_TILBAKE_I_TID = "NEDSETTELSE_TILBAKE_I_TID",
    ENDRING3MANEDERTILBAKE = "ENDRING_3_MÅNEDER_TILBAKE",
    AVSLAGFORHOYELSETILBAKE = "AVSLAG_FORHØYELSE_TILBAKE",
    ENDRING3ARSREGELEN = "ENDRING_3_ÅRS_REGELEN",
    AVSLAG_NEDSETTELSE_TILBAKE = "AVSLAG_NEDSETTELSE_TILBAKE",
    TIDLIGERE_FEILAKTIG_AVSLAG = "TIDLIGERE_FEILAKTIG_AVSLAG",
    REVURDERINGMANEDENETTER = "REVURDERING_MÅNEDEN_ETTER",
    ANNET = "ANNET",
    OMREGNING = "OMREGNING",
    PRIVAT_AVTALE = "PRIVAT_AVTALE",
    FRAMANEDENETTERIPAVENTEAVBIDRAGSSAK = "FRA_MÅNEDEN_ETTER_I_PÅVENTE_AV_BIDRAGSSAK",
    FRAMANEDENETTERPRIVATAVTALE = "FRA_MÅNEDEN_ETTER_PRIVAT_AVTALE",
    FRA_ENDRINGSTIDSPUNKT = "FRA_ENDRINGSTIDSPUNKT",
    BIDRAGSPLIKTIGHARIKKEBIDRATTTILFORSORGELSE = "BIDRAGSPLIKTIG_HAR_IKKE_BIDRATT_TIL_FORSØRGELSE",
    MANEDETTERBETALTFORFALTBIDRAG = "MÅNED_ETTER_BETALT_FORFALT_BIDRAG",
}

export interface Adresse {
    adresselinje1: string;
    adresselinje2?: string;
    adresselinje3?: string;
    adresselinje4?: string;
    bruksenhetsnummer?: string;
    postnummer?: string;
    poststed?: string;
    landkode?: string;
    landkode3?: string;
    land?: string;
}

export interface AndelUnderholdskostnadPeriode {
    periode: TypeArManedsperiode;
    inntektBM?: number;
    inntektBP?: number;
    inntektBarn?: number;
    barnEndeligInntekt?: number;
    andelFaktor?: number;
    beløpUnderholdskostnad?: number;
    beløpBpsAndel: number;
    totalEndeligInntekt: number;
}

export interface Barn {
    type: Rolletype;
    rolle: Rolletype;
    fodselsnummer?: string;
    navn: string;
    /** @format date */
    fodselsdato?: string;
    fornavn?: string;
    /** @format int32 */
    bidragsbelop?: number;
    /** @format int32 */
    forskuddsbelop?: number;
    /** @format int32 */
    gebyrRm?: number;
    fodselsnummerRm?: string;
}

export interface BarnIHusstandPeriode {
    periode: TypeArManedsperiode;
    /** @format double */
    antall: number;
}

export interface BidragsevnePeriode {
    periode: TypeArManedsperiode;
    sjabloner: BidragsevneSjabloner;
    bidragsevne: number;
    beløpBidrag: number;
    harFullEvne: boolean;
    harDelvisEvne: boolean;
    inntektBP: number;
    underholdEgneBarnIHusstand: UnderholdEgneBarnIHusstand;
    skatt: Skatt;
    borMedAndreVoksne: boolean;
}

export interface BidragsevneSjabloner {
    beløpMinstefradrag: number;
    beløpKlassfradrag: number;
    beløpUnderholdEgneBarnIHusstanden: number;
    boutgiftBeløp: number;
    underholdBeløp: number;
}

/** Bostatus for person */
export interface BostatusPeriode {
    periode: TypeArManedsperiode;
    bostatus: Bostatuskode;
    /** Referanse til BM eller BP som bostatus for personen gjelder for */
    relatertTilPart: string;
    /** Om grunnlaget er manuelt registrert av saksbehandler eller om det er innhentet fra ekstern kilde (skatt/folkregisteret...) */
    manueltRegistrert: boolean;
}

export interface BrevSjablonVerdier {
    forskuddSats: number;
    inntektsgrense: number;
}

export interface Datoperiode {
    /** @format date */
    fom: string;
    /** @format date */
    til?: string;
}

export interface DokumentBestilling {
    bestillBatch: boolean;
    mottaker?: Mottaker;
    gjelder?: Gjelder;
    kontaktInfo?: EnhetKontaktInfo;
    saksbehandler?: Saksbehandler;
    dokumentreferanse?: string;
    tittel?: string;
    enhet?: string;
    saksnummer?: string;
    /** @format date */
    datoSakOpprettet?: string;
    spraak?: string;
    roller: {
        bidragsmottaker?: PartInfo;
        bidragspliktig?: PartInfo;
        barn: Barn[];
        isEmpty: boolean;
        /** @format int32 */
        size: number;
        first?: Barn;
        last?: Barn;
    };
    rollerV2: DokumentmalPersonDto[];
    rmISak?: boolean;
    vedtakDetaljer?: VedtakDetaljer;
    sjablonDetaljer: SjablonDetaljer;
    sakDetaljer: SakDetaljer;
}

export enum Engangsbeloptype {
    DIREKTE_OPPGJOR = "DIREKTE_OPPGJOR",
    DIREKTEOPPGJOR = "DIREKTE_OPPGJØR",
    ETTERGIVELSE = "ETTERGIVELSE",
    ETTERGIVELSE_TILBAKEKREVING = "ETTERGIVELSE_TILBAKEKREVING",
    GEBYR_MOTTAKER = "GEBYR_MOTTAKER",
    GEBYR_SKYLDNER = "GEBYR_SKYLDNER",
    INNKREVING_GJELD = "INNKREVING_GJELD",
    TILBAKEKREVING = "TILBAKEKREVING",
    TILBAKEKREVING_BIDRAG = "TILBAKEKREVING_BIDRAG",
    SAERTILSKUDD = "SAERTILSKUDD",
    SAeRTILSKUDD = "SÆRTILSKUDD",
    SAeRBIDRAG = "SÆRBIDRAG",
}

export interface EnhetKontaktInfo {
    navn: string;
    telefonnummer: string;
    postadresse: Adresse;
    enhetId: string;
}

export interface ForskuddInntektgrensePeriode {
    /** @format date */
    fomDato: string;
    /** @format date */
    tomDato?: string;
    forsorgerType: Sivilstandskode;
    /** @format int32 */
    antallBarn: number;
    beløp50Prosent: PairBigDecimalBigDecimal;
    beløp75Prosent: PairBigDecimalBigDecimal;
}

export interface GebyrInfoDto {
    bmGebyr?: number;
    bpGebyr?: number;
}

export interface Gjelder {
    fodselsnummer: string;
    navn?: string;
    adresse?: Adresse;
    rolle?: Rolletype;
}

export interface Inntekt {
    bmInntekt: number;
    bpInntekt: number;
    barnInntekt: number;
    totalInntekt: number;
}

export interface InntektPeriode {
    /** @uniqueItems true */
    inntektPerioder: TypeArManedsperiode[];
    /** @uniqueItems true */
    inntektOpprinneligPerioder: TypeArManedsperiode[];
    periode: TypeArManedsperiode;
    /** @uniqueItems true */
    typer: Inntektsrapportering[];
    periodeTotalinntekt?: boolean;
    nettoKapitalInntekt?: boolean;
    /** @format int32 */
    beløpÅr?: number;
    fødselsnummer?: string;
    beløp: number;
    rolle: Rolletype;
    innteksgrense: number;
    type?: Inntektsrapportering;
}

export interface Mottaker {
    fodselsnummer: string;
    navn: string;
    spraak: string;
    adresse?: Adresse;
    rolle?: Rolletype;
    /** @format date */
    fodselsdato?: string;
}

export interface PairBigDecimalBigDecimal {
    first: number;
    second: number;
}

export interface PairIntegerInteger {
    /** @format int32 */
    first: number;
    /** @format int32 */
    second: number;
}

export interface PartInfo {
    type?: Rolletype;
    rolle: Rolletype;
    fodselsnummer?: string;
    navn: string;
    /** @format date */
    fodselsdato?: string;
    /** @format date */
    doedsdato?: string;
    landkode?: string;
    landkode3?: string;
    /** @format date */
    datoDod?: string;
    gebyr?: number;
    kravFremAv?: string;
}

export interface SakDetaljer {
    harUkjentPart: boolean;
    levdeAdskilt: boolean;
}

export interface Saksbehandler {
    ident?: string;
    navn?: string;
    fornavnEtternavn: string;
}

export interface Samvaersperiode {
    periode: TypeArManedsperiode;
    samværsklasse: Samvaersklasse;
    aldersgruppe?: PairIntegerInteger;
    samværsfradragBeløp: number;
}

/** Sivilstand for person */
export interface SivilstandPeriode {
    periode: TypeArManedsperiode;
    sivilstand: Sivilstandskode;
    /** Om grunnlaget er manuelt registrert av saksbehandler eller om det er innhentet fra ekstern kilde (skatt/folkregisteret...) */
    manueltRegistrert: boolean;
}

export interface SjablonDetaljer {
    multiplikatorInntekstgrenseForskudd: number;
    fastsettelseGebyr: number;
    forskuddInntektIntervall: number;
    forskuddSats: number;
    inntektsintervallTillegsbidrag: number;
    multiplikatorHøyInntektBp: number;
    multiplikatorMaksBidrag: number;
    multiplikatorInnteksinslagBarn: number;
    multiplikatorMaksInntekBarn: number;
    nedreInntekstgrenseGebyr: number;
    prosentsatsTilleggsbidrag: number;
    maksProsentAvInntektBp: number;
    forskuddInntektgrensePerioder: ForskuddInntektgrensePeriode[];
    maksgrenseHøyInntekt: number;
    maksBidragsgrense: number;
    maksInntektsgrense: number;
    maksForskuddsgrense: number;
    maksInntektsgebyr: number;
}

export interface Skatt {
    sumSkattFaktor: number;
    sumSkatt: number;
    skattAlminneligInntekt: number;
    trinnskatt: number;
    trygdeavgift: number;
    skattAlminneligInntektMånedsbeløp: number;
    trinnskattMånedsbeløp: number;
    trygdeavgiftMånedsbeløp: number;
    skattMånedsbeløp: number;
}

export interface SaerbidragBeregning {
    kravbeløp: number;
    godkjentbeløp: number;
    resultat: number;
    resultatKode: Resultatkode;
    beløpDirekteBetaltAvBp: number;
    andelProsent: number;
    inntekt: Inntekt;
}

export enum TypeBehandling {
    FORSKUDD = "FORSKUDD",
    SAeRBIDRAG = "SÆRBIDRAG",
    BIDRAG = "BIDRAG",
    BIDRAG18AR = "BIDRAG_18_ÅR",
}

export interface UnderholdEgneBarnIHusstand {
    getårsbeløp: number;
    sjablon: number;
    /** @format double */
    antallBarnIHusstanden: number;
    /** @format int32 */
    antallBarnDeltBossted: number;
    måndesbeløp: number;
}

export interface UnderholdskostnaderPeriode {
    periode: TypeArManedsperiode;
    tilsynstype?: UnderholdskostnaderPeriodeTilsynstypeEnum;
    skolealder?: UnderholdskostnaderPeriodeSkolealderEnum;
    harBarnetilsyn: boolean;
    delberegning: DelberegningUnderholdskostnad;
    gjelderIdent: string;
    rolletype?: Rolletype;
}

export interface VedtakBarn {
    fødselsnummer: string;
    navn?: string;
    sumAvregning: number;
    løpendeBidrag?: number;
    bostatusPerioder: BostatusPeriode[];
    stønadsendringer: VedtakBarnStonad[];
    engangsbeløper: VedtakBarnEngangsbelop[];
    erDirekteAvslag: boolean;
}

export interface VedtakBarnEngangsbelop {
    type: Engangsbeloptype;
    sjablon: BrevSjablonVerdier;
    periode: Datoperiode;
    medInnkreving: boolean;
    erDirekteAvslag: boolean;
    særbidragBeregning?: SaerbidragBeregning;
    inntekter: InntektPeriode[];
}

export interface VedtakBarnStonad {
    type: Stonadstype;
    innkreving: boolean;
    direkteAvslag: boolean;
    vedtakPerioder: VedtakPeriode[];
    forskuddInntektgrensePerioder: ForskuddInntektgrensePeriode[];
}

export interface VedtakDetaljer {
    getårsakKode?: TypeArsakstype;
    avslagsKode?: Resultatkode;
    type: TypeBehandling;
    gebyr?: GebyrInfoDto;
    /** @format date */
    virkningstidspunkt?: string;
    /** @format date */
    mottattDato?: string;
    /** @format date */
    soktFraDato?: string;
    /** @format date */
    vedtattDato?: string;
    saksbehandlerInfo: VedtakSaksbehandlerInfo;
    vedtakstype: Vedtakstype;
    stønadstype?: Stonadstype;
    engangsbeløptype?: Engangsbeloptype;
    søknadFra?: SoktAvType;
    kilde: VedtakDetaljerKildeEnum;
    vedtakBarn: VedtakBarn[];
    resultat: (
        | DokumentmalResultatBidragsberegningBarnDto
        | NotatResultatForskuddBeregningBarnDto
        | NotatResultatSaerbidragsberegningDto
    )[];
    barnIHusstandPerioder: BarnIHusstandPeriode[];
    sivilstandPerioder: SivilstandPeriode[];
    erDirekteAvslagForAlleBarn: boolean;
}

export interface VedtakPeriode {
    /** @format date */
    fomDato: string;
    /** @format date */
    tomDato?: string;
    beløp: number;
    innkreving?: string;
    resultatKode: string;
    inntektGrense: number;
    maksInntekt: number;
    inntekter: InntektPeriode[];
    samvær?: Samvaersperiode;
    bidragsevne?: BidragsevnePeriode;
    underhold?: UnderholdskostnaderPeriode;
    andelUnderhold?: AndelUnderholdskostnadPeriode;
}

export interface VedtakSaksbehandlerInfo {
    navn: string;
    ident: string;
}

export type JsonNode = object;

export enum DokumentmalResultatBidragsberegningBarnDtoMonthEnum {
    JANUARY = "JANUARY",
    FEBRUARY = "FEBRUARY",
    MARCH = "MARCH",
    APRIL = "APRIL",
    MAY = "MAY",
    JUNE = "JUNE",
    JULY = "JULY",
    AUGUST = "AUGUST",
    SEPTEMBER = "SEPTEMBER",
    OCTOBER = "OCTOBER",
    NOVEMBER = "NOVEMBER",
    DECEMBER = "DECEMBER",
}

export enum KlageOmgjoringDetaljerMonthEnum {
    JANUARY = "JANUARY",
    FEBRUARY = "FEBRUARY",
    MARCH = "MARCH",
    APRIL = "APRIL",
    MAY = "MAY",
    JUNE = "JUNE",
    JULY = "JULY",
    AUGUST = "AUGUST",
    SEPTEMBER = "SEPTEMBER",
    OCTOBER = "OCTOBER",
    NOVEMBER = "NOVEMBER",
    DECEMBER = "DECEMBER",
}

export enum NotatBarnetilsynOffentligeOpplysningerTilsynstypeEnum {
    HELTID = "HELTID",
    DELTID = "DELTID",
    IKKE_ANGITT = "IKKE_ANGITT",
}

export enum NotatBarnetilsynOffentligeOpplysningerSkolealderEnum {
    OVER = "OVER",
    UNDER = "UNDER",
    IKKE_ANGITT = "IKKE_ANGITT",
}

export enum NotatBehandlingDetaljerDtoMonthEnum {
    JANUARY = "JANUARY",
    FEBRUARY = "FEBRUARY",
    MARCH = "MARCH",
    APRIL = "APRIL",
    MAY = "MAY",
    JUNE = "JUNE",
    JULY = "JULY",
    AUGUST = "AUGUST",
    SEPTEMBER = "SEPTEMBER",
    OCTOBER = "OCTOBER",
    NOVEMBER = "NOVEMBER",
    DECEMBER = "DECEMBER",
}

export enum NotatStonadTilBarnetilsynDtoSkolealderEnum {
    OVER = "OVER",
    UNDER = "UNDER",
    IKKE_ANGITT = "IKKE_ANGITT",
}

export enum NotatStonadTilBarnetilsynDtoTilsynstypeEnum {
    HELTID = "HELTID",
    DELTID = "DELTID",
    IKKE_ANGITT = "IKKE_ANGITT",
}

export enum NotatVirkningstidspunktBarnDtoMonthEnum {
    JANUARY = "JANUARY",
    FEBRUARY = "FEBRUARY",
    MARCH = "MARCH",
    APRIL = "APRIL",
    MAY = "MAY",
    JUNE = "JUNE",
    JULY = "JULY",
    AUGUST = "AUGUST",
    SEPTEMBER = "SEPTEMBER",
    OCTOBER = "OCTOBER",
    NOVEMBER = "NOVEMBER",
    DECEMBER = "DECEMBER",
}

export enum NotatVirkningstidspunktBarnDtoMonthEnum1 {
    JANUARY = "JANUARY",
    FEBRUARY = "FEBRUARY",
    MARCH = "MARCH",
    APRIL = "APRIL",
    MAY = "MAY",
    JUNE = "JUNE",
    JULY = "JULY",
    AUGUST = "AUGUST",
    SEPTEMBER = "SEPTEMBER",
    OCTOBER = "OCTOBER",
    NOVEMBER = "NOVEMBER",
    DECEMBER = "DECEMBER",
}

export enum NotatVirkningstidspunktBarnDtoMonthEnum2 {
    JANUARY = "JANUARY",
    FEBRUARY = "FEBRUARY",
    MARCH = "MARCH",
    APRIL = "APRIL",
    MAY = "MAY",
    JUNE = "JUNE",
    JULY = "JULY",
    AUGUST = "AUGUST",
    SEPTEMBER = "SEPTEMBER",
    OCTOBER = "OCTOBER",
    NOVEMBER = "NOVEMBER",
    DECEMBER = "DECEMBER",
}

export enum NotatVirkningstidspunktDtoMonthEnum {
    JANUARY = "JANUARY",
    FEBRUARY = "FEBRUARY",
    MARCH = "MARCH",
    APRIL = "APRIL",
    MAY = "MAY",
    JUNE = "JUNE",
    JULY = "JULY",
    AUGUST = "AUGUST",
    SEPTEMBER = "SEPTEMBER",
    OCTOBER = "OCTOBER",
    NOVEMBER = "NOVEMBER",
    DECEMBER = "DECEMBER",
}

export enum UnderholdskostnaderPeriodeTilsynstypeEnum {
    HELTID = "HELTID",
    DELTID = "DELTID",
    IKKE_ANGITT = "IKKE_ANGITT",
}

export enum UnderholdskostnaderPeriodeSkolealderEnum {
    OVER = "OVER",
    UNDER = "UNDER",
    IKKE_ANGITT = "IKKE_ANGITT",
}

export enum VedtakDetaljerKildeEnum {
    MANUELT = "MANUELT",
    AUTOMATISK = "AUTOMATISK",
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";
import axios from "axios";

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
        this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "http://localhost:8183" });
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
        if (input instanceof FormData) {
            return input;
        }
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
                ...(type ? { "Content-Type": type } : {}),
            },
            params: query,
            responseType: responseFormat,
            data: body,
            url: path,
        });
    };
}

/**
 * @title bidrag-dokument-produksjon
 * @version v1
 * @baseUrl http://localhost:8183
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    api = {
        /**
         * No description
         *
         * @tags produser-notat-api
         * @name GeneratePdf
         * @request POST:/api/v2/notat/pdf
         */
        generatePdf: (data: VedtakNotatDto, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/v2/notat/pdf`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags produser-notat-api
         * @name GenerateHtml
         * @request POST:/api/v2/notat/html
         */
        generateHtml: (data: VedtakNotatDto, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/v2/notat/html`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags produser-notat-api
         * @name GenerateHtmlDebug
         * @request POST:/api/v2/notat/html/debug
         */
        generateHtmlDebug: (params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/v2/notat/html/debug`,
                method: "POST",
                ...params,
            }),

        /**
         * No description
         *
         * @tags konverter-api
         * @name RtfToPdf
         * @request POST:/api/v2/konverter/rtf
         */
        rtfToPdf: (data: string, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/v2/konverter/rtf`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags konverter-api
         * @name HtmlToPdf
         * @request POST:/api/v2/konverter/html
         */
        htmlToPdf: (data: string, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/v2/konverter/html`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags konverter-api
         * @name FlattenPdf
         * @request POST:/api/v2/konverter/flatten
         */
        flattenPdf: (data: string, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/v2/konverter/flatten`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Beregn bidrag
         *
         * @tags produser-dokumentmal-api
         * @name GeneratePdfDebug
         * @request GET:/api/v2/dokumentmal/pdf/{dokumentmal}
         * @secure
         */
        generatePdfDebug: (dokumentmal: string, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/v2/dokumentmal/pdf/${dokumentmal}`,
                method: "GET",
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags produser-dokumentmal-api
         * @name GeneratePdf1
         * @request POST:/api/v2/dokumentmal/pdf/{dokumentmal}
         */
        generatePdf1: (dokumentmal: string, data: DokumentBestilling, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/v2/dokumentmal/pdf/${dokumentmal}`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Beregn bidrag
         *
         * @tags produser-dokumentmal-api
         * @name GenerateHtmlDebug1
         * @request GET:/api/v2/dokumentmal/html/{dokumentmal}
         * @secure
         */
        generateHtmlDebug1: (dokumentmal: string, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/v2/dokumentmal/html/${dokumentmal}`,
                method: "GET",
                secure: true,
                ...params,
            }),

        /**
         * @description Beregn bidrag
         *
         * @tags produser-dokumentmal-api
         * @name GenerateHtml1
         * @request POST:/api/v2/dokumentmal/html/{dokumentmal}
         * @secure
         */
        generateHtml1: (dokumentmal: string, data: DokumentBestilling, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/v2/dokumentmal/html/${dokumentmal}`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags produser-dokument-api
         * @name GeneratePdf2
         * @request POST:/api/dokument/pdf/{category}/{dokumentmal}
         */
        generatePdf2: (category: string, dokumentmal: string, data: JsonNode, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/dokument/pdf/${category}/${dokumentmal}`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags produser-dokument-api
         * @name GeneratePdfTest
         * @request POST:/api/dokument/pdf/test/{category}/{dokumentmal}
         */
        generatePdfTest: (category: string, dokumentmal: string, data: JsonNode, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/dokument/pdf/test/${category}/${dokumentmal}`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags produser-dokument-api
         * @name GenerateHtml2
         * @request POST:/api/dokument/html/{category}/{dokumentmal}
         */
        generateHtml2: (category: string, dokumentmal: string, data: JsonNode, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/dokument/html/${category}/${dokumentmal}`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags produser-dokument-api
         * @name GenerateHtmlTest
         * @request GET:/api/dokument/html/test/{category}/{dokumentmal}
         */
        generateHtmlTest: (category: string, dokumentmal: string, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/dokument/html/test/${category}/${dokumentmal}`,
                method: "GET",
                ...params,
            }),
    };
}
