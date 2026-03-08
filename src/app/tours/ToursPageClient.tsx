'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTours } from '@/shared/api/tourApi';
import type { Tour } from '@/entities/tour/model/types';
import { HeroSlider } from '@/shared/ui/HeroSlider/HeroSlider';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { formatPrice } from '@/shared/lib/formatPrice';
import { useScrollReveal } from '@/shared/hooks/useScrollReveal';
import { SectionHeader } from '@/shared/ui/SectionHeader/SectionHeader';

export default function ToursPageClient({ initialData }: { initialData: any }) {
  const { t, tData, tStr, lang } = useLanguage();
  const { observe } = useScrollReveal();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    async function loadTours() {
      try {
        const data = await getTours();
        setTours(data);
      } catch (err) {
        console.error('Error loading tours:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTours();
  }, []);

  return (
    <main>
      <section
        className="hero-section page-hero d-flex align-items-center text-center text-white position-relative"
        style={{ height: '60vh', minHeight: '500px', overflow: 'hidden' }}
      >
        <HeroSlider
          pageKey="tours"
          images={[
            'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1599447421405-0753f5d1a5ca?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=2000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=2070&auto=format&fit=crop',
          ]}
        />
        <div className="container position-relative z-2">
          <span
            className="text-uppercase mb-3 d-block small fw-bold"
            style={{ letterSpacing: '2px', color: 'var(--color-secondary)' }}
          >
            {t.programs.toursHeroLabel}
          </span>
          <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            {t.programs.toursHeroTitle}
          </h1>
          <p className="lead mb-5 col-lg-8 mx-auto fw-light" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            {t.programs.toursHeroDesc}
          </p>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container py-5">
          <SectionHeader
            badge={t.home?.toursBadge || t.programs.toursHeroLabel}
            title={t.home?.toursTitle || t.programs.toursHeroTitle}
            subtitle={t.home?.toursDesc}
            observe={observe}
          />

          <div className="row g-4">
            {loading && (
              <div className="col-12 text-center">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            )}

            {!loading &&
              tours.map((tour, index) => {
                const loc_tour = tData ? tData(tour) : tour;
                return (
                  <div
                    key={loc_tour.id}
                    className={`col-lg-6 reveal-up${index > 0 ? ` reveal-delay-${index % 3}` : ''}`}
                    ref={observe as any}
                  >
                    <div
                      className="card border-0 h-100 overflow-hidden"
                      style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    >
                      <div className="row g-0 h-100">
                        <div className="col-md-5">
                          <img
                            src={
                              loc_tour.imageUrl ||
                              'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800'
                            }
                            className="img-fluid h-100 w-100"
                            style={{
                              objectFit: 'cover',
                              minHeight: '250px',
                              borderLeft: '4px solid var(--color-accent)',
                            }}
                            alt={loc_tour.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=800&auto=format&fit=crop';
                            }}
                          />
                        </div>
                        <div className="col-md-7">
                          <div className="card-body d-flex flex-column justify-content-center h-100 p-4">
                            <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                              <span
                                className="badge rounded-pill"
                                style={{
                                  backgroundColor: 'var(--color-accent-subtle)',
                                  color: 'var(--color-accent)',
                                  border: '1px solid rgba(196,113,74,0.2)',
                                  fontWeight: 500,
                                }}
                              >
                                {loc_tour.date}
                              </span>
                              <small className="text-muted">
                                <i className="bi bi-geo-alt-fill me-1" style={{ color: 'var(--color-accent)' }}></i>
                                {loc_tour.location}
                              </small>
                            </div>
                            <div className="d-flex align-items-start justify-content-between mb-2 gap-2">
                              <h4 className="card-title font-playfair fw-bold mb-0">{loc_tour.title}</h4>
                              <span className="fw-bold text-nowrap" style={{ color: 'var(--color-primary)' }}>
                                {formatPrice(loc_tour.price, lang)}
                              </span>
                            </div>
                            <p className="card-text text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                              {loc_tour.description}
                            </p>
                            <div className="mt-auto">
                              <Link
                                href={`/tours/${loc_tour.id}`}
                                className="btn btn-outline-primary-custom rounded-pill px-4"
                              >
                                {tStr('Подробнее')}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
    </main>
  );
}
