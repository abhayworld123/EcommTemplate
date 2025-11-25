-- Function to transform flat CSV fields into nested JSONB structure for site_config
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

-- Add temporary columns for CSV import (these will be cleaned by the trigger)
ALTER TABLE site_config 
ADD COLUMN IF NOT EXISTS social_media_facebook TEXT,
ADD COLUMN IF NOT EXISTS social_media_twitter TEXT,
ADD COLUMN IF NOT EXISTS social_media_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_media_linkedin TEXT;

-- Create trigger that runs BEFORE INSERT or UPDATE
DROP TRIGGER IF EXISTS site_config_csv_transform_trigger ON site_config;
CREATE TRIGGER site_config_csv_transform_trigger
  BEFORE INSERT OR UPDATE ON site_config
  FOR EACH ROW
  EXECUTE FUNCTION transform_site_config_for_insert();

