'use client';

import Link from 'next/link';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { HeroSlider } from '@/shared/ui/HeroSlider/HeroSlider';

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <header
      className="hero-section d-flex align-items-center justify-content-center position-relative"
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background slideshow */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <HeroSlider
          pageKey="home"
          images={['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop']}
          showOverlay={false}
        />
      </div>
      {/* Dark gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(175deg, rgba(40,52,30,0.45) 0%, rgba(20,28,16,0.65) 100%)',
          zIndex: 1,
        }}
      />
      <div className="container text-center text-white position-relative z-2">
        <span
          className="badge rounded-pill px-3 py-2 mb-4 fw-normal d-inline-block"
          style={{
            backgroundColor: 'var(--color-accent-subtle)',
            color: 'var(--color-accent)',
            letterSpacing: '2px',
            fontSize: '0.78rem',
            border: '1px solid rgba(196,113,74,0.3)',
          }}
        >
          {t.home.heroBadge}
        </span>
        <h1
          className="fw-bold font-playfair mb-4"
          style={{
            textShadow: '0 4px 30px rgba(20,18,14,0.5)',
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            letterSpacing: '-1px',
            lineHeight: '1.08',
          }}
        >
          {t.home.heroTitle}
        </h1>
        <p
          className="lead mb-5 font-montserrat mx-auto"
          style={{ maxWidth: '700px', textShadow: '0 2px 15px rgba(0,0,0,0.3)' }}
        >
          {t.home.heroSubtitle}
        </p>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link href="/courses" className="btn btn-primary-custom rounded-pill px-5 py-3 fw-bold fs-6">
            {t.home.startJourney}
          </Link>
          <Link href="/consultations-private" className="btn btn-outline-light rounded-pill px-5 py-3 fw-bold fs-6">
            {t.home.individual}
          </Link>
        </div>

        {/* Scroll-down indicator */}
        <div
          className="float-element d-block mt-5"
          style={{ color: 'rgba(237,229,216,0.6)', fontSize: '1.5rem' }}
          aria-hidden="true"
        >
          <i className="bi bi-chevron-double-down" />
        </div>
      </div>

      {/* Волновой разделитель — Hero → следующая секция */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          lineHeight: 0,
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '80px' }}
        >
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,10 1440,40 L1440,80 L0,80 Z" fill="var(--color-surface)" />
        </svg>
      </div>
    </header>
  );
};
