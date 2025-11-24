'use client';

import Link from 'next/link';
import { Product, SiteConfig } from '@/types';
import ProductList from '@/components/ProductList';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedProductsProps {
  products: Product[];
  config: SiteConfig;
}

export default function FeaturedProducts({ products, config }: FeaturedProductsProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <div className="inline-block mb-4">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
            Featured
          </span>
        </div>
        <h2 
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: 'var(--font-roboto)' }}
        >
          Featured Products
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {config.description}
        </p>
      </div>
      {products.length > 0 ? (
        <ProductList products={products} />
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
  );
}

