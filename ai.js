const dash = document.getElementById("aiDash");
if (dash) dash.href = sessionStorage.getItem("wl-mode") === "demo" ? "demodashboard.html" : "dashboard.html";

const chat = document.getElementById("chat");
const thumbs = document.getElementById("thumbs");
const pending = [];
let stream = null;
const DEMO_KEY = "wellledger-state-v2";

function add(role, text, images) {
  const el = document.createElement("div");
  el.className = "bubble " + role;
  if (images && images.length) {
    const wrap = document.createElement("div");
    wrap.className = "pics";
    images.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      wrap.appendChild(img);
    });
    el.appendChild(wrap);
  }
  if (text) {
    const p = document.createElement("div");
    p.className = "txt";
    if (role === "bot" && text.indexOf("<a ") !== -1) p.innerHTML = text;
    else p.textContent = text;
    el.appendChild(p);
  }
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
  persistChat();
}
function addBot(text) {
  const el = document.createElement("div");
  el.className = "bubble bot is-typing";
  el.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
  setTimeout(() => {
    el.classList.remove("is-typing");
    el.innerHTML = '<div class="txt"></div>';
    const p = el.querySelector(".txt");
    const plain = String(text).replace(/<[^>]+>/g, "");
    let i = 0;
    const tick = () => {
      i += 1;
      p.textContent = plain.slice(0, i);
      chat.scrollTop = chat.scrollHeight;
      if (i < plain.length) setTimeout(tick, 14);
      else {
        if (String(text).indexOf("<a ") !== -1) p.innerHTML = text;
        persistChat();
      }
    };
    tick();
  }, 720);
}
function persistChat() {
  const items = [...chat.querySelectorAll(".bubble")].filter((el) => !el.classList.contains("is-typing")).map((el) => ({
    role: el.classList.contains("me") ? "me" : "bot",
    html: el.querySelector(".txt") ? el.querySelector(".txt").innerHTML : (el.textContent || "").trim(),
    images: [...el.querySelectorAll(".pics img")].map((img) => img.src).slice(0, 3)
  })).filter((it) => it.html || (it.images && it.images.length));
  try { sessionStorage.setItem("wl-ai-chat", JSON.stringify(items)); } catch {}
}
function restoreChat() {
  try {
    const items = JSON.parse(sessionStorage.getItem("wl-ai-chat") || "[]");
    if (!items.length) return;
    chat.innerHTML = "";
    items.forEach((it) => {
      const el = document.createElement("div");
      el.className = "bubble " + it.role;
      if (it.images && it.images.length) {
        const wrap = document.createElement("div");
        wrap.className = "pics";
        it.images.forEach((src) => {
          const img = document.createElement("img");
          img.src = src;
          wrap.appendChild(img);
        });
        el.appendChild(wrap);
      }
      if (it.html && String(it.html).trim()) {
        const p = document.createElement("div");
        p.className = "txt";
        if (it.role === "bot") p.innerHTML = it.html;
        else p.textContent = it.html.replace(/<[^>]+>/g, "");
        el.appendChild(p);
      } else if (!it.images || !it.images.length) {
        return;
      }
      chat.appendChild(el);
    });
    chat.scrollTop = chat.scrollHeight;
  } catch {}
}
function collectHistory() {
  return [...chat.querySelectorAll(".bubble")]
    .filter((el) => !el.classList.contains("is-typing"))
    .slice(-12)
    .map((el) => ({
      role: el.classList.contains("me") ? "user" : "model",
      text: (el.querySelector(".txt") ? el.querySelector(".txt").textContent : "").trim()
    }))
    .filter((turn) => turn.text);
}
async function sendToAI(text, images) {
  const history = collectHistory();
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, images: images || [], history })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "AI request failed");
    addBot(data.reply || "I'm here with you. Could you tell me a little more?");
  } catch {
    addBot("I couldn't reach the AI just now. Please try again in a moment.");
  }
}
function renderThumbs() {
  thumbs.innerHTML = pending.map((src) => '<img src="' + src + '" alt="">').join("");
}
function addImage(src) {
  if (pending.length >= 3) { add("bot", "You can attach up to 3 photos at once."); return; }
  pending.push(src);
  syncSend();
  renderThumbs();
}
function todayKey() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}
async function saveMood(mood) {
  const scores = { calm: 78, okay: 62, good: 80, low: 36, stressed: 30 };
  const score = scores[mood] || 60;
  let raw = {};
  try {
    const live = Object.keys(localStorage).find((k) => k.startsWith("wellledger-live-"));
    raw = JSON.parse(localStorage.getItem(live || DEMO_KEY) || "{}") || {};
  } catch { raw = {}; }
  raw.emotions = raw.emotions || {};
  raw.emotions[todayKey()] = score;
  raw.checkins = raw.checkins || [];
  raw.checkins.push({ at: Date.now(), mood, text: "Saved from AI desk", score, label: mood });
  raw.lastMood = mood;
  localStorage.setItem("wl-last-mood", mood);
  raw.insight = "Mood from the AI desk was saved to your graph.";
  localStorage.setItem(DEMO_KEY, JSON.stringify(raw));
  if (typeof createSb === "function") {
    const sb = createSb();
    const session = sb ? await currentSession(sb) : null;
    if (session) {
      const uid = session.user.id;
      const liveKey = "wellledger-live-" + uid;
      localStorage.setItem(liveKey, JSON.stringify(raw));
      await sb.from("user_state").upsert({ id: uid, data: raw, updated_at: new Date().toISOString() });
    }
  }
}

