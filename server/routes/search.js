const express = require("express");
const { sg } = require("../db");
const router = express.Router();

// Server-side post search with simple scoring
router.get("/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);

  try {
    const { rows } = await sg`
      SELECT
        p.post_id AS id,
        u.username AS author,
        p.post AS text,
        to_char(p.created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS "createdAt",
        to_char(p.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS "updatedAt",
        (
          CASE WHEN lower(p.post) = lower(${q}) THEN 100 ELSE 0 END +
          CASE WHEN left(lower(p.post), char_length(${q})) = lower(${q}) THEN 90 ELSE 0 END +
          CASE WHEN position(' ' || lower(${q}) || ' ' IN ' ' || lower(p.post) || ' ') > 0 THEN 80 ELSE 0 END +
          CASE WHEN p.post ILIKE '%' || ${q} || '%' THEN 70 ELSE 0 END
        ) AS score
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
