"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";

const WARM_OVERLAY = 'linear-gradient(to top, rgba(35,25,18,0.95) 0%, rgba(50,38,28,0.5) 55%, rgba(35,25,18,0) 100%)';

export const PlatformSections = () => {
  const { t } = useLanguage();
  const { observe } = useScrollReveal();

  return (
    <section className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="container py-5">
        <div className="text-center mb-5 reveal-up" ref={observe as any}>
          <span className="section-badge">{t.home.platformNav}</span>
          <h2 className="font-playfair display-5 fw-bold mt-4 mb-3">{t.home.platformTitle}</h2>
          <p className="text-muted font-montserrat mx-auto" style={{ maxWidth: '600px' }}>
            {t.home.platformDesc}
          </p>
        </div>
        <div className="row g-4 justify-content-center">
          {/* Курсы */}
          <div className="col-md-6 col-lg-3 reveal-up" ref={observe as any}>
            <Link href="/courses" className="text-decoration-none">
              <div className="card h-100 border-0 text-white overflow-hidden position-relative group-hover" style={{ minHeight: '400px', borderRadius: '20px' }}>
                <Image
                  src="https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=80&w=800&auto=format&fit=crop"
                  alt={t.nav.courses}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-fit-cover"
                />
                <div className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2" style={{ background: WARM_OVERLAY }}>
                  <span className="badge rounded-pill mb-2 align-self-start" style={{ backgroundColor: 'var(--color-accent)', color: '#fff', fontSize: '0.75rem' }}>{t.home.practice}</span>
                  <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.courses}</h3>
                  <p className="card-text small text-white-50 mb-0">{t.home.coursesDesc}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Консультации */}
          <div className="col-md-6 col-lg-3 reveal-up reveal-delay-1" ref={observe as any}>
            <Link href="/consultations" className="text-decoration-none">
              <div className="card h-100 border-0 text-white overflow-hidden position-relative group-hover" style={{ minHeight: '400px', borderRadius: '20px' }}>
                <Image
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop"
                  alt={t.nav.consultations}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-fit-cover"
                />
                <div className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2" style={{ background: WARM_OVERLAY }}>
                  <span className="badge rounded-pill mb-2 align-self-start" style={{ backgroundColor: 'var(--color-accent)', color: '#fff', fontSize: '0.75rem' }}>{t.home.experts}</span>
                  <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.consultations}</h3>
                  <p className="card-text small text-white-50 mb-0">{t.home.consultDesc}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Туры */}
          <div className="col-md-6 col-lg-3 reveal-up reveal-delay-2" ref={observe as any}>
            <Link href="/tours" className="text-decoration-none">
              <div className="card h-100 border-0 text-white overflow-hidden position-relative group-hover" style={{ minHeight: '400px', borderRadius: '20px' }}>
                <Image
                  src="https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=800&auto=format&fit=crop"
                  alt={t.home.travelTitle}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-fit-cover"
                />
                <div className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2" style={{ background: WARM_OVERLAY }}>
                  <span className="badge rounded-pill mb-2 align-self-start" style={{ backgroundColor: 'var(--color-accent)', color: '#fff', fontSize: '0.75rem' }}>{t.home.retreats}</span>
                  <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.tours}</h3>
                  <p className="card-text small text-white-50 mb-0">{t.home.travelDesc}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Блог */}
          <div className="col-md-6 col-lg-3 reveal-up reveal-delay-3" ref={observe as any}>
            <Link href="/blog" className="text-decoration-none">
              <div className="card h-100 border-0 text-white overflow-hidden position-relative group-hover" style={{ minHeight: '400px', borderRadius: '20px' }}>
                <Image
                  src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop"
                  alt={t.nav.blog}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-fit-cover"
                />
                <div className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2" style={{ background: WARM_OVERLAY }}>
                  <span className="badge rounded-pill mb-2 align-self-start" style={{ backgroundColor: 'var(--color-accent)', color: '#fff', fontSize: '0.75rem' }}>{t.home.usefulness}</span>
                  <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.blog}</h3>
                  <p className="card-text small text-white-50 mb-0">{t.home.blogDesc}</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
