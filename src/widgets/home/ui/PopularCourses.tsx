'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { useScrollReveal } from '@/shared/hooks/useScrollReveal';

const WARM_OVERLAY = 'linear-gradient(to top, rgba(35,25,18,0.88) 0%, rgba(35,25,18,0) 70%)';

export const PopularCourses = () => {
  const { t } = useLanguage();
  const { observe } = useScrollReveal();

  return (
    <section id="courses" className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container py-5">
        <div className="text-center mb-5 reveal-up" ref={observe as any}>
          {/* Botanical SVG веточка */}
          <svg
            width="60"
            height="24"
            viewBox="0 0 60 24"
            fill="none"
            aria-hidden="true"
            style={{ display: 'block', margin: '0 auto 16px', opacity: 0.45 }}
          >
            <path d="M2,12 Q15,2 30,12 Q45,22 58,12" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" />
            <path d="M10,12 Q18,5 22,12" stroke="var(--color-primary)" strokeWidth="1" fill="none" opacity="0.6" />
            <path d="M38,12 Q42,5 50,12" stroke="var(--color-primary)" strokeWidth="1" fill="none" opacity="0.6" />
          </svg>
          <span className="section-badge">{t.home.coursesBadge}</span>
          <h2 className="font-playfair display-5 fw-bold mt-4 mb-3">{t.home.coursesTitle}</h2>
          <p className="text-muted font-montserrat mx-auto" style={{ maxWidth: '600px' }}>
            {t.home.coursesSubtitle}
          </p>
        </div>
        <div className="row g-4 justify-content-center">
          <div className="col-md-6 col-lg-3 reveal-up" ref={observe as any}>
            <Link href="/courses-beginners" className="text-decoration-none">
              <div
                className="card h-100 border-0 text-white overflow-hidden position-relative group-hover"
                style={{ minHeight: '400px', borderRadius: '20px' }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop"
                  alt={t.nav.coursesBeginners}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-fit-cover"
                />
                <div
                  className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2"
                  style={{ background: WARM_OVERLAY }}
                >
                  <span
                    className="badge rounded-pill mb-2 align-self-start"
                    style={{ backgroundColor: 'var(--color-accent)', color: '#fff', fontSize: '0.75rem' }}
                  >
                    {t.home.course1Badge}
                  </span>
                  <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.coursesBeginners}</h3>
                  <p className="card-text small text-white-50 mb-0">{t.home.course1Desc}</p>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-6 col-lg-3 reveal-up reveal-delay-1" ref={observe as any}>
            <Link href="/courses-meditation" className="text-decoration-none">
              <div
                className="card h-100 border-0 text-white overflow-hidden position-relative group-hover"
                style={{ minHeight: '400px', borderRadius: '20px' }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=800&auto=format&fit=crop"
                  alt={t.nav.coursesMeditation}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-fit-cover"
                />
                <div
                  className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2"
                  style={{ background: WARM_OVERLAY }}
                >
                  <span
                    className="badge rounded-pill mb-2 align-self-start"
                    style={{ backgroundColor: 'var(--color-accent)', color: '#fff', fontSize: '0.75rem' }}
                  >
                    {t.home.course2Badge}
                  </span>
                  <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.coursesMeditation}</h3>
                  <p className="card-text small text-white-50 mb-0">{t.home.course2Desc}</p>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-6 col-lg-3 reveal-up reveal-delay-2" ref={observe as any}>
            <Link href="/courses-back" className="text-decoration-none">
              <div
                className="card h-100 border-0 text-white overflow-hidden position-relative group-hover"
                style={{ minHeight: '400px', borderRadius: '20px' }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop"
                  alt={t.nav.coursesBack}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-fit-cover"
                />
                <div
                  className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2"
                  style={{ background: WARM_OVERLAY }}
                >
                  <span
                    className="badge rounded-pill mb-2 align-self-start"
                    style={{ backgroundColor: 'var(--color-accent)', color: '#fff', fontSize: '0.75rem' }}
                  >
                    {t.home.course3Badge}
                  </span>
                  <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.coursesBack}</h3>
                  <p className="card-text small text-white-50 mb-0">{t.home.course3Desc}</p>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-6 col-lg-3 reveal-up reveal-delay-3" ref={observe as any}>
            <Link href="/courses-women" className="text-decoration-none">
              <div
                className="card h-100 border-0 text-white overflow-hidden position-relative group-hover"
                style={{ minHeight: '400px', borderRadius: '20px' }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=800&auto=format&fit=crop"
                  alt={t.nav.coursesWomen}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-fit-cover"
                />
                <div
                  className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2"
                  style={{ background: WARM_OVERLAY }}
                >
                  <span
                    className="badge rounded-pill mb-2 align-self-start"
                    style={{ backgroundColor: 'var(--color-accent)', color: '#fff', fontSize: '0.75rem' }}
                  >
                    {t.home.course4Badge}
                  </span>
                  <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.coursesWomen}</h3>
                  <p className="card-text small text-white-50 mb-0">{t.home.course4Desc}</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="text-center mt-5 reveal-up" ref={observe as any}>
          <Link href="/courses" className="btn btn-primary-custom rounded-pill px-5 py-3 fw-bold fs-5">
            {t.nav.coursesAll} <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};
