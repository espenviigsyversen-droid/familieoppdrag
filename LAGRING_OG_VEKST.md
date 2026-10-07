# Lagringsvern og vekst i tilstanden

Dato: 7. oktober 2026. Kodegrunnlag: versjon 102, schema 2.
Del 1 og størrelsesvarslingen er implementert lokalt. Resten av dette dokumentet
er et forslag som krever eiers godkjenning. Ingen arkivering, migrering,
Firestore-regelendring eller publisering er utført.

## Målinger og begrensninger

Eiers oppgitte Chrome-måling, ikke en ny måling av Firestore:

| Lokal verdi | Størrelse / antall |
|---|---|
| Hele opprinnelsens localStorage | 5,20 MB, delt med andre apper |
| Lokale skybackupkopier | 4,28 MB, fem tilstander |
| Hovedtilstand | ca. 0,86 MB / 857 000 tegn |
| transactions | 1137 oppføringer / ca. 304 000 tegn |
| completions | 940 oppføringer / ca. 292 000 tegn |
| history | 1285 oppføringer / ca. 237 000 tegn |
| Øvrige felt | under 30 000 tegn |

PC-tilstanden var sist brukt 8. juni. Dagens eierdokument er ikke lest fra
Firestore under arbeidet; det kan være betydelig nyere og større enn PC-kopien.
Tegn, localStorage-kvote, JSON-byte og Firestore-dokumentstørrelse er forskjellige
mål og må ikke brukes om hverandre som nøyaktige målinger.

