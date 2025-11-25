-- Create three_column_design_config table for configurable 3-column layout sections
CREATE TABLE IF NOT EXISTS three_column_design_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  column1_title TEXT NOT NULL,
  column1_items JSONB DEFAULT '[]'::JSONB NOT NULL,
  column2_title TEXT NOT NULL,
  column2_items JSONB DEFAULT '[]'::JSONB NOT NULL,
  column3_headline TEXT NOT NULL,
  column3_subheadline TEXT,
  column3_cta_text TEXT DEFAULT 'Shop Now' NOT NULL,
  column3_cta_link TEXT DEFAULT '/products' NOT NULL,
  column3_image_url TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_three_column_design_display_order ON three_column_design_config(display_order);
CREATE INDEX IF NOT EXISTS idx_three_column_design_is_active ON three_column_design_config(is_active);

-- Enable Row Level Security
ALTER TABLE three_column_design_config ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access)
CREATE POLICY "Public three_column_design_config is viewable by everyone" ON three_column_design_config
  FOR SELECT USING (true);

-- Allow inserts (adjust policies based on your security needs)
CREATE POLICY "Anyone can insert three_column_design_config" ON three_column_design_config
  FOR INSERT WITH CHECK (true);

-- Allow updates (adjust policies based on your security needs)
CREATE POLICY "Anyone can update three_column_design_config" ON three_column_design_config
  FOR UPDATE USING (true);

-- Allow deletes (adjust policies based on your security needs)
CREATE POLICY "Anyone can delete three_column_design_config" ON three_column_design_config
  FOR DELETE USING (true);



