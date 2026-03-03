"use client";

"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/shared/i18n/LanguageContext";

export const PlatformSections = () => {
  const { t } = useLanguage();
  return (
    <section className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <span className="text-uppercase fw-bold" style={{ color: 'var(--color-accent)', letterSpacing: '2px', fontSize: '0.85rem' }}>{t.home.platformNav}</span>
          <h2 className="font-playfair display-5 fw-bold mt-2 mb-3">{t.home.platformTitle}</h2>
          <p className="text-muted font-montserrat mx-auto" style={{ maxWidth: '600px' }}>
            {t.home.platformDesc}
          </p>
        </div>
        <div className="row g-4 justify-content-center">
          {/* {t.nav.courses} */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 text-white overflow-hidden position-relative group-hover" style={{ minHeight: '400px', borderRadius: '20px' }}>
              <Image 
                src="https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=80&w=800&auto=format&fit=crop" 
                alt={t.nav.courses}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-fit-cover transition-transform duration-500 hover-scale-img" 
              />
              <div className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2" style={{ background: 'linear-gradient(to top, rgba(62, 66, 58, 0.95) 0%, rgba(62, 66, 58, 0.4) 60%, rgba(62, 66, 58, 0) 100%)' }}>
                <span className="badge bg-white text-dark mb-2 align-self-start">{t.home.practice}</span>
                <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.courses}</h3>
                <p className="card-text small text-white-50 mb-3">{t.home.coursesDesc}</p>
                <div className="d-flex flex-wrap gap-2">
                  <Link href="/courses-beginners" className="btn btn-sm btn-outline-light rounded-pill" style={{ fontSize: '0.75rem' }}>{t.nav.coursesBeginners}</Link>
                  <Link href="/courses-meditation" className="btn btn-sm btn-outline-light rounded-pill" style={{ fontSize: '0.75rem' }}>{t.nav.coursesMeditation}</Link>
                  <Link href="/courses-back" className="btn btn-sm btn-outline-light rounded-pill" style={{ fontSize: '0.75rem' }}>{t.nav.coursesBack}</Link>
                  <Link href="/courses-women" className="btn btn-sm btn-outline-light rounded-pill" style={{ fontSize: '0.75rem' }}>{t.nav.coursesWomen}</Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* {t.nav.consultations} */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 text-white overflow-hidden position-relative group-hover" style={{ minHeight: '400px', borderRadius: '20px' }}>
              <Image 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop" 
                alt={t.nav.consultations}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-fit-cover transition-transform duration-500 hover-scale-img" 
              />
              <div className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2" style={{ background: 'linear-gradient(to top, rgba(62, 66, 58, 0.95) 0%, rgba(62, 66, 58, 0.4) 60%, rgba(62, 66, 58, 0) 100%)' }}>
                <span className="badge bg-white text-dark mb-2 align-self-start">{t.home.experts}</span>
                <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.consultations}</h3>
                <p className="card-text small text-white-50 mb-3">{t.home.consultDesc}</p>
                <div className="d-flex flex-wrap gap-2">
                  <Link href="/consultations-private" className="btn btn-sm btn-outline-light rounded-pill" style={{ fontSize: '0.75rem' }}>{t.nav.consultPrivate}</Link>
                  <Link href="/consultations-nutrition" className="btn btn-sm btn-outline-light rounded-pill" style={{ fontSize: '0.75rem' }}>{t.nav.consultNutrition}</Link>
                  <Link href="/consultations-mentorship" className="btn btn-sm btn-outline-light rounded-pill" style={{ fontSize: '0.75rem' }}>{t.nav.consultMentorship}</Link>
                </div>
              </div>
            </div>
          </div>

          {/* {t.home.travelTitle} */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 text-white overflow-hidden position-relative group-hover" style={{ minHeight: '400px', borderRadius: '20px' }}>
              <Image 
                src="https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=800&auto=format&fit=crop" 
                alt={t.home.travelTitle}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-fit-cover transition-transform duration-500 hover-scale-img" 
              />
              <div className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2" style={{ background: 'linear-gradient(to top, rgba(62, 66, 58, 0.95) 0%, rgba(62, 66, 58, 0.4) 60%, rgba(62, 66, 58, 0) 100%)' }}>
                <span className="badge bg-white text-dark mb-2 align-self-start">{t.home.retreats}</span>
                <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.tours}</h3>
                <p className="card-text small text-white-50 mb-3">{t.home.travelDesc}</p>
                <div className="d-flex flex-wrap gap-2">
                  <Link href="/tours" className="btn btn-sm btn-outline-light rounded-pill" style={{ fontSize: '0.75rem' }}>{t.home.allTours}</Link>
                </div>
              </div>
            </div>
          </div>

          {/* {t.nav.blog} */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 text-white overflow-hidden position-relative group-hover" style={{ minHeight: '400px', borderRadius: '20px' }}>
              <Image 
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop" 
                alt={t.nav.blog}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-fit-cover transition-transform duration-500 hover-scale-img" 
              />
              <div className="card-img-overlay d-flex flex-column justify-content-end p-4 z-2" style={{ background: 'linear-gradient(to top, rgba(62, 66, 58, 0.95) 0%, rgba(62, 66, 58, 0.4) 60%, rgba(62, 66, 58, 0) 100%)' }}>
                <span className="badge bg-white text-dark mb-2 align-self-start">{t.home.usefulness}</span>
                <h3 className="card-title fw-bold font-playfair mb-1">{t.nav.blog}</h3>
                <p className="card-text small text-white-50 mb-3">{t.home.blogDesc}</p>
                <div className="d-flex flex-wrap gap-2">
                  <Link href="/blog-articles" className="btn btn-sm btn-outline-light rounded-pill" style={{ fontSize: '0.75rem' }}>{t.nav.blogArticles}</Link>
                  <Link href="/blog-videos" className="btn btn-sm btn-outline-light rounded-pill" style={{ fontSize: '0.75rem' }}>{t.nav.blogVideos}</Link>
                  <Link href="/blog-podcasts" className="btn btn-sm btn-outline-light rounded-pill" style={{ fontSize: '0.75rem' }}>{t.nav.blogPodcasts}</Link>
                  <Link href="/blog-recipes" className="btn btn-sm btn-outline-light rounded-pill" style={{ fontSize: '0.75rem' }}>{t.nav.blogRecipes}</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
