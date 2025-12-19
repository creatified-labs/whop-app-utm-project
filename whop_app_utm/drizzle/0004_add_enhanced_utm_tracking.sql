-- Add additional UTM tracking fields to advanced_link_orders
ALTER TABLE "advanced_link_orders" ADD COLUMN IF NOT EXISTS "whop_order_id" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_orders" ADD COLUMN IF NOT EXISTS "utm_content" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_orders" ADD COLUMN IF NOT EXISTS "utm_term" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_orders" ADD COLUMN IF NOT EXISTS "session_token" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_orders" ADD COLUMN IF NOT EXISTS "device_type" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_orders" ADD COLUMN IF NOT EXISTS "browser" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_orders" ADD COLUMN IF NOT EXISTS "country_code" text;
--> statement-breakpoint

-- Add additional tracking fields to advanced_link_sessions
ALTER TABLE "advanced_link_sessions" ADD COLUMN IF NOT EXISTS "utm_content" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_sessions" ADD COLUMN IF NOT EXISTS "utm_term" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_sessions" ADD COLUMN IF NOT EXISTS "ip_hash" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_sessions" ADD COLUMN IF NOT EXISTS "referrer" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_sessions" ADD COLUMN IF NOT EXISTS "user_agent" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_sessions" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_advanced_link_orders_session_token" ON "advanced_link_orders"("session_token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_advanced_link_orders_utm_source" ON "advanced_link_orders"("utm_source");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_advanced_link_orders_whop_order_id" ON "advanced_link_orders"("whop_order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_advanced_link_sessions_session_token" ON "advanced_link_sessions"("session_token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_advanced_link_sessions_clicked_at" ON "advanced_link_sessions"("clicked_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_advanced_link_sessions_advanced_link_id" ON "advanced_link_sessions"("advanced_link_id");
