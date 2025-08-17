require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

const mysql = require("mysql2/promise");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.host,
  user: process.env.user,
  password: process.env.db_password,
  database: process.env.database,
  waitForConnections: true,
});

app.post("/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const [result] = await db.execute(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, password]
    );
    res.json({ insertedId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).send("Insert failed");
  }
});

app.listen(8080, () => {
  console.log("server listening on port 8080");
});
