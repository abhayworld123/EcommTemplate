'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, ArrowRight } from 'lucide-react';
import { SocialNetworkSliderConfig, SocialNetworkPost } from '@/types';

const isValidMediaUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname !== 'example.com' && url.length > 0;
  } catch {
    return false;
  }
};

const getPlaceholderImage = () => {
  return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=600&fit=crop';
};

export default function SocialNetworkSlider() {
  const [configs, setConfigs] = useState<SocialNetworkSliderConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/social-network-slider')
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
        <SocialNetworkSliderInstance key={config.id} config={config} />
      ))}
    </>
  );
}

function SocialNetworkSliderInstance({ config }: { config: SocialNetworkSliderConfig }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const imageRetryCounts = useRef<Map<number, number>>(new Map());
  const imageRetryTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [imageKeys, setImageKeys] = useState<Map<number, number>>(new Map()); // Force re-render on retry

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
  }, [config.posts]);

  useEffect(() => {
    if (!config.autoplay || isPaused || config.posts.length === 0) return;

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
  }, [config.autoplay, config.scroll_speed, isPaused, config.posts.length]);

  // Handle video autoplay when in viewport
  useEffect(() => {
    if (!config.autoplay) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          const video = videoRefs.current.get(index);
          
          if (entry.isIntersecting && video && config.posts[index]?.media_type === 'video') {
            video.play().catch(() => {
              // Autoplay failed, user interaction required
            });
            setPlayingVideos((prev) => new Set(prev).add(index));
          } else if (video) {
            video.pause();
            setPlayingVideos((prev) => {
              const next = new Set(prev);
              next.delete(index);
              return next;
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    const elements = scrollContainerRef.current?.querySelectorAll('[data-index]');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [config.autoplay, config.posts]);

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

  const handleVideoPlay = (index: number) => {
    const video = videoRefs.current.get(index);
    if (video) {
      if (video.paused) {
        video.play();
        setPlayingVideos((prev) => new Set(prev).add(index));
      } else {
        video.pause();
        setPlayingVideos((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
      }
    }
  };

  const setVideoRef = (index: number, video: HTMLVideoElement | null) => {
    if (video) {
      videoRefs.current.set(index, video);
    } else {
      videoRefs.current.delete(index);
    }
  };

  const handleImageError = (index: number, post: SocialNetworkPost) => {
    const currentRetries = imageRetryCounts.current.get(index) || 0;
    const maxRetries = 5;

    // Clear any existing timeout for this image
    const existingTimeout = imageRetryTimeouts.current.get(index);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    if (currentRetries < maxRetries) {
      // Increment retry count
      const newRetryCount = currentRetries + 1;
      imageRetryCounts.current.set(index, newRetryCount);

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.min(1000 * Math.pow(2, currentRetries), 16000);

      // Schedule retry
      const timeout = setTimeout(() => {
        // Force re-render by updating the key
        setImageKeys((prev) => {
          const newMap = new Map(prev);
          newMap.set(index, (newMap.get(index) || 0) + 1);
          return newMap;
        });
        imageRetryTimeouts.current.delete(index);
      }, delay);

      imageRetryTimeouts.current.set(index, timeout);
    } else {
      // Max retries reached, mark as failed permanently
      setImageErrors((prev) => new Set(prev).add(index));
      imageRetryTimeouts.current.delete(index);
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      imageRetryTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      imageRetryTimeouts.current.clear();
    };
  }, []);

  if (!config.posts || config.posts.length === 0) {
    return null;
  }

  return (
    <div
      className="relative py-4 md:py-6 bg-gray-50"
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
            {config.posts.map((post: SocialNetworkPost, index: number) => {
              const hasError = imageErrors.has(index);
              const retryCount = imageRetryCounts.current.get(index) || 0;
              const isValidUrl = isValidMediaUrl(post.media_url) && !hasError;
              const isVideo = post.media_type === 'video';
              const isPlaying = playingVideos.has(index);

              return (
                <div
                  key={index}
                  data-index={index}
                  className="flex-shrink-0 w-80 md:w-96 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Media Container */}
                  <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
                    {isVideo ? (
                      <div className="relative w-full h-full">
                        <video
                          ref={(el) => setVideoRef(index, el)}
                          src={isValidUrl ? post.media_url : undefined}
                          className="w-full h-full object-cover"
                          loop
                          muted
                          playsInline
                          onClick={() => handleVideoPlay(index)}
                        />
                        {!isPlaying && (
                          <button
                            onClick={() => handleVideoPlay(index)}
                            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                            aria-label="Play video"
                          >
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                              <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                            </div>
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {isValidUrl ? (
                          <Image
                            key={imageKeys.get(index) || 0}
                            src={post.media_url}
                            alt={post.product_title || 'Social post'}
                            width={384}
                            height={512}
                            className="w-full h-full object-cover"
                            onError={() => {
                              handleImageError(index, post);
                            }}
                            onLoad={() => {
                              // Reset retry count on successful load
                              imageRetryCounts.current.delete(index);
                              const timeout = imageRetryTimeouts.current.get(index);
                              if (timeout) {
                                clearTimeout(timeout);
                                imageRetryTimeouts.current.delete(index);
                              }
                            }}
                            unoptimized
                          />
                        ) : (
                          <Image
                            src={getPlaceholderImage()}
                            alt="Placeholder"
                            width={384}
                            height={512}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        )}
                      </>
                    )}

                    {/* Product Tag Overlay */}
                    {post.product_title && (
                      <div
                        className="absolute z-10"
                        style={{
                          left: post.tag_position_x ? `${post.tag_position_x}%` : '50%',
                          top: post.tag_position_y ? `${post.tag_position_y}%` : '30%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <Link
                          href={post.product_link || '#'}
                          className="block bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 text-white hover:bg-black/90 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium line-clamp-1">
                              {post.product_title}
                            </span>
                            <ArrowRight className="w-4 h-4 flex-shrink-0" />
                          </div>
                          {post.product_price && (
                            <div className="text-xs text-gray-300 mt-1">
                              {post.product_price}
                            </div>
                          )}
                        </Link>
                        {/* White circular dot indicator */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-3 h-3 bg-white border-2 border-black rounded-full" />
                      </div>
                    )}

                    {/* Social Handle */}
                    {post.social_handle && (
                      <div className="absolute bottom-4 left-4 z-10">
                        <span className="text-white text-sm font-medium drop-shadow-lg">
                          {post.social_handle}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <div className="p-4">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {post.caption}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
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

