# Familieoppdrag: kontekst og arbeidsmåte

Skrevet 7. oktober 2026 av Claude, på bakgrunn av arbeidet med middagsappen og en første lesing av Familieoppdrag. Filen er ment som startpunkt for et eget Claude-prosjekt. Les den før du svarer på noe i prosjektet.

Alt under «Om Familieoppdrag» er lest i koden eller målt i nettleseren den dagen. Det som ikke er kontrollert, er merket.

## Roller

- **Espen (eier)** bestemmer hva som skal lages, tester på ekte enheter og publiserer. Han er ikke utvikler og bruker ikke kommandolinje.
- **Codex** skriver all kode, kjører tester og gjør eventuell publisering av serverkode. Codex arbeider lokalt i prosjektmappen.
- **Claude** hjelper med beslutninger og spesifikasjoner, skriver utviklerbeskjeder til Codex og gjennomgår det Codex leverer før noe publiseres. Claude endrer aldri koden selv.

## Arbeidsflyt

1. Espen beskriver et behov eller en feil.
2. Claude leser relevant kode, undersøker årsaken og anbefaler en løsning. Claude utfordrer antakelser og sier fra om bedre alternativer.
3. Claude skriver en utviklerbeskjed i chatten, i en kodeblokk som kan kopieres.
4. Espen sender beskjeden til Codex og limer inn Codex sin rapport.
5. Claude gjennomgår koden og sier «godkjent» eller hva som må rettes.
6. Espen publiserer og tester. Claude gir en kort testliste med forventet resultat.
7. Claude oppdaterer beslutningsloggen i prosjektet.

Små leveranser er bedre enn store. Én ting om gangen, testet før neste.

## Slik skrives en utviklerbeskjed

- Overskrift med versjon og hva leveransen gjelder.
- **Bakgrunn:** hva som er observert, med målte tall og hvor i koden problemet ligger.
- **Eiers godkjenning:** bare når Codex trenger nettverk eller publisering, og da nøyaktig hva som er lov. Alt annet er fortsatt forbudt.
- **Omfang og kompatibilitet:** hva som ikke skal endres, og om eldre appversjoner må tåle endringen.
- **Krav**, nummerert, med eksakte tekster som brukeren skal se.
- **Tester** som skal finnes, beskrevet som oppførsel.
- **Dokumentasjon** som skal oppdateres.
- **Rapport:** hva Codex skal melde tilbake, også hva den skal bekrefte at den ikke har gjort.

Beskjeden beskriver hva som skal oppnås og hvorfor. Den dikterer ikke kode linje for linje. Når Claude ikke har lest nok av koden til å være sikker, ber beskjeden Codex undersøke og foreslå før den endrer noe.

## Slik gjennomgår Claude en leveranse

- Leser de endrede filene i prosjektmappen, bare med lesetilgang.
- Kjører prosjektets tester og syntakskontroll selv.
- Skriver egne, uavhengige kontroller når endringen er risikabel, og legger dem utenfor prosjektmappen. For synk betyr det en simulering av databasen med ventende skrivinger og kvitteringer.
- Sier tydelig hva som er kontrollert, og hva som bare bygger på Codex sin rapport.
- Finner Claude en feil, stoppes publiseringen, og Codex får en kort rettebeskjed med forløpet som gjenskaper feilen.

## Faste regler

- Claude kjører aldri Git-kommandoer i arbeidsmappen. Et tidligere forsøk etterlot en låsefil som stoppet eiers commit.
- Claude sletter ingenting og endrer ingen filer i prosjektmappen.
- Nøkler og hemmeligheter skal aldri inn i kode, dokumentasjon eller chat. Firebase sin nettkonfigurasjon i klientkoden er offentlig av natur og skal ikke byttes ut.
- Sikkerhetskopier med familiens data skal ikke ligge i et offentlig repo.
- Publisering med GitHub Desktop. Manuell opplasting i nettleseren hopper over `.gitignore` og kan ta med ting som ikke skal ut.
- Serverkode publiseres før appen, og må virke med forrige appversjon.
- Firestore-regler publiseres aldri som bieffekt av noe annet.
- Ta sikkerhetskopi før en leveranse som endrer hvordan data lagres.

## Lærdommer fra middagsappen som gjelder her

- **Alle eiers apper deler nettsted.** De ligger på `espenviigsyversen-droid.github.io` og deler derfor nettleserens lokale lagring, med én felles kvote på ca. 5 MB. Én app kan stoppe en annen.
- **Lokal lagring kan feile når som helst.** Skriving uten feilhåndtering har stoppet både tegning av skjermen og synk. All lagring skal gå gjennom funksjoner som aldri kaster.
- **Hele tilstanden i én skriving er farlig.** Når en enhet skriver alt den har, kan en gammel kopi overskrive nye data. Middagsappen gikk over til én skriving per ting som endres, og lar skjermen følge databasen.
- **Nye felt krever tvungen oppdatering.** Eldre appversjoner som skriver hele dokumenter, fjerner felt de ikke kjenner. Middagsappen hever en minsteversjon i databasen når datamodellen endres.
- **Nettleserens dialogbokser er upålitelige etter venting.** `confirm` blir undertrykt når vinduet ikke er fremst. Valg etter et serverkall skal vises som knapper i appen.
- **Simuleringer finner feil som vanlige tester ikke finner.** En enhet som ble hengende på egen versjon ved samtidig lagring, ble funnet slik før publisering.
- **Feilmeldinger skal si hva som faktisk er galt.** «Sjekk nettforbindelsen» for en feil som ikke handler om nett, sender alle på villspor.

## Om Familieoppdrag

Lest i mappen `C:\Users\espen\Downloads\00_Organisert\02_Prosjekter_og_apper\Familieoppdrag` 7. oktober 2026.

