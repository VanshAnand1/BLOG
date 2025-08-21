// server/db.js
const { Pool } = require("pg");

// Koyeb/Supabase: use pooled URL in DATABASE_URL
// Keep SSL on for Supabase; the pooler requires TLS.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: parseInt(process.env.PGPOOL_MAX || "10", 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// --- NEW: tiny tagged-template helper ---------------------------------------
// Usage:
//   const r = await sg`SELECT * FROM users WHERE username = ${u} LIMIT 1`;
//   const row = r.rows[0];
async function sg(strings, ...values) {
  // Build text with $1, $2, ... and bind values safely
  let text = "";
  const params = [];
  for (let i = 0; i < strings.length; i++) {
    text += strings[i];
    if (i < values.length) {
      params.push(values[i]);
      text += `$${params.length}`;
    }
  }
  const res = await pool.query({ text, values: params });
  return res; // { rows, rowCount, ... }
}
// ----------------------------------------------------------------------------

// Convert "?" placeholders to $1, $2, ... so existing MySQL-style code works.
// NOTE: This is naive and will replace "?" even inside string literals.
// Prefer the sg`` helper above for new code.
function toPgParams(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function execute(sql, params = []) {
  const text = toPgParams(sql);
  const res = await pool.query({ text, values: params });
  // mimic mysql2/promise: return [rows, extra]
  return [res.rows, res];
}

pool.on("error", (err) => {
  console.error("pg pool error:", err);
});

module.exports = { pool, sg, execute, toPgParams };
