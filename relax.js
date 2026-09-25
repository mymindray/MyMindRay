const POOL = [
  { id: "v7AYKMP6rOE", title: "Beginner home practice" },
  { id: "pWobp3phsEU", title: "Slow basics" },
  { id: "vNyJuQuuMC8", title: "Twenty-minute flow" },
  { id: "GnHTeHAZQhM", title: "Gentle morning reset" },
  { id: "AB3Y-4a3ZrU", title: "Longer beginner flow" },
  { id: "hoGJXCg5yb0", title: "Ease and unclench" },
  { id: "4TLHLNX65-4", title: "Intro to flow" }
];
const MOOD_SHIFT = { stressed: 5, low: 3, okay: 0, calm: 1, good: 2 };
function pickVideo(mood) {
  const day = new Date().getDay();
  const shift = MOOD_SHIFT[mood] || 0;
  return POOL[(day + shift) % POOL.length];
}

function readMood() {
  try {
    const direct = localStorage.getItem("wl-last-mood");
    if (direct) return direct;
    const live = Object.keys(localStorage).find((k) => k.startsWith("wellledger-live-"));
    const raw = JSON.parse(localStorage.getItem(live || "wellledger-state-v2") || "{}") || {};
    return raw.lastMood || "";
  } catch {
    return "";
  }
}

const mood = readMood();
const pick = pickVideo(mood);
const title = document.getElementById("yogaToday");
const frame = document.getElementById("yogaFrame");
if (title) {
  title.textContent = mood
    ? pick.title + " · " + mood + " · today"
    : pick.title + " · today's stretch";
}
if (frame) frame.src = "https://www.youtube.com/embed/" + pick.id + "?rel=0&modestbranding=1&playsinline=1&fs=1";

/* ---------- Calm games: mounted directly on the page (no iframes), mood-based pick ---------- */
const GAMES = {
  ripple: { name: "Ripple Calm" },
  garden: { name: "Zen Garden" },
  bubble: { name: "Bubble Float" },
  pebble: { name: "Pebble Stack" },
  soundscape: { name: "Soundscape" },
};
const GAME_FOR_MOOD = {
  stressed: "ripple",
  low: "garden",
  okay: "bubble",
  calm: "garden",
  good: "pebble",
  great: "bubble",
};

function posIn(container, e) {
  const r = container.getBoundingClientRect();
  const p = e.touches ? e.touches[0] : e;
  return { x: p.clientX - r.left, y: p.clientY - r.top };
}

/* Speaker icons (SVG, no emoji): open = sound on, muted = sound off */
const SPEAKER_ON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.8 5.2a9.6 9.6 0 0 1 0 13.6"/></svg>';
const SPEAKER_OFF = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>';

/* ---- Ripple Calm: touch the water, gentle rings + soft tones ---- */
function mountRipple(container) {
  container.style.background = "radial-gradient(ellipse at 50% 30%, #123a49, #0c2530 75%)";
  const canvas = document.createElement("canvas");
  const ui = document.createElement("div");
  ui.className = "g-ui";
  ui.innerHTML = `<div class="g-top"><div class="g-title">Ripple Calm</div><div class="g-hint" id="rHint">Touch the water, breathe slow</div></div><button class="g-sound" id="rSound" aria-label="Sound on" title="Sound on">${SPEAKER_ON}</button>`;
  container.append(canvas, ui);

  const ctx = canvas.getContext("2d");
  let W, H, DPR, raf;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const r = container.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const ripples = [];
  function addRipple(x, y, strength) {
    ripples.push({ x, y, r: 2, maxR: 60 + Math.random() * 70 * (strength || 1), alpha: 0.55, speed: 1 + Math.random() * 0.5 });
    if (ripples.length > 50) ripples.shift();
  }
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) {
      const gx = (W * 0.15) + (i * W * 0.12) % W;
      const gy = H * 0.5 + Math.sin(t * 0.0004 + i) * H * 0.28;
      ctx.fillStyle = `rgba(191,238,240,${0.03 + 0.02 * Math.sin(t * 0.0008 + i * 2)})`;
      ctx.beginPath(); ctx.arc(gx, gy, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += rp.speed; rp.alpha *= 0.982;
      if (rp.r > rp.maxR || rp.alpha < 0.01) { ripples.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(189,238,240,${rp.alpha})`; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r * 0.62, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(111,201,201,${rp.alpha * 0.5})`; ctx.lineWidth = 1; ctx.stroke();
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  let dragging = false, lastAdd = 0;
  const hint = ui.querySelector("#rHint");
  function onDown(e) { dragging = true; const p = posIn(container, e); addRipple(p.x, p.y, 1.3); playTone(); if (hint) hint.style.opacity = "0"; }
  function onMove(e) {
    if (!dragging) return;
    const now = performance.now();
    if (now - lastAdd < 90) return;
    lastAdd = now;
    const p = posIn(container, e); addRipple(p.x, p.y, 0.8); playTone(true);
  }
  function onUp() { dragging = false; }
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);

  let audioCtx = null, soundOn = true;
  const soundBtn = ui.querySelector("#rSound");
  const notes = [392, 440, 523.25, 587.33, 659.25];
  function ensureAudio() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { audioCtx = null; } } }
  function playTone(soft) {
    if (!soundOn) return;
    ensureAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();
    const freq = notes[Math.floor(Math.random() * notes.length)];
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = "sine"; osc.frequency.value = freq;
    const now = audioCtx.currentTime, peak = soft ? 0.05 : 0.09;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 1.7);
  }
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundBtn.innerHTML = soundOn ? SPEAKER_ON : SPEAKER_OFF;
    soundBtn.setAttribute("aria-label", soundOn ? "Sound on" : "Sound off"); soundBtn.title = soundOn ? "Sound on" : "Sound off";
    if (soundOn) { ensureAudio(); if (audioCtx && audioCtx.state === "suspended") audioCtx.resume(); }
  });
  const idleTimer = setInterval(() => {
    if (ripples.length < 4 && !dragging) addRipple(W * (0.3 + Math.random() * 0.4), H * (0.3 + Math.random() * 0.4), 0.6);
  }, 4500);

  return function cleanup() {
    cancelAnimationFrame(raf);
    clearInterval(idleTimer);
    ro.disconnect();
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
    try { audioCtx && audioCtx.close(); } catch {}
    container.style.background = "";
  };
}

