import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../shared/schema.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env for local development, or to the project's environment variables in Vercel.",
  );
}

export const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });

// Auto-initialize tables
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log("[Database] Initializing tables if they don't exist...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        instagram TEXT,
        current_revenue TEXT NOT NULL,
        goal TEXT NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT now() NOT NULL,
        contacted BOOLEAN DEFAULT false NOT NULL
      );
    `);
    console.log("[Database] Tables initialized successfully.");
  } catch (err) {
    console.error("[Database] Error initializing tables:", err);
  } finally {
    client.release();
  }
}
