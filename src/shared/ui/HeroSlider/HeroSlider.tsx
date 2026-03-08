'use client';

import { useState, useEffect } from 'react';

interface SlideItem {
  id?: string;
  url: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  title?: string | null;
}

interface HeroSliderProps {
  /** Fallback images (used when no DB slides found or no pageKey given) */
  images?: string[];
  /** If provided, fetches custom slides from DB for this page key */
  pageKey?: string;
  interval?: number;
  showOverlay?: boolean;
}

export const HeroSlider = ({ images = [], pageKey, interval = 5000, showOverlay = true }: HeroSliderProps) => {
  const [slides, setSlides] = useState<SlideItem[]>(() => images.map((url) => ({ url, mediaType: 'IMAGE' as const })));
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch custom slides from DB if pageKey is provided
  useEffect(() => {
    if (!pageKey) return;
    fetch(`/api/slides?page=${encodeURIComponent(pageKey)}`)
      .then((r) => r.json())
      .then((data: SlideItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
          setCurrentIndex(0);
        }
      })
      .catch(() => {
        /* keep fallback */
      });
  }, [pageKey]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [slides, interval]);

  if (slides.length === 0) return null;

  return (
    <>
      {slides.map((slide, index) => {
        const isVideo = slide.mediaType === 'VIDEO';
        const isActive = index === currentIndex;
        return isVideo ? (
          <div
            key={slide.id ?? index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: isActive ? 1 : 0,
              transition: 'opacity 0.8s ease',
              zIndex: 0,
              overflow: 'hidden',
            }}
          >
            <video
              src={slide.url}
              autoPlay
              muted
              loop
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div
            key={slide.id ?? index}
            className="hero-slider-slide"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url('${slide.url}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: isActive ? 1 : 0,
              zIndex: 0,
            }}
          />
        );
      })}
      {showOverlay && (
        <div
          className="overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(62, 66, 58, 0.6)',
            zIndex: 1,
          }}
        />
      )}
    </>
  );
};
