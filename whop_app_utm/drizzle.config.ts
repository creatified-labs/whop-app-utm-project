import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Supabase Postgres connection string. Make sure SUPABASE_DB_URL is set
    // in your environment (Vercel env or .env.development.local).
    url: process.env.SUPABASE_DB_URL!,
  },
});
