const express = require("express");
const { sg } = require("../db");
const router = express.Router();

// Specific before param route
router.get("/users/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);
  try {
    const { rows } = await sg`
      SELECT user_id AS id, username
      FROM users
      WHERE username ILIKE '%' || ${q} || '%'
      ORDER BY username ASC
      LIMIT 100
    `;
    res.json(rows);
  } catch (err) {
    console.error("GET /users/search ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/users/:username", async (req, res) => {
  const username = (req.params.username || "").trim();
  try {
    const { rows } = await sg`
      SELECT user_id AS id, username
      FROM users
      WHERE LOWER(username) = LOWER(${username})
      LIMIT 1
    `;
    const u = rows[0];
    if (!u) return res.status(404).json({ error: "User not found" });
    res.json(u);
  } catch (err) {
    console.error("GET /users/:username ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/users/:username/posts", async (req, res) => {
  const username = (req.params.username || "").trim();
  try {
    const uRes = await sg`
      SELECT user_id
      FROM users
      WHERE LOWER(username) = LOWER(${username})
      LIMIT 1
    `;
    const u = uRes.rows[0];
    if (!u) return res.status(404).json({ error: "User not found" });

    const { rows } = await sg`
      SELECT
        p.post_id AS id,
        u.username AS author,
        p.post AS text,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt"
      FROM posts p
      JOIN users u ON u.user_id = p.post_author
      WHERE p.post_author = ${u.user_id}
      ORDER BY COALESCE(p.updated_at, p.created_at) DESC
    `;
    res.json(rows);
  } catch (err) {
    console.error("GET /users/:username/posts ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

// Followers / Following lists
router.get("/users/:username/followers", async (req, res) => {
  const username = (req.params.username || "").trim();
  try {
    const uRes = await sg`
      SELECT user_id
      FROM users
      WHERE LOWER(username) = LOWER(${username})
      LIMIT 1
    `;
    const u = uRes.rows[0];
    if (!u) return res.status(404).json({ error: "User not found" });

    const { rows } = await sg`
      SELECT f."user" AS id, us.username
      FROM friends f
      JOIN users us ON us.user_id = f."user"
      WHERE f."friend" = ${u.user_id}
      ORDER BY us.username ASC
    `;
    res.json(rows);
  } catch (err) {
    console.error("GET /users/:username/followers ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/users/:username/following", async (req, res) => {
  const username = (req.params.username || "").trim();
  try {
    const uRes = await sg`
      SELECT user_id
      FROM users
      WHERE LOWER(username) = LOWER(${username})
      LIMIT 1
    `;
    const u = uRes.rows[0];
    if (!u) return res.status(404).json({ error: "User not found" });

    const { rows } = await sg`
      SELECT f."friend" AS id, us.username
      FROM friends f
      JOIN users us ON us.user_id = f."friend"
      WHERE f."user" = ${u.user_id}
      ORDER BY us.username ASC
    `;
    res.json(rows);
  } catch (err) {
    console.error("GET /users/:username/following ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
