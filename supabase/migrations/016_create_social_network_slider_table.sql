-- Create social_network_slider_config table for configurable social media-style post slider
CREATE TABLE IF NOT EXISTS social_network_slider_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  headline TEXT,
  posts JSONB DEFAULT '[]'::JSONB NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  autoplay BOOLEAN DEFAULT false NOT NULL,
  scroll_speed INTEGER DEFAULT 5 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_social_network_slider_display_order ON social_network_slider_config(display_order);
CREATE INDEX IF NOT EXISTS idx_social_network_slider_is_active ON social_network_slider_config(is_active);

-- Enable Row Level Security
ALTER TABLE social_network_slider_config ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access)
CREATE POLICY "Public social_network_slider_config is viewable by everyone" ON social_network_slider_config
  FOR SELECT USING (true);

-- Allow inserts (adjust policies based on your security needs)
CREATE POLICY "Anyone can insert social_network_slider_config" ON social_network_slider_config
  FOR INSERT WITH CHECK (true);

-- Allow updates (adjust policies based on your security needs)
CREATE POLICY "Anyone can update social_network_slider_config" ON social_network_slider_config
  FOR UPDATE USING (true);

-- Allow deletes (adjust policies based on your security needs)
CREATE POLICY "Anyone can delete social_network_slider_config" ON social_network_slider_config
  FOR DELETE USING (true);

