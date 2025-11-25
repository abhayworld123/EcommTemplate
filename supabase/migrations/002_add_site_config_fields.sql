-- Add contact and social media fields to site_config table
ALTER TABLE site_config 
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_address TEXT,
ADD COLUMN IF NOT EXISTS social_media JSONB;





