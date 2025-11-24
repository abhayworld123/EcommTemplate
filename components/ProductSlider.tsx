'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, ProductSliderConfig } from '@/types';
import ProductSliderCard from './ProductSliderCard';

interface ProductSliderProps {
  config: ProductSliderConfig;
  products: Product[];
}

export default function ProductSlider({ config, products }: ProductSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      return () => container.removeEventListener('scroll', checkScrollability);
    }
  }, [products]);

  useEffect(() => {
    if (!config.auto_scroll || isPaused || products.length === 0) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const nextScroll = scrollLeft + clientWidth;
        
        if (nextScroll >= scrollWidth - 10) {
          // Reset to beginning
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, (config.scroll_speed || 5) * 1000);

    return () => clearInterval(interval);
  }, [config.auto_scroll, config.scroll_speed, isPaused, products.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth;
    const newScrollLeft =
      direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
    
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div
      className="relative py-4 md:py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {config.show_title && (
          <div className="mb-6 flex items-center justify-between">
            <h2
              className="text-2xl md:text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'var(--font-roboto)' }}
            >
              {config.title}
            </h2>
            <Link
              href={`/products${config.type === 'category' && config.category ? `?category=${encodeURIComponent(config.category)}` : ''}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              View All →
            </Link>
          </div>
        )}

        <div className="relative">
          {/* Navigation Arrows */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all duration-300 border border-gray-200 hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all duration-300 border border-gray-200 hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {products.map((product, index) => (
              <ProductSliderCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

