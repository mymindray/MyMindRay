const STORE_KEY = "wellledger-state-v2";

const POSITIVE = ["calm","good","better","happy","grateful","okay","ok","fine","hope","peace","relaxed","proud","light","safe","loved","progress","slept"];
const LOW = ["sad","tired","low","down","lonely","empty","hurt","cry","crying","hopeless","numb","heavy"];
const STRESS = ["stress","stressed","anxious","anxiety","worry","worried","panic","overwhelmed","exam","pressure","angry","irritated","restless"];
const CARE = ["help","hurt myself","end it","suicide","kill","die","don't want to be here","dont want to be here"];

const LIBRARY = [
  { id: "breathe", title: "Breathing and meditation techniques", tags: ["stress","anxious","panic"] },
  { id: "stress", title: "Identifying sources of stress", tags: ["stress","exam","pressure"] },
  { id: "sleep", title: "Sleep reset before exams", tags: ["tired","sleep"] },
  { id: "kind", title: "Talking to yourself with kindness", tags: ["sad","low","lonely"] },
  { id: "focus", title: "One-task focus drill", tags: ["overwhelmed"] },
];

const THERAPISTS = [
  { name: "Dr. McCoy", role: "Psychotherapist", seed: "McCoy", color: "d1d4f9" },
  { name: "Darlene Robertson", role: "Family therapist", seed: "Darlene", color: "ffd5dc" },
];

function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fmtDay(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
function fmtMins(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}min` : `${m}min`;
}
function pctDelta(now, prev) {
  if (!prev) return { text: "new", up: true };
  const n = Math.round(((now - prev) / prev) * 100);
  return { text: `${n >= 0 ? "+" : ""}${n}%`, up: n >= 0 };
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

const DEMO_MODE = /demodashboard\.html/i.test(location.pathname) || new URLSearchParams(location.search).get("demo") === "1";
if (DEMO_MODE) sessionStorage.setItem("wl-mode", "demo");
else sessionStorage.setItem("wl-mode", "live");
let accountUid = null;

function isDemo() { return DEMO_MODE; }

function seedEmotions() {
  const map = {};
  for (let i = 20; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const wave = [68, 58, 72, 92, 46, 60, 48][i % 7];
    map[todayKey(d)] = wave;
  }
  return map;
}

function dailySources() {
  const day = Math.floor(Date.now() / 86400000);
  const n = LIBRARY.length ? day % LIBRARY.length : 0;
  const order = LIBRARY.slice(n).concat(LIBRARY.slice(0, n));
  return order.map((s) => ({ ...s, done: false }));
}

function emptyLiveState() {
  return {
    name: "",
    insight: "Your dashboard starts at zero. Check in, finish a Relax practice, or mark a source done.",
    goals: 0,
    goalsPrev: 0,
    sessionsMonth: 0,
    sessionsPrev: 0,
    sourcesSeen: 0,
    sourcesPrev: 0,
    emotions: {},
    sources: dailySources(),
    sourceDay: todayKey(),
    exercises: [
      { id: "gratitude", name: "Gratitude journal", icon: "GJ", pct: 0, minutes: 0, tag: "Positive thinking", logs: 0, notes: 0 },
      { id: "aware", name: "The power of awareness", icon: "PA", pct: 0, minutes: 0, tag: "Mindfulness", logs: 0, notes: 0 },
    ],
    upcoming: [],
    records: [],
    checkins: [],
    journal: [],
    alerts: [],
    seenNoticeIds: [],
    clearedNoticeIds: [],
    visitDays: [],
    exerciseDoneDays: [],
    activityLog: [],
    liveReady: true,
    lastMood: "",
    profile: {
      name: "",
      fullName: "",
      country: "",
      state: "",
      city: "",
      address: "",
      campus: "",
      email: "",
      username: "",
      personalPhone: "",
      familyPhone: "",
      friendPhone: "",
      avatar: "Luna",
      theme: "dark",
      joined: "",
      joinedAt: ""
    }
  };
}

function demoState() {
  return {
    name: "Amanda",
    insight: "My MindRay AI is ready. Check in with how you feel — the graph and cards will update and stay saved on this device.",
    goals: 14,
    goalsPrev: 12,
    sessionsMonth: 6,
    sessionsPrev: 5,
    sourcesSeen: 22,
    sourcesPrev: 31,
    emotions: seedEmotions(),
    sources: LIBRARY.slice(0, 4).map((s, i) => ({ ...s, done: i === 3 })),
    sourceDay: todayKey(),
    exercises: [
      { id: "gratitude", name: "Gratitude journal", icon: "GJ", pct: 98, minutes: 392, tag: "Positive thinking", logs: 16, notes: 3 },
      { id: "aware", name: "The power of awareness", icon: "PA", pct: 55, minutes: 700, tag: "Mindfulness", logs: 0, notes: 1 },
    ],
    upcoming: [
      { name: "Dr. McCoy", role: "Psychotherapist", seed: "McCoy", color: "d1d4f9", time: "12:00", date: "2026-09-18" },
      { name: "Darlene Robertson", role: "Family therapist", seed: "Darlene", color: "ffd5dc", time: "18:30", date: "2026-09-24" },
      { name: "Dr. McCoy", role: "Psychotherapist", seed: "McCoy2", color: "d1d4f9", time: "12:00", date: "2026-09-28" },
      { name: "Darlene Robertson", role: "Family therapist", seed: "Darlene2", color: "ffd5dc", time: "18:30", date: "2026-09-30" },
    ],
    records: [
      { title: "Protecting personal space", who: "Dr. McCoy", mins: 45 },
      { title: "Respectful relationship s3", who: "Darlene Robertson", mins: 67 },
      { title: "Respectful relationship s2", who: "Darlene Robertson", mins: 58 },
    ],
    checkins: [],
    journal: [],
    alerts: [],
    seenNoticeIds: [],
    clearedNoticeIds: [],
    visitDays: [],
    exerciseDoneDays: [],
    activityLog: [],
    liveReady: true,
    lastMood: "okay",
    profile: {
      name: "Amanda",
      fullName: "Amanda Kaur",
      country: "India",
      state: "Punjab",
      city: "Phagwara",
      address: "Phagwara, Punjab, India",
      campus: "",
      email: "",
      username: "amanda",
      personalPhone: "",
      familyPhone: "",
      friendPhone: "",
      avatar: "Luna",
      theme: "dark",
      joined: "March 2026",
    },
  };
}

function defaultState() {
  return isDemo() ? demoState() : emptyLiveState();
}

function fillEmotionDays(existing = {}) {
  if (isDemo()) return { ...seedEmotions(), ...existing };
  return { ...(existing || {}) };
}

function sanitizeLive(s) {
  if (isDemo() || !s) return s;
  const demoNames = /McCoy|Darlene Robertson/i;
  const looksSeeded = s.goals === 14 && s.sourcesSeen === 22 && (s.profile && s.profile.fullName === "Amanda Kaur") && !(s.checkins && s.checkins.length);
  if (!s.liveReady || looksSeeded) {
    const keep = emptyLiveState();
    keep.profile = Object.assign(keep.profile, s.profile || {});
    if (keep.profile.fullName === "Amanda Kaur" && !keep.profile.username) keep.profile.fullName = "";
    keep.checkins = Array.isArray(s.checkins) ? s.checkins : [];
    keep.journal = Array.isArray(s.journal) ? s.journal : [];
    keep.visitDays = Array.isArray(s.visitDays) ? s.visitDays : [];
    keep.exerciseDoneDays = Array.isArray(s.exerciseDoneDays) ? s.exerciseDoneDays : [];
    keep.activityLog = Array.isArray(s.activityLog) ? s.activityLog : [];
    keep.emotions = s.emotions && !looksSeeded ? s.emotions : {};
    keep.upcoming = (s.upcoming || []).filter((a) => !demoNames.test(a.name || ""));
    keep.goals = looksSeeded ? 0 : (s.goals || 0);
    keep.liveReady = true;
    return keep;
  }
  s.upcoming = (s.upcoming || []).filter((a) => !demoNames.test(a.name || ""));
  s.liveReady = true;
  return s;
}

function loadState() {
  try {
    const key = isDemo() ? STORE_KEY : STORE_KEY;
    const raw = localStorage.getItem(isDemo() ? STORE_KEY : STORE_KEY);
    if (!raw) return defaultState();
    if (!isDemo()) return defaultState();
    const saved = JSON.parse(raw);
    const merged = { ...demoState(), ...saved };
    merged.emotions = fillEmotionDays(saved.emotions || {});
    if (!Array.isArray(merged.records)) merged.records = demoState().records;
    merged.records = merged.records.map((r) => ({ ...r, played: false }));
    if (!Array.isArray(merged.seenNoticeIds)) merged.seenNoticeIds = [];
    if (!Array.isArray(merged.clearedNoticeIds)) merged.clearedNoticeIds = [];
    if (!merged.profile) merged.profile = demoState().profile;
    return merged;
  } catch {
    return defaultState();
  }
}

function liveKey(uid) {
  return "wellledger-live-" + uid;
}

function saveState() {
  if (DEMO_MODE || !accountUid) {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    return;
  }
  localStorage.setItem(liveKey(accountUid), JSON.stringify(state));
  if (typeof createSb === "function") {
    const client = createSb();
    client?.from("user_state").upsert({
      id: accountUid,
      data: state,
      updated_at: new Date().toISOString(),
    });
    const p = state.profile || {};
    client?.from("profiles").upsert({
      id: accountUid,
      email: p.email || "",
      username: p.username || "",
      personal_phone: p.personalPhone || "",
      family_phone: p.familyPhone || "",
      friend_phone: p.friendPhone || ""
    });
  }
}

let state = loadState();
if (state.theme && window.setWellTheme) window.setWellTheme(state.theme);
let chartRange = "week";
let chosenMood = "okay";
let chosenSleep = "";
let chosenEnergy = "";

function analyze(text, mood) {
  const t = (text || "").toLowerCase();
  const hit = (list) => list.filter((w) => t.includes(w));
  const care = hit(CARE);
  const pos = hit(POSITIVE);
  const low = hit(LOW);
  const stress = hit(STRESS);

  const moodScore = { calm: 85, okay: 62, low: 40, stressed: 25 }[mood] || 60;
  let score = moodScore + pos.length * 6 - low.length * 8 - stress.length * 9;
  score = clamp(Math.round(score), 12, 98);

  let label = "steady";
  if (care.length) label = "needs-care";
  else if (stress.length >= 1 || mood === "stressed") label = "stressed";
  else if (low.length >= 1 || mood === "low") label = "low";
  else if (pos.length >= 1 || mood === "calm") label = "lifted";

  return { score, label, pos, low, stress, care, text: text.trim() };
}

function recommend(result) {
  const added = [];
  const want = result.label === "stressed" || result.label === "low" || result.label === "needs-care"
    ? LIBRARY
    : LIBRARY.filter((s) => s.tags.some((tag) => result.pos.length || tag === "kind"));
  want.forEach((src) => {
    if (!state.sources.some((s) => s.id === src.id)) {
      state.sources.unshift({ ...src, done: false });
      added.push(src.title);
    }
  });
  state.sources = state.sources.slice(0, 6);
  return added;
}

function writeInsight(result) {
  if (result.label === "needs-care") {
    return "The check-in noticed words that sound heavy. Please tell a trusted adult, and use Urgent Support if you need a helpline now.";
  }
  if (result.label === "stressed") {
    return "My MindRay AI read tension in today's check-in. Breathing practice was pinned, and a calmer session slot is suggested.";
  }
  if (result.label === "low") {
    return "Energy looks lower today. A short gratitude minute can still count — try the journal exercise.";
  }
  if (result.label === "lifted") {
    return "Mood looks lighter. My MindRay AI counted this toward your wellness goals and kept your streak moving.";
  }
  return "Check-in saved. Keep using exercises and sessions — the graph follows the last 7 days on this device.";
}

function logActivity(kind, text) {
  state.activityLog = Array.isArray(state.activityLog) ? state.activityLog : [];
  state.activityLog.push({ at: Date.now(), day: todayKey(), kind, text });
  state.activityLog = state.activityLog.slice(-200);
}

function applyCheckin(mood, text, sleep, energy) {
  const result = analyze(text, mood);
  if (sleep === "poorly") result.score = clamp(result.score - 6, 12, 98);
  if (sleep === "well") result.score = clamp(result.score + 3, 12, 98);
  if (energy === "low") result.score = clamp(result.score - 4, 12, 98);
  if (energy === "high") result.score = clamp(result.score + 3, 12, 98);
  state.emotions[todayKey()] = result.score;
  state.checkins.push({ at: Date.now(), mood, text, sleep, energy, score: result.score, label: result.label });
  state.lastMood = mood;
  try { localStorage.setItem("wl-last-mood", mood); } catch {}
  const note = (text || "").trim();
  if (note) {
    state.journal = state.journal || [];
    const day = todayKey();
    const existing = state.journal.find((j) => j.day === day);
    if (existing) existing.text = (existing.text ? existing.text + "\n\n" : "") + note;
    else state.journal.push({ day, text: note, at: Date.now() });
  }
  logActivity("check-in", "Mood " + mood + (note ? " — " + note.slice(0, 80) : ""));
  if (result.label === "lifted" || ["calm","okay"].includes(mood)) state.goals += 1;
  else if (["low","stressed"].includes(mood)) state.goals = Math.max(0, state.goals);
  if (result.label === "stressed" || result.label === "low") {
    const journal = state.exercises.find((e) => e.id === "gratitude");
    if (journal) journal.notes += 1;
  }
  recommend(result);
  const relaxNote = " Your relax exercises and games were refreshed for today's mood — check the Relax page.";
  if (result.label === "stressed") {
    state.insight = writeInsight(result) + " You can schedule a talk from Upcoming." + relaxNote;
  } else {
    state.insight = writeInsight(result) + relaxNote;
  }
  saveState();
  renderAll();
  toast("Check-in saved on this device");
  if (result.label === "needs-care") openModal("crisis");
  return result;
}

function completeExercise(id) {
  const ex = state.exercises.find((e) => e.id === id);
  if (!ex) return;
  ex.minutes += 8;
  ex.logs += 1;
  ex.pct = clamp(ex.pct + 3, 0, 100);
  state.goals += 1;
  const prev = state.emotions[todayKey()] || 60;
  state.emotions[todayKey()] = clamp(prev + 4, 12, 98);
  state.insight = `You spent 8 minutes on “${ex.name}”. My MindRay AI raised today's emotional score and your goal count.`;
  saveState();
  renderAll();
  toast("Exercise logged");
}

