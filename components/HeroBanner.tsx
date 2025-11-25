'use client';

import Link from 'next/link';
import { SiteConfig } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  config: SiteConfig;
}

export default function HeroBanner({ config }: HeroBannerProps) {
  return (
    <div className="relative h-[600px] md:h-[700px] w-full overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${config.banner_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200'})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="text-center text-white max-w-4xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Premium Collection</span>
          </div>
          <h1 
            className="mb-6 text-5xl md:text-7xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-roboto)' }}
          >
            {config.site_name}
          </h1>
          <p className="mb-10 text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto">
            {config.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="group btn-premium inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
            >
              Shop Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-md px-8 py-4 text-lg font-semibold text-white border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </div>
    </div>
  );
}



