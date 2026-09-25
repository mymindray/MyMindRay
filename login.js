const sb = createSb();
let mode = "login";

const title = document.getElementById("formTitle");
const lead = document.getElementById("formLead");
const submitBtn = document.getElementById("submitBtn");
const switchLine = document.getElementById("switchLine");
const err = document.getElementById("authErr");
const ok = document.getElementById("authOk");
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");

function showOk(html) {
  err.textContent = "";
  ok.innerHTML = html;
  ok.hidden = false;
}
function clearOk() {
  ok.hidden = true;
  ok.innerHTML = "";
}
function showErr(text) {
  clearOk();
  err.textContent = text;
}

async function resendConfirmation(email) {
  if (!sb) return;
  const { error } = await sb.auth.resend({ type: "signup", email, options: { emailRedirectTo: siteHome() } });
  showOk(error ? "Could not resend right now. Try again shortly." : `Confirmation email resent to ${email}. Check your inbox (and spam folder).`);
}

function paintMode() {
  const login = mode === "login";
  title.textContent = login ? "Log in" : "Create account";
  lead.textContent = login
    ? "Use your email or continue with Google."
    : "Create an account with email and a strong password.";
  submitBtn.textContent = login ? "Log in" : "Create account";
  switchLine.innerHTML = login
    ? 'Don\'t have an account? <button type="button" id="switchBtn">Sign up</button>'
    : 'Already have an account? <button type="button" id="switchBtn">Log in</button>';
  document.getElementById("switchBtn").addEventListener("click", flip);
  syncSubmit();
}

function flip() {
  mode = mode === "login" ? "signup" : "login";
  err.textContent = "";
  clearOk();
  paintMode();
}

function syncSubmit() {
  const ready = emailEl.value.trim() && passEl.value;
  submitBtn.disabled = !ready;
  submitBtn.classList.toggle("on", !!ready);
}

function friendlyAuth(error) {
  const msg = (error && error.message) || "";
  const low = msg.toLowerCase();
  if (low.includes("not confirmed")) return "Your account is created, but the email is not confirmed yet. Open the confirmation link we sent you, then log in.";
  if (low.includes("already registered") || low.includes("already been registered") || low.includes("already exists")) return "An account with that email already exists. Log in instead, or use \"Forgot password\" if you don't remember it.";
  if (low.includes("invalid login") || low.includes("invalid credentials")) return "That email and password don't match an account. Check for typos, or sign up if you don't have an account yet.";
  if (low.includes("confirm")) return "Account is created. Open the confirmation email, then log in.";
  return msg || "Could not finish that just now. Try again.";
}

document.getElementById("switchBtn")?.addEventListener("click", flip);
emailEl.addEventListener("input", syncSubmit);
passEl.addEventListener("input", syncSubmit);
syncSubmit();

currentSession(sb).then((session) => {
  if (session) location.replace("index.html");
});

document.getElementById("googleBtn").addEventListener("click", async () => {
  err.textContent = "";
  if (!sb) {
    err.textContent = "Sign-in is not ready. Check your internet and try again.";
    return;
  }
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: siteHome(),
      queryParams: { prompt: "select_account" }
    }
  });
  if (error) err.textContent = friendlyAuth(error);
});

sb?.auth.onAuthStateChange((event, session) => {
  if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
    if (location.search.includes("code=") || event === "SIGNED_IN") {
      location.replace("index.html");
    }
  }
});

document.getElementById("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailEl.value.trim();
  const password = passEl.value;
  err.textContent = "";
  clearOk();
  if (!email || !password) {
    showErr("Enter your email and password.");
    return;
  }
  if (mode === "signup") {
    const bad = validPassword(password);
    if (bad) { showErr(bad); return; }
  }
  submitBtn.disabled = true;
  try {
    if (mode === "signup") {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: siteHome() }
      });
      if (error) {
        showErr(friendlyAuth(error));
        submitBtn.disabled = false;
        syncSubmit();
        return;
      }
      if (data.session) {
        showOk("Account created. Taking you in...");
        location.replace("index.html");
        return;
      }
      // Supabase returns a fake "success" with no error, and an empty identities
      // array, when the email is already registered — this masks the duplicate
      // to prevent account enumeration. Detect it and tell the person clearly.
      const alreadyExists = data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;
      if (alreadyExists) {
        mode = "login";
        paintMode();
        showErr("An account with that email already exists. Log in with your existing password, or check your inbox if you never confirmed it.");
        submitBtn.disabled = false;
        syncSubmit();
        return;
      }
      const attempt = await sb.auth.signInWithPassword({ email, password });
      if (attempt.data && attempt.data.session) {
        showOk("Account created. Taking you in...");
        location.replace("index.html");
        return;
      }
      mode = "login";
      paintMode();
      showOk(`Account created for ${email}. We sent a confirmation link to that inbox — open it, then log in here with the same password.`);
      submitBtn.disabled = false;
      syncSubmit();
      return;
    }
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      showErr(friendlyAuth(error || { message: "Email or password is not correct." }));
      if (error && /invalid login|invalid credentials/i.test(error.message || "")) {
        const hint = document.createElement("p");
        hint.className = "ok";
        hint.innerHTML = `If you just signed up, this can mean the email isn't confirmed yet. <button type="button" class="linklike" id="resendBtn">Resend confirmation email</button>`;
        err.after(hint);
        hint.querySelector("#resendBtn").onclick = () => { hint.remove(); resendConfirmation(email); };
      }
      submitBtn.disabled = false;
      syncSubmit();
      return;
    }
    location.replace("index.html");
  } catch (ex) {
    showErr("Could not finish that just now. Try again.");
    submitBtn.disabled = false;
    syncSubmit();
  }
});
