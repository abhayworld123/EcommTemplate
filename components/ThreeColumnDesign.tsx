'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThreeColumnDesignConfig, ThreeColumnItem } from '@/types';
import { ChevronRight } from 'lucide-react';

const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    // Check if it's a valid image URL (not example.com placeholder)
    return urlObj.hostname !== 'example.com' && url.length > 0;
  } catch {
    return false;
  }
};

const getPlaceholderImage = () => {
  return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
};

export default function ThreeColumnDesign() {
  const [configs, setConfigs] = useState<ThreeColumnDesignConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const imageRetryCounts = useRef<Map<string, number>>(new Map());
  const imageRetryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [imageKeys, setImageKeys] = useState<Map<string, number>>(new Map());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/three-column-design')
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Column 1 */}
            <div className="flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h2
                  className="text-xl md:text-2xl font-bold text-gray-900"
                  style={{ fontFamily: 'var(--font-roboto)' }}
                >
                  {config.column1_title}
                </h2>
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-3 flex-1">
                {config.column1_items.slice(0, 4).map((item: ThreeColumnItem, index: number) => {
                  const imageKey = `${config.id}-column1-item${index}`;
                  const hasError = imageErrors.has(imageKey);
                  const isValidUrl = isValidImageUrl(item.image_url) && !hasError;
                  
                  return (
                    <Link
                      key={index}
                      href={item.link || '#'}
                      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-gray-100">
                        <Image
                          key={imageKeys.get(imageKey) || 0}
                          src={isValidUrl ? item.image_url! : getPlaceholderImage()}
                          alt={item.title}
                          width={200}
                          height={200}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={() => {
                            if (item.image_url) {
                              handleImageError(imageKey, item.image_url);
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
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                        {item.title}
                      </h3>
                      {item.discount_text && (
                        <span className="text-xs font-medium text-red-600">
                          {item.discount_text}
                        </span>
                      )}
                    </div>
                  </Link>
                  );
                })}
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h2
                  className="text-xl md:text-2xl font-bold text-gray-900"
                  style={{ fontFamily: 'var(--font-roboto)' }}
                >
                  {config.column2_title}
                </h2>
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-3 flex-1">
                {config.column2_items.slice(0, 4).map((item: ThreeColumnItem, index: number) => {
                  const imageKey = `${config.id}-column2-item${index}`;
                  const hasError = imageErrors.has(imageKey);
                  const isValidUrl = isValidImageUrl(item.image_url) && !hasError;
                  
                  return (
                    <Link
                      key={index}
                      href={item.link || '#'}
                      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-gray-100">
                        <Image
                          key={imageKeys.get(imageKey) || 0}
                          src={isValidUrl ? item.image_url! : getPlaceholderImage()}
                          alt={item.title}
                          width={200}
                          height={200}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={() => {
                            if (item.image_url) {
                              handleImageError(imageKey, item.image_url);
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
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                        {item.title}
                      </h3>
                      {item.discount_text && (
                        <span className="text-xs font-medium text-red-600">
                          {item.discount_text}
                        </span>
                      )}
                    </div>
                  </Link>
                  );
                })}
              </div>
            </div>

            {/* Column 3 - Promotional Banner */}
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
              <div className="flex flex-col h-full p-6 justify-between">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: 'var(--font-roboto)' }}
                  >
                    {config.column3_headline}
                  </h2>
                  {config.column3_subheadline && (
                    <p className="text-sm md:text-base text-gray-600 mb-6">
                      {config.column3_subheadline}
                    </p>
                  )}
                </div>
                {(() => {
                  const imageKey = `${config.id}-column3`;
                  const hasError = imageErrors.has(imageKey);
                  const isValidUrl = config.column3_image_url && isValidImageUrl(config.column3_image_url) && !hasError;
                  
                  return isValidUrl ? (
                    <div className="relative w-full aspect-[4/3] mb-6 rounded-lg overflow-hidden">
                      <Image
                        key={imageKeys.get(imageKey) || 0}
                        src={config.column3_image_url!}
                        alt={config.column3_headline}
                        width={400}
                        height={300}
                        className="h-full w-full object-cover"
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
                    </div>
                  ) : null;
                })()}
                <Link
                  href={config.column3_cta_link || '/products'}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-white font-semibold hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {config.column3_cta_text || 'Shop Now'}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

