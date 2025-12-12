# Database Migration Instructions

Since `psql` is not installed, please run the migration manually in Supabase:

## Steps:

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste this SQL:**

```sql
-- Add UTM tracking fields to advanced_link_orders table
ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS whop_user_id text;
ALTER TABLE advanced_link_orders ADD COLUMN IF NOT EXISTS session_id text;

-- Create advanced_link_sessions table for tracking click-to-conversion journey
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

-- Add meta_pixel_enabled column to advanced_links if it doesn't exist
ALTER TABLE advanced_links ADD COLUMN IF NOT EXISTS meta_pixel_enabled boolean DEFAULT false NOT NULL;

-- Add plan_id column to companies if it doesn't exist
ALTER TABLE companies ADD COLUMN IF NOT EXISTS plan_id text;
```

4. **Run the query**
   - Click "Run" or press `Cmd+Enter`
   - You should see "Success. No rows returned"

5. **Verify the migration**
   - Go to "Table Editor" in the left sidebar
   - Check that `advanced_link_sessions` table exists
   - Check that `advanced_link_orders` has the new UTM columns

## What This Migration Does:

✅ Adds UTM tracking columns to orders table
✅ Creates sessions table to track click-to-conversion journey  
✅ Adds device/browser detection fields
✅ Enables conversion timestamp tracking
✅ Sets up foreign key relationships

## After Migration:

The complete attribution flow is ready:
- Clicks are tracked with session tokens
- UTM params flow from click → checkout → purchase
- Webhooks capture all attribution data
- Sessions are marked as converted on purchase

You can now test the flow by creating an advanced link and completing a purchase!
