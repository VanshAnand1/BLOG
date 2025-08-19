require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  })
);

const mysql = require("mysql2/promise");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
app.use(express.json());
app.use(cookieParser());

const COOKIE_NAME = process.env.COOKIE_NAME || "access";
const isProd = process.env.NODE_ENV === "production";

function cookieOptions(ms) {
  return {
    httpOnly: true,
    sameSite: isProd ? "None" : "Lax",
    secure: isProd,
    maxAge: ms,
    path: "/",
  };
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.user_id, username: user.username },
    process.env.JWT_SECRET, // <- set this in your .env
    { expiresIn: "15m" } // short-lived access token
  );
}

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
});

app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username and password are required" });
    }

    const hashed = await bcrypt.hash(password, saltRounds);

    const [result] = await db.execute(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashed]
    );

    return res.status(201).json({ insertedId: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "username already exists" });
    }
    console.error("SIGNUP ERROR:", err);
    return res.status(500).json({ error: "could not register user" });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username and password are required" });
    }

    const [rows] = await db.execute(
      "SELECT user_id, username, password FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const token = signAccessToken(user);
    res.cookie(COOKIE_NAME, token, cookieOptions(15 * 60 * 1000));

    return res.json({ user_id: user.user_id, username: user.username });
  } catch (err) {
    console.error("SIGNIN ERROR:", err);
    return res.status(500).json({ error: "server error" });
  }
});

function authRequired(req, res, next) {
  const token = req.cookies[process.env.COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "not authenticated" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { user_id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid or expired token" });
  }
}

app.get("/me", authRequired, (req, res) => {
  res.json({ user_id: req.user.user_id, username: req.user.username });
});

app.post("/logout", (req, res) => {
  res.clearCookie(process.env.COOKIE_NAME || "access", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out" });
});

app.post("/addpost", authRequired, async (req, res) => {
  try {
    const { text } = req.body ?? {};
    if (!text) {
      return res.status(400).json({ error: "post information missing" });
    }

    const [result] = await db.execute(
      "INSERT INTO posts (post_author, post, created_at) VALUES (?, ?, ?)",
      [req.user.user_id, text, new Date()]
    );

    return res.status(201).json({ insertedId: result.insertId });
  } catch (err) {
    console.error("POST ERROR:", err);
    return res.status(500).json({ error: "could not post" });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
     p.post_id AS id,
     u.username AS author,
     p.post AS text,
     DATE_FORMAT(p.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt,
     DATE_FORMAT(p.updated_at, '%Y-%m-%dT%H:%i:%s') AS updatedAt
   FROM posts p
   JOIN users u ON u.user_id = p.post_author
   ORDER BY COALESCE(p.updated_at, p.created_at) DESC
   LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET POSTS ERROR:", err);
    res.status(500).json({ error: "failed to fetch posts" });
  }
});

app.get("/posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid post id" });
  }

  try {
    const [[post]] = await db.execute(
      `SELECT
     p.post_id AS id,
     COALESCE(u.username, 'anonymous') AS author,
     p.post AS text,
     DATE_FORMAT(p.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt,
     DATE_FORMAT(p.updated_at, '%Y-%m-%dT%H:%i:%s') AS updatedAt
   FROM posts p
   LEFT JOIN users u ON u.user_id = p.post_author
   WHERE p.post_id = ?`,
      [id]
    );

    if (!post) return res.status(404).json({ error: "Post not found" });

    const [comments] = await db.execute(
      `SELECT
         c.comment_id AS id,
         c.post       AS postId,
         COALESCE(u.username, 'anonymous') AS author,
         c.comment    AS text,
         c.created_at AS createdAt
       FROM comments c
       LEFT JOIN users u ON u.user_id = c.comment_author
       WHERE c.post = ?
       ORDER BY c.created_at DESC`,
      [id]
    );

    res.json({ post, comments });
  } catch (err) {
    console.error(
      "GET /posts/:id ERROR:",
      err?.sqlMessage || err?.message || err
    );
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/addcomment", authRequired, async (req, res) => {
  try {
    const { text, post_id } = req.body ?? {};
    if (!text || !post_id) {
      return res.status(400).json({ error: "comment information missing" });
    }

    const [result] = await db.execute(
      "INSERT INTO comments (comment_author, post, created_at, comment) VALUES (?, ?, ?, ?)",
      [req.user.user_id, post_id, new Date(), text]
    );

    return res.status(201).json({ insertedId: result.insertId });
  } catch (err) {
    console.error("POST ERROR:", err);
    return res.status(500).json({ error: "could not post" });
  }
});

app.get("/me/posts", authRequired, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
     p.post_id AS id,
     COALESCE(u.username, 'anonymous') AS author,
     p.post AS text,
     DATE_FORMAT(p.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt,
     DATE_FORMAT(p.updated_at, '%Y-%m-%dT%H:%i:%s') AS updatedAt
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

app.delete("/posts/:id", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid post id" });
  }

  try {
    // ensure the post exists and belongs to the requester
    const [[row]] = await db.execute(
      "SELECT post_author FROM posts WHERE post_id = ?",
      [id]
    );
    if (!row) return res.status(404).json({ error: "Post not found" });
    if (row.post_author !== req.user.user_id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // // if you DON'T have FK cascade, delete comments first:
    // await db.execute("DELETE FROM comments WHERE post = ?", [id]);

    // delete the post
    await db.execute("DELETE FROM posts WHERE post_id = ?", [id]);

    res.json({ ok: true, deletedId: id });
  } catch (err) {
    console.error("DELETE /posts/:id ERROR:", err?.sqlMessage || err);
    res.status(500).json({ error: "server error" });
  }
});

app.patch("/posts/:id", authRequired, async (req, res) => {
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
    if (row.post_author !== req.user.user_id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await db.execute(
      "UPDATE posts SET post = ?, updated_at = NOW() WHERE post_id = ?",
      [text.trim(), id]
    );

    const [[updated]] = await db.execute(
      `SELECT p.post_id AS id,
          COALESCE(u.username,'anonymous') AS author,
          p.post AS text,
          DATE_FORMAT(p.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt,
          DATE_FORMAT(p.updated_at, '%Y-%m-%dT%H:%i:%s') AS updatedAt
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

// this is generated code
app.get("/search", async (req, res) => {
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

app.listen(8080, () => {
  console.log("server listening on port 8080");
});

app.use((req, res) => {
  console.warn("No route matched:", req.method, req.originalUrl);
  res.status(404).json({ error: "Not found" });
});
