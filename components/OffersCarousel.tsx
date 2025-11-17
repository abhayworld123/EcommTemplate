'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Offer {
  id: string;
  offer_id: string;
  title: string;
  description: string;
  discount: number;
  cta_text: string;
  cta_link: string;
  image_url?: string;
  bg_gradient?: string;
}

export default function OffersCarousel() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch offers from API
    fetch('/api/offers?active=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOffers(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isPaused || offers.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, offers.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % offers.length);
  };

  // Don't render if loading or no offers
  if (loading || offers.length === 0) {
    return null;
  }

  const currentOffer = offers[currentIndex];
  const bgGradient = currentOffer.bg_gradient || 'from-blue-500 to-purple-600';

  return (
    <div
      className="relative w-full overflow-hidden py-12 md:py-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className={`absolute inset-0 bg-gradient-to-r ${bgGradient} flex items-center justify-between px-8 md:px-16`}
            >
              <div className="flex-1 text-white z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentOffer.discount > 0 && (
                    <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                      <span className="text-2xl md:text-4xl font-bold">
                        {currentOffer.discount}% OFF
                      </span>
                    </div>
                  )}
                  <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {currentOffer.title}
                  </h2>
                  <p className="text-lg md:text-xl text-white/90 mb-8 max-w-md">
                    {currentOffer.description}
                  </p>
                  <Link
                    href={currentOffer.cta_link}
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-gray-900 px-6 py-3 md:px-8 md:py-4 text-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl"
                  >
                    {currentOffer.cta_text}
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
              <div className="hidden md:block flex-1 relative h-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-300 border border-white/30"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-300 border border-white/30"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

