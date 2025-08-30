const express = require("express");
const { sg } = require("../db");
const router = express.Router();

// Server-side post search with simple scoring
router.get("/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);

  try {
    const meId = req.user?.user_id ?? null;

    const { rows } = await sg`
      SELECT
        p.post_id AS id,
        u.username AS author,
        p.post AS text,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",

        -- simple score to keep your ordering behavior
        (CASE
          WHEN p.post ILIKE ${q} || '%' THEN 3
          WHEN p.post ILIKE '% ' || ${q} || '%' THEN 2
          WHEN p.post ILIKE '%' || ${q} || '%' THEN 1
          ELSE 0
        END) AS score,

        (SELECT COUNT(*)::int FROM likes l WHERE l.liked_post = p.post_id) AS "likes",
        CASE
          WHEN ${meId}::int IS NULL THEN NULL
          ELSE EXISTS (
            SELECT 1 FROM likes l2
            WHERE l2.liked_post = p.post_id AND l2.user_id = ${meId}
          )
        END AS "likedByMe"

      FROM posts p
      JOIN users u ON u.user_id = p.post_author
      WHERE p.post ILIKE '%' || ${q} || '%'
      ORDER BY score DESC, COALESCE(p.updated_at, p.created_at) DESC
      LIMIT 200
    `;
    res.json(rows);
  } catch (err) {
    console.error("GET /search ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
