"use client";

import Link from "next/link";
import { useLanguage } from "@/shared/i18n/LanguageContext";

export const Hero = () => {
  const { t } = useLanguage();
  
  return (
    <header 
      className="hero-section d-flex align-items-center justify-content-center position-relative"
      style={{
        minHeight: '100vh',
        background: "linear-gradient(rgba(62, 66, 58, 0.5), rgba(62, 66, 58, 0.7)), url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop') center/cover no-repeat",
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container text-center text-white position-relative z-2">
        <span className="badge bg-white text-dark rounded-pill px-3 py-2 mb-4 fw-normal" style={{ letterSpacing: '1px', color: 'var(--color-text) !important' }}>
          {t.home.heroBadge}
        </span>
        <h1 className="display-1 fw-bold font-playfair mb-4" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {t.home.heroTitle}
        </h1>
        <p className="lead mb-5 fs-4 font-montserrat mx-auto" style={{ maxWidth: '700px', textShadow: '0 2px 15px rgba(0,0,0,0.3)' }}>
          {t.home.heroSubtitle}
        </p>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link href="#courses" className="btn btn-primary-custom rounded-pill px-5 py-3 fw-bold fs-6">
            {t.home.startJourney}
          </Link>
          <Link href="/consultations-private" className="btn btn-outline-light rounded-pill px-5 py-3 fw-bold fs-6">
            {t.home.individual}
          </Link>
        </div>
      </div>
    </header>
  );
};