-- Complete site_config table setup for CSV import
-- This script creates the table with all columns needed for direct CSV import

-- Drop existing table if you want to start fresh (uncomment if needed)
-- DROP TABLE IF EXISTS site_config CASCADE;

-- Create site_config table with all required columns
CREATE TABLE IF NOT EXISTS site_config (
  id TEXT PRIMARY KEY,
  site_name TEXT NOT NULL,
  banner_image TEXT,
  description TEXT,
  theme_color TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  social_media JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Add temporary columns for CSV import (flat social_media fields)
-- These columns will be used during CSV import and transformed by the trigger
ALTER TABLE site_config 
ADD COLUMN IF NOT EXISTS social_media_facebook TEXT,
ADD COLUMN IF NOT EXISTS social_media_twitter TEXT,
ADD COLUMN IF NOT EXISTS social_media_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_media_linkedin TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_config_id ON site_config(id);

-- Enable Row Level Security
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public site_config is viewable by everyone" ON site_config;
DROP POLICY IF EXISTS "Anyone can insert site_config" ON site_config;
DROP POLICY IF EXISTS "Anyone can update site_config" ON site_config;

-- Create policies (allow public read access)
CREATE POLICY "Public site_config is viewable by everyone" ON site_config
  FOR SELECT USING (true);

-- Allow inserts (adjust policies based on your security needs)
CREATE POLICY "Anyone can insert site_config" ON site_config
  FOR INSERT WITH CHECK (true);

-- Allow updates (adjust policies based on your security needs)
CREATE POLICY "Anyone can update site_config" ON site_config
  FOR UPDATE USING (true);

-- Function to transform flat CSV fields into nested JSONB structure
CREATE OR REPLACE FUNCTION transform_site_config_for_insert()
RETURNS TRIGGER AS $$
DECLARE
  social_media_obj JSONB := '{}'::JSONB;
BEGIN
  -- Check if flat CSV fields exist and transform them to nested structure
  IF NEW.social_media_facebook IS NOT NULL AND NEW.social_media_facebook != '' THEN
    social_media_obj := social_media_obj || jsonb_build_object('facebook', NEW.social_media_facebook);
  END IF;
  
  IF NEW.social_media_twitter IS NOT NULL AND NEW.social_media_twitter != '' THEN
    social_media_obj := social_media_obj || jsonb_build_object('twitter', NEW.social_media_twitter);
  END IF;
  
  IF NEW.social_media_instagram IS NOT NULL AND NEW.social_media_instagram != '' THEN
    social_media_obj := social_media_obj || jsonb_build_object('instagram', NEW.social_media_instagram);
  END IF;
  
  IF NEW.social_media_linkedin IS NOT NULL AND NEW.social_media_linkedin != '' THEN
    social_media_obj := social_media_obj || jsonb_build_object('linkedin', NEW.social_media_linkedin);
  END IF;
  
  -- If social_media already exists as nested object, merge with it (backward compatibility)
  IF NEW.social_media IS NOT NULL AND jsonb_typeof(NEW.social_media) = 'object' THEN
    social_media_obj := NEW.social_media || social_media_obj;
  END IF;
  
  -- Set the nested social_media field if it has any keys
  IF social_media_obj != '{}'::JSONB THEN
    NEW.social_media := social_media_obj;
  END IF;
  
  -- Remove flat CSV fields to keep table clean
  NEW.social_media_facebook := NULL;
  NEW.social_media_twitter := NULL;
  NEW.social_media_instagram := NULL;
  NEW.social_media_linkedin := NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS site_config_csv_transform_trigger ON site_config;

-- Create trigger that runs BEFORE INSERT or UPDATE
CREATE TRIGGER site_config_csv_transform_trigger
  BEFORE INSERT OR UPDATE ON site_config
  FOR EACH ROW
  EXECUTE FUNCTION transform_site_config_for_insert();

