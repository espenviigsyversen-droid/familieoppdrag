# Familieoppdrag

En enkel familieapp for oppgaver, stjerner og belønninger. Appen kan kjøres som en statisk webapp og lagrer data lokalt i nettleseren. Hvis Firebase er slått på, synkroniseres data med Firestore.

Se `FIREBASE_PLAN.md` for foreslått flerfamilie-struktur, sikkerhetsmodell og neste steg mot innlogging.

## Før appen tas i bruk av en ny familie

1. Opprett et eget Firebase-prosjekt.
2. Aktiver Firestore Database.
3. Aktiver anonym innlogging i Firebase Authentication.
4. Bytt Firebase-verdiene øverst i `app.js`, inne i `APP_CONFIG.cloudSync.firebase`.
5. Last opp filene til GitHub eller en annen statisk host.
6. Åpne appen, gå til voksenmodus og endre:
   - PIN-kode
   - barnas navn, ikoner og farger
   - oppgaver og belønninger

Hvis appen åpnes uten lagrede data, vises førstegangsoppsettet automatisk. Der kan familien sette familienavn, voksen-PIN, barn og startpakker uten å redigere kode.

## Startpakker

I voksenmodus finnes det startpakker under `Innstillinger`. Disse kan legge inn standard oppgaver og belønninger for en ny familie. Appen hopper over oppgaver og belønninger som allerede finnes, så en pakke kan trykkes uten at eksisterende oppsett slettes.

## Familieinnstillinger

Familienavn og intern familie-id kan endres under `Innstillinger`. Dette er forberedelse til en senere flerfamilie-versjon med sentral hosting, innlogging og invitasjonslenker.

Den interne familie-id-en brukes også i Firestore-stien:

`families/{familyId}/appState/current`

Det betyr at flere familier kan bruke samme Firebase-prosjekt uten å skrive til samme dokument, så lenge hver familie har unik familie-id og Firestore-reglene senere begrenser tilgangen riktig.

## Familiekode og enhetskobling

I voksenmodus kan familien kopiere en koblingslenke fra `Innstillinger`. Lenken inneholder en familiekode og brukes til å velge standardprofil på en enhet:

- `Profilvalg` for felles iPad/tablet
- `Voksenoversikt` for foreldre
- direkte barneprofil for et barns egen enhet

I denne lokale versjonen må familien allerede være lastet inn på enheten for at koblingslenken skal passe. Når appen senere flyttes til sentral hosting med innlogging og Firestore per familie, kan samme flyt brukes til ekte invitasjonslenker.

## Viktig om Firebase

Firebase-oppsettet ligger samlet i `APP_CONFIG` øverst i `app.js`. For å kjøre appen helt lokalt uten sky-synk kan `APP_CONFIG.cloudSync.enabled` settes til `false`.

`APP_CONFIG` viser også hvilket miljø appen kjører i:

- `environment`
- `environmentLabel`
- `cloudSync.firebase.projectId`

Disse vises i voksenpanelet under `Innstillinger`.

Ikke del en versjon der flere familier bruker samme familie-id i samme Firebase-prosjekt uten gode Firestore-regler. Da kan familiene skrive til samme dokument. I neste fase bør Firestore-regler og vokseninnlogging beskytte hver familie.

## Backup og flytting

Voksenpanelet har `Eksporter data` og `Importer data` under `Innstillinger`.

Anbefalt flytteflyt til nytt Firebase-prosjekt:

1. Eksporter data fra dagens app.
2. Lag nytt Firebase-prosjekt for Familieoppdrag.
3. Bytt verdiene i `APP_CONFIG.cloudSync.firebase`.
4. Last opp appen med ny config.
5. Importer backupen i appen.
6. Sjekk at barn, oppgaver, belønninger og historikk er riktig.

Importer data erstatter dataene på enheten, så ta alltid eksport først.
