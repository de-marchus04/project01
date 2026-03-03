"use client";

import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";

export const Features = () => {
  const { t } = useLanguage();
  const { observe } = useScrollReveal();

  return (
    <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container py-5">
        <div className="text-center mb-5 reveal-up" ref={observe as any}>
          <span className="section-badge">{t.home.featuresBadge}</span>
          <h2 className="font-playfair display-5 fw-bold mt-4 mb-3">{t.home.featuresTitle}</h2>
        </div>
        <div className="row g-4">
          <div className="col-md-4 text-center reveal-up" ref={observe as any}>
            <div className="p-4">
              <div
                className="icon-breathe d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{
                  width: '84px',
                  height: '84px',
                  backgroundColor: 'var(--color-secondary)',
                  color: 'var(--color-primary)',
                  fontSize: '2rem',
                  border: '2px solid var(--color-accent-subtle)'
                }}
              >
                <i className="bi bi-camera-video"></i>
              </div>
              <h4 className="font-playfair fw-bold mb-3">{t.home.feature1Title}</h4>
              <p className="text-muted font-montserrat">{t.home.feature1Desc}</p>
            </div>
          </div>
          <div className="col-md-4 text-center reveal-up reveal-delay-1" ref={observe as any}>
            <div className="p-4">
              <div
                className="icon-breathe d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{
                  width: '84px',
                  height: '84px',
                  backgroundColor: 'var(--color-secondary)',
                  color: 'var(--color-primary)',
                  fontSize: '2rem',
                  border: '2px solid var(--color-accent-subtle)'
                }}
              >
                <i className="bi bi-calendar-check"></i>
              </div>
              <h4 className="font-playfair fw-bold mb-3">{t.home.feature2Title}</h4>
              <p className="text-muted font-montserrat">{t.home.feature2Desc}</p>
            </div>
          </div>
          <div className="col-md-4 text-center reveal-up reveal-delay-2" ref={observe as any}>
            <div className="p-4">
              <div
                className="icon-breathe d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{
                  width: '84px',
                  height: '84px',
                  backgroundColor: 'var(--color-secondary)',
                  color: 'var(--color-primary)',
                  fontSize: '2rem',
                  border: '2px solid var(--color-accent-subtle)'
                }}
              >
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