function nearbyDoctors() {
  const p = (state && state.profile) || {};
  const pool = (typeof DOCTORS !== "undefined" && Array.isArray(DOCTORS)) ? DOCTORS : THERAPISTS;
  const country = (p.country || "").toLowerCase();
  const stateName = (p.state || "").toLowerCase();
  if (!country) return [];
  const inCountry = pool.filter((d) => String(d.country || "India").toLowerCase() === country);
  if (!stateName) return inCountry;
  const here = inCountry.filter((d) => String(d.state || "").toLowerCase() === stateName);
  const other = inCountry.filter((d) => String(d.state || "").toLowerCase() !== stateName);
  return here.concat(other);
}

function clinicianOptions() {
  const list = (typeof nearbyDoctors === "function" ? nearbyDoctors() : THERAPISTS) || THERAPISTS;
  return list;
}

function addAppointment(name, time, dateIso) {
  const pool = clinicianOptions();
  const t = pool.find((x) => x.name === name) || pool[0] || THERAPISTS[0];
  state.upcoming.unshift({
    name: t.name,
    role: t.role || t.city || "Clinician",
    seed: (t.seed || t.id || t.name) + Date.now(),
    color: t.color || "d1d4f9",
    time,
    date: dateIso || todayKey(),
  });
  state.sessionsMonth += 1;
  state.insight = `Consultation with ${t.name} added. Session count for this month is now ${state.sessionsMonth}.`;
  saveState();
  renderAll();
  toast("Consultation added");
}

function lastDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = todayKey(d);
    const val = Number(state.emotions[k]);
    out.push({ key: k, h: `${Number.isFinite(val) ? clamp(val, 0, 100) : 0}%` });
  }
  return out;
}

function ensureJoinDate() {
  if (!state.profile) state.profile = defaultState().profile;
  if (!state.profile.joinedAt) {
    const keys = Object.keys(state.emotions || {}).sort();
    const visitKeys = (state.visitDays || []).slice().sort();
    state.profile.joinedAt = keys[0] || visitKeys[0] || todayKey();
  }
  return state.profile.joinedAt;
}

