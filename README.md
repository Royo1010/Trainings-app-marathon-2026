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

Fasedoelen, blessureregels, alternatieven en uitgebreide fase-uitleg zijn samengevat in ingeklapte UI-onderdelen. De exacte trainingsdetails voor oefeningen en hardloopblokken zijn in `training-data.js` gestructureerd opgenomen.

Fase 4 is racespecifieker gemaakt richting een 3:30 marathon:

- Week 39: 24 km met 2 × 3 km marathontempo.
- Week 41: 26 km met 6–8 km marathontempo aan het einde.
- Week 42: 28 km met 10–12 km marathontempo als generale repetitie.
- Week 44: optioneel 22–24 km met 6 km marathontempo.

De zware marathontempo-long-runs vervangen deels midweekse kwaliteit. Ze zijn dus niet bovenop alle bestaande zware tempo/intervalbelasting gestapeld.

## Home screen

De app bevat manifest- en iOS-meta-tags voor gebruik via "Zet op beginscherm". Er is een eenvoudige SVG-icon meegeleverd. Voor een extra strakke iOS-icon kun je later PNG-iconen toevoegen, maar dit is niet nodig om de app te gebruiken.

## UX-regels

Het Vandaag-scherm is compact gemaakt voor iPhone-gebruik: geen vaste ondernavigatie, een klein hamburgermenu bovenin en direct zicht op de oefeningen. In hybride upper/lower/gym + run-sessies toont de app kracht eerst en hardlopen daarna. Echte run-first sessies, zoals long runs, shake-outs, marathon en easy run + mini strength, tonen hardlopen eerst.

Het Week-scherm is interactief: tik op een sessie om een preview te openen. In preview-modus kun je vooruitkijken zonder loggingvelden of afrondknop, zodat toekomstige sessies niet per ongeluk worden gelogd.

Het Vandaag-scherm heeft een compacte `[‹] Vandaag [›]` navigatie om vorige/volgende geplande sessies te bekijken. Dit verschuift het schema niet en maakt geen backlog; logging blijft gekoppeld aan de getoonde sessie en datum. De datumknop rechtsboven opent een compacte countdown tot de marathon.

Bij elke sessie staat een compacte `Filosofie`-badge met uitleg over het doel, de plek in de week, de fase, trainingsprincipes en verstandige aanpassingen. Hardloopblokken hebben ook een eigen `Run-info`-uitklapblok met doel, tempo, incline, techniek en alternatieven bij vermoeidheid.

Het tabblad `Fases` is bedoeld als brede fase-uitleg: doel, waarom, trainingsfilosofie, hardlopen, krachttraining, marathontempo, long run, aandachtspunten en mentale focus. Het tabblad `Hardloopopbouw` is de praktische routekaart met subtabs voor overzicht, week per week, long runs, marathontempo, sleutelweken en tempo's.

De oude groen/oranje/rood herstelknoppen zijn verwijderd. De app blijft een eenvoudige schema-lezer/logger en geen coachingsflow.

## Offline

`service-worker.js` cachet de basisbestanden zodat de app na een eerste bezoek ook offline kan openen. Bij wijzigingen op GitHub Pages kan een refresh nodig zijn voordat de nieuwste cache actief is.
