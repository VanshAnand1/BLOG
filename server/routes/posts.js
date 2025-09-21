// routes/posts.js — migrated from mysql2 to sg (Postgres)
const express = require("express");
const { sg } = require("../db");
const { authRequired, attachUserIfPresent } = require("../middleware/auth");
const router = express.Router();
const { maskProfanityBody } = require("../utils/profanity");

// List posts (PUBLIC: attaches user if present, never 401)
router.get("/posts", attachUserIfPresent, async (req, res) => {
  try {
    const meId = req.user?.user_id ?? null;

    // Guests: never reference meId in SQL
    if (meId == null) {
      const { rows } = await sg`
        SELECT
          p.post_id AS id,
          u.username AS author,
          p.post AS text,
          p.created_at AS "createdAt",
          p.updated_at AS "updatedAt",
          (SELECT COUNT(*)::int FROM likes l WHERE l.liked_post = p.post_id) AS "likes",
          FALSE AS "likedByMe"
        FROM posts p
        JOIN users u ON u.user_id = p.post_author
        ORDER BY COALESCE(p.updated_at, p.created_at) DESC
        LIMIT 100
      `;
      return res.json(rows);
    }

    // Authed: compute likedByMe with the concrete user id
    const { rows } = await sg`
      SELECT
        p.post_id AS id,
        u.username AS author,
        p.post AS text,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        (SELECT COUNT(*)::int FROM likes l WHERE l.liked_post = p.post_id) AS "likes",
        EXISTS (
          SELECT 1 FROM likes l2
          WHERE l2.liked_post = p.post_id AND l2.user_id = ${meId}::int
        ) AS "likedByMe"
      FROM posts p
      JOIN users u ON u.user_id = p.post_author
      ORDER BY COALESCE(p.updated_at, p.created_at) DESC
      LIMIT 100
    `;
    res.json(rows);
  } catch (err) {
    console.error("GET /posts ERROR:", err?.stack || err);
    res.status(500).json({ error: "failed to fetch posts" });
  }
});

// Following feed (PRIVATE)
router.get("/followingposts", authRequired, async (req, res) => {
  try {
    const me = req.user.user_id;

    const { rows } = await sg`
      SELECT
        p.post_id AS id,
        u.username AS author,
        p.post AS text,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        (SELECT COUNT(*)::int FROM likes l WHERE l.liked_post = p.post_id) AS "likes",
        EXISTS (
          SELECT 1 FROM likes l2
          WHERE l2.liked_post = p.post_id AND l2.user_id = ${me}
        ) AS "likedByMe"
      FROM posts p
      JOIN users u ON u.user_id = p.post_author
      LEFT JOIN friends f
        ON f."friend" = p.post_author
       AND f."user"   = ${me}
      WHERE f."user" IS NOT NULL OR p.post_author = ${me}
      ORDER BY COALESCE(p.updated_at, p.created_at) DESC
      LIMIT 100
    `;
    res.json(rows);
  } catch (err) {
    console.error("GET /followingposts ERROR:", err);
    res.status(500).json({ error: "failed to fetch posts" });
  }
});