function daysBetween(startIso, endIso) {
  const out = [];
  const d = new Date(startIso + "T12:00:00");
  const end = new Date(endIso + "T12:00:00");
  while (d <= end) {
    out.push(todayKey(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function monthsBetween(startIso, endIso) {
  const out = [];
  const s = new Date(startIso + "T12:00:00");
  const e = new Date(endIso + "T12:00:00");
  const d = new Date(s.getFullYear(), s.getMonth(), 1);
  const last = new Date(e.getFullYear(), e.getMonth(), 1);
  while (d <= last) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() + 1);
  }
  return out;
}

function yearsBetween(startIso, endIso) {
  const out = [];
  const s = new Date(startIso + "T12:00:00").getFullYear();
  const e = new Date(endIso + "T12:00:00").getFullYear();
  for (let y = s; y <= e; y++) out.push(y);
  return out;
}

function avgForPrefix(prefix) {
  const vals = Object.keys(state.emotions)
    .filter((k) => k.startsWith(prefix))
    .map((k) => Number(state.emotions[k]))
    .filter((n) => Number.isFinite(n));
  const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  return { has: vals.length > 0, avg };
}

// Real data only: every bar reflects actual saved check-ins/emotion scores.
// The series always starts on the exact date the account was first used
// (state.profile.joinedAt, backed by the Supabase user_state row) and runs
// through today, so the leftmost bar on the leftmost page is day/month/year one.
function emotionSeries(range) {
  const joined = ensureJoinDate();
  const today = todayKey();
  const startIso = joined < today ? joined : today;

  if (range === "week") {
    return daysBetween(startIso, today).map((k) => {
      const val = Number(state.emotions[k]);
      const d = new Date(k + "T12:00:00");
      return {
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        h: `${Number.isFinite(val) ? clamp(val, 0, 100) : 0}%`,
      };
    });
  }

  if (range === "month") {
    return monthsBetween(startIso, today).map((prefix) => {
      const { has, avg } = avgForPrefix(prefix);
      const d = new Date(prefix + "-01T12:00:00");
      return {
        label: d.toLocaleDateString("en-US", { month: "short" }),
        h: `${has ? clamp(avg, 0, 100) : 0}%`,
      };
    });
  }

  return yearsBetween(startIso, today).map((y) => {
    const { has, avg } = avgForPrefix(String(y));
    return {
      label: String(y),
      h: `${has ? clamp(avg, 0, 100) : 0}%`,
    };
  });
}

function chunk(arr, size) {
  const pages = [];
  for (let i = 0; i < arr.length; i += size) pages.push(arr.slice(i, i + size));
  return pages;
}

function replayBarRise(scope) {
  const root = scope || document.getElementById("bars");
  if (!root) return;
  root.querySelectorAll(".bar").forEach((bar, i) => {
    bar.classList.remove("rise");
    bar.style.animationDelay = `${0.04 * i}s`;
    void bar.offsetWidth;
    bar.classList.add("rise");
  });
}

function renderBars() {
  const barsEl = document.getElementById("bars");
  const viewport = document.getElementById("barsViewport");
  if (!barsEl) return;
  const items = emotionSeries(chartRange);
  const pages = chunk(items, chartRange === "week" ? 7 : 6);
  barsEl.innerHTML = pages
    .map(
      (page) => `
      <div class="bar-page">
        ${page
          .map(
            (item) => `
          <div class="bar-wrap">
            <div class="bar" style="--h:${item.h}">
              <span class="top"></span><span class="mid"></span><span class="bot"></span>
            </div>
            <span class="bar-label">${item.label}</span>
          </div>`
          )
          .join("")}
      </div>`
    )
    .join("");

  if (viewport) {
    viewport.scrollLeft = Math.max(0, (pages.length - 1) * viewport.clientWidth);
    viewport.dataset.lastPage = String(pages.length - 1);
    if (!viewport.dataset.snapBound) {
      viewport.dataset.snapBound = "1";
      let snapTimer;
      viewport.addEventListener("scroll", () => {
        clearTimeout(snapTimer);
        snapTimer = setTimeout(() => {
          const page = Math.round(viewport.scrollLeft / Math.max(viewport.clientWidth, 1));
          if (String(page) === viewport.dataset.lastPage) return;
          viewport.dataset.lastPage = String(page);
          const visible = barsEl.querySelectorAll(".bar-page")[page];
          replayBarRise(visible || barsEl);
        }, 90);
      });
    }
  }
  const lastPage = barsEl.querySelectorAll(".bar-page");
  requestAnimationFrame(() => replayBarRise(lastPage[lastPage.length - 1] || barsEl));
}

function renderStats() {
  const g = pctDelta(state.goals, state.goalsPrev);
  document.getElementById("progressNum").textContent = state.goals;
  const pd = document.getElementById("progressDelta");
  pd.textContent = g.text;
  pd.className = `badge ${g.up ? "badge-up" : "badge-down"}`;
  document.getElementById("progressFill").style.setProperty("--w", `${clamp(state.goals * 4, 0, 100)}%`);

  const doneCount = (state.sources || []).filter((s) => s.done).length;
  state.sourcesSeen = doneCount;
  const e = pctDelta(state.sourcesSeen, state.sourcesPrev);
  document.getElementById("eduNum").textContent = state.sourcesSeen;
  const ed = document.getElementById("eduDelta");
  ed.textContent = e.text;
  ed.className = `badge ${e.up ? "badge-up" : "badge-down"}`;
  const list = document.getElementById("eduList");
  if (state.sourceDay !== todayKey()) {
    const doneMap = {};
    (state.sources || []).forEach((s) => { if (s.done) doneMap[s.id] = true; });
    state.sources = dailySources();
    state.sourceDay = todayKey();
  }
  list.innerHTML = (state.sources || [])
    .slice(0, 4)
    .map(
      (s) => `<li data-src="${s.id}"><button type="button" class="check src-toggle" data-src="${s.id}" aria-label="Mark source">${s.done ? "✓" : "+"}</button>${s.title}</li>`
    )
    .join("");
  list.querySelectorAll(".src-toggle").forEach((btn) => {
    btn.onclick = () => {
      const src = state.sources.find((s) => s.id === btn.dataset.src);
      if (!src) return;
      src.done = !src.done;
      if (src.done) {
        state.goals += 1;
        state.sourcesSeen = (state.sourcesSeen || 0) + 1;
        const prev = Number(state.emotions[todayKey()]);
        state.emotions[todayKey()] = clamp((Number.isFinite(prev) ? prev : 50) + 3, 0, 98);
        logActivity("source", "Marked done: " + src.title);
      } else {
        state.goals = Math.max(0, state.goals - 1);
        state.sourcesSeen = Math.max(0, (state.sourcesSeen || 0) - 1);
        const prev = Number(state.emotions[todayKey()]);
        if (Number.isFinite(prev)) state.emotions[todayKey()] = clamp(prev - 3, 0, 98);
        logActivity("source", "Unmarked: " + src.title);
      }
      saveState();
      renderAll();
    };
  });
}

/* ---------- Streaks ---------- */
const GOOD_MOODS = new Set(["calm", "okay"]);
const BAD_MOODS = new Set(["low", "stressed"]);

function dayMoodMap() {
  const map = {};
  (state.checkins || []).forEach((c) => {
    const k = todayKey(new Date(c.at));
    map[k] = c.mood; // last checkin of the day wins
  });
  return map;
}

function computeWellnessStreak() {
  const map = dayMoodMap();
  let cursor = new Date();
  let key = todayKey(cursor);
  // if today has no check-in yet, don't break the streak — start counting from yesterday
  if (!map[key]) {
    cursor.setDate(cursor.getDate() - 1);
    key = todayKey(cursor);
  }
  let streak = 0;
  while (map[key] && GOOD_MOODS.has(map[key])) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
    key = todayKey(cursor);
  }
  return streak;
}

function visitStoreKey() {
  return "wl-visits-" + (accountUid || (DEMO_MODE ? "demo" : "anon"));
}

function recordVisitToday() {
  state.visitDays = Array.isArray(state.visitDays) ? state.visitDays : [];
  try {
    const extra = JSON.parse(localStorage.getItem(visitStoreKey()) || "[]");
    if (Array.isArray(extra)) extra.forEach((d) => { if (!state.visitDays.includes(d)) state.visitDays.push(d); });
  } catch {}
  const key = todayKey();
  if (!state.visitDays.includes(key)) {
    state.visitDays.push(key);
    state.visitDays = state.visitDays.slice(-400);
  }
  try { localStorage.setItem(visitStoreKey(), JSON.stringify(state.visitDays)); } catch {}
  saveState();
}

function computeCheckinStreak() {
  const days = new Set(state.visitDays || []);
  try {
    JSON.parse(localStorage.getItem(visitStoreKey()) || "[]").forEach((d) => days.add(d));
  } catch {}
  let cursor = new Date();
  let streak = 0;
  while (days.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function renderStreaks() {
  const wEl = document.getElementById("wellnessStreakNum");
  const cEl = document.getElementById("checkinStreakNum");
  if (wEl) wEl.textContent = computeWellnessStreak();
  if (cEl) cEl.textContent = computeCheckinStreak();
}

function exerciseDoneToday() {
  return (state.exerciseDoneDays || []).includes(todayKey());
}

function renderExercises() {
  const box = document.getElementById("exList");
  if (!box) return;
  const done = exerciseDoneToday();
  box.innerHTML = state.exercises
    .map(
      (ex) => `
      <div class="ex-row">
        <div class="ex-left">
          <span class="ex-ico">${ex.icon}</span>
          <span class="ex-name">${ex.name}</span>
        </div>
        <div class="ex-mid">
          <span class="ex-pct">${ex.pct}%</span>
          <div class="mini-track"><span style="--w:${ex.pct}%"></span></div>
          <span class="ex-time">${fmtMins(ex.minutes)}</span>
        </div>
        <div class="ex-right">
          <span class="ex-tag">${ex.tag}</span>
          <span class="chip">${done ? "done today" : "from Relax"}</span>
        </div>
      </div>`
    )
    .join("");
}

function sundayOf(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function apptWhenLabel(iso) {
  if (iso === todayKey()) return "Today";
  return fmtDay(iso);
}

let selectedDate = todayKey();

function dayHasItems(iso) {
  return (state.upcoming || []).some((a) => a.date === iso);
}

function renderDayInfo(iso) {
  const box = document.getElementById("dayInfo");
  if (!box) return;
  const d = new Date(iso + "T12:00:00");
  const title = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const appts = state.upcoming.filter((a) => a.date === iso);
  const check = [...state.checkins].reverse().find((c) => todayKey(new Date(c.at)) === iso);
  const score = state.emotions[iso];
  let html = `<h4>${title}</h4>`;
  if (score != null) html += `<p>Emotional score: <strong>${score}</strong></p>`;
  if (check) html += `<p>Check-in: ${check.mood}${check.text ? ` — ${check.text}` : ""}</p>`;
  if (appts.length) {
    html += "<ul>" + appts.map((a) => `<li>${a.time} · ${a.name} (${a.role})</li>`).join("") + "</ul>";
  } else {
    html += "<p>No consultations on this day.</p>";
  }
  box.innerHTML = html;
}

function monthTitle(sun) {
  const start = new Date(sun);
  const end = new Date(sun);
  end.setDate(end.getDate() + 6);
  const a = start.toLocaleDateString("en-GB", { month: "long" });
  const b = end.toLocaleDateString("en-GB", { month: "long" });
  const year = end.getFullYear();
  return a === b ? `${a} ${year}` : `${a} – ${b} ${year}`;
}

function setUpcomingMonth(weeks, snap) {
  const label = document.getElementById("upcomingMonth");
  if (!label || !snap || !weeks.length) return;
  const page = Math.round(snap.scrollLeft / Math.max(snap.clientWidth, 1));
  const sun = weeks[Math.min(weeks.length - 1, Math.max(0, page))];
  label.textContent = monthTitle(sun);
}

function renderUpcoming() {
  const snap = document.getElementById("weekSnap");
  if (!snap) return;
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentSun = sundayOf(new Date());
  const weeks = [];
  for (let w = -4; w <= 4; w++) {
    const sun = new Date(currentSun);
    sun.setDate(currentSun.getDate() + w * 7);
    weeks.push(sun);
  }
  const prevScroll = snap.scrollLeft;
  const hadPages = snap.querySelector(".week-page");
  snap.innerHTML = weeks
    .map((sun) => {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(sun);
        d.setDate(sun.getDate() + i);
        const iso = todayKey(d);
        const on = iso === selectedDate ? "on" : "";
        const has = dayHasItems(iso) ? "has-item" : "";
        days.push(
          `<button type="button" class="day ${on} ${has}" data-date="${iso}">${names[i]}<b>${d.getDate()}</b></button>`
        );
      }
      return `<div class="week-page">${days.join("")}</div>`;
    })
    .join("");

  const currentIndex = 4;
  const pageWidth = snap.clientWidth || snap.offsetWidth;
  snap.scrollLeft = hadPages ? prevScroll : pageWidth * currentIndex;
  setUpcomingMonth(weeks, snap);
  if (!snap.dataset.monthBound) {
    snap.dataset.monthBound = "1";
    snap.addEventListener("scroll", () => setUpcomingMonth(weeks, snap));
  }

  snap.querySelectorAll("[data-date]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedDate = btn.dataset.date;
      renderUpcoming();
    });
  });

  renderDayInfo(selectedDate);

  const dayAppts = state.upcoming.filter((a) => a.date === selectedDate);
  const list = dayAppts.length ? dayAppts : state.upcoming.slice(0, 4);
  document.getElementById("apptList").innerHTML = list
    .map((a) => {
      const i = state.upcoming.indexOf(a);
      return `
      <li class="appt">
        <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(a.seed)}&backgroundColor=${a.color}" alt="${a.name}" />
        <div><strong>${a.name}</strong><span>${a.role}</span></div>
        <div class="appt-when"><em>${a.time}</em><small>${apptWhenLabel(a.date)}</small>
          <span class="appt-tools">
            <button type="button" data-move="${i}">Postpone</button>
            <button type="button" data-cancel="${i}">Cancel</button>
          </span>
        </div>
      </li>`;
    })
    .join("");
  document.querySelectorAll("[data-cancel]").forEach((btn) => {
    btn.onclick = () => {
      const i = Number(btn.dataset.cancel);
      askSheet({
        title: "Cancel consultation",
        body: "Remove this visit from Upcoming?",
        ok: "Cancel visit",
        cancel: "Keep it"
      }).then((yes) => {
        if (!yes) return;
        state.upcoming.splice(i, 1);
        saveState();
        renderUpcoming();
      });
    };
  });
  document.querySelectorAll("[data-move]").forEach((btn) => {
    btn.onclick = () => {
      const i = Number(btn.dataset.move);
      const a = state.upcoming[i];
      openWhenPicker(a.date, a.time, (date, time) => {
        a.date = date;
        a.time = time;
        saveState();
        renderUpcoming();
      });
    };
  });
}