### Hva appen er

En familieapp for oppgaver, stjerner og belønninger. Barn har profiler uten egne kontoer. Voksenmodus er beskyttet med PIN. Appen er bygget for å kunne brukes av flere familier.

### Teknisk oppbygging

- Statisk nettapp uten byggesteg: `index.html`, `styles.css`, `service-worker.js` og én fil `app.js` på ca. 7 800 linjer og 360 funksjoner.
- Ingen `AGENTS.md`. Tester fantes ikke før versjon 102, som la til mappen `tests/`.
- Dokumentasjon: `README.md`, `FIREBASE_PLAN.md` og fra 7. oktober `LAGRING_OG_VEKST.md`.
- Versjon i koden: 102 (upublisert, se status). Versjon 101 var den som lå i Chrome på eiers PC.

### Sky og innlogging

- Firebase-prosjektet er `home-tasks-app-18de3`, som deles med treningsappen og Hjemmeoppgaver. Middagsappen er flyttet ut til eget prosjekt.
- Hele appens tilstand lagres som ett dokument: `families/{familyId}/appState/current`. Skriving skjer i en transaksjon med revisjonsnummer og vern mot gamle skrivinger.
- Skysikkerhetskopier lagres som egne dokumenter i Firestore.
- Andre samlinger i bruk: `familyCodes` og `adminFamilyHealth`.
- Google-innlogging brukes for eier og voksne. README nevner også anonym innlogging. Det er ikke kontrollert om anonym innlogging er slått på i dag.

### Lokal lagring

| Nøkkel | Innhold |
| --- | --- |
| `familieoppdrag.v1` | Hele tilstanden |
| `familieoppdrag.cloudBackups.v1` | Lokale kopier av tilstanden før skyskriving |
| `familieoppdrag.deviceProfile` | Hvilken profil enheten åpner på |
| Flere små nøkler | Oppsett, invitasjon og oppdatering |

## Kjente problemer

### 1. Tilstanden vokser mot grensen for ett skydokument (alvorligst)

`transactions`, `completions` og `history` vokser uten opprydding. Målt i Chrome på eiers PC, i en kopi fra 8. juni 2026:

| Felt | Antall | Størrelse |
| --- | --- | --- |
| `transactions` | 1137 | 304 000 tegn |
| `completions` | 940 | 292 000 tegn |
| `history` | 1285 | 237 000 tegn |
| Hele tilstanden | | 857 600 tegn |

Firestore tillater maks 1 048 576 byte per dokument. Hver fullførte oppgave legger til omtrent 0,8 kB. Når grensen nås, feiler all skriving til skyen. Dagens størrelse i skyen er ikke målt.

### 2. Lokale sikkerhetskopier fylte den delte lagringen

Versjon 101 beholdt fem kopier av hele tilstanden, 4,28 MB på eiers PC. Sammen med hovedtilstanden fylte det kvoten, og middagsappen sluttet å virke på PC-en 6. oktober 2026. Versjon 101 skrev dessuten til lokal lagring rundt 25 steder uten feilhåndtering, og lagrefunksjonen stoppet da før endringen ble sendt til skyen.

### 3. Tilgangsreglene er trolig åpne for alle innloggede

Regelfilen for det delte Firebase-prosjektet ligger i treningsappens mappe. Den gir alle innloggede lese- og skrivetilgang til `families/{familyId}` med alt under, og til `familyCodes`. Det betyr at én families data ikke er beskyttet mot andre innloggede brukere. Det er ikke kontrollert at filen er lik reglene som faktisk er publisert.

Middagsappen hadde samme svakhet og løste den med eget Firebase-prosjekt, medlemsliste og regler som sjekker medlemskap.

### 4. Reglene deles med andre apper

En endring i reglene for Familieoppdrag publiseres sammen med reglene for treningsappen og Hjemmeoppgaver. Feil i den ene kan stenge de andre ute.

### 5. Mindre ting

- Standard-PIN (1234) står som kommentar i koden. PIN er en lokal sperre, ikke sikkerhet.
- All logikk i én fil gjør endringer vanskeligere å gjennomgå og teste.

## Status 7. oktober 2026

- Claude skrev en utviklerbeskjed med to deler: lagringsvern (gjennomføres) og vekst i tilstanden (analyser og foreslå).
- Codex har bygget versjon 102 lokalt. Ifølge `LAGRING_OG_VEKST.md` er lagringsvernet og et størrelsesanslag i voksenpanelet på plass, og filen inneholder et forslag for veksten som venter på eiers godkjenning.
- Versjon 102 er ikke gjennomgått av Claude og ikke publisert.

## Det Claude trenger svar på først

1. Er appen i daglig bruk, og av hvem? Bare egen familie, eller også andre familier?
2. Virker synken mellom enhetene i dag? Hvis ikke, er grensen i problem 1 trolig nådd.
3. Hvor ligger repoet, og hvordan publiseres appen? Er repoet offentlig?
4. Er anonym innlogging slått på i Firebase-prosjektet?
5. Er reglene i treningsappens mappe de som er publisert?
6. Skal Familieoppdrag på sikt få eget Firebase-prosjekt og eget nettsted, slik middagsappen fikk eget prosjekt?

## Første steg i prosjektet

1. Koble mappen til samtalen, slik at Claude kan lese koden.
2. Gjennomgå versjon 102 før den publiseres.
3. Les forslaget i `LAGRING_OG_VEKST.md` og anbefal en løsning for veksten.
4. Opprett `claude/BESLUTNINGSLOGG.md` i prosjektet med rammer, kjente problemer, beslutninger og leveranseplan, og hold den oppdatert etter hver leveranse.
5. Vurder tilgangsreglene når lagring og vekst er under kontroll.
