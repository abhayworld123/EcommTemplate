-- Add temporary columns for CSV import (handle both camelCase and lowercase)
-- Supabase CSV import may convert column names to lowercase, so we handle both
DO $$
BEGIN
  -- Add camelCase columns (quoted identifiers)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'offerId') THEN
    ALTER TABLE offers ADD COLUMN "offerId" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'imageUrl') THEN
    ALTER TABLE offers ADD COLUMN "imageUrl" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'ctaText') THEN
    ALTER TABLE offers ADD COLUMN "ctaText" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'ctaLink') THEN
    ALTER TABLE offers ADD COLUMN "ctaLink" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'bgGradient') THEN
    ALTER TABLE offers ADD COLUMN "bgGradient" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'isActive') THEN
    ALTER TABLE offers ADD COLUMN "isActive" BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'displayOrder') THEN
    ALTER TABLE offers ADD COLUMN "displayOrder" INTEGER;
  END IF;
  
  -- Also add lowercase versions (in case Supabase converts them)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'offerid') THEN
    ALTER TABLE offers ADD COLUMN offerid TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'imageurl') THEN
    ALTER TABLE offers ADD COLUMN imageurl TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'ctatext') THEN
    ALTER TABLE offers ADD COLUMN ctatext TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'ctalink') THEN
    ALTER TABLE offers ADD COLUMN ctalink TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'bggradient') THEN
    ALTER TABLE offers ADD COLUMN bggradient TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'isactive') THEN
    ALTER TABLE offers ADD COLUMN isactive BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'displayorder') THEN
    ALTER TABLE offers ADD COLUMN displayorder INTEGER;
  END IF;
END $$;

-- Function to transform camelCase/lowercase CSV fields into snake_case database fields
CREATE OR REPLACE FUNCTION transform_offers_for_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- If snake_case columns are already populated (from API route), skip all transformation
  -- This prevents errors when camelCase columns don't exist in the NEW record
  IF NEW.offer_id IS NOT NULL AND NEW.offer_id != '' THEN
    -- Data is already in snake_case format from API route, no transformation needed
    RETURN NEW;
  END IF;
  
  -- Otherwise, transform from camelCase/lowercase to snake_case (for direct CSV imports)
  -- Only access camelCase columns if offer_id is not set (meaning this is a direct CSV import)
  IF NEW."offerId" IS NOT NULL AND NEW."offerId" != '' THEN
    NEW.offer_id := NEW."offerId";
    NEW."offerId" := NULL;
  ELSIF NEW.offerid IS NOT NULL AND NEW.offerid != '' THEN
    NEW.offer_id := NEW.offerid;
    NEW.offerid := NULL;
  END IF;
  
  IF NEW."imageUrl" IS NOT NULL AND NEW."imageUrl" != '' THEN
    NEW.image_url := NEW."imageUrl";
    NEW."imageUrl" := NULL;
  ELSIF NEW.imageurl IS NOT NULL AND NEW.imageurl != '' THEN
    NEW.image_url := NEW.imageurl;
    NEW.imageurl := NULL;
  END IF;
  
  IF NEW."ctaText" IS NOT NULL AND NEW."ctaText" != '' THEN
    NEW.cta_text := NEW."ctaText";
    NEW."ctaText" := NULL;
  ELSIF NEW.ctatext IS NOT NULL AND NEW.ctatext != '' THEN
    NEW.cta_text := NEW.ctatext;
    NEW.ctatext := NULL;
  END IF;
  
  IF NEW."ctaLink" IS NOT NULL AND NEW."ctaLink" != '' THEN
    NEW.cta_link := NEW."ctaLink";
    NEW."ctaLink" := NULL;
  ELSIF NEW.ctalink IS NOT NULL AND NEW.ctalink != '' THEN
    NEW.cta_link := NEW.ctalink;
    NEW.ctalink := NULL;
  END IF;
  
  IF NEW."bgGradient" IS NOT NULL AND NEW."bgGradient" != '' THEN
    NEW.bg_gradient := NEW."bgGradient";
    NEW."bgGradient" := NULL;
  ELSIF NEW.bggradient IS NOT NULL AND NEW.bggradient != '' THEN
    NEW.bg_gradient := NEW.bggradient;
    NEW.bggradient := NULL;
  END IF;
  
  IF NEW."isActive" IS NOT NULL THEN
    NEW.is_active := NEW."isActive";
    NEW."isActive" := NULL;
  ELSIF NEW.isactive IS NOT NULL THEN
    NEW.is_active := NEW.isactive;
    NEW.isactive := NULL;
  END IF;
  
  IF NEW."displayOrder" IS NOT NULL THEN
    NEW.display_order := NEW."displayOrder";
    NEW."displayOrder" := NULL;
  ELSIF NEW.displayorder IS NOT NULL THEN
    NEW.display_order := NEW.displayorder;
    NEW.displayorder := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs BEFORE INSERT or UPDATE
DROP TRIGGER IF EXISTS offers_csv_transform_trigger ON offers;
CREATE TRIGGER offers_csv_transform_trigger
  BEFORE INSERT OR UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION transform_offers_for_insert();

