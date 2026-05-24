# Marathon & Kracht Training Webapp

Statische iPhone-first webapp voor het schema uit `trainingsschema_marathon_codex.md`.

## Gebruik

Upload deze bestanden naar een GitHub-repository en zet GitHub Pages aan. Er is geen buildstap, npm, backend, account of database nodig.

Bestanden:

- `index.html`
- `style.css`
- `app.js`
- `training-data.js`
- `manifest.json`
- `icon.svg`
- `service-worker.js`

## Privacy

Het schema staat in de code en kan dus online staan via GitHub Pages. Je persoonlijke trainingslogs worden alleen in `localStorage` van het apparaat opgeslagen:

- `marathonApp.logs`
- `marathonApp.completedSessions`
- `marathonApp.preferences`
- `marathonApp.version`

Er is geen cloudopslag en geen login.

## Inhoudelijke omzetting

Alle fases van week 22 t/m 52 zijn opgenomen. Waar het bronschema met terugkerende templates werkt, gebruikt de app dezelfde aanpak:

- Fase 1: Week A/B met 4 sessies.
- Fase 2: Overgang A/B met 4 sessies.
- Fase 3: 3 runs + 3 gymtrainingen per week in afwisselende weekflow.
- Fase 4: 4 runs + 3 gymopties per week in afwisselende weekflow.
- Fase 5: taperweken, marathonweek en lichte gym.
- Fase 6: herstel en terugkeer naar krachttraining.

Fasedoelen, blessureregels, alternatieven en herstelvarianten zijn samengevat in ingeklapte UI-onderdelen. De exacte trainingsdetails voor oefeningen en hardloopblokken zijn in `training-data.js` gestructureerd opgenomen.

## Home screen

De app bevat manifest- en iOS-meta-tags voor gebruik via "Zet op beginscherm". Er is een eenvoudige SVG-icon meegeleverd. Voor een extra strakke iOS-icon kun je later PNG-iconen toevoegen, maar dit is niet nodig om de app te gebruiken.

## UX-regels

Het Vandaag-scherm is compact gemaakt voor iPhone-gebruik: geen vaste ondernavigatie, een klein hamburgermenu bovenin en direct zicht op de oefeningen. In hybride upper/lower/gym + run-sessies toont de app kracht eerst en hardlopen daarna. Echte run-first sessies, zoals long runs, shake-outs, marathon en easy run + mini strength, tonen hardlopen eerst.

Het Week-scherm is interactief: tik op een sessie om een preview te openen. In preview-modus kun je vooruitkijken zonder loggingvelden of afrondknop, zodat toekomstige sessies niet per ongeluk worden gelogd.

## Offline

`service-worker.js` cachet de basisbestanden zodat de app na een eerste bezoek ook offline kan openen. Bij wijzigingen op GitHub Pages kan een refresh nodig zijn voordat de nieuwste cache actief is.
