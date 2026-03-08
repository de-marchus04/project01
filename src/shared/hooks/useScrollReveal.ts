'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const { threshold = 0.12, rootMargin = '0px 0px -40px 0px', once = true } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<Element>>(new Set());

  const observe = useCallback((el: Element | null) => {
    if (!el) return;
    elementsRef.current.add(el);
    observerRef.current?.observe(el);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            if (once) {
              observerRef.current?.unobserve(entry.target);
              elementsRef.current.delete(entry.target);
            }
          } else if (!once) {
            entry.target.classList.remove('reveal-visible');
          }
        });
      },
      { threshold, rootMargin },
    );

    elementsRef.current.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return { observe };
};
