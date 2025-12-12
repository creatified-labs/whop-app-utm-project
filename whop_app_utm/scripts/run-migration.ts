import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../lib/db/schema";

async function runMigration() {
	const connectionString = process.env.SUPABASE_DB_URL;

	if (!connectionString) {
		console.error("❌ SUPABASE_DB_URL environment variable is not set");
		console.log("\nPlease set it in your .env.local file or run:");
		console.log("export SUPABASE_DB_URL='your-connection-string'");
		process.exit(1);
	}

	console.log("🔄 Connecting to database...");
	const sql = postgres(connectionString, { max: 1 });
	const db = drizzle(sql, { schema });

	try {
		console.log("🔄 Running migration: Add UTM attribution tracking...\n");

		// Add columns to advanced_link_orders
		console.log("  ➜ Adding UTM columns to advanced_link_orders...");
		await sql`ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS utm_source text`;
		await sql`ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS utm_medium text`;
		await sql`ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS utm_campaign text`;
		await sql`ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS whop_user_id text`;
		await sql`ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS session_id text`;
		console.log("  ✓ UTM columns added");

		// Create advanced_link_sessions table
		console.log("\n  ➜ Creating advanced_link_sessions table...");
		await sql`
      CREATE TABLE IF NOT EXISTS advanced_link_sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        advanced_link_id text NOT NULL,
        utm_source text,
        utm_medium text,
        utm_campaign text,
        session_token text NOT NULL UNIQUE,
        device_type text,
        browser text,
        country_code text,
        clicked_at timestamp with time zone DEFAULT now() NOT NULL,
        converted_at timestamp with time zone,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT advanced_link_sessions_advanced_link_id_fk 
          FOREIGN KEY (advanced_link_id) 
          REFERENCES advanced_links(id) 
          ON DELETE cascade
      )
    `;
		console.log("  ✓ advanced_link_sessions table created");

		// Add meta_pixel_enabled if it doesn't exist
		console.log("\n  ➜ Adding meta_pixel_enabled to advanced_links...");
		await sql`ALTER TABLE advanced_links ADD COLUMN IF NOT EXISTS meta_pixel_enabled boolean DEFAULT false NOT NULL`;
		console.log("  ✓ meta_pixel_enabled column added");

		// Add plan_id if it doesn't exist
		console.log("\n  ➜ Adding plan_id to companies...");
		await sql`ALTER TABLE companies ADD COLUMN IF NOT EXISTS plan_id text`;
		console.log("  ✓ plan_id column added");

		console.log("\n✅ Migration completed successfully!");

		// Verify tables
		console.log("\n🔍 Verifying schema...");
		const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('advanced_link_orders', 'advanced_link_sessions')
    `;
		console.log("  Tables found:", tables.map(t => t.table_name).join(", "));

	} catch (error) {
		console.error("\n❌ Migration failed:", error);
		process.exit(1);
	} finally {
		await sql.end();
	}
}

runMigration();
