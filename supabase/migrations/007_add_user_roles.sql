-- Add user roles system
-- This migration adds role support to users via user_metadata

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = user_id 
    AND (raw_user_meta_data->>'role')::text = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = user_id),
    'user'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for products (admin only write)
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;

CREATE POLICY "Only admins can insert products" ON products
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update products" ON products
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete products" ON products
  FOR DELETE USING (is_admin(auth.uid()));

-- Update RLS policies for site_config (admin only write)
DROP POLICY IF EXISTS "Anyone can insert site_config" ON site_config;
DROP POLICY IF EXISTS "Anyone can update site_config" ON site_config;

CREATE POLICY "Only admins can insert site_config" ON site_config
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update site_config" ON site_config
  FOR UPDATE USING (is_admin(auth.uid()));

-- Update RLS policies for offers (admin only write)
-- First check if offers table exists and has policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offers') THEN
    DROP POLICY IF EXISTS "Anyone can insert offers" ON offers;
    DROP POLICY IF EXISTS "Anyone can update offers" ON offers;
    DROP POLICY IF EXISTS "Anyone can delete offers" ON offers;

    CREATE POLICY "Only admins can insert offers" ON offers
      FOR INSERT WITH CHECK (is_admin(auth.uid()));

    CREATE POLICY "Only admins can update offers" ON offers
      FOR UPDATE USING (is_admin(auth.uid()));

    CREATE POLICY "Only admins can delete offers" ON offers
      FOR DELETE USING (is_admin(auth.uid()));
  END IF;
END $$;

-- Update orders policies: users see their own orders, admins see all
DROP POLICY IF EXISTS "Public orders are viewable by everyone" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;

CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Authenticated users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Update order_items policies
DROP POLICY IF EXISTS "Public order_items are viewable by everyone" ON order_items;
DROP POLICY IF EXISTS "Anyone can insert order_items" ON order_items;

CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "Authenticated users can create order items" ON order_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


