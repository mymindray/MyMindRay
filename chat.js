/* Person-to-person chat. Text only, website only.
   Reads/writes public.chat_messages (RLS: only sender + recipient can see a message). */
(function () {
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const $ = (id) => document.getElementById(id);
  const chat = $("chat"), note = $("chatNote"), input = $("prompt"), sendBtn = $("sendBtn"), form = $("composer"), count = $("count");
  const av = (seed) => "https://api.dicebear.com/7.x/adventurer/svg?seed=" + encodeURIComponent(seed || "Luna") + "&backgroundColor=c0aede";

  let sb = null, me = null, other = null, shown = new Set(), lastDay = "", pollT = null;

  function setNote(text) {
    note.textContent = text;
    if (!note.isConnected) chat.prepend(note);
  }
  function clearNote() { note.remove(); }

  function header(p) {
    const who = $("who");
    who.innerHTML = "";
    const img = document.createElement("img");
    img.src = av(p.avatar); img.alt = "";
    const box = document.createElement("div"); box.className = "who-text";
    const n = document.createElement("span"); n.className = "who-name"; n.textContent = p.display_name || p.username;
    const u = document.createElement("span"); u.className = "who-user"; u.textContent = "@" + p.username;
    box.append(n, u); who.append(img, box);
    document.title = (p.display_name || p.username) + " — My MindRay";
  }

  function dayLabel(d) {
    const t = new Date(); const y = new Date(); y.setDate(t.getDate() - 1);
    if (d.toDateString() === t.toDateString()) return "Today";
    if (d.toDateString() === y.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function addBubble(m) {
    if (shown.has(m.id)) return;
    shown.add(m.id);
    clearNote();
    const d = new Date(m.created_at);
    const key = d.toDateString();
    if (key !== lastDay) {
      lastDay = key;
      const s = document.createElement("div"); s.className = "day-sep"; s.textContent = dayLabel(d);
      chat.append(s);
    }
    const mine = m.sender_id === me;
    const b = document.createElement("div");
    b.className = "bubble " + (mine ? "me" : "bot");
    const t = document.createElement("div"); t.className = "txt"; t.textContent = m.body;
    const meta = document.createElement("span"); meta.className = "meta";
    meta.textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    b.append(t, meta);
    chat.append(b);
    chat.scrollTop = chat.scrollHeight;
  }

  async function markRead() {
    try {
      await sb.from("chat_messages").update({ read_at: new Date().toISOString() })
        .eq("recipient_id", me).eq("sender_id", other.user_id).is("read_at", null);
    } catch {}
  }

  async function loadMessages() {
    const a = me, b = other.user_id;
    const { data, error } = await sb.from("chat_messages").select("*")
      .or(`and(sender_id.eq.${a},recipient_id.eq.${b}),and(sender_id.eq.${b},recipient_id.eq.${a})`)
      .order("created_at", { ascending: true }).limit(300);
    if (error) throw error;
    (data || []).forEach(addBubble);
    if (!(data || []).length) setNote("No messages yet. Say hello — be kind, be yourself.");
    if ((data || []).some((m) => m.recipient_id === me && !m.read_at)) markRead();
  }

  async function send(text) {
    const body = text.trim();
    if (!body) return;
    sendBtn.disabled = true;
    const { data, error } = await sb.from("chat_messages")
      .insert({ sender_id: me, recipient_id: other.user_id, body }).select().single();
    if (error) {
      const e = document.createElement("div"); e.className = "chat-error"; e.textContent = "Couldn't send. Check your connection and try again.";
      chat.append(e); chat.scrollTop = chat.scrollHeight;
      setTimeout(() => e.remove(), 4000);
      input.value = body;
    } else {
      addBubble(data);
    }
    updateComposer();
  }

  function updateComposer() {
    const len = input.value.length;
    sendBtn.disabled = !input.value.trim();
    count.textContent = len > 850 ? String(1000 - len) : "";
    count.classList.toggle("warn", len > 950);
  }

  async function boot() {
    if (typeof createSb !== "function") return;
    sb = createSb();
    if (!sb) { setNote("Couldn't connect. Please refresh."); return; }
    const session = await currentSession(sb);
    if (!session) { chat.innerHTML = '<div class="chat-note">Please <a href="login.html" style="color:var(--blue-bright)">log in</a> to send messages.</div>'; return; }
    me = session.user.id;

    const withId = new URLSearchParams(location.search).get("with") || "";
    if (!UUID.test(withId) || withId === me) { setNote("Pick someone from your Messages page to start chatting."); return; }

    const { data: p } = await sb.from("chat_directory").select("user_id,username,display_name,avatar").eq("user_id", withId).maybeSingle();
    if (!p) { setNote("This member could not be found."); return; }
    other = p;
    header(p);

    try { await loadMessages(); }
    catch (e) {
      console.warn("chat load", e);
      setNote(/relation|does not exist|schema cache/i.test(e.message || "")
        ? "Messaging isn't set up yet. Run the messages block in setup.sql in Supabase."
        : "Couldn't load messages. Retrying…");
    }

    input.disabled = false;
    input.focus({ preventScroll: true });
    updateComposer();

    sb.channel("chat-" + me + "-" + withId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: "recipient_id=eq." + me },
        (payload) => {
          const m = payload.new;
          if (m && m.sender_id === withId) { addBubble(m); if (!document.hidden) markRead(); }
        })
      .subscribe();

    // safety net if the realtime socket drops
    pollT = setInterval(() => { if (!document.hidden) loadMessages().catch(() => {}); }, 8000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) { loadMessages().catch(() => {}); markRead(); } });
  }

  input.addEventListener("input", updateComposer);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!other || !input.value.trim()) return;
    const text = input.value;
    input.value = "";
    updateComposer();
    send(text);
  });

  boot();
})();
