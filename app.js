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
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const menuOverlay = document.getElementById("menu-overlay");
  const navButtons = Array.from(document.querySelectorAll("[data-view]"));
  const weeks = window.TRAINING_WEEKS || [];
  const phases = window.TRAINING_PLAN || [];
  const config = window.APP_CONFIG || {};

  const state = {
    view: "today",
    viewedWeekIndex: 0,
    preview: null,
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
      recovery: Array.isArray(raw?.recovery) ? raw.recovery : [],
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

  function getPreferences() {
    const raw = safeRead(STORAGE.preferences, {});
    return raw && typeof raw === "object" ? raw : {};
  }

  function savePreferences(preferences) {
    safeWrite(STORAGE.preferences, preferences);
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

  function completeSession(week, session, mode) {
    const key = sessionKey(week, session);
    const completed = getCompleted();
    if (!completed.some((item) => item.sessionKey === key)) {
      completed.push({
        sessionKey: key,
        week: week.calendarWeek,
        phase: week.phaseId,
        session: session.sessionNumber,
        title: session.title,
        date: toIsoDate(today()),
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

  function latestStrengthLog(key, exerciseId) {
    const logs = getLogs();
    return [...logs.strength].reverse().find((entry) => entry.sessionKey === key && entry.exerciseId === exerciseId) || null;
  }

  function cardioLog(key) {
    const logs = getLogs();
    return [...logs.cardio].reverse().find((entry) => entry.sessionKey === key) || null;
  }

  function recoveryChoice(key) {
    const prefs = getPreferences();
    return prefs.recovery?.[key] || "green";
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

  function shortRecoveryText(recovery, choice) {
    const map = {
      green: "Volledige training.",
      orange: "Lichter/korter.",
      red: "Herstelvariant.",
    };
    return map[choice] || recovery?.[choice] || "";
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

  function renderSessionBlocks(session, key, week, mode) {
    const strength = session.exercises.length
      ? `
        <div class="section-title">
          <h2>Oefeningen</h2>
          <span class="small muted">${mode === "today" ? "1 werkset loggen" : "preview"}</span>
        </div>
        <section class="exercise-list">
          ${session.exercises.map((item) => renderExercise(item, key, week, session, mode)).join("")}
        </section>
      `
      : "";
    const cardioBlock = session.cardio ? renderCardio(session.cardio, key, week, session, mode) : "";
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
    const week = getWeekByIndex(currentWeekIndex());
    state.viewedWeekIndex = currentWeekIndex();
    const active = activeSessionForWeek(week);

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

    app.innerHTML = renderSessionScreen(week, active, "today");
  }

  function renderSessionPreview() {
    const week = getWeekByIndex(state.preview?.weekIndex ?? state.viewedWeekIndex);
    const session = week.sessions.find((item) => item.sessionNumber === state.preview?.sessionNumber) || week.sessions[0];
    app.innerHTML = renderSessionScreen(week, session, "preview");
  }

  function renderSessionScreen(week, active, mode) {
    const phase = getPhase(week.phaseId);
    const key = sessionKey(week, active);
    const recovery = mode === "today" ? recoveryChoice(key) : "green";
    const recoveryText = shortRecoveryText(active.recovery, recovery);
    const isPreview = mode === "preview";
    return `
      ${isPreview ? `<button class="secondary-button back-button" type="button" data-back-week>Terug naar weekoverzicht</button>` : ""}
      <section class="hero-card">
        <p class="status-line">${phase.phaseName} · Week ${week.calendarWeek} · Sessie ${active.sessionNumber}/${week.sessions.length}</p>
        <h2 class="training-title">${active.title}</h2>
        ${active.goal ? `<p class="goal">${active.goal}</p>` : ""}
        <div class="compact-meta">
          <span class="chip active">${week.label}</span>
          <span class="chip">${formatDate(week.startDate)} - ${formatDate(week.endDate)}</span>
          <span class="chip">${active.type}</span>
        </div>
      </section>

      <section class="recovery-box">
        <div class="segmented" aria-label="Herstelkeuze">
          <button type="button" ${isPreview ? "disabled" : 'data-recovery="green"'} class="${recovery === "green" ? "is-selected" : ""}">Groen</button>
          <button type="button" ${isPreview ? "disabled" : 'data-recovery="orange"'} class="${recovery === "orange" ? "is-selected" : ""}">Oranje</button>
          <button type="button" ${isPreview ? "disabled" : 'data-recovery="red"'} class="${recovery === "red" ? "is-selected" : ""}">Rood</button>
        </div>
        <p class="recovery-message">${recoveryText}</p>
      </section>

      ${renderSessionBlocks(active, key, week, mode)}
      ${renderInfoBlocks(active.infoBlocks)}

      ${isPreview ? "" : `<button class="primary-button" type="button" data-complete-session>Training afgerond</button>`}
      <details>
        <summary>Extra schema-info</summary>
        <div class="details-body">
          <p><strong>Warming-up:</strong> ${active.warmup || "Volgens schema."}</p>
          ${active.notes ? `<p><strong>Notitie:</strong> ${active.notes}</p>` : ""}
          <p><strong>Faseregel:</strong> ${phase.rules}</p>
          ${renderRecoveryDetails(active.recovery)}
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

  function renderRecoveryDetails(recovery) {
    if (!recovery) return "";
    const subRules = Array.isArray(recovery.subRules) ? recovery.subRules : [];
    return `
      <p><strong>Groen:</strong> ${recovery.green}</p>
      <p><strong>Oranje:</strong> ${recovery.orange}</p>
      <p><strong>Rood:</strong> ${recovery.red}</p>
      ${
        subRules.length
          ? `<p><strong>Subregels:</strong></p><ul class="compact-list">${subRules.map((rule) => `<li>${rule}</li>`).join("")}</ul>`
          : ""
      }
    `;
  }

  function renderExercise(exercise, key, week, active, mode = "today") {
    const isPreview = mode === "preview";
    const log = isPreview ? null : latestStrengthLog(key, exercise.id);
    const best = isPreview ? null : bestResult(exercise.id);
    const alternatives = Array.isArray(exercise.alternatives) ? exercise.alternatives : [];
    const trackingAttrs = isPreview
      ? ""
      : `data-exercise-row data-session-key="${key}" data-week="${week.calendarWeek}" data-phase="${week.phaseId}" data-session="${active.sessionNumber}" data-exercise-id="${exercise.id}" data-exercise-name="${escapeAttr(exercise.name)}" data-planned="${escapeAttr(exercise.planned)}"`;
    return `
      <article class="exercise-card" ${trackingAttrs}>
        <div class="exercise-top">
          <button class="exercise-name" type="button" data-toggle-details>${exercise.name}</button>
          <div class="planned">${exercise.planned}</div>
        </div>
        ${isPreview ? "" : exerciseControls(exercise, log)}
        <details>
          <summary>Info</summary>
          <div class="details-body">
            ${isPreview ? "" : `<p><strong>Beste resultaat:</strong> ${best ? resultText(best) : "nog geen data"}</p>`}
            <p><strong>Tips:</strong> ${exercise.tips}</p>
            <p><strong>Regel:</strong> ${exercise.warning}</p>
            ${alternatives.length ? `<p><strong>Alternatieven:</strong> ${alternatives.join(", ")}</p>` : ""}
            <p>${exercise.info}</p>
          </div>
        </details>
      </article>
    `;
  }

  function renderCardio(cardioBlock, key, week, active, mode = "today") {
    const isPreview = mode === "preview";
    const log = isPreview ? {} : cardioLog(key) || {};
    const feelings = [
      ["easy", "Makkelijk"],
      ["normal", "Normaal"],
      ["heavy", "Zwaar"],
    ];
    const trackingAttrs = isPreview
      ? ""
      : `data-cardio-key="${key}" data-week="${week.calendarWeek}" data-phase="${week.phaseId}" data-session="${active.sessionNumber}"`;
    return `
      <div class="section-title">
        <h2>Hardlopen</h2>
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
        <p class="goal">${cardioBlock.instruction}</p>
        ${cardioBlock.outdoor ? `<p class="muted small">Buiten: ${cardioBlock.outdoor}</p>` : ""}
        ${cardioBlock.notes ? `<p class="muted small">${cardioBlock.notes}</p>` : ""}
        ${
          isPreview
            ? ""
            : `<div class="feeling-row">
                ${feelings.map(([value, label]) => `<button type="button" data-feeling="${value}" class="${log.cardioFeeling === value ? "is-selected" : ""}">${label}</button>`).join("")}
              </div>`
        }
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
            <p class="goal">${phase.goal}</p>
            <details>
              <summary>Structuur en regels</summary>
              <div class="details-body">
                <p><strong>Structuur:</strong> ${phase.structure}</p>
                <p><strong>Regels:</strong> ${phase.rules}</p>
                ${renderRecoveryDetails(phase.recovery)}
              </div>
            </details>
          </article>`
          )
          .join("")}
      </section>
    `;
  }

  function renderStats() {
    const logs = getLogs();
    const completed = getCompleted();
    const cardioDone = logs.cardio.filter((entry) => entry.cardioDone).length;
    const feelings = logs.cardio.reduce(
      (acc, entry) => {
        if (entry.cardioFeeling) acc[entry.cardioFeeling] += 1;
        return acc;
      },
      { easy: 0, normal: 0, heavy: 0 }
    );
    const byExercise = new Map();
    logs.strength.forEach((entry) => {
      if (!byExercise.has(entry.exerciseId)) byExercise.set(entry.exerciseId, []);
      byExercise.get(entry.exerciseId).push(entry);
    });

    app.innerHTML = `
      <section class="stat-grid">
        <div class="metric"><strong>${completed.length}</strong><span class="muted">Afgeronde trainingen</span></div>
        <div class="metric"><strong>${cardioDone}</strong><span class="muted">Afgeronde runs</span></div>
      </section>
      <section class="stat-card">
        <h3>Cardio-gevoel</h3>
        <p class="goal">Makkelijk: ${feelings.easy} · Normaal: ${feelings.normal} · Zwaar: ${feelings.heavy}</p>
      </section>
      <div class="section-title"><h2>Oefeningen</h2></div>
      <section class="stats-list">
        ${
          byExercise.size
            ? [...byExercise.entries()].map(([exerciseId, entries], index) => renderExerciseStats(exerciseId, entries, index)).join("")
            : `<div class="empty-state"><h2>Nog geen krachtdata</h2><p class="muted">Log een oefening op Vandaag en kom hier terug.</p></div>`
        }
      </section>
      <button class="danger-button" type="button" data-reset>Wis lokale trainingsdata</button>
    `;
    window.requestAnimationFrame(() => drawSparklines(byExercise));
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
      </article>
    `;
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
        date: toIsoDate(today()),
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
        date: toIsoDate(today()),
        phase: card.dataset.phase,
        week: Number(card.dataset.week),
        session: Number(card.dataset.session),
        loggedAt: new Date().toISOString(),
      });
    }
    saveLogs(logs);
  }

  function setRecovery(value) {
    const week = getWeekByIndex(currentWeekIndex());
    const active = activeSessionForWeek(week);
    if (!active) return;
    const key = sessionKey(week, active);
    const prefs = getPreferences();
    prefs.recovery = prefs.recovery || {};
    prefs.recovery[key] = value;
    savePreferences(prefs);
    render();
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

  function render() {
    const activeView = state.view === "sessionPreview" ? "week" : state.view;
    navButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.view === activeView));
    const date = today();
    todayPill.textContent = date.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
    if (state.view === "today") renderToday();
    if (state.view === "week") renderWeek();
    if (state.view === "sessionPreview") renderSessionPreview();
    if (state.view === "phases") renderPhases();
    if (state.view === "stats") renderStats();
  }

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (target.closest("#menu-toggle")) {
      openMenu();
      return;
    }

    if (target.closest("#menu-close") || target === menuOverlay) {
      closeMenu();
      return;
    }

    const navButton = target.closest("[data-view]");
    if (navButton) {
      state.view = navButton.dataset.view;
      state.preview = null;
      if (state.view === "week") state.viewedWeekIndex = currentWeekIndex();
      closeMenu();
      render();
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
    const recoveryButton = target.closest("[data-recovery]");
    if (recoveryButton) {
      setRecovery(recoveryButton.dataset.recovery);
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
      const week = getWeekByIndex(currentWeekIndex());
      const active = activeSessionForWeek(week);
      if (active) completeSession(week, active, "manual");
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
      if (window.confirm("Weet je zeker dat je alle lokale trainingsdata wilt wissen?")) {
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

  function boot() {
    autoCompleteStaleSessions();
    state.viewedWeekIndex = currentWeekIndex();
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
