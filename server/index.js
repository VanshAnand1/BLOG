require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

const mysql = require("mysql2/promise");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.host,
  user: process.env.user,
  password: process.env.db_password,
  database: process.env.database,
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

    return res.json({ id: user.id, username: user.username });
  } catch (err) {
    console.error("SIGNIN ERROR:", err);
    return res.status(500).json({ error: "server error" });
  }
});

app.use((req, res) => {
  console.warn("No route matched:", req.method, req.originalUrl);
  res.status(404).json({ error: "Not found" });
});

app.listen(8080, () => {
  console.log("server listening on port 8080");
});
