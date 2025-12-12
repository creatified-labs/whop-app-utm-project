import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function runMigration() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseKey) {
		console.error("❌ Missing Supabase credentials");
		console.log("Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
		process.exit(1);
	}

	console.log("🔄 Connecting to Supabase...");
	const supabase = createClient(supabaseUrl, supabaseKey);

	try {
		console.log("🔄 Running migration: Add UTM attribution tracking...\n");

		// Add columns to advanced_link_orders
		console.log("  ➜ Adding UTM columns to advanced_link_orders...");
		const { error: e1 } = await supabase.rpc('exec_sql', {
			sql: `
        ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS utm_source text;
        ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS utm_medium text;
        ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS utm_campaign text;
        ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS whop_user_id text;
        ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS session_id text;
      `
		});
		if (e1) throw e1;
		console.log("  ✓ UTM columns added");

		// Create advanced_link_sessions table
		console.log("\n  ➜ Creating advanced_link_sessions table...");
		const { error: e2 } = await supabase.rpc('exec_sql', {
			sql: `
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
        );
      `
		});
		if (e2) throw e2;
		console.log("  ✓ advanced_link_sessions table created");

		// Add meta_pixel_enabled if it doesn't exist
		console.log("\n  ➜ Adding meta_pixel_enabled to advanced_links...");
		const { error: e3 } = await supabase.rpc('exec_sql', {
			sql: `ALTER TABLE advanced_links ADD COLUMN IF NOT EXISTS meta_pixel_enabled boolean DEFAULT false NOT NULL;`
		});
		if (e3) throw e3;
		console.log("  ✓ meta_pixel_enabled column added");

		// Add plan_id if it doesn't exist
		console.log("\n  ➜ Adding plan_id to companies...");
		const { error: e4 } = await supabase.rpc('exec_sql', {
			sql: `ALTER TABLE companies ADD COLUMN IF NOT EXISTS plan_id text;`
		});
		if (e4) throw e4;
		console.log("  ✓ plan_id column added");

		console.log("\n✅ Migration completed successfully!");

	} catch (error) {
		console.error("\n❌ Migration failed:", error.message);
		console.log("\n💡 You can run the SQL manually in Supabase SQL Editor:");
		console.log("   Dashboard → SQL Editor → New Query → Paste the SQL from drizzle/0001_add_utm_attribution_tracking.sql");
		process.exit(1);
	}
}

runMigration();
