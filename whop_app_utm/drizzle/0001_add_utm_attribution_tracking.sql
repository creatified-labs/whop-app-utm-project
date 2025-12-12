-- Add UTM tracking fields to advanced_link_orders table
ALTER TABLE "advanced_link_orders" ADD COLUMN "utm_source" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_orders" ADD COLUMN "utm_medium" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_orders" ADD COLUMN "utm_campaign" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_orders" ADD COLUMN "whop_user_id" text;
--> statement-breakpoint
ALTER TABLE "advanced_link_orders" ADD COLUMN "session_id" text;
--> statement-breakpoint

-- Create advanced_link_sessions table for tracking click-to-conversion journey
CREATE TABLE "advanced_link_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advanced_link_id" text NOT NULL,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"session_token" text NOT NULL,
	"device_type" text,
	"browser" text,
	"country_code" text,
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"converted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "advanced_link_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint

-- Add foreign key constraint for advanced_link_sessions
ALTER TABLE "advanced_link_sessions" ADD CONSTRAINT "advanced_link_sessions_advanced_link_id_advanced_links_id_fk" FOREIGN KEY ("advanced_link_id") REFERENCES "public"."advanced_links"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Add meta_pixel_enabled column to advanced_links if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'advanced_links' 
        AND column_name = 'meta_pixel_enabled'
    ) THEN
        ALTER TABLE "advanced_links" ADD COLUMN "meta_pixel_enabled" boolean DEFAULT false NOT NULL;
    END IF;
END $$;
--> statement-breakpoint

-- Add plan_id column to companies if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'plan_id'
    ) THEN
        ALTER TABLE "companies" ADD COLUMN "plan_id" text;
    END IF;
END $$;