/* ---- Zen Garden: rake sand, place stones, let leaves fall ---- */
function mountGarden(container) {
  container.style.background = "#D8C9A8";
  const gcanvas = document.createElement("canvas");
  const ocanvas = document.createElement("canvas");
  const ui = document.createElement("div");
  ui.className = "g-ui";
  ui.innerHTML = `<div class="g-top g-top-dark"><div class="g-title">Zen Garden</div><div class="g-hint" id="gHint">Rake the sand, place stones, let leaves fall</div></div>
    <button class="g-sound g-sound-dark" id="gSound" aria-label="Sound on" title="Sound on">${SPEAKER_ON}</button>
    <div class="g-toolbar">
      <button type="button" class="g-mode active" data-mode="rake">🖌 Rake</button>
      <button type="button" class="g-mode" data-mode="stone">🪨 Stone</button>
      <button type="button" class="g-mode" data-mode="leaf">🍂 Leaf</button>
      <span class="g-sep"></span>
      <button type="button" class="g-mode g-smooth" id="gSmooth">Smooth</button>
    </div>`;
  container.append(gcanvas, ocanvas, ui);

  const gctx = gcanvas.getContext("2d");
  const octx = ocanvas.getContext("2d");
  const hintEl = ui.querySelector("#gHint");
  const smoothBtn = ui.querySelector("#gSmooth");
  const soundBtn = ui.querySelector("#gSound");
  const modeBtns = ui.querySelectorAll(".g-mode[data-mode]");

  let W, H, DPR, raf, alive = true;
  function sizeCanvas(c, cx) {
    c.width = W * DPR; c.height = H * DPR;
    c.style.width = W + "px"; c.style.height = H + "px";
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function initSand() {
    const g = gctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#EAE0C8"); g.addColorStop(1, "#D6C6A0");
    gctx.fillStyle = g; gctx.fillRect(0, 0, W, H);
    const grains = Math.min(2600, (W * H) / 650);
    for (let i = 0; i < grains; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      gctx.fillStyle = Math.random() < 0.5 ? "rgba(90,74,42,0.035)" : "rgba(255,250,230,0.05)";
      gctx.beginPath(); gctx.arc(x, y, 0.6 + Math.random() * 0.8, 0, Math.PI * 2); gctx.fill();
    }
    const vg = gctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(60,45,20,0.18)");
    gctx.fillStyle = vg; gctx.fillRect(0, 0, W, H);
  }
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const r = container.getBoundingClientRect();
    W = r.width; H = r.height;
    sizeCanvas(gcanvas, gctx); sizeCanvas(ocanvas, octx);
    initSand();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  function rakeSegment(x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    if (len < 0.5) return;
    const perpx = -dy / len, perpy = dx / len;
    const tines = 5, spacing = Math.min(W, H) * 0.012;
    gctx.lineCap = "round";
    for (let i = 0; i < tines; i++) {
      const off = (i - (tines - 1) / 2) * spacing;
      const sx0 = x0 + perpx * off, sy0 = y0 + perpy * off, sx1 = x1 + perpx * off, sy1 = y1 + perpy * off;
      gctx.strokeStyle = "rgba(120,98,58,0.35)"; gctx.lineWidth = 2.4;
      gctx.beginPath(); gctx.moveTo(sx0, sy0); gctx.lineTo(sx1, sy1); gctx.stroke();
      gctx.strokeStyle = "rgba(255,248,225,0.4)"; gctx.lineWidth = 1;
      gctx.beginPath();
      gctx.moveTo(sx0 + perpx * 1.2, sy0 + perpy * 1.2); gctx.lineTo(sx1 + perpx * 1.2, sy1 + perpy * 1.2);
      gctx.stroke();
    }
  }
  let smoothing = false;
  function smoothSand() {
    if (smoothing) return;
    smoothing = true;
    const start = performance.now(), dur = 900;
    function fade() {
      if (!alive) return;
      const t = performance.now() - start;
      gctx.fillStyle = "rgba(216,201,168,0.09)";
      gctx.fillRect(0, 0, W, H);
      if (t < dur) requestAnimationFrame(fade); else { initSand(); smoothing = false; }
    }
    fade();
  }
  smoothBtn.addEventListener("click", smoothSand);

  const STONE_SHADES = ["#8B8B85", "#77776F", "#9C9C92", "#69695F"];
  const LEAF_COLORS = ["#D98B4E", "#C9704A", "#B7A34A", "#8A9A6B", "#CC8F3D"];
  let stones = [], leaves = [];
  function lighten(hex, amt) {
    const c = parseInt(hex.slice(1), 16);
    let r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
    r = Math.min(255, r + amt); g = Math.min(255, g + amt); b = Math.min(255, b + amt);
    return `rgb(${r},${g},${b})`;
  }
  function placeStone(x, y) {
    const size = Math.min(W, H) * (0.035 + Math.random() * 0.02);
    const pts = [], sides = 10;
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2, rr = size * (0.85 + Math.random() * 0.3);
      pts.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr * 0.8 });
    }
    stones.push({ x, y, r: size, pts, shade: STONE_SHADES[Math.floor(Math.random() * STONE_SHADES.length)], rot: Math.random() * Math.PI });
    playThud();
  }
  function dropLeaf(x, y) {
    leaves.push({
      startX: x, x, startY: y - 100, endY: y, y: y - 100,
      rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.04,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      size: Math.min(W, H) * (0.022 + Math.random() * 0.012),
      t: 0, duration: 60 + Math.random() * 30, settled: false, swayAmp: 12 + Math.random() * 10
    });
  }
  function updateLeaves() {
    for (const l of leaves) {
      if (l.settled) continue;
      l.t++;
      const prog = Math.min(1, l.t / l.duration), ease = 1 - Math.pow(1 - prog, 3);
      l.y = l.startY + (l.endY - l.startY) * ease;
      l.x = l.startX + Math.sin(prog * Math.PI * 3) * l.swayAmp * (1 - prog);
      l.rot += l.rotSpeed;
      if (prog >= 1) { l.settled = true; playRustle(); }
    }
  }
  function drawStones() {
    for (const s of stones) {
      octx.save();
      octx.fillStyle = "rgba(60,48,26,0.18)";
      octx.beginPath(); octx.ellipse(s.x, s.y + s.r * 0.55, s.r * 0.9, s.r * 0.32, 0, 0, Math.PI * 2); octx.fill();
      octx.restore();
      octx.save();
      octx.translate(s.x, s.y); octx.rotate(s.rot);
      octx.beginPath();
      s.pts.forEach((p, i) => i === 0 ? octx.moveTo(p.x, p.y) : octx.lineTo(p.x, p.y));
      octx.closePath();
      const grad = octx.createLinearGradient(-s.r, -s.r, s.r, s.r);
      grad.addColorStop(0, lighten(s.shade, 30)); grad.addColorStop(1, s.shade);
      octx.fillStyle = grad; octx.fill();
      octx.restore();
    }
  }
  function drawLeaves() {
    for (const l of leaves) {
      octx.save();
      octx.translate(l.x, l.y); octx.rotate(l.rot);
      octx.fillStyle = l.color;
      octx.beginPath(); octx.ellipse(0, 0, l.size, l.size * 0.55, 0, 0, Math.PI * 2); octx.fill();
      octx.strokeStyle = "rgba(0,0,0,0.15)"; octx.lineWidth = 1;
      octx.beginPath(); octx.moveTo(-l.size * 0.8, 0); octx.lineTo(l.size * 0.8, 0); octx.stroke();
      octx.restore();
    }
  }

  let mode = "rake", raking = false, lastPos = null, draggingStone = null;
  function checkStoneDragStart(p) {
    for (let i = stones.length - 1; i >= 0; i--) {
      const s = stones[i];
      if (Math.hypot(s.x - p.x, s.y - p.y) < s.r * 1.1) { draggingStone = s; return true; }
    }
    return false;
  }
  function onDown(e) {
    ensureAudio(); if (hintEl) hintEl.style.opacity = "0";
    const p = posIn(container, e);
    if (checkStoneDragStart(p)) return;
    if (mode === "rake") { raking = true; lastPos = p; }
    else if (mode === "stone") placeStone(p.x, p.y);
    else if (mode === "leaf") dropLeaf(p.x, p.y);
  }
  function onMove(e) {
    const p = posIn(container, e);
    if (draggingStone) { draggingStone.x = p.x; draggingStone.y = p.y; return; }
    if (raking && lastPos) { rakeSegment(lastPos.x, lastPos.y, p.x, p.y); lastPos = p; maybeRakeSound(); }
  }
  function onUp() { raking = false; lastPos = null; draggingStone = null; }
  ocanvas.addEventListener("pointerdown", onDown);
  ocanvas.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);

  modeBtns.forEach((b) => {
    b.addEventListener("click", () => {
      modeBtns.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      mode = b.dataset.mode;
    });
  });

  function loop() {
    updateLeaves();
    octx.clearRect(0, 0, W, H);
    drawStones(); drawLeaves();
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  // --- Audio ---
  let actx = null, muted = false, lastRakeSound = 0;
  function ensureAudio() {
    if (actx) { if (actx.state === "suspended") actx.resume(); return; }
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch { actx = null; }
  }
  function noiseBurst(freqLow, freqHigh, vol, dur) {
    if (!actx || muted) return;
    const now = actx.currentTime;
    const bufSize = Math.floor(actx.sampleRate * dur);
    const buf = actx.createBuffer(1, bufSize, actx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = actx.createBufferSource(); src.buffer = buf;
    const filt = actx.createBiquadFilter(); filt.type = "bandpass";
    filt.frequency.value = (freqLow + freqHigh) / 2; filt.Q.value = 0.8;
    const g = actx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(vol, now + dur * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(filt).connect(g).connect(actx.destination);
    src.start(now); src.stop(now + dur + 0.05);
  }
  function maybeRakeSound() {
    const now = performance.now();
    if (now - lastRakeSound < 90) return;
    lastRakeSound = now;
    noiseBurst(1800, 3200, 0.02, 0.18);
  }
  function playThud() {
    if (!actx || muted) return;
    const now = actx.currentTime;
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(140, now); o.frequency.exponentialRampToValueAtTime(80, now + 0.18);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.12, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    o.connect(g).connect(actx.destination);
    o.start(now); o.stop(now + 0.4);
  }
  function playRustle() { noiseBurst(2500, 5000, 0.025, 0.3); }

  soundBtn.addEventListener("click", () => {
    muted = !muted; soundBtn.innerHTML = muted ? SPEAKER_OFF : SPEAKER_ON;
    soundBtn.setAttribute("aria-label", muted ? "Sound off" : "Sound on"); soundBtn.title = muted ? "Sound off" : "Sound on";
  });

  return function cleanup() {
    alive = false;
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
    try { actx && actx.close(); } catch {}
    container.style.background = "";
  };
}

/* ---- Bubble Float: light, playful — tap a bubble to let it go ---- */
function mountBubble(container) {
  container.style.background = "linear-gradient(180deg,#dff3f6 0%,#bfe3ea 100%)";
  const canvas = document.createElement("canvas");
  const ui = document.createElement("div");
  ui.className = "g-ui";
  ui.innerHTML = `<div class="g-top g-top-dark"><div class="g-title">Bubble Float</div><div class="g-hint" id="bHint">Tap a bubble to let it go</div></div><button class="g-sound g-sound-dark" id="bSound" aria-label="Sound on" title="Sound on">${SPEAKER_ON}</button>`;
  container.append(canvas, ui);

  const ctx = canvas.getContext("2d");
  let W, H, DPR, raf;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const r = container.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const COLORS = ["rgba(255,255,255,0.55)", "rgba(198,230,235,0.55)", "rgba(220,205,240,0.5)", "rgba(255,225,210,0.5)"];
  let bubbles = [], pops = [];
  function spawn() {
    const r = 16 + Math.random() * 26;
    bubbles.push({ x: Math.random() * W, y: H + r + Math.random() * 40, r, speed: 0.35 + Math.random() * 0.5, drift: Math.random() * Math.PI * 2, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
  }
  for (let i = 0; i < 7; i++) { spawn(); bubbles[bubbles.length - 1].y = Math.random() * H; }
  const spawnTimer = setInterval(() => { if (bubbles.length < 12) spawn(); }, 1400);

  function popAt(b) { pops.push({ x: b.x, y: b.y, r: b.r, alpha: 0.6 }); playChime(); }
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y -= b.speed;
      const x = b.x + Math.sin(t * 0.001 + b.drift) * 0.4;
      ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = b.color; ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fill();
      b.x = x;
      if (b.y < -b.r - 10) bubbles.splice(i, 1);
    }
    for (let i = pops.length - 1; i >= 0; i--) {
      const p = pops[i];
      p.r += 2.2; p.alpha *= 0.88;
      if (p.alpha < 0.02) { pops.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${p.alpha})`; ctx.lineWidth = 2; ctx.stroke();
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  const hint = ui.querySelector("#bHint");
  function onTap(e) {
    const p = posIn(container, e);
    if (hint) hint.style.opacity = "0";
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + 6) { popAt(b); bubbles.splice(i, 1); break; }
    }
  }
  canvas.addEventListener("pointerdown", onTap);

  let audioCtx = null, soundOn = true;
  const bSoundBtn = ui.querySelector("#bSound");
  bSoundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    bSoundBtn.innerHTML = soundOn ? SPEAKER_ON : SPEAKER_OFF;
    bSoundBtn.setAttribute("aria-label", soundOn ? "Sound on" : "Sound off");
    bSoundBtn.title = soundOn ? "Sound on" : "Sound off";
  });
  function ensureAudio() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { audioCtx = null; } } else if (audioCtx.state === "suspended") audioCtx.resume(); }
  function playChime() {
    if (!soundOn) return;
    ensureAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime, freq = 500 + Math.random() * 300;
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = "sine"; osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.6, now + 0.15);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 0.55);
  }

  return function cleanup() {
    cancelAnimationFrame(raf);
    clearInterval(spawnTimer);
    ro.disconnect();
    try { audioCtx && audioCtx.close(); } catch {}
    container.style.background = "";
  };
}

/* ---- Pebble Stack: physics stacking (Matter.js, lazy-loaded once) ---- */
let matterLoadPromise = null;
function loadMatter() {
  if (window.Matter) return Promise.resolve();
  if (matterLoadPromise) return matterLoadPromise;
  matterLoadPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js";
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
  return matterLoadPromise;
}
function mountPebble(container) {
  container.style.background = "linear-gradient(180deg,#EDE7DA 0%,#D7C9B8 100%)";
  const canvas = document.createElement("canvas");
  const ui = document.createElement("div");
  ui.className = "g-ui";
  ui.innerHTML = `<div class="g-top g-top-dark"><div class="g-title">Pebble Stack</div><div class="g-hint" id="pHint">Drag a stone into place, breathe as it settles</div></div><button class="g-sound g-sound-dark" id="pSound" aria-label="Sound on" title="Sound on">${SPEAKER_ON}</button><button class="g-btn" id="pReset">Clear tower</button><div class="g-indicator" id="pIndicator"></div><div class="g-celebrate" id="pCelebrate"><span>🌿 Balance achieved</span></div>`;
  container.append(canvas, ui);

  let disposed = false, cleanupInner = () => {};
  const sound = { on: true };
  const pSoundBtn = ui.querySelector("#pSound");
  pSoundBtn.addEventListener("click", () => {
    sound.on = !sound.on;
    pSoundBtn.innerHTML = sound.on ? SPEAKER_ON : SPEAKER_OFF;
    pSoundBtn.setAttribute("aria-label", sound.on ? "Sound on" : "Sound off");
    pSoundBtn.title = sound.on ? "Sound on" : "Sound off";
  });
  loadMatter().then(() => { if (!disposed) cleanupInner = runPebbleEngine(container, canvas, ui, sound); })
    .catch(() => { const h = ui.querySelector("#pHint"); if (h) h.textContent = "Couldn't load this game — check your connection."; });

  return function cleanup() { disposed = true; try { cleanupInner(); } catch {} container.style.background = ""; };
}
function runPebbleEngine(container, canvas, ui, sound) {
  const { Engine, World, Bodies, Body, Mouse, MouseConstraint, Events, Runner } = Matter;
  const ctx = canvas.getContext("2d");
  const hintEl = ui.querySelector("#pHint"), indicatorEl = ui.querySelector("#pIndicator");
  const celebrateEl = ui.querySelector("#pCelebrate"), resetBtn = ui.querySelector("#pReset");

  const engine = Engine.create();
  engine.gravity.y = 0.35;
  const world = engine.world;
  const CAT_ACTIVE = 0x0002, CAT_SETTLED = 0x0004;
  const STONE_COLORS = ["#9C9284", "#B5A78F", "#8A8B80", "#C7B49C", "#A99C86", "#736B60", "#BFAF9C"];
  let W, H, DPR, ground, wallL, wallR;
  function buildBounds() {
    if (ground) World.remove(world, [ground, wallL, wallR]);
    const groundH = Math.max(50, H * 0.12);
    ground = Bodies.rectangle(W / 2, H - groundH / 2, W * 1.4, groundH, { isStatic: true, friction: 1, label: "ground" });
    ground.topY = H - groundH;
    wallL = Bodies.rectangle(-40, H / 2, 80, H * 3, { isStatic: true });
    wallR = Bodies.rectangle(W + 40, H / 2, 80, H * 3, { isStatic: true });
    World.add(world, [ground, wallL, wallR]);
  }
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const r = container.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildBounds();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  let stones = [], active = null, placedCount = 0;
  const GOAL_STEP = 5;
  let goal = GOAL_STEP;
  function spawnStone() {
    const size = Math.min(W, H);
    const r = size * (0.08 + Math.random() * 0.035);
    const sides = 5 + Math.floor(Math.random() * 3);
    const x = W / 2 + (Math.random() - 0.5) * size * 0.1, y = size * 0.1;
    const body = Bodies.polygon(x, y, sides, r, { chamfer: { radius: r * 0.5 }, friction: 0.95, frictionStatic: 1, restitution: 0.02, density: 0.0018, frictionAir: 0.02, collisionFilter: { category: CAT_ACTIVE, mask: 0xFFFFFFFF }, label: "stone" });
    Body.scale(body, 1, 0.4 + Math.random() * 0.12);
    body.stoneColor = STONE_COLORS[Math.floor(Math.random() * STONE_COLORS.length)];
    body.spawnTime = performance.now(); body.lowFrames = 0;
    World.add(world, body); stones.push(body); active = body;
  }
  const mouse = Mouse.create(canvas);
  mouse.pixelRatio = DPR;
  const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.4, damping: 0.5, render: { visible: false } }, collisionFilter: { mask: CAT_ACTIVE } });
  World.add(world, mc);

  function onFirstDown() { ensureAudio(); if (hintEl) hintEl.style.opacity = "0"; }
  canvas.addEventListener("pointerdown", onFirstDown, { once: true });

  function updateIndicator() {
    if (placedCount <= 0) { indicatorEl.style.opacity = "0"; return; }
    indicatorEl.textContent = "Goal: " + placedCount + " / " + goal + " stones";
    indicatorEl.style.opacity = "0.9";
  }
  function celebrate() {
    celebrateEl.style.opacity = "1";
    if (sound.on) ensureAudio();
    if (actx && sound.on) {
      const now = actx.currentTime;
      [523.25, 659.25, 784].forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = "sine"; o.frequency.value = f;
        const t0 = now + i * 0.12;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.08, t0 + 0.5);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 3);
        o.connect(g).connect(actx.destination);
        o.start(t0); o.stop(t0 + 3.1);
      });
    }
    setTimeout(() => { celebrateEl.style.opacity = "0"; }, 2600);
    goal += GOAL_STEP;
  }
  function checkSettle() {
    if (!active) return;
    if (mc.body === active) { active.lowFrames = 0; return; }
    const now = performance.now();
    if (now - active.spawnTime < 600) return;
    const speed = Math.hypot(active.velocity.x, active.velocity.y);
    if (speed < 0.035 && Math.abs(active.angularVelocity) < 0.01) active.lowFrames++; else active.lowFrames = 0;
    if (active.lowFrames > 25) {
      active.collisionFilter.category = CAT_SETTLED;
      placedCount++; updateIndicator();
      if (placedCount === goal) celebrate();
      active = null; spawnStone();
    }
  }
  function resetTower() {
    if (stones.length === 0) return;
    const toFade = stones.slice();
    toFade.forEach((s) => { s.fading = true; s.fadeStart = performance.now(); });
    mc.collisionFilter.mask = 0; active = null;
    setTimeout(() => {
      toFade.forEach((s) => World.remove(world, s));
      stones = []; placedCount = 0; goal = GOAL_STEP;
      celebrateEl.style.opacity = "0"; updateIndicator();
      mc.collisionFilter.mask = CAT_ACTIVE; spawnStone();
    }, 850);
  }
  resetBtn.addEventListener("click", resetTower);

  function lighten(hex, amt) {
    const c = parseInt(hex.slice(1), 16);
    let r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
    r = Math.min(255, r + amt); g = Math.min(255, g + amt); b = Math.min(255, b + amt);
    return `rgb(${r},${g},${b})`;
  }
  function drawGround() {
    const gy = ground.topY, rad = 18;
    const grad = ctx.createLinearGradient(0, gy, 0, H);
    grad.addColorStop(0, "#CBB79C"); grad.addColorStop(1, "#B39F82");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, gy + rad); ctx.arcTo(0, gy, rad, gy, rad); ctx.lineTo(W - rad, gy);
    ctx.arcTo(W, gy, W, gy + rad, rad); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  }
  function drawStone(s) {
    const alpha = s.fading ? Math.max(0, 1 - (performance.now() - s.fadeStart) / 800) : 1;
    if (alpha <= 0) return;
    const v = s.vertices;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.moveTo(v[0].x, v[0].y);
    for (let i = 1; i < v.length; i++) ctx.lineTo(v[i].x, v[i].y);
    ctx.closePath();
    const b = s.bounds;
    const grad = ctx.createLinearGradient(b.min.x, b.min.y, b.min.x, b.max.y);
    grad.addColorStop(0, lighten(s.stoneColor, 35)); grad.addColorStop(1, s.stoneColor);
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = "rgba(70,60,48,0.18)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }
  let raf;
  function draw() { ctx.clearRect(0, 0, W, H); drawGround(); for (const s of stones) drawStone(s); checkSettle(); raf = requestAnimationFrame(draw); }
  const runner = Runner.create();
  Runner.run(runner, engine);
  spawnStone();
  raf = requestAnimationFrame(draw);

  let actx = null, lastClack = 0;
  function ensureAudio() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch { actx = null; } } else if (actx.state === "suspended") actx.resume(); }
  function playClack(speed) {
    if (!actx || !sound.on) return;
    const now = actx.currentTime, vol = Math.min(0.3, 0.08 + speed * 0.035);
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "sine";
    const base = 150 + Math.random() * 50;
    o.frequency.setValueAtTime(base, now);
    o.frequency.exponentialRampToValueAtTime(base * 0.55, now + 0.16);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    o.connect(g).connect(actx.destination);
    o.start(now); o.stop(now + 0.32);
  }
  function onCollision(evt) {
    const now = performance.now();
    if (now - lastClack < 70) return;
    for (const pair of evt.pairs) {
      if (pair.bodyA.label === "stone" || pair.bodyB.label === "stone") {
        const speed = Math.hypot(pair.bodyA.velocity.x - pair.bodyB.velocity.x, pair.bodyA.velocity.y - pair.bodyB.velocity.y);
        if (speed > 0.3) { lastClack = now; playClack(speed); break; }
      }
    }
  }
  Events.on(engine, "collisionStart", onCollision);

  return function cleanup() {
    cancelAnimationFrame(raf);
    ro.disconnect();
    Runner.stop(runner);
    Events.off(engine, "collisionStart", onCollision);
    World.clear(world); Engine.clear(engine);
    resetBtn.removeEventListener("click", resetTower);
    try { actx && actx.close(); } catch {}
  };
}

/* ---- Soundscape: layer rain, sitar, crickets and wind into your own mix ---- */
function mountSoundscape(container) {
  container.style.background = "linear-gradient(180deg,#0D1526 0%,#050810 100%)";
  const canvas = document.createElement("canvas");
  const ui = document.createElement("div");
  ui.className = "g-ui";
  ui.innerHTML = `<div class="g-top"><div class="g-title">Soundscape</div><div class="g-hint" id="sHint">Tap the elements below to build your own relaxing mix</div></div>
    <button class="g-sound" id="sSound" aria-label="Sound on" title="Sound on">${SPEAKER_ON}</button>
    <div class="ss-panel">
      <div class="ss-tiles">
        <button type="button" class="ss-tile" data-id="rain"><span class="ss-icon">🌧️</span><span class="ss-label">Rain</span></button>
        <button type="button" class="ss-tile" data-id="sitar"><span class="ss-icon">🎼</span><span class="ss-label">Sitar</span></button>
        <button type="button" class="ss-tile" data-id="crickets"><span class="ss-icon">🦗</span><span class="ss-label">Crickets</span></button>
        <button type="button" class="ss-tile" data-id="wind"><span class="ss-icon">🍃</span><span class="ss-label">Wind</span></button>
      </div>
      <div class="ss-vol"><label for="sVol">Volume</label><input type="range" id="sVol" min="0" max="100" value="70"></div>
    </div>`;
  container.append(canvas, ui);

  const ctx = canvas.getContext("2d");
  const hintEl = ui.querySelector("#sHint");
  const tiles = ui.querySelectorAll(".ss-tile");
  const volSlider = ui.querySelector("#sVol");
  const soundBtn = ui.querySelector("#sSound");

  let W, H, DPR, raf, alive = true;
  let stars = [], drops = [], wisps = [], motes = [];
  function initStars() {
    stars = [];
    const n = Math.floor((W * H) / 9000);
    for (let i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H * 0.8, r: 0.6 + Math.random() * 1.4, phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 0.8, flash: 0 });
  }
  function newDrop() { return { x: Math.random() * W, y: Math.random() * H, len: 12 + Math.random() * 18, speed: 3 + Math.random() * 3, opacity: 0.15 + Math.random() * 0.3, drift: 0.4 + Math.random() * 0.4 }; }
  function initDrops() {
    drops = [];
    const n = Math.floor((W * H) / 9000);
    for (let i = 0; i < n; i++) drops.push(newDrop());
  }
  function initWisps() {
    wisps = [];
    for (let i = 0; i < 6; i++) wisps.push({ x: Math.random() * W, y: H * (0.08 + Math.random() * 0.45), len: W * (0.14 + Math.random() * 0.14), speed: 0.25 + Math.random() * 0.3, opacity: 0.06 + Math.random() * 0.08 });
  }
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const r = container.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    initStars(); initDrops(); initWisps();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  function drawStars(t) {
    for (const s of stars) {
      const tw = 0.4 + 0.4 * Math.sin(t * 0.001 * s.speed + s.phase);
      let alpha = 0.25 + tw * 0.5;
      if (s.flash > 0) { alpha = Math.min(1, alpha + s.flash); s.flash *= 0.9; if (s.flash < 0.02) s.flash = 0; }
      ctx.fillStyle = `rgba(234,240,255,${alpha})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
  }
  function flashRandomStar() { if (stars.length) stars[Math.floor(Math.random() * stars.length)].flash = 1; }
  function drawRain(alpha) {
    ctx.lineCap = "round"; ctx.lineWidth = 1.2;
    for (const d of drops) {
      if (alpha > 0.01) {
        ctx.strokeStyle = `rgba(182,199,230,${d.opacity * alpha})`;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.drift * 5, d.y + d.len); ctx.stroke();
      }
      d.x += d.drift; d.y += d.speed;
      if (d.y > H + 20) { d.y = -20; d.x = Math.random() * W; }
    }
  }
  function drawWisps(alpha) {
    ctx.lineCap = "round";
    for (const w of wisps) {
      if (alpha > 0.01) {
        ctx.strokeStyle = `rgba(220,230,245,${w.opacity * alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.lineTo(w.x + w.len, w.y); ctx.stroke();
      }
      w.x += w.speed;
      if (w.x > W + w.len) w.x = -w.len;
    }
  }
  function spawnMote() { motes.push({ x: W * (0.15 + Math.random() * 0.7), y: H * 0.7, vy: -(0.3 + Math.random() * 0.3), life: 220, maxLife: 220, size: 3 + Math.random() * 3 }); }
  function updateMotes() {
    for (let i = motes.length - 1; i >= 0; i--) { const m = motes[i]; m.y += m.vy; m.life--; if (m.life <= 0) motes.splice(i, 1); }
  }
  function drawMotes(alpha) {
    if (alpha < 0.01) return;
    for (const m of motes) {
      const a = (m.life / m.maxLife) * alpha;
      const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.size * 4);
      grad.addColorStop(0, `rgba(245,217,138,${0.8 * a})`);
      grad.addColorStop(1, "rgba(245,217,138,0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.size * 4, 0, Math.PI * 2); ctx.fill();
    }
  }
  const visTargets = { rain: 0, sitar: 0, crickets: 0, wind: 0 };
  const visAlpha = { rain: 0, sitar: 0, crickets: 0, wind: 0 };
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    drawStars(t);
    drawWisps(visAlpha.wind);
    drawRain(visAlpha.rain);
    updateMotes(); drawMotes(visAlpha.sitar);
    for (const k in visAlpha) visAlpha[k] += (visTargets[k] - visAlpha[k]) * 0.05;
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);

  // --- Audio ---
  let actx = null, master = null, muted = false;
  const layers = { rain: { active: false }, wind: { active: false }, sitar: { active: false, timer: null }, crickets: { active: false, timer: null } };
  function applyMaster() { if (master) master.gain.setTargetAtTime(muted ? 0 : volSlider.value / 100, actx.currentTime, 0.1); }
  function ensureAudio() {
    if (actx) { if (actx.state === "suspended") actx.resume(); return true; }
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch { actx = null; return false; }
    master = actx.createGain(); master.gain.value = muted ? 0 : volSlider.value / 100;
    master.connect(actx.destination);
    initRain(); initWind();
    return true;
  }
  volSlider.addEventListener("input", applyMaster);
  soundBtn.addEventListener("click", () => {
    muted = !muted;
    soundBtn.innerHTML = muted ? SPEAKER_OFF : SPEAKER_ON;
    soundBtn.setAttribute("aria-label", muted ? "Sound off" : "Sound on"); soundBtn.title = muted ? "Sound off" : "Sound on";
    applyMaster();
  });

  function makeNoiseBuffer(seconds, pink) {
    const bufSize = Math.floor(actx.sampleRate * seconds);
    const buf = actx.createBuffer(1, bufSize, actx.sampleRate);
    const data = buf.getChannelData(0);
    if (pink) {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179; b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520; b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522; b5 = -0.7616 * b5 - white * 0.0168980;
        const p = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362; b6 = white * 0.115926;
        data[i] = p * 0.11;
      }
    } else {
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }
  function initRain() {
    const src = actx.createBufferSource(); src.buffer = makeNoiseBuffer(2, true); src.loop = true;
    const filt = actx.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 2200;
    const g = actx.createGain(); g.gain.value = 0;
    src.connect(filt).connect(g).connect(master); src.start();
    layers.rain.g = g;
  }
  function initWind() {
    const src = actx.createBufferSource(); src.buffer = makeNoiseBuffer(2, false); src.loop = true;
    const filt = actx.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 500;
    const g = actx.createGain(); g.gain.value = 0;
    const lfo = actx.createOscillator(); lfo.frequency.value = 0.06;
    const lfoGain = actx.createGain(); lfoGain.gain.value = 170;
    lfo.connect(lfoGain); lfoGain.connect(filt.frequency); lfo.start();
    src.connect(filt).connect(g).connect(master); src.start();
    layers.wind.g = g;
  }
  const PENTATONIC = [196, 220, 246.94, 293.66, 329.63, 392, 440];
  function playPluck() {
    const now = actx.currentTime;
    const f = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
    const o = actx.createOscillator(), filt = actx.createBiquadFilter(), g = actx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(f * 0.98, now); o.frequency.exponentialRampToValueAtTime(f, now + 0.05);
    filt.type = "lowpass"; filt.frequency.setValueAtTime(2400, now); filt.frequency.exponentialRampToValueAtTime(500, now + 1.4);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.11, now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    o.connect(filt).connect(g).connect(master);
    o.start(now); o.stop(now + 1.9);
  }
  function scheduleSitar() {
    if (!alive || !layers.sitar.active) return;
    playPluck(); spawnMote();
    layers.sitar.timer = setTimeout(scheduleSitar, 1800 + Math.random() * 2200);
  }
  function playChirpPulse() {
    if (!alive || !actx) return;
    const now = actx.currentTime;
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "square"; o.frequency.value = 4000 + Math.random() * 500;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.02, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    o.connect(g).connect(master);
    o.start(now); o.stop(now + 0.06);
  }
  function playChirpEvent() {
    const pulses = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < pulses; i++) setTimeout(playChirpPulse, i * 75);
  }
  function scheduleCrickets() {
    if (!alive || !layers.crickets.active) return;
    playChirpEvent(); flashRandomStar();
    layers.crickets.timer = setTimeout(scheduleCrickets, 700 + Math.random() * 1800);
  }
  function toggleLayer(id, btn) {
    if (!ensureAudio()) return;
    const L = layers[id];
    L.active = !L.active;
    btn.classList.toggle("active", L.active);
    visTargets[id] = L.active ? 1 : 0;
    if (id === "rain") L.g.gain.setTargetAtTime(L.active ? 0.28 : 0, actx.currentTime, 0.7);
    if (id === "wind") L.g.gain.setTargetAtTime(L.active ? 0.22 : 0, actx.currentTime, 0.7);
    if (id === "sitar") { if (L.active) scheduleSitar(); else clearTimeout(L.timer); }
    if (id === "crickets") { if (L.active) scheduleCrickets(); else clearTimeout(L.timer); }
  }
  tiles.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (hintEl) hintEl.style.opacity = "0";
      toggleLayer(btn.dataset.id, btn);
    });
  });

  return function cleanup() {
    alive = false;
    cancelAnimationFrame(raf);
    clearTimeout(layers.sitar.timer); clearTimeout(layers.crickets.timer);
    ro.disconnect();
    try { actx && actx.close(); } catch {}
    container.style.background = "";
  };
}

const GAME_MOUNTERS = { ripple: mountRipple, garden: mountGarden, bubble: mountBubble, pebble: mountPebble, soundscape: mountSoundscape };
let currentCleanup = null;

function positionThumb() {
  const seg = document.getElementById("gameSeg");
  const thumb = document.getElementById("gameSegThumb");
  const activeBtn = seg?.querySelector(".game-seg-btn.on");
  if (!seg || !thumb) return;
  if (!activeBtn) { thumb.style.opacity = "0"; return; }
  thumb.style.opacity = "1";
  const segRect = seg.getBoundingClientRect();
  const btnRect = activeBtn.getBoundingClientRect();
  thumb.style.width = btnRect.width + "px";
  thumb.style.height = btnRect.height + "px";
  thumb.style.transform = `translateX(${btnRect.left - segRect.left - seg.clientLeft}px)`;
}
window.addEventListener("resize", positionThumb);

function loadGame(key, { manual } = {}) {
  if (!GAMES[key]) key = "ripple";
  if (currentCleanup) { try { currentCleanup(); } catch {} currentCleanup = null; }
  const stage = document.getElementById("gameStage");
  if (stage) stage.innerHTML = "";
  const mountFn = GAME_MOUNTERS[key];
  if (stage && mountFn) currentCleanup = mountFn(stage);

  document.querySelectorAll(".game-seg-btn, .game-extra-btn").forEach((btn) => btn.classList.toggle("on", btn.dataset.game === key));
  positionThumb();

  const tagline = document.getElementById("gamesTagline");
  const g = GAMES[key];
  if (tagline) {
    tagline.textContent = manual
      ? `You picked ${g.name}. Switch anytime — the mood-based pick still updates each day.`
      : mood
        ? `Picked for your "${mood}" mood today: ${g.name}. You can switch anytime.`
        : `Today's pick: ${g.name}. You can switch anytime.`;
  }
}
(function initGames() {
  // Every time the Relax page is opened, the game is chosen fresh based on
  // today's mood (not remembered from a previous visit), so it can land on
  // any of the 4 calm games.
  const keys = Object.keys(GAMES);
  const pick = GAME_FOR_MOOD[mood] || keys[Math.floor(Math.random() * keys.length)];
  loadGame(pick);
})();
document.querySelectorAll(".game-seg-btn, .game-extra-btn").forEach((btn) => {
  btn.addEventListener("click", () => loadGame(btn.dataset.game, { manual: true }));
});

let ctx, osc, gain;
function playHz(hz) {
  stopTone();
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  osc = ctx.createOscillator();
  gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = hz;
  gain.gain.value = 0.04;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
}
function stopTone() {
  try { osc && osc.stop(); } catch {}
  try { ctx && ctx.close(); } catch {}
  osc = null;
  ctx = null;
}
document.querySelectorAll("[data-hz]").forEach((btn) => {
  btn.addEventListener("click", () => playHz(Number(btn.dataset.hz)));
});
document.getElementById("stopTone")?.addEventListener("click", stopTone);
window.addEventListener("pagehide", stopTone);
