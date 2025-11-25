import { createServerClient } from '@/lib/supabase-server';
import ProductList from '@/components/ProductList';
import { Product } from '@/types';
import { Filter } from 'lucide-react';

// Force dynamic rendering to ensure searchParams are always fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProducts(category?: string): Promise<Product[]> {
  const supabase = await createServerClient();
  
  // Always fetch all products first, then filter client-side for case-insensitive matching
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error || !data) {
    return [];
  }
  
  // If no category filter, return all products
  if (!category || !category.trim()) {
    return data as Product[];
  }
  
  // Decode and normalize the category parameter
  let decodedCategory: string;
  try {
    decodedCategory = decodeURIComponent(category).trim();
  } catch {
    decodedCategory = category.trim();
  }
  
  // Normalize for comparison (case-insensitive, trim whitespace)
  const normalizedSearchCategory = decodedCategory.toLowerCase().replace(/\s+/g, ' ');
  
  // Filter by category (case-insensitive, handles whitespace variations)
  const filtered = data.filter((p: any) => {
    if (!p.category) return false;
    const normalizedProductCategory = p.category.toLowerCase().trim().replace(/\s+/g, ' ');
    const matches = normalizedProductCategory === normalizedSearchCategory;
    return matches;
  }) as Product[];
  
  // Debug logging
  console.log('Filtering - Search category:', normalizedSearchCategory);
  console.log('Filtering - Total products:', data.length);
  console.log('Filtering - Filtered products:', filtered.length);
  if (filtered.length === 0 && data.length > 0) {
    console.log('Filtering - Sample product categories:', data.slice(0, 5).map((p: any) => p.category));
  }
  
  return filtered;
}

async function getCategories(): Promise<string[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('products')
    .select('category');
  
  if (!data) return [];
  
  const uniqueCategories = Array.from(new Set(data.map((p: any) => p.category).filter(Boolean))) as string[];
  return uniqueCategories;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = params?.category;
  
  // Debug logging (remove in production)
  console.log('Products Page - Category from URL:', category);
  
  const products = await getProducts(category);
  const categories = await getCategories();
  
  // Debug logging
  console.log('Products Page - Filtered products count:', products.length);
  console.log('Products Page - Available categories:', categories);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'var(--font-roboto)' }}
          >
            All Products
          </h1>
          <p className="text-lg text-gray-600">Browse our complete collection</p>
        </div>

        {/* Category Filters */}
        <div className="mb-12 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Filter className="w-5 h-5" />
            <span>Filter:</span>
          </div>
          <a
            href="/products"
            className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
              !category || category === ''
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All
          </a>
          {categories.map((cat) => {
            // Normalize both for comparison (case-insensitive, handle whitespace)
            let normalizedCategory = '';
            if (category) {
              try {
                normalizedCategory = decodeURIComponent(category).trim().toLowerCase().replace(/\s+/g, ' ');
              } catch {
                normalizedCategory = category.trim().toLowerCase().replace(/\s+/g, ' ');
              }
            }
            const normalizedCat = cat.trim().toLowerCase().replace(/\s+/g, ' ');
            const isActive = normalizedCategory === normalizedCat;
            return (
              <a
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </a>
            );
          })}
        </div>

        <ProductList products={products} />
      </div>
    </div>
  );
}

