-- Create background_config table for configurable animated backgrounds
CREATE TABLE IF NOT EXISTS background_config (
  id TEXT PRIMARY KEY DEFAULT '1',
  type TEXT DEFAULT 'gradient' NOT NULL CHECK (type IN ('gradient', 'mesh', 'particles', 'grid')),
  primary_color TEXT DEFAULT '#ffffff',
  secondary_color TEXT DEFAULT '#f3f4f6',
  tertiary_color TEXT DEFAULT '#e5e7eb',
  speed INTEGER DEFAULT 5,
  direction TEXT DEFAULT 'diagonal',
  opacity INTEGER DEFAULT 100,
  blur INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE background_config ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access)
CREATE POLICY "Public background_config is viewable by everyone" ON background_config
  FOR SELECT USING (true);

-- Allow inserts (adjust policies based on your security needs)
CREATE POLICY "Anyone can insert background_config" ON background_config
  FOR INSERT WITH CHECK (true);

-- Allow updates (adjust policies based on your security needs)
CREATE POLICY "Anyone can update background_config" ON background_config
  FOR UPDATE USING (true);


