(function () {
  "use strict";

  const STORAGE = {
    logs: "marathonApp.logs",
    completed: "marathonApp.completedSessions",
    preferences: "marathonApp.preferences",
    version: "marathonApp.version",
  };

  const app = document.getElementById("app");
  const todayPill = document.getElementById("today-pill");
  const brandHome = document.getElementById("brand-home");
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const menuOverlay = document.getElementById("menu-overlay");
  const countdownOverlay = document.getElementById("countdown-overlay");
  const countdownContent = document.getElementById("countdown-content");
  const milestoneOverlay = document.getElementById("milestone-overlay");
  const milestoneContent = document.getElementById("milestone-content");
  const navButtons = Array.from(document.querySelectorAll("[data-view]"));
  const weeks = window.TRAINING_WEEKS || [];
  const phases = window.TRAINING_PLAN || [];
  const config = window.APP_CONFIG || {};
  const MARATHON_DATE = "2026-11-22";

  const state = {
    view: "today",
    viewedWeekIndex: 0,
    preview: null,
    selectedDateIso: null,
    selectedSessionKey: null,
    selectedExerciseId: null,
    selectedExerciseName: "",
    runBuildTab: "overview",
    statsTab: "overview",
    nutritionTab: "overview",
    targetPhaseId: "",
    milestoneActiveKey: "",
    milestoneDismissedKey: "",
  };

  function parseLocalDate(iso) {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function toIsoDate(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }

  function today() {
    const params = new URLSearchParams(window.location.search);
    const testDate = params.get("date");
    if (testDate && /^\d{4}-\d{2}-\d{2}$/.test(testDate)) return parseLocalDate(testDate);
    return new Date();
  }

  function formatDate(iso) {
    return parseLocalDate(iso).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
    });
  }

  function formatFullDate(iso) {
    return parseLocalDate(iso).toLocaleDateString("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatShortDate(iso) {
    return parseLocalDate(iso).toLocaleDateString("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  }

  function addDays(date, days) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  function dayDiff(fromIso, toIso) {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((parseLocalDate(toIso) - parseLocalDate(fromIso)) / msPerDay);
  }

  function capitalize(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
  }

  function safeRead(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      if (!value) return fallback;
      return JSON.parse(value);
    } catch (error) {
      console.warn("LocalStorage kon niet worden gelezen:", key, error);
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("LocalStorage kon niet worden opgeslagen:", key, error);
    }
  }

  function normalizeLogs(raw) {
    return {
      strength: Array.isArray(raw?.strength) ? raw.strength : [],
      cardio: Array.isArray(raw?.cardio) ? raw.cardio : [],
    };
  }

  function getLogs() {
    return normalizeLogs(safeRead(STORAGE.logs, {}));
  }

  function saveLogs(logs) {
    safeWrite(STORAGE.logs, normalizeLogs(logs));
    safeWrite(STORAGE.version, { version: config.version, savedAt: new Date().toISOString() });
  }

  function getCompleted() {
    const raw = safeRead(STORAGE.completed, []);
    return Array.isArray(raw) ? raw : [];
  }

  function saveCompleted(items) {
    safeWrite(STORAGE.completed, Array.isArray(items) ? items : []);
  }

  function currentWeekIndex(date = today()) {
    if (!weeks.length) return 0;
    const start = parseLocalDate(config.startDate || weeks[0].startDate);
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.floor((parseLocalDate(toIsoDate(date)) - start) / msPerDay);
    const rawIndex = Math.floor(diffDays / 7);
    return Math.max(0, Math.min(rawIndex, weeks.length - 1));
  }

  function getWeekByIndex(index) {
    return weeks[Math.max(0, Math.min(index, weeks.length - 1))];
  }

  function getPhase(phaseId) {
    return phases.find((phase) => phase.phaseId === phaseId) || phases[0];
  }

  function sessionKey(week, session) {
    return `week-${week.calendarWeek}:session-${session.sessionNumber}`;
  }

  function isCompleted(key) {
    return getCompleted().some((item) => item.sessionKey === key);
  }

  function getCompletedSet() {
    return new Set(getCompleted().map((item) => item.sessionKey));
  }

  function hasSessionData(key, logs = getLogs()) {
    return (
      logs.strength.some((entry) => entry.sessionKey === key && (entry.selectedWeight !== null || entry.selectedReps !== null || entry.selectedSeconds !== null || entry.selectedMinutes !== null || entry.selectedDistance !== null)) ||
      logs.cardio.some((entry) => entry.sessionKey === key && (entry.cardioDone || entry.cardioFeeling))
    );
  }

  function completeSession(week, session, mode, dateIso = toIsoDate(today())) {
    const key = sessionKey(week, session);
    const completed = getCompleted();
    if (!completed.some((item) => item.sessionKey === key)) {
      completed.push({
        sessionKey: key,
        week: week.calendarWeek,
        phase: week.phaseId,
        session: session.sessionNumber,
        title: session.title,
        date: dateIso,
        completedAt: new Date().toISOString(),
        mode,
      });
      saveCompleted(completed);
    }
  }

  function autoCompleteStaleSessions() {
    const todayIso = toIsoDate(today());
    const logs = getLogs();
    const completed = getCompleted();
    const done = new Set(completed.map((item) => item.sessionKey));
    const staleKeys = new Set();

    logs.strength.forEach((entry) => {
      if (entry.date && entry.date < todayIso) staleKeys.add(entry.sessionKey);
    });
    logs.cardio.forEach((entry) => {
      if (entry.date && entry.date < todayIso && (entry.cardioDone || entry.cardioFeeling)) staleKeys.add(entry.sessionKey);
    });

    staleKeys.forEach((key) => {
      if (done.has(key)) return;
      const found = findSessionByKey(key);
      if (!found) return;
      completed.push({
        sessionKey: key,
        week: found.week.calendarWeek,
        phase: found.week.phaseId,
        session: found.session.sessionNumber,
        title: found.session.title,
        date: todayIso,
        completedAt: new Date().toISOString(),
        mode: "auto",
      });
    });

    saveCompleted(completed);
  }

  function findSessionByKey(key) {
    for (const week of weeks) {
      for (const session of week.sessions) {
        if (sessionKey(week, session) === key) return { week, session };
      }
    }
    return null;
  }

  function activeSessionForWeek(week) {
    const done = getCompletedSet();
    return week.sessions.find((session) => !done.has(sessionKey(week, session))) || null;
  }

  function flatSessions() {
    return weeks.flatMap((week) => week.sessions.map((session) => ({ week, session, key: sessionKey(week, session) })));
  }

  function plannedDateForSession(week, session) {
    const offset = Number.isFinite(session.plannedOffset) ? session.plannedOffset : Math.min(session.sessionNumber - 1, 6);
    return toIsoDate(addDays(parseLocalDate(week.startDate), offset));
  }

  function sessionForPlannedDate(week, dateIso) {
    const offset = Math.max(0, Math.min(dayDiff(week.startDate, dateIso), week.sessions.length - 1));
    return week.sessions[offset] || week.sessions[0] || null;
  }

  function todayViewContext() {
    const realTodayIso = toIsoDate(today());
    const selectedIso = state.selectedDateIso || realTodayIso;
    if (state.selectedSessionKey) {
      const found = findSessionByKey(state.selectedSessionKey);
      if (found) return { ...found, dateIso: selectedIso };
    }
    const selectedDate = parseLocalDate(selectedIso);
    const week = getWeekByIndex(currentWeekIndex(selectedDate));
    const session = selectedIso === realTodayIso ? activeSessionForWeek(week) : sessionForPlannedDate(week, selectedIso);
    return { week, session, dateIso: selectedIso };
  }

  function moveTodaySelection(direction) {
    const context = todayViewContext();
    const items = flatSessions();
    const currentKey = context.session ? sessionKey(context.week, context.session) : `week-${context.week.calendarWeek}:session-${context.week.sessions.length}`;
    const currentIndex = Math.max(0, items.findIndex((item) => item.key === currentKey));
    const next = items[Math.max(0, Math.min(items.length - 1, currentIndex + direction))];
    if (!next) return;
    state.selectedSessionKey = next.key;
    state.selectedDateIso = plannedDateForSession(next.week, next.session);
  }

  function resetTodaySelection() {
    state.selectedSessionKey = null;
    state.selectedDateIso = toIsoDate(today());
  }

  function goHomeToday() {
    state.view = "today";
    state.preview = null;
    state.selectedExerciseId = null;
    state.selectedExerciseName = "";
    state.viewedWeekIndex = currentWeekIndex();
    resetTodaySelection();
    closeMenu();
    closeCountdown();
    render();
  }

  function selectedDateLabel(dateIso) {
    const realTodayIso = toIsoDate(today());
    const diff = dayDiff(realTodayIso, dateIso);
    if (diff === 0) return "Vandaag";
    if (diff === 1) return "Morgen";
    if (diff === 2) return "Overmorgen";
    if (diff === -1) return "Gisteren";
    if (diff === -2) return "Eergisteren";
    return capitalize(formatShortDate(dateIso));
  }

  function weeksUntilMarathon(dateIso) {
    return Math.max(0, Math.ceil(dayDiff(dateIso, MARATHON_DATE) / 7));
  }

  function marathonCountdownText(dateIso) {
    const weeksLeft = weeksUntilMarathon(dateIso);
    if (weeksLeft <= 0) return "Marathonweek";
    return `Nog ${weeksLeft} weken tot marathon`;
  }

  function countdownParts(dateIso) {
    const totalDays = dayDiff(dateIso, MARATHON_DATE);
    if (totalDays < 0) return { totalDays, label: "Marathonperiode voorbij" };
    const weeksPart = Math.floor(totalDays / 7);
    const daysPart = totalDays % 7;
    return { totalDays, weeksPart, daysPart, label: `Nog ${weeksPart} weken en ${daysPart} dagen` };
  }

  function phaseFocus(phaseId) {
    const focus = {
      "fase-1": "Rustig beginnen. De basis leggen. Nog niet bewijzen, maar bouwen.",
      "fase-2": "Drie runs per week normaal laten voelen zonder te forceren.",
      "fase-3": "Long runs en 12 km/u als werktempo opbouwen.",
      "fase-4": "Marathonspecifiek trainen: tempo leren vasthouden op vermoeide benen.",
      "fase-5": "Fris worden, scherp blijven en geen vermoeidheid meer verzamelen.",
      "fase-6": "Herstellen, rustig bewegen en opnieuw opbouwen.",
    };
    return focus[phaseId] || "Consistent trainen en slim herstellen.";
  }

  function milestoneDefinitions() {
    return [
      {
        key: "phase-1-start",
        week: 22,
        type: "phase-start",
        phaseId: "fase-1",
        label: "Fase-update",
        title: "Fase 1 begint — Basisfase",
        intro: "Roy, dit is de rustige start van je marathonvoorbereiding. Krachttraining blijft dominant en hardlopen wordt voorzichtig toegevoegd.",
        change: "Je loopt 2 keer per week: één easy run en één korte tempo-intro richting 3:30-tempo.",
        running: "Rustig wennen aan lopen. 12 km/u wordt kort aangeraakt, maar nog niet lang vastgehouden.",
        strength: "Krachttraining blijft de hoofdstructuur. Upper/lower blijft belangrijk.",
        nutrition: "Nog geen ingewikkeld marathonvoedingsplan nodig. Normaal eten, genoeg eiwit, en op hardloopdagen eventueel iets meer koolhydraten.",
        focus: "Rustig bouwen. Niet bewijzen.",
        actions: ["week", "phase", "nutritionPhase"],
      },
      {
        key: "phase-2-start",
        week: 27,
        type: "phase-start",
        phaseId: "fase-2",
        label: "Fase-update",
        title: "Fase 2 begint — Overgangsfase",
        intro: "Je gaat nu van 2 naar 3 runs per week. Hardlopen wordt meer een vaste pijler van je week.",
        change: "Er komt een derde run bij. De krachttraining blijft aanwezig, maar de week wordt iets meer hybride.",
        running: "Meer frequentie. Nog niet extreem meer volume.",
        strength: "Nog steeds serieus trainen, maar niet zo zwaar dat het je loopopbouw saboteert.",
        nutrition: "Op hardloopdagen iets bewuster koolhydraten nemen. Begin te letten op wat goed valt vóór het lopen.",
        focus: "Wennen aan vaker lopen zonder herstelproblemen.",
        actions: ["week", "phase", "nutritionPhase"],
      },
      {
        key: "phase-3-start",
        week: 29,
        type: "phase-start",
        phaseId: "fase-3",
        label: "Fase-update",
        title: "Fase 3 begint — Hybride opbouwfase",
        intro: "Dit is de eerste echte marathonopbouwfase. Vanaf nu krijgt de long run een vaste plek in je week.",
        change: "Je loopt 3 keer per week: easy run, marathonpace-run en long run.",
        running: "De long runs bouwen op van ongeveer 60 minuten naar bijna 2 uur. Marathontempo wordt wekelijks geoefend.",
        strength: "Krachttraining blijft serieus, maar wordt iets meer ondersteunend. Geen domme PR-jacht als de long runs zwaarder worden.",
        nutrition: "Vanaf deze fase worden koolhydraten rond long runs belangrijker. Begin met long-run-ontbijt testen en later met gels/sportdrank.",
        focus: "De marathonmotor bouwen.",
        note: "Bij start Fase 3 zit je ongeveer 19 weken voor de marathon.",
        actions: ["week", "phase", "nutritionLongRuns", "longRuns"],
      },
      {
        key: "phase-4-start",
        week: 37,
        type: "phase-start",
        phaseId: "fase-4",
        label: "Fase-update",
        title: "Fase 4 begint — Piekfase",
        intro: "Dit is de belangrijkste marathonspecifieke fase. Hardlopen wordt nu leidend.",
        change: "Je gaat naar 4 runs per week. Long runs worden langer en sommige bevatten marathontempo.",
        running: "12 km/u leren lopen met vermoeide benen. De sleutelweken zijn week 39, 41, 42 en 43.",
        strength: "Krachttraining wordt ondersteunend. Sterk blijven, maar niet slopen.",
        nutrition: "Dit is geen fase om hard te cutten. Koolhydraten, herstel, vocht en zout worden belangrijker. Test gels en drinken tijdens long runs.",
        focus: "Racespecifiek vertrouwen bouwen.",
        actions: ["week", "phase", "nutritionLongRuns", "marathonPace"],
      },
      {
        key: "first-mp-long-run",
        week: 39,
        type: "key-week",
        phaseId: "fase-4",
        label: "Mijlpaal deze week",
        title: "Mijlpaal — Eerste marathonpace-long-run",
        intro: "Deze week komt marathontempo voor het eerst echt terug binnen een lange duurloop.",
        change: "De long run is 24 km met 2 stukken van 3 km op 11,8–12,0 km/u.",
        running: "Leren schakelen tussen rustig tempo en marathontempo terwijl je al kilometers in de benen hebt.",
        strength: "Midweekbelasting bewust beheersen. Geen extra zware beentraining rond deze long run.",
        nutrition: "Begin serieuzer met voeding vooraf en eventueel voeding/drinken tijdens de long run. Dit is een goede week om te testen wat werkt.",
        focus: "Eerste vertrouwen opbouwen in marathontempo tijdens een lange run.",
        actions: ["week", "longRuns", "nutritionLongRuns"],
      },
      {
        key: "dress-rehearsal",
        week: 42,
        type: "key-week",
        phaseId: "fase-4",
        label: "Mijlpaal deze week",
        title: "Mijlpaal — Belangrijkste generale repetitie",
        intro: "Dit is één van de belangrijkste weken van je voorbereiding.",
        change: "De long run is 28 km met 10–12 km rond marathontempo.",
        running: "12 km/u lopen nadat je al lang onderweg bent. Dit is geen volledige marathontest, maar wel de belangrijkste vertrouwenstraining.",
        strength: "Geen zware krachttraining stapelen. Alles moet de long run ondersteunen.",
        nutrition: "Test ontbijt, gels, drinken en pacing alsof het marathondag is.",
        focus: "Bewijzen aan je lichaam dat marathontempo later in een lange run gecontroleerd kan voelen.",
        actions: ["week", "longRuns", "nutritionLongRuns"],
      },
      {
        key: "longest-run",
        week: 43,
        type: "key-week",
        phaseId: "fase-4",
        label: "Mijlpaal deze week",
        title: "Mijlpaal — Langste duurloop",
        intro: "Deze week loop je de langste duurloop van de voorbereiding.",
        change: "De long run is 30–32 km rustig. Geen verplicht marathontempo.",
        running: "Afstandsvertrouwen, voeding, hydratatie, mentale rust en belastbaarheid.",
        strength: "Krachttraining moet licht en ondersteunend blijven. Geen zware benen creëren.",
        nutrition: "Oefen je voeding en drinken. Niet wachten tot je leeg bent.",
        focus: "Langste afstand beheerst voltooien zonder jezelf kapot te lopen.",
        actions: ["week", "longRuns", "nutritionLongRuns"],
      },
      {
        key: "phase-5-start",
        week: 45,
        type: "phase-start",
        phaseId: "fase-5",
        label: "Fase-update",
        title: "Fase 5 begint — Taperfase",
        intro: "De zwaarste training zit erop. Nu draait het om fris worden.",
        change: "Het volume gaat omlaag. Je houdt korte prikkels, maar bouwt geen nieuwe vermoeidheid meer op.",
        running: "Ritme behouden, scherp blijven, niet forceren.",
        strength: "Alleen onderhoud. Geen zware benen, geen nieuwe oefeningen.",
        nutrition: "Richting marathon worden koolhydraten belangrijker. De laatste dagen geen experimenten.",
        focus: "Fit, rustig en vol vertrouwen aan de start staan.",
        actions: ["week", "phase", "nutritionMarathon"],
      },
      {
        key: "marathon-week",
        week: 47,
        type: "key-week",
        phaseId: "fase-5",
        label: "Mijlpaal deze week",
        title: "Marathonweek",
        intro: "Dit is de week waarvoor je hebt getraind. Geen experimenten meer. Plan uitvoeren.",
        change: "Korte rustige loopjes, eventueel een shake-out, en dan de marathon op zondag 22 november 2026.",
        running: "Fris blijven, vertrouwen houden, niet ineens extra trainen.",
        strength: "Geen zware krachttraining meer.",
        nutrition: "Race-ontbijt, gels, drinken en carb loading uitvoeren zoals getest. Geen nieuwe gels, geen nieuw ontbijt, geen onbekende sportdrank.",
        focus: "Rustig blijven en uitvoeren.",
        actions: ["week", "nutritionMarathon", "marathonWeek"],
      },
    ];
  }

  function getMilestoneForWeek(weekNo) {
    return milestoneDefinitions().find((item) => item.week === weekNo) || null;
  }

  function sessionNavLabel(week, session) {
    if (!session) return "Alle sessies afgerond";
    if (session.cardio) {
      const runs = week.sessions.filter((item) => item.cardio);
      const runIndex = runs.findIndex((item) => item.sessionNumber === session.sessionNumber) + 1;
      const title = session.type === "long-run" ? "Long Run" : session.type === "marathon" ? "Marathon" : `Run ${runIndex} van ${runs.length}`;
      return title;
    }
    return `Sessie ${session.sessionNumber} van ${week.sessions.length}`;
  }

  function latestStrengthLog(key, exerciseId) {
    const logs = getLogs();
    return [...logs.strength].reverse().find((entry) => entry.sessionKey === key && entry.exerciseId === exerciseId) || null;
  }

  function cardioLog(key) {
    const logs = getLogs();
    return [...logs.cardio].reverse().find((entry) => entry.sessionKey === key) || null;
  }

  function score(entry) {
    if (Number(entry.selectedWeight) > 0 && Number(entry.selectedReps) > 0) {
      return Number(entry.selectedWeight) * Number(entry.selectedReps);
    }
    if (Number(entry.selectedWeight) > 0 && Number(entry.selectedDistance) > 0) {
      return Number(entry.selectedWeight) * Number(entry.selectedDistance);
    }
    if (Number(entry.selectedSeconds) > 0) return Number(entry.selectedSeconds);
    if (Number(entry.selectedMinutes) > 0) return Number(entry.selectedMinutes);
    if (Number(entry.selectedDistance) > 0) return Number(entry.selectedDistance);
    if (Number(entry.selectedReps) > 0) return Number(entry.selectedReps);
    return 0;
  }

  function resultText(entry) {
    if (!entry) return "nog geen data";
    if (Number(entry.selectedWeight) > 0 && Number(entry.selectedReps) > 0) {
      return `${entry.selectedReps} × ${formatNumber(entry.selectedWeight)} kg`;
    }
    if (Number(entry.selectedSeconds) > 0) return `${entry.selectedSeconds} sec`;
    if (Number(entry.selectedMinutes) > 0) return `${entry.selectedMinutes} min`;
    if (Number(entry.selectedDistance) > 0 && Number(entry.selectedWeight) > 0) {
      return `${entry.selectedDistance} m × ${formatNumber(entry.selectedWeight)} kg`;
    }
    if (Number(entry.selectedReps) > 0) return `${entry.selectedReps} reps`;
    return "nog geen data";
  }

  function formatNumber(value) {
    const number = Number(value);
    return Number.isInteger(number) ? String(number) : String(number).replace(".", ",");
  }

  function plannedLabel(exercise) {
    const planned = String(exercise.planned || "").trim();
    if (!planned) return "";
    const normalized = planned.replace(/\s*\/\s*/g, " per ");
    const match = normalized.match(/^(.+?)[×x](.+)$/);
    if (!match) return normalized;
    const left = match[1].trim();
    const right = match[2].trim();
    const leftLabel = /ronde|round/i.test(left) || /carry/i.test(exercise.name)
      ? `${left.replace(/\s*rondes?/i, "").trim()} rondes`
      : /sets?/i.test(left)
        ? left
        : `${left} sets`;
    const rightLabel = plannedTargetLabel(right);
    return `${leftLabel} · ${rightLabel}`;
  }

  function plannedTargetLabel(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    if (/(rep|sec|min|m\b|meter|stap|sets?|rondes?)/i.test(text)) return text;
    const perMatch = text.match(/^(.+?)\s+per\s+(.+)$/i);
    if (perMatch) return `${perMatch[1].trim()} reps per ${perMatch[2].trim()}`;
    return `${text} reps`;
  }

  function compactRunLabel(cardioBlock) {
    const text = `${cardioBlock.title} ${cardioBlock.instruction}`.toLowerCase();
    const source = `${cardioBlock.title} ${cardioBlock.instruction}`;
    const instruction = cardioBlock.instruction;
    if (text.includes("long run") || text.includes("km")) {
      const km = source.match(/(?:^|[^\d,])(\d+(?:[–-]\d+)?)\s*km(?!\/u)/i);
      const mp = source.match(/(\d+\s*[×x]\s*\d+\s*km|10[–-]12 km|6[–-]8 km|6 km)/i);
      if (km && mp && text.includes("11,8")) return `${km[1]} km · incl. ${mp[1].replace("x", "×")} MP`;
      if (km) return `${km[1]} km · rustig`;
    }
    const minutes = instruction.match(/(\d+(?:[–-]\d+)?)\s*min/i);
    const speed = instruction.match(/(\d{1,2},\d(?:[–-]\d{1,2},\d)?|\d{1,2},\d)\s*km\/u/i);
    if (minutes && speed) return `${minutes[1]} min · ${speed[1]} km/u`;
    if (text.includes("strides")) return "Easy · strides";
    if (text.includes("marathonpace") || text.includes("11,8") || text.includes("12,0")) return "Blokken rond 11,8–12,0 km/u";
    return instruction;
  }

  function runCardSummary(session, cardioBlock) {
    const kind = runKind(session, cardioBlock);
    const source = `${cardioBlock.title} ${cardioBlock.instruction}`;
    const km = source.match(/(?:^|[^\d,])(\d+(?:[–-]\d+)?)\s*km(?!\/u)/i);
    const mpKm = source.match(/(\d+\s*[×x]\s*\d+\s*km|10[–-]12 km|6[–-]8 km|6 km|10–12 km|6–8 km)/i);
    if (session.type === "marathon") return "42,2 km · A-doel rond 3:30";
    if (kind === "long" && km) {
      const mpLabel = mpKm ? `rustig + ${mpKm[1].replace(/\s*x\s*/i, " × ")} MP` : "rustig";
      return `${km[1]} km · ${mpLabel}`;
    }
    if (kind === "strides") return `${minuteRangeFromText(cardioBlock.instruction) || "easy"} · strides`;
    if (kind === "shakeout") return `${minuteRangeFromText(cardioBlock.instruction) || "15–20 min"} · heel rustig`;
    if (kind === "mp" || kind === "tempo") {
      const topSpeed = runTopSpeedLabel(source);
      const total = approximateRunTotalLabel(cardioBlock.instruction);
      const isIntro = /intro|3:30-tempo/i.test(source);
      const paceText = kind === "mp" && !isIntro ? `MP rond ${topSpeed || "11,8–12,0"} km/u` : `snelle stukken tot ${topSpeed || "13,0"} km/u`;
      return `${total} · ${paceText}`;
    }
    const minutes = minuteRangeFromText(cardioBlock.instruction);
    const speed = cardioBlock.instruction.match(/(\d{1,2},\d(?:[–-]\d{1,2},\d)?|\d{1,2},\d)\s*km\/u/i);
    if (minutes && speed) return `${minutes} · ${speed[1]} km/u`;
    return compactRunLabel(cardioBlock);
  }

  function runTopSpeedLabel(source) {
    const speeds = [...String(source).matchAll(/(\d{1,2},\d)(?:[–-](\d{1,2},\d))?\s*km\/u?/gi)]
      .map((match) => ({
        label: match[2] ? `${match[1]}–${match[2]}` : match[1],
        value: Number((match[2] || match[1]).replace(",", ".")),
      }))
      .filter((item) => Number.isFinite(item.value));
    if (!speeds.length) return "";
    return speeds.sort((a, b) => b.value - a.value)[0].label;
  }

  function approximateRunTotalLabel(instruction) {
    const minutes = approximateRunTotalMinutes(instruction);
    if (!minutes) return "ca. 45 min totaal";
    const rounded = Math.max(5, Math.round(minutes / 5) * 5);
    return `ca. ${rounded} min totaal`;
  }

  function approximateRunTotalMinutes(instruction) {
    let total = 0;
    let lastRepeat = 1;
    String(instruction || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        const repeat = part.match(/(\d+)\s*[×x]\s*(\d+)(?:[–-](\d+))?\s*min/i);
        if (repeat) {
          const reps = Number(repeat[1]);
          const min = Number(repeat[2]);
          const max = repeat[3] ? Number(repeat[3]) : min;
          total += reps * ((min + max) / 2);
          lastRepeat = reps;
          return;
        }
        const range = part.match(/(\d+)(?:[–-](\d+))?\s*min/i);
        if (!range) return;
        const min = Number(range[1]);
        const max = range[2] ? Number(range[2]) : min;
        const multiplier = /na elk/i.test(part) ? lastRepeat : 1;
        total += multiplier * ((min + max) / 2);
      });
    return total;
  }

  function renderRunDetails(session, cardioBlock) {
    const kind = runKind(session, cardioBlock);
    const parts = String(cardioBlock.instruction || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean);
    const complex = parts.length > 1 || ["mp", "tempo", "long", "strides", "marathon"].includes(kind);
    const incline = runInclineAdvice(kind, cardioBlock);
    const note = cardioBlock.notes && !/incline/i.test(cardioBlock.notes) ? cardioBlock.notes : "";

    if (!complex) {
      return `
        <div class="run-detail-grid">
          <div class="run-detail-row"><span>Loopband</span><p>${formatRunStep(cardioBlock.instruction)}</p></div>
          ${cardioBlock.outdoor ? `<div class="run-detail-row"><span>Buiten</span><p>${cardioBlock.outdoor}</p></div>` : ""}
          <div class="run-detail-row"><span>Incline</span><p>${incline}</p></div>
          ${note ? `<div class="run-detail-row"><span>Aandachtspunt</span><p>${note}</p></div>` : ""}
        </div>
      `;
    }

    return `
      <div class="run-detail-grid">
        <div class="run-detail-row run-detail-list">
          <span>Opbouw</span>
          <ul>${parts.map((part) => `<li>${formatRunStep(part)}</li>`).join("")}</ul>
        </div>
        ${cardioBlock.outdoor ? `<div class="run-detail-row"><span>Buiten</span><p>${cardioBlock.outdoor}</p></div>` : ""}
        <div class="run-detail-row"><span>Incline</span><p>${incline}</p></div>
        ${note ? `<div class="run-detail-row"><span>Aandachtspunt</span><p>${note}</p></div>` : ""}
      </div>
    `;
  }

  function formatRunStep(value) {
    return String(value || "")
      .trim()
      .replace(/\s*x\s*/gi, " × ")
      .replace(/(\d+(?:[–-]\d+)?)\s*min\s+op\s+/gi, "$1 min op ")
      .replace(/(\d+(?:[–-]\d+)?\s*min\s+(?:inlopen|uitlopen))\s+(\d{1,2},\d(?:[–-]\d{1,2},\d)?)\s*km\/u/gi, "$1 op $2 km/u")
      .replace(/(\d+\s*×\s*\d+(?:[–-]\d+)?\s*min)\s+(\d{1,2},\d(?:[–-]\d{1,2},\d)?)\s*km\/u/gi, "$1 op $2 km/u")
      .replace(/(\d+(?:[–-]\d+)?\s*min)\s+(\d{1,2},\d(?:[–-]\d{1,2},\d)?)\s*km\/u/gi, "$1 op $2 km/u")
      .replace(/(\d+(?:[–-]\d+)?\s*min herstel)\s+(\d{1,2},\d(?:[–-]\d{1,2},\d)?)\s*km\/u/gi, "$1 op $2 km/u")
      .replace(/\bMP\b/g, "marathontempo");
  }

  function runInclineAdvice(kind, cardioBlock) {
    if (cardioBlock.notes && /incline/i.test(cardioBlock.notes)) return cardioBlock.notes.replace(/\.$/, ".");
    if (kind === "mp" || kind === "tempo") return "0% aanbevolen voor strakke tempocontrole.";
    if (kind === "long") return "0% prima; 1% alleen als dat goed voelt.";
    if (kind === "shakeout" || kind === "marathon") return "0% of buiten natuurlijk vlak; zo licht mogelijk houden.";
    return "0%, optioneel 1%.";
  }

  function sessionSummary(session) {
    const strengthCount = session.exercises.length;
    const runCount = session.cardio ? 1 : 0;
    const parts = [];
    if (strengthCount) parts.push(`${strengthCount} ${strengthCount === 1 ? "krachtoefening" : "krachtoefeningen"}`);
    if (runCount) parts.push("1 run");
    if (!parts.length) parts.push(`${Math.max(1, strengthCount + runCount)} onderdeel`);
    return `${parts.join(" + ")} · ${estimatedSessionDuration(session)}`;
  }

  function estimatedSessionDuration(session) {
    if (session.estimatedDuration) return session.estimatedDuration;
    const text = `${session.title} ${session.cardio?.title || ""} ${session.cardio?.instruction || ""}`.toLowerCase();
    const exerciseCount = session.exercises.length;
    const hasRun = Boolean(session.cardio);

    if (session.type === "marathon") return "3:30–3:45 uur";
    if (session.type === "long-run" && session.cardio) return estimateLongRunDuration(session.cardio);
    if (hasRun && !exerciseCount) return estimateRunOnlyDuration(session);
    if (!hasRun) return estimateStrengthDuration(session);

    if (text.includes("easy run + mini strength")) return "55–65 min";
    if (text.includes("marathonpace") || text.includes("3:30") || text.includes("tempo")) return "70–80 min";
    if (text.includes("easy")) return "70–75 min";
    return "65–80 min";
  }

  function estimateStrengthDuration(session) {
    const count = session.exercises.length;
    const text = session.title.toLowerCase();
    if (text.includes("activatie")) return "15–25 min";
    if (text.includes("light") || text.includes("maintenance")) return count >= 6 ? "45–60 min" : "30–45 min";
    if (count >= 7) return "60–70 min";
    if (count >= 5) return "50–60 min";
    return "30–45 min";
  }

  function estimateRunOnlyDuration(session) {
    const text = `${session.title} ${session.cardio?.title || ""} ${session.cardio?.instruction || ""}`.toLowerCase();
    const minutes = minuteRangeFromText(session.cardio?.instruction || "");
    if (text.includes("shake-out")) return minutes || "15–20 min";
    if (text.includes("strides") && minutes) return minutes;
    if (text.includes("marathonpace") || text.includes("3:30") || text.includes("interval") || text.includes("tempo")) return "45–60 min";
    return minutes || "35–50 min";
  }

  function estimateLongRunDuration(cardioBlock) {
    const source = `${cardioBlock.title} ${cardioBlock.instruction}`;
    const km = source.match(/(?:^|[^\d,])(\d+(?:[–-]\d+)?)\s*km(?!\/u)/i);
    if (!km) return minuteRangeFromText(source) || "90–120 min";
    const [minKm, maxKm] = parseRange(km[1]);
    const minMinutes = Math.round((minKm / 12) * 60);
    const maxMinutes = Math.round((maxKm / 10) * 60);
    return formatDurationRange(minMinutes, maxMinutes);
  }

  function minuteRangeFromText(value) {
    const text = String(value || "");
    const range = text.match(/(\d+)\s*[–-]\s*(\d+)\s*min/i);
    if (range) return `${range[1]}–${range[2]} min`;
    const exact = text.match(/(\d+)\s*min/i);
    if (!exact) return "";
    const min = Number(exact[1]);
    const max = min <= 30 ? min : min + 5;
    return `${min}${max === min ? "" : `–${max}`} min`;
  }

  function parseRange(value) {
    const normalized = String(value).replace("–", "-");
    const [first, second] = normalized.split("-").map(Number);
    return [first, Number.isFinite(second) ? second : first];
  }

  function formatDurationRange(minMinutes, maxMinutes) {
    const roundedMin = Math.max(5, Math.round(minMinutes / 5) * 5);
    const roundedMax = Math.max(roundedMin, Math.round(maxMinutes / 5) * 5);
    if (roundedMax < 100) return `${roundedMin}–${roundedMax} min`;
    const toHour = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}:${String(mins).padStart(2, "0")}`;
    };
    return `${toHour(roundedMin)}–${toHour(roundedMax)} uur`;
  }

  function runKind(session, cardioBlock) {
    const text = `${session.title} ${cardioBlock.title} ${cardioBlock.instruction}`.toLowerCase();
    if (session.type === "long-run" || text.includes("long run")) return "long";
    if (session.type === "marathon") return "marathon";
    if (text.includes("shake-out")) return "shakeout";
    if (text.includes("stride")) return "strides";
    if (text.includes("marathonpace") || text.includes("3:30") || text.includes("11,8") || text.includes("12,0")) return "mp";
    if (text.includes("interval") || text.includes("tempo / interval") || text.includes("13,0") || text.includes("12,8")) return "tempo";
    return "easy";
  }

  function runInfo(session, cardioBlock, week) {
    const kind = runKind(session, cardioBlock);
    const base = {
      easy: {
        goal: "Rustige kilometers maken, loopritme opbouwen en herstelvermogen verbeteren. Deze run mag makkelijk voelen.",
        tempo: "Loopband meestal 9,5–10,0 km/u. Buiten: rustig tempo waarbij praten in volledige zinnen mogelijk blijft.",
        incline: "0% is prima. Kies 1% alleen als je het meer op buitenlopen wilt laten lijken en je benen goed voelen.",
        good: "Niet ineens hard maken. Eventueel de laatste 5 minuten iets actiever, maar blijf ontspannen.",
        tired: "Houd het easy of verkort met 5–10 minuten. Deze run hoeft geen test te zijn.",
        technique: "Ontspannen schouders, lichte pas, rustig ademen, niet stampen.",
        why: session.title.toLowerCase().includes("upper") ? "Deze easy run staat bewust bij upper body: extra loopvolume zonder je lower day direct te verstoren." : "Deze run bouwt basis op zonder veel extra vermoeidheid te stapelen.",
      },
      mp: {
        goal: "Wennen aan 11,8–12,0/12,1 km/u als gecontroleerd werktempo richting een marathon rond 3:30.",
        tempo: "Marathontempo is ongeveer 11,8–12,1 km/u. Exact 3:30 vraagt ongeveer 12,06 km/u gemiddeld.",
        incline: "Gebruik bij voorkeur 0% als je strak tempo en techniek wilt oefenen. 1% kan, maar alleen als controle goed blijft.",
        good: "Loop de snelle stukken rond 11,8–12,0 km/u gelijkmatig. Ga niet onnodig harder; de winst zit in controle.",
        tired: "Maak de snelle stukken korter of vervang door easy. Forceer geen marathontempo bij heup-, bovenbeen-, kuit- of enkelklachten.",
        technique: "Romp lang, pasritme soepel, ademhaling stevig maar controleerbaar, geen sprintgevoel.",
        why: "Deze run bouwt vertrouwen op in 12 km/u als werktempo richting de marathon.",
      },
      long: {
        goal: "Duurvermogen, mentale hardheid, energiehuishouding en belastbaarheid opbouwen.",
        tempo: "Rustige delen meestal 9,5–10,0 km/u. Marathontempo-delen alleen als het schema dat aangeeft: 11,8–12,0 km/u.",
        incline: "Voor lange loopbandruns is 0% prima. 1% mag, maar kies 0% als de training al zwaar is of herstel belangrijker is.",
        good: "Volg het schema. Versnel alleen als er expliciet een fast finish of MP-blok gepland staat.",
        tired: "Houd de hele long run rustig. Laat optionele fast finish of marathontempo weg.",
        technique: "Ontspannen blijven, zuinig lopen, niet te hard starten, voeding/hydratatie oefenen bij langere runs.",
        why: "De long run is de belangrijkste duurprikkel van de week en bereidt je lichaam voor op de marathonafstand.",
      },
      tempo: {
        goal: "Snelheidsreserve bouwen zodat marathontempo later makkelijker en beheerster voelt.",
        tempo: "Tempo/interval zit meestal boven marathontempo, vaak 12,5–13,5 km/u. Herstel rustig rond 9,5 km/u of wandel indien nodig.",
        incline: "0% is prima als controle en techniek belangrijker zijn dan extra belasting.",
        good: "Maak de uitvoering netter, niet per se zwaarder. Houd de snelle stukken technisch strak.",
        tired: "Maak er easy van of verkort de snelle stukken. Geen tempo forceren bij pijntjes.",
        technique: "Korte lichte pas, romp rechtop, niet sprinten, ademhaling controleren.",
        why: "Deze prikkel onderhoudt snelheid zonder dat de marathonpace zelf maximaal hoeft te voelen.",
      },
      strides: {
        goal: "Scherpte, souplesse en techniek behouden zonder veel vermoeidheid op te bouwen.",
        tempo: "De basis is easy. Strides zijn korte soepele versnellingen, geen sprint.",
        incline: "0% is prima. 1% hoeft niet bij strides; controle is belangrijker.",
        good: "Versnel soepel en ontspannen. Stop elke stride voordat het zwaar of geforceerd voelt.",
        tired: "Laat de strides weg en houd alleen de easy run over.",
        technique: "Licht op de voeten, ontspannen schouders, snelle maar gecontroleerde pas, niet duwen.",
        why: "Deze sessie houdt ritme en beengevoel wakker zonder de week te zwaar te maken.",
      },
      shakeout: {
        goal: "Benen losmaken en spanning verlagen zonder trainingsvermoeidheid te maken.",
        tempo: "Heel rustig. Eventuele korte versnellingen alleen om wakker te worden, niet om te trainen.",
        incline: "0% houden. Dit moet zo licht mogelijk blijven.",
        good: "Kort en fris houden. Stop met het gevoel dat je meer had kunnen doen.",
        tired: "Korter maken of overslaan. Frisheid is belangrijker dan afvinken.",
        technique: "Ontspannen lopen, rustig ademen, geen sprintgevoel, soepel eindigen.",
        why: "Deze run staat vlak voor de marathon om ritme te houden zonder vermoeidheid te stapelen.",
      },
      marathon: {
        goal: "De voorbereiding uitvoeren: gecontroleerd starten, ritme vasthouden en voeding/hydratatie volgens plan gebruiken.",
        tempo: "Richting 3:30 betekent ongeveer 12,0–12,1 km/u gemiddeld. Start niet sneller dan controleerbaar voelt.",
        incline: "Niet relevant buiten; op de loopband zou 0% controle geven, maar deze sessie is wedstrijddag.",
        good: "Blijf geduldig. Pas na 30 km denken aan vasthouden of voorzichtig versnellen.",
        tired: "Niet panikeren. Ritme, voeding, kleine stukken, controle terugvinden.",
        technique: "Zuinig lopen, ontspannen schouders, kort grondcontact, blijven eten en drinken.",
        why: "Dit is de dag waarvoor de long runs, marathontempo-stukken en taper zijn opgebouwd.",
      },
    }[kind];
    return {
      ...base,
      phase: phaseFocus(week.phaseId),
    };
  }

  function renderRunInfo(session, cardioBlock, week) {
    const info = runInfo(session, cardioBlock, week);
    return `
      <details class="run-info">
        <summary>Run-info bekijken</summary>
        <div class="details-body run-info-body">
          <p><strong>Doel:</strong> ${info.goal}</p>
          <p><strong>Tempo:</strong> ${info.tempo}</p>
          <p><strong>Incline:</strong> ${info.incline}</p>
          <p><strong>Als je je goed voelt:</strong> ${info.good}</p>
          <p><strong>Als je moe bent:</strong> ${info.tired}</p>
          <p><strong>Techniek:</strong> ${info.technique}</p>
          <p><strong>Waarom vandaag:</strong> ${info.why}</p>
        </div>
      </details>
    `;
  }

  function isRunFirstSession(session) {
    const title = session.title.toLowerCase();
    if (!session.cardio) return false;
    if (!session.exercises.length) return true;
    if (title.includes("easy run + mini strength")) return true;
    if (title.includes("upper") || title.includes("lower") || title.includes("gym")) return false;
    if (title.startsWith("run")) return true;
    if (title.includes("long run") || title.includes("shake-out")) return true;
    if (title.includes("marathon") && !title.includes("marathonpace")) return true;
    if (title.includes("wandelen") || session.type === "herstel") return true;
    return session.type === "run" || session.type === "long-run" || session.type === "marathon";
  }

  function renderSessionBlocks(session, key, week, mode, dateIso) {
    const strength = session.exercises.length
      ? `
        <section class="training-section strength-section">
        <div class="section-title section-title-strong">
          <div>
            <h2>Krachttraining</h2>
            <p>${session.exercises.length} ${session.exercises.length === 1 ? "oefening" : "oefeningen"}</p>
          </div>
        </div>
        <section class="exercise-list">
          ${session.exercises.map((item) => renderExercise(item, key, week, session, mode, dateIso)).join("")}
        </section>
        </section>
      `
      : "";
    const cardioBlock = session.cardio ? renderCardio(session.cardio, key, week, session, mode, dateIso) : "";
    if (!strength) return cardioBlock;
    if (!cardioBlock) return strength;
    return isRunFirstSession(session) ? `${cardioBlock}${strength}` : `${strength}${cardioBlock}`;
  }

  function bestResult(exerciseId) {
    const entries = getLogs().strength.filter((entry) => entry.exerciseId === exerciseId);
    if (!entries.length) return null;
    return entries.reduce((best, entry) => (score(entry) > score(best) ? entry : best), entries[0]);
  }

  function options(range, suffix, selected, includeBlank = true) {
    const items = [];
    if (includeBlank) items.push(`<option value="">-</option>`);
    for (let value = range.min; value <= range.max + 0.0001; value += range.step || 1) {
      const normalized = Math.round(value * 10) / 10;
      const selectedAttr = String(selected ?? "") === String(normalized) ? " selected" : "";
      items.push(`<option value="${normalized}"${selectedAttr}>${formatNumber(normalized)} ${suffix}</option>`);
    }
    return items.join("");
  }

  function exerciseControls(exercise, log) {
    const type = exercise.inputType;
    const weight = log?.selectedWeight ?? "";
    const reps = log?.selectedReps ?? "";
    const seconds = log?.selectedSeconds ?? "";
    const minutes = log?.selectedMinutes ?? "";
    const distance = log?.selectedDistance ?? "";
    const makeSelect = (kind, label, optionHtml) => `
      <div class="field">
        <label>${label}</label>
        <select data-log-field="${kind}" data-exercise-id="${exercise.id}" inputmode="${kind === "weight" ? "decimal" : "numeric"}" autocomplete="off">
          ${optionHtml}
        </select>
      </div>`;

    if (type === "reps-only") {
      return `<div class="log-controls single">${makeSelect("reps", "Reps", options({ ...exercise.repRange, step: 1 }, "reps", reps))}</div>`;
    }
    if (type === "seconds") {
      return `<div class="log-controls single">${makeSelect("seconds", "Seconden", options(exercise.secondsRange, "sec", seconds))}</div>`;
    }
    if (type === "minutes") {
      return `<div class="log-controls single">${makeSelect("minutes", "Minuten", options(exercise.minutesRange, "min", minutes))}</div>`;
    }
    if (type === "weight-seconds") {
      return `<div class="log-controls">${makeSelect("weight", "Gewicht", options(exercise.weightRange, "kg", weight))}${makeSelect("seconds", "Seconden", options(exercise.secondsRange, "sec", seconds))}</div>`;
    }
    if (type === "weight-distance") {
      return `<div class="log-controls">${makeSelect("weight", "Gewicht", options(exercise.weightRange, "kg", weight))}${makeSelect("distance", "Meters", options(exercise.distanceRange, "m", distance))}</div>`;
    }
    if (type === "reps-or-seconds") {
      return `<div class="log-controls">${makeSelect("reps", "Reps", options({ ...exercise.repRange, step: 1 }, "reps", reps))}${makeSelect("seconds", "Seconden", options(exercise.secondsRange, "sec", seconds))}</div>`;
    }
    return `<div class="log-controls">${makeSelect("weight", "Gewicht", options(exercise.weightRange, "kg", weight))}${makeSelect("reps", "Reps", options({ ...exercise.repRange, step: 1 }, "reps", reps))}</div>`;
  }

  function renderToday() {
    const context = todayViewContext();
    const { week, session: active, dateIso } = context;
    todayPill.textContent = parseLocalDate(dateIso).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
    state.viewedWeekIndex = weeks.indexOf(week);

    if (!active) {
      app.innerHTML = `
        <section class="empty-state">
          <h2>Alle sessies van deze week zijn afgerond.</h2>
          <p class="muted">Nieuwe kalenderweek = nieuw weekschema. Geen achterstand, geen inhaalwerk.</p>
        </section>
        ${renderWeekSessions(week, null)}
      `;
      return;
    }

    app.innerHTML = renderSessionScreen(week, active, "today", { dateIso });
  }

  function renderSessionPreview() {
    const week = getWeekByIndex(state.preview?.weekIndex ?? state.viewedWeekIndex);
    const session = week.sessions.find((item) => item.sessionNumber === state.preview?.sessionNumber) || week.sessions[0];
    app.innerHTML = renderSessionScreen(week, session, "preview", { dateIso: plannedDateForSession(week, session) });
  }

  function renderSessionScreen(week, active, mode, options = {}) {
    const phase = getPhase(week.phaseId);
    const key = sessionKey(week, active);
    const isPreview = mode === "preview";
    const dateIso = options.dateIso || toIsoDate(today());
    return `
      ${isPreview ? `<button class="secondary-button back-button" type="button" data-back-week>Terug naar weekoverzicht</button>` : ""}
      <section class="hero-card session-hero-card">
        <p class="status-line">${phase.phaseName} · Week ${week.calendarWeek} · Sessie ${active.sessionNumber}/${week.sessions.length}</p>
        <h2 class="training-title">${active.title}</h2>
        <p class="session-summary">${sessionSummary(active)}</p>
        <div class="compact-meta">
          <span class="chip">${week.label}</span>
          <span class="chip">${formatDate(week.startDate)} - ${formatDate(week.endDate)}</span>
          <span class="chip">${active.type}</span>
        </div>
        ${!isPreview ? renderSessionActions(active, week) : ""}
      </section>

      ${renderSessionBlocks(active, key, week, mode, dateIso)}
      ${isPreview ? renderInfoBlocks(active.infoBlocks) : ""}

      ${isPreview ? "" : `<button class="primary-button" type="button" data-complete-session>Training afgerond</button>`}
    `;
  }

  function renderSessionActions(session, week) {
    return `
      <div class="session-actions">
        ${renderSessionPhilosophy(session, week)}
        <button class="detail-action-button" type="button" data-open-week-current>Week →</button>
      </div>
    `;
  }

  function sessionPhilosophy(session, week) {
    const phase = getPhase(week.phaseId);
    const hasStrength = session.exercises.length > 0;
    const hasRun = Boolean(session.cardio);
    const kind = hasRun ? runKind(session, session.cardio) : "strength";
    return {
      phase,
      hasStrength,
      hasRun,
      goal: sessionGoalText(session, kind),
      strength: hasStrength ? strengthPhilosophyText(session) : "Vandaag is er bewust geen krachttraining. De belasting draait vooral om hardlopen, herstel en de juiste loopprikkel.",
      running: hasRun ? runningPhilosophyText(session, session.cardio, kind) : "Vandaag is er bewust geen hardloopdeel. Zo blijft de krachttraining kwalitatief en stapel je niet onnodig loopvermoeidheid op.",
      combo: hasStrength && hasRun ? combinationPhilosophyText(session, kind) : "",
      phaseFit: phaseSessionFitText(phase, kind, hasStrength, hasRun),
      principles: trainingPrinciplesText(phase, kind, hasStrength, hasRun),
      good: goodDayAdvice(session, kind),
      tired: tiredDayAdvice(session, kind),
      focus: sessionFocusLine(session, kind),
    };
  }

  function sessionGoalText(session, kind) {
    const hasStrength = session.exercises.length > 0;
    const hasRun = Boolean(session.cardio);
    if (hasStrength && hasRun && kind === "easy") {
      return "Deze sessie combineert serieuze krachttraining met een rustige easy run. Het doel is kracht behouden en tegelijk extra loopvolume toevoegen zonder de week zwaar te maken.";
    }
    if (hasStrength && hasRun && kind === "mp") {
      return "Deze sessie combineert upper-body krachttraining met een korte prikkel richting 3:30-marathontempo. Het doel is kracht behouden én sneller lopen gecontroleerd leren aanvoelen.";
    }
    if (hasStrength && hasRun) {
      return "Deze hybride sessie combineert krachttraining en hardlopen in één compacte trainingsdag. Het doel is de juiste prikkel halen zonder je herstel onnodig op te eten.";
    }
    if (hasRun && kind === "long") return "De long run bouwt duurvermogen, mentale rust, energiehuishouding en belastbaarheid op. Dit is één van de belangrijkste trainingen richting de marathon.";
    if (hasRun && kind === "mp") return "Deze sessie leert je 11,8–12,0 km/u als gecontroleerd werktempo ervaren richting een marathon rond 3:30.";
    if (hasRun && kind === "tempo") return "Deze sessie bouwt snelheidsreserve zodat marathontempo later makkelijker en beheerster voelt.";
    if (hasRun) return "Deze run bouwt rustige kilometers, ritme en herstelvermogen op zonder de week onnodig zwaar te maken.";
    return "Deze sessie richt zich op kracht, spiermassa, belastbaarheid en blessurepreventie zonder extra hardloopbelasting.";
  }

  function strengthPhilosophyText(session) {
    const title = session.title.toLowerCase();
    if (title.includes("lower") || title.includes("leg") || title.includes("runner legs")) {
      return "Het krachtdeel richt zich op benen, billen, heupcontrole, kuiten, tibialis en core. Oefeningen zoals leg press, hip thrust, lunges, calf raises en tibialis raises bouwen de structuren die later meer loopvolume moeten kunnen verdragen. Voor krachttraining log je per oefening één beste of laatste werkset, zodat het invullen snel blijft maar progressie zichtbaar wordt.";
    }
    if (title.includes("full body") || title.includes("maintenance") || title.includes("mini strength")) {
      return "Het krachtdeel is onderhoudend: genoeg prikkel voor spiermassa, core, heupen, kuiten en bovenlichaam, maar niet bedoeld om je loopweek te slopen. De oefeningen houden je sterk en stabiel terwijl hardlopen steeds belangrijker wordt.";
    }
    return "Het krachtdeel richt zich vooral op borst, rug, schouders, rear delts, core en lichte brachialis-rehab. Machines en gecontroleerde accessoires geven een stevige prikkel zonder onnodig risico voor schouder, brachialis of onderrug. Voor krachttraining log je per oefening één beste of laatste werkset, zodat progressie volgen compact blijft.";
  }

  function runningPhilosophyText(session, cardioBlock, kind) {
    const summary = runCardSummary(session, cardioBlock);
    const segments = describeFastSegments(cardioBlock.instruction);
    if (kind === "easy") {
      return `De easy run is bewust rustig: ${summary}. Dit is geen conditietest en geen tempotraining. Buiten moet je kunnen praten in volledige zinnen.`;
    }
    if (kind === "mp") {
      return `Het hardloopdeel traint marathontempo in kleine, controleerbare doses. ${segments}. Het moet stevig maar beheerst voelen: geen sprint, geen test, wel gelijkmatig lopen.`;
    }
    if (kind === "tempo") {
      return `Het hardloopdeel is een tempo-/intervalprikkel. ${segments}. Het doel is snelheidsreserve bouwen met nette techniek, niet maximaal stukgaan.`;
    }
    if (kind === "long") {
      return `Vandaag staat de lange duurloop centraal: ${summary}. Begin rustig. Als er marathontempo in staat, loop je dat precies zoals gepland en niet harder.`;
    }
    if (kind === "strides") {
      return `De basis is easy lopen met korte soepele versnellingen. De versnellingen zijn bedoeld voor souplesse en scherpte, niet als sprinttraining.`;
    }
    if (kind === "shakeout") {
      return `De shake-out is kort en licht: ${summary}. Het doel is benen losmaken en fris blijven, niet extra conditie opbouwen.`;
    }
    if (kind === "marathon") {
      return "Dit is wedstrijddag. Start gecontroleerd, blijf rond het geplande ritme en voer voeding en hydratatie uit zoals geoefend.";
    }
    return `Het hardloopdeel volgt het schema: ${summary}. Houd het doel van de run leidend en maak hem niet automatisch zwaarder.`;
  }

  function describeFastSegments(instruction) {
    const text = String(instruction || "").replace(/\s*x\s*/gi, " × ");
    const repeat = text.match(/(\d+)\s*×\s*(\d+(?:[–-]\d+)?)\s*min\s*(?:op\s*)?(\d{1,2},\d(?:[–-]\d{1,2},\d)?)?/i);
    if (repeat) {
      const tempo = repeat[3] ? ` op ${repeat[3]} km/u` : "";
      return `Loop de ${repeat[1]} snelle stukken van ${repeat[2]} minuten${tempo} gecontroleerd en constant`;
    }
    const kmRepeat = text.match(/(\d+)\s*×\s*(\d+(?:[–-]\d+)?)\s*km/i);
    if (kmRepeat) return `Loop de ${kmRepeat[1]} marathontempo-delen van ${kmRepeat[2]} km gelijkmatig en zonder sprintgevoel`;
    const speed = runTopSpeedLabel(text);
    if (speed) return `Loop de snelle stukken rond ${speed} km/u gelijkmatig en technisch netjes`;
    return "Loop de snellere stukken gelijkmatig en controleerbaar";
  }

  function combinationPhilosophyText(session, kind) {
    const title = session.title.toLowerCase();
    if (title.includes("mini strength")) {
      return "De mini-strength staat bij een easy run omdat dit de frequentie verhoogt zonder een volledige extra gymdag te worden. Je onderhoudt kracht en prehab terwijl de run de hoofdprikkel blijft.";
    }
    if (kind === "easy") {
      return "De easy run staat bewust bij upper-body of een lichte hybride dag. Zo voeg je loopvolume toe zonder je zware lower-body dagen direct te verstoren.";
    }
    if (kind === "mp" || kind === "tempo") {
      return "De tempoprikkel staat bij een upper-body sessie, zodat zware beentraining de looptechniek niet vooraf saboteert. Je oefent snelheid met relatief frisse benen.";
    }
    return "De combinatie bundelt twee prikkels op één dag, zodat andere dagen ruimte houden voor herstel of een belangrijke run.";
  }

  function phaseSessionFitText(phase, kind, hasStrength, hasRun) {
    const phaseText = {
      "fase-1": "Dit is Fase 1: krachttraining blijft dominant en hardlopen wordt voorzichtig toegevoegd. Het doel is belastbaarheid opbouwen, niet bewijzen dat je al marathonfit bent.",
      "fase-2": "Dit is Fase 2: de loopfrequentie gaat naar drie runs per week, terwijl krachttraining compact maar belangrijk blijft.",
      "fase-3": "Dit is Fase 3: hardlopen wordt een vaste hoofdpijler naast krachttraining. Long runs en wekelijkse marathonpace worden belangrijker.",
      "fase-4": "Dit is Fase 4: de marathonspecifieke piekfase. Hardlopen is leidend en krachttraining ondersteunt vooral herstel, stabiliteit en blessurepreventie.",
      "fase-5": "Dit is Fase 5: taper. Volume omlaag, korte prikkels behouden en geen nieuwe vermoeidheid verzamelen.",
      "fase-6": "Dit is de herstelfase na de marathon: rustig bewegen en gecontroleerd terug naar krachttraining.",
    }[phase.phaseId] || phase.phaseDetails?.primaryGoal || phase.goal;
    if (kind === "long") return `${phaseText} De long run is hier de belangrijkste duurprikkel van de week.`;
    if (hasStrength && hasRun) return `${phaseText} Deze sessie laat kracht en lopen naast elkaar bestaan zonder dat alles op één beendag stapelt.`;
    return phaseText;
  }

  function trainingPrinciplesText(phase, kind, hasStrength, hasRun) {
    const principles = ["progressive overload", "herstel", "belastbaarheid"];
    if (hasRun) principles.push("easy/hard-balans");
    if (kind === "mp" || kind === "long" || kind === "tempo" || kind === "marathon") principles.push("specificiteit");
    if (hasStrength) principles.push("krachtbehoud en blessurepreventie");
    if (phase.phaseId === "fase-5") principles.push("taper en frisheid");
    return `${principles.join(", ")}. De training moet de juiste prikkel geven zonder onnodige vermoeidheid te stapelen.`;
  }

  function goodDayAdvice(session, kind) {
    if (kind === "easy") return "Voer het krachtdeel technisch strak uit en houd de run alsnog ontspannen. Maak van de easy run geen tempo-run.";
    if (kind === "mp") return `${describeFastSegments(session.cardio?.instruction)}. Ga niet veel harder dan gepland; de winst zit in controle.`;
    if (kind === "tempo") return `${describeFastSegments(session.cardio?.instruction)}. Maak de uitvoering netter in plaats van zwaarder.`;
    if (kind === "long") return "Volg het schema. Versnel alleen als er expliciet een fast finish of marathontempo-deel gepland staat.";
    if (session.exercises.length) return "Train stevig maar technisch. Geen ego-gewicht; houd 1–3 reps in reserve waar dat past.";
    return "Voer de training netjes uit en maak hem niet automatisch zwaarder.";
  }

  function tiredDayAdvice(session, kind) {
    if (kind === "mp" || kind === "tempo") return "Maak de snelle stukken korter, loop ze rustiger of vervang de run door easy. Forceer geen tempo bij heup-, bovenbeen-, kuit- of enkelklachten.";
    if (kind === "long") return "Houd de hele run rustig. Laat optionele versnellingen of marathontempo weg. Voeding oefenen en rustig uitlopen zijn belangrijker dan stoer tempo.";
    if (kind === "easy" || kind === "strides" || kind === "shakeout") return "Verkort de run met 5–10 minuten of laat versnellingen weg. Rustig blijven is vandaag genoeg.";
    if (session.exercises.length) return "Verminder gewicht of sets. Bij heup-, knie-, bovenbeen-, enkel-, schouder- of brachialisklachten kies je de meest gecontroleerde variant.";
    return "Maak de training korter of lichter. Geen ego-training.";
  }

  function sessionFocusLine(session, kind) {
    if (kind === "mp") return "12 km/u leren aanvoelen als gecontroleerd werktempo, niet als sprint.";
    if (kind === "long") return "Zuinig lopen, niet te hard starten en vertrouwen bouwen in langere afstanden.";
    if (kind === "tempo") return "Scherpte en techniek bouwen zonder jezelf leeg te trekken.";
    if (kind === "easy") return "Rustig volume opbouwen, niet bewijzen.";
    if (session.exercises.length) return "Sterk blijven zonder je loopweek te saboteren.";
    return "De juiste prikkel uitvoeren met controle.";
  }

  function renderSessionPhilosophy(session, week) {
    const info = sessionPhilosophy(session, week);
    const phase = getPhase(week.phaseId);
    const infoBlocks = Array.isArray(session.infoBlocks) ? session.infoBlocks : [];
    return `
      <details class="philosophy-details">
        <summary>Trainingsfilosofie</summary>
        <div class="details-body philosophy-body">
          <h4>Trainingsfilosofie van deze sessie</h4>
          <p><strong>Doel van vandaag:</strong> ${info.goal}</p>
          <p><strong>Krachttraining vandaag:</strong> ${info.strength}</p>
          <p><strong>Hardlopen vandaag:</strong> ${info.running}</p>
          ${info.combo ? `<p><strong>Waarom deze combinatie?</strong> ${info.combo}</p>` : ""}
          <p><strong>Hoe dit past binnen de fase:</strong> ${info.phase.phaseName}: ${info.phase.phaseDetails?.primaryGoal || info.phase.goal}</p>
          <p><strong>Fasecontext:</strong> ${info.phaseFit}</p>
          <p><strong>Trainingsprincipes:</strong> ${info.principles}</p>
          <p><strong>Schema-info:</strong> Warming-up: ${session.warmup || "Volgens schema."}</p>
          ${session.notes ? `<p><strong>Notitie:</strong> ${session.notes}</p>` : ""}
          <p><strong>Faseregel:</strong> ${phase.rules}</p>
          ${infoBlocks.map((block) => `<p><strong>${block.title}:</strong> ${block.text}</p>`).join("")}
          <p><strong>Als je je goed voelt:</strong> ${info.good}</p>
          <p><strong>Als je je minder goed voelt:</strong> ${info.tired}</p>
          <p><strong>Belangrijkste focus:</strong> ${info.focus}</p>
        </div>
      </details>
    `;
  }

  function renderInfoBlocks(infoBlocks = []) {
    if (!Array.isArray(infoBlocks) || !infoBlocks.length) return "";
    return infoBlocks
      .map(
        (block) => `
        <details class="info-block">
          <summary>${block.title}</summary>
          <div class="details-body">
            <p>${block.text}</p>
          </div>
        </details>`
      )
      .join("");
  }

  function renderExercise(exercise, key, week, active, mode = "today", dateIso = toIsoDate(today())) {
    const isPreview = mode === "preview";
    const log = isPreview ? null : latestStrengthLog(key, exercise.id);
    const best = isPreview ? null : bestResult(exercise.id);
    const alternatives = Array.isArray(exercise.alternatives) ? exercise.alternatives : [];
    const trackingAttrs = isPreview
      ? ""
      : `data-exercise-row data-session-key="${key}" data-log-date="${dateIso}" data-week="${week.calendarWeek}" data-phase="${week.phaseId}" data-session="${active.sessionNumber}" data-exercise-id="${exercise.id}" data-exercise-name="${escapeAttr(exercise.name)}" data-planned="${escapeAttr(exercise.planned)}"`;
    return `
      <article class="exercise-card" ${trackingAttrs}>
        <div class="exercise-top">
          <button class="exercise-name" type="button" data-toggle-details>${exercise.name}</button>
          <div class="planned">${plannedLabel(exercise)}</div>
        </div>
        ${isPreview ? "" : exerciseControls(exercise, log)}
        <details>
          <summary>Info bekijken</summary>
          <div class="details-body">
            ${isPreview ? "" : `<p><strong>Beste resultaat:</strong> ${best ? resultText(best) : "nog geen data"}</p>`}
            <p><strong>Tips:</strong> ${exercise.tips}</p>
            <p><strong>Regel:</strong> ${exercise.warning}</p>
            ${alternatives.length ? `<p><strong>Alternatieven:</strong> ${alternatives.join(", ")}</p>` : ""}
            <p>${exercise.info}</p>
            <button class="inline-link-button" type="button" data-open-exercise-stats="${escapeAttr(exercise.id)}" data-exercise-name="${escapeAttr(exercise.name)}">Bekijk statistieken →</button>
          </div>
        </details>
      </article>
    `;
  }

  function renderCardio(cardioBlock, key, week, active, mode = "today", dateIso = toIsoDate(today())) {
    const isPreview = mode === "preview";
    const log = isPreview ? {} : cardioLog(key) || {};
    const feelings = [
      ["easy", "Makkelijk"],
      ["normal", "Normaal"],
      ["heavy", "Zwaar"],
    ];
    const trackingAttrs = isPreview
      ? ""
      : `data-cardio-key="${key}" data-log-date="${dateIso}" data-week="${week.calendarWeek}" data-phase="${week.phaseId}" data-session="${active.sessionNumber}"`;
    const summary = runCardSummary(active, cardioBlock);
    return `
      <section class="training-section running-section">
      <div class="section-title section-title-strong">
        <div>
          <h2>Hardlopen</h2>
          <p>1 run · ${summary}</p>
        </div>
      </div>
      <section class="cardio-card" ${trackingAttrs}>
        <div class="cardio-title">
          <div>
            <h3>${cardioBlock.title}</h3>
            <p class="run-summary">${summary}</p>
          </div>
          ${isPreview ? `<span class="preview-pill">Preview</span>` : ""}
        </div>
        ${renderRunDetails(active, cardioBlock)}
        ${renderRunInfo(active, cardioBlock, week)}
        ${
          isPreview
            ? ""
            : `<div class="feeling-row">
                ${feelings.map(([value, label]) => `<button type="button" data-feeling="${value}" class="${log.cardioFeeling === value ? "is-selected" : ""}">${label}</button>`).join("")}
              </div>
              <label class="done-toggle done-toggle-footer">
                <input type="checkbox" data-cardio-done ${log.cardioDone ? "checked" : ""} />
                Gedaan
              </label>`
        }
      </section>
      </section>
    `;
  }

  function renderWeek() {
    const week = getWeekByIndex(state.viewedWeekIndex);
    const phase = getPhase(week.phaseId);
    const active = activeSessionForWeek(week);
    const summary = weekDashboardSummary(week);
    app.innerHTML = `
      <section class="week-dashboard">
        <div class="week-nav week-dashboard-header">
          <button type="button" data-week-prev aria-label="Vorige week">‹</button>
          <div class="week-title">
            <h2>Week ${week.calendarWeek}</h2>
            <p class="week-phase-line">${phase.phaseName}</p>
            <div class="week-title-tags"><span class="chip">${week.label}</span></div>
            <p class="muted small">${formatDate(week.startDate)} - ${formatDate(week.endDate)} · ${week.sessions.length} sessies</p>
            <p class="muted small week-countdown-line">${marathonCountdownText(week.startDate)}</p>
          </div>
          <button type="button" data-week-next aria-label="Volgende week">›</button>
        </div>
        <div class="week-summary-strip">
          <span>${summary.sessionCount} sessies</span>
          <span>${summary.strengthCount} kracht</span>
          <span>${summary.runCount} runs</span>
          <span>${summary.totalTime}</span>
          ${summary.longRun ? `<span>Long run: ${summary.longRun}</span>` : ""}
          ${summary.marathonPace ? `<span>MP: ${summary.marathonPace}</span>` : ""}
        </div>
        <div class="section-title section-title-strong week-sessions-title">
          <div>
            <h2>Sessies deze week</h2>
            <p>Planning eerst; details kun je per sessie openklappen.</p>
          </div>
        </div>
        ${renderWeekSessions(week, active)}
        ${renderWeekProgress(week)}
        ${renderWeekFocus(week)}
        ${renderWeekLoad(week)}
        ${renderWeekPhaseContext(week, phase)}
      </section>
    `;
  }

  function renderWeekSessions(week, active) {
    const done = getCompletedSet();
    const activeKey = active ? sessionKey(week, active) : null;
    return `
      <section class="session-list">
        ${week.sessions
          .map((item) => {
            const key = sessionKey(week, item);
            const status = done.has(key) ? "✓ Voltooid" : key === activeKey ? "Actief" : "Nog te doen";
            const statusClass = done.has(key) ? "status-done" : key === activeKey ? "status-active" : "status-next";
            const summary = sessionSummary(item);
            const runSummary = item.cardio ? runCardSummary(item, item.cardio) : "geen";
            const focus = sessionWeekFocus(item);
            return `
              <article class="session-card week-session-card">
                <div class="week-session-main">
                  <div>
                    <h3>${item.sessionNumber}. ${item.title}</h3>
                    <p class="status-line">${capitalize(item.type)} · ${summary}</p>
                    <p class="muted small"><strong>Run:</strong> ${runSummary}</p>
                    <p class="muted small"><strong>Focus:</strong> ${focus}</p>
                  </div>
                  <span class="status-badge ${statusClass}">${status}</span>
                </div>
                <details class="week-session-details">
                  <summary>Sessie-info</summary>
                  <div class="details-body">
                    <p><strong>Doel:</strong> ${item.goal || focus}</p>
                    ${item.exercises.length ? `<p><strong>Kracht:</strong> ${item.exercises.map((exercise) => exercise.name).join(", ")}</p>` : `<p><strong>Kracht:</strong> geen krachtdeel.</p>`}
                    ${item.cardio ? `<div class="week-run-details">${renderRunDetails(item, item.cardio)}</div>` : `<p><strong>Hardlopen:</strong> geen run.</p>`}
                    ${item.notes ? `<p><strong>Aandachtspunt:</strong> ${item.notes}</p>` : ""}
                    <div class="week-session-actions">
                      <button class="secondary-button" type="button" data-view-session-today data-week-index="${weeks.indexOf(week)}" data-session-number="${item.sessionNumber}">Bekijk op Vandaag</button>
                      <button class="secondary-button" type="button" data-preview-week-index="${weeks.indexOf(week)}" data-preview-session="${item.sessionNumber}">Preview</button>
                    </div>
                  </div>
                </details>
              </article>`;
          })
          .join("")}
      </section>
    `;
  }

  function weekDashboardSummary(week) {
    const runs = runSessions(week);
    return {
      sessionCount: week.sessions.length,
      strengthCount: week.sessions.filter((session) => session.exercises.length).length,
      runCount: runs.length,
      totalTime: weekEstimatedDuration(week),
      longRun: weekLongRunSummary(week),
      marathonPace: weekMarathonPaceSummary(week),
    };
  }

  function weekEstimatedDuration(week) {
    const ranges = week.sessions.map((session) => parseDurationToMinutes(estimatedSessionDuration(session)));
    const min = ranges.reduce((sum, range) => sum + range[0], 0);
    const max = ranges.reduce((sum, range) => sum + range[1], 0);
    return `± ${formatWeekHours(min, max)}`;
  }

  function parseDurationToMinutes(value) {
    const text = String(value || "").replace(/–/g, "-");
    const clockRange = text.match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)\s*uur/i);
    if (clockRange) return [Number(clockRange[1]) * 60 + Number(clockRange[2]), Number(clockRange[3]) * 60 + Number(clockRange[4])];
    const hourRange = text.match(/(\d+)(?:[,.](\d+))?\s*-\s*(\d+)(?:[,.](\d+))?\s*uur/i);
    if (hourRange) return [(Number(`${hourRange[1]}.${hourRange[2] || 0}`) * 60), (Number(`${hourRange[3]}.${hourRange[4] || 0}`) * 60)];
    const minRange = text.match(/(\d+)\s*-\s*(\d+)\s*min/i);
    if (minRange) return [Number(minRange[1]), Number(minRange[2])];
    const exactMin = text.match(/(\d+)\s*min/i);
    if (exactMin) return [Number(exactMin[1]), Number(exactMin[1])];
    return [50, 70];
  }

  function formatWeekHours(minMinutes, maxMinutes) {
    const min = Math.round(minMinutes / 30) * 0.5;
    const max = Math.round(maxMinutes / 30) * 0.5;
    const format = (hours) => Number.isInteger(hours) ? `${hours}` : String(hours).replace(".", ",");
    return `${format(min)}–${format(Math.max(min, max))} uur`;
  }

  function weekLongRunSummary(week) {
    const longRun = week.sessions.find((session) => session.type === "long-run" || `${session.title} ${session.cardio?.title || ""}`.toLowerCase().includes("long run"));
    return longRun?.cardio ? runCardSummary(longRun, longRun.cardio) : "";
  }

  function weekMarathonPaceSummary(week) {
    const mp = runSessions(week).find((session) => /11,5|11,8|12,0|12,1|marathontempo|marathonpace|3:30|MP/i.test(`${session.title} ${session.cardio?.instruction || ""} ${session.cardio?.outdoor || ""}`));
    if (!mp?.cardio) return "";
    return describeFastSegments(mp.cardio.instruction).replace(/\.$/, "");
  }

  function sessionWeekFocus(session) {
    if (session.goal) return session.goal;
    if (session.cardio) return sessionFocusLine(session, runKind(session, session.cardio));
    if (session.title.toLowerCase().includes("lower")) return "benen, heupcontrole, kuit/tibialis en core";
    if (session.title.toLowerCase().includes("upper")) return "upper body, houding, schouderbalans en brachialis rustig houden";
    return "kracht onderhouden en herstel bewaken";
  }

  function renderWeekProgress(week) {
    const completed = getCompletedSet();
    const sessionDone = week.sessions.filter((session) => completed.has(sessionKey(week, session))).length;
    const runs = runSessions(week);
    const runDone = runs.filter((session) => completed.has(sessionKey(week, session)) || cardioLog(sessionKey(week, session))?.cardioDone).length;
    const strengthSessions = week.sessions.filter((session) => session.exercises.length);
    const strengthDone = strengthSessions.filter((session) => completed.has(sessionKey(week, session))).length;
    const pct = week.sessions.length ? Math.round((sessionDone / week.sessions.length) * 100) : 0;
    return `
      <section class="stat-card week-progress-card">
        <h3>Voortgang deze week</h3>
        <p class="status-line">${sessionDone ? `${sessionDone} van ${week.sessions.length} sessies voltooid` : "Nog geen sessies voltooid deze week."}</p>
        <div class="progress-bar"><span style="width: ${pct}%"></span></div>
        <p class="muted small">${runDone} van ${runs.length} runs · ${strengthDone} van ${strengthSessions.length} krachttrainingen · ${pct}% voltooid</p>
      </section>
    `;
  }

  function renderWeekFocus(week) {
    return `
      <details class="info-block">
        <summary>Weekfocus bekijken</summary>
        <div class="details-body">
          <p>${weekFocusText(week)}</p>
        </div>
      </details>
    `;
  }

  function weekFocusText(week) {
    const explicit = {
      22: "Deze week draait om rustig beginnen. Krachttraining blijft dominant en hardlopen wordt voorzichtig toegevoegd: één easy run en één korte tempo-intro. Het doel is loopritme opbouwen en 11,5 km/u kort leren voelen.",
      27: "Deze week voeg je de derde run toe. Het belangrijkste doel is wennen aan meer loopfrequentie zonder de krachttraining meteen te zwaar te maken.",
      39: "Deze week bevat de eerste echte long run met marathontempo. De midweekse kwaliteit blijft bewust lichter, zodat de long run de hoofdprikkel kan zijn.",
      42: "Dit is de belangrijkste generale repetitie. Het doel is om na een rustige aanloop 10–12 km rond marathontempo te lopen zonder de rest van de week te zwaar te maken.",
    };
    return explicit[week.calendarWeek] || runBuildWeekGoal(week);
  }

  function renderWeekLoad(week) {
    const summary = weekDashboardSummary(week);
    return `
      <details class="info-block">
        <summary>Weekbelasting bekijken</summary>
        <div class="details-body">
          <p><strong>Krachttraining:</strong> ${summary.strengthCount} sessies.</p>
          <p><strong>Hardlopen:</strong> ${summary.runCount} runs.</p>
          <p><strong>Marathontempo:</strong> ${summary.marathonPace || "niet als hoofdprikkel deze week."}</p>
          <p><strong>Long run:</strong> ${summary.longRun || "nog geen echte long run in deze week."}</p>
          <p><strong>Geschatte totale duur:</strong> ${summary.totalTime}.</p>
          <p><strong>Aandachtspunt:</strong> ${weekAttentionText(week)}</p>
        </div>
      </details>
    `;
  }

  function weekAttentionText(week) {
    if (week.calendarWeek === 42) return "Niet stapelen. Fris genoeg blijven voor de 28 km generale repetitie.";
    if (week.calendarWeek === 39) return "Midweek bewust lichter houden zodat 24 km met marathontempo goed landt.";
    if (week.phaseId === "fase-1") return "Easy runs easy houden en brachialis/bicep links rustig monitoren.";
    if (week.phaseId === "fase-4") return "Krachttraining ondersteunend houden rond zware long runs.";
    if (week.phaseId === "fase-5") return "Geen paniektraining; frisheid is nu belangrijker dan extra volume.";
    return "De geplande prikkels halen zonder elke sessie zwaarder te maken.";
  }

  function renderWeekPhaseContext(week, phase) {
    return `
      <details class="info-block">
        <summary>Deze week binnen de fase</summary>
        <div class="details-body">
          <p>Deze week valt in ${phase.phaseName}. ${phase.phaseDetails?.primaryGoal || phase.goal}</p>
        </div>
      </details>
    `;
  }

  function renderPhases() {
    app.innerHTML = `
      <section class="phase-list">
        ${phases
          .map(
            (phase) => `
          <article class="phase-card" data-phase-id="${phase.phaseId}">
            <h3>${phase.phaseName}</h3>
            <p class="status-line">${phase.weekRange} · ${formatDate(phase.startDate)} - ${formatDate(phase.endDate)}</p>
            <div class="compact-meta phase-meta">
              <span class="chip">Duur: ${phaseDuration(phase)} weken</span>
              <span class="chip">Runs: ${phase.phaseDetails?.runsPerWeek || "-"}</span>
              <span class="chip">Gym: ${phase.phaseDetails?.gymPerWeek || "-"}</span>
              <span class="chip">${phaseWeeksToMarathonText(phase) || "Na marathon"}</span>
            </div>
            <p class="goal"><strong>Doel:</strong> ${phase.phaseDetails?.primaryGoal || phase.goal}</p>
            <details class="phase-details"${state.targetPhaseId === phase.phaseId ? " open" : ""}>
              <summary>Lees faseplan</summary>
              <div class="details-body">
                ${renderPhaseDetails(phase)}
              </div>
            </details>
          </article>`
          )
          .join("")}
      </section>
    `;
    if (state.targetPhaseId) {
      window.requestAnimationFrame(() => {
        document.querySelector(`[data-phase-id="${state.targetPhaseId}"]`)?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    }
  }

  function phaseGuide(phase) {
    const guides = {
      "fase-1": {
        philosophy: "Je bent hier nog geen volledige marathonloper. Je bent een sterke sporter die hardlopen slim inbouwt. Eerst belastbaarheid, daarna ambitie.",
        running: "Twee runs per week: een easy run en een korte 3:30-tempo-intro. Easy groeit van ongeveer 20 minuten naar 25–30 minuten.",
        strength: "Krachttraining blijft de hoofdstructuur: borst, rug, schouders, benen, billen, core, kuiten, tibialis en algemene spiermassa.",
        marathonPace: "12 km/u wordt alleen kort aangeraakt met 3 × 2 min, 4 × 2 min, 3 × 3 min en 4 × 3 min. Gewenning, geen test.",
        longRun: "Nog geen echte marathon-long-run. De nadruk ligt op loopgewenning.",
        important: "Consistentie, blessurevrij blijven, rustig wennen aan lopen.",
        caution: "Niet te snel te veel willen. Monitor heup, bovenbeen, enkel, kuiten, tibialis en brachialis.",
        mental: "Rustig beginnen. Geen bewijsdrang.",
        outcome: "Hardlopen moet normaal beginnen te voelen in je week, zodat je klaar bent voor drie runs per week.",
      },
      "fase-2": {
        philosophy: "Dit is een overgangsfase. Eerst vaker lopen, daarna pas langer en specifieker lopen.",
        running: "Drie runs per week: easy run, 3:30 marathonpace-intro, easy run + mini strength.",
        strength: "Van vier volledige gymdagen naar drie echte gymdagen plus een korte hybride run/kracht-dag.",
        marathonPace: "Blokken rond 11,8–12,0 km/u worden iets langer, zoals 4 × 3 min en 3 × 5 min.",
        longRun: "Nog geen echte lange duurloop zoals later in het schema. De totale loopfrequentie gaat omhoog.",
        important: "Wennen aan drie runs per week zonder jezelf te slopen.",
        caution: "De derde run niet behandelen als extra zware training. Het is vooral een frequentieprikkel.",
        mental: "Loopritme opbouwen en vertrouwen krijgen dat hardlopen naast krachttraining kan bestaan.",
        outcome: "Drie keer per week lopen moet haalbaar voelen.",
      },
      "fase-3": {
        philosophy: "Capaciteit bouwen: duurvermogen, ritme en marathontempo opbouwen zonder jezelf al in de piekfase te slopen.",
        running: "Drie runs per week: Easy Run, 3:30 Marathonpace Run en Long Run.",
        strength: "Drie gerichte sessies per week. Geen PR-jacht; onderhoud van spiermassa, kracht, core, heupen, kuiten, tibialis en blessurepreventie.",
        marathonPace: "Je traint 12 km/u wekelijks: 3 × 4 min, 3 × 5 min, 2 × 8 min, 3 × 6 min, 2 × 10 min, 15 min + 8 min en 20 min + 8 min.",
        longRun: "Long run groeit van ongeveer 60 minuten richting 115–120 minuten en blijft grotendeels rustig.",
        important: "Alle drie de runs halen als het kan. Marathonpace-run en long run worden steeds belangrijker.",
        caution: "Niet elke run te hard maken. Easy moet easy blijven; long run is nog geen wedstrijdsimulatie.",
        mental: "Hardlopen is nu geen toevoeging meer, maar een hoofdonderdeel van de week.",
        outcome: "Een stevige loopbasis, long runs rond 2 uur en 12 km/u als bekend werktempo.",
      },
      "fase-4": {
        philosophy: "Specifieker en iets minder conservatief: niet dom agressief, wel praktischer richting wedstrijddag.",
        running: "Vier runs per week: Easy Run, Marathonpace Run, Tempo/interval of techniekprikkel, Long Run.",
        strength: "Ondersteunend. Geen zware benen vlak voor belangrijke long runs. Core, heupen, kuiten, tibialis en blessurepreventie blijven belangrijk.",
        marathonPace: "11,8–12,0/12,1 km/u wordt racespecifiek: midweek en in long runs. Week 39, 41, 42 en optioneel 44 zijn sleutelprikkels.",
        longRun: "Long runs lopen op richting 30–32 km. Sommige krijgen MP-blokken; week 43 blijft bewust rustig ondanks de afstand.",
        important: "MP-long-runs geven vertrouwen, maar mogen niet bovenop te zware midweekse kwaliteit worden gestapeld.",
        caution: "Te veel intensiteit combineren. In zware long-run-weken moet midweek lichter.",
        mental: "Ervaren dat je 12 km/u kunt lopen terwijl je benen al moe zijn.",
        outcome: "Afstandsvertrouwen én tempovertrouwen richting marathon.",
      },
      "fase-5": {
        philosophy: "Het werk is gedaan. Nu vermoeidheid laten zakken: niet meer trainen, maar beter verschijnen aan de start.",
        running: "Volume omlaag. Long runs korter. Korte marathonpace-prikkels blijven aanwezig.",
        strength: "Alleen onderhoud. Geen zware benen, geen spierpijn najagen, geen nieuwe oefeningen.",
        marathonPace: "Korte gecontroleerde stukken zoals 2 × 10 min, 2 × 6 min en korte stukjes in marathonweek.",
        longRun: "Long run wordt duidelijk korter. Geen zware test meer.",
        important: "Rustig blijven, slapen, voeding op orde, geen experimenten en vertrouwen op de voorbereiding.",
        caution: "Paniektraining. Niet ineens extra trainen omdat de marathon dichterbij komt.",
        mental: "Je hoeft niets meer te bewijzen. Je hoeft alleen fit aan de start te staan.",
        outcome: "Frisse benen, vertrouwen en scherpte op marathondag.",
      },
    };
    return guides[phase.phaseId] || {
      philosophy: "Herstellen en gecontroleerd terugbouwen na de marathon.",
      running: "Alleen korte rustige loopjes als het lichaam goed voelt.",
      strength: "Rustig terug naar krachttraining zonder PR-jacht.",
      marathonPace: "Geen marathontempo in deze herstelfase.",
      longRun: "Geen lange duurloop.",
      important: "Herstel eerst, opbouw daarna.",
      caution: "Geen tempo of zware lower body als het lichaam nog reageert.",
      mental: "Rustig opnieuw bouwen is winst.",
      outcome: "Hersteld en klaar voor een nieuwe krachtbasis.",
    };
  }

  function renderPhaseDetails(phase) {
    const guide = phaseGuide(phase);
    return `
      <div class="phase-detail-block">
        <h4>Doel van deze fase</h4>
        <p>${phase.phaseDetails?.primaryGoal || phase.goal}</p>
      </div>
      <div class="phase-detail-block">
        <h4>Waarom deze fase bestaat</h4>
        <p>${phase.phaseDetails?.sections?.find((section) => section.title.includes("Waarom"))?.text || phase.goal}</p>
      </div>
      <div class="phase-detail-block"><h4>Trainingsfilosofie</h4><p>${guide.philosophy}</p></div>
      <div class="phase-detail-block"><h4>Wat doe ik qua hardlopen?</h4><p>${guide.running}</p></div>
      <div class="phase-detail-block"><h4>Wat doe ik qua krachttraining?</h4><p>${guide.strength}</p></div>
      <div class="phase-detail-block"><h4>Wat doe ik qua marathontempo?</h4><p>${guide.marathonPace}</p></div>
      <div class="phase-detail-block"><h4>Wat gebeurt er met de long run?</h4><p>${guide.longRun}</p></div>
      <div class="phase-detail-block"><h4>Wat is vooral belangrijk?</h4><p>${guide.important}</p></div>
      <div class="phase-detail-block"><h4>Waar moet ik voor oppassen?</h4><p>${guide.caution}</p></div>
      <div class="phase-detail-block"><h4>Mentale focus</h4><p>${guide.mental}</p></div>
      <div class="phase-detail-block">
        <h4>Wat moet deze fase opleveren?</h4>
        <p>${guide.outcome}</p>
      </div>
    `;
  }

  function runningBuildPhases() {
    return phases.filter((phase) => phase.phaseId !== "fase-6");
  }

  function runningBuildWeeks() {
    return weeks.filter((week) => week.calendarWeek >= 22 && week.calendarWeek <= 47);
  }

  function phaseDuration(phase) {
    return (phase.weeks || []).length || runningBuildWeeks().filter((week) => week.phaseId === phase.phaseId).length;
  }

  function phaseWeeksToMarathonText(phase) {
    const phaseWeeks = (phase.weeks || []).filter((week) => week.calendarWeek <= 47);
    if (!phaseWeeks.length) return "";
    const start = weeksUntilMarathon(phaseWeeks[0].startDate);
    const end = phase.phaseId === "fase-5" ? 0 : weeksUntilMarathon(phaseWeeks[phaseWeeks.length - 1].startDate);
    return `Ongeveer ${start} tot ${end} weken tot de marathon`;
  }

  function runSessions(week) {
    return week.sessions.filter((session) => session.cardio);
  }

  function runBuildWeekGoal(week) {
    const explicit = {
      22: "Start rustig. Ritme opbouwen en niets forceren.",
      26: "Klaar zijn voor 3 runs per week in Fase 2.",
      27: "Derde loopmoment toevoegen zonder de week te zwaar te maken.",
      29: "Start van de vaste easy run + marathonpace-run + long-run structuur.",
      35: "Langste duurloop van Fase 3 en veel duurvermogen bouwen.",
      36: "Lichtere brugweek richting de piekfase.",
      37: "Start piekfase: vier runs per week, nog gecontroleerd.",
      39: "Eerste echte marathonpace-long-run. Midweek bewust lichter.",
      40: "Cutbackweek. Week 39 verwerken.",
      41: "Leren versnellen op vermoeide benen.",
      42: "Belangrijkste generale repetitie van de voorbereiding.",
      43: "Langste duurloop: afstand, voeding, mentale hardheid en vertrouwen.",
      44: "Alleen MP toevoegen als week 42 en 43 goed verteerd zijn.",
      45: "Volume omlaag, ritme behouden.",
      46: "Frisheid opbouwen.",
      47: "Geen experimenten. Fris worden en uitvoeren.",
    };
    if (explicit[week.calendarWeek]) return explicit[week.calendarWeek];
    const phase = getPhase(week.phaseId);
    if (phase.phaseId === "fase-1") return "Loopgewenning en korte tempo-intro's opbouwen.";
    if (phase.phaseId === "fase-2") return "Loopfrequentie verhogen en 12 km/u gecontroleerd langer vasthouden.";
    if (phase.phaseId === "fase-3") return "Long run en wekelijkse marathonpace-prikkel verder opbouwen.";
    if (phase.phaseId === "fase-4") return "Marathonspecifieker trainen zonder te stapelen.";
    return "Taper: minder volume, scherp blijven.";
  }

  function renderRunBuild() {
    const tabs = [
      ["overview", "Overzicht"],
      ["weeks", "Week per week"],
      ["longRuns", "Long runs"],
      ["marathonPace", "Marathontempo"],
      ["keyWeeks", "Sleutelweken"],
      ["paces", "Tempo's"],
    ];
    const renderContent = {
      overview: renderBuildOverview,
      weeks: renderBuildWeeks,
      longRuns: renderBuildLongRuns,
      marathonPace: renderBuildMarathonPace,
      keyWeeks: renderBuildKeyWeeks,
      paces: renderBuildPaces,
    }[state.runBuildTab] || renderBuildOverview;
    const content = renderContent();
    app.innerHTML = `
      <section class="build-page">
        <div class="section-title build-title">
          <h2>Hardloopopbouw</h2>
        </div>
        <div class="build-tabs" role="tablist" aria-label="Hardloopopbouw onderdelen">
          ${tabs.map(([id, label]) => `<button type="button" data-run-tab="${id}" class="${state.runBuildTab === id ? "is-active" : ""}">${label}</button>`).join("")}
        </div>
        ${content}
      </section>
    `;
  }

  function renderBuildOverview() {
    return `
      <article class="info-card build-hero-card">
        <h3>Hardloopopbouw richting 3:30 marathon</h3>
        <p>Dit schema bereidt mij voor op een marathon rond 3:30 uur op zondag 22 november 2026. Daarvoor moet ik ongeveer 12,06 km/u gemiddeld lopen. Praktisch train ik daarom met marathontempo rond 11,8–12,1 km/u. De opbouw gaat stap voor stap: eerst rustige loopgewenning, daarna meer loopfrequentie, vervolgens long runs en wekelijks marathontempo, daarna een piekfase met marathontempo op vermoeide benen, en tot slot een taper om fris aan de start te staan.</p>
      </article>
      <section class="stat-grid build-metric-grid">
        ${metricCard("Doel", "3:30", "marathon rond 3:30")}
        ${metricCard("Benodigd tempo", "±12,06", "km/u gemiddeld")}
        ${metricCard("Praktisch MP", "11,8–12,1", "km/u")}
        ${metricCard("Start", "25 mei", "maandag 2026")}
        ${metricCard("Marathon", "22 nov", "zondag 2026")}
        ${metricCard("Voorbereiding", "±26", "weken")}
        ${metricCard("Opbouw", "2 → 3 → 4", "runs per week")}
        ${metricCard("Langste long run", "30–32 km")}
        ${metricCard("Belangrijkste test", "28 km", "met 10–12 km MP")}
      </section>
      <article class="info-card">
        <h3>In één oogopslag</h3>
        <ul class="compact-list">
          <li>Fase 1: 2 runs per week, rustige loopgewenning en korte tempo-intro.</li>
          <li>Fase 2: 3 runs per week, hardlopen wordt structureler.</li>
          <li>Fase 3: 3 runs per week met vaste long run en wekelijkse marathonpace-run.</li>
          <li>Fase 4: 4 runs per week met marathonspecifieke long runs.</li>
          <li>Fase 5: volume omlaag, korte prikkels blijven, fris worden.</li>
          <li>Long runs bouwen op van 60 min naar 30–32 km.</li>
          <li>Marathontempo begint met korte stukken van 2–3 min en groeit naar 10–12 km MP binnen een long run.</li>
          <li>Niet elke long run is hard; de zwaarste weken zitten in Fase 4.</li>
        </ul>
      </article>
      <article class="info-card">
        <h3>De logica van de opbouw</h3>
        <div class="phase-detail-block"><h4>1. Belastbaarheid</h4><p>Eerst wennen aan regelmatig lopen zonder krachttraining en herstel te slopen.</p></div>
        <div class="phase-detail-block"><h4>2. Frequentie</h4><p>Daarna van 2 naar 3 runs per week, zodat hardlopen een vaste pijler wordt.</p></div>
        <div class="phase-detail-block"><h4>3. Duurvermogen</h4><p>Vervolgens long runs opbouwen, zodat het lichaam gewend raakt aan langer op de benen zijn.</p></div>
        <div class="phase-detail-block"><h4>4. Marathontempo</h4><p>Daarna 11,8–12,1 km/u steeds vaker trainen: eerst kort, later langer.</p></div>
        <div class="phase-detail-block"><h4>5. Specificiteit</h4><p>In Fase 4 komt marathontempo binnen lange duurlopen, zodat 12 km/u ook met vermoeide benen bekend wordt.</p></div>
        <div class="phase-detail-block"><h4>6. Taper</h4><p>In de laatste weken gaat het volume omlaag, zodat vermoeidheid zakt en fitheid zichtbaar wordt.</p></div>
        <p>Het doel is niet om in training een volledige marathon op tempo te bewijzen, maar om voldoende duurvermogen, tempovertrouwen, long-run-ervaring en herstel op te bouwen om op marathondag gecontroleerd richting 3:30 te lopen.</p>
      </article>
      <section class="info-list">
        ${runningBuildPhases().map(renderBuildOverviewPhase).join("")}
      </section>
      <article class="info-card">
        <h3>Hoe vaak loop ik per week?</h3>
        <div class="phase-detail-block"><h4>Fase 1 · 2 runs</h4><p>1 easy run en 1 korte tempo-intro.</p></div>
        <div class="phase-detail-block"><h4>Fase 2 · 3 runs</h4><p>Easy run, marathonpace-intro en easy run + mini strength.</p></div>
        <div class="phase-detail-block"><h4>Fase 3 · 3 runs</h4><p>Easy run, marathonpace-run en long run.</p></div>
        <div class="phase-detail-block"><h4>Fase 4 · 4 runs</h4><p>Easy run, marathonpace/tempo-run, techniek/interval/easy en long run.</p></div>
        <div class="phase-detail-block"><h4>Fase 5 · dalend</h4><p>Korte easy runs, korte MP-prikkels, shake-out en marathon.</p></div>
        <p>De frequentie stijgt niet in één keer naar 4 runs. Eerst wordt het lichaam belastbaar gemaakt, daarna wordt de loopfrequentie verhoogd, en pas in de piekfase wordt hardlopen echt leidend.</p>
      </article>
      <section class="accordion-list">
        <div class="section-title section-title-strong">
          <div>
            <h2>Extra verdieping</h2>
            <p>Open wat je uitgebreider wilt lezen.</p>
          </div>
        </div>
      <details class="info-block">
        <summary>Marathontempo-opbouw</summary>
        <div class="details-body">
          <p>Marathontempo betekent in dit schema ongeveer 11,8–12,1 km/u. Exact 3:30 vraagt ongeveer 12,06 km/u gemiddeld. Daarom is 12 km/u de praktische trainingsreferentie.</p>
          <div class="phase-detail-block"><h4>Fase 1</h4><p>3 × 2 min op 11,5 km/u, 4 × 2 min op 11,8 km/u, 4 × 2 min op 12,0 km/u en 3–4 × 3 min op 12,0 km/u. Doel: 12 km/u kort herkennen.</p></div>
          <div class="phase-detail-block"><h4>Fase 2</h4><p>4 × 3 min en 3 × 5 min rond 11,8–12,0 km/u. Doel: iets langer op MP lopen.</p></div>
          <div class="phase-detail-block"><h4>Fase 3</h4><p>Wekelijkse MP-runs: 3 × 4 min, 3 × 5 min, 2 × 8 min, 3 × 6 min, 2 × 10 min, 15 min + 8 min en 20 min + 8 min.</p></div>
          <div class="phase-detail-block"><h4>Fase 4</h4><p>MP binnen long runs: week 39 met 2 × 3 km MP, week 41 met 6–8 km MP aan het einde, week 42 met 10–12 km MP binnen 28 km en week 44 optioneel 6 km MP.</p></div>
          <div class="phase-detail-block"><h4>Fase 5</h4><p>Korte MP-prikkels om ritme te behouden zonder vermoeidheid op te bouwen.</p></div>
          <p>De opbouw gaat van kort aanraken naar langere stukken naar marathontempo in een lange duurloop. Dat is precies de specificiteit die nodig is voor een 3:30-doel.</p>
        </div>
      </details>
      <details class="info-block">
        <summary>Long-run-opbouw</summary>
        <div class="details-body">
          <p>Fase 1 en 2 hebben nog geen echte long runs. In Fase 3 groeit de long run van 60 min naar 115–120 min. In Fase 4 groeien long runs richting 30–32 km en krijgen sommige trainingen marathontempo. In Fase 5 worden ze korter richting marathondag.</p>
          <ul class="compact-list">
            <li>Week 35: 115–120 min rustig</li>
            <li>Week 39: 24 km met 2 × 3 km MP</li>
            <li>Week 41: 26 km met 6–8 km MP aan het einde</li>
            <li>Week 42: 28 km met 10–12 km MP</li>
            <li>Week 43: 30–32 km rustig</li>
            <li>Week 47: marathon</li>
          </ul>
          <p>De long run bouwt niet alleen conditie op, maar ook pezen, spieren, gewrichten, mentale rust, voeding/hydratatie en vertrouwen in langere afstanden.</p>
        </div>
      </details>
      <details class="info-block">
        <summary>Waarom dit richting 3:30 werkt</summary>
        <div class="details-body">
          <p>Een marathon van 3:30 vraagt niet alleen snelheid, maar vooral het vermogen om een stevig tempo lang economisch vol te houden. Daarom combineert dit schema easy runs, long runs, marathonpace-runs, interval/tempo, krachttraining en taper.</p>
          <p>De kern is dat 12 km/u eerst kort wordt geoefend, daarna langer, en uiteindelijk in lange duurlopen op vermoeide benen. Daardoor wordt 12 km/u niet alleen een tempo dat ik kort kan halen, maar een tempo dat ik steeds beter kan controleren.</p>
          <p><strong>Let op:</strong> dit schema garandeert geen 3:30, maar het bevat wel de belangrijkste bouwstenen: consistentie, duurvermogen, marathontempo, lange duurlopen, specifieke piektrainingen en taper.</p>
        </div>
      </details>
      <details class="info-block">
        <summary>Belangrijkste controlepunten</summary>
        <div class="details-body">
          <ul class="compact-list">
            <li>Week 27: kan ik drie runs per week aan?</li>
            <li>Week 35: kan ik 115–120 min rustig lopen?</li>
            <li>Week 39: eerste long run met marathontempo.</li>
            <li>Week 41: marathontempo aan het einde van 26 km.</li>
            <li>Week 42: belangrijkste generale repetitie, 28 km met 10–12 km MP.</li>
            <li>Week 43: langste duurloop, 30–32 km rustig.</li>
            <li>Week 45: start taper.</li>
            <li>Week 47: marathonweek.</li>
          </ul>
          <p>Deze weken laten zien of de opbouw werkt. Vooral week 39, 41, 42 en 43 zijn belangrijk voor vertrouwen richting 3:30.</p>
        </div>
      </details>
      </section>
    `;
  }

  function renderBuildOverviewPhase(phase) {
    const detail = buildOverviewPhaseData(phase);
    return `
      <article class="info-card">
        <h3>${phase.phaseName}</h3>
        <p class="status-line">${phase.weekRange} · ${formatDate(phase.startDate)} - ${formatDate(phase.endDate)}</p>
        <div class="compact-meta">
          <span class="chip">Duur: ${phaseDuration(phase)} weken</span>
          <span class="chip">${detail.weeksToMarathon}</span>
          <span class="chip">Runs: ${detail.runs}</span>
          <span class="chip">Gym: ${detail.gym}</span>
        </div>
        <p class="goal"><strong>Long run:</strong> ${detail.longRun}</p>
        <p class="goal"><strong>Marathontempo:</strong> ${detail.marathonPace}</p>
        <p class="goal"><strong>Doel:</strong> ${detail.goal}</p>
        <p class="goal"><strong>Opleveren:</strong> ${detail.outcome}</p>
      </article>
    `;
  }

  function buildOverviewPhaseData(phase) {
    const data = {
      "fase-1": {
        weeksToMarathon: "Nog ±26 tot 22 weken",
        runs: "2 per week",
        gym: "4 per week",
        longRun: "nog geen echte long run",
        marathonPace: "korte introducties van 2–3 minuten",
        goal: "hardlopen rustig toevoegen terwijl krachttraining dominant blijft",
        outcome: "loopgewenning, eerste tempoherkenning en blessurevrij starten",
      },
      "fase-2": {
        weeksToMarathon: "Nog ±21 tot 20 weken",
        runs: "3 per week",
        gym: "3 + mini-strength",
        longRun: "nog beperkt; frequentie staat centraal",
        marathonPace: "4 × 3 min en 3 × 5 min rond 11,8–12,0 km/u",
        goal: "de derde run toevoegen",
        outcome: "hardlopen wordt een vaste pijler in de week",
      },
      "fase-3": {
        weeksToMarathon: "Nog ±19 tot 12 weken",
        runs: "3 per week",
        gym: "3 per week",
        longRun: "van 60 min naar 115–120 min",
        marathonPace: "wekelijks, van 3 × 4 min naar 20 min + 8 min",
        goal: "de marathonmotor bouwen",
        outcome: "duurvermogen, ritme en eerste serieuze MP-gewenning",
      },
      "fase-4": {
        weeksToMarathon: "Nog ±11 tot 4 weken",
        runs: "4 per week",
        gym: "2–3 ondersteunend",
        longRun: "20 km naar 30–32 km",
        marathonPace: "binnen lange duurlopen",
        goal: "racespecifiek vertrouwen bouwen",
        outcome: "12 km/u leren lopen op vermoeide benen",
      },
      "fase-5": {
        weeksToMarathon: "Nog ±3 tot 0 weken",
        runs: "dalend / korter",
        gym: "onderhoud",
        longRun: "korter, geen zware test meer",
        marathonPace: "korte prikkels",
        goal: "fris worden",
        outcome: "uitgerust en scherp aan de start verschijnen",
      },
    };
    return data[phase.phaseId] || {
      weeksToMarathon: phaseWeeksToMarathonText(phase) || "Na marathon",
      runs: phase.phaseDetails?.runsPerWeek || "-",
      gym: phase.phaseDetails?.gymPerWeek || "-",
      longRun: "herstel en terugkeer",
      marathonPace: "geen marathontempo",
      goal: phase.phaseDetails?.primaryGoal || phase.goal,
      outcome: "rustig herstellen en opnieuw opbouwen",
    };
  }

  function renderBuildPhases() {
    return `
      <section class="info-list">
        ${runningBuildPhases()
          .map((phase) => {
            const detail = phase.phaseDetails || {};
            return `
              <article class="info-card">
                <h3>${phase.phaseName}</h3>
                <p class="status-line">${phase.weekRange} · ${formatDate(phase.startDate)} - ${formatDate(phase.endDate)}</p>
                <div class="compact-meta">
                  <span class="chip">Duur: ${phaseDuration(phase)} weken</span>
                  <span class="chip">Runs: ${detail.runsPerWeek || "-"}</span>
                  <span class="chip">${phaseWeeksToMarathonText(phase)}</span>
                </div>
                <p class="goal"><strong>Hoofddoel:</strong> ${detail.primaryGoal || phase.goal}</p>
                <details>
                  <summary>Fase uitleg</summary>
                  <div class="details-body">
                    ${renderPhaseDetails(phase)}
                  </div>
                </details>
              </article>
            `;
          })
          .join("")}
      </section>
    `;
  }

  function renderBuildWeeks() {
    return `
      <section class="info-list">
        ${runningBuildWeeks().map(renderBuildWeekCard).join("")}
      </section>
    `;
  }

  function renderBuildWeekCard(week) {
    const phase = getPhase(week.phaseId);
    const runs = runSessions(week);
    const duration = phaseDuration(phase);
    const weeksLeft = week.calendarWeek === 47 ? "Marathonweek" : `Nog ongeveer ${weeksUntilMarathon(week.startDate)} weken tot de marathon`;
    return `
      <article class="info-card">
        <h3>Week ${week.calendarWeek}</h3>
        <p class="status-line">${formatDate(week.startDate)} - ${formatDate(week.endDate)} · ${phase.phaseName}</p>
        <div class="compact-meta">
          <span class="chip">Faseduur: ${duration} weken</span>
          <span class="chip">${weeksLeft}</span>
          <span class="chip">${runs.length} runs</span>
        </div>
        <details>
          <summary>Runs en weekdoel</summary>
          <div class="details-body">
            ${runs.map((session, index) => renderBuildRun(session, index)).join("")}
            <div class="phase-detail-block">
              <h4>Belangrijk deze week</h4>
              <p>${runBuildWeekGoal(week)}</p>
            </div>
          </div>
        </details>
      </article>
    `;
  }

  function renderBuildRun(session, index) {
    const cardio = session.cardio;
    return `
      <div class="phase-detail-block">
        <h4>Run ${index + 1} — ${cardio.title}</h4>
        <p>${cardio.instruction}</p>
        ${cardio.outdoor ? `<p class="muted small">${cardio.outdoor}</p>` : ""}
        ${cardio.notes ? `<p class="muted small">${cardio.notes}</p>` : ""}
      </div>
    `;
  }

  function renderBuildLongRuns() {
    const longRunRows = [];
    for (let weekNo = 29; weekNo <= 45; weekNo += 1) {
      const week = weeks.find((item) => item.calendarWeek === weekNo);
      const longRun = week?.sessions.find((session) => session.type === "long-run");
      if (week && longRun) longRunRows.push({ week, session: longRun });
    }
    const week46 = weeks.find((item) => item.calendarWeek === 46);
    const week47 = weeks.find((item) => item.calendarWeek === 47);
    const marathon = week47?.sessions.find((session) => session.type === "marathon");
    return `
      <article class="info-card build-hero-card">
        <h3>Long-run-opbouw</h3>
        <p>Vanaf Fase 3 komt er meestal één long run per week in het schema. Die long run is de belangrijkste duurprikkel van de week. In Fase 3 zijn de long runs vooral rustig en bedoeld om duurvermogen, pezen, gewrichten, energiehuishouding en mentale gewenning op te bouwen.</p>
        <p>In Fase 4 worden sommige long runs marathonspecifieker. Dan komen er stukken rond 11,8–12,0 km/u in de lange duurloop, zodat ik leer om marathontempo te lopen met vermoeide benen. Niet elke lange duurloop is hard: sommige weken blijven bewust rustig, juist omdat de afstand zelf al een grote belasting is.</p>
      </article>
      <article class="info-card">
        <h3>Long-run-regel</h3>
        <ul class="compact-list">
          <li>Fase 1: nog geen echte long runs.</li>
          <li>Fase 2: nog geen echte long runs.</li>
          <li>Fase 3: 1 long run per week, vooral rustig.</li>
          <li>Fase 4: 1 long run per week, soms met marathontempo.</li>
          <li>Fase 5: long run wordt korter richting marathonweek.</li>
          <li>Marathonweek: geen normale long run meer, maar de marathon zelf.</li>
        </ul>
      </article>
      <section class="info-list">
        ${longRunRows.map((row) => renderLongRunBuildCard(row)).join("")}
        ${week46 ? renderNoLongRunBuildCard(week46) : ""}
        ${week47 && marathon ? renderLongRunBuildCard({ week: week47, session: marathon }) : ""}
      </section>
    `;
  }

  function renderLongRunBuildCard({ week, session }) {
    const phase = getPhase(week.phaseId);
    const cardio = session.cardio;
    const weekNo = week.calendarWeek;
    const isMarathon = session.type === "marathon";
    const keyClass = [39, 41, 42, 43, 44].includes(weekNo) ? " is-key-long-run" : "";
    return `
      <article class="info-card long-run-build-card${keyClass}">
        <h3>Week ${weekNo} — ${isMarathon ? "Marathon" : "Long Run"}</h3>
        <p class="status-line">${formatDate(week.startDate)} - ${formatDate(week.endDate)}</p>
        <p class="muted small">${phase.phaseName}</p>
        <p class="muted small">${isMarathon ? "Marathonweek" : `Nog ${weeksUntilMarathon(week.startDate)} weken tot marathon`}</p>
        <div class="compact-meta">
          <span class="chip">${isMarathon ? "Marathon deze week" : "1 long run deze week"}</span>
          <span class="chip">${runSessions(week).length} runs totaal</span>
          <span class="chip">${longRunTypeLabel(weekNo)}</span>
          <span class="chip">Marathontempo: ${longRunMarathonPaceLabel(weekNo, session)}</span>
        </div>
        <p class="goal"><strong>${isMarathon ? "Run" : "Long run"}:</strong> ${runCardSummary(session, cardio)}</p>
        <div class="long-run-plan">${renderRunDetails(session, cardio)}</div>
        <p class="goal"><strong>Doel:</strong> ${longRunGoalText(weekNo)}</p>
        <details>
          <summary>Meer uitleg</summary>
          <div class="details-body">
            <p><strong>Waarom deze week?</strong> ${longRunWhyText(weekNo)}</p>
            <p><strong>Wat oefen ik?</strong> ${longRunPracticeText(weekNo)}</p>
            <p><strong>Als ik me goed voel:</strong> ${longRunGoodText(weekNo)}</p>
            <p><strong>Als ik moe ben:</strong> ${longRunTiredText(weekNo)}</p>
            <p><strong>Belangrijkste focus:</strong> ${longRunFocusText(weekNo)}</p>
          </div>
        </details>
      </article>
    `;
  }

  function renderNoLongRunBuildCard(week) {
    const phase = getPhase(week.phaseId);
    return `
      <article class="info-card long-run-build-card">
        <h3>Week ${week.calendarWeek} — Geen echte long run meer</h3>
        <p class="status-line">${formatDate(week.startDate)} - ${formatDate(week.endDate)}</p>
        <p class="muted small">${phase.phaseName}</p>
        <p class="muted small">Nog ${weeksUntilMarathon(week.startDate)} weken tot marathon</p>
        <div class="compact-meta">
          <span class="chip">0 long runs deze week</span>
          <span class="chip">${runSessions(week).length} runs totaal</span>
          <span class="chip">${longRunTypeLabel(week.calendarWeek)}</span>
          <span class="chip">Marathontempo: korte prikkel</span>
        </div>
        <p class="goal"><strong>Long run:</strong> geen normale lange duurloop meer; korte taper-runs houden het ritme wakker.</p>
        <p class="goal"><strong>Doel:</strong> vermoeidheid laten zakken terwijl je loopgevoel behouden blijft.</p>
        <details>
          <summary>Meer uitleg</summary>
          <div class="details-body">
            <p><strong>Waarom deze week?</strong> De marathon is dichtbij. Extra lange belasting levert nu minder op dan frisheid.</p>
            <p><strong>Wat oefen ik?</strong> Ritme, ontspanning en vertrouwen zonder vermoeidheid te stapelen.</p>
            <p><strong>Als ik me goed voel:</strong> Houd het kort en netjes. Meer doen is hier niet automatisch beter.</p>
            <p><strong>Als ik moe ben:</strong> Korter lopen of een prikkel overslaan is logisch. Frisheid is de prioriteit.</p>
            <p><strong>Belangrijkste focus:</strong> Fit worden, niet fitheid bewijzen.</p>
          </div>
        </details>
      </article>
    `;
  }

  function longRunTypeLabel(weekNo) {
    const labels = {
      29: "Rustige basis-long-run",
      30: "Rustige opbouw-long-run",
      31: "Langere rustige duurloop",
      32: "Duurvermogen uitbreiden",
      33: "Eerste langere duurprikkel",
      34: "Stevige rustige long run",
      35: "Langste long run van Fase 3",
      36: "Lichtere brugweek",
      37: "Start piekfase-long-run",
      38: "Long run met optionele steady finish",
      39: "Eerste marathonpace-long-run",
      40: "Cutback-long-run",
      41: "Progressieve marathonpace-long-run",
      42: "Belangrijkste generale repetitie",
      43: "Langste duurloop",
      44: "Laatste specifieke long run / optioneel MP",
      45: "Taper-long-run",
      46: "Geen echte long run meer",
      47: "Marathon",
    };
    return labels[weekNo] || "Long run";
  }

  function longRunMarathonPaceLabel(weekNo, session) {
    const labels = {
      39: "ja — 2 × 3 km op 11,8–12,0 km/u",
      41: "ja — 6–8 km aan het einde",
      42: "ja — 10–12 km binnen 28 km",
      43: "nee — bewust rustig ondanks langste afstand",
      44: "optioneel — 6 km als herstel goed is",
      47: "wedstrijddag",
    };
    if (labels[weekNo]) return labels[weekNo];
    const text = `${session?.cardio?.instruction || ""} ${session?.cardio?.notes || ""}`.toLowerCase();
    if (text.includes("mp") || text.includes("marathontempo") || text.includes("11,8") || text.includes("12,0")) return "ja";
    return "nee";
  }

  function longRunGoalText(weekNo) {
    const goals = {
      29: "Dit is de eerste echte long run van de marathonopbouw. Het doel is rustig duurvermogen opbouwen zonder de week te zwaar te maken.",
      35: "Dit is de langste duurloop van Fase 3. Het doel is om een stevige aerobe basis te bouwen voordat de piekfase begint.",
      39: "Dit is de eerste long run waarin marathontempo echt binnen een langere duurloop komt. Het doel is leren om 12 km/u gecontroleerd te lopen terwijl je al kilometers in de benen hebt.",
      41: "Deze long run maakt marathontempo progressiever: het tempo komt later in de training, wanneer je benen al vermoeider zijn.",
      42: "Dit is de belangrijkste vertrouwenstraining van de marathonvoorbereiding. Je leert om marathontempo te lopen nadat je al langere tijd onderweg bent.",
      43: "Dit is de langste duurloop van de voorbereiding. Het doel is afstandsvertrouwen, voeding, hydratatie, mentale hardheid en belastbaarheid.",
      44: "Deze week is de laatste specifieke long-run-prikkel. Marathontempo is alleen zinvol als herstel en benen goed voelen.",
      47: "De marathon is de uitvoering van de voorbereiding: gecontroleerd starten, ritme vasthouden en voeding/hydratatie gebruiken zoals geoefend.",
    };
    if (goals[weekNo]) return goals[weekNo];
    if (weekNo >= 30 && weekNo <= 34) return "Deze long run vergroot rustig het duurvermogen en laat je lichaam wennen aan langer op de benen zijn.";
    if (weekNo === 36) return "Deze long run is bewust lichter, zodat de lange opbouw uit Fase 3 kan landen voor de piekfase start.";
    if (weekNo === 37 || weekNo === 38) return "Deze long run brengt je de piekfase in: langer lopen blijft belangrijk, maar de belasting wordt nog gecontroleerd gehouden.";
    if (weekNo === 40) return "Dit is een cutback-long-run: genoeg duurprikkel om ritme te houden, maar lichter om de specifieke week 39 te verwerken.";
    if (weekNo === 45) return "Deze taper-long-run houdt duurgevoel vast, maar verlaagt de totale belasting richting marathondag.";
    return "Deze long run ondersteunt de stapsgewijze marathonopbouw.";
  }

  function longRunWhyText(weekNo) {
    const texts = {
      29: "Vanaf Fase 3 wordt de long run een vast onderdeel van de week. Deze eerste long run is nog relatief kort, zodat je lichaam kan wennen aan langere loopbelasting.",
      35: "Na meerdere weken opbouw is je lichaam klaar voor een langere duurprikkel. Daarna volgt een lichtere brugweek, zodat je deze belasting kunt verwerken.",
      39: "De weken ervoor bouw je volume en basis op. Deze week wordt de long run specifieker, maar nog niet extreem zwaar. Daarom blijven de midweekse prikkels bewust lichter.",
      42: "Deze week ligt ver genoeg van de marathon om nog goed te herstellen, maar dichtbij genoeg om zeer specifiek te zijn. Dit is geen gewone long run, maar een gerichte voorbereiding op marathondag.",
      43: "De week ervoor bevat al een zware marathonpace-long-run. Daarom blijft deze langste duurloop bewust rustig. De afstand zelf is al zwaar genoeg.",
      44: "Na de generale repetitie en de langste duurloop is dit een laatste controleprikkel. Alleen doen wat herstel toelaat.",
      47: "Alle eerdere long runs, marathontempo-stukken en de taper komen samen in de wedstrijd.",
    };
    if (texts[weekNo]) return texts[weekNo];
    if (weekNo >= 30 && weekNo <= 34) return "De long run groeit stap voor stap, zodat duurvermogen stijgt zonder dat elke week een test wordt.";
    if (weekNo === 36) return "Deze week werkt als brug: niet lui, wel genoeg ruimte om fris richting Fase 4 te gaan.";
    if (weekNo === 40) return "Na een eerste marathonpace-long-run is een lichtere week nodig om de belasting te verwerken.";
    if (weekNo === 41) return "Na de cutback kan de long run weer specifieker worden, met marathontempo later in de training.";
    if (weekNo === 45) return "De taper is gestart. Je houdt het long-run-ritme vast, maar het volume gaat duidelijk omlaag.";
    return "Deze week past in de rustige, progressieve opbouw richting langere en specifiekere duurlopen.";
  }

  function longRunPracticeText(weekNo) {
    if ([39, 41, 42, 44].includes(weekNo)) return "Je oefent pacing, schakelen tussen rustig tempo en marathontempo, herstel na sneller lopen en mentaal rustig blijven tijdens een langere training.";
    if (weekNo === 43) return "Je oefent lang op de benen zijn, rustig blijven, niet te snel starten, voeding nemen en mentaal kalm blijven over een lange afstand.";
    if (weekNo === 47) return "Je oefent niets nieuws meer; je voert pacing, voeding, hydratatie en mentale controle uit zoals voorbereid.";
    return "Je oefent ontspannen lopen, rustig tempo houden, ademhaling controleren, voeding/hydratatie opbouwen en langere tijd op de benen zijn.";
  }

  function longRunGoodText(weekNo) {
    const texts = {
      29: "Blijf alsnog rustig. Maak er geen tempo-run van. Eventueel mag je de laatste paar minuten iets actiever lopen, maar alleen als het heel ontspannen blijft.",
      35: "Blijf beheerst. Deze run hoeft niet hard. De winst zit in de duur, niet in snelheid.",
      39: "Voer de twee stukken van 3 km op marathontempo strak en constant uit. Ga niet harder dan gepland.",
      42: "Kies eventueel de agressievere variant, maar alleen als de eerdere weken goed verteerd zijn. Houd marathontempo gecontroleerd; niet sneller lopen om jezelf te bewijzen.",
      43: "Blijf alsnog rustig. Geen verplichte fast finish en geen marathontempo. De prestatie is de afstand beheerst voltooien.",
      44: "Doe het optionele marathontempo alleen als je echt goed hersteld bent. Controle is belangrijker dan extra bewijsdrang.",
      47: "Blijf geduldig. Start gecontroleerd en denk pas later in de race aan vasthouden of voorzichtig versnellen.",
    };
    return texts[weekNo] || "Volg het schema. Als alles soepel voelt, maak de uitvoering netter, niet automatisch zwaarder.";
  }

  function longRunTiredText(weekNo) {
    const texts = {
      29: "Houd 9,5 km/u aan of verkort de run iets. Het belangrijkste is dat je de long-run-gewoonte opbouwt.",
      35: "Blijf volledig easy of verkort naar 100–110 minuten. Liever goed herstellen dan deze run forceren.",
      39: "Maak er een rustige 22–24 km duurloop van zonder marathontempo, of doe slechts 1 × 3 km op marathontempo.",
      42: "Kies de standaardvariant of verkort het marathontempo-deel. Als je benen zwaar of gevoelig zijn, maak er een rustige long run van.",
      43: "Kies 28–30 km rustig of loop op tijd in plaats van afstand. Forceer geen 32 km als herstel of pijntjes niet goed voelen.",
      44: "Laat het optionele marathontempo weg en houd de long run korter of rustiger.",
      47: "Niet panikeren. Zoek ritme, voeding en kleine stukken. Controle terugvinden is belangrijker dan forceren.",
    };
    return texts[weekNo] || "Houd de hele run rustig of verkort hem iets. Laat optionele versnellingen weg bij zware benen of pijntjes.";
  }

  function longRunFocusText(weekNo) {
    const texts = {
      29: "Rustig lang leren lopen zonder bewijsdrang.",
      35: "Duurvermogen bouwen en klaar worden voor Fase 4.",
      39: "Eerste vertrouwen opbouwen in marathontempo tijdens een lange run.",
      42: "Bewijzen aan je lichaam dat marathontempo ook later in een lange run gecontroleerd kan voelen.",
      43: "Langste afstand beheerst voltooien zonder jezelf kapot te lopen.",
      44: "Specifiek blijven zonder de taper alvast te saboteren.",
      47: "Uitvoeren wat je hebt opgebouwd.",
    };
    return texts[weekNo] || "Zuinig lopen, rustig starten en de long-run-opbouw consistent houden.";
  }

  function renderBuildMarathonPace() {
    const groups = [
      ["Fase 1", ["3 × 2 min", "4 × 2 min", "3 × 3 min", "4 × 3 min"]],
      ["Fase 2", ["4 × 3 min", "3 × 5 min"]],
      ["Fase 3", ["3 × 4 min", "3 × 5 min", "2 × 8 min", "3 × 6 min", "2 × 10 min", "15 min + 8 min", "20 min + 8 min"]],
      ["Fase 4", ["Midweek MP-runs", "Snellere tempo/intervaltrainingen", "MP binnen lange duurlopen"]],
    ];
    return `
      <article class="info-card">
        <h3>Marathontempo / MP</h3>
        <p>MP is in dit schema ongeveer 11,8–12,1 km/u. Voor een marathon rond 3:30 is ongeveer 12,06 km/u nodig. Daarom is 12,0 km/u een praktische trainingsreferentie.</p>
      </article>
      <section class="info-list">
        ${groups
          .map(
            ([title, items]) => `
            <article class="info-card">
              <h3>${title}</h3>
              <ul class="compact-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>
            </article>`
          )
          .join("")}
        <article class="info-card">
          <h3>Belangrijkste MP-long-runs</h3>
          <ul class="compact-list">
            <li>Week 39: 6 km MP binnen 24 km</li>
            <li>Week 41: 6–8 km MP binnen 26 km</li>
            <li>Week 42: 10–12 km MP binnen 28 km</li>
            <li>Week 44: optioneel 6 km MP binnen 22–24 km</li>
          </ul>
          <p>Je hoeft in training geen 42,2 km op marathontempo te bewijzen. Je bouwt vertrouwen op door 12 km/u steeds vaker, langer en later ook op vermoeide benen te lopen.</p>
        </article>
      </section>
    `;
  }

  function renderBuildKeyWeeks() {
    const keyWeeks = [
      [22, "Start voorbereiding", "Eerste week van het schema. Rustig beginnen, 2 runs per week."],
      [27, "Eerste week met 3 runs", "Hardlopen wordt structureler."],
      [29, "Eerste echte hybride week", "Easy run + marathonpace-run + long run worden de vaste hardloopstructuur."],
      [35, "Langste long run van Fase 3", "115-120 minuten rustig lopen. Belangrijk voor duurvermogen."],
      [37, "Start piekfase", "Vanaf nu 4 runs per week en marathonspecifiekere belasting."],
      [39, "Eerste long run met marathontempo", "24 km met 2 × 3 km op marathontempo. Eerste echte test van 12 km/u op vermoeide benen."],
      [41, "Marathontempo aan het einde", "26 km met 6-8 km rond marathontempo aan het einde."],
      [42, "Belangrijkste generale repetitie", "28 km met 10-12 km marathontempo. Dit is de belangrijkste vertrouwenstraining."],
      [43, "Langste duurloop", "30-32 km rustig. Doel is afstand, voeding, mentale hardheid en vertrouwen."],
      [45, "Start taper", "Volume omlaag, scherpte behouden."],
      [47, "Marathonweek", "Fris worden en uitvoeren."],
    ];
    return `
      <section class="info-list">
        ${keyWeeks
          .map(([weekNo, title, why]) => {
            const week = weeks.find((item) => item.calendarWeek === weekNo);
            return `
              <article class="info-card">
                <h3>Week ${weekNo} — ${title}</h3>
                ${week ? `<p class="status-line">${formatDate(week.startDate)} - ${formatDate(week.endDate)} · ${getPhase(week.phaseId).phaseName}</p>` : ""}
                <p><strong>Waarom belangrijk:</strong> ${why}</p>
              </article>
            `;
          })
          .join("")}
        <article class="info-card">
          <p>Je hoeft in training geen 42,2 km op marathontempo te bewijzen. Je bouwt vertrouwen op door lange rustige duurlopen, wekelijkse marathonpace-prikkels, enkele specifieke long runs met marathontempo, goede voedingstraining en een slimme taper.</p>
        </article>
      </section>
    `;
  }

  function renderBuildPaces() {
    const paces = [
      ["Easy / rustig", "9,5-10,0 km/u", "Basis, herstel, rustige kilometers.", "Praten in volledige zinnen mogelijk."],
      ["Steady", "10,5-11,2 km/u", "Iets actiever lopen zonder te forceren.", "Serieus maar beheerst."],
      ["Marathontempo / MP", "11,8-12,1 km/u", "Tempo richting 3:30 marathon.", "Hard maar controleerbaar. Exact 3:30 vraagt ongeveer 12,06 km/u gemiddeld."],
      ["Tempo / interval", "12,5-13,5 km/u", "Snelheidsreserve bouwen zodat 12 km/u makkelijker voelt.", "Stevig, maar technisch netjes."],
      ["Herstel tussen blokken", "9,5 km/u of wandelen indien nodig", "Herstellen tussen snelle blokken.", "Controle terugkrijgen."],
    ];
    return `
      <section class="info-list">
        ${paces
          .map(
            ([title, range, goal, feel]) => `
            <article class="info-card">
              <h3>${title}</h3>
              <p class="status-line">${range}</p>
              <p><strong>Doel:</strong> ${goal}</p>
              <p><strong>Gevoel:</strong> ${feel}</p>
            </article>`
          )
          .join("")}
      </section>
    `;
  }

  function renderNutrition() {
    const tabs = [
      ["overview", "Overzicht"],
      ["phases", "Per fase"],
      ["training", "Voor trainingen"],
      ["longRuns", "Long runs & gels"],
      ["marathonWeek", "Marathonweek"],
      ["practical", "Praktisch eten"],
    ];
    const renderTab = {
      overview: renderNutritionOverview,
      phases: renderNutritionPhases,
      training: renderNutritionTraining,
      longRuns: renderNutritionLongRuns,
      marathonWeek: renderNutritionMarathonWeek,
      practical: renderNutritionPractical,
    }[state.nutritionTab] || renderNutritionOverview;
    app.innerHTML = `
      <section class="build-page nutrition-page">
        <div class="section-title build-title">
          <h2>Voeding</h2>
        </div>
        <div class="build-tabs" role="tablist" aria-label="Voeding onderdelen">
          ${tabs.map(([id, label]) => `<button type="button" data-nutrition-tab="${id}" class="${state.nutritionTab === id ? "is-active" : ""}">${label}</button>`).join("")}
        </div>
        ${renderTab()}
      </section>
    `;
  }

  function renderNutritionOverview() {
    return `
      <article class="info-card build-hero-card">
        <h3>Voedingsplan richting 3:30 marathon</h3>
        <p>Dit voedingsplan ondersteunt mijn marathonvoorbereiding richting 3:30. Het doel is niet om elke dag exact hetzelfde te eten, maar om mijn voeding slimmer af te stemmen op de training. In de eerste fases is normaal en eiwitrijk eten voldoende. Vanaf de long runs en piekfase worden koolhydraten, vocht, zout en herstel steeds belangrijker.</p>
        <p>Voeding is hier geen los dieet, maar onderdeel van de training: brandstof voor zware sessies, herstel na long runs en een getest plan voor marathondag.</p>
      </article>
      <section class="stat-grid build-metric-grid">
        ${metricCard("Doel", "Energie", "voor training en herstel")}
        ${metricCard("Marathonpace", "±12,06", "km/u")}
        ${metricCard("Fase 1–2", "Normaal", "eten")}
        ${metricCard("Fase 3", "Long runs", "voeden")}
        ${metricCard("Fase 4", "Koolhydraten", "serieus inzetten")}
        ${metricCard("Fase 5", "Taper", "+ carb loading")}
        ${metricCard("Belangrijk", "Niets nieuws", "op marathondag")}
      </section>
      <article class="info-card">
        <h3>Voedingsfilosofie</h3>
        <p>De basis is simpel: niet elke dag hoeft een “marathondag” te zijn. Rustige dagen vragen minder brandstof dan long-run-dagen of marathontempo-trainingen. Naarmate het schema zwaarder wordt, worden koolhydraten belangrijker. Niet omdat je ongezond moet eten, maar omdat langere duurlopen en marathonspecifieke trainingen brandstof vragen.</p>
        <ul class="compact-list">
          <li>Eerst normaal eten en herstel bewaken.</li>
          <li>Daarna koolhydraten rond runs verhogen.</li>
          <li>Daarna long-run-voeding oefenen.</li>
          <li>Daarna gels, sportdrank en vocht testen.</li>
          <li>Daarna taperen en carb loaden.</li>
          <li>Op marathondag alleen uitvoeren wat al getest is.</li>
        </ul>
        <p>Eerst trainen om beter te lopen. Daarna eten om die training ook echt te kunnen verwerken.</p>
      </article>
      <article class="info-card">
        <h3>Koolhydraat-ladder per fase</h3>
        <div class="compact-meta">
          <span class="chip">Normaal</span>
          <span class="chip">Meer rond runs</span>
          <span class="chip">Long-run brandstof</span>
          <span class="chip">Piekfase</span>
          <span class="chip">Carb loading</span>
        </div>
        ${nutritionLadderItems().map(([title, text]) => `<div class="phase-detail-block"><h4>${title}</h4><p>${text}</p></div>`).join("")}
      </article>
    `;
  }

  function nutritionLadderItems() {
    return [
      ["Fase 1 — normaal", "2 runs per week. Geen ingewikkeld voedingsplan nodig. Focus op eiwit, normale koolhydraten en herstel."],
      ["Fase 2 — iets bewuster", "3 runs per week. Op hardloopdagen iets meer koolhydraten rond de training."],
      ["Fase 3 — long runs voeden", "Long runs worden structureel. Koolhydraten rond long runs en marathonpace-runs worden belangrijker."],
      ["Fase 4 — prestatiebrandstof", "Zwaarste fase. 4 runs per week, long runs tot 30–32 km en marathontempo op vermoeide benen. Niet proberen te cutten. Brandstof en herstel zijn prioriteit."],
      ["Fase 5 — taper + carb loading", "Volume omlaag, koolhydraten bewust hoger richting marathon. Geen experimenten."],
    ];
  }

  function renderNutritionPhases() {
    const rows = [
      {
        title: "Fase 1 — Basisfase",
        meta: "Week 22 t/m 26 · 2 runs per week, krachttraining dominant",
        goal: "Normaal, gezond en voldoende eten. Nog geen marathonvoeding nodig.",
        carbs: "Normale hoeveelheid. Op dagen met een run eventueel iets meer brood, havermout, rijst, aardappelen, pasta of fruit.",
        protein: "Hoog genoeg houden voor krachttraining en herstel.",
        before: "Niet te zwaar eten vlak voor hardlopen. Een banaan, boterham of lichte maaltijd kan genoeg zijn.",
        after: "Normale maaltijd met eiwit + koolhydraten.",
        focus: "Niet overcompliceren. Eerst consistent trainen.",
      },
      {
        title: "Fase 2 — Overgangsfase",
        meta: "Week 27 t/m 28 · 3 runs per week",
        goal: "Wennen aan meer loopfrequentie en herstel ondersteunen.",
        carbs: "Iets meer op hardloopdagen. Vooral rondom tempo-intro’s en langere easy runs.",
        protein: "Normaal hoog houden; krachttraining blijft belangrijk.",
        before: "2–3 uur vooraf een lichte maaltijd met koolhydraten.",
        after: "Koolhydraten + eiwit. Bijvoorbeeld yoghurt/kwark met fruit, brood, rijstmaaltijd of shake + maaltijd.",
        focus: "Let op wat goed valt vóór het lopen.",
      },
      {
        title: "Fase 3 — Hybride opbouwfase",
        meta: "Week 29 t/m 36 · 3 runs per week + long runs",
        goal: "Long runs en marathonpace-runs beter ondersteunen.",
        carbs: "Bewuster inzetten. Niet structureel laag in koolhydraten eten als de long runs langer worden.",
        protein: "Hoog genoeg houden voor herstel van krachttraining en loopbelasting.",
        before: "Ontbijt oefenen: havermout met banaan, brood met jam/honing, yoghurt met fruit of een simpele koolhydraatrijke maaltijd.",
        after: "Herstelmaaltijd met koolhydraten + eiwit.",
        focus: "Vanaf nu voeding testen, zodat je in Fase 4 niet hoeft te gokken.",
      },
      {
        title: "Fase 4 — Piekfase / marathonspecifieke fase",
        meta: "Week 37 t/m 44 · 4 runs per week, zwaarste hardloopfase",
        goal: "Presteren en herstellen. Koolhydraten zijn nu trainingsbrandstof.",
        carbs: "Hoger rondom zware weken, marathonpace-long-runs en lange duurlopen.",
        protein: "Normaal hoog houden, maar herstel draait nu ook sterk om koolhydraten, vocht en zout.",
        before: "Race-achtig ontbijt oefenen. Niet te vet, niet te vezelrijk, geen experimenten.",
        after: "Herstel serieus nemen: koolhydraten, eiwit, vocht en zout.",
        focus: "Niet cutten in deze fase. Brandstof is belangrijker dan strak dieetdenken.",
      },
      {
        title: "Fase 5 — Taperfase",
        meta: "Week 45 t/m 47 · volume omlaag, marathon nadert",
        goal: "Fris worden, glycogeen aanvullen en maag rustig houden.",
        carbs: "In de laatste dagen richting marathon bewust verhogen.",
        protein: "Normaal houden.",
        before: "Alleen eten wat al getest is. Laatste 24–48 uur niet extreem veel vezels of vet als dat je maag belast.",
        after: "Na de marathon eten, drinken, zout aanvullen en ontspannen herstellen.",
        focus: "Geen nieuwe gels, geen nieuw ontbijt, geen nieuwe supplementen, geen experimenten.",
      },
    ];
    return `<section class="info-list">${rows.map(renderNutritionPhaseCard).join("")}</section>`;
  }

  function renderNutritionPhaseCard(row) {
    return `
      <article class="info-card">
        <h3>${row.title}</h3>
        <p class="status-line">${row.meta}</p>
        <p><strong>Voedingsdoel:</strong> ${row.goal}</p>
        <p><strong>Koolhydraten:</strong> ${row.carbs}</p>
        <p><strong>Eiwit:</strong> ${row.protein}</p>
        <p><strong>Voor training:</strong> ${row.before}</p>
        <p><strong>Na training:</strong> ${row.after}</p>
        <p><strong>Belangrijkste aandachtspunt:</strong> ${row.focus}</p>
      </article>
    `;
  }

  function renderNutritionTraining() {
    const rows = [
      ["Easy Run", "Normaal eten. Bij korte easy runs is extra voeding meestal niet nodig.", "Meestal niets nodig.", "Normale maaltijd.", "Easy run blijft easy. Voeding hoeft niet ingewikkeld."],
      ["Marathonpace Run", "Zorg dat je niet leeg start. Eet 2–3 uur vooraf koolhydraten.", "Bij korte sessies meestal niets nodig. Bij langere sessies eventueel sportdrank testen.", "Koolhydraten + eiwit.", "Koolhydraten helpen om 11,8–12,0 km/u gecontroleerd te lopen."],
      ["Long Run", "Ontbijt of maaltijd oefenen. Niet te zwaar, niet te vet, niet te onbekend.", "Vanaf 90+ minuten gels/sportdrank testen.", "Goed herstellen met koolhydraten, eiwit en vocht.", "Long runs zijn de plek om marathonvoeding te testen."],
      ["Long Run met Marathontempo", "Race-achtig eten. Dit is een generale repetitie.", "Gels/drinken gebruiken zoals je mogelijk op marathondag wilt doen.", "Herstel serieus nemen.", "Niet alleen benen testen, ook maag en brandstofplan testen."],
      ["Krachttraining", "Normale maaltijd met eiwit en koolhydraten.", "Niets nodig, tenzij de sessie erg lang is.", "Eiwit + normale maaltijd.", "Spiermassa en herstel ondersteunen."],
      ["Hybride dag", "Zorg voor genoeg energie, vooral als er ook een run bij zit.", "Tijdens meestal niets nodig, behalve bij langere runblokken.", "Koolhydraten + eiwit.", "Niet onderschatten: kracht + run vraagt meer herstel dan één losse sessie."],
    ];
    return `<section class="info-list">${rows.map(([title, before, during, after, focus]) => `
      <article class="info-card">
        <h3>${title}</h3>
        <p><strong>Vooraf:</strong> ${before}</p>
        <p><strong>Tijdens:</strong> ${during}</p>
        <p><strong>Na afloop:</strong> ${after}</p>
        <p><strong>Focus:</strong> ${focus}</p>
      </article>
    `).join("")}</section>`;
  }

  function renderNutritionLongRuns() {
    return `
      <article class="info-card build-hero-card">
        <h3>Long runs & gels</h3>
        <p>Long runs zijn niet alleen looptraining, maar ook voedingstraining. Je test hier wat je maag verdraagt, hoeveel koolhydraten je nodig hebt, wanneer je moet drinken en welke producten werken.</p>
      </article>
      <section class="info-list">
        ${foodListCard("Wanneer begin ik met gels oefenen?", ["60–70 min: meestal nog niet nodig", "80–90 min: eventueel eerste test", "90+ min: gels of sportdrank serieus oefenen", "2 uur+: voeding en drinken plannen", "Week 39/41/42/43: racefueling oefenen", "Marathonweek: niets nieuws meer"])}
        ${foodListCard("Praktische richtlijn tijdens lange runs", ["Begin niet pas als je leeg bent", "Neem voeding vroeg genoeg", "Test gels met water", "Test sportdrank apart", "Noteer wat goed of slecht valt", "Houd het simpel"])}
        ${foodListCard("Mogelijk marathon-gelplan", ["Gel 1: rond 20–25 min", "Gel 2: rond 45–50 min", "Gel 3: rond 70–75 min", "Gel 4: rond 95–100 min", "Gel 5: rond 120–125 min", "Gel 6: rond 145–150 min", "Gel 7: rond 170–175 min", "Gel 8: rond 195–200 min, alleen als getest en nodig"], "Dit is geen verplicht schema. Dit moet getest worden tijdens long runs. Niet op marathondag voor het eerst proberen.")}
        ${foodListCard("Wat log ik na een long run?", ["Ontbijt", "Tijd tussen eten en lopen", "Aantal gels", "Water/sportdrank", "Maaggevoel", "Energiegevoel", "Kramp ja/nee", "Wat werkte goed?", "Wat moet anders?"])}
      </section>
    `;
  }

  function renderNutritionMarathonWeek() {
    const rows = [
      ["Maandag–woensdag", "Normaal eten. Voldoende koolhydraten, eiwit en vocht. Geen extreme veranderingen."],
      ["Donderdag–vrijdag", "Koolhydraten iets verhogen. Denk aan rijst, pasta, brood, aardappelen, havermout, banaan, krentenbollen of pannenkoeken."],
      ["Zaterdag", "Simpel, vertrouwd en koolhydraatrijk. Niet extreem vet of vezelrijk als dat je maag belast. Geen experimenten."],
      ["Zondagochtend", "Race-ontbijt 3–4 uur voor start, zoals eerder getest. Bijvoorbeeld brood/bagel met jam/honing, banaan, havermout of een vertrouwde maaltijd."],
      ["Laatste uur", "Alleen iets kleins als dat getest is. Bijvoorbeeld sportdrank, banaan of kleine snack."],
      ["Tijdens marathon", "Gebruik het geteste gel-/drinkplan. Niet wachten tot je leeg bent."],
      ["Na marathon", "Eten, drinken, zout aanvullen en ontspannen herstellen."],
    ];
    return `
      <article class="info-card build-hero-card">
        <h3>Marathonweek</h3>
        <p>In marathonweek wil je geen nieuwe dingen proberen. Het doel is fris worden, koolhydraten aanvullen, maag rustig houden en het plan uitvoeren dat je in de long runs hebt getest.</p>
      </article>
      <section class="info-list">
        ${rows.map(([title, text]) => `<article class="info-card"><h3>${title}</h3><p>${text}</p></article>`).join("")}
        ${foodListCard("Niet doen in marathonweek", ["Geen nieuwe gels", "Geen nieuw ontbijt", "Geen onbekende sportdrank", "Geen extreem vezelrijke maaltijd vlak voor de race", "Geen zware alcoholavond", "Geen nieuw supplement", "Geen paniekdieet"])}
      </section>
    `;
  }

  function renderNutritionPractical() {
    return `
      <section class="info-list">
        ${foodListCard("Koolhydraatbronnen", ["rijst", "pasta", "aardappelen", "brood", "bagels", "wraps", "havermout", "banaan", "krentenbollen", "ontbijtkoek", "jam/honing", "pannenkoeken", "cornflakes/rice krispies", "sportdrank", "gels"])}
        ${foodListCard("Eiwitbronnen", ["kwark", "yoghurt", "whey isolate", "eieren", "kipfilet", "gehakt", "hüttenkäse", "tonijn", "mager vlees", "peulvruchten als je ze goed verdraagt"])}
        ${foodListCard("Makkelijke ontbijtopties", ["havermout met banaan", "brood met jam/honing", "yoghurt/kwark met fruit en oats", "krentenbol + banaan", "pannenkoeken als je dat goed verdraagt"])}
        ${foodListCard("Makkelijke lunchopties", ["volkorenbrood met kipfilet/hüttenkäse", "wraps met kip/ei", "rijst- of pastamaaltijd", "brood + fruit + yoghurt/kwark"])}
        ${foodListCard("Makkelijke avondmaaltijden", ["rijst + groente + gehakt/kip/ei", "pasta + simpele saus + eiwitbron", "aardappelen + groente + vlees/ei", "wraps met kip/gehakt/bonen", "noodles/rijstmaaltijd als snelle optie"])}
        ${foodListCard("Voorzichtig vlak vóór long runs", ["heel vet eten", "heel veel vezels", "pittig eten", "grote hoeveelheden rauwkost", "onbekende supplementen", "nieuwe gels of sportdrank"])}
      </section>
    `;
  }

  function foodListCard(title, items, note = "") {
    return `
      <article class="info-card">
        <h3>${title}</h3>
        <ul class="compact-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>
        ${note ? `<p class="muted small">${note}</p>` : ""}
      </article>
    `;
  }

  function renderStats() {
    const logs = getLogs();
    const completed = getCompleted();
    const analytics = statsAnalytics(logs, completed);

    if (state.selectedExerciseId) {
      renderExerciseStatsDetail(state.selectedExerciseId, analytics.byExercise, state.selectedExerciseName);
      return;
    }

    const tabs = [
      ["overview", "Overzicht"],
      ["running", "Hardlopen"],
      ["strength", "Krachttraining"],
      ["exercises", "Oefeningen"],
      ["marathon", "Marathon"],
      ["insights", "Inzichten"],
    ];
    const renderTab = {
      overview: renderStatsOverview,
      running: renderStatsRunning,
      strength: renderStatsStrength,
      exercises: renderStatsExercises,
      marathon: renderStatsMarathon,
      insights: renderStatsInsights,
    }[state.statsTab] || renderStatsOverview;

    app.innerHTML = `
      <section class="build-page stats-page">
        <div class="section-title build-title">
          <h2>Statistieken</h2>
        </div>
        <div class="build-tabs" role="tablist" aria-label="Statistieken onderdelen">
          ${tabs.map(([id, label]) => `<button type="button" data-stats-tab="${id}" class="${state.statsTab === id ? "is-active" : ""}">${label}</button>`).join("")}
        </div>
        ${renderTab(analytics)}
        <details class="info-block data-manage">
          <summary>Data beheren</summary>
          <div class="details-body">
            <p>Alle trainingsdata staat alleen lokaal op dit apparaat.</p>
            <button class="danger-button" type="button" data-reset>Wis lokale trainingsdata</button>
          </div>
        </details>
      </section>
    `;
    window.requestAnimationFrame(() => drawStatsCharts(analytics));
  }

  function statsAnalytics(logs, completed) {
    const byExercise = new Map();
    logs.strength.forEach((entry) => {
      if (!byExercise.has(entry.exerciseId)) byExercise.set(entry.exerciseId, []);
      byExercise.get(entry.exerciseId).push(entry);
    });

    const runEntries = logs.cardio
      .filter((entry) => entry.cardioDone)
      .map((entry) => {
        const found = findSessionByKey(entry.sessionKey);
        if (!found?.session?.cardio) return null;
        const kind = runKind(found.session, found.session.cardio);
        const km = inferRunKm(found.session);
        const minutes = inferRunMinutes(found.session);
        return {
          ...entry,
          week: Number(entry.week || found.week.calendarWeek),
          date: entry.date || plannedDateForSession(found.week, found.session),
          session: found.session,
          kind,
          km,
          minutes,
          mpMinutes: inferMpMinutes(found.session, kind, minutes),
        };
      })
      .filter(Boolean);

    const strengthSessionKeys = new Set(logs.strength.map((entry) => entry.sessionKey));
    completed.forEach((item) => {
      const found = findSessionByKey(item.sessionKey);
      if (found?.session?.exercises?.length) strengthSessionKeys.add(item.sessionKey);
    });

    const byWeek = new Map();
    runEntries.forEach((entry) => {
      const row = byWeek.get(entry.week) || { week: entry.week, km: 0, runs: 0, longRun: 0, mpMinutes: 0 };
      row.km += entry.km;
      row.runs += 1;
      row.longRun = Math.max(row.longRun, entry.km);
      row.mpMinutes += entry.mpMinutes;
      byWeek.set(entry.week, row);
    });

    const strengthEntries = logs.strength;
    const exerciseCounts = [...byExercise.entries()].map(([id, entries]) => ({ id, name: entries[entries.length - 1]?.exerciseName || findExerciseDefinition(id)?.name || id, count: entries.length }));
    const mostLogged = exerciseCounts.sort((a, b) => b.count - a.count)[0] || null;
    const lastStrength = strengthEntries.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0] || null;
    const lastTraining = completed.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0] || null;
    const current = todayViewContext();
    const phase = getPhase(current.week.phaseId);
    const totalKm = runEntries.reduce((sum, entry) => sum + entry.km, 0);
    const longRuns = runEntries.filter((entry) => entry.kind === "long").length;
    const mpRuns = runEntries.filter((entry) => entry.kind === "mp" || entry.mpMinutes > 0).length;
    const intervalRuns = runEntries.filter((entry) => entry.kind === "tempo").length;
    const easyRuns = runEntries.filter((entry) => entry.kind === "easy" || entry.kind === "strides").length;
    const shakeouts = runEntries.filter((entry) => entry.kind === "shakeout").length;
    const completedByWeek = new Map();
    completed.forEach((item) => {
      const weekNo = Number(item.week || 0);
      if (!weekNo) return;
      completedByWeek.set(weekNo, (completedByWeek.get(weekNo) || 0) + 1);
    });
    const currentWeekCompleted = completedByWeek.get(current.week.calendarWeek) || 0;
    const exerciseProgress = exerciseProgressStats(byExercise);

    return {
      logs,
      completed,
      byExercise,
      runEntries,
      weeklyRuns: [...byWeek.values()].sort((a, b) => a.week - b.week),
      totalKm,
      totalMinutes: runEntries.reduce((sum, entry) => sum + entry.minutes, 0),
      mpMinutes: runEntries.reduce((sum, entry) => sum + entry.mpMinutes, 0),
      runCount: runEntries.length,
      longRuns,
      mpRuns,
      intervalRuns,
      easyRuns,
      shakeouts,
      longestRun: runEntries.reduce((max, entry) => Math.max(max, entry.km), 0),
      currentWeekKm: byWeek.get(current.week.calendarWeek)?.km || 0,
      maxWeekKm: Math.max(0, ...[...byWeek.values()].map((week) => week.km)),
      averageRunKm: runEntries.length ? totalKm / runEntries.length : 0,
      averageRunMinutes: runEntries.length ? runEntries.reduce((sum, entry) => sum + entry.minutes, 0) / runEntries.length : 0,
      strengthTrainingCount: strengthSessionKeys.size,
      strengthSetCount: strengthEntries.length,
      uniqueExercises: byExercise.size,
      mostLogged,
      lastStrength,
      lastTraining,
      currentWeek: current.week,
      currentWeekCompleted,
      completedByWeek,
      exerciseProgress,
      phase,
    };
  }

  function exerciseProgressStats(byExercise) {
    const rows = [...byExercise.entries()]
      .map(([id, entries]) => {
        const ordered = entries.slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
        const scored = ordered.filter((entry) => score(entry) > 0);
        if (scored.length < 3) return null;
        const first = scored[0];
        const bestRecent = scored.slice(-3).reduce((best, entry) => (score(entry) > score(best) ? entry : best), scored[scored.length - 1]);
        const firstScore = score(first);
        const latestScore = score(bestRecent);
        const percent = firstScore > 0 ? ((latestScore - firstScore) / firstScore) * 100 : 0;
        return {
          id,
          name: scored[scored.length - 1].exerciseName || findExerciseDefinition(id)?.name || id,
          percent,
          first,
          current: bestRecent,
          count: scored.length,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.percent - a.percent);
    return {
      bestProgress: rows[0] || null,
      rows,
    };
  }

  function inferRunKm(session) {
    const source = `${session.cardio?.title || ""} ${session.cardio?.instruction || ""}`;
    const km = source.match(/(?:^|[^\d,])(\d+(?:[–-]\d+)?)\s*km(?!\/u)/i);
    if (km) {
      const [min, max] = parseRange(km[1]);
      return (min + max) / 2;
    }
    const minutes = inferRunMinutes(session);
    const speed = source.match(/(\d{1,2},\d)(?:[–-](\d{1,2},\d))?\s*km\/u/i);
    if (speed) {
      const minSpeed = Number(speed[1].replace(",", "."));
      const maxSpeed = speed[2] ? Number(speed[2].replace(",", ".")) : minSpeed;
      return (minutes / 60) * ((minSpeed + maxSpeed) / 2);
    }
    return 0;
  }

  function inferRunMinutes(session) {
    const source = `${session.cardio?.title || ""} ${session.cardio?.instruction || ""}`;
    const km = source.match(/(?:^|[^\d,])(\d+(?:[–-]\d+)?)\s*km(?!\/u)/i);
    if (km) {
      const [minKm, maxKm] = parseRange(km[1]);
      return ((minKm + maxKm) / 2 / 10) * 60;
    }
    const ranges = [...source.matchAll(/(\d+)(?:[–-](\d+))?\s*min/i)];
    if (!ranges.length) return 0;
    return ranges.reduce((sum, match) => {
      const min = Number(match[1]);
      const max = match[2] ? Number(match[2]) : min;
      return sum + (min + max) / 2;
    }, 0);
  }

  function inferMpMinutes(session, kind, minutes) {
    const source = `${session.cardio?.title || ""} ${session.cardio?.instruction || ""}`.toLowerCase();
    if (!/(11,8|12,0|12,1|marathontempo|marathonpace|mp)/.test(source)) return 0;
    const repeated = [...source.matchAll(/(\d+)\s*[×x]\s*(\d+)(?:[–-](\d+))?\s*min/g)].reduce((sum, match) => {
      const reps = Number(match[1]);
      const min = Number(match[2]);
      const max = match[3] ? Number(match[3]) : min;
      return sum + reps * ((min + max) / 2);
    }, 0);
    if (repeated) return repeated;
    if (session.type === "long-run") return Math.round(minutes * 0.25);
    return kind === "mp" ? Math.round(minutes * 0.45) : 0;
  }

  function formatKm(value) {
    return `${formatNumber(Math.round(value * 10) / 10)} km`;
  }

  function formatMinutes(value) {
    const minutes = Math.round(value);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return `${hours}u${String(rest).padStart(2, "0")}`;
  }

  function metricCard(label, value, sub = "") {
    return `<div class="metric"><strong>${value}</strong><span class="muted">${label}</span>${sub ? `<small>${sub}</small>` : ""}</div>`;
  }

  function renderStatsTabsHeader(title, subtitle) {
    return `
      <div class="section-title section-title-strong">
        <div>
          <h2>${title}</h2>
          ${subtitle ? `<p>${subtitle}</p>` : ""}
        </div>
      </div>
    `;
  }

  function renderStatsOverview(analytics) {
    return `
      ${renderStatsTabsHeader("Trainingsoverzicht", `${analytics.phase.phaseName} · Week ${analytics.currentWeek.calendarWeek}`)}
      <section class="stat-grid">
        ${metricCard("Totaal gelopen", formatKm(analytics.totalKm))}
        ${metricCard("Voltooide runs", analytics.runCount)}
        ${metricCard("Krachttrainingen", analytics.strengthTrainingCount)}
        ${metricCard("Gelogde werksets", analytics.strengthSetCount)}
        ${metricCard("Huidige week", `Week ${analytics.currentWeek.calendarWeek}`, `${analytics.currentWeekCompleted} van ${analytics.currentWeek.sessions.length} sessies voltooid`)}
        ${metricCard("Marathon", countdownParts(toIsoDate(today())).label)}
      </section>
      <section class="stat-card">
        <h3>Huidige fase</h3>
        <p class="status-line">${analytics.phase.phaseName} · ${marathonCountdownText(toIsoDate(today()))}</p>
        <p>${phaseFocus(analytics.phase.phaseId)}</p>
      </section>
      ${analytics.exerciseProgress.bestProgress ? renderBestProgressCard(analytics.exerciseProgress.bestProgress) : renderStatsPlaceholderCard("Meeste vooruitgang geboekt", "Log een oefening minimaal drie keer om betrouwbare vooruitgang te zien.")}
      ${renderChartCard("Geplande vs voltooide sessies", "Week", "Sessies voltooid", "planned-completed", analytics.completed.length >= 2)}
      <section class="stat-card">
        <h3>Laatste training</h3>
        <p>${analytics.lastTraining ? `${analytics.lastTraining.title} · ${formatDate(analytics.lastTraining.date)}` : "Nog geen afgeronde training."}</p>
      </section>
    `;
  }

  function renderStatsRunning(analytics) {
    return `
      ${renderStatsTabsHeader("Hardloopstatistieken", "Uitgevoerde runs op basis van lokale logs")}
      <section class="stat-grid">
        ${metricCard("Totaal km", formatKm(analytics.totalKm))}
        ${metricCard("Runs", analytics.runCount)}
        ${metricCard("Looptijd", formatMinutes(analytics.totalMinutes))}
        ${metricCard("Gem. afstand", formatKm(analytics.averageRunKm))}
        ${metricCard("Long runs", analytics.longRuns)}
        ${metricCard("MP-runs", analytics.mpRuns)}
        ${metricCard("Intervalruns", analytics.intervalRuns)}
        ${metricCard("Langste run", formatKm(analytics.longestRun))}
        ${metricCard("Weekvolume", formatKm(analytics.currentWeekKm))}
        ${metricCard("Meeste km/week", formatKm(analytics.maxWeekKm))}
        ${metricCard("MP-tijd", formatMinutes(analytics.mpMinutes))}
      </section>
      ${renderChartCard("Kilometers per week", "Week", "Kilometers", "weekly-km", analytics.weeklyRuns.length >= 2)}
      ${renderChartCard("Long run opbouw", "Week", "Kilometers", "long-run", analytics.weeklyRuns.filter((row) => row.longRun > 0).length >= 2)}
      ${renderChartCard("Marathontempo-training", "Week", "Minuten MP", "mp-minutes", analytics.weeklyRuns.filter((row) => row.mpMinutes > 0).length >= 2)}
      ${renderChartCard("Runtypes", "Type", "Aantal runs", "run-types", analytics.runCount > 0)}
      <section class="stat-card">
        <h3>Runtypes</h3>
        <p class="status-line">Easy: ${analytics.easyRuns} · Long run: ${analytics.longRuns} · MP: ${analytics.mpRuns} · Interval: ${analytics.intervalRuns} · Shake-out/taper: ${analytics.shakeouts}</p>
      </section>
    `;
  }

  function renderStatsStrength(analytics) {
    return `
      ${renderStatsTabsHeader("Krachttrainingsstatistieken", "Beste werksets en gelogde krachttraining")}
      <section class="stat-grid">
        ${metricCard("Krachttrainingen", analytics.strengthTrainingCount)}
        ${metricCard("Gelogde sets", analytics.strengthSetCount)}
        ${metricCard("Unieke oefeningen", analytics.uniqueExercises)}
        ${metricCard("Meest gelogd", analytics.mostLogged ? analytics.mostLogged.name : "-")}
        ${metricCard("Meeste vooruitgang", analytics.exerciseProgress.bestProgress ? analytics.exerciseProgress.bestProgress.name : "-", analytics.exerciseProgress.bestProgress ? `+${formatNumber(Math.round(analytics.exerciseProgress.bestProgress.percent * 10) / 10)}%` : "minimaal 3 logs nodig")}
      </section>
      ${analytics.exerciseProgress.bestProgress ? renderBestProgressCard(analytics.exerciseProgress.bestProgress) : renderStatsPlaceholderCard("Meeste vooruitgang geboekt", "Na minimaal drie logs per oefening verschijnt hier welke beweging het meest vooruitgaat.")}
      <section class="stat-card">
        <h3>Laatste krachttraining</h3>
        <p>${analytics.lastStrength ? `${analytics.lastStrength.exerciseName} · ${resultText(analytics.lastStrength)} · ${formatDate(analytics.lastStrength.date)}` : "Nog geen krachtdata."}</p>
      </section>
      ${renderChartCard("Gelogde krachtsets per week", "Week", "Sets", "strength-sets", analytics.logs.strength.length >= 2)}
    `;
  }

  function renderBestProgressCard(progress) {
    return `
      <section class="stat-card best-progress-card">
        <h3>Meeste vooruitgang geboekt</h3>
        <p class="readiness-score">+${formatNumber(Math.round(progress.percent * 10) / 10)}%</p>
        <p class="status-line">${progress.name}</p>
        <div class="history-row"><span>Van</span><strong>${resultText(progress.first)}</strong></div>
        <div class="history-row"><span>Naar</span><strong>${resultText(progress.current)}</strong></div>
        <p class="muted small">${progress.count} logs gebruikt · alleen oefeningen met minimaal 3 logs tellen mee.</p>
      </section>
    `;
  }

  function renderStatsExercises(analytics) {
    return `
      ${renderStatsTabsHeader("Oefeningen", "Tik door naar een specifieke oefening")}
      <section class="stats-list">
        ${
          analytics.byExercise.size
            ? [...analytics.byExercise.entries()].map(([exerciseId, entries], index) => renderExerciseStats(exerciseId, entries, index)).join("")
            : renderStatsEmptyState("Nog geen krachtdata", "Log een oefening op Vandaag en kom hier terug. Daarna verschijnen hier oefeningkaarten, trends en details.")
        }
      </section>
    `;
  }

  function renderStatsInsights(analytics) {
    const mostConsistentWeek = [...analytics.completedByWeek.entries()].sort((a, b) => b[1] - a[1])[0] || null;
    return `
      ${renderStatsTabsHeader("Inzichten", "Leuke, praktische signalen uit je lokale logs")}
      <section class="stat-grid">
        ${metricCard("Meest getraind", analytics.mostLogged ? analytics.mostLogged.name : "-")}
        ${metricCard("Langste run", formatKm(analytics.longestRun))}
        ${metricCard("Beste weekvolume", formatKm(analytics.maxWeekKm))}
        ${metricCard("Totale looptijd", formatMinutes(analytics.totalMinutes))}
        ${metricCard("Long runs voltooid", analytics.longRuns)}
        ${metricCard("MP-runs voltooid", analytics.mpRuns)}
        ${metricCard("Intervalruns", analytics.intervalRuns)}
        ${metricCard("Consistente week", mostConsistentWeek ? `Week ${mostConsistentWeek[0]}` : "-", mostConsistentWeek ? `${mostConsistentWeek[1]} sessies voltooid` : "")}
      </section>
      ${analytics.exerciseProgress.bestProgress ? renderBestProgressCard(analytics.exerciseProgress.bestProgress) : renderStatsPlaceholderCard("Meeste vooruitgang geboekt", "Nog niet genoeg logs. Een paar consistente metingen maken dit straks leuker.")}
      <section class="stat-card">
        <h3>Oefening die aandacht nodig heeft</h3>
        <p class="muted small">${attentionExerciseText(analytics)}</p>
      </section>
    `;
  }

  function attentionExerciseText(analytics) {
    const rows = analytics.exerciseProgress.rows;
    if (!rows.length) return "Nog niet genoeg data om dit betrouwbaar te zeggen.";
    const lowest = rows.slice().sort((a, b) => a.percent - b.percent)[0];
    if (!lowest || lowest.percent >= 0) return "Geen duidelijke achterblijver op basis van de huidige logs.";
    return `${lowest.name} staat lager dan de eerste meting (${formatNumber(Math.round(lowest.percent * 10) / 10)}%). Bekijk of techniek, herstel of oefeningskeuze moet worden aangepast.`;
  }

  function renderStatsMarathon(analytics) {
    const scoreData = marathonReadiness(analytics);
    return `
      ${renderStatsTabsHeader("Marathonvoorbereiding", "Indicatie, geen voorspelling")}
      <section class="stat-card readiness-card">
        <h3>Op schema-indicatie</h3>
        <p class="readiness-score">${scoreData.score}%</p>
        <p class="status-line">${scoreData.label}</p>
        <p>Deze score is geen garantie voor je marathontijd. Het is een praktische indicatie op basis van consistentie, long runs, marathontempo en voltooide trainingsweken.</p>
      </section>
      <section class="stat-grid">
        ${metricCard("Consistentie", `${analytics.runCount} runs`, "op basis van afgevinkte runs")}
        ${metricCard("Long runs", analytics.longRuns)}
        ${metricCard("Langste run", formatKm(analytics.longestRun))}
        ${metricCard("MP-training", formatMinutes(analytics.runEntries.reduce((sum, entry) => sum + entry.mpMinutes, 0)))}
      </section>
      <section class="stat-card">
        <h3>Piektrainingen</h3>
        <p class="status-line">${[39, 41, 42, 43].map((weekNo) => `Week ${weekNo}: ${peakWeekDone(analytics, weekNo) ? "gedaan" : "nog niet gedaan"}`).join(" · ")}</p>
      </section>
    `;
  }

  function marathonReadiness(analytics) {
    const consistency = Math.min(35, analytics.runCount * 2);
    const longRun = Math.min(25, analytics.longestRun * 0.8);
    const mp = Math.min(20, analytics.runEntries.reduce((sum, entry) => sum + entry.mpMinutes, 0) / 4);
    const peak = [39, 41, 42, 43].filter((weekNo) => peakWeekDone(analytics, weekNo)).length * 5;
    const score = Math.min(100, Math.round(consistency + longRun + mp + peak));
    const label = score < 20 ? "Nog weinig data" : score < 45 ? "Goed begonnen" : score < 70 ? "Op schema in opbouw" : score < 85 ? "Sterk op schema" : "Zeer sterk op schema";
    return { score, label };
  }

  function peakWeekDone(analytics, weekNo) {
    return analytics.runEntries.some((entry) => Number(entry.week) === weekNo && (entry.kind === "long" || entry.mpMinutes > 0));
  }

  function renderChartCard(title, xLabel, yLabel, chartId, hasData) {
    return `
      <section class="stat-card chart-card">
        <h3>${title}</h3>
        ${hasData ? `<canvas class="line-chart" width="320" height="160" data-chart="${chartId}" aria-label="${title}"></canvas><p class="chart-axis-label">${xLabel} · ${yLabel}</p>` : renderChartPlaceholder(title, xLabel, yLabel)}
      </section>
    `;
  }

  function renderChartPlaceholder(title, xLabel, yLabel) {
    return `
      <div class="chart-placeholder" aria-label="${escapeAttr(title)} placeholder">
        <span></span><span></span><span></span><span></span>
      </div>
      <p class="chart-axis-label">${xLabel} · ${yLabel}</p>
      <p class="muted small">${chartPlaceholderText(title)}</p>
    `;
  }

  function chartPlaceholderText(title) {
    const lower = title.toLowerCase();
    if (lower.includes("kilometer")) return "Log je eerste runs om je weekvolume te zien.";
    if (lower.includes("long")) return "Vink long runs af om de opbouw zichtbaar te maken.";
    if (lower.includes("marathontempo")) return "Na MP-runs verschijnt hier hoeveel specifieke 3:30-training je doet.";
    if (lower.includes("kracht") || lower.includes("gewicht")) return "Log krachtsets om progressie over tijd te zien.";
    if (lower.includes("reps")) return "Log deze oefening vaker om reps over tijd te vergelijken.";
    if (lower.includes("prestatie")) return "Na een paar logs zie je hier je prestatie-index.";
    return "Nog niet genoeg data om deze grafiek te tonen.";
  }

  function renderStatsPlaceholderCard(title, text) {
    return `
      <section class="stat-card">
        <h3>${title}</h3>
        <div class="mini-placeholder-bars"><span></span><span></span><span></span></div>
        <p class="muted small">${text}</p>
      </section>
    `;
  }

  function renderStatsEmptyState(title, text) {
    return `
      <div class="empty-state stats-empty-state">
        <div class="chart-placeholder small-placeholder"><span></span><span></span><span></span><span></span></div>
        <h2>${title}</h2>
        <p class="muted">${text}</p>
      </div>
    `;
  }

  function renderExerciseStats(exerciseId, entries, index) {
    const ordered = entries.slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const best = ordered.reduce((bestEntry, entry) => (score(entry) > score(bestEntry) ? entry : bestEntry), ordered[0]);
    const last = ordered[ordered.length - 1];
    const previous = ordered[ordered.length - 2];
    const diff = previous ? score(last) - score(previous) : 0;
    const trend = ordered.length < 2 ? "gelijk" : diff > 0.2 ? "omhoog" : diff < -0.2 ? "omlaag" : "gelijk";
    return `
      <article class="stat-card">
        <h3>${last.exerciseName}</h3>
        <p class="status-line">Beste: ${resultText(best)} · Laatste: ${resultText(last)} · Trend: ${trend}</p>
        ${
          ordered.length >= 2
            ? `<canvas class="sparkline" width="320" height="42" data-sparkline="${index}" data-exercise-id="${exerciseId}"></canvas>`
            : renderChartPlaceholder("Oefeningprogressie", "Datum", "Score")
        }
        <button class="inline-link-button" type="button" data-open-exercise-stats="${escapeAttr(exerciseId)}" data-exercise-name="${escapeAttr(last.exerciseName)}">Details bekijken →</button>
      </article>
    `;
  }

  function renderExerciseStatsDetail(exerciseId, byExercise, fallbackName = "") {
    const entries = (byExercise.get(exerciseId) || []).slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const definition = findExerciseDefinition(exerciseId);
    const name = fallbackName || entries[entries.length - 1]?.exerciseName || definition?.name || exerciseId;
    if (!entries.length) {
      app.innerHTML = `
        <button class="secondary-button back-button" type="button" data-stats-overview>Terug naar statistieken</button>
        <section class="stat-card exercise-detail">
          <h3>${name}</h3>
          <p class="muted">Nog geen data voor deze oefening.</p>
          ${definition ? `<p class="muted small">${definition.planned ? `Gepland in schema: ${plannedLabel(definition)}` : ""}</p>` : ""}
        </section>
      `;
      return;
    }

    const best = entries.reduce((bestEntry, entry) => (score(entry) > score(bestEntry) ? entry : bestEntry), entries[0]);
    const last = entries[entries.length - 1];
    const previous = entries[entries.length - 2];
    const diff = previous ? score(last) - score(previous) : 0;
    const trend = entries.length < 3 ? "te weinig data" : diff > 0.2 ? "stijgend" : diff < -0.2 ? "dalend" : "stabiel";
    const first = entries[0];
    const progress = score(first) > 0 ? ((score(last) - score(first)) / score(first)) * 100 : 0;
    const bestWeight = Math.max(0, ...entries.map((entry) => Number(entry.selectedWeight) || 0));
    const bestReps = Math.max(0, ...entries.map((entry) => Number(entry.selectedReps) || 0));
    const detailMap = new Map([[exerciseId, entries]]);
    app.innerHTML = `
      <button class="secondary-button back-button" type="button" data-stats-overview>Terug naar statistieken</button>
      <section class="stat-card exercise-detail">
        <h3>${name}</h3>
        <p class="status-line">Beste: ${resultText(best)} · Laatste: ${resultText(last)} · Trend: ${trend}</p>
        <section class="stat-grid">
          ${metricCard("Aantal logs", entries.length)}
          ${metricCard("Vooruitgang", entries.length >= 2 ? `${progress >= 0 ? "+" : ""}${formatNumber(Math.round(progress * 10) / 10)}%` : "-")}
          ${metricCard("Beste gewicht", bestWeight ? `${formatNumber(bestWeight)} kg` : "-")}
          ${metricCard("Beste reps", bestReps || "-")}
        </section>
      </section>
      ${renderExerciseChartCard("Gewicht over tijd", "Datum", "Gewicht", "weight", entries.filter((entry) => Number(entry.selectedWeight) > 0).length >= 2)}
      ${renderExerciseChartCard("Reps over tijd", "Datum", "Reps", "reps", entries.filter((entry) => Number(entry.selectedReps) > 0).length >= 2)}
      ${renderExerciseChartCard("Prestatie-index over tijd", "Datum", "Gewicht × reps / tijd / afstand", "score", entries.filter((entry) => score(entry) > 0).length >= 2)}
      <section class="stat-card exercise-detail">
        <h3>Historie</h3>
        <div class="history-list">
          ${entries
            .slice()
            .reverse()
            .map(
              (entry) => `
              <div class="history-row">
                <span>${formatDate(entry.date || toIsoDate(today()))} · Week ${entry.week}</span>
                <strong>${resultText(entry)}</strong>
              </div>`
            )
            .join("")}
        </div>
      </section>
    `;
    window.requestAnimationFrame(() => {
      drawSparklines(detailMap);
      drawExerciseDetailCharts(detailMap);
    });
  }

  function renderExerciseChartCard(title, xLabel, yLabel, kind, hasData) {
    return `
      <section class="stat-card chart-card">
        <h3>${title}</h3>
        ${hasData ? `<canvas class="line-chart" width="320" height="160" data-exercise-detail-chart="${kind}" aria-label="${title}"></canvas><p class="chart-axis-label">${xLabel} · ${yLabel}</p>` : renderChartPlaceholder(title, xLabel, yLabel)}
      </section>
    `;
  }

  function findExerciseDefinition(exerciseId) {
    for (const week of weeks) {
      for (const session of week.sessions) {
        const found = session.exercises.find((exercise) => exercise.id === exerciseId);
        if (found) return found;
      }
    }
    return null;
  }

  function drawSparklines(byExercise) {
    const entriesById = Object.fromEntries([...byExercise.entries()].map(([id, entries]) => [id, entries.slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""))]));
    document.querySelectorAll("canvas[data-exercise-id]").forEach((canvas) => {
      const id = canvas.dataset.exerciseId;
      const values = (entriesById[id] || []).map(score).filter((value) => value > 0);
      if (values.length < 2) return;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 320;
      const height = canvas.clientHeight || 42;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const spread = max - min || 1;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#22C55E";
      ctx.beginPath();
      values.forEach((value, index) => {
        const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * (width - 16) + 8;
        const y = height - 8 - ((value - min) / spread) * (height - 16);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }

  function drawStatsCharts(analytics) {
    drawSparklines(analytics.byExercise);
    const weekly = analytics.weeklyRuns;
    drawChartById("weekly-km", weekly.map((row) => ({ label: `W${row.week}`, value: row.km })), "#3B82F6");
    drawChartById("long-run", weekly.map((row) => ({ label: `W${row.week}`, value: row.longRun })), "#5B7DA8");
    drawChartById("mp-minutes", weekly.map((row) => ({ label: `W${row.week}`, value: row.mpMinutes })), "#3B82F6");
    drawChartById("run-types", [
      { label: "Easy", value: analytics.easyRuns },
      { label: "Long", value: analytics.longRuns },
      { label: "MP", value: analytics.mpRuns },
      { label: "Tempo", value: analytics.intervalRuns },
      { label: "Taper", value: analytics.shakeouts },
    ], "#3B82F6");
    drawPlannedCompletedChart(analytics);

    const strengthByWeek = new Map();
    analytics.logs.strength.forEach((entry) => {
      const week = Number(entry.week || 0);
      if (!week) return;
      strengthByWeek.set(week, (strengthByWeek.get(week) || 0) + 1);
    });
    drawChartById(
      "strength-sets",
      [...strengthByWeek.entries()].sort((a, b) => a[0] - b[0]).map(([week, value]) => ({ label: `W${week}`, value })),
      "#3B82F6"
    );
  }

  function drawStrengthDetailChart(byExercise) {
    document.querySelectorAll("canvas[data-strength-detail]").forEach((canvas) => {
      const id = canvas.dataset.strengthDetail;
      const entries = (byExercise.get(id) || []).slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
      drawLineChart(
        canvas,
        entries.map((entry) => ({ label: formatDate(entry.date || toIsoDate(today())), value: score(entry) })),
        "#3B82F6"
      );
    });
  }

  function drawExerciseDetailCharts(byExercise) {
    const entries = [...byExercise.values()][0]?.slice().sort((a, b) => (a.date || "").localeCompare(b.date || "")) || [];
    document.querySelectorAll("canvas[data-exercise-detail-chart]").forEach((canvas) => {
      const kind = canvas.dataset.exerciseDetailChart;
      const points = entries
        .map((entry) => ({ label: formatDate(entry.date || toIsoDate(today())), value: exerciseChartValue(entry, kind) }))
        .filter((point) => point.value > 0);
      drawLineChart(canvas, points, "#3B82F6");
    });
  }

  function exerciseChartValue(entry, kind) {
    if (kind === "weight") return Number(entry.selectedWeight) || 0;
    if (kind === "reps") return Number(entry.selectedReps) || 0;
    return score(entry);
  }

  function drawChartById(id, points, color) {
    const canvas = document.querySelector(`canvas[data-chart="${id}"]`);
    if (!canvas) return;
    drawLineChart(canvas, points.filter((point) => point.value > 0), color);
  }

  function drawPlannedCompletedChart(analytics) {
    const canvas = document.querySelector('canvas[data-chart="planned-completed"]');
    if (!canvas) return;
    const firstWeek = weeks[0]?.calendarWeek || 22;
    const lastCompletedWeek = Math.max(firstWeek, ...[...analytics.completedByWeek.keys()]);
    const rows = weeks
      .filter((week) => week.calendarWeek <= lastCompletedWeek)
      .map((week) => ({
        label: `W${week.calendarWeek}`,
        planned: week.sessions.length,
        completed: analytics.completedByWeek.get(week.calendarWeek) || 0,
      }));
    if (rows.length < 2) return;
    drawDualLineChart(canvas, rows, "#3B82F6", "rgba(167, 176, 190, 0.75)");
  }

  function drawDualLineChart(canvas, rows, primaryColor, secondaryColor) {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 320;
    const height = canvas.clientHeight || 160;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    const pad = { top: 14, right: 12, bottom: 28, left: 38 };
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;
    const max = Math.max(...rows.flatMap((row) => [row.planned, row.completed]), 1);
    const y = (value) => pad.top + chartH - (value / max) * chartH;
    const x = (index) => pad.left + (rows.length === 1 ? chartW / 2 : (index / (rows.length - 1)) * chartW);
    ctx.strokeStyle = "rgba(167, 176, 190, 0.35)";
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + chartH);
    ctx.lineTo(pad.left + chartW, pad.top + chartH);
    ctx.stroke();
    const draw = (key, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      rows.forEach((row, index) => {
        const px = x(index);
        const py = y(row[key]);
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    };
    draw("planned", secondaryColor);
    draw("completed", primaryColor);
    ctx.fillStyle = "#A7B0BE";
    ctx.font = "11px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(String(max), pad.left - 6, y(max) + 4);
    ctx.fillText("0", pad.left - 6, y(0) + 4);
    ctx.textAlign = "left";
    ctx.fillText(rows[0].label, pad.left, height - 8);
    ctx.textAlign = "right";
    ctx.fillText(rows[rows.length - 1].label, pad.left + chartW, height - 8);
  }

  function drawLineChart(canvas, points, color) {
    if (!canvas || points.length < 2) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 320;
    const height = canvas.clientHeight || 160;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const pad = { top: 14, right: 12, bottom: 28, left: 38 };
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;
    const values = points.map((point) => point.value);
    const min = Math.min(0, ...values);
    const max = Math.max(...values);
    const spread = max - min || 1;
    const y = (value) => pad.top + chartH - ((value - min) / spread) * chartH;
    const x = (index) => pad.left + (points.length === 1 ? chartW / 2 : (index / (points.length - 1)) * chartW);

    ctx.strokeStyle = "rgba(167, 176, 190, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + chartH);
    ctx.lineTo(pad.left + chartW, pad.top + chartH);
    ctx.stroke();

    ctx.fillStyle = "#A7B0BE";
    ctx.font = "11px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(formatNumber(Math.round(max * 10) / 10), pad.left - 6, y(max) + 4);
    ctx.fillText(formatNumber(Math.round(min * 10) / 10), pad.left - 6, y(min) + 4);
    ctx.textAlign = "left";
    ctx.fillText(points[0].label, pad.left, height - 8);
    ctx.textAlign = "right";
    ctx.fillText(points[points.length - 1].label, pad.left + chartW, height - 8);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((point, index) => {
      const px = x(index);
      const py = y(point.value);
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    ctx.fillStyle = color;
    points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(x(index), y(point.value), 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function escapeAttr(value) {
    return String(value).replace(/"/g, "&quot;");
  }

  function upsertStrength(row) {
    const logs = getLogs();
    const key = row.dataset.sessionKey;
    const exerciseId = row.dataset.exerciseId;
    const planned = splitPlanned(row.dataset.planned);
    const fields = Object.fromEntries(
      Array.from(row.querySelectorAll("[data-log-field]")).map((select) => [select.dataset.logField, select.value])
    );
    const hasAny = Object.values(fields).some((value) => value !== "");
    logs.strength = logs.strength.filter((entry) => !(entry.sessionKey === key && entry.exerciseId === exerciseId));
    if (hasAny) {
      logs.strength.push({
        sessionKey: key,
        exerciseId,
        exerciseName: row.dataset.exerciseName,
        plannedSets: planned.sets,
        plannedReps: planned.reps,
        selectedWeight: fields.weight === "" || fields.weight === undefined ? null : Number(fields.weight),
        selectedReps: fields.reps === "" || fields.reps === undefined ? null : Number(fields.reps),
        selectedSeconds: fields.seconds === "" || fields.seconds === undefined ? null : Number(fields.seconds),
        selectedMinutes: fields.minutes === "" || fields.minutes === undefined ? null : Number(fields.minutes),
        selectedDistance: fields.distance === "" || fields.distance === undefined ? null : Number(fields.distance),
        date: row.dataset.logDate || toIsoDate(today()),
        phase: row.dataset.phase,
        week: Number(row.dataset.week),
        session: Number(row.dataset.session),
        loggedAt: new Date().toISOString(),
      });
    }
    saveLogs(logs);
  }

  function splitPlanned(plannedValue) {
    const planned = plannedValue || "";
    const match = planned.match(/^([^×x]+)[×x](.+)$/);
    if (!match) return { sets: planned, reps: planned };
    return {
      sets: match[1].trim(),
      reps: match[2].trim(),
    };
  }

  function upsertCardio(card) {
    const logs = getLogs();
    const key = card.dataset.cardioKey;
    const checked = Boolean(card.querySelector("[data-cardio-done]")?.checked);
    const selectedFeeling = card.querySelector("[data-feeling].is-selected")?.dataset.feeling || "";
    logs.cardio = logs.cardio.filter((entry) => entry.sessionKey !== key);
    if (checked || selectedFeeling) {
      logs.cardio.push({
        sessionKey: key,
        cardioDone: checked,
        cardioFeeling: selectedFeeling,
        date: card.dataset.logDate || toIsoDate(today()),
        phase: card.dataset.phase,
        week: Number(card.dataset.week),
        session: Number(card.dataset.session),
        loggedAt: new Date().toISOString(),
      });
    }
    saveLogs(logs);
  }

  function persistVisibleLogs() {
    document.querySelectorAll("[data-exercise-row]").forEach((row) => upsertStrength(row));
    document.querySelectorAll("[data-cardio-key]").forEach((card) => upsertCardio(card));
  }

  function openMenu() {
    if (!menuOverlay) return;
    menuOverlay.hidden = false;
    menuToggle?.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!menuOverlay) return;
    menuOverlay.hidden = true;
    menuToggle?.setAttribute("aria-expanded", "false");
  }

  function openCountdown() {
    if (!countdownOverlay || !countdownContent) return;
    const context = todayViewContext();
    const phase = getPhase(context.week.phaseId);
    const parts = countdownParts(context.dateIso);
    countdownContent.innerHTML = `
      <p><strong>Geselecteerde datum:</strong> ${formatFullDate(context.dateIso)}</p>
      <p><strong>Marathon:</strong> ${formatFullDate(MARATHON_DATE)}</p>
      <div class="countdown-metric">
        <strong>${parts.label}</strong>
        ${parts.totalDays >= 0 ? `<span>Totaal: ${parts.totalDays} dagen</span>` : `<span>Marathon voltooid</span>`}
      </div>
      <p><strong>Huidige schemaweek:</strong><br>Week ${context.week.calendarWeek} · ${phase.phaseName}</p>
      <p><strong>Focus nu:</strong><br>${phaseFocus(phase.phaseId)}</p>
    `;
    countdownOverlay.hidden = false;
  }

  function closeCountdown() {
    if (countdownOverlay) countdownOverlay.hidden = true;
  }

  function milestoneActionLabel(action) {
    const labels = {
      week: "Bekijk week",
      phase: "Bekijk fase",
      nutritionPhase: "Bekijk voeding",
      nutritionLongRuns: "Bekijk voeding",
      nutritionMarathon: "Bekijk voeding",
      longRuns: "Bekijk long runs",
      marathonPace: "Bekijk marathontempo",
      marathonWeek: "Bekijk marathonweek",
    };
    return labels[action] || "Bekijk";
  }

  function renderMilestoneContent(milestone, context) {
    const phase = getPhase(context.week.phaseId);
    return `
      <div class="milestone-kicker">${milestone.label}</div>
      <h3>${milestone.title}</h3>
      <p>${milestone.intro}</p>
      <div class="compact-meta">
        <span class="chip">Week ${context.week.calendarWeek}</span>
        <span class="chip">${phase.phaseName}</span>
        <span class="chip">${marathonCountdownText(context.dateIso)}</span>
      </div>
      <div class="milestone-grid">
        <div class="phase-detail-block"><h4>Wat verandert er?</h4><p>${milestone.change}</p></div>
        <div class="phase-detail-block"><h4>Hardloopfocus</h4><p>${milestone.running}</p></div>
        <div class="phase-detail-block"><h4>Krachtfocus</h4><p>${milestone.strength}</p></div>
        <div class="phase-detail-block"><h4>Voedingsfocus</h4><p>${milestone.nutrition}</p></div>
        <div class="phase-detail-block"><h4>Belangrijkste focus</h4><p>${milestone.focus}</p></div>
      </div>
      ${milestone.note ? `<p class="muted small">${milestone.note}</p>` : ""}
      <div class="milestone-actions">
        ${milestone.actions.map((action) => `<button class="detail-action-button" type="button" data-milestone-action="${action}" data-milestone-week="${milestone.week}" data-milestone-phase="${milestone.phaseId}">${milestoneActionLabel(action)}</button>`).join("")}
        <button class="secondary-button" type="button" data-milestone-close>Begrepen</button>
      </div>
    `;
  }

  function openMilestone(milestone, context) {
    if (!milestoneOverlay || !milestoneContent) return;
    milestoneContent.innerHTML = renderMilestoneContent(milestone, context);
    milestoneOverlay.hidden = false;
  }

  function closeMilestone() {
    if (milestoneOverlay) milestoneOverlay.hidden = true;
  }

  function syncMilestonePopup() {
    if (!milestoneOverlay || !milestoneContent) return;
    if (state.view !== "today") {
      state.milestoneActiveKey = "";
      state.milestoneDismissedKey = "";
      closeMilestone();
      return;
    }
    const context = todayViewContext();
    const milestone = getMilestoneForWeek(context.week.calendarWeek);
    if (!milestone) {
      state.milestoneActiveKey = "";
      state.milestoneDismissedKey = "";
      closeMilestone();
      return;
    }
    if (state.milestoneActiveKey !== milestone.key) {
      state.milestoneActiveKey = milestone.key;
      state.milestoneDismissedKey = "";
    }
    if (state.milestoneDismissedKey === milestone.key) {
      closeMilestone();
      return;
    }
    openMilestone(milestone, context);
  }

  function dismissMilestone() {
    if (state.milestoneActiveKey) state.milestoneDismissedKey = state.milestoneActiveKey;
    closeMilestone();
  }

  function openMilestoneTarget(action, milestoneWeek, phaseId) {
    const week = weeks.find((item) => item.calendarWeek === Number(milestoneWeek)) || todayViewContext().week;
    closeMilestone();
    if (action === "week") {
      state.view = "week";
      state.preview = null;
      state.viewedWeekIndex = weeks.indexOf(week);
    }
    if (action === "phase") {
      state.view = "phases";
      state.preview = null;
      state.targetPhaseId = phaseId || week.phaseId;
    }
    if (action === "nutritionPhase") {
      state.view = "nutrition";
      state.preview = null;
      state.nutritionTab = "phases";
    }
    if (action === "nutritionLongRuns") {
      state.view = "nutrition";
      state.preview = null;
      state.nutritionTab = "longRuns";
    }
    if (action === "nutritionMarathon" || action === "marathonWeek") {
      state.view = "nutrition";
      state.preview = null;
      state.nutritionTab = "marathonWeek";
    }
    if (action === "longRuns") {
      state.view = "runBuild";
      state.preview = null;
      state.runBuildTab = "longRuns";
    }
    if (action === "marathonPace") {
      state.view = "runBuild";
      state.preview = null;
      state.runBuildTab = "marathonPace";
    }
    closeMenu();
    closeCountdown();
    render();
  }

  function render() {
    const activeView = state.view === "sessionPreview" ? "week" : state.view;
    navButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.view === activeView));
    const dateIso = state.selectedDateIso || toIsoDate(today());
    todayPill.textContent = parseLocalDate(dateIso).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
    if (state.view === "today") renderToday();
    if (state.view === "week") renderWeek();
    if (state.view === "sessionPreview") renderSessionPreview();
    if (state.view === "phases") renderPhases();
    if (state.view === "runBuild") renderRunBuild();
    if (state.view === "nutrition") renderNutrition();
    if (state.view === "stats") renderStats();
    syncMilestonePopup();
  }

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (target.closest("#brand-home")) {
      goHomeToday();
      return;
    }

    if (target.closest("#header-day-prev")) {
      state.view = "today";
      state.preview = null;
      moveTodaySelection(-1);
      closeMenu();
      closeCountdown();
      closeMilestone();
      render();
      return;
    }

    if (target.closest("#header-day-next")) {
      state.view = "today";
      state.preview = null;
      moveTodaySelection(1);
      closeMenu();
      closeCountdown();
      closeMilestone();
      render();
      return;
    }

    if (target.closest("#menu-toggle")) {
      openMenu();
      return;
    }

    if (target.closest("#menu-close") || target.closest("[data-menu-close]") || target === menuOverlay) {
      closeMenu();
      return;
    }

    if (target.closest("#today-pill")) {
      openCountdown();
      return;
    }

    if (target.closest("[data-countdown-close]") || target === countdownOverlay) {
      closeCountdown();
      return;
    }

    if (target.closest("[data-milestone-close]") || target === milestoneOverlay) {
      dismissMilestone();
      return;
    }

    const milestoneAction = target.closest("[data-milestone-action]");
    if (milestoneAction) {
      openMilestoneTarget(milestoneAction.dataset.milestoneAction, milestoneAction.dataset.milestoneWeek, milestoneAction.dataset.milestonePhase);
      return;
    }

    const navButton = target.closest("[data-view]");
    if (navButton) {
      state.view = navButton.dataset.view;
      state.preview = null;
      state.selectedExerciseId = null;
      state.selectedExerciseName = "";
      if (state.view === "today") resetTodaySelection();
      if (state.view === "week") state.viewedWeekIndex = currentWeekIndex();
      closeMenu();
      render();
      return;
    }
    const runTab = target.closest("[data-run-tab]");
    if (runTab) {
      state.runBuildTab = runTab.dataset.runTab;
      renderRunBuild();
      return;
    }
    const nutritionTab = target.closest("[data-nutrition-tab]");
    if (nutritionTab) {
      state.nutritionTab = nutritionTab.dataset.nutritionTab;
      renderNutrition();
      return;
    }
    const statsTab = target.closest("[data-stats-tab]");
    if (statsTab) {
      state.statsTab = statsTab.dataset.statsTab;
      state.selectedExerciseId = null;
      state.selectedExerciseName = "";
      renderStats();
      return;
    }
    const exerciseStatsButton = target.closest("[data-open-exercise-stats]");
    if (exerciseStatsButton) {
      state.view = "stats";
      state.preview = null;
      state.statsTab = "exercises";
      state.selectedExerciseId = exerciseStatsButton.dataset.openExerciseStats;
      state.selectedExerciseName = exerciseStatsButton.dataset.exerciseName || "";
      closeMenu();
      closeCountdown();
      closeMilestone();
      render();
      return;
    }
    if (target.closest("[data-open-week-current]")) {
      const context = todayViewContext();
      state.view = "week";
      state.preview = null;
      state.selectedExerciseId = null;
      state.selectedExerciseName = "";
      state.viewedWeekIndex = weeks.indexOf(context.week);
      closeMenu();
      closeCountdown();
      closeMilestone();
      render();
      return;
    }
    if (target.closest("[data-stats-overview]")) {
      state.selectedExerciseId = null;
      state.selectedExerciseName = "";
      state.statsTab = "exercises";
      renderStats();
      return;
    }
    const viewSessionToday = target.closest("[data-view-session-today]");
    if (viewSessionToday) {
      const week = getWeekByIndex(Number(viewSessionToday.dataset.weekIndex));
      const session = week.sessions.find((item) => item.sessionNumber === Number(viewSessionToday.dataset.sessionNumber));
      if (session) {
        state.view = "today";
        state.preview = null;
        state.selectedSessionKey = sessionKey(week, session);
        state.selectedDateIso = plannedDateForSession(week, session);
        state.viewedWeekIndex = weeks.indexOf(week);
        closeMenu();
        closeCountdown();
        closeMilestone();
        render();
      }
      return;
    }
    const previewButton = target.closest("[data-preview-session]");
    if (previewButton) {
      state.preview = {
        weekIndex: Number(previewButton.dataset.previewWeekIndex),
        sessionNumber: Number(previewButton.dataset.previewSession),
      };
      state.view = "sessionPreview";
      render();
      return;
    }
    if (target.closest("[data-back-week]")) {
      state.view = "week";
      render();
      return;
    }
    const feeling = target.closest("[data-feeling]");
    if (feeling) {
      const card = feeling.closest("[data-cardio-key]");
      card.querySelectorAll("[data-feeling]").forEach((button) => button.classList.remove("is-selected"));
      feeling.classList.add("is-selected");
      upsertCardio(card);
      return;
    }
    if (target.closest("[data-complete-session]")) {
      const context = todayViewContext();
      if (context.session) completeSession(context.week, context.session, "manual", context.dateIso);
      render();
      return;
    }
    if (target.closest("[data-week-prev]")) {
      state.viewedWeekIndex = Math.max(0, state.viewedWeekIndex - 1);
      renderWeek();
      return;
    }
    if (target.closest("[data-week-next]")) {
      state.viewedWeekIndex = Math.min(weeks.length - 1, state.viewedWeekIndex + 1);
      renderWeek();
      return;
    }
    if (target.closest("[data-reset]")) {
      const first = window.confirm("Trainingsdata wissen?\n\nDit verwijdert alle lokaal opgeslagen trainingslogs, gewichten, reps, voltooide trainingen en statistieken van dit apparaat. Dit kan niet automatisch worden hersteld.");
      const second = first && window.confirm("Laatste bevestiging: wil je echt alle lokale trainingsdata verwijderen?");
      if (second) {
        localStorage.removeItem(STORAGE.logs);
        localStorage.removeItem(STORAGE.completed);
        localStorage.removeItem(STORAGE.preferences);
        localStorage.removeItem(STORAGE.version);
        render();
      }
      return;
    }
    const nameButton = target.closest("[data-toggle-details]");
    if (nameButton) {
      const details = nameButton.closest(".exercise-card")?.querySelector("details");
      if (details) details.open = !details.open;
    }
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target.matches("[data-log-field]")) {
      const row = target.closest("[data-exercise-row]");
      if (row) upsertStrength(row);
      return;
    }
    if (target.matches("[data-cardio-done]")) {
      const card = target.closest("[data-cardio-key]");
      if (card) upsertCardio(card);
    }
  });

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (target.matches("[data-log-field]")) {
      const row = target.closest("[data-exercise-row]");
      if (row) upsertStrength(row);
    }
  });

  window.addEventListener("pagehide", persistVisibleLogs);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") persistVisibleLogs();
  });

  function installDoubleTapGuard() {
    const appRoot = document.querySelector(".app-shell") || app;
    if (!appRoot) return;
    let lastTouchEnd = 0;
    appRoot.addEventListener(
      "touchend",
      (event) => {
        if (event.target.closest("input, select, textarea")) return;
        const interactive = event.target.closest("button, a, label, summary, .exercise-card, .session-card, .info-card, .phase-card, .stat-card, .cardio-card, .chip, .menu-panel, .header-day-button");
        if (!interactive) {
          lastTouchEnd = 0;
          return;
        }
        const now = Date.now();
        if (now - lastTouchEnd <= 300) event.preventDefault();
        lastTouchEnd = now;
      },
      { passive: false }
    );
  }

  function boot() {
    autoCompleteStaleSessions();
    state.viewedWeekIndex = currentWeekIndex();
    state.selectedDateIso = toIsoDate(today());
    installDoubleTapGuard();
    render();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    }
  }

  boot();

  window.MarathonApp = {
    currentWeekIndex,
    activeSessionForWeek,
    getWeekByIndex,
    sessionKey,
    score,
    resultText,
    hasSessionData,
  };
})();
