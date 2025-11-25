-- Create offers table for carousel
CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cta_text TEXT NOT NULL,
  cta_link TEXT NOT NULL,
  discount INTEGER DEFAULT 0,
  bg_gradient TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_offers_offer_id ON offers(offer_id);

-- Enable Row Level Security
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access for active offers)
CREATE POLICY "Public active offers are viewable by everyone" ON offers
  FOR SELECT USING (is_active = true);

-- Allow inserts (adjust policies based on your security needs)
CREATE POLICY "Anyone can insert offers" ON offers
  FOR INSERT WITH CHECK (true);

-- Allow updates (adjust policies based on your security needs)
CREATE POLICY "Anyone can update offers" ON offers
  FOR UPDATE USING (true);

-- Allow deletes (adjust policies based on your security needs)
CREATE POLICY "Anyone can delete offers" ON offers
  FOR DELETE USING (true);





