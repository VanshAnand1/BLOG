// utils/profanity.js
const leo = require("leo-profanity");

// English dictionary
leo.loadDictionary("en");

// Adjust the default list (restore common false-positives, etc.)
leo.remove([
  "ass",
  "arsehole",
  "apeshit",
  "asshole",
  "bastard",
  "butt",
  "bollocks",
  "domination",
  "dominatrix",
  "dingleberries",
  "dingleberry",
  "fecal",
  "honkey",
  "kinky",
  "nude",
  "nudity",
  "shit",
  "shithead",
  "tushy",
  "yaoi",
  "wank",
  "suck",
  "sucks",
  "fuck",
  "fucked",
  "fuckin",
  "fucking",
  "motherfucker",
  "poopchute",
]);

// --- Helpers -----------------------------------------------------------------

// Normalize text for stricter checks: lowercase, strip diacritics, map leetspeak.
// This is used for checking only (we don't mutate the user's original content).
function normalizeForCheck(text = "") {
  const s = String(text)
    .toLowerCase()
    // normalize diacritics (e.g., fück -> fuck)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

  // map common leetspeak to letters
  const map = {
    "@": "a",
    4: "a",
    3: "e",
    1: "i",
    "!": "i",
    "|": "i",
    0: "o",
    $: "s",
    5: "s",
    7: "t",
    "+": "t",
    8: "b",
    9: "g",
    6: "g",
  };

  // replace char-by-char
  let out = "";
  for (const ch of s) out += map[ch] || ch;

  // collapse runs of separators to a single space to avoid "f _ u _ c _ k"
  out = out.replace(/[^a-z0-9]+/g, " ").trim();
  return out;
}

// Stricter boolean check using both raw and normalized forms
function isProfaneStrict(text = "") {
  const raw = String(text);
  if (!raw) return false;
  if (leo.check(raw)) return true;
  const norm = normalizeForCheck(raw);
  return norm && norm !== raw && leo.check(norm);
}

// --- Public API --------------------------------------------------------------

// Masks whole profane words with asterisks (uses original text to preserve shape)
function censor(text = "") {
  return leo.clean(String(text), "*");
}

// Express middleware: overwrite req.body[field] with censored version
function maskProfanityBody(field = "text") {
  return (req, _res, next) => {
    if (req.body && typeof req.body[field] !== "undefined") {
      req.body[field] = censor(req.body[field]);
    }
    next();
  };
}

// Reject the username if it trips the strict profanity check
function rejectProfaneUsername() {
  return (req, res, next) => {
    const username = (req.body?.username ?? "").toString();
    if (!username) return next(); // let your normal "required" check handle empties
    if (isProfaneStrict(username)) {
      return res
        .status(400)
        .json({ error: "Inappropriate username. Please choose another." });
    }
    next();
  };
}

module.exports = {
  censor,
  maskProfanityBody,
  rejectProfaneUsername,

  // exported for testing/optional use
  normalizeForCheck,
  isProfaneStrict,
};
