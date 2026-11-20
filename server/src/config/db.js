import pg from 'pg';

const { Pool } = pg;

let pool = null;
let warnedMissingUrl = false;

/** Check whether DATABASE_URL is configured in the environment. */
export function isDbConfigured() {
  return Boolean((process.env.DATABASE_URL || '').trim());
}

/**
 * Return a reusable Neon PostgreSQL Pool configured with SSL.
 * Gracefully logs a clear warning and returns null if DATABASE_URL is missing
 * so the dev server never crashes.
 */
export function getPool() {
  const connectionString = (process.env.DATABASE_URL || '').trim();
  if (!connectionString) {
    if (!warnedMissingUrl) {
      warnedMissingUrl = true;
      console.warn(
        '[db] DATABASE_URL is missing in server/.env — Neon PostgreSQL is disabled until configured.'
      );
    }
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    });

    pool.on('error', (err) => {
      console.error('[db] Unexpected PostgreSQL pool error:', err.message);
    });
  }

  return pool;
}

/** Run a parameterized SQL query against the Neon pool. */
export async function query(text, params = []) {
  const activePool = getPool();
  if (!activePool) {
    const err = new Error('DATABASE_URL is not configured in server/.env');
    err.code = 'DB_NOT_CONFIGURED';
    throw err;
  }
  return activePool.query(text, params);
}

/** Run a callback inside an atomic PostgreSQL transaction. */
export async function withTransaction(fn) {
  const activePool = getPool();
  if (!activePool) {
    const err = new Error('DATABASE_URL is not configured in server/.env');
    err.code = 'DB_NOT_CONFIGURED';
    throw err;
  }

  const client = await activePool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
