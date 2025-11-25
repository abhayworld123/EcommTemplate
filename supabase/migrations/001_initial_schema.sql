-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT,
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_config table
CREATE TABLE IF NOT EXISTS site_config (
  id TEXT PRIMARY KEY DEFAULT '1',
  site_name TEXT NOT NULL,
  banner_image TEXT,
  description TEXT,
  theme_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional, adjust as needed)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access, adjust as needed)
CREATE POLICY "Public products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Public orders are viewable by everyone" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Public order_items are viewable by everyone" ON order_items
  FOR SELECT USING (true);

CREATE POLICY "Public site_config is viewable by everyone" ON site_config
  FOR SELECT USING (true);

-- Allow inserts (adjust policies based on your security needs)
CREATE POLICY "Anyone can insert products" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert order_items" ON order_items
  FOR INSERT WITH CHECK (true);

