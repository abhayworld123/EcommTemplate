import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import OffersCarousel from '@/components/OffersCarousel';
import BackgroundImageSlider from '@/components/BackgroundImageSlider';
import ProductSliders from '@/components/ProductSliders';
import HeroBanner from '@/components/HeroBanner';
import FeaturedProducts from '@/components/FeaturedProducts';
import ThreeColumnDesign from '@/components/ThreeColumnDesign';
import FiveColumnDesign from '@/components/FiveColumnDesign';
import SmallProductSlider from '@/components/SmallProductSlider';
import SocialNetworkSlider from '@/components/SocialNetworkSlider';
import ViralSlider from '@/components/ViralSlider';
import { Product } from '@/types';

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createServerClient();
  
  // Get all products ordered by created_at DESC (newest first)
  const { data: allProducts, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error || !allProducts || allProducts.length === 0) {
    return [];
  }
  
  const products = allProducts as Product[];
  
  // Separate featured and non-featured products
  const featured = products.filter(p => p.featured);
  const nonFeatured = products.filter(p => !p.featured);
  
  // Prioritize featured products, then fill with newest non-featured
  const result: Product[] = [];
  
  // Add featured products first (up to 4)
  result.push(...featured.slice(0, 4));
  
  // Fill remaining slots with newest non-featured products
  if (result.length < 4) {
    const needed = 4 - result.length;
    result.push(...nonFeatured.slice(0, needed));
  }
  
  // Return at least 4 products, or all available if less than 4 total
  return result.length >= 4 ? result.slice(0, 4) : result;
}

async function getSiteConfig() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('site_config')
    .select('*')
    .single();
  
  if (error || !data) {
    return {
      id: '1',
      site_name: 'Ecommerce Store',
      banner_image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200',
      description: 'Premium products for your needs',
      home_layout: ['hero_banner', 'offers_carousel', 'background_image_slider', 'product_sliders', 'featured_products'],
    };
  }
  
  return data;
}

async function getSliderConfig() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('slider_config')
    .select('*')
    .single();
  
  if (error || !data) {
    return {
      id: '1',
      images: [],
      autoplay: false,
    };
  }
  
  return data;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const config = await getSiteConfig();
  const sliderConfig = await getSliderConfig();

  const layout = config.home_layout || [
    'hero_banner',
    'offers_carousel',
    'background_image_slider',
    'product_sliders',
    'featured_products',
  ];

  const renderComponent = (componentName: string) => {
    switch (componentName) {
      case 'hero_banner':
        return <HeroBanner key="hero_banner" config={config} />;
      case 'offers_carousel':
        return <OffersCarousel key="offers_carousel" />;
      case 'background_image_slider':
        if (sliderConfig.images && Array.isArray(sliderConfig.images) && sliderConfig.images.length > 0) {
          return (
            <BackgroundImageSlider 
              key="background_image_slider"
              images={sliderConfig.images} 
              autoplay={sliderConfig.autoplay || false}
            />
          );
        }
        return null;
      case 'product_sliders':
        return <ProductSliders key="product_sliders" />;
      case 'featured_products':
        return <FeaturedProducts key="featured_products" products={featuredProducts} config={config} />;
      case 'three_column_design':
        return <ThreeColumnDesign key="three_column_design" />;
      case 'five_column_design':
        return <FiveColumnDesign key="five_column_design" />;
      case 'small_product_slider':
        return <SmallProductSlider key="small_product_slider" />;
      case 'social_network_slider':
        return <SocialNetworkSlider key="social_network_slider" />;
      case 'viral_slider':
        return <ViralSlider key="viral_slider" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {layout.map((componentName: string) => renderComponent(componentName))}
    </div>
  );
}
