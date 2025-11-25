'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiveColumnDesignConfig } from '@/types';
import { ChevronRight } from 'lucide-react';

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

export default function FiveColumnDesign() {
  const [configs, setConfigs] = useState<FiveColumnDesignConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const imageRetryCounts = useRef<Map<string, number>>(new Map());
  const imageRetryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [imageKeys, setImageKeys] = useState<Map<string, number>>(new Map());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/five-column-design')
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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      imageRetryTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      imageRetryTimeouts.current.clear();
    };
  }, []);

  const handleImageError = (imageKey: string, imageUrl: string) => {
    const currentRetries = imageRetryCounts.current.get(imageKey) || 0;
    const maxRetries = 5;

    // Clear any existing timeout for this image
    const existingTimeout = imageRetryTimeouts.current.get(imageKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    if (currentRetries < maxRetries) {
      // Increment retry count
      const newRetryCount = currentRetries + 1;
      imageRetryCounts.current.set(imageKey, newRetryCount);

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.min(1000 * Math.pow(2, currentRetries), 16000);

      // Schedule retry
      const timeout = setTimeout(() => {
        // Force re-render by updating the key
        setImageKeys((prev) => {
          const newMap = new Map(prev);
          newMap.set(imageKey, (newMap.get(imageKey) || 0) + 1);
          return newMap;
        });
        imageRetryTimeouts.current.delete(imageKey);
      }, delay);

      imageRetryTimeouts.current.set(imageKey, timeout);
    } else {
      // Max retries reached, mark as failed permanently
      setImageErrors((prev) => new Set(prev).add(imageKey));
      imageRetryTimeouts.current.delete(imageKey);
    }
  };

  if (loading || configs.length === 0) {
    return null;
  }

  return (
    <>
      {configs.map((config) => (
        <div key={config.id} className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Column 1 - Large Promotional Tile */}
            <div className="lg:col-span-2 relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm">
              <div className="flex flex-col h-full p-6 justify-between">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: 'var(--font-roboto)' }}
                  >
                    {config.column1_headline}
                  </h2>
                  {config.column1_subheadline && (
                    <p className="text-sm md:text-base text-gray-600 mb-4">
                      {config.column1_subheadline}
                    </p>
                  )}
                </div>
                {(() => {
                  const imageKey = `${config.id}-column1`;
                  const hasError = imageErrors.has(imageKey);
                  const isValidUrl = config.column1_image_url && isValidImageUrl(config.column1_image_url) && !hasError;
                  
                  return isValidUrl ? (
                    <div className="relative w-full aspect-[4/3] mb-4 rounded-lg overflow-hidden">
                      <Image
                        key={imageKeys.get(imageKey) || 0}
                        src={config.column1_image_url}
                        alt={config.column1_headline}
                        width={400}
                        height={300}
                        className="h-full w-full object-cover"
                        onError={() => {
                          if (config.column1_image_url) {
                            handleImageError(imageKey, config.column1_image_url);
                          }
                        }}
                        onLoad={() => {
                          // Reset retry count on successful load
                          imageRetryCounts.current.delete(imageKey);
                          const timeout = imageRetryTimeouts.current.get(imageKey);
                          if (timeout) {
                            clearTimeout(timeout);
                            imageRetryTimeouts.current.delete(imageKey);
                          }
                        }}
                        unoptimized
                      />
                    </div>
                  ) : null;
                })()}
                <Link
                  href={config.column1_cta_link || '/products'}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-white font-semibold hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {config.column1_cta_text || 'Shop Now'}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Columns 2-5 - 2x2 Grid */}
            <div className="lg:col-span-3 grid grid-cols-2 gap-4">
              {/* Column 2 - Top Left */}
              <Link
                href={config.column2_cta_link || '/products'}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {(() => {
                    const imageKey = `${config.id}-column2`;
                    const hasError = imageErrors.has(imageKey);
                    const isValidUrl = config.column2_image_url && isValidImageUrl(config.column2_image_url) && !hasError;
                    
                    return isValidUrl ? (
                      <Image
                        key={imageKeys.get(imageKey) || 0}
                        src={config.column2_image_url}
                        alt={config.column2_title}
                        width={300}
                        height={225}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => {
                          if (config.column2_image_url) {
                            handleImageError(imageKey, config.column2_image_url);
                          }
                        }}
                        onLoad={() => {
                          // Reset retry count on successful load
                          imageRetryCounts.current.delete(imageKey);
                          const timeout = imageRetryTimeouts.current.get(imageKey);
                          if (timeout) {
                            clearTimeout(timeout);
                            imageRetryTimeouts.current.delete(imageKey);
                          }
                        }}
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    );
                  })()}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                    {config.column2_title}
                  </h3>
                  <span className="text-sm text-blue-600 font-medium hover:underline">
                    {config.column2_cta_text || 'Shop Now'} →
                  </span>
                </div>
              </Link>

              {/* Column 3 - Top Right */}
              <Link
                href={config.column3_cta_link || '/products'}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {(() => {
                    const imageKey = `${config.id}-column3`;
                    const hasError = imageErrors.has(imageKey);
                    const isValidUrl = config.column3_image_url && isValidImageUrl(config.column3_image_url) && !hasError;
                    
                    return isValidUrl ? (
                      <Image
                        key={imageKeys.get(imageKey) || 0}
                        src={config.column3_image_url}
                        alt={config.column3_title}
                        width={300}
                        height={225}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => {
                          if (config.column3_image_url) {
                            handleImageError(imageKey, config.column3_image_url);
                          }
                        }}
                        onLoad={() => {
                          // Reset retry count on successful load
                          imageRetryCounts.current.delete(imageKey);
                          const timeout = imageRetryTimeouts.current.get(imageKey);
                          if (timeout) {
                            clearTimeout(timeout);
                            imageRetryTimeouts.current.delete(imageKey);
                          }
                        }}
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    );
                  })()}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                    {config.column3_title}
                  </h3>
                  {config.column3_price_text && (
                    <p className="text-sm text-gray-600 mb-2">{config.column3_price_text}</p>
                  )}
                  <span className="text-sm text-blue-600 font-medium hover:underline">
                    {config.column3_cta_text || 'Shop Now'} →
                  </span>
                </div>
              </Link>

              {/* Column 4 - Bottom Left */}
              <Link
                href={config.column4_cta_link || '/products'}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {(() => {
                    const imageKey = `${config.id}-column4`;
                    const hasError = imageErrors.has(imageKey);
                    const isValidUrl = config.column4_image_url && isValidImageUrl(config.column4_image_url) && !hasError;
                    
                    return isValidUrl ? (
                      <Image
                        key={imageKeys.get(imageKey) || 0}
                        src={config.column4_image_url}
                        alt={config.column4_title}
                        width={300}
                        height={225}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => {
                          if (config.column4_image_url) {
                            handleImageError(imageKey, config.column4_image_url);
                          }
                        }}
                        onLoad={() => {
                          // Reset retry count on successful load
                          imageRetryCounts.current.delete(imageKey);
                          const timeout = imageRetryTimeouts.current.get(imageKey);
                          if (timeout) {
                            clearTimeout(timeout);
                            imageRetryTimeouts.current.delete(imageKey);
                          }
                        }}
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    );
                  })()}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                    {config.column4_title}
                  </h3>
                  {config.column4_price_text && (
                    <p className="text-sm text-gray-600 mb-2">{config.column4_price_text}</p>
                  )}
                  <span className="text-sm text-blue-600 font-medium hover:underline">
                    {config.column4_cta_text || 'Shop Now'} →
                  </span>
                </div>
              </Link>

              {/* Column 5 - Bottom Right */}
              <Link
                href={config.column5_cta_link || '/products'}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {(() => {
                    const imageKey = `${config.id}-column5`;
                    const hasError = imageErrors.has(imageKey);
                    const isValidUrl = config.column5_image_url && isValidImageUrl(config.column5_image_url) && !hasError;
                    
                    return isValidUrl ? (
                      <Image
                        key={imageKeys.get(imageKey) || 0}
                        src={config.column5_image_url}
                        alt={config.column5_title}
                        width={300}
                        height={225}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => {
                          if (config.column5_image_url) {
                            handleImageError(imageKey, config.column5_image_url);
                          }
                        }}
                        onLoad={() => {
                          // Reset retry count on successful load
                          imageRetryCounts.current.delete(imageKey);
                          const timeout = imageRetryTimeouts.current.get(imageKey);
                          if (timeout) {
                            clearTimeout(timeout);
                            imageRetryTimeouts.current.delete(imageKey);
                          }
                        }}
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    );
                  })()}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                    {config.column5_title}
                  </h3>
                  {config.column5_price_text && (
                    <p className="text-sm text-gray-600 mb-2">{config.column5_price_text}</p>
                  )}
                  <span className="text-sm text-blue-600 font-medium hover:underline">
                    {config.column5_cta_text || 'Shop Now'} →
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

