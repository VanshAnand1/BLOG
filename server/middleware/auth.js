// server/middleware/auth.js
const jwt = require("jsonwebtoken");

const COOKIE_NAME = process.env.COOKIE_NAME || "access";
const isProd = process.env.NODE_ENV === "production";

function cookieOptions(ms) {
  const opts = {
    httpOnly: true,
    sameSite: isProd ? "None" : "Lax",
    secure: isProd,
    maxAge: ms,
    path: "/",
  };
  if (process.env.COOKIE_DOMAIN) opts.domain = process.env.COOKIE_DOMAIN;
  return opts;
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.user_id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function authRequired(req, res, next) {
  const hdr = req.headers.authorization || "";
  const bearer = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  const token = req.cookies?.[COOKIE_NAME] || bearer;

  if (!token) return res.status(401).json({ error: "not authenticated" });

  try {
    const payload = verifyAccessToken(token);
    req.user = { user_id: payload.sub, username: payload.username };
    next();
  } catch {
    return res.status(401).json({ error: "invalid or expired token" });
  }
}

module.exports = {
  authRequired,
  signAccessToken,
  verifyAccessToken,
  cookieOptions,
  COOKIE_NAME,
};
