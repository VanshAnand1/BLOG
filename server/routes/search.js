const express = require("express");
const db = require("../db");
const router = express.Router();

// Server-side post search with simple scoring
router.get("/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);
  try {
    const [rows] = await db.execute(
      `SELECT
         p.post_id AS id,
         u.username AS author,
         p.post AS text,
         DATE_FORMAT(p.created_at,'%Y-%m-%dT%H:%i:%s') AS createdAt,
         DATE_FORMAT(p.updated_at,'%Y-%m-%dT%H:%i:%s') AS updatedAt,
         (
           (LOWER(p.post) = LOWER(?)) * 100 +
           (LEFT(LOWER(p.post), CHAR_LENGTH(?)) = LOWER(?)) * 90 +
           (INSTR(CONCAT(' ', LOWER(p.post), ' '), CONCAT(' ', LOWER(?), ' ')) > 0) * 80 +
           (LOWER(p.post) LIKE CONCAT('%', LOWER(?), '%')) * 70
         ) AS score
       FROM posts p
       JOIN users u ON u.user_id = p.post_author
       WHERE LOWER(p.post) LIKE CONCAT('%', LOWER(?), '%')
       ORDER BY score DESC, COALESCE(p.updated_at, p.created_at) DESC
       LIMIT 200`,
      [q, q, q, q, q, q]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /search ERROR:", err?.sqlMessage || err);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
