const cors = require("cors");

// Comma-separated exact origins, e.g. "http://localhost:3000,https://app.example.com"
const allowedList = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedSet = new Set(allowedList);

// Comma-separated host suffixes to allow all subdomains, defaults to Cloudflare Pages
// e.g. ".pages.dev,.example.com"
const suffixList = (process.env.ALLOWED_HOST_SUFFIXES || ".pages.dev")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedBySuffix(hostname = "") {
  return suffixList.some((suf) => hostname.endsWith(suf));
}

// Decide if the request Origin is allowed
function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true); // curl/postman or same-origin

  try {
    const { hostname } = new URL(origin);
    // Allow all configured wildcard host suffixes (incl. *.pages.dev by default)
    if (isAllowedBySuffix(hostname)) return callback(null, true);
  } catch {
    // fall through to explicit list
  }

  // Optionally allow "null" origins (file://, sandboxed iframes) via env
  if (origin === "null" && process.env.ALLOW_NULL_ORIGIN === "true") {
    return callback(null, true);
  }

  // Exact-origin allowlist
  return callback(null, allowedSet.has(origin));
}

module.exports = cors({
  origin: corsOrigin,
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PATCH", "DELETE", "OPTIONS"],
  // Omit allowedHeaders so cors reflects Access-Control-Request-Headers automatically.
  optionsSuccessStatus: 204,
});