function noticeId(a) {
  return `appt-${a.date}-${a.time}-${a.name}`;
}

function activeNotices() {
  const cleared = new Set(state.clearedNoticeIds || []);
  const today = todayKey();
  const appts = (state.upcoming || [])
    .filter((a) => a.date && a.date >= today && !cleared.has(noticeId(a)))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const extra = (state.alerts || []).filter((n) => !cleared.has(n.id));
  return [...extra, ...appts];
}

function unreadCount() {
  const seen = new Set(state.seenNoticeIds || []);
  return activeNotices().filter((a) => !seen.has(noticeId(a))).length;
}

function paintBellDots() {
  const n = activeNotices().length;
  document.querySelectorAll('a[href="notifications.html"]').forEach((a) => {
    let dot = a.querySelector(".note-dot");
    if (n > 0) {
      if (!dot) {
        dot = document.createElement("span");
        dot.className = "note-dot";
        a.appendChild(dot);
      }
    } else if (dot) {
      dot.remove();
    }
  });
}

function markNoticesSeen() {
  const seen = new Set(state.seenNoticeIds || []);
  activeNotices().forEach((a) => seen.add(noticeId(a)));
  state.seenNoticeIds = [...seen];
  saveState();
  paintBellDots();
}

function clearNotices() {
  const cleared = new Set(state.clearedNoticeIds || []);
  activeNotices().forEach((a) => cleared.add(noticeId(a)));
  state.clearedNoticeIds = [...cleared];
  saveState();
  renderNotices();
  paintBellDots();
  toast("All notifications cleared");
}

