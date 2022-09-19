## Bidrag-dokument-redigering-ui
Bidrag mikrofrontend applikasjon for å lese og redigere PDF dokumenter
<br/>
Dette er bare en mikrofrontend og har derfor ingen autentisering og innlogging av bruker. Det håndteres av [bidrag-ui](https://github.com/navikt/bidrag-ui) hvor token eksponeres av `/token` endepunktet.

## Module federation og mikrofrontends
Applikasjonen benytter seg av noe som heter [module federation](https://webpack.js.org/concepts/module-federation/). Det er et konsept for å lage mikrofrontends.

Hver linje under [webpack config](webpack.common.config.js) -> `ModuleFederationPlugin` -> `exposes` vil bygges som en separat applikasjon. 
Dette kan da brukes av feks `bidrag-ui` eller annen applikasjon (kalt `host`) til å hente og rendre applikasjonen som React komponent selv om koden ligger annen sted (`remote`).

Parameteren `shared` i `ModuleFederationPlugin` forteller `module federation` hvilken avhengigheter som er delt mellom `host` og `remote` slik at den ikke henter samme kode flere ganger.

## Deployment
Ved deployment så publiseres bygget til `gcp` cloud storage under bucket navn `bidrag-ui-static-files-dev` i dev og `bidrag-ui-static-files-prod` i prod. 
Applikasjonen [bidrag-ui-static-files](https://github.com/navikt/bidrag-ui-static-files) er et proxy app som henter og cacher bygg filene som er publisert til cloud storage
`Bidrag-ui` er konfigurert med module-federation til å hente mikrofrontend bygg filene fra denne applikasjonen og dermed rendre mikrofrontendene fra `remote` kilde.

## Kjøre lokalt
Du kan starte applikasjonen lokalt ved å kjøre `yarn install` og deretter `yarn dev`. Dette vil eksponere applikasjonen på url `http://localhost:5173`.

