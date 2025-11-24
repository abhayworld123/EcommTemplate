'use client';

import { useState, useEffect } from 'react';
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
                {config.column1_items.slice(0, 4).map((item: ThreeColumnItem, index: number) => (
                  <Link
                    key={index}
                    href={item.link || '#'}
                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-gray-100">
                      <Image
                        src={isValidImageUrl(item.image_url) ? item.image_url! : getPlaceholderImage()}
                        alt={item.title}
                        width={200}
                        height={200}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getPlaceholderImage();
                        }}
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
                ))}
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
                {config.column2_items.slice(0, 4).map((item: ThreeColumnItem, index: number) => (
                  <Link
                    key={index}
                    href={item.link || '#'}
                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-gray-100">
                      <Image
                        src={isValidImageUrl(item.image_url) ? item.image_url! : getPlaceholderImage()}
                        alt={item.title}
                        width={200}
                        height={200}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getPlaceholderImage();
                        }}
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
                ))}
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
                {config.column3_image_url && isValidImageUrl(config.column3_image_url) && (
                  <div className="relative w-full aspect-[4/3] mb-6 rounded-lg overflow-hidden">
                    <Image
                      src={config.column3_image_url}
                      alt={config.column3_headline}
                      width={400}
                      height={300}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
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

