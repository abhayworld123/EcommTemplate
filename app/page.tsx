import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import ProductList from '@/components/ProductList';
import OffersCarousel from '@/components/OffersCarousel';
import { Product } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';

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
      site_name: 'Ecommerce Store',
      banner_image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200',
      description: 'Premium products for your needs',
    };
  }
  
  return data;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const config = await getSiteConfig();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Premium Hero Banner */}
      <div className="relative h-[600px] md:h-[700px] w-full overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${config.banner_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200'})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full items-center justify-center px-4">
          <div className="text-center text-white max-w-4xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Premium Collection</span>
            </div>
            <h1 
              className="mb-6 text-5xl md:text-7xl font-bold leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {config.site_name}
            </h1>
            <p className="mb-10 text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto">
              {config.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="group btn-premium inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                Shop Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-md px-8 py-4 text-lg font-semibold text-white border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </div>
      </div>

      {/* Offers Carousel */}
      <OffersCarousel />

      {/* Featured Products Section */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              Featured
            </span>
          </div>
          <h2 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium timepieces
          </p>
        </div>
        {featuredProducts.length > 0 ? (
          <ProductList products={featuredProducts} />
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-lg text-gray-600 font-medium mb-2">No featured products yet</p>
            <p className="text-sm text-gray-500 mb-6">Add products via admin panel to get started</p>
            <Link
              href="/admin/products/import"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Import Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
