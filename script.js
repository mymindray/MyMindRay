const sb = createSb();

// Same countries/states used on the doctors & profile pages, plus each
// country's calling code so the phone fields can show the right prefix.
const COUNTRY_DATA = {
  India: { dial: "+91", states: ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"] },
  Japan: { dial: "+81", states: ["Hokkaido","Aomori","Iwate","Miyagi","Akita","Yamagata","Fukushima","Ibaraki","Tochigi","Gunma","Saitama","Chiba","Tokyo","Kanagawa","Niigata","Toyama","Ishikawa","Fukui","Yamanashi","Nagano","Gifu","Shizuoka","Aichi","Mie","Shiga","Kyoto","Osaka","Hyogo","Nara","Wakayama","Tottori","Shimane","Okayama","Hiroshima","Yamaguchi","Tokushima","Kagawa","Ehime","Kochi","Fukuoka","Saga","Nagasaki","Kumamoto","Oita","Miyazaki","Kagoshima","Okinawa"] },
  "United States": { dial: "+1", states: ["California","New York","Texas","Washington","Massachusetts","Illinois","Florida"] },
  "United Kingdom": { dial: "+44", states: ["England","Scotland","Wales","Northern Ireland"] },
  Canada: { dial: "+1", states: ["Ontario","British Columbia","Quebec","Alberta"] },
  Australia: { dial: "+61", states: ["New South Wales","Victoria","Queensland","Western Australia"] },
  Bangladesh: { dial: "+880", states: ["Dhaka","Chittagong","Sylhet"] },
  Nepal: { dial: "+977", states: ["Bagmati","Gandaki","Koshi"] },
  Singapore: { dial: "+65", states: ["Singapore"] },
  "United Arab Emirates": { dial: "+971", states: ["Dubai","Abu Dhabi","Sharjah"] }
};

function localName(user) {
  return localStorage.getItem("wl-username-" + user.id) || "";
}

function localPhones(user) {
  return {
    personal_phone: localStorage.getItem("wl-personalphone-" + user.id) || "",
    family_phone: localStorage.getItem("wl-familyphone-" + user.id) || "",
    friend_phone: localStorage.getItem("wl-friendphone-" + user.id) || ""
  };
}

function localAddr(user) {
  return {
    country: localStorage.getItem("wl-country-" + user.id) || "",
    state: localStorage.getItem("wl-state-" + user.id) || ""
  };
}

function isComplete(p) {
  return !!(p && p.username);
}

async function loadProfile(user) {
  let remote = null;
  try {
    const { data } = await sb.from("profiles").select("username,email,personal_phone,family_phone,friend_phone,country,state").eq("id", user.id).maybeSingle();
    remote = data || null;
  } catch (_) {}
  const saved = localName(user);
  const phones = localPhones(user);
  const addr = localAddr(user);
  const merged = {
    username: (remote && remote.username) || saved || "",
    email: (remote && remote.email) || user.email,
    personal_phone: (remote && remote.personal_phone) || phones.personal_phone || "",
    family_phone: (remote && remote.family_phone) || phones.family_phone || "",
    friend_phone: (remote && remote.friend_phone) || phones.friend_phone || "",
    country: (remote && remote.country) || addr.country || "",
    state: (remote && remote.state) || addr.state || ""
  };
  return merged.username || merged.personal_phone || merged.family_phone ? merged : null;
}

document.getElementById("demoBtn")?.addEventListener("click", () => {
  sessionStorage.setItem("wl-mode", "demo");
});
document.getElementById("getStarted")?.addEventListener("click", () => {
  sessionStorage.setItem("wl-mode", "live");
});

async function boot() {
  if (typeof consumeAuthLink === "function") await consumeAuthLink(sb);
  const session = await currentSession(sb);
  const welcome = document.getElementById("welcome");
  const getStarted = document.getElementById("getStarted");
  const navDash = document.getElementById("navDash");
  const sheet = document.getElementById("userSheet");

  const demo = document.getElementById("demoBtn");
  function hideDemo() {
    if (!demo) return;
    demo.hidden = true;
    demo.setAttribute("hidden", "");
    demo.style.display = "none";
  }
  function showDemo() {
    if (!demo) return;
    demo.hidden = false;
    demo.removeAttribute("hidden");
    demo.style.display = "";
  }
  if (!session) {
    if (navDash) navDash.href = "login.html";
    showDemo();
    return;
  }

  sessionStorage.setItem("wl-mode", "live");
  if (navDash) navDash.href = "dashboard.html";
  hideDemo();
  const user = session.user;

  let profile = await loadProfile(user).catch(() => null);
  if (isComplete(profile)) {
    welcome.hidden = false;
    const nameA = welcome.querySelector(".welcome-name");
    if (nameA) nameA.textContent = profile.username;
    else welcome.textContent = "Welcome, " + profile.username;
    if (getStarted) {
      getStarted.href = "dashboard.html";
      getStarted.textContent = "Open dashboard";
    }
    return;
  }

  // No username yet (new sign-up, or a Google sign-in that has never set
  // one) — ask for just the username.
  const existingUsername = (profile && profile.username) || "";
  const addrSheet = document.getElementById("addrSheet");
  const closeAddrSheet = () => {
    if (!addrSheet) return;
    addrSheet.hidden = true;
    addrSheet.setAttribute("hidden", "");
  };
  document.getElementById("addrSheetClose")?.addEventListener("click", closeAddrSheet);

  if (existingUsername) document.getElementById("usernameInput").value = existingUsername;
  sheet.hidden = false;
  document.getElementById("userForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("usernameInput").value.trim();
    const usernameErr = document.getElementById("usernameErr");
    const saveErr = document.getElementById("saveErr");
    const btn = e.target.querySelector("button[type=submit]");
    [usernameErr, saveErr].forEach((el) => { if (el) el.textContent = ""; });

    const bad = typeof validUsername === "function" ? validUsername(name) : (!name || name.length < 3 ? "Enter a username." : "");
    if (bad) { if (usernameErr) usernameErr.textContent = bad; return; }

    function finish() {
      localStorage.setItem("wl-username-" + user.id, name);
      // Close the username popup and open the address reminder in its place.
      sheet.hidden = true;
      sheet.setAttribute("hidden", "");
      welcome.hidden = false;
      const nameEl = welcome.querySelector(".welcome-name");
      if (nameEl) nameEl.textContent = name;
      else welcome.textContent = "Welcome,\n" + name;
      if (getStarted) {
        getStarted.href = "dashboard.html";
        getStarted.textContent = "Open dashboard";
      }
      if (addrSheet) {
        addrSheet.hidden = false;
        addrSheet.removeAttribute("hidden");
      }
    }

    // Save the username to the account so it's waiting in the database the
    // moment this person logs in from another device. Other profile fields
    // (address, phones) are kept exactly as they were.
    async function persistUserState() {
      if (!sb) return { ok: false, error: "No Supabase client." };
      try {
        const { data: existing, error: readErr } = await sb.from("user_state").select("data").eq("id", user.id).maybeSingle();
        if (readErr) return { ok: false, error: readErr.message || "Could not read your saved data." };
        const base = (existing && existing.data) || {};
        const profileData = { ...(base.profile || {}) };
        profileData.username = name;
        profileData.email = user.email;
        const merged = { ...base, profile: profileData };
        const { error: writeErr } = await sb.from("user_state").upsert({
          id: user.id,
          data: merged,
          updated_at: new Date().toISOString()
        });
        if (writeErr) return { ok: false, error: writeErr.message || "Could not save your profile." };
        return { ok: true };
      } catch (err) {
        return { ok: false, error: (err && err.message) || "Unexpected error while saving." };
      }
    }

    if (btn) { btn.disabled = true; btn.textContent = "Saving..."; }
    if (!sb) {
      if (saveErr) saveErr.textContent = "Couldn't reach the server (Supabase failed to load). Check your connection and reload the page, then try again.";
      if (btn) { btn.disabled = false; btn.textContent = "Save"; }
      return;
    }
    try {
      const timed = (p) => Promise.race([
        p,
        new Promise((resolve) => setTimeout(() => resolve({ data: null, error: { message: "timeout" } }), 4000))
      ]);
      if (name.toLowerCase() !== existingUsername.toLowerCase()) {
        const rpc = await timed(sb.rpc("username_taken", { name }));
        if (rpc && rpc.data === true) {
          if (usernameErr) usernameErr.textContent = "That username is already taken.";
          if (btn) { btn.disabled = false; btn.textContent = "Save"; }
          return;
        }
      }
      const stateResult = await persistUserState();
      // If the database tables haven't been created yet (setup.sql not run),
      // don't block the sign-up: the username is kept on this device and
      // will sync once the tables exist.
      const tableMissing = !stateResult.ok && /schema cache|could not find the table|does not exist/i.test(stateResult.error || "");
      if (!stateResult.ok && !tableMissing) {
        if (saveErr) saveErr.textContent = "Couldn't save to the server (" + stateResult.error + "). Your entry is still here — check your connection and try again.";
        if (btn) { btn.disabled = false; btn.textContent = "Save"; }
        return;
      }
      // The profiles table is a secondary copy (used for the username-
      // uniqueness check). A failure here must never undo the save above.
      try {
        const saved = await timed(sb.from("profiles").upsert({
          id: user.id,
          email: user.email,
          username: name
        }));
        if (saved && saved.error && /duplicate|unique/i.test(saved.error.message || "")) {
          if (usernameErr) usernameErr.textContent = "That username is already taken.";
          if (btn) { btn.disabled = false; btn.textContent = "Save"; }
          return;
        }
      } catch (_) {}
    } catch (_) {}
    if (btn) { btn.disabled = false; btn.textContent = "Save"; }
    finish();
  });
}

boot();


(function homeUnlock() {
  if (!document.body.classList.contains("home-page")) return;
  const open = () => {
    document.body.classList.add("is-open");
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchmove", onWheel);
    window.removeEventListener("keydown", onKey);
  };
  const onWheel = (e) => {
    if (e.deltaY > 8 || e.type === "touchmove") open();
  };
  const onKey = (e) => {
    if (["ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) open();
  };
  window.addEventListener("wheel", onWheel, { passive: true });
  window.addEventListener("touchmove", onWheel, { passive: true });
  window.addEventListener("keydown", onKey);
  setTimeout(open, 14000);
})();
