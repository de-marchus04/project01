"use client";

"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/shared/i18n/LanguageContext";

export const PopularCourses = () => {
  const { t } = useLanguage();
  return (
    <section id="courses" className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <span className="text-uppercase fw-bold" style={{ color: 'var(--color-accent)', letterSpacing: '2px', fontSize: '0.85rem' }}>{t.home.coursesBadge}</span>
          <h2 className="font-playfair display-5 fw-bold mt-2 mb-3">{t.home.coursesTitle}</h2>
          <p className="text-muted font-montserrat mx-auto" style={{ maxWidth: '600px' }}>
            {t.home.coursesSubtitle}
          </p>
        </div>
        <div className="row g-4 justify-content-center">
          <div className="col-md-6 col-lg-3">
            <Link href="/courses-beginners" className="text-decoration-none">
              <div className="card h-100 border-0 text-white overflow-hidden position-relative group-hover" style={{ minHeight: '400px', borderRadius: '20px' }}>
                <Image 
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop" 
                  alt={t.nav.coursesBeginners}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-fit-cover transition-transform duration-500 hover-scale-img" 
                />
                <div className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2" style={{ background: 'linear-gradient(to top, rgba(62, 66, 58, 0.85) 0%, rgba(62, 66, 58, 0) 70%)' }}>
                  <span className="badge bg-white text-dark mb-2 align-self-start">{t.home.course1Badge}</span>
                  <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.coursesBeginners}</h3>
                  <p className="card-text small text-white-50 mb-0">{t.home.course1Desc}</p>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-6 col-lg-3">
            <Link href="/courses-meditation" className="text-decoration-none">
              <div className="card h-100 border-0 text-white overflow-hidden position-relative group-hover" style={{ minHeight: '400px', borderRadius: '20px' }}>
                <Image 
                  src="https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=800&auto=format&fit=crop" 
                  alt={t.nav.coursesMeditation}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-fit-cover transition-transform duration-500 hover-scale-img" 
                />
                <div className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2" style={{ background: 'linear-gradient(to top, rgba(62, 66, 58, 0.85) 0%, rgba(62, 66, 58, 0) 70%)' }}>
                  <span className="badge bg-white text-dark mb-2 align-self-start">{t.home.course2Badge}</span>
                  <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.coursesMeditation}</h3>
                  <p className="card-text small text-white-50 mb-0">{t.home.course2Desc}</p>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-6 col-lg-3">
            <Link href="/courses-back" className="text-decoration-none">
              <div className="card h-100 border-0 text-white overflow-hidden position-relative group-hover" style={{ minHeight: '400px', borderRadius: '20px' }}>
                <Image 
                  src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop" 
                  alt={t.nav.coursesBack}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-fit-cover transition-transform duration-500 hover-scale-img" 
                />
                <div className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2" style={{ background: 'linear-gradient(to top, rgba(62, 66, 58, 0.85) 0%, rgba(62, 66, 58, 0) 70%)' }}>
                  <span className="badge bg-white text-dark mb-2 align-self-start">{t.home.course3Badge}</span>
                  <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.coursesBack}</h3>
                  <p className="card-text small text-white-50 mb-0">{t.home.course3Desc}</p>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-6 col-lg-3">
            <Link href="/courses-women" className="text-decoration-none">
              <div className="card h-100 border-0 text-white overflow-hidden position-relative group-hover" style={{ minHeight: '400px', borderRadius: '20px' }}>
                <Image 
                  src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=800&auto=format&fit=crop" 
                  alt={t.nav.coursesWomen}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-fit-cover transition-transform duration-500 hover-scale-img" 
                />
                <div className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2" style={{ background: 'linear-gradient(to top, rgba(62, 66, 58, 0.85) 0%, rgba(62, 66, 58, 0) 70%)' }}>
                  <span className="badge bg-white text-dark mb-2 align-self-start">{t.home.course4Badge}</span>
                  <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.coursesWomen}</h3>
                  <p className="card-text small text-white-50 mb-0">{t.home.course4Desc}</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