function whenLine(iso) {
  if (iso === todayKey()) return "Today";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

function renderNotices() {
  const list = document.getElementById("noticeList");
  const empty = document.getElementById("noticeEmpty");
  const trash = document.getElementById("clearNotices");
  if (!list || !empty) return;
  const items = activeNotices();
  if (!items.length) {
    list.innerHTML = "";
    list.hidden = true;
    empty.hidden = false;
    if (trash) trash.hidden = true;
    return;
  }
  empty.hidden = true;
  list.hidden = false;
  if (trash) trash.hidden = false;
  list.innerHTML = items
    .map((a) => {
      if (a.kind === "alert") {
        return `<li class="notice-card">
          <span class="notice-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><path d="M12 16h.01"/></svg>
          </span>
          <div><strong>${a.title}</strong><p>${a.body}</p></div>
          <button type="button" class="trash-btn item-del" data-nid="${a.id}" aria-label="Delete notification">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
          </button>
        </li>`;
      }
      return `
      <li class="notice-card">
        <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(a.seed)}&backgroundColor=${a.color}" alt="" />
        <div>
          <strong>Upcoming session with ${a.name}</strong>
          <p>${a.role} · ${whenLine(a.date)} · ${a.time}</p>
        </div>
        <button type="button" class="trash-btn item-del" data-nid="${noticeId(a)}" aria-label="Delete notification">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
        </button>
      </li>`;
    })
    .join("");
  list.querySelectorAll("[data-nid]").forEach((btn) => {
    btn.addEventListener("click", () => askDelete(btn.dataset.nid));
  });
  markNoticesSeen();
}

function askDelete(id) {
  const wrap = document.createElement("div");
  wrap.className = "confirm-sheet";
  wrap.innerHTML = `
    <div class="confirm-card">
      <p>${id === "all" ? "Clear every notification?" : "Delete this notification?"}</p>
      <div class="confirm-row">
        <button type="button" class="confirm-cancel">Cancel</button>
        <button type="button" class="confirm-del">Delete</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  wrap.querySelector(".confirm-cancel").onclick = () => wrap.remove();
  wrap.querySelector(".confirm-del").onclick = () => {
    if (id === "all") clearNotices();
    else {
      const cleared = new Set(state.clearedNoticeIds || []);
      cleared.add(id);
      state.clearedNoticeIds = [...cleared];
      saveState();
      renderNotices();
      paintBellDots();
    }
    wrap.remove();
  };
}

const AVATARS = ["Luna", "Aria", "Nora", "Maya", "Elise", "Kai", "Owen", "Leo", "Arjun", "Noah"];
function avatarSrc(seed) {
  return "https://api.dicebear.com/7.x/adventurer/svg?seed=" + encodeURIComponent(seed || "Luna") + "&backgroundColor=c0aede";
}
function renderProfile() {
  const name = document.getElementById("profileName");
  if (!name) return;
  const p = state.profile || defaultState().profile;
  const localUser = accountUid ? localStorage.getItem("wl-username-" + accountUid) : "";
  name.textContent = p.fullName || p.username || p.name || localUser || "Your profile";
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || "Not set";
  };
  set("profileUser", p.username || localUser);
  set("profileCity", [p.country, p.state, p.city].filter(Boolean).join(", ") || p.address || "Not set");
  set("profileEmail", p.email);
  set("profilePersonal", p.personalPhone);
  set("profileFamily", p.familyPhone);
  set("profileFriend", p.friendPhone);
  const av = document.getElementById("profileAvatar");
  if (av) av.src = avatarSrc(p.avatar || "Luna");
  document.querySelectorAll(".avatar-sm").forEach((img) => {
    img.src = avatarSrc(p.avatar || "Luna");
  });
}

function nameFromUser(user) {
  const meta = (user && user.user_metadata) || {};
  const idd = (user && user.identities && user.identities[0] && user.identities[0].identity_data) || {};
  const raw = meta.full_name || meta.name || idd.full_name || idd.name || "";
  if (raw) return raw;
  const local = ((user && user.email) || "").split("@")[0].replace(/[0-9]+/g, " ").replace(/[._-]+/g, " ").trim();
  return local.replace(/\b\w/g, (c) => c.toUpperCase()) || "Member";
}

function paintAvatars() {
  const seed = (state.profile && state.profile.avatar) || "Luna";
  document.querySelectorAll(".avatar-sm, .profile-avatar").forEach((img) => {
    img.src = avatarSrc(seed);
  });
}

function whoScore() {
  if (DEMO_MODE) return 68;
  const days = Object.values(state.emotions || {}).filter((n) => Number.isFinite(n));
  if (!days.length && !(state.checkins || []).length && !(state.exerciseDoneDays || []).length) return 0;
  const recent = days.slice(-14);
  const avg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
  const done = (state.exercises || []).reduce((a, e) => a + (e.pct || 0), 0) / Math.max(1, (state.exercises || []).length);
  const notes = (state.journal || []).length;
  return Math.round(Math.max(0, Math.min(96, avg * 0.7 + done * 0.2 + Math.min(notes * 2, 12))));
}

function renderWho() {
  const el = document.getElementById("whoScore");
  if (!el) return;
  const n = whoScore();
  el.textContent = n;
  const fill = document.getElementById("whoFill");
  if (fill) fill.style.setProperty("--w", n + "%");
  const label = document.getElementById("whoLabel");
  let text = "Adequate wellbeing on the WHO-5 scale (0–100, higher is better).";
  if (n <= 28) text = "Very low wellbeing on the WHO-5 scale (0–100, higher is better). Please speak with a doctor. This is a screen, not a diagnosis.";
  else if (n <= 50) text = "Low wellbeing on the WHO-5 scale (0–100, higher is better). A doctor can look at this with you.";
  if (label) label.textContent = (DEMO_MODE ? "Demo sample. " : "") + text;
  const copy = document.getElementById("detectCopy");
  if (copy) {
    const lowMood = Object.values(state.emotions || {}).slice(-7).filter((v) => v < 45).length;
    const idle = (state.exercises || []).some((e) => (e.pct || 0) < 40);
    if (n <= 50 || lowMood >= 4 || idle) {
      copy.textContent = "Mood, unfinished exercises, or the WHO-5 score suggest extra support may help. My MindRay cannot diagnose illness. Use the clinician list if you want a private talk.";
      const id = "alert-who-" + todayKey();
      state.alerts = state.alerts || [];
      if (!state.alerts.some((x) => x.id === id)) {
        state.alerts.push({
          kind: "alert",
          id,
          title: "Early care signal",
          body: "WHO-5 or recent mood/tasks suggest a talk with a clinician may help. This is not a diagnosis."
        });
        saveState();
      }
    } else {
      copy.textContent = "No strong early-care signal from the last days of mood and tasks. Keep check-ins going.";
    }
  }
}

function renderJournal() {
  const list = document.getElementById("journalList");
  if (!list) return;
  const allRows = state.journal || [];
  const q = (document.getElementById("journalSearch")?.value || "").trim().toLowerCase();
  const rows = q
    ? allRows.filter((j) => (j.day || "").toLowerCase().includes(q) || (j.text || "").toLowerCase().includes(q))
    : allRows;
  list.innerHTML = rows.length
    ? rows.slice().reverse().map((j) => {
        const i = allRows.indexOf(j);
        return `<article class="note-card" data-i="${i}">
          <header><strong>${j.day}</strong>
            <span class="note-actions">
              <button type="button" class="edit-ico" data-edit-note="${i}" aria-label="Edit note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
              </button>
              <button type="button" class="edit-ico" data-del-note="${i}" aria-label="Delete note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              </button>
            </span>
          </header>
          <p>${(j.text || "").replace(/</g, "&lt;")}</p>
        </article>`;
      }).join("")
    : `<p class='stat-copy'>${q ? "No pages match that search." : "No pages yet. Write one above when you want a private record."}</p>`;
  list.querySelectorAll("[data-edit-note]").forEach((btn) => {
    btn.onclick = () => {
      const i = Number(btn.dataset.editNote);
      const note = state.journal[i];
      if (!note) return;
      openEditSheet("Edit this page", note.text, (val) => {
        if (!val) return;
        note.text = val;
        saveState();
        renderJournal();
      });
    };
  });
  list.querySelectorAll("[data-del-note]").forEach((btn) => {
    btn.onclick = () => {
      const i = Number(btn.dataset.delNote);
      if (!state.journal[i]) return;
      if (!confirm("Delete this journal page? This cannot be undone.")) return;
      state.journal.splice(i, 1);
      saveState();
      renderJournal();
      toast("Page deleted");
    };
  });
}

function paintGreeting() {
  const el = document.querySelector("h1.greeting");
  if (!el) return;
  const page = (location.pathname.split("/").pop() || "");
  if (page !== "dashboard.html" && page !== "demodashboard.html") return;
  if (DEMO_MODE) {
    el.textContent = "Hey, Amanda! Glad to have you back";
    return;
  }
  const n = (state.profile && (state.profile.username || state.profile.name || state.profile.fullName)) || "there";
  el.textContent = "Hey, " + n + "! Glad to have you back";
}

function renderLibraryFeed() {
  const box = document.getElementById("libraryFeed");
  if (!box) return;
  const logs = (state.activityLog || []).slice().reverse();
  const days = {};
  logs.forEach((row) => {
    days[row.day] = days[row.day] || [];
    days[row.day].push(row);
  });
  const keys = Object.keys(days).sort().reverse();
  if (!keys.length) {
    box.innerHTML = `<article class="card info-block"><h2>Today</h2><p>Nothing logged yet. A check-in, a Relax practice, or a source you mark done will appear here.</p>
      <h2>Quiet health notes</h2>
      <ul><li>Sleep and daylight both change mood the next day.</li><li>A short walk after sitting is often enough to lower body tension.</li><li>Talking to a friend is care, not a last resort.</li></ul></article>`;
    return;
  }
  box.innerHTML = keys.map((day) => {
    const title = day === todayKey() ? "Today" : day;
    const items = days[day].map((r) => `<li><strong>${r.kind}</strong> — ${(r.text || "").replace(/</g,"&lt;")}</li>`).join("");
    return `<article class="card info-block"><h2>${title}</h2><ul>${items}</ul></article>`;
  }).join("");
}

function renderAll() {
  paintAvatars();
  paintGreeting();
  renderWho();
  renderJournal();
  renderLibraryFeed();
  const insight = document.getElementById("aiInsight");
  if (insight) insight.textContent = state.insight;
  const emotionCopy = document.getElementById("emotionCopy");
  if (emotionCopy) {
    emotionCopy.textContent = state.checkins.length
      ? `WHO-5 Well-Being Index (0–100, higher is better). My MindRay AI mixed your last ${state.checkins.length} check-in${state.checkins.length > 1 ? "s" : ""} with exercise and session activity.`
      : "Based on the WHO-5 Well-Being Index (0–100 scale, higher is better), from check-ins, self-tests and sessions";
  }
  if (document.getElementById("progressNum")) renderStats();
  if (document.getElementById("bars")) renderBars();
  if (document.getElementById("exList")) renderExercises();
  if (document.getElementById("weekSnap")) renderUpcoming();
  renderStreaks();
  paintBellDots();
  renderNotices();
  renderProfile();
  maybeCareNudge();
}

function maybeCareNudge() {
  if (!document.getElementById("aiInsight") && !document.querySelector(".greeting")) return;
  const byDay = {};
  (state.checkins || []).forEach((c) => {
    const k = todayKey(new Date(c.at));
    byDay[k] = String(c.mood || c.label || "").toLowerCase();
  });
  const keys = Object.keys(byDay).sort();
  let streak = 0;
  for (let i = keys.length - 1; i >= 0; i--) {
    if (["low", "stressed", "needs-care"].includes(byDay[keys[i]])) streak += 1;
    else break;
  }
  const emotionDays = Object.keys(state.emotions || {}).filter((k) => Number.isFinite(Number(state.emotions[k]))).length;
  const lowWho = emotionDays >= 7 && typeof whoScore === "function" && whoScore() > 0 && whoScore() <= 50;
  if (streak < 3 && !lowWho) return;
  const flag = "wl-care-shown-" + todayKey();
  if (sessionStorage.getItem(flag)) return;
  sessionStorage.setItem(flag, "1");
  const family = (state.profile && state.profile.familyPhone) || (accountUid && localStorage.getItem("wl-familyphone-" + accountUid)) || "";
  const digits = String(family).replace(/\D/g, "");
  const text = encodeURIComponent("Hi. I have been feeling low for a few days and could use a check-in. This note was opened from My MindRay.");
  const wrap = document.createElement("div");
  wrap.className = "confirm-sheet";
  wrap.innerHTML = `<div class="confirm-card">
    <h3>Please talk to someone</h3>
    <p>${streak >= 3 ? "Your mood has been low or stressed for several days." : "Your WHO-5 wellbeing score is on the lower side (0–100 scale — higher is better)."} Please call or sit with a parent, a friend, or a doctor, and give your mind a quieter hour.</p>
    <p>This site cannot send a private text by itself. If you want, you can open WhatsApp with a ready note for your family number.</p>
    <div class="confirm-row">
      <button type="button" class="confirm-cancel">I will do this later</button>
      ${digits ? `<a class="confirm-del" href="https://wa.me/${digits}?text=${text}" target="_blank" rel="noopener">Open WhatsApp</a>` : `<a class="confirm-del" href="profile.html">Add a family number</a>`}
    </div>
  </div>`;
  document.body.appendChild(wrap);
  wrap.querySelector(".confirm-cancel").onclick = () => wrap.remove();
}

/* ---------- chrome ---------- */
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const openMenu = document.getElementById("openMenu");
function closeMenu() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}
openMenu?.addEventListener("click", () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
});
overlay.addEventListener("click", closeMenu);
document.querySelectorAll(".nav-orb[data-panel]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-orb[data-panel]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    closeMenu();
  });
});

document.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    chartRange = btn.dataset.range;
    renderBars();
  });
});

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

const copy = {
  help: {
    title: "Help & FAQ",
    html: `<p>My MindRay AI reads your check-in words and what you tap on the page. It then updates the graph, goals, sources, sessions, exercises, upcoming list and records.</p>
           <p>Everything is stored in <strong>this browser only</strong> (localStorage). No account and no hospital server.</p>`,
  },
  report: {
    title: "Report an issue",
    html: `<p>Let us know if something looks wrong using the Contact page. This demo does not send reports to a live clinic.</p>`,
  },
  privacy: {
    title: "Privacy Policy",
    html: `<p>Check-ins, scores and clicks stay on your device. Clearing site data erases the dashboard history.</p>
           <p>Do not type real medical secrets you would not want on a shared computer.</p>`,
  },
  terms: {
    title: "Terms of Use",
    html: `<p>My MindRay is a wellness dashboard for students. It is not a doctor and not an emergency service.</p>`,
  },
  about: {
    title: "About My MindRay",
    html: `<p>On-device My MindRay AI turns feelings + usage into live dashboard numbers so professors can see the loop: feel → log → cards move → saved.</p>`,
  },
  crisis: {
    title: "Urgent support",
    html: `<p>If you or someone near you is in immediate danger, contact local emergency services first.</p>
           <div class="hotline"><span>India — KIRAN mental health</span><a href="tel:18005990019">1800-599-0019</a></div>
           <div class="hotline"><span>iCall (TISS)</span><a href="tel:9152987821">9152987821</a></div>
           <p>My MindRay does not provide emergency care.</p>`,
  },
};

function checkinHTML() {
  return `
    <h2>Daily check-in</h2>
    <p>A quick daily read on how you're doing — this keeps the graph accurate and helps My MindRay AI notice patterns early.</p>
    <div class="mood-row" id="moodRow">
      ${["calm", "okay", "low", "stressed"]
        .map((m) => `<button type="button" class="mood-chip ${m === chosenMood ? "on" : ""}" data-mood="${m}">${m}</button>`)
        .join("")}
    </div>
    <p class="stat-copy" style="margin:10px 0 6px;">How did you sleep?</p>
    <div class="mood-row" id="sleepRow">
      ${["well", "okay", "poorly"]
        .map((s) => `<button type="button" class="mood-chip ${s === chosenSleep ? "on" : ""}" data-sleep="${s}">${s}</button>`)
        .join("")}
    </div>
    <p class="stat-copy" style="margin:10px 0 6px;">Energy today?</p>
    <div class="mood-row" id="energyRow">
      ${["high", "normal", "low"]
        .map((e) => `<button type="button" class="mood-chip ${e === chosenEnergy ? "on" : ""}" data-energy="${e}">${e}</button>`)
        .join("")}
    </div>
    <textarea class="ai-field" id="feelText" placeholder="I felt nervous before class, but a walk helped..."></textarea>
    <div class="ai-actions">
      <button class="ai-primary" id="saveCheckin">Save & update dashboard</button>
      ${DEMO_MODE ? '<button class="ai-ghost" id="resetDemo">Reset demo data</button>' : ""}
    </div>
  `;
}

function scheduleHTML() {
  return `
    <h2>Schedule a consultation</h2>
    <p>This booking stays on your dashboard so session counts move.</p>
    <div class="form-grid">
      <select class="ai-select" id="whoSel">
        ${clinicianOptions().map((t) => `<option>${t.name}</option>`).join("")}
      </select>
      <input class="ai-select" id="timeSel" type="time" value="16:00" />
      <input class="ai-select" id="daySel" type="date" />
    </div>
    <div class="ai-actions">
      <button class="ai-primary" id="confirmAppt">Add to Upcoming</button>
    </div>
  `;
}

function openModal(key) {
  if (key === "checkin") {
    modalBody.innerHTML = checkinHTML();
    modal.hidden = false;
    bindCheckin();
    return;
  }
  if (key === "schedule") {
    modalBody.innerHTML = scheduleHTML();
    modal.hidden = false;
    const daySel = document.getElementById("daySel");
    daySel.value = todayKey();
    document.getElementById("confirmAppt").onclick = () => {
      addAppointment(
        document.getElementById("whoSel").value,
        document.getElementById("timeSel").value,
        daySel.value
      );
      hideModal();
    };
    return;
  }
  const item = copy[key];
  if (!item) return;
  modalBody.innerHTML = `<h2>${item.title}</h2>${item.html}`;
  modal.hidden = false;
}
function hideModal() {
  modal.hidden = true;
}
function bindCheckin() {
  document.querySelectorAll("[data-mood]").forEach((chip) => {
    chip.onclick = () => {
      chosenMood = chip.dataset.mood;
      document.querySelectorAll("[data-mood]").forEach((c) => c.classList.toggle("on", c === chip));
    };
  });
  document.querySelectorAll("[data-sleep]").forEach((chip) => {
    chip.onclick = () => {
      chosenSleep = chip.dataset.sleep;
      document.querySelectorAll("[data-sleep]").forEach((c) => c.classList.toggle("on", c === chip));
    };
  });
  document.querySelectorAll("[data-energy]").forEach((chip) => {
    chip.onclick = () => {
      chosenEnergy = chip.dataset.energy;
      document.querySelectorAll("[data-energy]").forEach((c) => c.classList.toggle("on", c === chip));
    };
  });
  document.getElementById("saveCheckin").onclick = () => {
    applyCheckin(chosenMood, document.getElementById("feelText").value, chosenSleep, chosenEnergy);
    hideModal();
  };
  const reset = document.getElementById("resetDemo");
  if (reset) reset.onclick = () => {
    localStorage.removeItem(STORE_KEY);
    state = defaultState();
    saveState();
    renderAll();
    hideModal();
    toast("Demo reset");
  };
}

document.querySelectorAll("[data-open]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(el.dataset.open);
    closeMenu();
  });
});
document.getElementById("helpNow")?.addEventListener("click", () => openModal("crisis"));
document.getElementById("scheduleBtn")?.addEventListener("click", () => openModal("schedule"));
document.getElementById("clearNotices")?.addEventListener("click", () => askDelete("all"));
closeModal.addEventListener("click", hideModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) hideModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideModal();
});

const toastEl = document.createElement("div");
toastEl.className = "toast";
document.body.appendChild(toastEl);
let toastTimer;
function toast(msg, dur) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), dur || 2400);
}

/* ---------- Motivational lines (fetched, not hardcoded) ---------- */
const FALLBACK_QUOTES = [
  "Small steps still move you forward.",
  "You showed up today — that counts.",
  "Progress, not perfection.",
  "One calm breath at a time.",
  "Be proud of this moment.",
];
let lastQuote = "";
async function fetchMotivationalQuote() {
  const sources = [
    async () => {
      const r = await fetch("https://api.quotable.io/random?tags=motivational|inspirational|success");
      const d = await r.json();
      return d && d.content ? `${d.content} — ${d.author}` : null;
    },
    async () => {
      const r = await fetch("https://zenquotes.io/api/random");
      const d = await r.json();
      return d && d[0] && d[0].q ? `${d[0].q} — ${d[0].a}` : null;
    },
    async () => {
      const r = await fetch("https://api.adviceslip.com/advice");
      const d = await r.json();
      return d && d.slip && d.slip.advice ? d.slip.advice : null;
    },
  ];
  for (const src of sources) {
    try {
      const q = await src();
      if (q && q !== lastQuote) {
        lastQuote = q;
        return q;
      }
    } catch {}
  }
  let pick;
  do {
    pick = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  } while (pick === lastQuote && FALLBACK_QUOTES.length > 1);
  lastQuote = pick;
  return pick;
}

/* ---------- AI orb ping: a glowing ball flies from a button to the AI
   nav icon, the icon bumps, and a notification dot appears on it. Clicking
   the icon opens the AI desk, where the pending message is delivered. The
   pending state lives in sessionStorage only, so it resets whenever the
   site is closed or reopened. ---------- */
function pingAiOrb(originEl) {
  const target = document.querySelector(".ai-orb") || document.querySelector(".ai-check-btn");
  try { sessionStorage.setItem("wl-ai-note", "1"); } catch {}
  document.querySelectorAll(".ai-orb, .ai-check-btn").forEach((el) => el.classList.add("has-note"));
  if (!originEl || !target || typeof target.getBoundingClientRect !== "function") return;
  const originRect = originEl.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (!targetRect.width || !targetRect.height) return; // target not visible (e.g. desktop layout)
  const startX = originRect.left + originRect.width / 2;
  const startY = originRect.top + originRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;
  const ball = document.createElement("div");
  ball.className = "ai-glow-ball";
  ball.style.transform = `translate(${startX}px, ${startY}px) translate(-50%,-50%)`;
  document.body.appendChild(ball);
  const midX = (startX + endX) / 2;
  const midY = Math.min(startY, endY) - 110;
  let anim;
  try {
    anim = ball.animate(
      [
        { transform: `translate(${startX}px, ${startY}px) translate(-50%,-50%) scale(1)`, opacity: 1, offset: 0 },
        { transform: `translate(${midX}px, ${midY}px) translate(-50%,-50%) scale(1.2)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${endX}px, ${endY}px) translate(-50%,-50%) scale(.25)`, opacity: .3, offset: 1 }
      ],
      { duration: 800, easing: "cubic-bezier(.3,.75,.35,1)" }
    );
  } catch {
    anim = null;
  }
  const finish = () => {
    ball.remove();
    target.classList.add("ai-orb-bump");
    setTimeout(() => target.classList.remove("ai-orb-bump"), 650);
  };
  if (anim) anim.onfinish = finish;
  else setTimeout(finish, 800);
}
(function initAiNote() {
  try {
    if (sessionStorage.getItem("wl-ai-note") === "1") {
      document.querySelectorAll(".ai-orb, .ai-check-btn").forEach((el) => el.classList.add("has-note"));
    }
  } catch {}
})();

/* ---------- "Exercise done" (relax page) ---------- */
function paintExerciseDoneBtn() {
  const btn = document.getElementById("exerciseDoneBtn");
  if (!btn) return;
  if (exerciseDoneToday()) {
    btn.disabled = true;
    btn.textContent = "Exercises done for today";
  } else {
    btn.disabled = false;
    btn.textContent = "Mark exercise done";
  }
}

async function markRelaxExerciseDone(btn) {
  if (exerciseDoneToday()) {
    paintExerciseDoneBtn();
    return;
  }
  const yes = await askSheet({
    title: "Mark practice done?",
    body: "Confirm only if you finished today's Relax practice. This updates progress, the graph, and the AI desk.",
    ok: "Yes, I finished",
    cancel: "Not yet"
  });
  if (!yes) return;
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Logging…";
  }
  state.goals += 1;
  const prev = Number(state.emotions[todayKey()]);
  state.emotions[todayKey()] = clamp((Number.isFinite(prev) ? prev : 50) + 5, 0, 98);
  (state.exercises || []).forEach((ex) => {
    ex.logs += 1;
    ex.minutes += 8;
    ex.pct = clamp((ex.pct || 0) + 6, 0, 100);
  });
  state.exerciseDoneDays = state.exerciseDoneDays || [];
  if (!state.exerciseDoneDays.includes(todayKey())) state.exerciseDoneDays.push(todayKey());
  logActivity("exercise", "Relax practice marked done");
  saveState();
  renderAll();

  const quote = await fetchMotivationalQuote();
  state.insight = `Exercise done! Your progress and today's emotional score were updated. "${quote}"`;
  saveState();
  const insightEl = document.getElementById("aiInsight");
  if (insightEl) insightEl.textContent = state.insight;

  try { sessionStorage.setItem("wl-ai-exercise-quote", quote); } catch {}
  pingAiOrb(btn);
  paintExerciseDoneBtn();
}
document.getElementById("exerciseDoneBtn")?.addEventListener("click", (e) => markRelaxExerciseDone(e.currentTarget));
paintExerciseDoneBtn();

