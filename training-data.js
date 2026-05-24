(function () {
  "use strict";

  const APP_CONFIG = {
    sourceFile: "trainingsschema_marathon_codex.md",
    startDate: "2026-05-25",
    startCalendarWeek: 22,
    version: "2026.05.24.6",
  };

  const PHASES = [
    {
      phaseId: "fase-1",
      phaseName: "Fase 1 — Basisfase",
      weekRange: "Week 22 t/m 26",
      startDate: "2026-05-25",
      endDate: "2026-06-28",
      goal:
        "Krachttraining blijft dominant met 4 gymdagen en 2 hardloopmomenten. 12 km/u wordt voorzichtig geintroduceerd.",
      structure: "Upper/Lower A/B, runs na upper body.",
      rules:
        "500 meter roeien als warming-up. Meestal 1-3 reps in reserve. Brachialis/bicep links ontzien, heup/kuit/tibialis/enkel structureel aandacht.",
      phaseDetails: {
        runsPerWeek: "2",
        gymPerWeek: "4",
        primaryGoal: "Rustige start waarin kracht dominant blijft en hardlopen voorzichtig wordt toegevoegd.",
        stats: ["1 easy run", "1 korte 3:30-tempo-intro", "nog geen aparte long run"],
        sections: [
          {
            title: "Korte samenvatting",
            text: "Fase 1 is de rustige start van de marathonvoorbereiding. Je traint nog niet als volledige marathonloper, maar als sterke sporter die zijn lichaam laat wennen aan twee vaste loopprikkels per week.",
          },
          {
            title: "Waarom deze fase?",
            text: "Deze fase bouwt loopbelasting op zonder krachttraining, spiermassa en herstel meteen te verstoren. Hardlopen wordt bekend, maar de totale belasting blijft beheersbaar.",
          },
          {
            title: "Hardlopen",
            text: "Easy runs zijn meestal 20-30 minuten rond 9,5 km/u. De tempo-intro's raken kort 11,5-12,0 km/u aan. Het doel is gewenning, niet testen.",
          },
          {
            title: "Marathontempo",
            text: "12 km/u wordt kort aangeraakt met blokken zoals 3 x 2 min, 4 x 2 min, 3 x 3 min en 4 x 3 min. Dit is gewenning, geen bewijs.",
          },
          {
            title: "Krachttraining",
            text: "Upper/lower A/B blijft de hoofdstructuur. Borst, rug, schouders, benen, billen, core, kuiten en tibialis krijgen veel aandacht.",
          },
          {
            title: "Let op",
            text: "Extra aandacht voor brachialis/bicep links, schouder, heup/voorzijde bovenbeen, linker enkel, kuiten en tibialis.",
          },
          {
            title: "Mentale focus",
            text: "Rustig beginnen. Niet bewijzen dat je 3:30 al aankan. Alleen consistent worden.",
          },
        ],
      },
    },
    {
      phaseId: "fase-2",
      phaseName: "Fase 2 — Overgangsfase",
      weekRange: "Week 27 t/m 28",
      startDate: "2026-06-29",
      endDate: "2026-07-12",
      goal:
        "Van 2 naar 3 runs per week, met 3 echte gymdagen plus een Easy Run + Mini Strength.",
      structure: "Upper + Easy, Lower, Upper + Marathonpace Intro, Easy Run + Mini Strength.",
      rules:
        "Kracht blijft serieus, maar de vierde sessie is compact. Geen PR-jacht; extra loopfrequentie rustig laten wennen.",
      phaseDetails: {
        runsPerWeek: "3",
        gymPerWeek: "3 + mini-strength",
        primaryGoal: "De overgang maken van kracht-dominant naar hybride marathonopbouw.",
        stats: ["1 easy run", "1 marathonpace-intro", "1 extra easy run", "geen echte long-runfase"],
        sections: [
          {
            title: "Korte samenvatting",
            text: "Fase 2 voegt de derde run toe. Hardlopen wordt een vaste pijler van de week, terwijl krachttraining nog duidelijk aanwezig blijft.",
          },
          {
            title: "Waarom deze fase?",
            text: "De sprong van twee naar drie runs per week is belangrijk. Je krijgt meer loopfrequentie zonder meteen in een zware marathonfase te zitten.",
          },
          {
            title: "Hardlopen",
            text: "Easy runs worden ongeveer 30-35 minuten. De marathonpace-blokken worden iets langer dan in fase 1, maar blijven gecontroleerd.",
          },
          {
            title: "Marathontempo",
            text: "Je loopt bijvoorbeeld 4 x 3 min of 3 x 5 min rond 11,8-12,0 km/u. Het doel is langer vasthouden, niet forceren.",
          },
          {
            title: "Krachttraining",
            text: "Je gaat van vier volledige gymdagen naar drie gymdagen plus mini-strength. Dat geeft hardlopen meer ruimte terwijl kracht en spiermassa onderhouden blijven.",
          },
          {
            title: "Mentale focus",
            text: "Wennen aan meer loopfrequentie. Niet forceren. Deze fase moet je klaarzetten voor de echte hybride opbouw.",
          },
        ],
      },
    },
    {
      phaseId: "fase-3",
      phaseName: "Fase 3 — Hybride Opbouwfase",
      weekRange: "Week 29 t/m 36",
      startDate: "2026-07-13",
      endDate: "2026-09-06",
      goal:
        "3 hardloopdagen + 3 gymdagen. Marathonpace wekelijks trainen en long run opbouwen richting ongeveer 2 uur.",
      structure: "Run 1 Easy, Run 2 Marathonpace, Run 3 Long Run, Gym 1 Upper, Gym 2 Lower, Gym 3 Full Body.",
      rules:
        "Runs krijgen prioriteit. Lower strength liever niet vlak voor long run. Vanaf 75-90 min voeding en hydratatie oefenen.",
      phaseDetails: {
        runsPerWeek: "3",
        gymPerWeek: "3",
        primaryGoal: "De marathonmotor bouwen terwijl krachttraining serieus maar onderhoudender wordt.",
        stats: ["Run 1 easy", "Run 2 3:30-marathonpace", "Run 3 long run", "long run richting ongeveer 2 uur"],
        sections: [
          {
            title: "Korte samenvatting",
            text: "Fase 3 is de eerste echte hybride fase. Hardlopen wordt een hoofdpijler naast krachttraining: drie runs en drie gymtrainingen per week.",
          },
          {
            title: "Waarom deze fase?",
            text: "Je lichaam moet wennen aan structurele kilometers, langere duurlopen en wekelijks marathontempo, terwijl je sterk blijft.",
          },
          {
            title: "Hardlopen",
            text: "Easy runs lopen op van ongeveer 35 naar 50 minuten. De marathonpace-run bouwt op van korte blokken naar langere stukken rond 11,8-12,0 km/u.",
          },
          {
            title: "Marathontempo",
            text: "Je traint 12 km/u wekelijks met voorbeelden zoals 3 × 4 min, 3 × 5 min, 2 × 8 min, 2 × 10 min en later 20 min + 8 min.",
          },
          {
            title: "Lange duurloop",
            text: "De long run is meestal rustig op 9,5-10,0 km/u. Het doel is duurvermogen, pezen/gewrichten, energiehuishouding en mentale gewenning.",
          },
          {
            title: "Krachttraining",
            text: "Krachttraining wordt onderhoudender. Geen PR-jacht, wel benen, billen, core, kuiten, tibialis en blessurepreventie blijven belangrijk.",
          },
          {
            title: "Mentale focus",
            text: "Leren dat hardlopen geen losse toevoeging meer is, maar een hoofdonderdeel van de week.",
          },
        ],
      },
    },
    {
      phaseId: "fase-4",
      phaseName: "Fase 4 — Piekfase / Marathonspecifieke fase",
      weekRange: "Week 37 t/m 44",
      startDate: "2026-09-07",
      endDate: "2026-11-01",
      goal:
        "4 hardloopmomenten per week, 12 km/u als marathontempo, 13 km/u als snelheidsreserve en long runs tot 30–32 km.",
      structure: "4 runs leidend, 2 gymtrainingen aanbevolen, 3e gym alleen als herstel goed is.",
      rules:
        "Gym is onderhoud. Geen PR's, geen spierpijn najagen. Week 40 is cutback, week 43 zwaarste long-run week.",
      phaseDetails: {
        runsPerWeek: "4",
        gymPerWeek: "2-3",
        primaryGoal: "Racespecifiek vertrouwen bouwen voor een 3:30 marathon.",
        stats: ["easy run", "marathonpace/techniek", "tempo of strides", "long run", "3 echte MP-long-runs + 1 optioneel"],
        sections: [
          {
            title: "Korte samenvatting",
            text: "Fase 4 is de belangrijkste marathonspecifieke fase. Het schema is minder veilig en specifieker richting 3:30: niet alleen lange duurlopen, maar ook marathontempo op vermoeide benen.",
          },
          {
            title: "Waarom deze fase?",
            text: "Een marathon van 3:30 vraagt het vermogen om ongeveer 12 km/u lang vol te houden. Echte vertrouwenstraining ontstaat wanneer je dit tempo loopt nadat je al veel kilometers in de benen hebt.",
          },
          {
            title: "Hardlopen",
            text: "De long runs lopen op richting 30–32 km. Daarnaast komen marathonpace-blokken en snellere prikkels terug, maar zware long runs vervangen deels de midweekse belasting.",
          },
          {
            title: "3:30-marathontempo",
            text: "MP betekent hier 11,8-12,0 km/u. Exact 3:30 tempo is ongeveer 12,06 km/u; 12,0 km/u is de praktische trainingsreferentie.",
          },
          {
            title: "Belangrijkste marathonpace-long-runs",
            text: "Week 39: 24 km met 2 × 3 km MP. Week 41: 26 km met 6–8 km MP aan het einde. Week 42: 28 km met 10–12 km aaneengesloten MP. Week 44: optioneel 22–24 km met 6 km MP.",
          },
          {
            title: "Waarom deze aanpassing?",
            text: "De oorspronkelijke lange duurlopen waren vooral rustig. Dat is veilig, maar voor een 3:30-poging geeft het extra vertrouwen om een paar keer marathontempo op vermoeide benen te lopen.",
          },
          {
            title: "Totaal marathontempo in long runs",
            text: "Zonder optionele week 44: ongeveer 22-26 km MP, circa 1u50 tot 2u10 specifieke ervaring. Met week 44: ongeveer 28-32 km MP, circa 2u20 tot 2u40 specifieke ervaring.",
          },
          {
            title: "Waarom niet elke long run hard?",
            text: "Dat kost te veel herstel en verhoogt het blessurerisico. De kunst is genoeg specifieke prikkels krijgen zonder jezelf kapot te trainen.",
          },
          {
            title: "Langste duurloop",
            text: "Week 43 blijft 30–32 km rustig. Die training is voor afstand, mentale hardheid en voeding/hydratatie, niet voor snelheid.",
          },
          {
            title: "Krachttraining",
            text: "Krachttraining wordt ondersteunend. Geen zware beentraining vlak voor de belangrijkste long runs, geen PR-jacht, wel core, heupen, kuiten, tibialis en blessurepreventie.",
          },
          {
            title: "Mentale focus",
            text: "Vertrouwen opbouwen: niet alleen hopen dat 12 km/u lukt, maar ervaren dat je 12 km/u kunt lopen terwijl je benen al moe zijn.",
          },
        ],
      },
    },
    {
      phaseId: "fase-5",
      phaseName: "Fase 5 — Taperfase / Fris worden voor de marathon",
      weekRange: "Week 45 t/m 47",
      startDate: "2026-11-02",
      endDate: "2026-11-22",
      goal:
        "Vermoeidheid laten zakken, benen fris krijgen, korte marathontempo-prikkels behouden en marathon lopen op 22 november.",
      structure: "Volume omlaag: korte runs, lichte gym, marathonweek simpel houden.",
      rules:
        "Geen nieuwe oefeningen, geen spierpijn, geen testtraining. Rust is productief.",
      phaseDetails: {
        runsPerWeek: "3-4, dalend",
        gymPerWeek: "0-2 licht",
        primaryGoal: "Vermoeidheid laten zakken en scherp blijven voor zondag 22 november 2026.",
        stats: ["minder kilometers", "korte MP-prikkels", "lichte gym", "marathonweek fris"],
        sections: [
          {
            title: "Korte samenvatting",
            text: "Fase 5 is de taper. De trainingsomvang gaat omlaag, maar korte marathontempo-prikkels blijven aanwezig zodat je scherp blijft.",
          },
          {
            title: "Waarom deze fase?",
            text: "Je wordt niet fitter door in de laatste weken extra te forceren. Je wordt beter door de opgebouwde training te laten landen.",
          },
          {
            title: "Hardlopen",
            text: "Long runs worden korter. Intensiteit blijft kort aanwezig, maar het volume daalt duidelijk.",
          },
          {
            title: "Marathontempo",
            text: "Korte prikkels zoals 2 × 10 min, 2 × 6 min en in marathonweek alleen korte stukjes of strides.",
          },
          {
            title: "Krachttraining",
            text: "Alleen onderhoud. Geen zware benen, geen spierpijn najagen en geen nieuwe oefeningen.",
          },
          {
            title: "Wedstrijddag",
            text: "Niet te hard starten, eerste kilometers controleren, rond 12,0 km/u blijven en voeding/hydratatie uitvoeren zoals geoefend.",
          },
          {
            title: "Mentale focus",
            text: "Rustig blijven. Vertrouwen op de voorbereiding. Niet in paniek extra trainen.",
          },
        ],
      },
    },
    {
      phaseId: "fase-6",
      phaseName: "Fase 6 — Herstel en terugkeer naar krachttraining",
      weekRange: "Week 48 t/m 52",
      startDate: "2026-11-23",
      endDate: "2026-12-27",
      goal:
        "Herstellen van de marathon en gecontroleerd terug naar normaal krachtgericht trainen.",
      structure: "Week 48 herstel, daarna lichte full body, rustige upper/lower en nieuwe basis.",
      rules:
        "Geen tempo's, intervals of lange duurlopen. Geen PR's in november/december. Opbouw wordt bepaald door heup, bovenbeen, kuit, enkel en brachialis.",
      phaseDetails: {
        runsPerWeek: "0-2 optioneel",
        gymPerWeek: "1-4 oplopend",
        primaryGoal: "Herstellen van de marathon en gecontroleerd terug naar krachttraining.",
        stats: ["week 48 herstel", "geen tempo", "geen lange duurloop", "kracht rustig herstarten"],
        sections: [
          {
            title: "Korte samenvatting",
            text: "Fase 6 begint na de marathon. De focus ligt op herstel, rustig bewegen en daarna stap voor stap terug naar normale krachttraining.",
          },
          {
            title: "Waarom deze fase?",
            text: "Na een marathon heeft het lichaam tijd nodig voordat zware benen, tempo's en PR-jacht weer logisch zijn.",
          },
          {
            title: "Hardlopen",
            text: "Alleen korte rustige loopjes als benen, heupen, kuiten en enkel goed voelen. Geen tempo, intervals of lange duurloop.",
          },
          {
            title: "Krachttraining",
            text: "Eerst lichte full body en mobiliteit, daarna terug naar upper/lower. Onderlichaam bouwt langzamer op dan bovenlichaam.",
          },
          {
            title: "Let op",
            text: "Geen zware lower body als heup, bovenbeen, kuit of enkel nog reageren. Geen nieuwe prikkels om herstel te bewijzen.",
          },
          {
            title: "Mentale focus",
            text: "De marathon is achter de rug. Rustig opnieuw bouwen is winst, geen terugval.",
          },
        ],
      },
    },
  ];

  const EXERCISE_PROFILES = {
    "machine-chest-press": {
      weightRange: { min: 0, max: 150, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info:
        "Hoofd- of onderhoudsprikkel voor borst. Machine is gekozen omdat dumbbells de brachialis sneller kunnen triggeren.",
      tips: "Gecontroleerd zakken, niet stuiteren, ellebogen niet overdreven ver naar achteren.",
      warning: "Stop bij pijn aan voorkant schouder of brachialis.",
      alternatives: ["Incline Machine Press", "Pec Deck", "Cable Fly"],
    },
    "chest-supported-row-machine": {
      weightRange: { min: 0, max: 140, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Rugoefening met minimale onderrugbelasting.",
      tips: "Borst tegen steun, rustig trekken, geen explosieve herhalingen.",
      warning: "Bij rhomboid of brachialisreactie gewicht verlagen of vervangen.",
      alternatives: ["Low Row Machine", "Seated Cable Row", "Dumbbell Row als pijnvrij"],
    },
    "low-row-machine": {
      weightRange: { min: 0, max: 140, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Belangrijke rugoefening die in het schema goed past bij brachialiscontrole.",
      tips: "Neutrale of comfortabele greep, gecontroleerd trekken, geen rukken.",
      warning: "Pijn maximaal 0-3/10 in brachialis.",
      alternatives: ["Chest-Supported Row Machine", "Seated Cable Row als pijnarm"],
    },
    "shoulder-press-machine": {
      weightRange: { min: 0, max: 100, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Schouderdrukken blijft in het schema, maar gecontroleerd.",
      tips: "Rustig drukken, geen geforceerde diepe stretch.",
      warning: "Alleen pijnvrij; stop bij voorkant-schouderpijn.",
      alternatives: ["Dumbbell Shoulder Press als schouder/brachialis rustig is"],
    },
    "dumbbell-shoulder-press-of-shoulder-press-machine": {
      weightRange: { min: 0, max: 60, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Dumbbells alleen als brachialis en schouder rustig voelen; anders machine kiezen.",
      tips: "Pijnvrij bewegen en gecontroleerd drukken.",
      warning: "Bij irritatie direct naar machine of overslaan.",
      alternatives: ["Shoulder Press Machine"],
    },
    "pec-deck-of-cable-fly": {
      weightRange: { min: 0, max: 80, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Borstaccessoire zonder zware dumbbells.",
      tips: "Gecontroleerde stretch, kies de variant die die dag het beste voelt.",
      warning: "Geen pijn in voorkant schouder.",
      alternatives: ["Pec Deck", "Cable Fly", "Machine Chest Press extra set"],
    },
    "pec-deck": {
      weightRange: { min: 0, max: 80, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Borstprikkel zonder zware dumbbells.",
      tips: "Rustig bewegen en stretch controleren.",
      warning: "Niet forceren bij voorkant-schouderpijn.",
      alternatives: ["Cable Fly", "Machine Chest Press"],
    },
    "cable-fly": {
      weightRange: { min: 0, max: 60, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Borstaccessoire met gecontroleerde range.",
      tips: "Geen extreme stretch, rustig tempo.",
      warning: "Stop bij schouderpijn.",
      alternatives: ["Pec Deck", "Machine Chest Press"],
    },
    "rear-delt-fly-machine": {
      weightRange: { min: 0, max: 70, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Belangrijk voor schouderbalans, houding en blessurepreventie.",
      tips: "Elleboog licht gebogen, rustig bewegen, geen momentum.",
      warning: "Niet zwaaien of forceren.",
      alternatives: ["Face Pull"],
    },
    "face-pull": {
      weightRange: { min: 0, max: 60, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Voor bovenrug, rear delts en schoudercontrole.",
      tips: "Trek richting gezicht/voorhoofd, ellebogen hoog.",
      warning: "Geen zwaar gewicht nodig.",
      alternatives: ["Rear Delt Fly Machine", "External Rotation"],
    },
    "brachialis-rehab-hammer-curl-isometric-hold": {
      inputType: "weight-seconds",
      weightRange: { min: 0, max: 30, step: 0.5 },
      secondsRange: { min: 10, max: 120, step: 5 },
      info: "Lichte isometrische rehab voor brachialis/bicep.",
      tips: "Elleboog ongeveer 90 graden, neutrale grip, pijn maximaal 2-3/10.",
      warning: "Als dit irriteert: overslaan.",
      alternatives: ["Brachialis Isometric Hold"],
    },
    "brachialis-isometric-hold": {
      inputType: "weight-seconds",
      weightRange: { min: 0, max: 30, step: 0.5 },
      secondsRange: { min: 10, max: 120, step: 5 },
      info: "Lichte brachialis-activatie, alleen pijnarm.",
      tips: "Neutrale grip, rustig vasthouden.",
      warning: "Niet forceren bij brachialispijn.",
      alternatives: ["Overslaan als geirriteerd"],
    },
    "leg-press": {
      weightRange: { min: 0, max: 300, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Hoofdoefening voor benen zonder gewone barbell squat.",
      tips: "Voeten stevig, gecontroleerd zakken, onderrug tegen zitting.",
      warning: "Niet zo diep dat je bekken kantelt; geen ego-gewicht.",
      alternatives: ["Hack Squat als test", "Reverse Lunge"],
    },
    "hip-thrust-machine": {
      weightRange: { min: 0, max: 250, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Belangrijk voor bilkracht, heupstabiliteit en hardloopondersteuning.",
      tips: "Bovenin kort aanspannen, geen overdreven holle onderrug.",
      warning: "Controle boven gewicht.",
      alternatives: ["Glute bridge machine", "Back Extension als posterior-chain alternatief"],
    },
    "bulgarian-split-squat": {
      weightRange: { min: 0, max: 80, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Single-leg oefening voor hardlopen, heupcontrole en links-rechtsbalans.",
      tips: "Rustig zakken, romp stabiel, knie volgt voetlijn.",
      warning: "Niet forceren als heup of bovenbeen zeurt.",
      alternatives: ["Reverse Lunge", "Leg Press"],
    },
    "reverse-lunge": {
      weightRange: { min: 0, max: 80, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Controleerbare single-leg oefening voor runner legs.",
      tips: "Stap rustig naar achter, romp stabiel, knie volgt voetlijn.",
      warning: "Niet forceren bij heup/bovenbeenklacht.",
      alternatives: ["Walking Lunge", "Bulgarian Split Squat"],
    },
    "walking-lunge": {
      weightRange: { min: 0, max: 80, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Hardloopondersteunende single-leg oefening.",
      tips: "Gecontroleerde passen, romp stabiel.",
      warning: "Niet forceren bij heup/bovenbeenklacht.",
      alternatives: ["Reverse Lunge"],
    },
    "back-extension-machine": {
      weightRange: { min: 0, max: 120, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Posterior chain, onderrugcontrole, hamstrings en billen.",
      tips: "Beweeg gecontroleerd en focus op heupstrekking.",
      warning: "Niet overstrekken.",
      alternatives: ["Romanian Deadlift als alles rustig voelt"],
    },
    "romanian-deadlift": {
      weightRange: { min: 0, max: 180, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Gedoseerde deadlift-achtige prikkel voor hamstrings en posterior chain.",
      tips: "Heupen naar achter, rug neutraal, hamstrings voelen.",
      warning: "Geen maximale gewichten; vervangen bij onderrug/rhomboidklacht.",
      alternatives: ["Back Extension Machine"],
    },
    "hack-squat-testblok": {
      weightRange: { min: 0, max: 220, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Testblok om te zien hoe knieen, heupen en onderrug reageren.",
      tips: "Licht tot matig, technisch, rustig opbouwen.",
      warning: "Voelt hij niet goed: vervangen door leg press.",
      alternatives: ["Leg Press"],
    },
    "leg-press-of-hack-squat-test": {
      weightRange: { min: 0, max: 300, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Leg press is de veilige hoofdoptie; hack squat alleen als alles goed reageert.",
      tips: "Geen ego-gewicht.",
      warning: "Bij twijfel: leg press.",
      alternatives: ["Leg Press", "Back Extension"],
    },
    "leg-extension": {
      weightRange: { min: 0, max: 120, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Quadricepsprikkel zonder grote systeemvermoeidheid.",
      tips: "Gecontroleerd omhoog, bovenin kort aanspannen.",
      warning: "Knieen moeten goed voelen.",
      alternatives: ["Leg Press licht"],
    },
    "calf-raise": {
      weightRange: { min: 0, max: 180, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Kuitkracht en enkel-/Achillesbestendigheid.",
      tips: "Volledige range, bovenin kort vasthouden, langzaam zakken.",
      warning: "In herstelweken eerst licht.",
      alternatives: ["Seated Calf Raise"],
    },
    "tibialis-raise-tegen-de-muur": {
      inputType: "reps-only",
      repRange: { min: 1, max: 40 },
      info: "Voor scheenbeenregio, enkelcontrole en hardloopbelasting.",
      tips: "Rug tegen muur, tenen optrekken, gecontroleerd zakken.",
      warning: "Branderig mag; scherpe pijn niet.",
      alternatives: ["Tibialis Raise"],
    },
    "tibialis-raise-tegen-muur": {
      inputType: "reps-only",
      repRange: { min: 1, max: 40 },
      info: "Voor scheenbeenregio, enkelcontrole en hardloopbelasting.",
      tips: "Rug tegen muur, tenen optrekken, gecontroleerd zakken.",
      warning: "Branderig mag; scherpe pijn niet.",
      alternatives: ["Tibialis Raise"],
    },
    "tibialis-raise": {
      inputType: "reps-only",
      repRange: { min: 1, max: 40 },
      info: "Enkel/scheenbeen-onderhoud.",
      tips: "Gecontroleerde reps.",
      warning: "Licht houden bij herstel.",
      alternatives: ["Tibialis Raise tegen muur"],
    },
    "heupmobiliteit": {
      inputType: "minutes",
      minutesRange: { min: 1, max: 15 },
      info: "Mobiliteit voor heupen en hardloopondersteuning.",
      tips: "Kies 90/90 hip switches, hip flexor stretch, couch stretch of rustige diepe squat hold.",
      warning: "Geen pijn forceren.",
      alternatives: ["Mobiliteit 3-5 minuten"],
    },
    "lateral-raise": {
      weightRange: { min: 0, max: 40, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Schouderbreedte en schouderbalans.",
      tips: "Licht tot matig, gecontroleerd, geen zwaaien.",
      warning: "Elleboog licht gebogen, geen momentum.",
      alternatives: ["Cable Lateral Raise"],
    },
    "dips": {
      inputType: "reps-only",
      repRange: { min: 1, max: 30 },
      info: "Drukoefening die alleen blijft zolang hij goed voelt.",
      tips: "Niet extreem diep zakken, romp gecontroleerd.",
      warning: "Stop bij voorkant-schouderpijn of brachialisreactie.",
      alternatives: ["Machine Chest Press extra set", "Pec Deck", "Cable Fly"],
    },
    "pallof-press": {
      weightRange: { min: 0, max: 60, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Anti-rotatie core-oefening voor rompspanning en hardlopen.",
      tips: "Kabel op borsthoogte, romp stil houden, langzaam uitstrekken.",
      warning: "Niet meedraaien.",
      alternatives: ["Dead Bug", "Side Plank"],
    },
    "pallof-press-of-cable-woodchop": {
      weightRange: { min: 0, max: 60, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Pallof is stabiele anti-rotatie; woodchop is dynamischer.",
      tips: "Kies de variant die die dag beter voelt.",
      warning: "Geen wilde rotatie.",
      alternatives: ["Pallof Press", "Cable Woodchop", "Side Plank"],
    },
    "landmine-rotation": {
      weightRange: { min: 0, max: 60, step: 0.5 },
      repRange: { min: 1, max: 30 },
      info: "Rotatiekracht en core, gecontroleerd.",
      tips: "Romp draait gecontroleerd, heupen mogen meebewegen.",
      warning: "Geen wilde swing of rugpijn forceren.",
      alternatives: ["Pallof Press", "Cable Woodchop"],
    },
    "side-plank": {
      inputType: "seconds",
      secondsRange: { min: 10, max: 120, step: 5 },
      info: "Laterale core en heupstabiliteit.",
      tips: "Romp lang houden, heup stabiel.",
      warning: "Stop bij schouderpijn.",
      alternatives: ["Dead Bug", "Pallof Press"],
    },
    "dead-bug": {
      inputType: "reps-only",
      repRange: { min: 1, max: 30 },
      info: "Core-oefening voor rompspanning en controle.",
      tips: "Onderrug licht tegen de grond, langzaam bewegen.",
      warning: "Geen haast, geen compensatie.",
      alternatives: ["Side Plank", "Pallof Press"],
    },
    "farmer-s-carry": {
      inputType: "weight-distance",
      weightRange: { min: 0, max: 80, step: 0.5 },
      distanceRange: { min: 10, max: 100, step: 5 },
      info: "Carry alleen als rhomboid goed voelt.",
      tips: "Rechte houding, schouders laag, niet scheef hangen.",
      warning: "Bij rhomboidzeur vervangen door side plank of Pallof press.",
      alternatives: ["Side Plank", "Pallof Press"],
    },
    "ab-wheel-of-side-plank": {
      inputType: "reps-or-seconds",
      repRange: { min: 1, max: 30 },
      secondsRange: { min: 10, max: 120, step: 5 },
      info: "Ab wheel alleen als schouder en brachialis goed voelen; anders side plank.",
      tips: "Controle boven range.",
      warning: "Geen schouder- of brachialispijn forceren.",
      alternatives: ["Side Plank", "Dead Bug"],
    },
    "calf-raise-tibialis-raise-superset": {
      inputType: "reps-only",
      repRange: { min: 1, max: 40 },
      info: "Superset voor kuit en tibialis als blessurepreventie.",
      tips: "Rustige rondes, volledige controle.",
      warning: "Bij peesgevoeligheid licht houden.",
      alternatives: ["Calf Raise", "Tibialis Raise"],
    },
  };

  function slugify(value) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function exercise(name, planned, options = {}) {
    const id = options.id || slugify(name.replace(/\s+or\s+/gi, " of "));
    const profile = EXERCISE_PROFILES[id] || {};
    const inputType = options.inputType || profile.inputType || "weight-reps";
    const plannedText = planned.replace(/(\d)-(\d)/g, "$1–$2");
    return {
      id,
      name,
      planned: plannedText,
      inputType,
      weightRange: options.weightRange || profile.weightRange || { min: 0, max: 120, step: 0.5 },
      repRange: options.repRange || profile.repRange || { min: 1, max: 30 },
      secondsRange: options.secondsRange || profile.secondsRange || { min: 10, max: 120, step: 5 },
      minutesRange: options.minutesRange || profile.minutesRange || { min: 1, max: 15 },
      distanceRange: options.distanceRange || profile.distanceRange || { min: 10, max: 100, step: 5 },
      info: options.info || profile.info || "Volgens schema uitvoeren.",
      tips: options.tips || profile.tips || "Controle, nette techniek en 1-3 reps in reserve waar passend.",
      warning: options.warning || profile.warning || "Bij pijn boven 3/10 lichter maken of vervangen.",
      alternatives: options.alternatives || profile.alternatives || [],
    };
  }

  function cardio(title, instruction, options = {}) {
    return {
      title,
      instruction,
      outdoor: options.outdoor || "",
      notes: options.notes || "",
      hasFeeling: true,
    };
  }

  function session(number, title, type, exercises, cardioBlock, options = {}) {
    return {
      sessionNumber: number,
      title,
      type,
      goal: options.goal || "",
      warmup: options.warmup || "500 meter roeien waar dit een gymtraining is.",
      exercises: exercises || [],
      cardio: cardioBlock || null,
      notes: options.notes || "",
      infoBlocks: options.infoBlocks || [],
    };
  }

  function infoBlock(title, text) {
    return { title, text };
  }

  function longRunInfo(phaseId, calendarWeek) {
    if (phaseId === "fase-3") {
      const base =
        "Vanaf 75-90 min: oefenen met water en koolhydraten. Vanaf 90 min en langer: gebruik de long run om maag, timing, drinken en energie te testen.";
      const fastFinish = {
        33: "Fast finish alleen als alles goed voelt: laatste 10 min naar 10,5 km/u.",
        34: "Fast finish alleen als alles goed voelt: laatste 10 min naar 10,5-11,0 km/u.",
        35: "Fast finish alleen als alles goed voelt: laatste 10-15 min naar 10,5-11,0 km/u.",
        36: "Geen fast finish; bewust lichter.",
      };
      return [infoBlock("Voeding/hydratatie", `${base} ${fastFinish[calendarWeek] || "Long run rustig houden."}`)];
    }
    if (phaseId === "fase-4") {
      const specifics = {
        39: "Deze long run bevat 6 km rond MP: 2 blokken van 3 km op 11,8-12,0 km/u. Zie dit als controletraining, niet als wedstrijd.",
        40: "Cutbackweek: geen marathontempo en geen fast finish. De winst zit in herstellen van week 39.",
        41: "Progressieve finish: 6–8 km rond MP aan het einde. Bij twijfel steady houden in plaats van forceren.",
        42: "Belangrijkste generale repetitie: 10–12 km rond MP binnen 28 km. Midweek is bewust lichter gemaakt.",
        43: "Langste duurloop blijft rustig. Geen verplicht MP; afstand, voeding en mentale hardheid zijn het doel.",
        44: "Optioneel 6 km MP alleen als week 42 en 43 goed verteerd zijn. Bij vermoeidheid volledig rustig.",
      };
      return [
        infoBlock(
          "Voeding/hydratatie",
          `Bij runs langer dan 90 min en 20 km+: oefen water, sportdrank, gelletjes, koolhydraten en timing. Geen verrassingen op marathondag. ${specifics[calendarWeek] || "Long run grotendeels rustig houden."}`
        ),
        infoBlock(
          "Waarom marathontempo in long runs?",
          "Voor een 3:30-poging geeft het vertrouwen om 11,8-12,0 km/u ook op vermoeide benen te oefenen. Deze blokken vervangen deels midweekse zware marathonpace/intervalbelasting; ze komen er niet zomaar bovenop."
        ),
      ];
    }
    if (phaseId === "fase-5") {
      return [infoBlock("Voeding/hydratatie", "Nog een keer marathondag-voeding rustig oefenen. Geen nieuwe producten testen en niet overdrijven.")];
    }
    return [];
  }

  function parseLocalDate(iso) {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function addDays(iso, days) {
    const date = parseLocalDate(iso);
    date.setDate(date.getDate() + days);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }

  function weekDates(calendarWeek) {
    const offset = (calendarWeek - APP_CONFIG.startCalendarWeek) * 7;
    return {
      startDate: addDays(APP_CONFIG.startDate, offset),
      endDate: addDays(APP_CONFIG.startDate, offset + 6),
    };
  }

  function makeWeek(phaseId, calendarWeek, label, sessions) {
    const dates = weekDates(calendarWeek);
    return {
      phaseId,
      calendarWeek,
      label,
      startDate: dates.startDate,
      endDate: dates.endDate,
      sessions: sessions.map((item, index) => ({ ...item, sessionNumber: index + 1 })),
    };
  }

  const F1_RUN1 = {
    22: cardio("Easy Run", "20 min op 9,5 km/u", {
      outdoor: "20 min rustig, praten in zinnen mogelijk.",
      notes: "0% incline, optioneel 1%.",
    }),
    23: cardio("Easy Run", "25 min op 9,5 km/u", { outdoor: "25 min rustig.", notes: "0% incline, optioneel 1%." }),
    24: cardio("Easy Run", "25 min op 9,5 km/u", { outdoor: "25 min rustig.", notes: "0% incline, optioneel 1%." }),
    25: cardio("Easy Run", "30 min op 9,5 km/u", { outdoor: "30 min rustig.", notes: "0% incline, optioneel 1%." }),
    26: cardio("Easy Run", "25-30 min op 9,5 km/u", { outdoor: "25-30 min rustig.", notes: "0% incline, optioneel 1%." }),
  };

  const F1_RUN2 = {
    22: cardio("3:30-tempo-intro", "5 min 9,5 km/u; 3 x 2 min 11,5 km/u; 2 min herstel 9,5 km/u na elk snel blok; 5 min uitlopen 9,5 km/u", {
      outdoor: "Rustig inlopen, 3 korte blokken hard maar gecontroleerd, na elk blok rustig herstellen.",
    }),
    23: cardio("3:30-tempo-intro", "5 min 9,5 km/u; 4 x 2 min 11,8 km/u; 2 min herstel 9,5 km/u na elk snel blok; 5 min uitlopen 9,5 km/u", {
      outdoor: "4 korte blokken op 3:30-tempo-gevoel, stevig maar technisch netjes.",
    }),
    24: cardio("3:30-tempo-intro", "5 min 9,5 km/u; 4 x 2 min 12,0 km/u; 2 min herstel 9,5 km/u na elk snel blok; 5 min uitlopen 9,5 km/u", {
      outdoor: "4 korte snelle blokken, gecontroleerde snelheid, geen test.",
    }),
    25: cardio("3:30-tempo-intro", "5 min 9,5 km/u; 3 x 3 min 12,0 km/u; 3 min herstel 9,5 km/u na elk snel blok; 5 min uitlopen 9,5 km/u", {
      outdoor: "3 blokken van 3 minuten hard maar beheerst, na elk blok rustig herstellen.",
    }),
    26: cardio("3:30-tempo-intro", "5 min 9,5 km/u; 4 x 3 min 12,0 km/u; 2 min herstel 9,5 km/u na elk snel blok; 5 min uitlopen 9,5 km/u", {
      outdoor: "4 blokken van 3 minuten op 3:30-tempo-gevoel, eindigen met iets over.",
    }),
  };

  const F2_RUN1 = {
    27: cardio("Easy Run", "30 min op 9,5 km/u", { outdoor: "30 min rustig, praten in zinnen mogelijk.", notes: "0% incline, optioneel 1%." }),
    28: cardio("Easy Run", "30 min op 9,5 km/u", { outdoor: "30 min rustig.", notes: "0% incline, optioneel 1%." }),
  };

  const F2_RUN2 = {
    27: cardio("3:30 Marathonpace Intro", "8 min 9,5 km/u; 4 x 3 min 11,8-12,0 km/u; 3 min herstel 9,5 km/u na elk blok; 5 min uitlopen 9,5 km/u", {
      outdoor: "4 blokken van 3 minuten hard maar gecontroleerd, geen sprint.",
    }),
    28: cardio("3:30 Marathonpace Intro", "8 min 9,5 km/u; 3 x 5 min 11,8-12,0 km/u; 3 min herstel 9,5 km/u na elk blok; 5 min uitlopen 9,5 km/u", {
      outdoor: "3 blokken van 5 minuten op 3:30-tempo-gevoel, eindigen met iets over.",
    }),
  };

  const F2_RUN3 = {
    27: cardio("Easy Run", "30 min op 9,5 km/u", { outdoor: "30 min rustig.", notes: "0% incline, optioneel 1%." }),
    28: cardio("Easy Run", "30-35 min op 9,5 km/u", { outdoor: "30-35 min rustig.", notes: "0% incline, optioneel 1%." }),
  };

  const F3_RUN1 = {
    29: cardio("Easy Run", "35 min op 9,5 km/u", { outdoor: "Rustig, praten in zinnen mogelijk." }),
    30: cardio("Easy Run", "40 min op 9,5 km/u", { outdoor: "Rustig en ontspannen." }),
    31: cardio("Easy Run", "40 min op 9,5-10,0 km/u", { outdoor: "Rustig, geen tempodruk." }),
    32: cardio("Easy Run", "45 min op 9,5 km/u", { outdoor: "Ontspannen duurloop." }),
    33: cardio("Easy Run", "45 min op 9,5-10,0 km/u", { outdoor: "Rustig tot licht actief." }),
    34: cardio("Easy Run", "50 min op 9,5 km/u", { outdoor: "Rustig, comfortabel." }),
    35: cardio("Easy Run", "50 min op 9,5-10,0 km/u", { outdoor: "Ontspannen, controle houden." }),
    36: cardio("Easy Run", "40-45 min op 9,5 km/u", { outdoor: "Bewust iets lichter." }),
  };

  const F3_RUN2 = {
    29: cardio("3:30 Marathonpace Run", "8 min 9,5; 5 min 10,5; 3 min 9,5; 3 x 4 min 11,8; 3 min herstel 9,5 tussen blokken; 5 min uitlopen 9,5", { outdoor: "3 korte blokken op 3:30-tempo-gevoel, hard maar gecontroleerd." }),
    30: cardio("3:30 Marathonpace Run", "8 min 9,5; 6 min 10,5; 3 min 9,5; 3 x 5 min 11,8-12,0; 3 min herstel; 5 min uitlopen", { outdoor: "3 langere blokken op 3:30-tempo-gevoel." }),
    31: cardio("3:30 Marathonpace Run", "8 min 9,5; 8 min 10,5; 3 min 9,5; 2 x 8 min 11,8-12,0; 4 min herstel; 5 min uitlopen", { outdoor: "2 stevige blokken op 3:30-tempo-gevoel." }),
    32: cardio("3:30 Marathonpace Run", "8 min 9,5; 8 min 10,5; 3 min 9,5; 3 x 6 min 12,0; 3 min herstel; 5 min uitlopen", { outdoor: "3 blokken op 3:30-tempo-gevoel voor controle, ritme en vertrouwen." }),
    33: cardio("3:30 Marathonpace Run", "8 min 9,5; 10 min 10,5; 4 min 9,5; 2 x 10 min 11,8-12,0; 4 min herstel; 5 min uitlopen", { outdoor: "2 langere blokken op 3:30-tempo-gevoel, moe maar niet gesloopt." }),
    34: cardio("3:30 Marathonpace Run", "8 min 9,5; 10 min 10,5-11,0; 4 min 9,5; 15 min 11,8-12,0; 5 min 9,5; 8 min 12,0; 5 min uitlopen", { outdoor: "Een langer blok, herstel, daarna een korter stevig blok." }),
    35: cardio("3:30 Marathonpace Run", "8 min 9,5; 12 min 10,5-11,0; 4 min 9,5; 20 min 11,8-12,0; 5 min 9,5; 8 min 12,0-12,1; 5 min uitlopen", { outdoor: "Serieuze training met lang blok, herstel en korter stevig blok." }),
    36: cardio("3:30 Marathonpace Run", "8 min 9,5; 8 min 10,5; 3 min 9,5; 2 x 6 min 11,8-12,0; 3 min herstel; 5 min uitlopen", { outdoor: "Kortere blokken; fris genoeg blijven voor de piekfase." }),
  };

  const F3_RUN3 = {
    29: cardio("Long Run", "60 min op 9,5-10,0 km/u", { outdoor: "Rustige duurloop, praten mogelijk." }),
    30: cardio("Long Run", "70 min op 9,5-10,0 km/u", { outdoor: "Rustig, comfortabel." }),
    31: cardio("Long Run", "80 min op 9,5-10,0 km/u", { outdoor: "Ontspannen lang lopen." }),
    32: cardio("Long Run", "90 min op 9,5-10,0 km/u", { outdoor: "Rustig, niet forceren." }),
    33: cardio("Long Run", "100 min op 9,5-10,0 km/u", { outdoor: "Rustige lange duurloop.", notes: "Optioneel fast finish: laatste 10 min naar 10,5 km/u." }),
    34: cardio("Long Run", "110 min op 9,5-10,0 km/u", { outdoor: "Lang, beheerst, comfortabel.", notes: "Optioneel fast finish: laatste 10 min naar 10,5-11,0 km/u." }),
    35: cardio("Long Run", "115-120 min op 9,5-10,0 km/u", { outdoor: "Langste duurloop van deze fase.", notes: "Optioneel fast finish: laatste 10-15 min naar 10,5-11,0 km/u." }),
    36: cardio("Long Run", "85-90 min op 9,5 km/u", { outdoor: "Lichtere long run.", notes: "Geen fast finish." }),
  };

  const F4_RUN1 = {
    37: cardio("Easy Run", "45 min op 9,5-10,0 km/u", { outdoor: "Rustig, praten in zinnen mogelijk." }),
    38: cardio("Easy Run", "50 min op 9,5-10,0 km/u", { outdoor: "Rustig en ontspannen." }),
    39: cardio("Easy Run", "50 min op 9,5-10,0 km/u", { outdoor: "Rustig, geen prestatiedruk." }),
    40: cardio("Easy Run", "40-45 min op 9,5 km/u", { outdoor: "Cutback, extra rustig." }),
    41: cardio("Easy Run", "55 min op 9,5-10,0 km/u", { outdoor: "Ontspannen duurloop." }),
    42: cardio("Easy Run", "55-60 min op 9,5-10,0 km/u", { outdoor: "Rustig, comfortabel." }),
    43: cardio("Easy Run", "45-50 min op 9,5 km/u", { outdoor: "Licht houden." }),
    44: cardio("Easy Run", "40-45 min op 9,5 km/u", { outdoor: "Rustig, fris blijven." }),
  };

  const F4_RUN2 = {
    37: cardio("3:30 Marathonpace Run", "10 min 9,5; 10 min 10,5; 5 min 9,5; 2 x 12 min 11,8-12,0; 5 min herstel; 5 min uitlopen", { outdoor: "2 lange blokken op 3:30-tempo-gevoel." }),
    38: cardio("3:30 Marathonpace Run", "10 min 9,5; 12 min 10,5-11,0; 5 min 9,5; 15 min 11,8-12,0; 5 min 9,5; 10 min 12,0; 5 min uitlopen", { outdoor: "Lang blok, herstel, daarna korter stevig blok." }),
    39: cardio("Easy Run + korte strides", "45 min easy op 9,5-10,0 km/u; daarna 4 x 20 sec soepel versnellen; ruim herstel tussendoor", {
      outdoor: "Rustig lopen, daarna 4 korte soepele versnellingen. Geen zware 12 km/u-blokken deze week.",
      notes: "Doel: herstel, souplesse en techniek behouden zonder de week te zwaar te maken.",
    }),
    40: cardio("3:30 Marathonpace Run", "10 min 9,5; 10 min 10,5; 5 min 9,5; 12 min 11,8-12,0; 5 min uitlopen", { outdoor: "Cutback: korter en gecontroleerd." }),
    41: cardio("Korte 3:30-marathontempo Run", "10 min easy; 2 x 8 min op 11,8-12,0 km/u; 4 min rustig herstel; verder easy uitlopen", {
      outdoor: "Maximaal 2 x 8 min op 3:30-marathontempo. Verder easy, geen extra intervalbelasting.",
      notes: "Korter gehouden omdat de long run deze week al racespecifiek is.",
    }),
    42: cardio("Easy Run + korte techniekblokken", "40-45 min easy op 9,5-10,0 km/u; optioneel 4 x 20 sec soepel versnellen", {
      outdoor: "Rustig en technisch. Geen extra lange marathonpace-run midweek.",
      notes: "Doel: fris genoeg zijn voor de 28 km generale repetitie.",
    }),
    43: cardio("3:30 Marathonpace Run", "10 min 9,5; 20 min 10,5-11,0; 5 min 9,5; 25 min 11,8-12,0; 5 min uitlopen", { outdoor: "Nog een sterke marathonpace-prikkel, gecontroleerd." }),
    44: cardio("3:30 Marathonpace Run", "10 min 9,5; 10 min 10,5; 5 min 9,5; 15 min 11,8-12,0; 5 min uitlopen", { outdoor: "Kort, scherp en gecontroleerd; fris blijven voor taper." }),
  };

  const F4_RUN3 = {
    37: cardio("Tempo / Interval Run", "10 min 9,5; 4 x 3 min 13,0 km/u; 3 min herstel 9,5; 5 min uitlopen", { outdoor: "4 korte snelle blokken, zwaar maar beheerst." }),
    38: cardio("Tempo / Interval Run", "10 min 9,5; 5 x 3 min 13,0 km/u; 3 min herstel 9,5; 5 min uitlopen", { outdoor: "5 snelle blokken, sneller dan marathontempo maar niet maximaal." }),
    39: cardio("Tempo / Interval Run", "10 min 9,5; 4 x 4 min 12,8-13,0 km/u; 3 min herstel 9,5; 5 min uitlopen", { outdoor: "4 langere snelle blokken, technisch netjes." }),
    40: cardio("Tempo / Interval Run", "10 min 9,5; 3 x 3 min 12,8-13,0 km/u; 3 min herstel 9,5; 5 min uitlopen", { outdoor: "Cutback: kort en scherp, niet diep gaan." }),
    41: cardio("Tempo / Interval Run", "10 min 9,5; 5 x 4 min 12,8-13,0 km/u; 3 min herstel 9,5; 5 min uitlopen", { outdoor: "5 stevige blokken sneller dan marathontempo." }),
    42: cardio("Easy Run + strides", "35-45 min easy op 9,5-10,0 km/u; 4 x 20 sec soepel versnellen; ruim herstel", {
      outdoor: "Geen zware intervaltraining deze week. Alleen souplesse en ritme.",
      notes: "Deze prikkel vervangt de zware kwaliteitstraining zodat de long run de hoofdtraining blijft.",
    }),
    43: cardio("Tempo / Interval Run", "10 min 9,5; 6 x 3 min 13,0-13,5 km/u; 2-3 min herstel 9,5; 5 min uitlopen", { outdoor: "6 korte snelle blokken, zwaar en scherp, geen sprint." }),
    44: cardio("Tempo / Interval Run", "10 min 9,5; 4 x 3 min 12,8-13,0 km/u; 3 min herstel 9,5; 5 min uitlopen", { outdoor: "Laatste lichte kwaliteitstraining voor taper.", notes: "Bij bovenbeen/heupzeur: vervangen door 30-45 min steady op 10,5-11,0 km/u." }),
  };

  const F4_RUN4 = {
    37: cardio("Long Run", "20 km op 9,5-10,0 km/u", { outdoor: "Lange rustige duurloop." }),
    38: cardio("Long Run", "22 km op 9,5-10,0 km/u", { outdoor: "Lang en comfortabel." }),
    39: cardio("Long Run 24 km met 2 × 3 km marathontempo", "10 km rustig op 9,5-10,0; 3 km op 11,8-12,0; 1 km rustig herstel; 3 km op 11,8-12,0; 7 km rustig uitlopen", {
      outdoor: "24 km totaal met 6 km rond 3:30-marathontempo. Eerste echte marathonpace-long-run.",
      notes: "Doel: leren dat MP controleerbaar blijft nadat je al een tijdje onderweg bent.",
    }),
    40: cardio("Long Run 18-20 km rustig", "18-20 km rustig op 9,5 km/u of ontspannen buitenvariant", {
      outdoor: "Cutbackweek: volledig rustig, geen marathontempo en geen fast finish.",
      notes: "Niet compenseren, niet harder maken. Belasting van week 39 verwerken.",
    }),
    41: cardio("Long Run 26 km met progressieve finish richting marathontempo", "Standaard: 18 km rustig; 2 km steady op 10,8-11,2; 6 km op 11,8-12,0. Sterker: 16 km rustig; 2 km steady; 8 km op 11,8-12,0", {
      outdoor: "26 km totaal met 6–8 km rond 3:30-marathontempo aan het einde.",
      notes: "Als je lichaam niet goed voelt, maak je het progressieve deel steady in plaats van marathontempo.",
    }),
    42: cardio("Long Run 28 km met 10–12 km marathontempo", "Standaard: 12 km rustig; 4 km steady op 10,8-11,2; 10 km op 11,8-12,0; 2 km uitlopen. Agressiever: 10 km rustig; 4 km steady; 12 km MP; 2 km uitlopen", {
      outdoor: "Belangrijkste generale repetitie: 28 km totaal met 10–12 km rond 3:30-marathontempo.",
      notes: "Geen volledige marathontest, wel een stevige vertrouwenstraining.",
    }),
    43: cardio("Long Run 30–32 km rustig", "30–32 km rustig op 9,5-10,0 km/u", {
      outdoor: "Langste duurloop, geen verplicht marathontempo en geen verplichte fast finish.",
      notes: "Belasting zit in de afstand: duurvermogen, mentale hardheid, voeding en hydratatie oefenen.",
    }),
    44: cardio("Long Run 22–24 km met optioneel 6 km marathontempo", "Standaard: 22–24 km rustig op 9,5-10,0. Optie bij goed herstel: 12–14 km rustig; 6 km op 11,8-12,0; resterend rustig uitlopen", {
      outdoor: "Geen testweek. Alleen marathontempo toevoegen als week 42 en 43 goed verteerd zijn.",
      notes: "Bij vermoeidheid volledig rustig houden.",
    }),
  };

  const upperA = () => [
    exercise("Machine Chest Press", "3×6-10"),
    exercise("Chest-Supported Row Machine", "3×8-12"),
    exercise("Shoulder Press Machine", "2×8-12"),
    exercise("Pec Deck of Cable Fly", "2×10-15"),
    exercise("Rear Delt Fly Machine", "2×12-20"),
    exercise("Face Pull", "2×12-20"),
    exercise("Brachialis Rehab — Hammer Curl Isometric Hold", "2×20-30 sec/arm"),
  ];

  const lowerA = () => [
    exercise("Leg Press", "3×8-12"),
    exercise("Hip Thrust Machine", "3×8-12"),
    exercise("Bulgarian Split Squat", "2×8-10/been"),
    exercise("Back Extension Machine", "2×10-15"),
    exercise("Calf Raise", "3×10-15"),
    exercise("Tibialis Raise tegen de muur", "2-3×15-25"),
    exercise("Heupmobiliteit", "3-5 min"),
  ];

  const upperB = () => [
    exercise("Machine Chest Press of Incline Machine Press", "3×8-12"),
    exercise("Low Row Machine", "3×8-12"),
    exercise("Dips", "2×6-10"),
    exercise("Lateral Raise", "2×12-20"),
    exercise("Rear Delt Fly Machine", "2×12-20"),
    exercise("Pallof Press", "2×10-12/kant"),
    exercise("Brachialis Rehab — Hammer Curl Isometric Hold", "2×20-30 sec/arm"),
  ];

  const lowerB = () => [
    exercise("Hack Squat — testblok", "2×8-10"),
    exercise("Reverse Lunge", "2×8-10/been"),
    exercise("Leg Extension", "2×10-15"),
    exercise("Hip Thrust Machine", "2×8-12"),
    exercise("Calf Raise", "3×10-15"),
    exercise("Tibialis Raise tegen de muur", "2×15-25"),
    exercise("Landmine Rotation", "2×8-12/kant"),
    exercise("Side Plank", "2×30-45 sec/kant"),
  ];

  const upperC = () => [
    exercise("Machine Chest Press", "3×6-10"),
    exercise("Chest-Supported Row Machine", "3×8-12"),
    exercise("Dumbbell Shoulder Press of Shoulder Press Machine", "2×8-12"),
    exercise("Cable Fly", "2×10-15"),
    exercise("Face Pull", "2×12-20"),
    exercise("External Rotation — elleboog op knie met dumbbell", "2×12-15/kant", {
      inputType: "weight-reps",
      weightRange: { min: 0, max: 25, step: 0.5 },
      info: "Rotator cuff, schoudercontrole en voorkant-schouderklachten voorkomen.",
      tips: "Licht en technisch.",
      warning: "Niet zwaar maken.",
      alternatives: ["Face Pull"],
    }),
    exercise("Brachialis Rehab — Hammer Curl Isometric Hold", "2×20-30 sec/arm"),
  ];

  const lowerC = (core = "Dead Bug") => [
    exercise("Leg Press", "3×8-12"),
    exercise("Romanian Deadlift", "2×6-10"),
    exercise("Walking Lunge", "2×10-12 stappen/been"),
    exercise("Back Extension Machine", "2×10-15"),
    exercise("Calf Raise", "3×10-15"),
    exercise("Tibialis Raise tegen muur", "2-3×15-25"),
    exercise(core, core === "Side Plank" ? "2×30-45 sec/kant" : "2×8-12/kant"),
  ];

  const upperD = () => [
    exercise("Shoulder Press Machine", "3×8-12"),
    exercise("Low Row Machine", "3×8-12"),
    exercise("Pec Deck", "2×10-15"),
    exercise("Dips", "2×6-10"),
    exercise("Rear Delt Fly Machine", "2×12-20"),
    exercise("Pallof Press of Cable Woodchop", "2×10-12/kant"),
    exercise("Brachialis Rehab — Hammer Curl Isometric Hold", "2×20-30 sec/arm"),
  ];

  const lowerD = () => [
    exercise("Hack Squat — testblok", "2×8-10"),
    exercise("Bulgarian Split Squat", "2×8-10/been"),
    exercise("Hip Thrust Machine", "3×8-12"),
    exercise("Leg Extension", "2×10-15"),
    exercise("Calf Raise", "3×10-15"),
    exercise("Tibialis Raise tegen de muur", "2×15-25"),
    exercise("Farmer's Carry", "3×30-45 m"),
    exercise("Ab Wheel of Side Plank", "2 sets"),
  ];

  const miniStrengthA = () => [
    exercise("Hip Thrust Machine", "2×8-12"),
    exercise("Chest-Supported Row Machine", "2×8-12"),
    exercise("Machine Chest Press", "2×8-12"),
    exercise("Calf Raise", "2×12-15"),
    exercise("Tibialis Raise tegen muur", "2×15-25"),
    exercise("Dead Bug", "2×8-12/kant"),
    exercise("Brachialis Isometric Hold", "1-2×20-30 sec/arm"),
  ];

  const miniStrengthB = () => [
    exercise("Hip Thrust Machine", "2×8-12"),
    exercise("Machine Chest Press", "2×8-12"),
    exercise("Rear Delt Fly Machine", "2×12-20"),
    exercise("Reverse Lunge", "2×8/been"),
    exercise("Calf Raise", "2×12-15"),
    exercise("Tibialis Raise tegen muur", "2×15-25"),
    exercise("Landmine Rotation", "2×8-10/kant"),
  ];

  const fullBodyA = () => [
    exercise("Machine Chest Press", "2×8-12"),
    exercise("Low Row Machine", "2×8-12"),
    exercise("Hip Thrust Machine", "2×8-12"),
    exercise("Reverse Lunge", "2×8/been"),
    exercise("Lateral Raise", "2×12-20"),
    exercise("Pallof Press", "2×10-12/kant"),
    exercise("Calf Raise + Tibialis Raise Superset", "2 rondes"),
    exercise("Brachialis Isometric Hold", "1-2×20-30 sec/arm"),
  ];

  const fullBodyB = () => [
    exercise("Machine Chest Press", "2×8-12"),
    exercise("Chest-Supported Row Machine", "2×8-12"),
    exercise("Leg Press", "2×8-12"),
    exercise("Back Extension Machine", "2×10-15"),
    exercise("Pec Deck of Cable Fly", "2×10-15"),
    exercise("Landmine Rotation", "2×8-10/kant"),
    exercise("Side Plank", "2×30-45 sec/kant"),
    exercise("Calf Raise or Tibialis Raise", "2×15-25", {
      inputType: "reps-only",
      info: "Kies wat die week het meest nodig voelt.",
      tips: "Rustig en gecontroleerd.",
      warning: "Bij peesgevoeligheid licht houden.",
      alternatives: ["Calf Raise", "Tibialis Raise"],
    }),
  ];

  const peakLowerA = () => [
    exercise("Leg Press", "2-3×8-10"),
    exercise("Hip Thrust Machine", "2-3×8-12"),
    exercise("Bulgarian Split Squat", "2×8/been"),
    exercise("Back Extension Machine", "2×10-15"),
    exercise("Calf Raise", "3×10-15"),
    exercise("Tibialis Raise tegen muur", "3×15-25"),
    exercise("Heupmobiliteit", "3-5 min"),
  ];

  const peakLowerB = () => [
    exercise("Leg Press of Hack Squat Test", "2-3×8-10"),
    exercise("Romanian Deadlift", "2×6-8"),
    exercise("Walking Lunge", "2×10 stappen/been"),
    exercise("Hip Thrust Machine", "2×8-12"),
    exercise("Calf Raise", "3×10-15"),
    exercise("Tibialis Raise tegen muur", "3×15-25"),
    exercise("Dead Bug", "2×8-12/kant"),
  ];

  const f5Week45Upper = () => [
    exercise("Machine Chest Press", "2×8-10"),
    exercise("Chest-Supported Row Machine", "2×8-10"),
    exercise("Shoulder Press Machine", "1-2×8-10"),
    exercise("Rear Delt Fly Machine", "2×12-15"),
    exercise("Face Pull", "2×12-15"),
    exercise("Brachialis Isometric Hold", "1-2×20 sec/arm"),
  ];

  const f5Week45Lower = () => [
    exercise("Leg Press", "2×8-10"),
    exercise("Hip Thrust Machine", "2×8-10"),
    exercise("Back Extension Machine", "1-2×10-12"),
    exercise("Calf Raise", "2×10-12"),
    exercise("Tibialis Raise tegen muur", "2×15-20"),
    exercise("Heupmobiliteit", "3-5 min"),
  ];

  const f5Week46Full = () => [
    exercise("Machine Chest Press", "2×8"),
    exercise("Chest-Supported Row Machine", "2×8"),
    exercise("Hip Thrust Machine", "1-2×8"),
    exercise("Rear Delt Fly Machine", "2×12"),
    exercise("Calf Raise", "2×10"),
    exercise("Tibialis Raise", "2×15"),
    exercise("Dead Bug of Side Plank", "1-2 sets", {
      inputType: "reps-or-seconds",
      info: "Lichte core. Je moet na afloop beter voelen dan ervoor.",
      tips: "Rustig en technisch.",
      warning: "Geen vermoeidheid najagen.",
      alternatives: ["Dead Bug", "Side Plank"],
    }),
  ];

  const activationGym = () => [
    exercise("Machine Chest Press", "1-2 lichte sets×8"),
    exercise("Chest-Supported Row Machine", "1-2 lichte sets×8"),
    exercise("Calf Raise", "1-2 lichte sets×10"),
    exercise("Tibialis Raise", "1-2 lichte sets×15"),
    exercise("Dead Bug", "1-2 lichte sets"),
    exercise("Heupmobiliteit", "3-5 min"),
  ];

  const f6FullA = () => [
    exercise("Machine Chest Press", "2×8-10"),
    exercise("Chest-Supported Row Machine", "2×8-10"),
    exercise("Leg Press", "2×10"),
    exercise("Hip Thrust Machine", "2×10"),
    exercise("Rear Delt Fly Machine", "2×12-15"),
    exercise("Calf Raise", "1-2×10-12"),
    exercise("Tibialis Raise", "1-2×15"),
    exercise("Dead Bug", "2 rustige sets"),
  ];

  const f6FullB = () => [
    exercise("Shoulder Press Machine", "2×8-10"),
    exercise("Low Row Machine or Chest-Supported Row", "2×8-10", {
      weightRange: { min: 0, max: 140, step: 0.5 },
      info: "Lichte rugprikkel in week 49.",
      tips: "Kies de pijnvrije variant.",
      warning: "Geen zware rows als brachialis of rhomboid reageert.",
      alternatives: ["Low Row Machine", "Chest-Supported Row Machine"],
    }),
    exercise("Back Extension Machine", "2×10-12"),
    exercise("Pec Deck or Cable Fly", "2×10-12", {
      weightRange: { min: 0, max: 80, step: 0.5 },
      info: "Lichte borstaccessoire.",
      tips: "Rustig en pijnvrij.",
      warning: "Geen extreme stretch.",
      alternatives: ["Pec Deck", "Cable Fly"],
    }),
    exercise("Reverse Lunge", "1-2×6-8/been"),
    exercise("Side Plank", "2×20-30 sec/kant"),
    exercise("Heupmobiliteit", "5 min"),
  ];

  const f6Week50Upper = () => [
    exercise("Machine Chest Press", "3×8-10"),
    exercise("Chest-Supported Row Machine", "3×8-12"),
    exercise("Shoulder Press Machine", "2×8-10"),
    exercise("Pec Deck or Cable Fly", "2×10-15", {
      weightRange: { min: 0, max: 80, step: 0.5 },
      info: "Borstaccessoire, matig en gecontroleerd.",
      tips: "Geen extreme stretch.",
      warning: "Stop bij schouderpijn.",
      alternatives: ["Pec Deck", "Cable Fly"],
    }),
    exercise("Rear Delt Fly Machine", "2×12-15"),
    exercise("Face Pull", "2×12-15"),
    exercise("Brachialis Isometric Hold", "1-2×20 sec"),
  ];

  const f6Week50Lower = () => [
    exercise("Leg Press", "3×8-10"),
    exercise("Hip Thrust Machine", "3×8-10"),
    exercise("Back Extension Machine", "2×10-12"),
    exercise("Reverse Lunge", "2×8/been"),
    exercise("Calf Raise", "2-3×10-12"),
    exercise("Tibialis Raise", "2×15-20"),
    exercise("Dead Bug", "2 sets"),
  ];

  function f1Sessions(calendarWeek, variant) {
    const phaseId = "fase-1";
    if (variant === "A") {
      return [
        session(1, "Upper A + Easy Run", "hybride", upperA(), F1_RUN1[calendarWeek], { phaseId, goal: "Borst, rug en schouders zonder brachialisirritatie + rustige loopbasis." }),
        session(2, "Lower A — Leg Press Focus", "kracht", lowerA(), null, { phaseId, goal: "Sterke benen en billen, heupcontrole, kuit/tibialis/enkel." }),
        session(3, "Upper B + 3:30-tempo-intro", "hybride", upperB(), F1_RUN2[calendarWeek], { phaseId, goal: "Upper body + korte blokken richting 3:30-marathontempo." }),
        session(4, "Lower B — Runner Legs + Core", "kracht", lowerB(), null, { phaseId, goal: "Runner legs, heupcontrole, core, enkels en kuiten." }),
      ];
    }
    return [
      session(1, "Upper C + Easy Run", "hybride", upperC(), F1_RUN1[calendarWeek], { phaseId, goal: "Upper-variatie + rustige easy run." }),
      session(2, "Lower C — Posterior Chain + Runner Legs", "kracht", lowerC("Dead Bug"), null, { phaseId, goal: "Benen, billen, hamstrings en posterior chain zonder leg curl." }),
      session(3, "Upper D + 3:30-tempo-intro", "hybride", upperD(), F1_RUN2[calendarWeek], { phaseId, goal: "Schouders, borst, rug en core + gecontroleerde snelheid." }),
      session(4, "Lower D — Hack Test + Stability", "kracht", lowerD(), null, { phaseId, goal: "Hack squat testen, single-leg kracht, heupcontrole, enkelstabiliteit en core." }),
    ];
  }

  function f2Sessions(calendarWeek) {
    const phaseId = "fase-2";
    if (calendarWeek === 27) {
      return [
        session(1, "Upper A + Easy Run", "hybride", upperA(), F2_RUN1[27], { phaseId }),
        session(2, "Lower A — Leg Press Focus", "kracht", lowerA().map((item) => item.id === "tibialis-raise-tegen-de-muur" ? exercise("Tibialis Raise tegen muur", "3×15-25") : item), null, { phaseId }),
        session(3, "Upper B + 3:30 Marathonpace Intro", "hybride", upperB(), F2_RUN2[27], { phaseId }),
        session(4, "Easy Run + Mini Strength A", "hybride", miniStrengthA(), F2_RUN3[27], { phaseId, warmup: "Hardlopen mag de warming-up zijn; 500 meter roeien kan ook." }),
      ];
    }
    return [
      session(1, "Upper C + Easy Run", "hybride", upperC(), F2_RUN1[28], { phaseId }),
      session(2, "Lower C — Posterior Chain + Runner Legs", "kracht", lowerC("Side Plank").map((item) => item.id === "tibialis-raise-tegen-muur" ? exercise("Tibialis Raise tegen muur", "3×15-25") : item), null, { phaseId }),
      session(3, "Upper D + 3:30 Marathonpace Intro", "hybride", upperD(), F2_RUN2[28], { phaseId }),
      session(4, "Easy Run + Mini Strength B", "hybride", miniStrengthB(), F2_RUN3[28], { phaseId, warmup: "Hardlopen mag de warming-up zijn; 500 meter roeien kan ook." }),
    ];
  }

  function f3Sessions(calendarWeek) {
    const phaseId = "fase-3";
    const isA = [29, 31, 33, 35].includes(calendarWeek);
    return [
      session(1, isA ? "Gym 1 — Upper Strength A" : "Gym 1 — Upper Strength B", "kracht", isA ? upperA() : [
        exercise("Shoulder Press Machine", "3×8-12"),
        exercise("Machine Chest Press", "3×8-12"),
        exercise("Chest-Supported Row Machine", "3×8-12"),
        exercise("Dips", "2×6-10"),
        exercise("Rear Delt Fly Machine", "2×12-20"),
        exercise("External Rotation — elleboog op knie met dumbbell", "2×12-15/kant", { weightRange: { min: 0, max: 25, step: 0.5 } }),
        exercise("Brachialis Rehab — Hammer Curl Isometric Hold", "2×20-30 sec/arm"),
      ], null, { phaseId }),
      session(2, "Run 1 — Easy Run", "run", [], F3_RUN1[calendarWeek], { phaseId, warmup: "Rustig starten.", goal: "Rustige kilometers en herstelvermogen." }),
      session(3, isA ? "Gym 2 — Lower Strength A" : "Gym 2 — Lower Strength B", "kracht", isA ? lowerA().map((item) => item.id === "tibialis-raise-tegen-de-muur" ? exercise("Tibialis Raise tegen de muur", "3×15-25") : item) : [
        exercise("Leg Press of Hack Squat Test", "3×8-12"),
        exercise("Romanian Deadlift", "2×6-10"),
        exercise("Walking Lunge", "2×10-12 stappen/been"),
        exercise("Hip Thrust Machine", "2×8-12"),
        exercise("Calf Raise", "3×10-15"),
        exercise("Tibialis Raise tegen muur", "3×15-25"),
        exercise("Dead Bug", "2×8-12/kant"),
      ], null, { phaseId, notes: "Plan lower strength liever niet direct voor de long run." }),
      session(4, "Run 2 — 3:30 Marathonpace Run", "run", [], F3_RUN2[calendarWeek], { phaseId, warmup: "Rustig inlopen volgens blok.", goal: "12 km/u gecontroleerd leren vasthouden." }),
      session(5, isA ? "Gym 3 — Full Body Maintenance A" : "Gym 3 — Full Body Maintenance B", "kracht", isA ? fullBodyA() : fullBodyB(), null, { phaseId, notes: "Compacte onderhoudsprikkel; houd genoeg over voor de long run." }),
      session(6, "Run 3 — Long Run", "long-run", [], F3_RUN3[calendarWeek], {
        phaseId,
        warmup: "Rustig starten.",
        goal: "Duurvermogen en marathonmotor opbouwen.",
        infoBlocks: longRunInfo(phaseId, calendarWeek),
      }),
    ];
  }

  function f4Sessions(calendarWeek) {
    const phaseId = "fase-4";
    const isA = [37, 39, 41, 43].includes(calendarWeek);
    const run2 = F4_RUN2[calendarWeek];
    const run3 = F4_RUN3[calendarWeek];
    const longRun = F4_RUN4[calendarWeek];
    const run2Goal = [39, 42].includes(calendarWeek)
      ? "Herstel, souplesse en techniek bewaren zonder extra zware marathonpace-belasting."
      : calendarWeek === 41
        ? "Kort marathontempo vasthouden, maar de week niet stapelen."
        : "12 km/u steeds normaler laten voelen.";
    const run3Goal = calendarWeek === 42
      ? "Fris blijven voor de belangrijkste generale repetitie."
      : "Snelheidsreserve bouwen boven marathontempo.";
    const lowerNote = calendarWeek === 42
      ? "Week 42: onderhoudend houden. Geen zware benen maken voor de 28 km generale repetitie."
      : isA && calendarWeek === 43
        ? "Week 43: houd lower body kort/licht als je 30–32 km loopt."
        : "Niet vlak voor de long run plannen.";
    const fullBodyNote = calendarWeek === 42
      ? "Optioneel en licht houden. De 28 km long run is deze week de hoofdtraining."
      : "3e gym is optioneel als herstel goed is. Houd hem compact zodat tempo en long run goed blijven.";
    return [
      session(1, isA ? "Gym 1 — Upper Maintenance A" : "Gym 1 — Upper Maintenance B", "kracht", isA ? upperA() : [
        exercise("Shoulder Press Machine", "2-3×8-12"),
        exercise("Machine Chest Press", "3×8-12"),
        exercise("Chest-Supported Row Machine", "3×8-12"),
        exercise("Dips", "2×6-10"),
        exercise("Rear Delt Fly Machine", "2×12-20"),
        exercise("External Rotation — elleboog op knie met dumbbell", "2×12-15/kant", { weightRange: { min: 0, max: 25, step: 0.5 } }),
        exercise("Brachialis Rehab — Hammer Curl Isometric Hold", "2×20-30 sec/arm"),
      ], null, { phaseId, goal: "Onderhoud voor borst, rug en schouders." }),
      session(2, "Run 1 — Easy Run", "run", [], F4_RUN1[calendarWeek], { phaseId, goal: "Rustige kilometers, herstel en aerobe basis." }),
      session(3, isA ? "Gym 2 — Lower Runner Strength A" : "Gym 2 — Lower Runner Strength B", "kracht", isA ? peakLowerA() : peakLowerB(), null, { phaseId, notes: lowerNote }),
      session(4, `Run 2 — ${run2.title}`, "run", [], run2, { phaseId, goal: run2Goal }),
      session(5, isA ? "Gym 3 — Full Body + Core A" : "Gym 3 — Full Body + Core B", "kracht", isA ? fullBodyA() : [
        exercise("Machine Chest Press", "2×8-12"),
        exercise("Chest-Supported Row Machine", "2×8-12"),
        exercise("Leg Press", "2×8-10"),
        exercise("Back Extension Machine", "2×10-15"),
        exercise("Pec Deck of Cable Fly", "2×10-15"),
        exercise("Landmine Rotation", "2×8-10/kant"),
        exercise("Side Plank", "2×30-45 sec/kant"),
        exercise("Tibialis Raise", "2×15-25"),
      ], null, { phaseId, notes: fullBodyNote }),
      session(6, `Run 3 — ${run3.title}`, "run", [], run3, { phaseId, goal: run3Goal }),
      session(7, `Run 4 — ${longRun.title}`, "long-run", [], longRun, {
        phaseId,
        goal: "Marathonmotor, peesbelasting en energiehuishouding.",
        infoBlocks: longRunInfo(phaseId, calendarWeek),
      }),
    ];
  }

  function f5Sessions(calendarWeek) {
    const phaseId = "fase-5";
    if (calendarWeek === 45) {
      return [
        session(1, "Run 1 — Easy Run", "run", [], cardio("Easy Run", "40-45 min op 9,5-10,0 km/u", { outdoor: "Rustige duurloop, praten in zinnen mogelijk.", notes: "0% incline." }), { phaseId }),
        session(2, "Run 2 — Marathonpace Onderhoud", "run", [], cardio("Marathonpace Onderhoud", "10 min 9,5; 8 min 10,5; 5 min 9,5; 2 x 10 min 11,8-12,0; 5 min herstel; 5 min uitlopen", { outdoor: "2 blokken op marathontempo-gevoel, geen test." }), { phaseId }),
        session(3, "Run 3 — Korte Scherpte / Tempo Light", "run", [], cardio("Korte Scherpte", "10 min 9,5; 4 x 2 min 12,5-12,8; 3 min herstel; 5 min uitlopen", { outdoor: "4 korte blokken sneller dan marathontempo, wakker en scherp, niet leeg." }), { phaseId }),
        session(4, "Run 4 — Verkorte Long Run", "long-run", [], cardio("Verkorte Long Run", "16-18 km op 9,5-10,0 km/u", { outdoor: "Rustige lange duurloop, geen fast finish.", notes: "Nog een keer voeding oefenen; geen nieuwe producten." }), {
          phaseId,
          infoBlocks: longRunInfo(phaseId, calendarWeek),
        }),
        session(5, "Gym 1 — Upper Light Maintenance", "kracht", f5Week45Upper(), null, { phaseId, warmup: "500 meter rustig roeien." }),
        session(6, "Gym 2 — Lower Light Maintenance", "kracht", f5Week45Lower(), null, { phaseId, warmup: "500 meter rustig roeien.", notes: "Geen Bulgarian split squat of walking lunge als je snel spierpijn krijgt." }),
      ];
    }
    if (calendarWeek === 46) {
      return [
        session(1, "Run 1 — Easy Run", "run", [], cardio("Easy Run", "35-40 min op 9,5 km/u", { outdoor: "Rustig lopen, praten in zinnen mogelijk.", notes: "0% incline." }), { phaseId }),
        session(2, "Run 2 — Korte Marathonpace Prikkel", "run", [], cardio("Korte Marathonpace Prikkel", "10 min 9,5; 5 min 10,5; 4 min 9,5; 2 x 6 min 11,8-12,0; 4 min herstel; 5 min uitlopen", { outdoor: "2 korte blokken op marathontempo-gevoel. Het moet goed voelen, niet zwaar." }), { phaseId }),
        session(3, "Run 3 — Korte Easy Run met Strides", "run", [], cardio("Easy Run met Strides", "25-30 min op 9,5 km/u; daarna 4 x 20 sec naar 12,5-13,0; 90 sec rustig tussen versnellingen", { outdoor: "25-30 min rustig + 4 korte versnellingen van ongeveer 20 sec, niet sprinten.", notes: "Geen echte long run in week 46." }), { phaseId }),
        session(4, "Gym 1 — Full Body Light", "kracht", f5Week46Full(), null, {
          phaseId,
          warmup: "500 meter rustig roeien.",
          notes: "Alles licht. Je moet na afloop beter voelen dan ervoor.",
          infoBlocks: [
            infoBlock(
              "Optionele mobility/prehab",
              "Eventueel tweede korte mobility/prehab-sessie deze week, maar niet nodig. Alleen doen als je je er beter door voelt; geen vermoeidheid of spierpijn maken."
            ),
          ],
        }),
      ];
    }
    return [
      session(1, "Run 1 — Easy Run + korte prikkel", "run", [], cardio("Easy Run + korte prikkel", "25-30 min op 9,5 km/u; 3 x 1 min op 11,8-12,0; 2 min 9,5 tussen blokken; rustig uitlopen", { outdoor: "Rustig lopen met 3 korte stukjes op marathontempo-gevoel." }), { phaseId }),
      session(2, "Optionele Activatiegym", "kracht", activationGym(), null, { phaseId, warmup: "5-10 min rustig bewegen of 500 meter roeien.", notes: "Logisch vroeg in marathonweek of vóór de shake-out/marathon. Niet doen als je moe, druk of gespannen bent. Geen dips, zware leg press, RDL of split squats." }),
      session(3, "Run 2 — Shake-out Run", "run", [], cardio("Shake-out Run", "15-20 min op 9,5 km/u; eventueel 3 x 20 sec rond 11,8-12,5 met veel rust", { outdoor: "15-20 min heel rustig, eventueel 3 korte versnellingen.", notes: "Bij voorkeur 1-3 dagen voor de marathon." }), { phaseId }),
      session(4, "Run 3 — Marathon", "marathon", [], cardio("Marathon", "Zondag 22 november 2026. A-doel richting 3:30, B-doel sterk finishen rond 3:45.", { outdoor: "Start gecontroleerd, ritme vasthouden, voeding/drinken volgens plan. Na 30–32 km pas denken aan vasthouden of voorzichtig versnellen." }), { phaseId, goal: "Fris aan de start en gecontroleerd lopen." }),
    ];
  }

  function f6Sessions(calendarWeek) {
    const phaseId = "fase-6";
    if (calendarWeek === 48) {
      return [
        session(1, "Herstel — Wandelen en mobiliteit", "herstel", [exercise("Heupmobiliteit", "5-10 min")], cardio("Wandelen / herstel", "1-3 wandelingen van 20-45 min later in de week", { outdoor: "Alles licht. Dag 1-3: wandelen, licht rekken als het goed voelt, geen gym, geen hardlopen." }), { phaseId, warmup: "Rustig bewegen.", goal: "Volledig herstellen van de marathon." }),
        session(2, "Optionele herstelgym", "kracht", [
          exercise("Machine Chest Press", "1-2×10"),
          exercise("Chest-Supported Row Machine", "1-2×10"),
          exercise("Rear Delt Fly Machine", "1-2×12"),
          exercise("Dead Bug", "1-2 rustige sets"),
          exercise("Heupmobiliteit", "5 min"),
        ], null, { phaseId, warmup: "5-10 min rustig bewegen of 500 meter heel rustig roeien.", notes: "Geen lower body kracht. Geen calf raises als kuiten nog pijnlijk zijn. Geen hardlopen." }),
        session(3, "Optioneel — heel rustige jog", "run", [], cardio("Heel rustige jog", "Maximaal 15-20 min heel rustig", { outdoor: "Alleen als benen, heupen, kuiten en enkel uitzonderlijk goed voelen.", notes: "Bij voorkeur niet hardlopen in week 48. Geen tempo." }), { phaseId }),
      ];
    }
    if (calendarWeek === 49) {
      return [
        session(1, "Gym 1 — Full Body Light A", "kracht", f6FullA(), null, { phaseId, warmup: "500 meter rustig roeien." }),
        session(2, "Gym 2 — Full Body Light B", "kracht", f6FullB(), null, { phaseId, warmup: "500 meter rustig roeien." }),
        session(3, "Optionele Gym 3 — Mobility + Pump", "kracht", [
          exercise("Machine Chest Press", "2 lichte sets"),
          exercise("Rear Delt Fly Machine", "2 lichte sets"),
          exercise("Calf Raise", "1-2 lichte sets"),
          exercise("Tibialis Raise", "1-2 lichte sets"),
          exercise("Dead Bug or Side Plank", "2 sets", { inputType: "reps-or-seconds" }),
          exercise("Heupmobiliteit", "5 min"),
        ], null, { phaseId, notes: "Alleen als je goed hersteld bent." }),
        session(4, "Easy Run optie", "run", [], cardio("Easy Run", "1-2 easy runs van 20-30 min op 9,5 km/u", { outdoor: "Praten in zinnen mogelijk.", notes: "Geen tempo, intervals of lange duurloop." }), { phaseId }),
      ];
    }
    if (calendarWeek === 50) {
      return [
        session(1, "Gym 1 — Upper Light/Moderate", "kracht", f6Week50Upper(), null, { phaseId, warmup: "500 meter roeien." }),
        session(2, "Gym 2 — Lower Light/Moderate", "kracht", f6Week50Lower(), null, { phaseId, warmup: "500 meter roeien." }),
        session(3, "Gym 3 — Full Body Moderate", "kracht", [
          exercise("Machine Chest Press", "2×8-12"),
          exercise("Low Row Machine", "2×8-12"),
          exercise("Hip Thrust Machine", "2×8-12"),
          exercise("Leg Press", "2×8-10"),
          exercise("Lateral Raise", "2×12-15"),
          exercise("Pallof Press", "2×10-12/kant"),
          exercise("Calf Raise + Tibialis Raise Superset", "2 rustige rondes"),
        ], null, { phaseId }),
        session(4, "Easy Run optie", "run", [], cardio("Easy Run", "1-2 easy runs van 25-35 min op 9,5 km/u", { outdoor: "Rustig.", notes: "Geen tempo, 12 km/u-blokken of intervals." }), { phaseId }),
      ];
    }
    if (calendarWeek === 51) {
      return [
        session(1, "Upper A", "kracht", upperA().map((item) => item.id === "brachialis-rehab-hammer-curl-isometric-hold" ? exercise("Brachialis Rehab — Hammer Curl Isometric Hold", "1-2 sets") : item), null, { phaseId }),
        session(2, "Lower A", "kracht", [
          exercise("Leg Press", "3×8-12"),
          exercise("Hip Thrust Machine", "3×8-12"),
          exercise("Bulgarian Split Squat", "2×8/been"),
          exercise("Back Extension Machine", "2×10-15"),
          exercise("Calf Raise", "3×10-15"),
          exercise("Tibialis Raise", "2-3×15-25"),
        ], null, { phaseId, notes: "Bulgarian split squat alleen als bovenbeen/heup goed voelt." }),
        session(3, "Upper B", "kracht", [
          exercise("Shoulder Press Machine", "3×8-12"),
          exercise("Low Row Machine", "3×8-12"),
          exercise("Machine Chest Press or Pec Deck", "2-3×8-12", {
            weightRange: { min: 0, max: 150, step: 0.5 },
            info: "Kies machine chest press of pec deck.",
            alternatives: ["Machine Chest Press", "Pec Deck"],
          }),
          exercise("Dips", "2×6-10"),
          exercise("Rear Delt Fly Machine", "2×12-20"),
          exercise("External Rotation", "2×12-15", {
            weightRange: { min: 0, max: 25, step: 0.5 },
            info: "Rotator cuff, licht en technisch.",
          }),
        ], null, { phaseId }),
        session(4, "Lower B / Full Body", "kracht", [
          exercise("Leg Press or Hack Squat Test", "2-3×8-10"),
          exercise("Romanian Deadlift", "2×6-8"),
          exercise("Reverse Lunge or Walking Lunge", "2×8-10/been", {
            weightRange: { min: 0, max: 80, step: 0.5 },
            info: "Kies reverse lunge of walking lunge.",
            alternatives: ["Reverse Lunge", "Walking Lunge"],
          }),
          exercise("Hip Thrust Machine", "2×8-12"),
          exercise("Core: Pallof Press / Dead Bug / Side Plank", "2 sets", {
            inputType: "reps-or-seconds",
            info: "Kies een corevariant die goed voelt.",
            alternatives: ["Pallof Press", "Dead Bug", "Side Plank"],
          }),
          exercise("Calf/Tibialis", "2 sets", {
            inputType: "reps-only",
            info: "Kuit/tibialis onderhoud.",
            alternatives: ["Calf Raise", "Tibialis Raise"],
          }),
        ], null, { phaseId }),
        session(5, "Easy Run optie", "run", [], cardio("Easy Run", "1-2 easy runs van 25-40 min op 9,5-10,0 km/u", { outdoor: "Rustig.", notes: "Geen intervals." }), { phaseId }),
      ];
    }
    return [
      session(1, "Upper A", "kracht", upperA().map((item) => item.id === "shoulder-press-machine" ? exercise("Shoulder Press Machine", "2-3×8-12") : item), null, { phaseId }),
      session(2, "Lower A", "kracht", [
        exercise("Leg Press", "3×8-12"),
        exercise("Hip Thrust Machine", "3×8-12"),
        exercise("Bulgarian Split Squat", "2×8-10/been"),
        exercise("Back Extension Machine", "2×10-15"),
        exercise("Calf Raise", "3×10-15"),
        exercise("Tibialis Raise", "2-3×15-25"),
        exercise("Heupmobiliteit", "3-5 min"),
      ], null, { phaseId }),
      session(3, "Upper B", "kracht", [
        exercise("Shoulder Press Machine", "3×8-12"),
        exercise("Low Row Machine", "3×8-12"),
        exercise("Machine Chest Press or Incline Machine Press", "3×8-12", {
          weightRange: { min: 0, max: 150, step: 0.5 },
          info: "Kies machine chest press of incline machine press.",
          alternatives: ["Machine Chest Press", "Incline Machine Press"],
        }),
        exercise("Dips", "2×6-10"),
        exercise("Rear Delt Fly Machine", "2×12-20"),
        exercise("External Rotation", "2×12-15", { weightRange: { min: 0, max: 25, step: 0.5 } }),
        exercise("Brachialis Rehab — Hammer Curl Isometric Hold", "1-2 sets"),
      ], null, { phaseId }),
      session(4, "Lower B", "kracht", [
        exercise("Leg Press or Hack Squat Test", "3×8-12"),
        exercise("Romanian Deadlift or Back Extension", "2×6-10", {
          weightRange: { min: 0, max: 180, step: 0.5 },
          info: "Kies RDL of back extension afhankelijk van onderrug/rhomboid.",
          alternatives: ["Romanian Deadlift", "Back Extension Machine"],
        }),
        exercise("Reverse Lunge or Walking Lunge", "2×8-10/been", {
          weightRange: { min: 0, max: 80, step: 0.5 },
          alternatives: ["Reverse Lunge", "Walking Lunge"],
        }),
        exercise("Hip Thrust Machine", "2×8-12"),
        exercise("Calf Raise", "3×10-15"),
        exercise("Tibialis Raise", "2-3×15-25"),
        exercise("Core: Pallof / Dead Bug / Side Plank", "2 sets", {
          inputType: "reps-or-seconds",
          alternatives: ["Pallof Press", "Dead Bug", "Side Plank"],
        }),
      ], null, { phaseId }),
      session(5, "Easy Run optie", "run", [], cardio("Easy Run", "1-2 rustige runs van 25-45 min op 9,5-10,0 km/u", { outdoor: "Rustig.", notes: "Geen verplichte snelheid. Hardlopen is onderhoud." }), { phaseId }),
    ];
  }

  const WEEKS = [
    makeWeek("fase-1", 22, "Week A", f1Sessions(22, "A")),
    makeWeek("fase-1", 23, "Week B", f1Sessions(23, "B")),
    makeWeek("fase-1", 24, "Week A", f1Sessions(24, "A")),
    makeWeek("fase-1", 25, "Week B", f1Sessions(25, "B")),
    makeWeek("fase-1", 26, "Week A", f1Sessions(26, "A")),
    makeWeek("fase-2", 27, "Overgang A", f2Sessions(27)),
    makeWeek("fase-2", 28, "Overgang B", f2Sessions(28)),
    ...Array.from({ length: 8 }, (_, i) => {
      const week = 29 + i;
      const label = [29, 31, 33, 35].includes(week) ? "Hybride A" : week === 36 ? "Hybride B — lichtere brug" : "Hybride B";
      return makeWeek("fase-3", week, label, f3Sessions(week));
    }),
    ...Array.from({ length: 8 }, (_, i) => {
      const week = 37 + i;
      const labels = {
        37: "Piek A",
        38: "Piek B",
        39: "Piek A",
        40: "Piek B — cutback",
        41: "Piek A",
        42: "Piek B",
        43: "Piek A — zwaarste long-run week",
        44: "Piek B — brug naar taper",
      };
      return makeWeek("fase-4", week, labels[week], f4Sessions(week));
    }),
    makeWeek("fase-5", 45, "Taper 1", f5Sessions(45)),
    makeWeek("fase-5", 46, "Taper 2", f5Sessions(46)),
    makeWeek("fase-5", 47, "Marathonweek", f5Sessions(47)),
    makeWeek("fase-6", 48, "Herstelweek", f6Sessions(48)),
    makeWeek("fase-6", 49, "Herstart kracht", f6Sessions(49)),
    makeWeek("fase-6", 50, "Opbouw kracht", f6Sessions(50)),
    makeWeek("fase-6", 51, "Terug naar krachtbasis", f6Sessions(51)),
    makeWeek("fase-6", 52, "Nieuwe basis", f6Sessions(52)),
  ];

  const TRAINING_PLAN = PHASES.map((phase) => ({
    ...phase,
    weeks: WEEKS.filter((week) => week.phaseId === phase.phaseId),
  }));

  window.APP_CONFIG = APP_CONFIG;
  window.TRAINING_PLAN = TRAINING_PLAN;
  window.TRAINING_WEEKS = WEEKS;
})();
