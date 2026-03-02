"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTours, Tour } from "@/shared/api/tourApi";
import { HeroSlider } from "@/shared/ui/HeroSlider/HeroSlider";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { formatPrice } from "@/shared/lib/formatPrice";

export default function ToursPageClient({ initialData }: { initialData: any }) {
  const { t , tData, tStr} = useLanguage() as any;
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(!initialData);
  const { lang } = useLanguage();

    
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
          <HeroSlider images={["https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2073&auto=format&fit=crop","https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop","https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=2000&auto=format&fit=crop","https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop","https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2000&auto=format&fit=crop"]} />
          <div className="container position-relative z-2">
              <span className="text-uppercase mb-3 d-block small fw-bold" style={{ letterSpacing: '2px', color: 'var(--color-secondary)' }}>{t.programs.toursHeroLabel}</span>
              <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{t.programs.toursHeroTitle}</h1>
              <p className="lead mb-5 col-lg-8 mx-auto fw-light" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                  {t.programs.toursHeroDesc}
              </p>
          </div>
      </section>

      <section className="py-5" style={{ backgroundColor: "var(--color-bg)" }}>
          <div className="container py-5">
              <div className="row g-4">
                  {loading && (
                      <div className="col-12 text-center">
                          <div className="spinner-border text-primary" role="status"></div>
                      </div>
                  )}

                  {!loading && tours.map(tour => { const loc_tour = tData ? tData(tour) : tour; return (
                      <div key={loc_tour.id} className="col-md-6">
                          <div className="card h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
                              <div style={{ height: '250px', overflow: 'hidden', position: 'relative' }}>
                                  <img src={loc_tour.imageUrl} alt={loc_tour.title} className="w-100 h-100" style={{ objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=800&auto=format&fit=crop"; }} />
                              <div className="position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill shadow-sm fw-bold" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)' }}>
                                      {formatPrice(loc_tour.price, lang)}
                                  </div>
                              </div>
                              <div className="card-body p-4 d-flex flex-column">
                                  <div className="d-flex justify-content-between align-items-center mb-3 text-muted small">
                                      <span><i className="bi bi-calendar-event me-2"></i>{loc_tour.date}</span>
                                      <span><i className="bi bi-geo-alt me-2"></i>{loc_tour.location}</span>
                                  </div>
                                  <h3 className="h4 font-playfair fw-bold mb-3">{loc_tour.title}</h3>
                                  <p className="text-muted mb-4 flex-grow-1">{loc_tour.description}</p>
                                  <Link href={`/tours/${loc_tour.id}`} className="btn btn-outline-primary-custom w-100 rounded-pill">{tStr("Подробнее")}</Link>
                              </div>
                          </div>
                      </div>
                  )})}
              </div>
          </div>
      </section>
    </main>
  );
}
