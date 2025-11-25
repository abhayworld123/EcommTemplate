-- Create small_product_slider_config table for configurable horizontal product slider sections
CREATE TABLE IF NOT EXISTS small_product_slider_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  headline TEXT NOT NULL,
  products JSONB DEFAULT '[]'::JSONB NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  autoplay BOOLEAN DEFAULT false NOT NULL,
  scroll_speed INTEGER DEFAULT 5 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_small_product_slider_display_order ON small_product_slider_config(display_order);
CREATE INDEX IF NOT EXISTS idx_small_product_slider_is_active ON small_product_slider_config(is_active);

-- Enable Row Level Security
ALTER TABLE small_product_slider_config ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access)
CREATE POLICY "Public small_product_slider_config is viewable by everyone" ON small_product_slider_config
  FOR SELECT USING (true);

-- Allow inserts (adjust policies based on your security needs)
CREATE POLICY "Anyone can insert small_product_slider_config" ON small_product_slider_config
  FOR INSERT WITH CHECK (true);

-- Allow updates (adjust policies based on your security needs)
CREATE POLICY "Anyone can update small_product_slider_config" ON small_product_slider_config
  FOR UPDATE USING (true);

-- Allow deletes (adjust policies based on your security needs)
CREATE POLICY "Anyone can delete small_product_slider_config" ON small_product_slider_config
  FOR DELETE USING (true);