Firestore begrenser ett dokument til 1 048 576 byte. Feltverdier har også en
egen grense. Underkolleksjoner teller ikke med i foreldredokumentets størrelse.
Kilde: [Firestore-grenser](https://firebase.google.com/docs/firestore/quotas).

Versjon 102 viser et anslag av dagens tilstand med dokumentets kjente toppfelt,
tilgangsmetadata og sti. Beregningen teller UTF-8, feltnavn, tall, boolske verdier,
arrayer og kart, og behandler serverens tidsstempel som et tidsfelt. Den er ikke
en autoritativ måling av siste bekreftede serverdokument: ukjente toppfelt beholdt
av merge-skriving er ikke med. Indeksstørrelse er en separat begrensning.
Kilde: [Firestore-størrelsesberegning](https://firebase.google.com/docs/firestore/storage-size).

## Det som er implementert

- Alle direkte localStorage-operasjoner ligger i tre funksjoner som fanger feil,
  også når selve tilgangen til window.localStorage feiler.
- Alle hovedtilstandsskrivinger bruker persistLocalState. Ved kvotefeil fjernes
  bare familieoppdrag.cloudBackups.v1, og hovedskrivingen forsøkes én gang til.
  Ingen lagring fra andre apper ryddes. Tilstanden i minnet beholdes.
- saveState fortsetter til sky-køen selv om lokal lagring mislykkes.
- Ved oppstart reduseres en gyldig liste med flere backupkopier til den nyeste.
  Ugyldig eller utilgjengelig innhold behandles som manglende og slettes ikke.
- En valgfri lokal backup forsøkes først etter hovedtilstanden. Det lagres høyst
  én kopi. Mislykket backup alene gir ikke melding om at hovedlagringen feilet.
- Backup og flytting kan laste ned den lokale kopien. Filen kan gjenopprettes
  gjennom eksisterende Importer data med bekreftelse. Skybackupene er uendret.
- Innstillinger viser en rolig linje ved lokal skrivefeil og et størrelsesanslag.
  Over 70 prosent vises et vedvarende varsel i det opplåste voksenpanelet.
- Skyskriving som avvises på grunn av dokument-/feltstørrelse gir en egen
  forklaring. Endringen markeres fortsatt som ventende, ikke som lagret.

Dette løser ikke ubundet vekst. Hvis både lokal lagring og skyen feiler, finnes
nye endringer bare i minnet. Ikke lukk appen; eksporter først. Ved en slik feil
kan enheten fortsatt ha en eldre lokal kopi, ikke den siste tilstanden.

## Hvor oppføringene brukes

Referanser er funksjonsnavn i app.js, slik at de tåler senere linjeforskyvning.

### transactions

- awardPoints, refundPoints og undoTaskCompletion fører poeng. Saldo og
  lifetimePoints oppdateres direkte på barnet; de beregnes ikke fra hele loggen
  ved oppstart. Positive poeng øker vanligvis livstid, belønningsuttak gjør ikke
  det, og refusjoner øker saldo uten å øke livstid.
- Skjemaet lifetime-points korrigerer lifetimePoints direkte og lager history,
  men ingen transaction. En enkel sum av transactions kan derfor ikke brukes
  til å gjenskape livstidspoeng eller nivåer sikkert.
- safeMergeCloudState / mergeItemsById bruker id-er og endringstidspunkter.
  applyMergedTransactionsToChildren legger nye transaksjoners poeng til barna.
  Manglende id i det aktive dokumentet betyr i dag «ny transaksjon»; etter
  arkivering kan det bety «allerede arkivert». Dette må skilles før utrulling.
- Transaksjonene inngår i eksport, backup, import og activity-gjenoppretting.
  Det finnes ingen separat full transaksjonsvisning; historikkvisningen bruker history.

### completions

- findCompletion bestemmer dagens/ukens oppgavestatus og hindrer gjentakelse.
  Ikke-repeterbare once-oppgaver huskes uten tidsgrense. De kan ikke glemmes ved
  en generell 90-dagersgrense uten at oppgaven kan gjøres på nytt feilaktig.
- pendingApprovals, approveTask, rejectTask og undoTaskCompletion trenger selve
  oppføringen. Pending må aldri arkiveres bare fordi den er gammel.
- childStats, categoryCompleteToday og completedTaskCountThisWeek gir daglige
  og ukentlige tall, morgen-/kveldsmerker og ukemål.
- completedTaskCount og completedBonusCount bruker alle gyldige fullføringer
  til antallsmerker. Bonus regnes ut fra oppgavens nåværende kategori/frekvens;
  migreringen må bevare dette eller gjøre en godkjent semantisk endring.
- calculateTaskStreak går gjennom alle sammenhengende datoer bakover.
  updateChildStreak oppdaterer streak, bestStreak og lastStreakDate. En streak
  som varer mer enn 90 dager ville bli forkortet av ren filtrering.
- badges lagrer allerede tildelte merker separat; disse skal bevares, også når
  underliggende fullføringer flyttes. Arkiverte fullføringer er også nødvendige
  for senere opptjening av antallsmerker som ennå ikke er tildelt.
- Fullføringer inngår i synkfletting, driftsantall, eksport og gjenoppretting.

### history

- addHistory samler brukerhendelser. adultHistory viser hele loggen;
  barnets profil viser et begrenset utvalg via historyList.
- History brukes ikke til å beregne saldo, nivåer, streak eller tildelte merker.
  Eldre history er derfor lettest å flytte, men skal fortsatt kunne vises og
  eksporteres fra arkivet. Barnets utvalg bør samtidig hente de nyeste hendelsene
  på tvers av aktiv og arkivert historikk.
- History deltar også i safeMergeCloudState og activity-gjenoppretting.

## Hva kan tas ut av hoveddokumentet?

Ikke noe fjernes nå. Etter at lesing fra arkiv og migreringsvern er på plass:

1. Eldre history kan flyttes uten å endre økonomi eller spillfremdrift.
2. Eldre, ferdig behandlede transactions kan flyttes når barnets eksakte saldo og
   livstid er bevart, og synk har idempotent kontroll på både aktive og arkiverte
   transaksjoner. Behold kildereferanser for angring og refusjon.
3. Eldre, avsluttede completions kan flyttes når all-time-tall, bonusantall,
   streakens videreføring og once-oppgavenes sperrer finnes som korrekt avledede
   verdier. Behold pending og dagens/ukens oppføringer aktive. Sen angring må
   enten laste arkivoppføringen og korrigere summer atomisk, eller få en tydelig
   godkjent tidsgrense. Ingen skjult endring av angringsreglene.

Bevar children.pointsBalance, children.lifetimePoints, bestStreak og badges
uendret ved overgangen. Legg avstemte statistikk-/streakverdier ved siden av;
ikke gjenskap økonomien fra en ukritisk loggsummering.

## Alternativ A: månedlige arkiver og et aktivt tidsvindu

Eksempel: families/{id}/activityArchives/{month-part}, med egne deler per type,
stabil oppførings-id, manifest, antall og kontrollsum. Hoveddokumentet beholder
aktive oppføringer og summer. Arkivene lastes når brukeren blar i eldre historikk.

Fordeler: mindre endring i daglig UI, færre lesinger for eldre historikk og rask
reduksjon av hoveddokumentet når migreringen er gjennomført.

Ulemper: fortsatt dokumentgrenser, vanskelig sen angring, krevende synkfletting,
og ekstra statistikk som må holdes konsistent. Et månedarkiv må deles i biter,
for eksempel med et mål på 256 KiB, ikke én ubundet mappe per måned.

90 dager er ikke en garanti: 30 fullføringer per dag x 90 x 800 byte er alene
2,16 MB. Selv det aktive vinduet må begrenses etter bytes eller erstattes av
små vinduer og oppsummeringer. Et 90-dagersfilter alene løser ikke problemet.

## Alternativ B: egne samlinger per oppføring

Utvid retningen i FIREBASE_PLAN.md med:

```text
families/{id}/transactions/{transactionId}
families/{id}/completions/{completionId}
families/{id}/history/{historyId}
families/{id}/summaries/{childId}
families/{id}/appState/current       # lite oppsett, ikke hele hendelsesloggen
families/{id}/migrationRuns/{runId}  # verifisert manifest og fremdrift
```

Fordeler: hver hendelse er liten, historikk kan pagineres, id-er gir deduplisering,
og endring av en oppgave skriver ikke hele historikken. Godt langsiktig grunnlag.

Ulemper: flere lesinger/skrivinger, nye familieavgrensede regler og indekser,
mer offline-/abonnementslogikk og atomiske oppdateringer av hendelse + saldo +
summer. Klienten må ikke få føre vilkårlige summer uten tilgangskontroll.

Anbefaling: B som varig løsning, med et lite aktivt vindu i minnet og en
kontrollert, idempotent transaksjonsflyt. A er en mulig midlertidig bro hvis
størrelsesmålingen viser at det ikke er tid til B. Ikke start A som en «enkel
opprydding» uten kontroll på streak, once og dupliserte poeng.

Vurder IndexedDB for lokal tilstand/cache i samme senere fase. Én backup i
localStorage reduserer presset nå, men er ikke en ubegrenset lagringsløsning.

## Migrering uten datatap

1. Les faktisk siste servertilstand og størrelse. Eksporter en komplett kopi
   utenfor dagens enkelt-dokument-backup, og verifiser at den kan leses tilbake.
   Hvis dokumentet allerede er for stort for ny skybackup, må migreringen ikke
   avhenge av at enda en full enkelt-dokument-backup kan skrives.
2. Bygg ny leseflyt, offline-kø, paginering, gjenoppretting og tester først.
   Prøv en kopi i et isolert testmiljø, ikke pilotfamiliens levende dokument.
3. Innfør et serverhåndhevet migrerings-/skjemavern i en senere godkjent
   regelutgivelse. Frys gamle skriveruter for én familie under overgang, og
   ta vare på usynkroniserte lokale endringer for eksplisitt innlesing.
4. Kopier oppføringer med eksisterende id-er, i små gjenopptakbare batcher.
   Behold originaldata. Verifiser id-mengde, antall, kontrollsummer og referanser,
   samt eksakt saldo/livstid, streak, merker, pending og once-status.
5. Lag et verifisert manifest og velg den nye modellen atomisk. Ny kode skal
   forstå tilstanden «migrerer» og ikke skrive en halv modell.
6. Gjenoppta nye skriveruter først etter avstemming. Samme hendelses-id skal
   aldri påvirke poeng to ganger, heller ikke når en gammel offline-enhet kommer
   tilbake. Gammel safeMerge kan ikke brukes uendret mot arkiverte data.
7. La originalen være en utilgjengelig-for-gamle-skrivere sikkerhetskopi til
   migrering og gjenoppretting er dokumentert godkjent. Ingen automatisk sletting.

### Utestenging av gamle appversjoner

MIN_SUPPORTED_APP_VERSION og minSupportedAppVersion i dag er klientsperrer.
De beskytter ikke mot gamle klienter som mangler kontrollen, og en versjonsstreng
sendt av klienten er ikke i seg selv en sikkerhetsgrense.

Senere regler må avvise gamle appState-skrivinger for migrerte familier, kreve
ny modell/skjema og riktige roller, samt beskytte summer/revisjoner. Nye klienter
må bare skrive de nye samlingene og vise en oppdateringsbeskjed til klienter som
kan lese migreringsmetadata. Test dette med gamle versjoner og anonyme
barneenheter, ikke bare med eiers Google-konto. Ingen regler endres i del 1.

### Sikkerhetskopi og gjenoppretting etter oppdeling

Dagens cloudBackupPayload og stateWithBackupScope forventer en samlet state.
Etter oppdeling må en backup være et versjonert manifest over hele familien,
med oppføringer i avgrensede deler og ett konsistent checkpoint. Det å kopiere
bare det lille appState-dokumentet er ikke lenger en full backup.

Gjenoppretting må bruke en ny generation/run-id: last deler, verifiser dem,
bytt aktiv generasjon atomisk og behold forrige generasjon til avstemming.
Dette hindrer at gamle, nye og gjenopprettede oppføringer blandes og dobbelttelles.
Eksport/import må forstå både schema 2 og ny modell. Activity-gjenoppretting må
fortsatt inkludere barnas saldo, fullføringer, transactions, history, badges
og redemptions samlet. Ikke tilby delvis økonomisk rollback uten avstemming.

## Anslått tid igjen

Kun et planleggingsanslag fra den gamle lokale målingen: hvis 0,86 MB betyr
860 000 faktiske dokument-byte, er det rundt 189 000 byte igjen. Ved 800 byte
per fullføring er det omtrent 235 fullføringer. Hvis tallet betyr 0,86 MiB,
er budsjettet rundt 184 fullføringer. Unicode og Firestore-overhead kan endre dette.

| Fullføringer per familie per dag | Omtrentlig tid fra denne størrelsen |
|---|---|
| 10 | 18–24 dager |
| 20 | 9–12 dager |
| 30 | 6–8 dager |
| 60 | 3–4 dager |

Andre hendelser bruker også plass. Dette er ikke en prognose fra 7. oktober:
skytilstanden kan allerede ha passert grensen etter PC-ens siste bruk i juni.
Anbefalt neste beslutning er å lese den nye størrelseslinjen etter bekreftet
skyhent på eiers aktive enhet og prioritere B eller en kontrollert A-bro ut fra den.

## Kontroll og utgivelse

- Ny regresjonssuite: node --test tests/storage.test.cjs.
- Syntakskontroll: node --check app.js og node --check service-worker.js.
- Versjon 102 brukes konsekvent i app.js, index.html og service-worker.js.
- Ingen eldre automatisert testpakke fantes i prosjektet. Testene kjører også
  migrationReadinessChecks og runCloudSyncTest mot en simulert Firestore.
- Resultat: 12 av 12 regresjonstester bestod, begge syntakskontroller bestod.
- tests/storage-ui.cjs bestod i headless Edge ved 390 x 844 og 1280 x 900.
  Skjermbildene i tests/artifacts er kontrollert visuelt. Meldinger var synlige,
  uten horisontal overflyt eller JavaScript-feil. Testdata ble servert i minnet;
  ingen produksjonstjeneste ble kontaktet av testene.
- Ingen produksjonsskriving eller faktisk nettleserkvote på eiers konto er brukt
  som testgrunnlag. Manuell verifikasjon på iPhone/PC gjenstår før publisering.
