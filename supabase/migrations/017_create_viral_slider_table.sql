-- Create viral_slider_config table for configurable video-only slider (single instance)
CREATE TABLE IF NOT EXISTS viral_slider_config (
  id TEXT PRIMARY KEY DEFAULT '1',
  headline TEXT,
  videos JSONB DEFAULT '[]'::JSONB NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  autoplay BOOLEAN DEFAULT false NOT NULL,
  scroll_speed INTEGER DEFAULT 5 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_viral_slider_display_order ON viral_slider_config(display_order);
CREATE INDEX IF NOT EXISTS idx_viral_slider_is_active ON viral_slider_config(is_active);

-- Enable Row Level Security
ALTER TABLE viral_slider_config ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access)
CREATE POLICY "Public viral_slider_config is viewable by everyone" ON viral_slider_config
  FOR SELECT USING (true);

-- Allow inserts (adjust policies based on your security needs)
CREATE POLICY "Anyone can insert viral_slider_config" ON viral_slider_config
  FOR INSERT WITH CHECK (true);

-- Allow updates (adjust policies based on your security needs)
CREATE POLICY "Anyone can update viral_slider_config" ON viral_slider_config
  FOR UPDATE USING (true);

-- Allow deletes (adjust policies based on your security needs)
CREATE POLICY "Anyone can delete viral_slider_config" ON viral_slider_config
  FOR DELETE USING (true);

