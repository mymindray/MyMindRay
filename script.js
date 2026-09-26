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
  return !!(p && p.username && p.personal_phone && p.family_phone && p.country && p.state);
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

  // Username, address, or phone details are missing (new sign-up, or a
  // Google sign-in that has never filled this in) — ask for whatever is
  // left, pre-filling anything already on file.
  const existingUsername = (profile && profile.username) || "";

  const countrySelect = document.getElementById("addrCountrySelect");
  const stateSelect = document.getElementById("addrStateSelect");
  const dialChips = [
    document.getElementById("dialPersonal"),
    document.getElementById("dialFamily"),
    document.getElementById("dialFriend")
  ];
  const opt = (val) => `<option value="${val}">${val}</option>`;
  const countryNames = Object.keys(COUNTRY_DATA);
  if (countrySelect) countrySelect.innerHTML = countryNames.map(opt).join("");
  function fillStates(country, selected) {
    const list = (COUNTRY_DATA[country] && COUNTRY_DATA[country].states) || [];
    if (stateSelect) stateSelect.innerHTML = list.map(opt).join("");
    if (stateSelect && selected && list.includes(selected)) stateSelect.value = selected;
  }
  function updateDialChips() {
    const dial = (COUNTRY_DATA[countrySelect?.value] && COUNTRY_DATA[countrySelect.value].dial) || "";
    dialChips.forEach((chip) => { if (chip) chip.textContent = dial; });
  }
  const startCountry = (profile && countryNames.includes(profile.country)) ? profile.country : countryNames[0];
  if (countrySelect) countrySelect.value = startCountry;
  fillStates(startCountry, profile && profile.state);
  updateDialChips();
  countrySelect?.addEventListener("change", () => {
    fillStates(countrySelect.value);
    updateDialChips();
  });

  const stripDial = (v) => (v || "").replace(/^\+\d+\s*/, "");
  if (profile) {
    if (profile.username) document.getElementById("usernameInput").value = profile.username;
    if (profile.personal_phone) document.getElementById("personalPhoneInput").value = stripDial(profile.personal_phone);
    if (profile.family_phone) document.getElementById("familyPhoneInput").value = stripDial(profile.family_phone);
    if (profile.friend_phone) document.getElementById("friendPhoneInput").value = stripDial(profile.friend_phone);
  }
  sheet.hidden = false;
  document.getElementById("userForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("usernameInput").value.trim();
    const personalPhone = document.getElementById("personalPhoneInput").value.trim();
    const familyPhone = document.getElementById("familyPhoneInput").value.trim();
    const friendPhone = document.getElementById("friendPhoneInput").value.trim();
    const country = countrySelect ? countrySelect.value : "";
    const stateVal = stateSelect ? stateSelect.value : "";
    const dial = (COUNTRY_DATA[country] && COUNTRY_DATA[country].dial) || "";
    const usernameErr = document.getElementById("usernameErr");
    const addrErr = document.getElementById("addrErr");
    const personalErr = document.getElementById("personalPhoneErr");
    const familyErr = document.getElementById("familyPhoneErr");
    const friendErr = document.getElementById("friendPhoneErr");
    const allErrs = [usernameErr, addrErr, personalErr, familyErr, friendErr];
    const btn = e.target.querySelector("button[type=submit]");
    allErrs.forEach((el) => { if (el) el.textContent = ""; });

    let hasError = false;
    const bad = typeof validUsername === "function" ? validUsername(name) : (!name || name.length < 3 ? "Enter a username." : "");
    if (bad) { if (usernameErr) usernameErr.textContent = bad; hasError = true; }

    if (!country || !stateVal) {
      if (addrErr) addrErr.textContent = "Select your country and state.";
      hasError = true;
    }

    const personalPhoneErr = typeof validPhone === "function" ? validPhone(personalPhone, "your phone number", true) : "";
    if (personalPhoneErr) { if (personalErr) personalErr.textContent = personalPhoneErr; hasError = true; }
    const familyPhoneErr = typeof validPhone === "function" ? validPhone(familyPhone, "a family member's phone number", true) : "";
    if (familyPhoneErr) { if (familyErr) familyErr.textContent = familyPhoneErr; hasError = true; }
    const friendPhoneErr = typeof validPhone === "function" ? validPhone(friendPhone, "the friend's/warden's phone number", false) : "";
    if (friendPhoneErr) { if (friendErr) friendErr.textContent = friendPhoneErr; hasError = true; }
    if (hasError) return;

    // Flag duplicate numbers under every field that shares the value, not
    // just one shared message at the bottom.
    const norm = typeof normalizePhone === "function" ? normalizePhone : (v) => (v || "").replace(/[^0-9]/g, "");
    const entries = [
      { key: "personal", el: personalErr, val: norm(personalPhone) },
      { key: "family", el: familyErr, val: norm(familyPhone) },
      { key: "friend", el: friendErr, val: norm(friendPhone) }
    ].filter((it) => it.val);
    const clashMsg = "Don't use this number in more than one field — each number must be different.";
    let clashed = false;
    entries.forEach((it, i) => {
      const dupe = entries.some((other, j) => j !== i && other.val === it.val);
      if (dupe && it.el) { it.el.textContent = clashMsg; clashed = true; }
    });
    if (clashed) return;

    // Store numbers with the dial code that matches the chosen address.
    const fullPersonal = dial ? `${dial} ${personalPhone}` : personalPhone;
    const fullFamily = dial ? `${dial} ${familyPhone}` : familyPhone;
    const fullFriend = friendPhone ? (dial ? `${dial} ${friendPhone}` : friendPhone) : "";
    const address = [country, stateVal].filter(Boolean).join(", ");

    function finish() {
      localStorage.setItem("wl-username-" + user.id, name);
      localStorage.setItem("wl-personalphone-" + user.id, fullPersonal);
      localStorage.setItem("wl-familyphone-" + user.id, fullFamily);
      if (fullFriend) localStorage.setItem("wl-friendphone-" + user.id, fullFriend);
      localStorage.setItem("wl-country-" + user.id, country);
      localStorage.setItem("wl-state-" + user.id, stateVal);
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
    }

    // Save everything about the account — not just the username — so it's
    // waiting in the database the moment this person logs in from another
    // device or the web.
    async function persistUserState() {
      if (!sb) return;
      try {
        const { data: existing } = await sb.from("user_state").select("data").eq("id", user.id).maybeSingle();
        const base = (existing && existing.data) || {};
        const profileData = { ...(base.profile || {}) };
        profileData.username = name;
        profileData.email = user.email;
        profileData.personalPhone = fullPersonal;
        profileData.familyPhone = fullFamily;
        profileData.friendPhone = fullFriend;
        profileData.country = country;
        profileData.state = stateVal;
        profileData.address = address;
        const merged = { ...base, profile: profileData };
        await sb.from("user_state").upsert({
          id: user.id,
          data: merged,
          updated_at: new Date().toISOString()
        });
      } catch (_) {}
    }

    if (btn) { btn.disabled = true; btn.textContent = "Saving..."; }
    try {
      if (sb) {
        const timed = (p) => Promise.race([
          p,
          new Promise((resolve) => setTimeout(() => resolve({ data: null, error: { message: "timeout" } }), 4000))
        ]);
        const usernameChanged = name.toLowerCase() !== existingUsername.toLowerCase();
        if (usernameChanged) {
          const rpc = await timed(sb.rpc("username_taken", { name }));
          if (rpc && rpc.data === true) {
            if (usernameErr) usernameErr.textContent = "That username is already taken.";
            if (btn) { btn.disabled = false; btn.textContent = "Save & continue"; }
            return;
          }
        }
        const saved = await timed(sb.from("profiles").upsert({
          id: user.id,
          email: user.email,
          username: name,
          personal_phone: fullPersonal,
          family_phone: fullFamily,
          friend_phone: fullFriend || null,
          country,
          state: stateVal
        }));
        if (saved && saved.error && /duplicate|unique/i.test(saved.error.message || "")) {
          if (usernameErr) usernameErr.textContent = "That username is already taken.";
          if (btn) { btn.disabled = false; btn.textContent = "Save & continue"; }
          return;
        }
        await persistUserState();
      }
    } catch (_) {}
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
