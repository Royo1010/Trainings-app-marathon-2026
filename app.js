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
      return Number(entry.selectedWeight) * (1 + Number(entry.selectedReps) / 30);
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

  function sessionSummary(session) {
    const strengthCount = session.exercises.length;
    const runCount = session.cardio ? 1 : 0;
    const parts = [];
    if (strengthCount) parts.push(`${strengthCount} ${strengthCount === 1 ? "krachtoefening" : "krachtoefeningen"}`);
    if (runCount) parts.push("1 run");
    if (!parts.length) parts.push(`${Math.max(1, strengthCount + runCount)} onderdeel`);
    return `${parts.join(" + ")} · geschatte tijd ${estimatedSessionDuration(session)}`;
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
        good: "Loop de blokken netjes en constant. Ga niet onnodig harder; de winst zit in controle.",
        tired: "Maak de blokken korter of vervang door easy. Forceer geen marathontempo bij heup-, bovenbeen-, kuit- of enkelklachten.",
        technique: "Romp lang, pasritme soepel, ademhaling stevig maar controleerbaar, geen sprintgevoel.",
        why: "Deze run bouwt vertrouwen op in 12 km/u als werktempo richting de marathon.",
      },
      long: {
        goal: "Duurvermogen, mentale hardheid, energiehuishouding en belastbaarheid opbouwen.",
        tempo: "Rustige delen meestal 9,5–10,0 km/u. Marathontempo-blokken alleen als het schema dat aangeeft: 11,8–12,0 km/u.",
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
        good: "Maak de uitvoering netter, niet per se zwaarder. Houd de blokken technisch strak.",
        tired: "Maak er easy van of verkort de blokken. Geen tempo forceren bij pijntjes.",
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
        why: "Dit is de dag waarvoor de long runs, MP-blokken en taper zijn opgebouwd.",
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
          <span class="small muted">${mode === "today" ? "1 werkset loggen" : "preview"}</span>
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
        <select data-log-field="${kind}" data-exercise-id="${exercise.id}">
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
        ${renderTodayNavigator(week, null, dateIso)}
        <section class="empty-state">
          <h2>Alle sessies van deze week zijn afgerond.</h2>
          <p class="muted">Nieuwe kalenderweek = nieuw weekschema. Geen achterstand, geen inhaalwerk.</p>
        </section>
        ${renderWeekSessions(week, null)}
      `;
      return;
    }

    app.innerHTML = renderSessionScreen(week, active, "today", { dateIso, showDateNav: true });
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
      ${options.showDateNav ? renderTodayNavigator(week, active, dateIso) : ""}
      ${isPreview ? `<button class="secondary-button back-button" type="button" data-back-week>Terug naar weekoverzicht</button>` : ""}
      <section class="hero-card">
        <p class="status-line">${phase.phaseName} · Week ${week.calendarWeek} · Sessie ${active.sessionNumber}/${week.sessions.length}</p>
        <h2 class="training-title">${active.title}</h2>
        <p class="session-summary">${sessionSummary(active)}</p>
        <div class="compact-meta">
          <span class="chip">${week.label}</span>
          <span class="chip">${formatDate(week.startDate)} - ${formatDate(week.endDate)}</span>
          <span class="chip">${active.type}</span>
        </div>
        ${!isPreview ? renderSessionPhilosophy(active, week) : ""}
      </section>

      ${renderSessionBlocks(active, key, week, mode, dateIso)}
      ${isPreview ? renderInfoBlocks(active.infoBlocks) : ""}

      ${isPreview ? "" : `<button class="primary-button" type="button" data-complete-session>Training afgerond</button>`}
    `;
  }

  function renderTodayNavigator(week, session, dateIso) {
    const phase = getPhase(week.phaseId);
    const phaseLabel = phase.phaseName.split("—")[0].trim();
    return `
      <section class="today-jump" aria-label="Vandaag navigatie">
        <div class="today-jump-row">
          <button type="button" data-today-prev aria-label="Vorige geplande training">‹</button>
          <button type="button" data-today-reset class="today-center" aria-label="Terug naar vandaag">${selectedDateLabel(dateIso)}</button>
          <button type="button" data-today-next aria-label="Volgende geplande training">›</button>
        </div>
        <p class="today-meta">${week.label} · ${phaseLabel} · ${sessionNavLabel(week, session)}</p>
      </section>
    `;
  }

  function sessionPhilosophy(session, week) {
    const phase = getPhase(week.phaseId);
    const text = `${session.title} ${session.cardio?.title || ""}`.toLowerCase();
    const isLong = session.type === "long-run";
    const isMp = text.includes("marathonpace") || text.includes("3:30") || session.cardio?.instruction.includes("11,8");
    const isTempo = text.includes("tempo") || text.includes("interval");
    const isEasy = text.includes("easy") || text.includes("shake-out");
    const isLower = text.includes("lower") || text.includes("leg") || text.includes("runner legs");
    const isUpper = text.includes("upper");
    const isStrength = session.exercises.length && !session.cardio;
    const kind = isLong ? "long" : isMp ? "mp" : isTempo ? "tempo" : isEasy && session.cardio ? "easy" : isLower || isStrength ? "strength" : isUpper ? "upper" : "general";
    const map = {
      easy: {
        goal: "Rustige loopkilometers maken zonder de week onnodig zwaar te maken.",
        why: isUpper ? "De run staat bij upper body zodat je loopvolume toevoegt zonder zware lower-body dagen direct te verstoren." : "Deze run houdt ritme en basis vast zonder veel herstel te kosten.",
        principles: "Easy/hard-balans, belastbaarheid en progressive overload: rustige kilometers stapelen zodat latere prikkels beter landen.",
        good: "Houd de run ontspannen. Eventueel de laatste paar minuten iets actiever, maar niet racen.",
        tired: "Verkort 5–10 minuten of houd het extra rustig. Geen tempo forceren.",
        focus: "Vandaag draait om rustig volume, niet om bewijzen.",
      },
      mp: {
        goal: "11,8–12,0 km/u als gecontroleerd werktempo leren voelen.",
        why: "Marathontempo wordt apart getraind zodat lichaam, ademhaling en hoofd wennen aan het ritme richting 3:30.",
        principles: "Specificiteit en begrenzing: oefenen wat je op marathondag nodig hebt, zonder de training maximaal te maken.",
        good: "Loop de blokken strak en constant. Ga niet veel harder dan gepland.",
        tired: "Maak blokken korter of vervang door easy. Forceer geen MP bij heup-, bovenbeen-, kuit- of enkelklachten.",
        focus: "Vandaag draait om 12 km/u gecontroleerd leren voelen.",
      },
      long: {
        goal: "Duurvermogen, mentale hardheid, energiehuishouding en belastbaarheid opbouwen.",
        why: "De long run traint niet alleen conditie, maar ook pezen, spieren, gewrichten, voeding, hydratatie en mentale rust.",
        principles: "Duurcapaciteit en specificiteit. In Fase 3 vooral rustig; in Fase 4 soms specifieker met MP op vermoeide benen.",
        good: "Volg het schema. Versnel alleen als er expliciet een fast finish of MP-blok staat.",
        tired: "Houd de hele long run rustig. Laat optionele versnellingen of MP weg.",
        focus: "Zuinig lopen, niet te hard starten, voeding oefenen en controle houden.",
      },
      tempo: {
        goal: "Snelheidsreserve bouwen zodat marathontempo makkelijker voelt.",
        why: "Deze prikkel geeft ruimte boven 12 km/u zonder dat elke training marathontempo hoeft te zijn.",
        principles: "Specificiteit via snelheidsreserve, maar met herstelbewaking: stevig lopen zonder sprintgevoel.",
        good: "Maak de uitvoering technisch beter in plaats van zwaarder.",
        tired: "Maak er easy van of verkort de blokken. Geen ego-training.",
        focus: "Vandaag draait om scherpte en techniek, niet om jezelf slopen.",
      },
      strength: {
        goal: "Kracht, spiermassa, pezen, heupen, kuiten, tibialis en core ondersteunen voor het hardlopen.",
        why: "Sterke benen en stabiele heupen helpen om meer loopvolume te verdragen. Upper/lower structuur voorkomt dat alles op dezelfde belasting stapelt.",
        principles: "Krachtbehoud en belastbaarheid: hardlopen vraagt niet alleen conditie, maar ook sterke structuren.",
        good: "Train netjes en gecontroleerd. Meer kwaliteit, niet automatisch meer gewicht.",
        tired: "Minder sets of lichter gewicht. Geen zware benen maken vlak voor belangrijke runs.",
        focus: "Vandaag draait om sterker blijven zonder je loopweek te saboteren.",
      },
      upper: {
        goal: "Upper body serieus blijven trainen terwijl hardlopen rustig in de week past.",
        why: "Upper body geeft ruimte om eventueel loopvolume toe te voegen zonder direct een zware beendag te raken.",
        principles: "Krachtbehoud, herstelspreiding en progressive overload in kleine stappen.",
        good: "Voer de krachttraining netjes uit en houd eventuele run ontspannen.",
        tired: "Lichter trainen of accessoires beperken. Bij arm/schouderklachten geen pijn forceren.",
        focus: "Rustig bouwen. Niet bewijzen. Consistent worden.",
      },
      general: {
        goal: "De geplande prikkel uitvoeren op een manier die past bij de fase.",
        why: "Deze sessie vult de weekstructuur aan zonder backlog of inhaaldruk.",
        principles: "Progressive overload, specificiteit, herstel en consistentie.",
        good: "Voer de training netjes uit en maak hem niet automatisch zwaarder.",
        tired: "Maak de training korter of lichter. Geen ego-training.",
        focus: "Vandaag draait om de juiste prikkel, niet om maximaal gaan.",
      },
    };
    return { ...map[kind], phase };
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
          <p><strong>Waarom deze sessie hier staat:</strong> ${info.why}</p>
          <p><strong>Hoe dit past binnen de fase:</strong> ${info.phase.phaseName}: ${info.phase.phaseDetails?.primaryGoal || info.phase.goal}</p>
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
    return `
      <section class="training-section running-section">
      <div class="section-title section-title-strong">
        <div>
          <h2>Hardlopen</h2>
          <p>1 run · ${compactRunLabel(cardioBlock)}</p>
        </div>
      </div>
      <section class="cardio-card" ${trackingAttrs}>
        <div class="cardio-title">
          <h3>${cardioBlock.title}</h3>
          ${
            isPreview
              ? `<span class="preview-pill">Preview</span>`
              : `<label class="done-toggle">
                  <input type="checkbox" data-cardio-done ${log.cardioDone ? "checked" : ""} />
                  Gedaan
                </label>`
          }
        </div>
        <p class="goal">${compactRunLabel(cardioBlock)}</p>
        <p class="muted small">${cardioBlock.instruction}</p>
        ${cardioBlock.outdoor ? `<p class="muted small">Buiten: ${cardioBlock.outdoor}</p>` : ""}
        ${cardioBlock.notes ? `<p class="muted small">${cardioBlock.notes}</p>` : ""}
        ${renderRunInfo(active, cardioBlock, week)}
        ${
          isPreview
            ? ""
            : `<div class="feeling-row">
                ${feelings.map(([value, label]) => `<button type="button" data-feeling="${value}" class="${log.cardioFeeling === value ? "is-selected" : ""}">${label}</button>`).join("")}
              </div>`
        }
      </section>
      </section>
    `;
  }

  function renderWeek() {
    const week = getWeekByIndex(state.viewedWeekIndex);
    const phase = getPhase(week.phaseId);
    const active = activeSessionForWeek(week);
    app.innerHTML = `
      <div class="week-nav">
        <button type="button" data-week-prev aria-label="Vorige week">‹</button>
        <div class="week-title">
          <h2>Week ${week.calendarWeek}</h2>
          <p class="status-line">${phase.phaseName} · ${week.label}</p>
        </div>
        <button type="button" data-week-next aria-label="Volgende week">›</button>
      </div>
      <div class="compact-meta">
        <span class="chip">${formatDate(week.startDate)} - ${formatDate(week.endDate)}</span>
        <span class="chip">${week.sessions.length} sessies</span>
      </div>
      <p class="muted small week-hint">Tik op een sessie voor details.</p>
      ${renderWeekSessions(week, active)}
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
            const status = done.has(key) ? "afgerond" : key === activeKey ? "actief" : "nog te doen";
            const statusClass = status === "afgerond" ? "status-done" : status === "actief" ? "status-active" : "status-next";
            return `
              <button class="session-card session-button" type="button" data-preview-week-index="${weeks.indexOf(week)}" data-preview-session="${item.sessionNumber}" aria-label="Bekijk sessie ${item.sessionNumber}: ${escapeAttr(item.title)}">
                <div>
                  <h3>${item.sessionNumber}. ${item.title}</h3>
                  <p class="status-line">${item.type}${item.cardio ? ` · ${item.cardio.title}` : ""}</p>
                  ${item.goal ? `<p class="muted small">${item.goal}</p>` : ""}
                </div>
                <span class="status-badge ${statusClass}">${status}</span>
              </button>`;
          })
          .join("")}
      </section>
    `;
  }

  function renderPhases() {
    app.innerHTML = `
      <section class="phase-list">
        ${phases
          .map(
            (phase) => `
          <article class="phase-card">
            <h3>${phase.phaseName}</h3>
            <p class="status-line">${phase.weekRange} · ${formatDate(phase.startDate)} - ${formatDate(phase.endDate)}</p>
            <div class="compact-meta phase-meta">
              <span class="chip">Duur: ${phaseDuration(phase)} weken</span>
              <span class="chip">Runs: ${phase.phaseDetails?.runsPerWeek || "-"}</span>
              <span class="chip">Gym: ${phase.phaseDetails?.gymPerWeek || "-"}</span>
              <span class="chip">${phaseWeeksToMarathonText(phase) || "Na marathon"}</span>
            </div>
            <p class="goal"><strong>Doel:</strong> ${phase.phaseDetails?.primaryGoal || phase.goal}</p>
            <details class="phase-details">
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
      <article class="info-card">
        <h3>Hardloopopbouw richting 3:30 marathon</h3>
        <p>Dit hardloopschema bereidt mij voor op een marathon rond 3:30 uur op zondag 22 november 2026. Daarvoor moet ik uiteindelijk ongeveer 12,0-12,1 km/u gemiddeld kunnen lopen. De hardloopopbouw gaat stap voor stap: eerst rustige loopgewenning, daarna drie runs per week, daarna long runs en wekelijkse marathonpace, daarna een piekfase met marathontempo op vermoeide benen, en tot slot een taper.</p>
        <ul class="compact-list">
          <li>Start schema: maandag 25 mei 2026</li>
          <li>Eerste trainingsweek: week 22</li>
          <li>Marathon: zondag 22 november 2026</li>
          <li>Laatste trainingsweek: week 47</li>
          <li>Totale voorbereiding: ongeveer 26 weken</li>
          <li>A-doel: marathon rond 3:30</li>
          <li>Praktisch marathontempo: 11,8-12,1 km/u</li>
          <li>Exacte richting 3:30: ongeveer 12,06 km/u</li>
        </ul>
      </article>
      <section class="info-list">
        ${runningBuildPhases().map(renderBuildOverviewPhase).join("")}
      </section>
      <article class="info-card">
        <h3>Kern van de opbouw</h3>
        <p>Eerst belastbaarheid, dan frequentie, dan duurvermogen, dan marathonspecifiek tempo, dan taper.</p>
      </article>
    `;
  }

  function renderBuildOverviewPhase(phase) {
    const detail = phase.phaseDetails || {};
    return `
      <article class="info-card">
        <h3>${phase.phaseName}</h3>
        <p class="status-line">${phase.weekRange} · Duur: ${phaseDuration(phase)} weken</p>
        <div class="compact-meta">
          <span class="chip">Hardlopen: ${detail.runsPerWeek || "-"}</span>
          <span class="chip">${phaseWeeksToMarathonText(phase)}</span>
        </div>
        <p class="goal"><strong>Hoofddoel:</strong> ${detail.primaryGoal || phase.goal}</p>
      </article>
    `;
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
    const rows = [];
    for (let weekNo = 29; weekNo <= 45; weekNo += 1) {
      const week = weeks.find((item) => item.calendarWeek === weekNo);
      const longRun = week?.sessions.find((session) => session.type === "long-run");
      if (week && longRun) rows.push({ week, title: longRun.cardio.title, text: longRun.cardio.instruction, note: longRun.cardio.outdoor || longRun.cardio.notes || "" });
    }
    rows.push({ week: weeks.find((item) => item.calendarWeek === 46), title: "Geen echte lange duurloop meer", text: "Taperweek: korte easy run en korte marathonpace-prikkel.", note: "Frisheid opbouwen." });
    rows.push({ week: weeks.find((item) => item.calendarWeek === 47), title: "Marathon", text: "Zondag 22 november 2026.", note: "Uitvoeren wat is voorbereid." });
    return `
      <article class="info-card">
        <h3>Long-run-opbouw</h3>
        <p>De long runs bouwen eerst vooral duurvermogen op. In Fase 3 zijn ze grotendeels rustig. In Fase 4 worden sommige long runs marathonspecifiek doordat er blokken rond 11,8–12,0 km/u in komen. Niet elke lange duurloop is hard: week 43 blijft bewust rustig omdat 30–32 km op zichzelf al een grote belasting is.</p>
      </article>
      <section class="info-list">
        ${rows
          .map(
            ({ week, title, text, note }) => `
            <article class="info-card">
              <h3>Week ${week?.calendarWeek || ""}: ${title}</h3>
              ${week ? `<p class="status-line">${formatDate(week.startDate)} - ${formatDate(week.endDate)}</p>` : ""}
              <p>${text}</p>
              ${note ? `<p class="muted small">${note}</p>` : ""}
            </article>`
          )
          .join("")}
      </section>
    `;
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
    ];
    const renderTab = {
      overview: renderStatsOverview,
      running: renderStatsRunning,
      strength: renderStatsStrength,
      exercises: renderStatsExercises,
      marathon: renderStatsMarathon,
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

    return {
      logs,
      completed,
      byExercise,
      runEntries,
      weeklyRuns: [...byWeek.values()].sort((a, b) => a.week - b.week),
      totalKm,
      totalMinutes: runEntries.reduce((sum, entry) => sum + entry.minutes, 0),
      runCount: runEntries.length,
      longRuns,
      mpRuns,
      intervalRuns,
      easyRuns,
      shakeouts,
      longestRun: runEntries.reduce((max, entry) => Math.max(max, entry.km), 0),
      currentWeekKm: byWeek.get(current.week.calendarWeek)?.km || 0,
      maxWeekKm: Math.max(0, ...[...byWeek.values()].map((week) => week.km)),
      strengthTrainingCount: strengthSessionKeys.size,
      strengthSetCount: strengthEntries.length,
      uniqueExercises: byExercise.size,
      mostLogged,
      lastStrength,
      lastTraining,
      currentWeek: current.week,
      phase,
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
        ${metricCard("Gelogde oefeningen", analytics.strengthSetCount)}
      </section>
      <section class="stat-card">
        <h3>Huidige fase</h3>
        <p class="status-line">${analytics.phase.phaseName} · ${marathonCountdownText(toIsoDate(today()))}</p>
        <p>${phaseFocus(analytics.phase.phaseId)}</p>
      </section>
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
        ${metricCard("Long runs", analytics.longRuns)}
        ${metricCard("MP-runs", analytics.mpRuns)}
        ${metricCard("Intervalruns", analytics.intervalRuns)}
        ${metricCard("Langste run", formatKm(analytics.longestRun))}
        ${metricCard("Weekvolume", formatKm(analytics.currentWeekKm))}
        ${metricCard("Meeste km/week", formatKm(analytics.maxWeekKm))}
      </section>
      ${renderChartCard("Kilometers per week", "Week", "Kilometers", "weekly-km", analytics.weeklyRuns.length >= 2)}
      ${renderChartCard("Long run opbouw", "Week", "Kilometers", "long-run", analytics.weeklyRuns.filter((row) => row.longRun > 0).length >= 2)}
      ${renderChartCard("Marathontempo-training", "Week", "Minuten MP", "mp-minutes", analytics.weeklyRuns.filter((row) => row.mpMinutes > 0).length >= 2)}
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
      </section>
      <section class="stat-card">
        <h3>Laatste krachttraining</h3>
        <p>${analytics.lastStrength ? `${analytics.lastStrength.exerciseName} · ${resultText(analytics.lastStrength)} · ${formatDate(analytics.lastStrength.date)}` : "Nog geen krachtdata."}</p>
      </section>
      ${renderChartCard("Gelogde krachtsets per week", "Week", "Sets", "strength-sets", analytics.logs.strength.length >= 2)}
    `;
  }

  function renderStatsExercises(analytics) {
    return `
      ${renderStatsTabsHeader("Oefeningen", "Tik door naar een specifieke oefening")}
      <section class="stats-list">
        ${
          analytics.byExercise.size
            ? [...analytics.byExercise.entries()].map(([exerciseId, entries], index) => renderExerciseStats(exerciseId, entries, index)).join("")
            : `<div class="empty-state"><h2>Nog geen krachtdata</h2><p class="muted">Log een oefening op Vandaag en kom hier terug.</p></div>`
        }
      </section>
    `;
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
        ${hasData ? `<canvas class="line-chart" width="320" height="160" data-chart="${chartId}" aria-label="${title}"></canvas><p class="chart-axis-label">${xLabel} · ${yLabel}</p>` : `<p class="muted small">Nog niet genoeg data om deze grafiek te tonen.</p>`}
      </section>
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
            : `<p class="muted small">Nog te weinig data voor grafiek.</p>`
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
    const trend = entries.length < 2 ? "gelijk" : diff > 0.2 ? "omhoog" : diff < -0.2 ? "omlaag" : "gelijk";
    const detailMap = new Map([[exerciseId, entries]]);
    app.innerHTML = `
      <button class="secondary-button back-button" type="button" data-stats-overview>Terug naar statistieken</button>
      <section class="stat-card exercise-detail">
        <h3>${name}</h3>
        <p class="status-line">Beste: ${resultText(best)} · Laatste: ${resultText(last)} · Trend: ${trend}</p>
        ${
          entries.length >= 2
            ? `<canvas class="line-chart" width="320" height="160" data-strength-detail="${exerciseId}"></canvas><p class="chart-axis-label">Datum · Prestatie-score</p>`
            : `<p class="muted small">Nog te weinig data voor grafiek.</p>`
        }
      </section>
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
      drawStrengthDetailChart(detailMap);
    });
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

  function drawChartById(id, points, color) {
    const canvas = document.querySelector(`canvas[data-chart="${id}"]`);
    if (!canvas) return;
    drawLineChart(canvas, points.filter((point) => point.value > 0), color);
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

  function render() {
    const activeView = state.view === "sessionPreview" ? "week" : state.view;
    navButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.view === activeView));
    const dateIso = state.view === "today" ? state.selectedDateIso || toIsoDate(today()) : toIsoDate(today());
    todayPill.textContent = parseLocalDate(dateIso).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
    if (state.view === "today") renderToday();
    if (state.view === "week") renderWeek();
    if (state.view === "sessionPreview") renderSessionPreview();
    if (state.view === "phases") renderPhases();
    if (state.view === "runBuild") renderRunBuild();
    if (state.view === "stats") renderStats();
  }

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (target.closest("#brand-home")) {
      goHomeToday();
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
    const statsTab = target.closest("[data-stats-tab]");
    if (statsTab) {
      state.statsTab = statsTab.dataset.statsTab;
      state.selectedExerciseId = null;
      state.selectedExerciseName = "";
      renderStats();
      return;
    }
    if (target.closest("[data-today-prev]")) {
      moveTodaySelection(-1);
      renderToday();
      return;
    }
    if (target.closest("[data-today-next]")) {
      moveTodaySelection(1);
      renderToday();
      return;
    }
    if (target.closest("[data-today-reset]")) {
      resetTodaySelection();
      renderToday();
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
      renderToday();
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

  function installDoubleTapGuard() {
    const appRoot = document.querySelector(".app-shell") || app;
    if (!appRoot) return;
    let lastTouchEnd = 0;
    appRoot.addEventListener(
      "touchend",
      (event) => {
        if (event.target.closest("input, select, textarea")) return;
        const interactive = event.target.closest("button, a, label, summary, .exercise-card, .session-card, .info-card, .phase-card, .stat-card, .cardio-card, .chip, .menu-panel, .today-jump");
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
