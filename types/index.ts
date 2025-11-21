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

export interface SliderConfig {
  id: string;
  images: string[];
  autoplay: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NavigationItem {
  label: string;
  href: string;
}

export interface HeaderConfig {
  id: string;
  style: 'default' | 'centered' | 'minimal' | 'modern' | 'classic';
  background_color: string;
  text_color: string;
  hover_color: string;
  accent_color: string;
  logo_url?: string;
  logo_text?: string;
  sticky: boolean;
  transparent_on_top: boolean;
  navigation_items: NavigationItem[];
  show_search: boolean;
  show_cart: boolean;
  show_user_menu: boolean;
  height: string;
  created_at?: string;
  updated_at?: string;
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

export interface ProductSliderConfig {
  id: string;
  title: string;
  type: 'all' | 'category' | 'featured' | 'newest';
  category?: string;
  limit_count: number;
  display_order: number;
  show_title: boolean;
  auto_scroll: boolean;
  scroll_speed: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BackgroundConfig {
  id: string;
  type: 'gradient' | 'mesh' | 'particles' | 'grid';
  primary_color: string;
  secondary_color: string;
  tertiary_color: string;
  speed: number;
  direction: string;
  opacity: number;
  blur: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

