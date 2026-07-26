# Herstel- en fundamentprogramma

Statische iPhone-first trainingsapp voor het achtweekse programma van 27 juli
tot en met 20 september 2026.

## Actief plan

- Plan-ID: `rehab_foundation_2026_07_27`
- Vier sessies per week
- Drie looptrainingen van ongeveer dertig minuten
- Drie fases: kalibreren, belasting opbouwen, sterkte en terugkeer voorbereiden
- Aparte optionele mobiliteitsroutine
- Voorwaardelijk pad naar landmine press en machine overhead press

Na week 8 stopt de actieve planning bewust. Voor de resterende periode richting
de marathon van 22 november 2026 is een nieuw marathonspecifiek vervolgblok
nodig.

## Gebruik

Publiceer de bestanden rechtstreeks via GitHub Pages onder `/marathon-330/`.
Er is geen buildstap, backend, account of externe database nodig.

De app gebruikt:

- `index.html`
- `style.css`
- `app.js`
- `training-data.js`
- `manifest.json`
- `icon.svg`
- `service-worker.js`

## Data

Trainingsdata blijft lokaal op het apparaat onder:

`marathon330TrainingAppData_v1`

Nieuwe logs bevatten `planId`, `planVersion`, `sessionId`, `exerciseId` en
datum. Logs zonder plan-ID worden als `legacy_marathon_plan` behandeld en
blijven als historische statistiekdata behouden.

Wijzig de storage-key niet zonder migratie en schrijf bij appstart nooit lege
defaults over bestaande data. Export, import en diagnose staan onder `Data`.

## Inhoud

Elke warming-up, hoofd- en revalidatieoefening heeft een klikbare uitleg met:

- doel en getrainde structuren;
- reden voor opname;
- opstelling, uitvoering en houding;
- normaal verwacht gevoel en veelgemaakte fouten;
- pijn- en stopregels;
- progressie, regressie, alternatieven en faseverschillen;
- sets, reps, rust, tempo en intensiteit.

Runkaarten gebruiken RPE en de concrete weekopbouw uit het bronprogramma.
Er worden geen niet-voorgeschreven snelheden verzonnen.

## Offline en updates

De service worker cachet de basisbestanden. Onder `Data` staan knoppen om de app
normaal te herladen of met een cache-busting parameter de nieuwste versie op te
vragen. Geen van beide acties wist trainingsdata.