document.querySelectorAll(".sidebar-nav .nav-orb").forEach((a) => {
  const href = (a.getAttribute("href") || "").split("/").pop();
  const here = location.pathname.split("/").pop();
  if (href && (here === href || (here === "demodashboard.html" && href === "dashboard.html"))) a.classList.add("active");
  else a.classList.remove("active");
});

renderAll();

function maybeDailyCheckin() {
  if (!document.getElementById("wellnessStreak")) return;
  const hasCheckinToday = (state.checkins || []).some((c) => todayKey(new Date(c.at)) === todayKey());
  if (hasCheckinToday) return;
  chosenMood = "okay";
  chosenSleep = "";
  chosenEnergy = "";
  setTimeout(() => openModal("checkin"), 700);
}

(async function bootAccount() {
  if (DEMO_MODE || typeof createSb !== "function") {
    recordVisitToday();
    paintAvatars();
    paintGreeting();
    renderStreaks();
    maybeDailyCheckin();
    return;
  }
  const client = createSb();
  if (!client) return;
  const session = await currentSession(client);
  if (!session) {
    accountUid = null;
    state = emptyLiveState();
    paintAvatars();
    renderAll();
    return;
  }
  accountUid = session.user.id;
  try {
    const raw = localStorage.getItem(liveKey(accountUid));
    if (raw) state = sanitizeLive({ ...emptyLiveState(), ...JSON.parse(raw) });
  } catch {}
  const { data } = await client.from("user_state").select("data").eq("id", accountUid).maybeSingle();
  if (data && data.data) {
    state = sanitizeLive({ ...emptyLiveState(), ...data.data });
    if (data.data.emotions && Object.keys(data.data.emotions).length) state.emotions = fillEmotionDays(data.data.emotions);
    localStorage.setItem(liveKey(accountUid), JSON.stringify(state));
  }
  state.profile = state.profile || defaultState().profile;
  state.profile.email = session.user.email || state.profile.email;
  const savedName = localStorage.getItem("wl-username-" + accountUid);
  if (savedName) state.profile.username = savedName;
  try {
    const { data: prof } = await client.from("profiles").select("username,email,personal_phone,family_phone,friend_phone").eq("id", accountUid).maybeSingle();
    if (prof) {
      if (prof.username) state.profile.username = prof.username;
      if (prof.email) state.profile.email = prof.email;
      if (prof.personal_phone) state.profile.personalPhone = prof.personal_phone;
      if (prof.family_phone) state.profile.familyPhone = prof.family_phone;
      if (prof.friend_phone) state.profile.friendPhone = prof.friend_phone;
    }
  } catch {}
  if (!state.profile.nameLocked) {
    state.profile.fullName = nameFromUser(session.user);
    state.profile.name = state.profile.fullName;
  }
  // Anchor the Emotional State graph to the real account start date (from
  // Supabase auth), so history never starts later than when this account
  // actually began, and it's saved for lifetime in the user_state row.
  const authCreated = session.user.created_at ? todayKey(new Date(session.user.created_at)) : "";
  if (authCreated && (!state.profile.joinedAt || authCreated < state.profile.joinedAt)) {
    state.profile.joinedAt = authCreated;
  }
  ensureJoinDate();
  recordVisitToday();
  saveState();
  renderAll();
  maybeDailyCheckin();
})();


