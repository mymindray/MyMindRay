const SUPABASE_URL = "https://lnkekzeiajnslleiofgr.supabase.co";
const SUPABASE_KEY = "sb_publishable_xja2ivlLZzNDOUCWwPGi_Q_Z9otHmRf";

function createSb() {
  if (!window.supabase) return null;
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce"
    }
  });
}

function siteHome() {
  const folder = location.href.replace(/[^/]*$/, "");
  return folder + "index.html";
}

async function consumeAuthLink(sb) {
  if (!sb) return null;
  const href = location.href;
  if (!/[?&#](code|access_token)=/.test(href)) return null;
  try {
    const { data, error } = await sb.auth.exchangeCodeForSession(href);
    if (error) {
      const { data: sess } = await sb.auth.getSession();
      return sess.session || null;
    }
    history.replaceState({}, "", location.pathname);
    return data.session || null;
  } catch {
    return null;
  }
}

async function currentSession(sb) {
  if (!sb) return null;
  try {
    const fromLink = await consumeAuthLink(sb);
    if (fromLink) return fromLink;
    const result = await Promise.race([
      sb.auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 12000))
    ]);
    return result.data.session || null;
  } catch {
    return null;
  }
}

const CURRENCY_SYMBOLS = /[€¥¢£₹₩₽₺₫₪₴₦₱฿₡₲₵₸₮₭₯]/;

function validPassword(pw) {
  if (!pw || pw.length < 8) return "Use at least 8 characters.";
  if (pw.length > 64) return "Password is too long.";
  if (/\s/.test(pw)) return "Spaces are not allowed in the password.";
  if (CURRENCY_SYMBOLS.test(pw)) return "Currency symbols (€, ¥, ¢, £, etc.) are not allowed.";
  if (!/^[\x20-\x7E]*$/.test(pw)) return "Use standard English letters, numbers, and symbols only.";
  if (!/[A-Za-z]/.test(pw)) return "Add at least one letter.";
  if (!/[0-9]/.test(pw)) return "Add at least one number.";
  return "";
}

function validUsername(name) {
  const n = (name || "").trim();
  if (n.length < 3) return "Username must be at least 3 characters.";
  if (n.length > 20) return "Username must be 20 characters or less.";
  if (!/^[A-Za-z0-9_]+$/.test(n)) return "Use letters, numbers, or underscore only.";
  return "";
}

function normalizePhone(num) {
  return (num || "").replace(/[^0-9]/g, "");
}

function validPhone(num, label, required) {
  const digits = normalizePhone(num);
  if (!digits) return required ? `Enter ${label}.` : "";
  if (digits.length < 7 || digits.length > 15) return `${label} should be 7–15 digits.`;
  return "";
}
