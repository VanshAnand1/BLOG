const express = require("express");
const { sg } = require("../db");
const { authRequired } = require("../middleware/auth");
const router = express.Router();

// Follow
router.post("/follow/:username", authRequired, async (req, res) => {
  const me = req.user.user_id;
  const username = (req.params.username || "").trim();

  try {
    const { rows: users } = await sg`
      SELECT user_id
      FROM users
      WHERE LOWER(username) = LOWER(${username})
      LIMIT 1
    `;
    const u = users[0];
    if (!u) return res.status(404).json({ error: "User not found" });
    if (u.user_id === me)
      return res.status(400).json({ error: "Cannot follow yourself" });

    // INSERT IGNORE -> ON CONFLICT DO NOTHING (requires unique index on ("user","friend"))
    const insertRes = await sg`
      INSERT INTO friends ("user", "friend")
      VALUES (${me}, ${u.user_id})
      ON CONFLICT ("user", "friend") DO NOTHING
    `;

    res.status(insertRes.rowCount ? 201 : 200).json({ ok: true });
  } catch (err) {
    console.error("POST /follow/:username ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

// Unfollow
router.delete("/follow/:username", authRequired, async (req, res) => {
  const me = req.user.user_id;
  const username = (req.params.username || "").trim();

  try {
    const { rows: users } = await sg`
      SELECT user_id
      FROM users
      WHERE LOWER(username) = LOWER(${username})
      LIMIT 1
    `;
    const u = users[0];
    if (!u) return res.status(404).json({ error: "User not found" });

    await sg`DELETE FROM friends WHERE "user" = ${me} AND "friend" = ${u.user_id}`;
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /follow/:username ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

// Remove a follower (kick)
router.delete("/followers/:username", authRequired, async (req, res) => {
  const me = req.user.user_id;
  const username = (req.params.username || "").trim();

  try {
    const { rows: users } = await sg`
      SELECT user_id
      FROM users
      WHERE LOWER(username) = LOWER(${username})
      LIMIT 1
    `;
    const u = users[0];
    if (!u) return res.status(404).json({ error: "User not found" });

    const del = await sg`
      DELETE FROM friends
      WHERE "user" = ${u.user_id} AND "friend" = ${me}
    `;
    res.json({ ok: true, removed: del.rowCount > 0 });
  } catch (err) {
    console.error("DELETE /followers/:username ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

// Do I follow :username?
router.get("/follow/:username/status", authRequired, async (req, res) => {
  const me = req.user.user_id;
  const username = (req.params.username || "").trim();

  try {
    const { rows: users } = await sg`
      SELECT user_id
      FROM users
      WHERE LOWER(username) = LOWER(${username})
      LIMIT 1
    `;
    const u = users[0];
    if (!u) return res.json({ following: false });

    const { rows } = await sg`
      SELECT friend_id
      FROM friends
      WHERE "user" = ${me} AND "friend" = ${u.user_id}
      LIMIT 1
    `;
    res.json({ following: rows.length > 0 });
  } catch (err) {
    console.error("GET /follow/:username/status ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
