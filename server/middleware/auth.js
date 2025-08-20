const jwt = require("jsonwebtoken");

const COOKIE_NAME = process.env.COOKIE_NAME || "access";
const isProd = process.env.NODE_ENV === "production";

function cookieOptions(ms) {
  return {
    httpOnly: true,
    sameSite: isProd ? "None" : "Lax",
    secure: isProd,
    maxAge: ms,
    path: "/",
  };
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.user_id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

function authRequired(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "not authenticated" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { user_id: payload.sub, username: payload.username };
    next();
  } catch {
    return res.status(401).json({ error: "invalid or expired token" });
  }
}

module.exports = { authRequired, signAccessToken, cookieOptions, COOKIE_NAME };
