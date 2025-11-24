'use client';

import { useState, useEffect } from 'react';
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
                {config.column1_image_url && isValidImageUrl(config.column1_image_url) && (
                  <div className="relative w-full aspect-[4/3] mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={config.column1_image_url}
                      alt={config.column1_headline}
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
                  {config.column2_image_url && isValidImageUrl(config.column2_image_url) ? (
                    <Image
                      src={config.column2_image_url}
                      alt={config.column2_title}
                      width={300}
                      height={225}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage();
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
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
                  {config.column3_image_url && isValidImageUrl(config.column3_image_url) ? (
                    <Image
                      src={config.column3_image_url}
                      alt={config.column3_title}
                      width={300}
                      height={225}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage();
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
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
                  {config.column4_image_url && isValidImageUrl(config.column4_image_url) ? (
                    <Image
                      src={config.column4_image_url}
                      alt={config.column4_title}
                      width={300}
                      height={225}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage();
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
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
                  {config.column5_image_url && isValidImageUrl(config.column5_image_url) ? (
                    <Image
                      src={config.column5_image_url}
                      alt={config.column5_title}
                      width={300}
                      height={225}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage();
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
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

