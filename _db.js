const { sql } = require('@vercel/postgres');

const EMPTY_DB = { customers: [], orders: [], inventory: [], rentals: [], sales: [] };

let ensured = false;

// Creates the single-row table that holds the whole app's data as JSON,
// the same shape the old JSON-file version used. Cheap to call repeatedly
// (IF NOT EXISTS), but we cache the result per warm function instance.
async function ensureTable() {
  if (ensured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS boutique_data (
      id INT PRIMARY KEY,
      data JSONB NOT NULL,
      version INT NOT NULL DEFAULT 0
    )
  `;
  const { rows } = await sql`SELECT id FROM boutique_data WHERE id = 1`;
  if (rows.length === 0) {
    await sql`
      INSERT INTO boutique_data (id, data, version)
      VALUES (1, ${JSON.stringify(EMPTY_DB)}::jsonb, 0)
    `;
  }
  ensured = true;
}

async function getData() {
  const { rows } = await sql`SELECT data, version FROM boutique_data WHERE id = 1`;
  return rows[0];
}

module.exports = { sql, ensureTable, getData, EMPTY_DB };
