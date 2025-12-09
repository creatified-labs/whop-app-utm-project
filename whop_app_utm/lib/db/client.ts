import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Drizzle database client using the Supabase Postgres connection string.
// This should only be used on the server and will always point to Supabase.

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  // eslint-disable-next-line no-console
  console.warn(
    "[drizzle] SUPABASE_DB_URL is not set; Drizzle client will not be able to connect.",
  );
}

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });

export type DbClient = typeof db;
