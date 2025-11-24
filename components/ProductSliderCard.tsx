'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';

interface ProductSliderCardProps {
  product: Product;
  index?: number;
}

export default function ProductSliderCard({ product, index = 0 }: ProductSliderCardProps) {
  const { addItem } = useCart();

  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]">
      <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
        {/* Image Container */}
        <Link href={`/products/${product.id}`} className="block relative">
          <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
            <Image
              src={product.image_url || '/placeholder-watch.jpg'}
              alt={product.name}
              width={320}
              height={320}
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
            />
            {/* Featured Badge */}
            {product.featured && (
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                Featured
              </div>
            )}
            {/* Stock Badge */}
            {product.stock < 10 && product.stock > 0 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                Only {product.stock} left
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <Link href={`/products/${product.id}`}>
            <h3 className="mb-1.5 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
              {product.name}
            </h3>
          </Link>
          
          {product.category && (
            <span className="inline-block mb-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full w-fit">
              {product.category}
            </span>
          )}
          
          {/* Price and Action */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatPrice(product.price)}
              </span>
            </div>
            {product.stock > 0 ? (
              <button
                onClick={() => addItem(product)}
                className="btn-premium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Add</span>
              </button>
            ) : (
              <span className="px-3 py-2 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


