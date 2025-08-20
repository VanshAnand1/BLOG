const express = require("express");
const db = require("../db");
const { authRequired } = require("../middleware/auth");
const router = express.Router();

// List posts
router.get("/posts", async (_req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.post_id AS id, u.username AS author, p.post AS text,
              DATE_FORMAT(p.created_at,'%Y-%m-%dT%H:%i:%s') AS createdAt,
              DATE_FORMAT(p.updated_at,'%Y-%m-%dT%H:%i:%s') AS updatedAt
         FROM posts p
         JOIN users u ON u.user_id = p.post_author
         ORDER BY COALESCE(p.updated_at, p.created_at) DESC
         LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /posts ERROR:", err);
    res.status(500).json({ error: "failed to fetch posts" });
  }
});

router.get("/followingposts", authRequired, async (req, res) => {
  try {
    const me = req.user.user_id;

    const [rows] = await db.execute(
      `SELECT
         p.post_id AS id,
         u.username AS author,
         p.post     AS text,
         DATE_FORMAT(p.created_at,'%Y-%m-%dT%H:%i:%s') AS createdAt,
         DATE_FORMAT(p.updated_at,'%Y-%m-%dT%H:%i:%s') AS updatedAt
       FROM posts p
       JOIN users u ON u.user_id = p.post_author
       LEFT JOIN friends f
              ON f.friend = p.post_author
             AND f.user   = ?
       WHERE f.user IS NOT NULL OR p.post_author = ?
       ORDER BY COALESCE(p.updated_at, p.created_at) DESC
       LIMIT 100`,
      [me, me]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /followingposts ERROR:", err?.sqlMessage || err);
    res.status(500).json({ error: "failed to fetch posts" });
  }
});

// Get one post + comments
router.get("/posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid post id" });

  try {
    const [[post]] = await db.execute(
      `SELECT p.post_id AS id, COALESCE(u.username,'anonymous') AS author, p.post AS text,
              DATE_FORMAT(p.created_at,'%Y-%m-%dT%H:%i:%s') AS createdAt,
              DATE_FORMAT(p.updated_at,'%Y-%m-%dT%H:%i:%s') AS updatedAt
         FROM posts p
         LEFT JOIN users u ON u.user_id = p.post_author
        WHERE p.post_id = ?`,
      [id]
    );
    if (!post) return res.status(404).json({ error: "Post not found" });

    const [comments] = await db.execute(
      `SELECT c.comment_id AS id, c.post AS postId,
              COALESCE(u.username,'anonymous') AS author, c.comment AS text,
              DATE_FORMAT(c.created_at,'%Y-%m-%dT%H:%i:%s') AS createdAt
         FROM comments c
         LEFT JOIN users u ON u.user_id = c.comment_author
        WHERE c.post = ?
        ORDER BY c.created_at DESC`,
      [id]
    );
    res.json({ post, comments });
  } catch (err) {
    console.error("GET /posts/:id ERROR:", err?.sqlMessage || err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create post
router.post("/addpost", authRequired, async (req, res) => {
  try {
    const { text } = req.body ?? {};
    if (!text)
      return res.status(400).json({ error: "post information missing" });
    const [r] = await db.execute(
      "INSERT INTO posts (post_author, post, created_at) VALUES (?, ?, ?)",
      [req.user.user_id, text, new Date()]
    );
    res.status(201).json({ insertedId: r.insertId });
  } catch (err) {
    console.error("POST /addpost ERROR:", err);
    res.status(500).json({ error: "could not post" });
  }
});

// My posts
router.get("/me/posts", authRequired, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.post_id AS id, COALESCE(u.username,'anonymous') AS author, p.post AS text,
              DATE_FORMAT(p.created_at,'%Y-%m-%dT%H:%i:%s') AS createdAt,
              DATE_FORMAT(p.updated_at,'%Y-%m-%dT%H:%i:%s') AS updatedAt
         FROM posts p
         JOIN users u ON u.user_id = p.post_author
        WHERE p.post_author = ?
        ORDER BY COALESCE(p.updated_at, p.created_at) DESC`,
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /me/posts ERROR:", err?.sqlMessage || err);
    res.status(500).json({ error: "server error" });
  }
});

// Delete post
router.delete("/posts/:id", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid post id" });

  try {
    const [[row]] = await db.execute(
      "SELECT post_author FROM posts WHERE post_id = ?",
      [id]
    );
    if (!row) return res.status(404).json({ error: "Post not found" });
    if (row.post_author !== req.user.user_id)
      return res.status(403).json({ error: "Forbidden" });

    await db.execute("DELETE FROM posts WHERE post_id = ?", [id]);
    res.json({ ok: true, deletedId: id });
  } catch (err) {
    console.error("DELETE /posts/:id ERROR:", err?.sqlMessage || err);
    res.status(500).json({ error: "server error" });
  }
});

// Edit post (sets updated_at)
router.patch("/posts/:id", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  const { text } = req.body ?? {};
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid post id" });
  if (!text || !text.trim())
    return res.status(400).json({ error: "Text is required" });

  try {
    const [[row]] = await db.execute(
      "SELECT post_author FROM posts WHERE post_id = ?",
      [id]
    );
    if (!row) return res.status(404).json({ error: "Post not found" });
    if (row.post_author !== req.user.user_id)
      return res.status(403).json({ error: "Forbidden" });

    await db.execute(
      "UPDATE posts SET post = ?, updated_at = NOW() WHERE post_id = ?",
      [text.trim(), id]
    );

    const [[updated]] = await db.execute(
      `SELECT p.post_id AS id, COALESCE(u.username,'anonymous') AS author, p.post AS text,
              DATE_FORMAT(p.created_at,'%Y-%m-%dT%H:%i:%s') AS createdAt,
              DATE_FORMAT(p.updated_at,'%Y-%m-%dT%H:%i:%s') AS updatedAt
         FROM posts p
         JOIN users u ON u.user_id = p.post_author
        WHERE p.post_id = ?`,
      [id]
    );
    res.json(updated);
  } catch (err) {
    console.error("PATCH /posts/:id ERROR:", err?.sqlMessage || err);
    res.status(500).json({ error: "server error" });
  }
});

// Add comment
router.post("/addcomment", authRequired, async (req, res) => {
  try {
    const { text, post_id } = req.body ?? {};
    if (!text || !post_id)
      return res.status(400).json({ error: "comment information missing" });
    const [r] = await db.execute(
      "INSERT INTO comments (comment_author, post, created_at, comment) VALUES (?, ?, ?, ?)",
      [req.user.user_id, post_id, new Date(), text]
    );
    res.status(201).json({ insertedId: r.insertId });
  } catch (err) {
    console.error("POST /addcomment ERROR:", err);
    res.status(500).json({ error: "could not post" });
  }
});

module.exports = router;
