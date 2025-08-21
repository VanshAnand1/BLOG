const cors = require("cors");

const allowedList = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedSet = new Set(allowedList);

// Decide if the request Origin is allowed
function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true); // curl/postman or same-origin

  try {
    const { hostname } = new URL(origin);
    // Allow all Cloudflare Pages preview/prod domains
    if (hostname.endsWith(".pages.dev")) return callback(null, true);
    // (Add other host-wide allowances, e.g. Koyeb custom domain)
  } catch {
    // fall through to explicit list
  }

  return callback(null, allowedSet.has(origin));
}

module.exports = cors({
  origin: corsOrigin,
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
