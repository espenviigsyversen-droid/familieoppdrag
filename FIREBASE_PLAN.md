# Firebase-plan

Denne planen beskriver ønsket flerfamilie-modell før vi bygger ekte innlogging og sentral hosting.

## Mål

- En voksen kan opprette en familie med Google/e-post-innlogging.
- Barn trenger ikke egne kontoer.
- Felles iPad/tablet kan åpne på profilvalg.
- Barnets egen enhet kan åpne direkte på barnets profil.
- Voksenmodus kan fortsatt beskyttes med PIN.
- Familieeier og voksne beskyttes med Firebase Authentication og Firestore-regler.

## Foreslått Firestore-struktur

```text
families/{familyId}
  name
  ownerUid
  adultUsers
  inviteCodes
  familyDevices
  createdAt
  updatedAt

families/{familyId}/appState/current
  familyId
  familyName
  state
  updatedAt
```

Appen bruker foreløpig:

```text
families/{familyId}/appState/current
```

`state` inneholder hele appens nåværende data. Det er enkelt og passer nå. Senere kan vi splitte opp i egne samlinger for `children`, `tasks`, `rewards` og `history` hvis appen trenger mer samtidighet eller rapportering.

## State-felter som er forberedt

```json
{
  "schemaVersion": 2,
  "familyId": "family-eksempel",
  "familyName": "Familien Eksempel",
  "familyCode": "ABCD1234",
  "ownerUid": null,
  "adultUsers": [],
  "familyDevices": [],
  "inviteCodes": []
}
```

## Tilgangsnivåer

| Nivå | Bruk | Beskyttes av |
|---|---|---|
| Familieeier | Opprette familie, administrere voksne, slette/eksportere data | Firebase Auth |
| Voksenbruker | Endre oppgaver, godkjenne, justere poeng | Firebase Auth + PIN i app |
| Familieenhet | Felles iPad/tablet eller barneenhet | Invitasjonskode + lokal enhetsprofil |
| Barn | Daglig bruk av egen profil | Ingen konto, lokal profilvalg |

PIN skal fortsatt brukes for rask sperre av voksenmodus på felles enheter. PIN er ikke en erstatning for Firebase Auth når familier ligger i samme backend.

## Invitasjonsmodell

`inviteCodes` bør støtte:

- `type: "device"` for felles iPad/barneenhet
- `type: "adult"` for ny voksenbruker
- `status: "active" | "revoked" | "used"`
- `expiresAt` for tidsbegrensede invitasjoner senere

Foreløpig bruker appen `familyCode` som aktiv enhetskode. Når en ny kode lages, markeres gamle device-invitasjoner som `revoked`.

## Enhetsmodell

`familyDevices` bør etter hvert registrere:

- intern enhets-id
- valgt standardprofil
- navn/label, f.eks. "Stue-iPad"
- status
- sist sett

Dette gjør det mulig å se og fjerne gamle enheter fra voksenpanelet senere.

## Forslag til Firestore-regler senere

Pseudomodell:

```text
allow read, write: if request.auth.uid in family.adultUsers
allow create family: if request.auth != null
allow device link read/write: only through en egen kontrollert flyt
```

I praksis bør vi ikke la en ren familiekode gi full Firestore-skrivetilgang. En trygg løsning kan være:

- voksne bruker Firebase Auth direkte
- familieenheter får begrenset tilgang via en egen device-token-modell
- godkjenninger og oppgaver valideres i regler eller via backend/Cloud Functions hvis appen blir offentlig

## Neste tekniske steg

1. Legge til Firebase Auth for vokseninnlogging.
2. Opprette eller koble `ownerUid` til familien.
3. Flytte familieoppretting til innlogget voksen.
4. Lage ekte invitasjonsflyt for nye enheter.
5. Stramme Firestore-regler før appen deles bredt.
