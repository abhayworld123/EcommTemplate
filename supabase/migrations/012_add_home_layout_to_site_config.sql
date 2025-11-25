    -- Add home_layout column to site_config table
    ALTER TABLE site_config 
    ADD COLUMN IF NOT EXISTS home_layout JSONB DEFAULT '["hero_banner", "offers_carousel", "background_image_slider", "product_sliders", "featured_products"]'::JSONB;

    -- Update existing records if any to have the default layout
    UPDATE site_config 
    SET home_layout = '["hero_banner", "offers_carousel", "background_image_slider", "product_sliders", "featured_products"]'::JSONB
    WHERE home_layout IS NULL;



