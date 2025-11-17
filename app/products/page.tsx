import { createServerClient } from '@/lib/supabase-server';
import ProductList from '@/components/ProductList';
import { Product } from '@/types';
import { Filter } from 'lucide-react';

async function getProducts(category?: string): Promise<Product[]> {
  const supabase = await createServerClient();
  let query = supabase.from('products').select('*');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error || !data) {
    return [];
  }
  return data as Product[];
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
  searchParams: { category?: string };
}) {
  const products = await getProducts(searchParams.category);
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
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
              !searchParams.category
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All
          </a>
          {categories.map((cat) => (
            <a
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                searchParams.category === cat
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </a>
          ))}
        </div>

        <ProductList products={products} />
      </div>
    </div>
  );
}

