'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Share2 } from 'lucide-react';
import { ViralSliderConfig, ViralSliderVideo } from '@/types';

const isValidVideoUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname !== 'example.com' && url.length > 0;
  } catch {
    return false;
  }
};

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
  return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop';
};

export default function ViralSlider() {
  const [config, setConfig] = useState<ViralSliderConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/viral-slider')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setConfig(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !config || !config.is_active || !config.videos || config.videos.length === 0) {
    return null;
  }

  return <ViralSliderInstance config={config} />;
}

function ViralSliderInstance({ config }: { config: ViralSliderConfig }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const imageRetryCounts = useRef<Map<number, number>>(new Map());
  const imageRetryTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set());
  const [mutedVideos, setMutedVideos] = useState<Set<number>>(new Set());
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [imageKeys, setImageKeys] = useState<Map<number, number>>(new Map());

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
  }, [config.videos]);

  useEffect(() => {
    if (!config.autoplay || isPaused || config.videos.length === 0) return;

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
  }, [config.autoplay, config.scroll_speed, isPaused, config.videos.length]);

  // Handle video autoplay when in viewport - always active, one at a time
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Skip if hovering over a video
        if (hoveredVideo !== null) return;

        // Find the most centered/visible video
        let mostVisibleIndex: number | null = null;
        let maxVisibility = 0;

        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting) {
            const ratio = entry.intersectionRatio;
            if (ratio > maxVisibility) {
              maxVisibility = ratio;
              mostVisibleIndex = index;
            }
          }
        });

        // Pause all videos first
        videoRefs.current.forEach((video, index) => {
          if (video && index !== mostVisibleIndex) {
            video.pause();
            setPlayingVideos((prev) => {
              if (!prev.has(index)) return prev;
              const next = new Set(prev);
              next.delete(index);
              return next;
            });
          }
        });

        // Play the most visible video
        if (mostVisibleIndex !== null) {
          const video = videoRefs.current.get(mostVisibleIndex);
          if (video && video.paused) {
            video.muted = true; // Always muted by default
            video.play().catch(() => {
              // Autoplay failed, user interaction required
            });
            setPlayingVideos((prev) => {
              if (prev.has(mostVisibleIndex!)) return prev;
              return new Set(prev).add(mostVisibleIndex!);
            });
            setMutedVideos((prev) => {
              if (prev.has(mostVisibleIndex!)) return prev;
              return new Set(prev).add(mostVisibleIndex!);
            });
          }
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1.0] }
    );

    const elements = scrollContainerRef.current.querySelectorAll('[data-index]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [config.videos.length, hoveredVideo]);

  // Handle hover play/pause
  useEffect(() => {
    if (hoveredVideo !== null) {
      // Pause all other videos
      videoRefs.current.forEach((video, index) => {
        if (video && index !== hoveredVideo) {
          video.pause();
          setPlayingVideos((prev) => {
            if (!prev.has(index)) return prev;
            const next = new Set(prev);
            next.delete(index);
            return next;
          });
        }
      });

      // Play hovered video
      const video = videoRefs.current.get(hoveredVideo);
      if (video) {
        video.muted = true; // Always muted by default
        if (video.paused) {
          video.play().catch(() => {
            // Autoplay failed
          });
          setPlayingVideos((prev) => {
            if (prev.has(hoveredVideo)) return prev;
            return new Set(prev).add(hoveredVideo);
          });
        }
        setMutedVideos((prev) => {
          if (prev.has(hoveredVideo)) return prev;
          return new Set(prev).add(hoveredVideo);
        });
      }
    }
  }, [hoveredVideo]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      imageRetryTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      imageRetryTimeouts.current.clear();
    };
  }, []);

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

  const handleVideoMute = (index: number) => {
    const video = videoRefs.current.get(index);
    if (video) {
      video.muted = !video.muted;
      if (video.muted) {
        setMutedVideos((prev) => new Set(prev).add(index));
      } else {
        setMutedVideos((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
      }
    }
  };

  const handleShare = (video: ViralSliderVideo) => {
    if (navigator.share) {
      navigator.share({
        title: video.product_title,
        text: video.caption || '',
        url: video.product_link || window.location.href,
      }).catch(() => {
        // Share failed or cancelled
      });
    } else {
      // Fallback: copy to clipboard
      const url = video.product_link || window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        // Could show a toast notification here
      });
    }
  };

  const setVideoRef = (index: number, video: HTMLVideoElement | null) => {
    if (video) {
      videoRefs.current.set(index, video);
      // Always start muted - don't set state here to avoid infinite loops
      video.muted = true;
      // Only update state if not already in the set
      if (!mutedVideos.has(index)) {
        setMutedVideos((prev) => new Set(prev).add(index));
      }
    } else {
      videoRefs.current.delete(index);
    }
  };

  const handleVideoMouseEnter = (index: number) => {
    setHoveredVideo(index);
  };

  const handleVideoMouseLeave = () => {
    setHoveredVideo(null);
  };

  const handleImageError = (index: number, imageUrl: string) => {
    const currentRetries = imageRetryCounts.current.get(index) || 0;
    const maxRetries = 5;

    const existingTimeout = imageRetryTimeouts.current.get(index);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    if (currentRetries < maxRetries) {
      const newRetryCount = currentRetries + 1;
      imageRetryCounts.current.set(index, newRetryCount);

      const delay = Math.min(1000 * Math.pow(2, currentRetries), 16000);

      const timeout = setTimeout(() => {
        setImageKeys((prev) => {
          const newMap = new Map(prev);
          newMap.set(index, (newMap.get(index) || 0) + 1);
          return newMap;
        });
        imageRetryTimeouts.current.delete(index);
      }, delay);

      imageRetryTimeouts.current.set(index, timeout);
    } else {
      setImageErrors((prev) => new Set(prev).add(index));
      imageRetryTimeouts.current.delete(index);
    }
  };

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
            {config.videos.map((video: ViralSliderVideo, index: number) => {
              const isValidVideo = isValidVideoUrl(video.video_url);
              const isPlaying = playingVideos.has(index);
              const isMuted = mutedVideos.has(index);
              const thumbnailHasError = imageErrors.has(index);
              const isValidThumbnail = isValidImageUrl(video.product_thumbnail) && !thumbnailHasError;

              return (
                <div
                  key={index}
                  data-index={index}
                  className="flex-shrink-0 w-80 md:w-96 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                  onMouseEnter={() => handleVideoMouseEnter(index)}
                  onMouseLeave={handleVideoMouseLeave}
                >
                  {/* Video Container */}
                  <div className="relative w-full aspect-[9/16] bg-black overflow-hidden">
                    {isValidVideo ? (
                      <div className="relative w-full h-full">
                        <video
                          ref={(el) => setVideoRef(index, el)}
                          src={video.video_url}
                          className="w-full h-full object-cover"
                          loop
                          muted={true}
                          playsInline
                          onClick={() => handleVideoPlay(index)}
                        />
                        
                        {/* Video Controls Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <div className="flex items-center justify-between">
                            {/* Social Handle */}
                            <span className="text-white text-sm font-medium">
                              {video.social_handle}
                            </span>
                            
                            {/* Control Icons */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVideoPlay(index);
                                }}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                              >
                                {isPlaying ? (
                                  <Pause className="w-4 h-4 text-white" fill="currentColor" />
                                ) : (
                                  <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVideoMute(index);
                                }}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                                aria-label={isMuted ? 'Unmute' : 'Mute'}
                              >
                                {isMuted ? (
                                  <VolumeX className="w-4 h-4 text-white" />
                                ) : (
                                  <Volume2 className="w-4 h-4 text-white" />
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare(video);
                                }}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                                aria-label="Share"
                              >
                                <Share2 className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Caption Overlay */}
                        {video.caption && (
                          <div className="absolute top-4 left-4 right-4">
                            <p className="text-white text-sm font-medium drop-shadow-lg line-clamp-2">
                              {video.caption}
                            </p>
                          </div>
                        )}

                        {/* Play Button Overlay (when paused) */}
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
                      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                        <p className="text-sm">Video unavailable</p>
                      </div>
                    )}
                  </div>

                  {/* Product Information Card */}
                  <Link
                    href={video.product_link || '#'}
                    className="block p-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Thumbnail */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        {isValidThumbnail ? (
                          <Image
                            key={imageKeys.get(index) || 0}
                            src={video.product_thumbnail}
                            alt={video.product_title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            onError={() => {
                              if (video.product_thumbnail) {
                                handleImageError(index, video.product_thumbnail);
                              }
                            }}
                            onLoad={() => {
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
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-gray-900 mb-1">
                          {video.product_price}
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {video.product_title}
                        </p>
                      </div>
                    </div>
                  </Link>
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