function syncSend() {
  const send = document.querySelector(".send");
  const box = document.getElementById("prompt");
  const on = !!(box.value.trim() || pending.length);
  if (send) {
    send.disabled = !on;
    send.classList.toggle("on", on);
  }
}
document.getElementById("prompt").addEventListener("input", syncSend);
document.getElementById("composer").addEventListener("submit", (e) => {
  e.preventDefault();
  const box = document.getElementById("prompt");
  const text = box.value.trim();
  if (!text && !pending.length) return;
  const images = pending.splice(0, pending.length);
  add("me", text || "", images);
  renderThumbs();
  box.value = "";
  syncSend();
  sendToAI(text, images);
});
syncSend();
restoreChat();

/* ---------- Pending "exercise done" ping from the Relax page ---------- */
(function consumeExercisePing() {
  let quote = null;
  try { quote = sessionStorage.getItem("wl-ai-exercise-quote"); } catch {}
  if (!quote) return;
  try {
    sessionStorage.removeItem("wl-ai-exercise-quote");
    sessionStorage.removeItem("wl-ai-note");
  } catch {}
  add("me", "I finished today's exercise! 🎉");
  addBot(`Amazing work showing up for yourself today! 🎉💪 "${quote}" 🌿✨`);
})();

document.querySelectorAll("[data-mood]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const mood = btn.dataset.mood;
    add("me", "Mood: " + mood);
    await saveMood(mood);
    const note = mood === "stressed" || mood === "low"
      ? 'Saved. A calmer exercise video is ready on the Relax page. You can check it on <a href="relax.html">Relax</a>.'
      : 'The video on the Relax page has been changed to match this mood. You can see it by opening <a href="relax.html">Relax</a>.';
    addBot(note);
  });
});
/* "+" attach menu: Camera / Photos */
const plusBtn = document.getElementById("plusBtn");
const attachMenu = document.getElementById("attachMenu");
function setAttachMenu(open) {
  attachMenu.classList.toggle("open", open);
  plusBtn.classList.toggle("open", open);
  plusBtn.setAttribute("aria-expanded", open ? "true" : "false");
}
plusBtn.addEventListener("click", (e) => { e.stopPropagation(); setAttachMenu(!attachMenu.classList.contains("open")); });
document.addEventListener("click", (e) => { if (!attachMenu.contains(e.target)) setAttachMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setAttachMenu(false); });
document.getElementById("galBtn").onclick = () => { document.getElementById("gallery").click(); setAttachMenu(false); };
document.getElementById("gallery").onchange = (e) => {
  const files = [...e.target.files].slice(0, 3 - pending.length);
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => addImage(reader.result);
    reader.readAsDataURL(file);
  });
  e.target.value = "";
};
const sheet = document.getElementById("camSheet");
const video = document.getElementById("camLive");
async function openCam() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    video.srcObject = stream;
    sheet.hidden = false;
  } catch {
    add("bot", "Camera permission was not given. Use the gallery instead.");
  }
}
function closeCam() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  sheet.hidden = true;
}
document.getElementById("camBtn").onclick = () => { setAttachMenu(false); openCam(); };
document.getElementById("closeCam").onclick = closeCam;
document.getElementById("shutter").onclick = () => {
  const canvas = document.getElementById("camCanvas");
  canvas.width = video.videoWidth || 720;
  canvas.height = video.videoHeight || 960;
  canvas.getContext("2d").drawImage(video, 0, 0);
  addImage(canvas.toDataURL("image/jpeg", 0.85));
  closeCam();
};
