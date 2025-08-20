const express = require("express");
const db = require("../db");
const router = express.Router();

// Specific before param route
router.get("/users/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);
  try {
    const [rows] = await db.execute(
      `SELECT user_id AS id, username
         FROM users
        WHERE LOWER(username) LIKE CONCAT('%', LOWER(?), '%')
        ORDER BY username ASC
        LIMIT 100`,
      [q]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /users/search ERROR:", err?.sqlMessage || err);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/users/:username", async (req, res) => {
  const username = (req.params.username || "").trim();
  try {
    const [[u]] = await db.execute(
      "SELECT user_id AS id, username FROM users WHERE LOWER(username)=LOWER(?) LIMIT 1",
      [username]
    );
    if (!u) return res.status(404).json({ error: "User not found" });
    res.json(u);
  } catch (err) {
    console.error("GET /users/:username ERROR:", err?.sqlMessage || err);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/users/:username/posts", async (req, res) => {
  const username = (req.params.username || "").trim();
  try {
    const [[u]] = await db.execute(
      "SELECT user_id FROM users WHERE LOWER(username)=LOWER(?) LIMIT 1",
      [username]
    );
    if (!u) return res.status(404).json({ error: "User not found" });

    const [rows] = await db.execute(
      `SELECT p.post_id AS id, u.username AS author, p.post AS text,
              DATE_FORMAT(p.created_at,'%Y-%m-%dT%H:%i:%s') AS createdAt,
              DATE_FORMAT(p.updated_at,'%Y-%m-%dT%H:%i:%s') AS updatedAt
         FROM posts p
         JOIN users u ON u.user_id = p.post_author
        WHERE p.post_author = ?
        ORDER BY COALESCE(p.updated_at, p.created_at) DESC`,
      [u.user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /users/:username/posts ERROR:", err?.sqlMessage || err);
    res.status(500).json({ error: "server error" });
  }
});

// Followers / Following lists
router.get("/users/:username/followers", async (req, res) => {
  const username = (req.params.username || "").trim();
  const [[u]] = await db.execute(
    "SELECT user_id FROM users WHERE LOWER(username)=LOWER(?) LIMIT 1",
    [username]
  );
  if (!u) return res.status(404).json({ error: "User not found" });

  const [rows] = await db.execute(
    `SELECT f.user AS id, us.username
       FROM friends f
       JOIN users us ON us.user_id = f.user
      WHERE f.friend = ?
      ORDER BY us.username ASC`,
    [u.user_id]
  );
  res.json(rows);
});

router.get("/users/:username/following", async (req, res) => {
  const username = (req.params.username || "").trim();
  const [[u]] = await db.execute(
    "SELECT user_id FROM users WHERE LOWER(username)=LOWER(?) LIMIT 1",
    [username]
  );
  if (!u) return res.status(404).json({ error: "User not found" });

  const [rows] = await db.execute(
    `SELECT f.friend AS id, us.username
       FROM friends f
       JOIN users us ON us.user_id = f.friend
      WHERE f.user = ?
      ORDER BY us.username ASC`,
    [u.user_id]
  );
  res.json(rows);
});

module.exports = router;
