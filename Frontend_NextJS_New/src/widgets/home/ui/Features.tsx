"use client";

import { useLanguage } from "@/shared/i18n/LanguageContext";

export const Features = () => {
  const { t } = useLanguage();
  return (
    <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <span className="text-uppercase fw-bold" style={{ color: 'var(--color-primary)', letterSpacing: '2px', fontSize: '0.85rem' }}>{t.home.featuresBadge}</span>
          <h2 className="font-playfair display-5 fw-bold mt-2 mb-3">{t.home.featuresTitle}</h2>
        </div>
        <div className="row g-4">
          <div className="col-md-4 text-center">
            <div className="p-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)', fontSize: '2rem' }}>
                <i className="bi bi-camera-video"></i>
              </div>
              <h4 className="font-playfair fw-bold mb-3">{t.home.feature1Title}</h4>
              <p className="text-muted font-montserrat">{t.home.feature1Desc}</p>
            </div>
          </div>
          <div className="col-md-4 text-center">
            <div className="p-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)', fontSize: '2rem' }}>
                <i className="bi bi-calendar-check"></i>
              </div>
              <h4 className="font-playfair fw-bold mb-3">{t.home.feature2Title}</h4>
              <p className="text-muted font-montserrat">{t.home.feature2Desc}</p>
            </div>
          </div>
          <div className="col-md-4 text-center">
            <div className="p-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)', fontSize: '2rem' }}>
                <i className="bi bi-heart-pulse"></i>
              </div>
              <h4 className="font-playfair fw-bold mb-3">{t.home.feature3Title}</h4>
              <p className="text-muted font-montserrat">{t.home.feature3Desc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
