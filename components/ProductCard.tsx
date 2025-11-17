'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/50 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
    >
      {/* Image Container with Overlay */}
      <Link href={`/products/${product.id}`} className="block relative">
        <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
          <Image
            src={product.image_url || '/placeholder-watch.jpg'}
            alt={product.name}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              className="flex gap-2"
            >
              <button className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-900 hover:bg-white transition-colors flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Quick View
              </button>
            </motion.div>
          </div>
          {/* Featured Badge */}
          {product.featured && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
              Featured
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <Link href={`/products/${product.id}`}>
          <h3 className="mb-2 text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-600 leading-relaxed">
          {product.description}
        </p>
        
        {/* Price and Action */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 gap-[10px]">
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatPrice(product.price)}
            </span>
            {product.stock < 10 && product.stock > 0 && (
              <p className="text-xs text-orange-600 font-medium mt-1">
                Only {product.stock} left!
              </p>
            )}
          </div>
          {product.stock > 0 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addItem(product)}
              className="btn-premium rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <ShoppingCart className="w-4 h-4 flex-shrink-0" />
              <span>Add to Cart</span>
            </motion.button>
          ) : (
            <span className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-xl">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

