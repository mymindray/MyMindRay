const sb = createSb();

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

function isComplete(p) {
  return !!(p && p.username && p.personal_phone && p.family_phone);
}

async function loadProfile(user) {
  let remote = null;
  try {
    const { data } = await sb.from("profiles").select("username,email,personal_phone,family_phone,friend_phone").eq("id", user.id).maybeSingle();
    remote = data || null;
  } catch (_) {}
  const saved = localName(user);
  const phones = localPhones(user);
  const merged = {
    username: (remote && remote.username) || saved || "",
    email: (remote && remote.email) || user.email,
    personal_phone: (remote && remote.personal_phone) || phones.personal_phone || "",
    family_phone: (remote && remote.family_phone) || phones.family_phone || "",
    friend_phone: (remote && remote.friend_phone) || phones.friend_phone || ""
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

  // Username or phone details are missing (new sign-up, or a Google
  // sign-in that has never filled this in) — ask for whatever is left,
  // pre-filling anything already on file.
  const existingUsername = (profile && profile.username) || "";
  if (profile) {
    if (profile.username) document.getElementById("usernameInput").value = profile.username;
    if (profile.personal_phone) document.getElementById("personalPhoneInput").value = profile.personal_phone;
    if (profile.family_phone) document.getElementById("familyPhoneInput").value = profile.family_phone;
    if (profile.friend_phone) document.getElementById("friendPhoneInput").value = profile.friend_phone;
  }
  sheet.hidden = false;
  document.getElementById("userForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("usernameInput").value.trim();
    const personalPhone = document.getElementById("personalPhoneInput").value.trim();
    const familyPhone = document.getElementById("familyPhoneInput").value.trim();
    const friendPhone = document.getElementById("friendPhoneInput").value.trim();
    const err = document.getElementById("userErr");
    const btn = e.target.querySelector("button[type=submit]");
    err.textContent = "";

    const bad = typeof validUsername === "function" ? validUsername(name) : (!name || name.length < 3 ? "Enter a username." : "");
    if (bad) { err.textContent = bad; return; }

    const phoneErr =
      (typeof validPhone === "function" && validPhone(personalPhone, "your phone number", true)) ||
      (typeof validPhone === "function" && validPhone(familyPhone, "a family member's phone number", true)) ||
      (typeof validPhone === "function" && validPhone(friendPhone, "the friend's/warden's phone number", false));
    if (phoneErr) { err.textContent = phoneErr; return; }

    const norm = typeof normalizePhone === "function" ? normalizePhone : (v) => (v || "").replace(/[^0-9]/g, "");
    const numbers = [norm(personalPhone), norm(familyPhone), norm(friendPhone)].filter(Boolean);
    const clash = document.getElementById("phoneClashErr");
    if (clash) clash.textContent = "";
    if (new Set(numbers).size !== numbers.length) {
      const msg = "Do not enter the same number in more than one field. Each number must be different.";
      err.textContent = msg;
      if (clash) clash.textContent = msg;
      return;
    }

    function finish() {
      localStorage.setItem("wl-username-" + user.id, name);
      localStorage.setItem("wl-personalphone-" + user.id, personalPhone);
      localStorage.setItem("wl-familyphone-" + user.id, familyPhone);
      if (friendPhone) localStorage.setItem("wl-friendphone-" + user.id, friendPhone);
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
            err.textContent = "Username already taken.";
            if (btn) { btn.disabled = false; btn.textContent = "Save & continue"; }
            return;
          }
        }
        const saved = await timed(sb.from("profiles").upsert({
          id: user.id,
          email: user.email,
          username: name,
          personal_phone: personalPhone,
          family_phone: familyPhone,
          friend_phone: friendPhone || null
        }));
        if (saved && saved.error && /duplicate|unique/i.test(saved.error.message || "")) {
          err.textContent = "Username already taken.";
          if (btn) { btn.disabled = false; btn.textContent = "Save & continue"; }
          return;
        }
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
