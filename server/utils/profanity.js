const leo = require("leo-profanity");

// English dictionary
leo.loadDictionary("en");

// extend or shorten list
// leo.add(["more words", "variants", "bad words :("]);
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

function censor(text = "") {
  // masks whole profane words with asterisks
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

// Reject the username
function rejectProfaneUsername() {
  return (req, res, next) => {
    const username = (req.body?.username ?? "").toString();
    if (!username) return next(); // let your normal "required" check handle empties
    if (leo.check(username)) {
      return res
        .status(400)
        .json({ error: "Inappropriate username. Please choose another." });
    }
    next();
  };
}

module.exports = { censor, maskProfanityBody, rejectProfaneUsername };