// Get one post + comments (PUBLIC: attaches user if present, never 401)
router.get("/posts/:id", attachUserIfPresent, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid post id" });

  try {
    const meId = req.user?.user_id ?? null;

    let postRes;
    if (meId == null) {
      postRes = await sg`
        SELECT
          p.post_id AS id,
          COALESCE(u.username, 'anonymous') AS author,
          p.post AS text,
          p.created_at AS "createdAt",
          p.updated_at AS "updatedAt",
          (SELECT COUNT(*)::int FROM likes l WHERE l.liked_post = p.post_id) AS "likes",
          FALSE AS "likedByMe"
        FROM posts p
        LEFT JOIN users u ON u.user_id = p.post_author
        WHERE p.post_id = ${id}
        LIMIT 1
      `;
    } else {
      postRes = await sg`
        SELECT
          p.post_id AS id,
          COALESCE(u.username, 'anonymous') AS author,
          p.post AS text,
          p.created_at AS "createdAt",
          p.updated_at AS "updatedAt",
          (SELECT COUNT(*)::int FROM likes l WHERE l.liked_post = p.post_id) AS "likes",
          EXISTS (
            SELECT 1 FROM likes l2
            WHERE l2.liked_post = p.post_id AND l2.user_id = ${meId}::int
          ) AS "likedByMe"
        FROM posts p
        LEFT JOIN users u ON u.user_id = p.post_author
        WHERE p.post_id = ${id}
        LIMIT 1
      `;
    }

    const post = postRes.rows[0];
    if (!post) return res.status(404).json({ error: "Post not found" });

    const commentsRes = await sg`
      SELECT
        c.comment_id AS id,
        c.post AS "postId",
        COALESCE(u.username, 'anonymous') AS author,
        c.comment AS text,
        c.created_at AS "createdAt"
      FROM comments c
      LEFT JOIN users u ON u.user_id = c.comment_author
      WHERE c.post = ${id}
      ORDER BY c.created_at DESC
    `;

    res.json({ post, comments: commentsRes.rows });
  } catch (err) {
    console.error("GET /posts/:id ERROR:", err?.stack || err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create post (PRIVATE)
router.post(
  "/addpost",
  authRequired,
  maskProfanityBody("text"),
  async (req, res) => {
    try {
      const { text } = req.body ?? {};
      if (!text)
        return res.status(400).json({ error: "post information missing" });

      const insertRes = await sg`
        INSERT INTO posts (post_author, post, created_at)
        VALUES (${req.user.user_id}, ${text}, NOW())
        RETURNING post_id
      `;
      res.status(201).json({ insertedId: insertRes.rows[0].post_id });
    } catch (err) {
      console.error("POST /addpost ERROR:", err);
      res.status(500).json({ error: "could not post" });
    }
  }
);

// My posts (PRIVATE)
router.get("/me/posts", authRequired, async (req, res) => {
  try {
    const me = req.user.user_id;
    const { rows } = await sg`
      SELECT
        p.post_id AS id,
        COALESCE(u.username, 'anonymous') AS author,
        p.post AS text,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        (SELECT COUNT(*)::int FROM likes l WHERE l.liked_post = p.post_id) AS "likes",
        EXISTS (
          SELECT 1 FROM likes l2
          WHERE l2.liked_post = p.post_id AND l2.user_id = ${me}
        ) AS "likedByMe"
      FROM posts p
      JOIN users u ON u.user_id = p.post_author
      WHERE p.post_author = ${me}
      ORDER BY COALESCE(p.updated_at, p.created_at) DESC
    `;
    res.json(rows);
  } catch (err) {
    console.error("GET /me/posts ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

// Delete post (PRIVATE)
router.delete("/posts/:id", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid post id" });

  try {
    const ownerRes = await sg`
      SELECT post_author FROM posts WHERE post_id = ${id} LIMIT 1
    `;
    const row = ownerRes.rows[0];
    if (!row) return res.status(404).json({ error: "Post not found" });
    if (row.post_author !== req.user.user_id)
      return res.status(403).json({ error: "Forbidden" });

    await sg`DELETE FROM posts WHERE post_id = ${id}`;
    res.json({ ok: true, deletedId: id });
  } catch (err) {
    console.error("DELETE /posts/:id ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

// Edit post (PRIVATE; sets updated_at)
router.patch(
  "/posts/:id",
  authRequired,
  maskProfanityBody("text"),
  async (req, res) => {
    const id = Number(req.params.id);
    const { text } = req.body ?? {};
    if (!Number.isFinite(id))
      return res.status(400).json({ error: "Invalid post id" });
    if (!text || !text.trim())
      return res.status(400).json({ error: "Text is required" });

    try {
      const ownerRes = await sg`
        SELECT post_author FROM posts WHERE post_id = ${id} LIMIT 1
      `;
      const row = ownerRes.rows[0];
      if (!row) return res.status(404).json({ error: "Post not found" });
      if (row.post_author !== req.user.user_id)
        return res.status(403).json({ error: "Forbidden" });

      await sg`
        UPDATE posts
           SET post = ${text.trim()}, updated_at = NOW()
         WHERE post_id = ${id}
      `;

      const updatedRes = await sg`
        SELECT
          p.post_id AS id,
          COALESCE(u.username, 'anonymous') AS author,
          p.post AS text,
          p.created_at AS "createdAt",
          p.updated_at AS "updatedAt"
        FROM posts p
        JOIN users u ON u.user_id = p.post_author
        WHERE p.post_id = ${id}
        LIMIT 1
      `;
      res.json(updatedRes.rows[0]);
    } catch (err) {
      console.error("PATCH /posts/:id ERROR:", err);
      res.status(500).json({ error: "server error" });
    }
  }
);

// Add comment (PRIVATE)
router.post(
  "/addcomment",
  authRequired,
  maskProfanityBody("text"),
  async (req, res) => {
    try {
      const { text, post_id } = req.body ?? {};
      if (!text || !post_id)
        return res.status(400).json({ error: "comment information missing" });

      const insertRes = await sg`
        INSERT INTO comments (comment_author, post, created_at, comment)
        VALUES (${req.user.user_id}, ${post_id}, NOW(), ${text})
        RETURNING comment_id
      `;
      res.status(201).json({ insertedId: insertRes.rows[0].comment_id });
    } catch (err) {
      console.error("POST /addcomment ERROR:", err);
      res.status(500).json({ error: "could not post" });
    }
  }
);

// Like a post (PRIVATE)
router.post("/posts/:id/like", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "bad id" });

  try {
    // idempotent insert (no UNIQUE needed)
    await sg`
      INSERT INTO likes (liked_post, user_id)
      SELECT ${id}, ${req.user.user_id}
      WHERE NOT EXISTS (
        SELECT 1 FROM likes WHERE liked_post = ${id} AND user_id = ${req.user.user_id}
      )
    `;
    const c =
      await sg`SELECT COUNT(*)::int AS c FROM likes WHERE liked_post = ${id}`;
    res.json({ ok: true, liked: true, likes: c.rows[0].c });
  } catch (err) {
    console.error("POST /posts/:id/like ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

// Unlike a post (PRIVATE)
router.delete("/posts/:id/like", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "bad id" });

  try {
    await sg`DELETE FROM likes WHERE liked_post = ${id} AND user_id = ${req.user.user_id}`;
    const c =
      await sg`SELECT COUNT(*)::int AS c FROM likes WHERE liked_post = ${id}`;
    res.json({ ok: true, liked: false, likes: c.rows[0].c });
  } catch (err) {
    console.error("DELETE /posts/:id/like ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

// Like status (PRIVATE)
router.get("/posts/:id/like", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "bad id" });

  try {
    const me = req.user.user_id;

    const likedRes = await sg`
      SELECT 1 FROM likes
      WHERE liked_post = ${id} AND user_id = ${me}
      LIMIT 1
    `;
    const countRes = await sg`
      SELECT COUNT(*)::int AS c
      FROM likes
      WHERE liked_post = ${id}
    `;

    res.json({
      authed: true,
      liked: likedRes.rowCount > 0,
      likes: countRes.rows[0].c,
    });
  } catch (err) {
    console.error("GET /posts/:id/like ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
