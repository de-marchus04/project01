"use client";

import Link from "next/link";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { useEffect, useState } from "react";
import { getTours, Tour } from "@/shared/api/tourApi";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
  "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800",
];

export const Tours = () => {
  const { t, tData } = useLanguage() as any;
  const { observe } = useScrollReveal();
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    getTours().then(data => setTours(data.slice(0, 2))).catch(() => {});
  }, []);

  const displayTours = tours.map((tour, i) => ({
    ...(tData ? tData(tour) : tour),
    imageUrl: tour.imageUrl || FALLBACK_IMAGES[i] || FALLBACK_IMAGES[0],
    href: `/tours/${tour.id}`,
  }));

  const cards = displayTours.length > 0 ? displayTours : [
    {
      id: 'fallback-1',
      title: t.home.tour1Title,
      description: t.home.tour1Desc,
      date: t.home.tour1Days,
      location: t.home.tour1Loc,
      imageUrl: FALLBACK_IMAGES[0],
      href: '/tours',
      price: 0,
    },
    {
      id: 'fallback-2',
      title: t.home.tour2Title,
      description: t.home.tour2Desc,
      date: t.home.tour2Days,
      location: t.home.tour2Loc,
      imageUrl: FALLBACK_IMAGES[1],
      href: '/tours',
      price: 0,
    },
  ];

  return (
    <section id="tours" className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="container py-5">
        <div className="text-center mb-5 reveal-up" ref={observe as any}>
          <span className="section-badge">{t.home.toursBadge}</span>
          <h2 className="font-playfair display-5 fw-bold mt-4 mb-3">{t.home.toursTitle}</h2>
          <p className="text-muted font-montserrat mx-auto" style={{ maxWidth: '600px' }}>
            {t.home.toursDesc}
          </p>
        </div>
        <div className="row g-4">
          {cards.map((card, index) => (
            <div key={card.id} className={`col-lg-6 reveal-up${index > 0 ? ' reveal-delay-1' : ''}`} ref={observe as any}>
              <div className="card border-0 h-100 overflow-hidden">
                <div className="row g-0 h-100">
                  <div className="col-md-5">
                    <img
                      src={card.imageUrl}
                      className="img-fluid h-100 w-100"
                      style={{ objectFit: 'cover', minHeight: '250px', borderLeft: '4px solid var(--color-accent)' }}
                      alt={card.title}
                    />
                  </div>
                  <div className="col-md-7">
                    <div className="card-body d-flex flex-column justify-content-center h-100 p-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span
                          className="badge rounded-pill"
                          style={{
                            backgroundColor: 'var(--color-accent-subtle)',
                            color: 'var(--color-accent)',
                            border: '1px solid rgba(196,113,74,0.2)',
                            fontWeight: 500,
                          }}
                        >
                          {card.date}
                        </span>
                        <small className="text-muted">
                          <i className="bi bi-geo-alt-fill" style={{ color: 'var(--color-accent)' }}></i> {card.location}
                        </small>
                      </div>
                      <h4 className="card-title font-playfair fw-bold mb-3">{card.title}</h4>
                      <p className="card-text text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                        {card.description}
                      </p>
                      <div className="mt-auto">
                        <Link href={card.href} className="btn btn-outline-primary-custom rounded-pill px-4">
                          {t.home.moreDetails}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-5 reveal-up reveal-delay-2" ref={observe as any}>
          <Link href="/tours" className="btn btn-primary-custom rounded-pill px-5 py-3 fw-bold">
            {t.home.viewAllTours}
          </Link>
        </div>
      </div>
    </section>
  );
};
