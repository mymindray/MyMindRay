/* Messages page: pick a member, open chat.html?with=<id>.
   Others only ever see name, username and avatar (public.chat_directory). */
(function () {
  const $ = (id) => document.getElementById(id);
  const list = $("peopleList"), empty = $("peopleEmpty"), label = $("peopleLabel"), search = $("peopleSearch");
  if (!list) return;

  const av = (seed) => "https://api.dicebear.com/7.x/adventurer/svg?seed=" + encodeURIComponent(seed || "Luna") + "&backgroundColor=c0aede";
  let sb = null, me = null, people = [], convo = {}, term = "", t = null;

  function showEmpty(text) { empty.hidden = !text; empty.textContent = text || ""; }

  async function ensureMyEntry() {
    // keep my own public card (name, username, avatar) up to date
    try {
      const [{ data: prof }, { data: st }] = await Promise.all([
        sb.from("profiles").select("username").eq("id", me).maybeSingle(),
        sb.from("user_state").select("data").eq("id", me).maybeSingle()
      ]);
      const p = (st && st.data && st.data.profile) || {};
      const username = (prof && prof.username) || p.username || localStorage.getItem("wl-username-" + me) || "";
      const display = (p.fullName || p.name || "").trim();
      if (!username && !display) return;
      await sb.from("chat_directory").upsert({
        user_id: me,
        username: (username || display.split(/\s+/)[0] || "Member").slice(0, 24),
        display_name: display.slice(0, 60),
        avatar: p.avatar || "Luna",
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    } catch (e) { console.warn("directory sync", e); }
  }

  async function loadConvos() {
    convo = {};
    const { data, error } = await sb.from("chat_messages")
      .select("sender_id,recipient_id,body,created_at,read_at")
      .order("created_at", { ascending: false }).limit(400);
    if (error) throw error;
    (data || []).forEach((m) => {
      const other = m.sender_id === me ? m.recipient_id : m.sender_id;
      const c = convo[other] || (convo[other] = { last: m, unread: 0 });
      if (m.recipient_id === me && !m.read_at) c.unread++;
    });
  }

  async function loadPeople() {
    const { data, error } = await sb.from("chat_directory")
      .select("user_id,username,display_name,avatar").neq("user_id", me).limit(500);
    if (error) throw error;
    people = data || [];
  }

  function row(p) {
    const c = convo[p.user_id];
    const a = document.createElement("a");
    a.className = "person-row" + (c && c.unread ? " unread" : "");
    a.href = "chat.html?with=" + encodeURIComponent(p.user_id);
    const img = document.createElement("img"); img.src = av(p.avatar); img.alt = ""; img.loading = "lazy";
    const mid = document.createElement("div"); mid.style.minWidth = "0";
    const n = document.createElement("span"); n.className = "p-name"; n.textContent = p.display_name || p.username;
    const u = document.createElement("span"); u.className = "p-user"; u.textContent = "@" + p.username;
    mid.append(n, u);
    if (c) {
      const l = document.createElement("span"); l.className = "p-last";
      l.textContent = (c.last.sender_id === me ? "You: " : "") + c.last.body;
      mid.append(l);
    }
    a.append(img, mid);
    if (c && c.unread) {
      const b = document.createElement("span"); b.className = "p-badge"; b.textContent = c.unread > 99 ? "99+" : String(c.unread);
      a.append(b);
    } else {
      a.insertAdjacentHTML("beforeend", '<svg class="p-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>');
    }
    const li = document.createElement("li"); li.append(a);
    return li;
  }

  function render() {
    const q = term.trim().toLowerCase().replace(/^@/, "");
    let rows = people.filter((p) => !q || (p.username || "").toLowerCase().includes(q) || (p.display_name || "").toLowerCase().includes(q));
    rows.sort((a, b) => {
      const ca = convo[a.user_id], cb = convo[b.user_id];
      if (ca && cb) return new Date(cb.last.created_at) - new Date(ca.last.created_at);
      if (ca) return -1; if (cb) return 1;
      return (a.username || "").localeCompare(b.username || "");
    });
    list.innerHTML = "";
    rows.forEach((p) => list.append(row(p)));
    label.textContent = q ? "Results" : "People";
    label.hidden = !rows.length;
    if (!rows.length) showEmpty(q ? "No one found with that name or username." : "No other members yet. When someone else joins My MindRay, they will show up here.");
    else showEmpty("");
  }

  async function refresh() {
    try { await Promise.all([loadPeople(), loadConvos()]); render(); }
    catch (e) {
      console.warn("messages load", e);
      list.innerHTML = "";
      showEmpty(/relation|does not exist|schema cache/i.test(e.message || "")
        ? "Messaging isn't set up yet. Run the messages block in setup.sql in Supabase."
        : "Couldn't load people. Check your connection and try again.");
    }
  }

  search.addEventListener("input", () => { term = search.value; clearTimeout(t); t = setTimeout(render, 120); });

  (async function boot() {
    if (typeof createSb !== "function") return;
    sb = createSb();
    if (!sb) { showEmpty("Couldn't connect. Please refresh."); return; }
    const session = await currentSession(sb);
    if (!session) { showEmpty(""); empty.hidden = false; empty.innerHTML = 'Please <a href="login.html" style="color:var(--blue)">log in</a> to message people.'; search.hidden = true; return; }
    me = session.user.id;
    await ensureMyEntry();
    await refresh();
    sb.channel("messages-inbox-" + me)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: "recipient_id=eq." + me }, refresh)
      .subscribe();
    setInterval(() => { if (!document.hidden) refresh(); }, 20000);
  })();
})();
