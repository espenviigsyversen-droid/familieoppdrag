# Familieoppdrag

En enkel familieapp for oppgaver, stjerner og belønninger. Appen kan kjøres som en statisk webapp og lagrer data lokalt i nettleseren. Hvis Firebase er slått på, synkroniseres data med Firestore.

## Før appen tas i bruk av en ny familie

1. Opprett et eget Firebase-prosjekt.
2. Aktiver Firestore Database.
3. Aktiver anonym innlogging i Firebase Authentication.
4. Bytt Firebase-verdiene øverst i `app.js`:
   - `FIREBASE_CONFIG`
   - `FAMILY_ID`
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

## Viktig om Firebase

Ikke del en versjon der flere familier bruker samme `FAMILY_ID` i samme Firebase-prosjekt. Da vil familiene kunne skrive til samme appdata. Hver familie bør ha sitt eget Firebase-prosjekt, eller minst sin egen unike `FAMILY_ID`.
