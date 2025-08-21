// server/db.js
const { Pool } = require("pg");

const isProd = process.env.NODE_ENV === "production";

function stripSslParams(url) {
  try {
    const u = new URL(url);
    u.searchParams.delete("ssl");
    u.searchParams.delete("sslmode");
    return u.toString();
  } catch {
    return url;
  }
}

const connectionString = stripSslParams(process.env.DATABASE_URL || "");
const ssl = isProd ? true : { rejectUnauthorized: false };

const pool = new Pool({
  connectionString,
  ssl,
  max: parseInt(process.env.PGPOOL_MAX || "10", 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  console.error("pg pool error:", err);
});

function toPgParams(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function execute(sql, params = []) {
  const text = toPgParams(sql);
  const res = await pool.query({ text, values: params });
  return [res.rows, res];
}

async function sg(strings, ...values) {
  let text = "";
  const params = [];
  for (let i = 0; i < strings.length; i++) {
    text += strings[i];
    if (i < values.length) {
      params.push(values[i]);
      text += `$${params.length}`;
    }
  }
  return pool.query({ text, values: params });
}

module.exports = { pool, execute, toPgParams, sg };
