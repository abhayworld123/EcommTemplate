-- Create slider_config table for background image slider configuration
CREATE TABLE IF NOT EXISTS slider_config (
  id TEXT PRIMARY KEY DEFAULT '1',
  images JSONB DEFAULT '[]'::JSONB NOT NULL,
  autoplay BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_slider_config_id ON slider_config(id);

-- Enable Row Level Security
ALTER TABLE slider_config ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access)
CREATE POLICY "Public slider_config is viewable by everyone" ON slider_config
  FOR SELECT USING (true);

-- Allow inserts (adjust policies based on your security needs)
CREATE POLICY "Anyone can insert slider_config" ON slider_config
  FOR INSERT WITH CHECK (true);

-- Allow updates (adjust policies based on your security needs)
CREATE POLICY "Anyone can update slider_config" ON slider_config
  FOR UPDATE USING (true);

-- Add constraint to ensure max 10 images (enforced at application level, but document here)
-- Note: Application should validate array length <= 10


