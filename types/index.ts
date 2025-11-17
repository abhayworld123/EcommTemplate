export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  user_id?: string;
  email: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  stripe_session_id?: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface SiteConfig {
  id: string;
  site_name: string;
  banner_image: string;
  theme_color?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  social_media?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface ExcelProductRow {
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  featured?: boolean | string;
}

export interface Offer {
  id: string;
  offer_id: string;
  title: string;
  description: string;
  image_url?: string;
  cta_text: string;
  cta_link: string;
  discount: number;
  bg_gradient?: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  created_at?: string;
}

