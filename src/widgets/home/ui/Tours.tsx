"use client";

import Link from "next/link";
import { useLanguage } from "@/shared/i18n/LanguageContext";

export const Tours = () => {
  const { t } = useLanguage();
  return (
    <section id="tours" className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <span className="text-uppercase fw-bold" style={{ color: 'var(--color-primary)', letterSpacing: '2px', fontSize: '0.85rem' }}>{t.home.toursBadge}</span>
          <h2 className="font-playfair display-5 fw-bold mt-2 mb-3">{t.home.toursTitle}</h2>
          <p className="text-muted font-montserrat mx-auto" style={{ maxWidth: '600px' }}>
            {t.home.toursDesc}
          </p>
        </div>
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card border-0 h-100 overflow-hidden">
              <div className="row g-0 h-100">
                <div className="col-md-5">
                  <img 
                    src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800" 
                    className="img-fluid h-100 w-100" 
                    style={{ objectFit: 'cover', minHeight: '250px' }} 
                    alt="Bali" 
                  />
                </div>
                <div className="col-md-7">
                  <div className="card-body d-flex flex-column justify-content-center h-100 p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-light text-dark border">{t.home.tour1Days}</span>
                      <small className="text-muted"><i className="bi bi-geo-alt-fill" style={{ color: 'var(--color-accent)' }}></i> {t.home.tour1Loc}</small>
                    </div>
                    <h4 className="card-title font-playfair fw-bold mb-3">{t.home.tour1Title}</h4>
                    <p className="card-text text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                      {t.home.tour1Desc}
                    </p>
                    <div className="mt-auto">
                      <Link href="/tours/tour-2" className="btn btn-outline-primary-custom rounded-pill px-4">{t.home.moreDetails}</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-6">
            <div className="card border-0 h-100 overflow-hidden">
              <div className="row g-0 h-100">
                <div className="col-md-5">
                  <img 
                    src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800" 
                    className="img-fluid h-100 w-100" 
                    style={{ objectFit: 'cover', minHeight: '250px' }} 
                    alt="Mountains" 
                  />
                </div>
                <div className="col-md-7">
                  <div className="card-body d-flex flex-column justify-content-center h-100 p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-light text-dark border">{t.home.tour2Days}</span>
                      <small className="text-muted"><i className="bi bi-geo-alt-fill" style={{ color: 'var(--color-accent)' }}></i> {t.home.tour2Loc}</small>
                    </div>
                    <h4 className="card-title font-playfair fw-bold mb-3">{t.home.tour2Title}</h4>
                    <p className="card-text text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                      {t.home.tour2Desc}
                    </p>
                    <div className="mt-auto">
                      <Link href="/tours/tour-1" className="btn btn-outline-primary-custom rounded-pill px-4">{t.home.moreDetails}</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-5">
          <Link href="/tours" className="btn btn-primary-custom rounded-pill px-5 py-3 fw-bold">
            {t.home.viewAllTours}
          </Link>
        </div>
      </div>
    </section>
  );
};