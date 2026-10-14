/* Live leaderboard — reads public.leaderboard from Supabase, updates in real time. */
(function () {
  const TOP = 10;
  const $ = (id) => document.getElementById(id);
  const podium = $("lbPodium"), list = $("lbList"), msg = $("lbMsg"), live = $("lbLive"), liveTxt = $("lbLiveTxt");
  const meBox = $("lbMe");
  if (!list) return;

  let sb = null, myId = null, rows = [], prevScores = {}, myToday = null, refreshT = null, lastOk = 0;

  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ord = (n) => { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  const av = (seed) => "https://api.dicebear.com/7.x/adventurer/svg?seed=" + encodeURIComponent(seed || "Luna") + "&backgroundColor=c0aede";
  const crown = '<svg class="pod-crown" width="26" height="20" viewBox="0 0 24 18" fill="currentColor"><path d="M2 5l5 4 5-7 5 7 5-4-2 11H4z"/></svg>';

  function setLive(ok, text) {
    live.classList.toggle("off", !ok);
    liveTxt.textContent = text;
  }

  function renderPodium(top) {
    if (!top.length) { podium.innerHTML = ""; return; }
    const order = [1, 2, 3].filter((r) => top[r - 1]);
    podium.innerHTML = order.map((r) => {
      const u = top[r - 1];
      return `<div class="pod p${r} ${u.user_id === myId ? "is-me" : ""}">
        <div class="pod-av">${r === 1 ? crown : ""}<img src="${av(u.avatar)}" alt="" loading="lazy"></div>
        <div class="pod-name">${esc(u.username)}</div>
        <div class="pod-score">${u.score} pts</div>
        <div class="pod-block">${r}<small>${ord(r).replace(/\d+/, "")}</small></div>
      </div>`;
    }).join("");
  }

  function renderList(rest, startRank) {
    list.innerHTML = rest.map((u, i) => {
      const rank = startRank + i;
      const bumped = prevScores[u.user_id] != null && u.score > prevScores[u.user_id];
      return `<li class="lb-row ${u.user_id === myId ? "is-me" : ""} ${bumped ? "bump" : ""}">
        <span class="lb-rank">${ord(rank)}</span>
        <img src="${av(u.avatar)}" alt="" loading="lazy">
        <div class="lb-who"><div class="lb-name">${esc(u.username)}</div><div class="lb-sub">${u.streak || 0}-day streak</div></div>
        <div class="lb-pts">${u.score}<small>pts</small></div>
      </li>`;
    }).join("");
  }

  async function renderMe() {
    if (!meBox) return;
    if (!myId) {
      meBox.innerHTML = `<h3>Your standing</h3><p class="lb-note"><a href="login.html" style="color:var(--blue)">Log in</a> to join the board and see your rank.</p>`;
      return;
    }
    let rank = rows.findIndex((r) => r.user_id === myId) + 1;
    let score = rows.find((r) => r.user_id === myId)?.score;
    if (!rank && sb) {
      try {
        const { data: mine } = await sb.from("leaderboard").select("score").eq("user_id", myId).maybeSingle();
        if (mine) {
          score = mine.score;
          const { count } = await sb.from("leaderboard").select("user_id", { count: "exact", head: true }).gt("score", mine.score);
          rank = (count || 0) + 1;
        }
      } catch {}
    }
    const t = myToday;
    const line = (label, pts) => `<li><span>${label}</span><b>${pts > 0 ? "+" + pts : "0"}</b></li>`;
    meBox.innerHTML = `<h3>Your standing</h3>
      <div class="lb-me-top"><span class="lb-me-rank">${rank ? ord(rank) : "—"}</span><span class="lb-me-score">${score != null ? score + " pts total" : "Your score appears after your first sync"}</span></div>
      ${t ? `<ul class="lb-break">
        ${line("Opened today", t.v)}${line("Mood check-in", t.m)}${line("Relax exercise", t.e)}${line("Dashboard tasks", t.t)}${t.b ? line("7-day streak bonus", t.b) : ""}
        <li class="total"><span>Earned today</span><b>${(t.v || 0) + (t.m || 0) + (t.e || 0) + (t.t || 0) + (t.b || 0)}</b></li>
      </ul>` : `<p class="lb-note">Check in on the dashboard to start earning today's points.</p>`}`;
  }

  function render() {
    const top = rows.slice(0, TOP);
    if (!top.length) {
      podium.innerHTML = ""; list.innerHTML = "";
      msg.hidden = false;
      msg.innerHTML = "No one is on the board yet. Check in on the dashboard to be the first.";
    } else {
      msg.hidden = true;
      renderPodium(top.slice(0, 3));
      renderList(top.slice(3), 4);
    }
    prevScores = Object.fromEntries(rows.map((r) => [r.user_id, r.score]));
    renderMe();
  }

  async function load() {
    if (!sb) return;
    try {
      const { data, error } = await sb.from("leaderboard")
        .select("user_id,username,avatar,score,streak,updated_at")
        .order("score", { ascending: false })
        .order("updated_at", { ascending: true })
        .limit(TOP);
      if (error) throw error;
      rows = data || [];
      lastOk = Date.now();
      setLive(true, "Live");
      render();
    } catch (e) {
      console.warn("leaderboard load", e);
      setLive(false, "Offline");
      if (!rows.length) {
        podium.innerHTML = ""; list.innerHTML = ""; msg.hidden = false;
        msg.textContent = /relation|does not exist|schema cache/i.test(e.message || "")
          ? "The leaderboard table isn't set up yet. Run the leaderboard block in setup.sql in Supabase."
          : "Couldn't load the leaderboard. Check your connection — retrying…";
      }
    }
  }
  const soon = () => { clearTimeout(refreshT); refreshT = setTimeout(load, 250); };

  window.addEventListener("mr-score", (e) => { myToday = e.detail.today; renderMe(); });

  (async function boot() {
    list.innerHTML = '<li class="lb-skel"></li>'.repeat(4);
    if (typeof createSb !== "function") return;
    sb = createSb();
    if (!sb) { setLive(false, "Offline"); return; }
    const session = await currentSession(sb);
    if (!session) {
      msg.hidden = false; list.innerHTML = ""; setLive(false, "Logged out");
      msg.innerHTML = 'Please <a href="login.html">log in</a> to see the leaderboard.';
      renderMe();
      return;
    }
    myId = session.user.id;
    await load();
    // real time: any score change from any user refreshes the board
    sb.channel("leaderboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "leaderboard" }, soon)
      .subscribe((status) => { if (status === "SUBSCRIBED") setLive(true, "Live"); });
    // safety net in case the realtime socket drops
    setInterval(() => { if (!document.hidden) load(); }, 20000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) load(); });
  })();
})();
