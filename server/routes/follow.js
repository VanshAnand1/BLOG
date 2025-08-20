const express = require("express");
const db = require("../db");
const { authRequired } = require("../middleware/auth");
const router = express.Router();

// Follow
router.post("/follow/:username", authRequired, async (req, res) => {
  const me = req.user.user_id;
  const username = (req.params.username || "").trim();
  try {
    const [[u]] = await db.execute(
      "SELECT user_id FROM users WHERE LOWER(username)=LOWER(?) LIMIT 1",
      [username]
    );
    if (!u) return res.status(404).json({ error: "User not found" });
    if (u.user_id === me)
      return res.status(400).json({ error: "Cannot follow yourself" });

    const [r] = await db.execute(
      "INSERT IGNORE INTO friends (`user`, `friend`) VALUES (?, ?)",
      [me, u.user_id]
    );
    res.status(r.affectedRows ? 201 : 200).json({ ok: true });
  } catch (err) {
    console.error("POST /follow/:username ERROR:", err?.sqlMessage || err);
    res.status(500).json({ error: "server error" });
  }
});

// Unfollow
router.delete("/follow/:username", authRequired, async (req, res) => {
  const me = req.user.user_id;
  const username = (req.params.username || "").trim();
  try {
    const [[u]] = await db.execute(
      "SELECT user_id FROM users WHERE LOWER(username)=LOWER(?) LIMIT 1",
      [username]
    );
    if (!u) return res.status(404).json({ error: "User not found" });
    await db.execute("DELETE FROM friends WHERE `user`=? AND `friend`=?", [
      me,
      u.user_id,
    ]);
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /follow/:username ERROR:", err?.sqlMessage || err);
    res.status(500).json({ error: "server error" });
  }
});

// Remove a follower (kick)
router.delete("/followers/:username", authRequired, async (req, res) => {
  const me = req.user.user_id;
  const username = (req.params.username || "").trim();
  try {
    const [[u]] = await db.execute(
      "SELECT user_id FROM users WHERE LOWER(username)=LOWER(?) LIMIT 1",
      [username]
    );
    if (!u) return res.status(404).json({ error: "User not found" });
    const [r] = await db.execute(
      "DELETE FROM friends WHERE `user`=? AND `friend`=?",
      [u.user_id, me]
    );
    res.json({ ok: true, removed: r.affectedRows > 0 });
  } catch (err) {
    console.error("DELETE /followers/:username ERROR:", err?.sqlMessage || err);
    res.status(500).json({ error: "server error" });
  }
});

// Do I follow :username?
router.get("/follow/:username/status", authRequired, async (req, res) => {
  const me = req.user.user_id;
  const username = (req.params.username || "").trim();
  try {
    const [[u]] = await db.execute(
      "SELECT user_id FROM users WHERE LOWER(username)=LOWER(?) LIMIT 1",
      [username]
    );
    if (!u) return res.json({ following: false });
    const [[row]] = await db.execute(
      "SELECT friend_id FROM friends WHERE `user`=? AND `friend`=? LIMIT 1",
      [me, u.user_id]
    );
    res.json({ following: !!row });
  } catch (err) {
    console.error(
      "GET /follow/:username/status ERROR:",
      err?.sqlMessage || err
    );
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
