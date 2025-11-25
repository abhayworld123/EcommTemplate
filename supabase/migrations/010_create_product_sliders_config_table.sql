-- Create product_sliders_config table for configurable product slider sections
CREATE TABLE IF NOT EXISTS product_sliders_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'all' NOT NULL CHECK (type IN ('all', 'category', 'featured', 'newest')),
  category TEXT,
  limit_count INTEGER DEFAULT 10 NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  show_title BOOLEAN DEFAULT true NOT NULL,
  auto_scroll BOOLEAN DEFAULT false NOT NULL,
  scroll_speed INTEGER DEFAULT 5 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_sliders_config_display_order ON product_sliders_config(display_order);
CREATE INDEX IF NOT EXISTS idx_product_sliders_config_is_active ON product_sliders_config(is_active);
CREATE INDEX IF NOT EXISTS idx_product_sliders_config_type ON product_sliders_config(type);

-- Enable Row Level Security
ALTER TABLE product_sliders_config ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access)
CREATE POLICY "Public product_sliders_config is viewable by everyone" ON product_sliders_config
  FOR SELECT USING (true);

-- Allow inserts (adjust policies based on your security needs)
CREATE POLICY "Anyone can insert product_sliders_config" ON product_sliders_config
  FOR INSERT WITH CHECK (true);

-- Allow updates (adjust policies based on your security needs)
CREATE POLICY "Anyone can update product_sliders_config" ON product_sliders_config
  FOR UPDATE USING (true);

-- Allow deletes (adjust policies based on your security needs)
CREATE POLICY "Anyone can delete product_sliders_config" ON product_sliders_config
  FOR DELETE USING (true);


