-- Add detailed device and geo tracking columns to advanced_link_sessions
ALTER TABLE "advanced_link_sessions" ADD COLUMN IF NOT EXISTS "browser_version" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_sessions" ADD COLUMN IF NOT EXISTS "os_version" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_sessions" ADD COLUMN IF NOT EXISTS "country_name" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_sessions" ADD COLUMN IF NOT EXISTS "city" text;
--> statement-breakpoint

-- Add indexes for analytics queries
CREATE INDEX IF NOT EXISTS "idx_sessions_device_type" ON "advanced_link_sessions"("device_type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_browser" ON "advanced_link_sessions"("browser");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_country_code" ON "advanced_link_sessions"("country_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_os" ON "advanced_link_sessions"("os");
