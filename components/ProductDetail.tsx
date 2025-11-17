'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Minus, Plus, Tag, Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-32 pb-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl"
        >
          <Image
            src={product.image_url || '/placeholder-watch.jpg'}
            alt={product.name}
            width={800}
            height={800}
            className="h-full w-full object-cover"
            priority
          />
        </motion.div>

        {/* Details Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col"
        >
          <div className="mb-6">
            {product.featured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full mb-4">
                <Tag className="w-3 h-3" />
                Featured
              </span>
            )}
            <h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Product Info Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Category</span>
              </div>
              <p className="font-semibold text-gray-900">{product.category}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">Stock</span>
              </div>
              <p className="font-semibold text-gray-900">
                {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
              </p>
            </div>
          </div>

          {/* Add to Cart Section */}
          {product.stock > 0 ? (
            <div className="mt-auto space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center rounded-xl border-2 border-gray-200 overflow-hidden">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </motion.button>
                  <span className="w-16 px-4 py-3 text-center font-semibold text-gray-900 bg-gray-50">
                    {quantity}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="btn-premium w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </motion.button>
              {product.stock < 10 && (
                <p className="text-sm text-orange-600 font-medium text-center">
                  ⚠️ Only {product.stock} left in stock!
                </p>
              )}
            </div>
          ) : (
            <div className="mt-auto">
              <button
                disabled
                className="w-full rounded-xl bg-gray-200 px-8 py-4 text-lg font-semibold text-gray-500 cursor-not-allowed"
              >
                Out of Stock
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

