'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTours } from '@/shared/api/tourApi';
import type { Tour, TourStatus } from '@/entities/tour/model/types';
import { getTourStatus } from '@/entities/tour/model/types';
import { HeroSlider } from '@/shared/ui/HeroSlider/HeroSlider';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { useScrollReveal } from '@/shared/hooks/useScrollReveal';
import { SectionHeader } from '@/shared/ui/SectionHeader/SectionHeader';

const STATUS_TABS: { key: TourStatus; label: string; icon: string }[] = [
  { key: 'all', label: 'Все ретриты', icon: 'bi-grid' },
  { key: 'upcoming', label: 'Предстоящие', icon: 'bi-calendar-event' },
  { key: 'current', label: 'Актуальные', icon: 'bi-lightning-charge' },
  { key: 'past', label: 'Прошедшие', icon: 'bi-clock-history' },
];

function formatTourPrice(tour: Tour): string {
  const currency = tour.currency || 'UAH';
  const symbols: Record<string, string> = { UAH: '₴', USD: '$', EUR: '€', RUB: '₽' };
  const sym = symbols[currency] || currency;
  return currency === 'USD' || currency === 'EUR' ? `${sym}${tour.price}` : `${tour.price} ${sym}`;
}

export default function ToursPageClient({ initialData }: { initialData: any }) {
  const { t, tData, tStr } = useLanguage();
  const { observe } = useScrollReveal();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(!initialData);
  const [activeStatus, setActiveStatus] = useState<TourStatus>('all');

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

  const filtered = tours.filter((tour) => {
    if (activeStatus === 'all') return true;
    const status = getTourStatus(tour);
    if (activeStatus === 'upcoming') return status === 'upcoming';
    if (activeStatus === 'current') return status === 'current';
    if (activeStatus === 'past') return status === 'past' || status === 'unknown';
    return true;
  });

  return (
    <main>
      <section
        className="hero-section page-hero d-flex align-items-center text-center text-white position-relative"
        style={{
          height: '60vh',
          minHeight: '500px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #5C6E4F 0%, #3E423A 100%)',
        }}
      >
        <HeroSlider pageKey="tours" />
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

          {/* Status Tabs */}
          <div className="d-flex flex-wrap gap-2 justify-content-center mb-5 reveal-up" ref={observe as any}>
            {STATUS_TABS.map((tab) => {
              const isActive = activeStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveStatus(tab.key)}
                  className="btn rounded-pill px-4 py-2 fw-medium"
                  style={{
                    backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--color-text)',
                    border: `2px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border, #dee2e6)'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <i className={`bi ${tab.icon} me-2`}></i>
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="row g-4">
            {loading && (
              <div className="col-12 text-center">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="col-12 text-center py-5 text-muted">
                <i className="bi bi-calendar-x display-4 d-block mb-3"></i>
                <p>В этой категории пока нет ретритов</p>
              </div>
            )}

            {!loading &&
              filtered.map((tour, index) => {
                const loc_tour = tData ? tData(tour) : tour;
                const status = getTourStatus(loc_tour);
                const statusBadge =
                  status === 'current'
                    ? { label: 'Идёт сейчас', color: '#28a745' }
                    : status === 'upcoming'
                      ? { label: 'Предстоящий', color: 'var(--color-accent)' }
                      : null;
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
                        <div className="col-md-5 position-relative">
                          {statusBadge && (
                            <span
                              className="position-absolute top-0 start-0 m-2 badge rounded-pill"
                              style={{ backgroundColor: statusBadge.color, zIndex: 2, fontSize: '0.75rem' }}
                            >
                              {statusBadge.label}
                            </span>
                          )}
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
                                <i className="bi bi-calendar3 me-1"></i>
                                {loc_tour.date}
                              </span>
                              <small className="text-muted">
                                <i className="bi bi-geo-alt-fill me-1" style={{ color: 'var(--color-accent)' }}></i>
                                {loc_tour.location}
                              </small>
                            </div>
                            <div className="mb-2">
                              <h4 className="card-title font-playfair fw-bold mb-0">{loc_tour.title}</h4>
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
