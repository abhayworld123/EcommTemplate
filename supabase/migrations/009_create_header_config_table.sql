-- Create header_config table for configurable header/navbar
CREATE TABLE IF NOT EXISTS header_config (
  id TEXT PRIMARY KEY DEFAULT '1',
  style TEXT DEFAULT 'default' NOT NULL,
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#1f2937',
  hover_color TEXT DEFAULT '#2563eb',
  accent_color TEXT DEFAULT '#2563eb',
  logo_url TEXT,
  logo_text TEXT,
  sticky BOOLEAN DEFAULT true NOT NULL,
  transparent_on_top BOOLEAN DEFAULT false NOT NULL,
  navigation_items JSONB DEFAULT '[]'::JSONB NOT NULL,
  show_search BOOLEAN DEFAULT false NOT NULL,
  show_cart BOOLEAN DEFAULT true NOT NULL,
  show_user_menu BOOLEAN DEFAULT true NOT NULL,
  height TEXT DEFAULT '80px',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_header_config_id ON header_config(id);

-- Enable Row Level Security
ALTER TABLE header_config ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access)
CREATE POLICY "Public header_config is viewable by everyone" ON header_config
  FOR SELECT USING (true);

-- Allow inserts (adjust policies based on your security needs)
CREATE POLICY "Anyone can insert header_config" ON header_config
  FOR INSERT WITH CHECK (true);

-- Allow updates (adjust policies based on your security needs)
CREATE POLICY "Anyone can update header_config" ON header_config
  FOR UPDATE USING (true);


