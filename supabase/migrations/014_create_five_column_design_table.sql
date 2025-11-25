-- Create five_column_design_config table for configurable 5-column layout sections
CREATE TABLE IF NOT EXISTS five_column_design_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  column1_headline TEXT NOT NULL,
  column1_subheadline TEXT,
  column1_cta_text TEXT DEFAULT 'Shop Now' NOT NULL,
  column1_cta_link TEXT DEFAULT '/products' NOT NULL,
  column1_image_url TEXT,
  column2_title TEXT NOT NULL,
  column2_cta_text TEXT DEFAULT 'Shop Now' NOT NULL,
  column2_cta_link TEXT DEFAULT '/products' NOT NULL,
  column2_image_url TEXT,
  column3_title TEXT NOT NULL,
  column3_price_text TEXT,
  column3_cta_text TEXT DEFAULT 'Shop Now' NOT NULL,
  column3_cta_link TEXT DEFAULT '/products' NOT NULL,
  column3_image_url TEXT,
  column4_title TEXT NOT NULL,
  column4_price_text TEXT,
  column4_cta_text TEXT DEFAULT 'Shop Now' NOT NULL,
  column4_cta_link TEXT DEFAULT '/products' NOT NULL,
  column4_image_url TEXT,
  column5_title TEXT NOT NULL,
  column5_price_text TEXT,
  column5_cta_text TEXT DEFAULT 'Shop Now' NOT NULL,
  column5_cta_link TEXT DEFAULT '/products' NOT NULL,
  column5_image_url TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_five_column_design_display_order ON five_column_design_config(display_order);
CREATE INDEX IF NOT EXISTS idx_five_column_design_is_active ON five_column_design_config(is_active);

-- Enable Row Level Security
ALTER TABLE five_column_design_config ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access)
CREATE POLICY "Public five_column_design_config is viewable by everyone" ON five_column_design_config
  FOR SELECT USING (true);

-- Allow inserts (adjust policies based on your security needs)
CREATE POLICY "Anyone can insert five_column_design_config" ON five_column_design_config
  FOR INSERT WITH CHECK (true);

-- Allow updates (adjust policies based on your security needs)
CREATE POLICY "Anyone can update five_column_design_config" ON five_column_design_config
  FOR UPDATE USING (true);

-- Allow deletes (adjust policies based on your security needs)
CREATE POLICY "Anyone can delete five_column_design_config" ON five_column_design_config
  FOR DELETE USING (true);



