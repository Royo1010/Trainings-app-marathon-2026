(function () {
  "use strict";

  const APP_CONFIG = {
    sourceFile: "trainingsschema_marathon_codex.md",
    startDate: "2026-05-25",
    startCalendarWeek: 22,
    version: "2026.05.24.2",
  };

  const RECOVERY = {
    "fase-1": {
      green: "Doe de volledige training zoals uitgeschreven.",
      orange:
        "Doe de eerste 4 oefeningen, maximaal 2 sets per oefening. Brachialis-rehab alleen licht, hardlopen easy of korter, geen extra core/finisher.",
      red:
        "Geen zware kracht. 500 meter roeien, 10 min mobiliteit, lichte pijnvrije machines 1-2 sets, calf/tibialis 2 sets, dead bug/side plank 2 sets, eventueel easy wandelen/joggen 10-15 min.",
      subRules: [
        "Brachialis 6+/10: geen pijnlijke rows, geen dips, geen curls.",
        "Schouderpijn: range verkleinen of oefening vervangen.",
        "Heup/bovenbeen zeurt: tempo-run vervangen door easy run.",
      ],
    },
    "fase-2": {
      green: "Doe de volledige training zoals uitgeschreven.",
      orange:
        "Doe de eerste 4 oefeningen, maximaal 2 sets per oefening. Hardlopen eventueel 5-10 minuten korter. Mini-strength maximaal 4 oefeningen.",
      red:
        "Geen zware kracht. Rustig wandelen/roeien, 10 min mobiliteit, calf/tibialis 2 sets, dead bug of side plank 2 sets, eventueel 10-20 min easy jog/walk.",
      subRules: [
        "Brachialis 6+/10: geen dips, geen pijnlijke rows, geen curls.",
        "Bovenbeen/heupklacht: geen 3:30-tempo-run; maak er easy van.",
        "Lower body verkorten als loopfrequentie zwaar voelt.",
      ],
    },
    "fase-3": {
      green: "Doe de volledige training zoals uitgeschreven.",
      orange:
        "Doe de eerste 3-4 oefeningen, maximaal 2 sets per oefening, een core/prehab-oefening en lichte brachialis-rehab. Lower: geen zware RDL, calf/tibialis houden.",
      red:
        "Geen zware kracht. 500 meter roeien, 10-15 min mobiliteit, calf/tibialis 2 sets, dead bug of side plank 2 sets, eventueel lichte machine chest press of row 1-2 sets.",
      subRules: [
        "Bovenbeen/heupklacht: geen fast finish; marathonpace-run vervangen door steady/easy.",
        "Lower body verkorten als de long run in gevaar komt.",
        "Brachialis 6+/10: geen dips, geen pijnlijke rows, geen curls.",
      ],
    },
    "fase-4": {
      green: "Doe de volledige training zoals uitgeschreven.",
      orange:
        "Doe oefening 1 t/m 4, maximaal 2 sets per oefening, een core/prehab-oefening, geen extra pompwerk en geen zware benen vlak voor de long run.",
      red:
        "Geen zware kracht. 500 meter roeien, 10 min mobiliteit, calf/tibialis 2 sets, dead bug of side plank 2 sets, lichte machine chest press of row 1-2 sets.",
      subRules: [
        "Bovenbeen/heupklacht: geen tempo/interval en geen fast finish.",
        "Long run langzamer als heup, bovenbeen, kuit of enkel zeurt.",
        "Brachialis 6+/10: geen dips, geen pijnlijke rows, geen curls.",
      ],
    },
    "fase-5": {
      green: "Doe de tapertraining zoals uitgeschreven.",
      orange:
        "Maak alles korter: easy run 5-10 min korter, marathonpace-blokken halveren, gym alleen bovenlichaam/prehab, geen lower body belasting.",
      red:
        "Geen kwaliteitstraining. 15-25 min wandelen of easy jog, lichte mobiliteit, calf/tibialis licht en eventueel dead bug.",
      subRules: [
        "Voorzijde bovenbeenpijn: geen snelle blokken, geen fast finish, geen lower gym.",
        "Marathonweek: geen nieuwe prikkels, geen spierpijn, geen testtraining.",
        "Bij twijfel in taper: korter of rust.",
      ],
    },
    "fase-6": {
      green: "Je volgt de week zoals uitgeschreven.",
      orange:
        "Doe 2-3 gymtrainingen, geen zware lower body, runs maximaal 20-30 min easy, geen RDL, geen split squats als bovenbeen/heup gevoelig is.",
      red:
        "Wandelen, mobiliteit, lichte upper body, calf/tibialis heel licht. Geen hardlopen als benen/heupen/kuiten zeuren en geen zware gym.",
      subRules: [
        "Week 48 is herstel, geen trainingsweek.",
        "Geen tempo's, intervals, lange duurloop of fast finish.",
        "Heup, bovenbeen, kuit en enkel bepalen het tempo van opbouwen.",
      ],
    },
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
    },
    {
      phaseId: "fase-4",
      phaseName: "Fase 4 — Piekfase / Marathonspecifieke fase",
      weekRange: "Week 37 t/m 44",
      startDate: "2026-09-07",
      endDate: "2026-11-01",
      goal:
        "4 hardloopmomenten per week, 12 km/u als marathontempo, 13 km/u als snelheidsreserve en long runs tot 30-32 km.",
      structure: "4 runs leidend, 2 gymtrainingen aanbevolen, 3e gym optioneel bij groen herstel.",
      rules:
        "Gym is onderhoud. Geen PR's, geen spierpijn najagen. Week 40 is cutback, week 43 zwaarste long-run week.",
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
      recovery: RECOVERY[options.phaseId],
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
      const fastFinish = {
        39: "Optioneel: laatste 3 km naar 10,5-11,0 km/u.",
        41: "Optioneel: laatste 4 km naar 10,8-11,2 km/u.",
        42: "Optioneel: laatste 5 km naar 11,0-11,5 km/u; als je heel goed voelt laatste 1-2 km richting 11,8 km/u.",
        43: "Geen verplichte fast finish; de afstand is zwaar genoeg.",
        44: "Geen fast finish; fris blijven.",
      };
      return [
        infoBlock(
          "Voeding/hydratatie",
          `Bij runs langer dan 90 min en 20 km+: oefen water, sportdrank, gelletjes, koolhydraten en timing. Geen verrassingen op marathondag. ${fastFinish[calendarWeek] || "Long run grotendeels rustig houden."}`
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
    39: cardio("3:30 Marathonpace Run", "10 min 9,5; 15 min 10,5-11,0; 5 min 9,5; 20 min 11,8-12,0; 5 min 9,5; 10 min 12,0-12,1; 5 min uitlopen", { outdoor: "Serieuze marathonpace-training, niet bewijzen." }),
    40: cardio("3:30 Marathonpace Run", "10 min 9,5; 10 min 10,5; 5 min 9,5; 12 min 11,8-12,0; 5 min uitlopen", { outdoor: "Cutback: korter en gecontroleerd." }),
    41: cardio("3:30 Marathonpace Run", "10 min 9,5; 15 min 10,8-11,0; 5 min 9,5; 25 min 11,8-12,0; 5 min 9,5; 10 min 12,0-12,1; 5 min uitlopen", { outdoor: "Langere blokken voor ritme, controle en vertrouwen." }),
    42: cardio("3:30 Marathonpace Run", "10 min 9,5; 15 min 10,8-11,0; 5 min 9,5; 30 min 11,8-12,0; 5 min 9,5; 10 min 12,0; 5 min uitlopen", { outdoor: "Zware, belangrijke training; stevig maar niet slopend." }),
    43: cardio("3:30 Marathonpace Run", "10 min 9,5; 20 min 10,5-11,0; 5 min 9,5; 25 min 11,8-12,0; 5 min uitlopen", { outdoor: "Nog een sterke marathonpace-prikkel, gecontroleerd." }),
    44: cardio("3:30 Marathonpace Run", "10 min 9,5; 10 min 10,5; 5 min 9,5; 15 min 11,8-12,0; 5 min uitlopen", { outdoor: "Kort, scherp en gecontroleerd; fris blijven voor taper." }),
  };

  const F4_RUN3 = {
    37: cardio("Tempo / Interval Run", "10 min 9,5; 4 x 3 min 13,0 km/u; 3 min herstel 9,5; 5 min uitlopen", { outdoor: "4 korte snelle blokken, zwaar maar beheerst." }),
    38: cardio("Tempo / Interval Run", "10 min 9,5; 5 x 3 min 13,0 km/u; 3 min herstel 9,5; 5 min uitlopen", { outdoor: "5 snelle blokken, sneller dan marathontempo maar niet maximaal." }),
    39: cardio("Tempo / Interval Run", "10 min 9,5; 4 x 4 min 12,8-13,0 km/u; 3 min herstel 9,5; 5 min uitlopen", { outdoor: "4 langere snelle blokken, technisch netjes." }),
    40: cardio("Tempo / Interval Run", "10 min 9,5; 3 x 3 min 12,8-13,0 km/u; 3 min herstel 9,5; 5 min uitlopen", { outdoor: "Cutback: kort en scherp, niet diep gaan." }),
    41: cardio("Tempo / Interval Run", "10 min 9,5; 5 x 4 min 12,8-13,0 km/u; 3 min herstel 9,5; 5 min uitlopen", { outdoor: "5 stevige blokken sneller dan marathontempo." }),
    42: cardio("Tempo / Interval Run", "10 min 9,5; 3 x 6 min 12,5-12,8 km/u; 3 min herstel 9,5; 5 min uitlopen", { outdoor: "3 langere tempoblokken, drempelachtig werk." }),
    43: cardio("Tempo / Interval Run", "10 min 9,5; 6 x 3 min 13,0-13,5 km/u; 2-3 min herstel 9,5; 5 min uitlopen", { outdoor: "6 korte snelle blokken, zwaar en scherp, geen sprint." }),
    44: cardio("Tempo / Interval Run", "10 min 9,5; 4 x 3 min 12,8-13,0 km/u; 3 min herstel 9,5; 5 min uitlopen", { outdoor: "Laatste lichte kwaliteitstraining voor taper.", notes: "Bij bovenbeen/heupzeur: vervangen door 30-45 min steady op 10,5-11,0 km/u." }),
  };

  const F4_RUN4 = {
    37: cardio("Long Run", "20 km op 9,5-10,0 km/u", { outdoor: "Lange rustige duurloop." }),
    38: cardio("Long Run", "22 km op 9,5-10,0 km/u", { outdoor: "Lang en comfortabel." }),
    39: cardio("Long Run", "24 km op 9,5-10,0 km/u", { outdoor: "Rustig, gecontroleerd.", notes: "Optioneel fast finish: laatste 3 km naar 10,5-11,0 km/u." }),
    40: cardio("Long Run", "18-20 km op 9,5 km/u", { outdoor: "Cutback long run." }),
    41: cardio("Long Run", "26 km op 9,5-10,0 km/u", { outdoor: "Lange rustige duurloop.", notes: "Optioneel fast finish: laatste 4 km naar 10,8-11,2 km/u." }),
    42: cardio("Long Run", "28 km op 9,5-10,0 km/u", { outdoor: "Lang, beheerst, mentaal sterk.", notes: "Optioneel fast finish: laatste 5 km naar 11,0-11,5 km/u; als je heel goed voelt laatste 1-2 km richting 11,8 km/u." }),
    43: cardio("Long Run", "30-32 km op 9,5-10,0 km/u", { outdoor: "Langste duurloop.", notes: "Geen verplichte fast finish; afstand is zwaar genoeg." }),
    44: cardio("Long Run", "22-24 km op 9,5 km/u", { outdoor: "Korter, fris blijven.", notes: "Geen fast finish." }),
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
      session(3, isA ? "Gym 2 — Lower Runner Strength A" : "Gym 2 — Lower Runner Strength B", "kracht", isA ? peakLowerA() : peakLowerB(), null, { phaseId, notes: isA && calendarWeek === 43 ? "Week 43: liever oranje variant als je 30-32 km loopt." : "Niet vlak voor de long run plannen." }),
      session(4, "Run 2 — 3:30 Marathonpace Run", "run", [], F4_RUN2[calendarWeek], { phaseId, goal: "12 km/u steeds normaler laten voelen." }),
      session(5, isA ? "Gym 3 — Full Body + Core A" : "Gym 3 — Full Body + Core B", "kracht", isA ? fullBodyA() : [
        exercise("Machine Chest Press", "2×8-12"),
        exercise("Chest-Supported Row Machine", "2×8-12"),
        exercise("Leg Press", "2×8-10"),
        exercise("Back Extension Machine", "2×10-15"),
        exercise("Pec Deck of Cable Fly", "2×10-15"),
        exercise("Landmine Rotation", "2×8-10/kant"),
        exercise("Side Plank", "2×30-45 sec/kant"),
        exercise("Tibialis Raise", "2×15-25"),
      ], null, { phaseId, notes: "3e gym is optioneel bij groen herstel. Houd hem compact zodat tempo en long run goed blijven." }),
      session(6, "Run 3 — Tempo / Interval Run", "run", [], F4_RUN3[calendarWeek], { phaseId, goal: "Snelheidsreserve bouwen boven marathontempo." }),
      session(7, "Run 4 — Long Run", "long-run", [], F4_RUN4[calendarWeek], {
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
      session(4, "Run 3 — Marathon", "marathon", [], cardio("Marathon", "Zondag 22 november 2026. A-doel richting 3:30, B-doel sterk finishen rond 3:45.", { outdoor: "Start gecontroleerd, ritme vasthouden, voeding/drinken volgens plan. Na 30-32 km pas denken aan vasthouden of voorzichtig versnellen." }), { phaseId, goal: "Fris aan de start en gecontroleerd lopen." }),
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
    recovery: RECOVERY[phase.phaseId],
    weeks: WEEKS.filter((week) => week.phaseId === phase.phaseId),
  }));

  window.APP_CONFIG = APP_CONFIG;
  window.TRAINING_PLAN = TRAINING_PLAN;
  window.TRAINING_WEEKS = WEEKS;
})();