window.onThemeChange = function (mode) {
  state.theme = mode;
  if (!state.profile) state.profile = defaultState().profile;
  state.profile.theme = mode;
  saveState();
};
const themeToggle = document.getElementById("themeToggle");
if (themeToggle && window.setWellTheme) {
  themeToggle.checked = document.documentElement.classList.contains("light");
  themeToggle.addEventListener("change", () => {
    window.setWellTheme(themeToggle.checked ? "light" : "dark");
  });
}

function askSheet({ title, body, ok = "Confirm", cancel = "Cancel" }) {
  return new Promise((resolve) => {
    const wrap = document.createElement("div");
    wrap.className = "confirm-sheet";
    wrap.innerHTML = `<div class="confirm-card"><h3>${title || ""}</h3><p>${body || ""}</p><div class="confirm-row"><button type="button" class="confirm-cancel">${cancel}</button><button type="button" class="confirm-del">${ok}</button></div></div>`;
    document.body.appendChild(wrap);
    wrap.querySelector(".confirm-cancel").onclick = () => { wrap.remove(); resolve(false); };
    wrap.querySelector(".confirm-del").onclick = () => { wrap.remove(); resolve(true); };
  });
}

function openWhenPicker(startDate, startTime, onSet) {
  const modalEl = document.getElementById("modal");
  const body = document.getElementById("modalBody");
  if (!modalEl || !body) return;
  const timeVal = startTime || "16:00";
  const dayVal = startDate || todayKey();
  body.innerHTML = `
    <h2>Postpone consultation</h2>
    <p>Pick a new time and date the same way you schedule a visit.</p>
    <div class="form-grid">
      <input class="ai-select" id="moveTime" type="time" value="${timeVal}" />
      <input class="ai-select" id="moveDay" type="date" value="${dayVal}" />
    </div>
    <div class="ai-actions">
      <button type="button" class="ai-ghost" id="moveCancel">Cancel</button>
      <button type="button" class="ai-primary" id="moveSet">Save new time</button>
    </div>`;
  modalEl.hidden = false;
  document.getElementById("moveCancel").onclick = hideModal;
  document.getElementById("moveSet").onclick = () => {
    const time = document.getElementById("moveTime").value || timeVal;
    const day = document.getElementById("moveDay").value || dayVal;
    hideModal();
    onSet(day, time);
  };
}

