import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { env } from "./env.js";

let pool = null;
let dbReady = false;

function resolveSslOptions() {
  if (!env.databaseUrl) return false;
  return { rejectUnauthorized: false };
}

export function isDbReady() {
  return dbReady;
}

export async function initDatabase() {
  if (!env.databaseUrl) {
    dbReady = false;
    return;
  }

  pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: resolveSslOptions()
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS logged_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ NULL
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_logged_sessions_user_created
      ON logged_sessions(user_id, created_at DESC);
  `);

  dbReady = true;
}

export async function dbQuery(text, params = []) {
  if (!pool) {
    const error = new Error("Database is not initialized");
    error.statusCode = 500;
    throw error;
  }
  return pool.query(text, params);
}

export function newId() {
  return randomUUID();
}
