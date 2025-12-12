-- Add OS column to advanced_link_sessions table
ALTER TABLE advanced_link_sessions ADD COLUMN IF NOT EXISTS os text;

-- Note: browser, device_type, and country_code columns already exist from previous migration
-- This migration just adds the OS column that was missing
