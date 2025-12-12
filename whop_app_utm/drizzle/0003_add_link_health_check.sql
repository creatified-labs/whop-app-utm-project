-- Add health check columns to advanced_links table
ALTER TABLE advanced_links ADD COLUMN IF NOT EXISTS last_health_check timestamp with time zone;
ALTER TABLE advanced_links ADD COLUMN IF NOT EXISTS is_healthy boolean DEFAULT true;
