'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { SmallProductSliderConfig, SmallProductSliderItem } from '@/types';

const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname !== 'example.com' && url.length > 0;
  } catch {
    return false;
  }
};

const getPlaceholderImage = () => {
  return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
};

export default function SmallProductSlider() {
  const [configs, setConfigs] = useState<SmallProductSliderConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/small-product-slider')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setConfigs(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading || configs.length === 0) {
    return null;
  }

  return (
    <>
      {configs.map((config) => (
        <SmallProductSliderInstance key={config.id} config={config} />
      ))}
    </>
  );
}

function SmallProductSliderInstance({ config }: { config: SmallProductSliderConfig }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

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
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [config.products]);

  useEffect(() => {
    if (!config.autoplay || isPaused || config.products.length === 0) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const nextScroll = scrollLeft + clientWidth;
        
        if (nextScroll >= scrollWidth - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, (config.scroll_speed || 5) * 1000);

    return () => clearInterval(interval);
  }, [config.autoplay, config.scroll_speed, isPaused, config.products.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    const newScrollLeft =
      direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
    
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  if (!config.products || config.products.length === 0) {
    return null;
  }

  return (
    <div
      className="relative py-4 md:py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        {config.headline && (
          <h2
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: 'var(--font-roboto)' }}
          >
            {config.headline}
          </h2>
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
            {config.products.map((product: SmallProductSliderItem, index: number) => (
              <Link
                key={index}
                href={product.link || '#'}
                className="group flex-shrink-0 w-64 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                  {product.sponsored && (
                    <span className="absolute top-2 left-2 z-10 px-2 py-1 text-xs font-semibold text-gray-700 bg-white/90 rounded">
                      Sponsored
                    </span>
                  )}
                  <button
                    className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle wishlist
                    }}
                    aria-label="Add to wishlist"
                  >
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                  {(() => {
                    const hasError = imageErrors.has(index);
                    const imageUrl = product.image_url && isValidImageUrl(product.image_url) && !hasError
                      ? product.image_url
                      : getPlaceholderImage();
                    
                    return (
                      <Image
                        src={imageUrl}
                        alt={product.title || 'Product image'}
                        width={256}
                        height={256}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => {
                          setImageErrors((prev) => new Set(prev).add(index));
                        }}
                        unoptimized
                      />
                    );
                  })()}
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <p className="text-lg font-bold text-gray-900">
                      {product.price}
                      {product.unit_price && (
                        <span className="text-sm font-normal text-gray-600 ml-1">
                          {product.unit_price}
                        </span>
                      )}
                    </p>
                  </div>
                  {product.description && (
                    <p className="text-sm text-gray-700 line-clamp-2 mb-1">
                      {product.description}
                    </p>
                  )}
                  {product.title && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {product.title}
                    </p>
                  )}
                </div>
              </Link>
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

