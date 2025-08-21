const { Pool } = require("pg");

// Remove ssl/sslmode from DATABASE_URL so pg doesn't override ssl option
function normalizeDatabaseUrl(url) {
  if (!url) throw new Error("DATABASE_URL is not set");
  try {
    const u = new URL(url);
    u.searchParams.delete("ssl");
    u.searchParams.delete("sslmode");
    return u.toString();
  } catch {
    // Fallback if URL parsing fails (shouldn't)
    return url
      .replace(/(\?|&)sslmode=[^&]+/i, "")
      .replace(/(\?|&)ssl=[^&]+/i, "")
      .replace(/[?&]$/, "");
  }
}

const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString,
  // Keep TLS ON but skip CA validation (needed for many managed poolers)
  ssl: { rejectUnauthorized: false },
  max: Number(process.env.PGPOOL_MAX || 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// Tagged-template helper (sg``) and mysql2-compatible execute()
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
  return pool.query({ text, values: params }); // { rows, rowCount, ... }
}

function toPgParams(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function execute(sql, params = []) {
  const text = toPgParams(sql);
  const res = await pool.query({ text, values: params });
  return [res.rows, res];
}

pool.on("error", (err) => {
  console.error("pg pool error:", err);
});

module.exports = { pool, sg, execute, toPgParams };