function openEditSheet(title, value, onSave) {
  const wrap = document.createElement("div");
  wrap.className = "edit-sheet";
  wrap.innerHTML = `<form class="edit-card"><h3>${title}</h3><input id="editVal" value="${(value || "").replace(/"/g, "&quot;")}" /><div class="confirm-row"><button type="button" class="confirm-cancel">Cancel</button><button type="submit" class="confirm-del" style="background:#B8501B">Save</button></div></form>`;
  document.body.appendChild(wrap);
  wrap.querySelector(".confirm-cancel").onclick = () => wrap.remove();
  wrap.querySelector("form").onsubmit = (e) => {
    e.preventDefault();
    onSave(wrap.querySelector("#editVal").value.trim());
    wrap.remove();
  };
}
document.getElementById("journalSearch")?.addEventListener("input", () => renderJournal());

document.getElementById("saveJournal")?.addEventListener("click", () => {
  const box = document.getElementById("journalText");
  const text = (box && box.value.trim()) || "";
  if (!text) return;
  state.journal = state.journal || [];
  state.journal.push({ day: new Date().toLocaleDateString("en-GB"), text });
  saveState();
  if (box) box.value = "";
  renderJournal();
});
document.getElementById("editName")?.addEventListener("click", () => {
  openEditSheet("Change name", state.profile.fullName || state.profile.name || "", (val) => {
    if (!val) return;
    state.profile.fullName = val;
    state.profile.name = val;
    state.profile.nameLocked = true;
    saveState();
    renderProfile();
  });
});
document.getElementById("editUser")?.addEventListener("click", () => {
  openEditSheet("Change username", state.profile.username || "", (val) => {
    if (!val) return;
    state.profile.username = val;
    if (accountUid) localStorage.setItem("wl-username-" + accountUid, val);
    saveState();
    renderProfile();
  });
});
function phoneClash(next, skip) {
  const p = state.profile || {};
  const map = {
    personalPhone: p.personalPhone,
    familyPhone: p.familyPhone,
    friendPhone: p.friendPhone
  };
  map[skip] = next;
  const nums = Object.values(map).map((n) => (typeof normalizePhone === "function" ? normalizePhone(n) : String(n || "").replace(/\D/g, ""))).filter(Boolean);
  return new Set(nums).size !== nums.length;
}
function editPhone(field, label) {
  openEditSheet(label, (state.profile && state.profile[field]) || "", (val) => {
    const err = typeof validPhone === "function" ? validPhone(val, label, field !== "friendPhone") : "";
    if (err) { toast(err); return; }
    if (val && phoneClash(val, field)) { toast("Use a different number in each field."); return; }
    state.profile[field] = val;
    saveState();
    renderProfile();
  });
}
document.getElementById("editPersonal")?.addEventListener("click", () => editPhone("personalPhone", "Your phone number"));
document.getElementById("editFamily")?.addEventListener("click", () => editPhone("familyPhone", "Family member's number"));
document.getElementById("editFriend")?.addEventListener("click", () => editPhone("friendPhone", "Friend or warden number"));
document.getElementById("editAddr")?.addEventListener("click", () => {
  const wrap = document.createElement("div");
  wrap.className = "confirm-sheet";
  const p = state.profile || {};
  const places = (typeof PLACES !== "undefined" && PLACES) ? PLACES : { India: ["Assam","Punjab","Delhi"], Japan: ["Hokkaido","Tokyo","Osaka"] };
  const countries = Object.keys(places);
  const countryNow = countries.includes(p.country) ? p.country : (countries[0] || "");
  const states0 = places[countryNow] || [];
  const stateNow = states0.includes(p.state) ? p.state : (states0[0] || "");
  const opt = (arr, sel) => arr.map((n) => `<option value="${n}" ${n===sel?"selected":""}>${n}</option>`).join("");
  wrap.innerHTML = `<div class="confirm-card"><h3>Address</h3>
    <div class="form-grid">
      <label>Country<select class="ai-select" id="addrCountry">${opt(countries, countryNow)}</select></label>
      <label>State<select class="ai-select" id="addrState">${opt(states0, stateNow)}</select></label>
      <label>City<input class="ai-select" id="addrCity" value="${(p.city||"").replace(/"/g,"")}" placeholder="City" /></label>
    </div>
    <div class="confirm-row"><button type="button" class="confirm-cancel">Cancel</button><button type="button" class="confirm-del">Save</button></div></div>`;
  document.body.appendChild(wrap);
  const countryEl = document.getElementById("addrCountry");
  const stateEl = document.getElementById("addrState");
  countryEl.onchange = () => {
    const list = places[countryEl.value] || [];
    stateEl.innerHTML = opt(list, list[0] || "");
  };
  wrap.querySelector(".confirm-cancel").onclick = () => wrap.remove();
  wrap.querySelector(".confirm-del").onclick = () => {
    state.profile.country = countryEl.value;
    state.profile.state = stateEl.value;
    state.profile.city = document.getElementById("addrCity").value.trim();
    state.profile.address = [state.profile.country, state.profile.state, state.profile.city].filter(Boolean).join(", ");
    saveState();
    renderProfile();
    wrap.remove();
  };
});
document.getElementById("editAvatar")?.addEventListener("click", () => {
  const wrap = document.createElement("div");
  wrap.className = "edit-sheet";
  wrap.innerHTML = `<div class="edit-card"><h3>Choose a photo</h3><div class="avatar-grid">${AVATARS.map((s) => `<button type="button" data-seed="${s}" class="${(state.profile.avatar||"Luna")===s?"on":""}"><img src="${avatarSrc(s)}" alt="${s}"></button>`).join("")}</div><div class="confirm-row"><button type="button" class="confirm-cancel">Close</button></div></div>`;
  document.body.appendChild(wrap);
  wrap.querySelector(".confirm-cancel").onclick = () => wrap.remove();
  wrap.querySelectorAll("[data-seed]").forEach((btn) => {
    btn.onclick = () => {
      state.profile.avatar = btn.dataset.seed;
      saveState();
      renderProfile();
      wrap.remove();
    };
  });
});
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  const wrap = document.createElement("div");
  wrap.className = "confirm-logout";
  wrap.innerHTML = `<div class="box"><p>Log out of this account?</p><div class="row"><button type="button" class="no">Cancel</button><button type="button" class="go">Log out</button></div></div>`;
  document.body.appendChild(wrap);
  wrap.querySelector(".no").onclick = () => wrap.remove();
  wrap.querySelector(".go").onclick = async () => {
    if (typeof createSb === "function") {
      const client = createSb();
      await client?.auth.signOut();
    }
    accountUid = null;
    sessionStorage.removeItem("wl-mode");
    localStorage.setItem(STORE_KEY, JSON.stringify(defaultState()));
    location.href = "index.html";
  };
});
