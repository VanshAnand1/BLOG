const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const {
  authRequired,
  signAccessToken,
  cookieOptions,
  COOKIE_NAME,
} = require("../middleware/auth");
const { rejectProfaneUsername } = require("../utils/profanity"); // <- only this
const router = express.Router();

router.post("/signup", rejectProfaneUsername(), async (req, res) => {
  // <- add middleware
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username and password are required" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashed]
    );
    res.status(201).json({ insertedId: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "username already exists" });
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: "could not register user" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username and password are required" });
    }
    const [[user]] = await db.execute(
      "SELECT user_id, username, password FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    if (!user) return res.status(401).json({ error: "invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = signAccessToken(user);
    res.cookie(COOKIE_NAME, token, cookieOptions(15 * 60 * 1000));
    res.json({ user_id: user.user_id, username: user.username });
  } catch (err) {
    console.error("SIGNIN ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/me", authRequired, (req, res) => {
  res.json({ user_id: req.user.user_id, username: req.user.username });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out" });
});

module.exports = router;
