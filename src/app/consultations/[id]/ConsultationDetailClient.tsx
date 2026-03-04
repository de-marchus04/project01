"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Course } from "@/entities/course/model/types";
import { getConsultationById } from "@/shared/api/consultationApi";
import { usePurchase } from "@/shared/hooks/usePurchase";
import Link from "next/link";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { formatPrice } from "@/shared/lib/formatPrice";

export default function CourseDetail() {
  const { t, tData, tStr, lang } = useLanguage() as any;
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      try {
        const id = params.id as string;
        const data = await getConsultationById(id);
        if (data) {
          setCourse(data);
        } else {
          setError(t.courseDetail.notFound);
        }
      } catch (err) {
        console.error("Error loading course:", err);
        setError(t.courseDetail.errLoad);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadCourse();
    }

    const handleStorageChange = () => {
      if (params.id) {
        loadCourse();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [params.id]);

  const { buyProduct } = usePurchase();
  const handleBuy = () => {
    if (course) buyProduct(tData ? tData(course).title : course.title, tData ? tData(course).price : course.price);
  };

  if (loading) {
    return (
      <main className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t.courseDetail.loading}</span>
        </div>
      </main>
    );
  }

  const idStr = (params.id as string) || '';
  const isPrivate = idStr.startsWith('private');
  const isNutrition = idStr.startsWith('nutrition');

  const localized_course = course ? tData(course) : null;
  if (error || !course) {
    const heroImg = isPrivate
      ? 'https://images.unsplash.com/photo-1515020617130-eca80c7d0753?q=80&w=2070&auto=format&fit=crop'
      : isNutrition
      ? 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop';
    const heroTitle = isPrivate
      ? t.programs.consultPrivateTitle
      : isNutrition
      ? t.programs.consultDietTitle
      : t.programs.consultMentor;
    const heroDesc = isPrivate
      ? t.programs.consultPrivateDesc
      : isNutrition
      ? t.programs.consultDietDesc
      : t.programs.consultMentorDesc;
    const backHref = isPrivate ? '/consultations-private' : isNutrition ? '/consultations-nutrition' : '/consultations-mentorship';
    return (
      <main>
        <section className="hero-section text-white position-relative d-flex align-items-end"
          style={{ height: '55vh', minHeight: '420px', background: `linear-gradient(rgba(62,66,58,0.55),rgba(62,66,58,0.75)),url('${heroImg}') center/cover` }}>
          <div className="container position-relative z-2 pb-5">
            <button onClick={() => router.back()} className="btn btn-outline-light rounded-pill px-4 py-2 mb-4 d-inline-flex align-items-center gap-2">
              <i className="bi bi-arrow-left"></i>{t.courseDetail.back}
            </button>
            <h1 className="display-4 font-playfair mb-3" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{heroTitle}</h1>
            <p className="lead col-lg-7 fw-light mb-0" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{heroDesc}</p>
          </div>
        </section>

        <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="container py-3 text-center">
            <div className="p-5 rounded-4 d-inline-block" style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', maxWidth: 520 }}>
              <i className="bi bi-calendar-check fs-1 mb-4 d-block" style={{ color: 'var(--color-primary)' }}></i>
              <h4 className="font-playfair fw-bold mb-3" style={{ color: 'var(--color-text)' }}>{t.programs.consultTitleNum}</h4>
              <p className="text-muted mb-4">{t.programs.consultDescNum}</p>
              <a href={backHref} className="btn rounded-pill px-5 py-2 fw-semibold me-2 mb-2" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }}>
                {t.programs.btnConsult}
              </a>
              <button onClick={() => router.back()} className="btn btn-outline-secondary rounded-pill px-4 py-2 mb-2">
                {t.courseDetail.goBack}
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      {/* HERO SECTION */}
      <section
          className="hero-section text-white position-relative"
          style={{
              height: '60vh',
              minHeight: '500px',
              paddingTop: '100px',
              paddingBottom: '40px',
              background: `linear-gradient(rgba(62, 66, 58, 0.6), rgba(62, 66, 58, 0.8)), url('${localized_course.imageUrl}') no-repeat center center/cover`
          }}
        >
            <div className="container position-relative z-2 h-100 d-flex flex-column">
                <div className="pt-2 pt-md-4">
                  <button
                    onClick={() => router.back()}
                    className="btn btn-outline-light rounded-pill px-4 py-2 mb-4 d-inline-flex align-items-center gap-2"
                    style={{ transition: 'all 0.3s ease', backdropFilter: 'blur(5px)' }}
                  >
                    <i className="bi bi-arrow-left"></i>{t.courseDetail.back}
                  </button>
                </div>
                <div className="mt-auto mb-auto">
                  <span className="text-uppercase mb-3 d-block small fw-bold" style={{ letterSpacing: '2px', color: 'var(--color-secondary)' }}>{t.courseDetail.program}</span>
                  <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{localized_course.title}</h1>
                  <p className="lead mb-5 col-lg-8 fw-light" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                    {localized_course.description}
                  </p>
                </div>
            </div>
        </section>

      {/* CONTENT SECTION */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="container py-5">
            <div className="row g-5">
              <div className="col-lg-8">
                <h3 className="font-playfair mb-4" style={{ color: 'var(--color-text)' }}>{t.programs.aboutCourse}</h3>
                  <div className="text-muted mb-4" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    {localized_course.fullDescription || `${t.courseDetail.desc1} ${t.courseDetail.desc2} ${t.courseDetail.desc3}`}
                  </div>

                  <h4 className="font-playfair mt-5 mb-4" style={{ color: 'var(--color-text)' }}>{t.programs.whatAwaits}</h4>
                  <ul className="list-unstyled text-muted">
                    {localized_course.features && Array.isArray(localized_course.features) && localized_course.features.length > 0 ? (
                      localized_course.features.map((feat: string, i: number) => (
                        <li key={i} className="mb-3 d-flex align-items-start gap-3">
                          <i className="bi bi-check-circle-fill text-success mt-1"></i>
                          <span>{feat}</span>
                        </li>
                      ))
                    ) : localized_course.features && typeof localized_course.features === 'string' ? (
                      localized_course.features.split('\n').filter((f: string) => f.trim()).map((feat: string, i: number) => (
                        <li key={i} className="mb-3 d-flex align-items-start gap-3">
                          <i className="bi bi-check-circle-fill text-success mt-1"></i>
                          <span>{feat}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="mb-3 d-flex align-items-start gap-3">
                          <i className="bi bi-check-circle-fill text-success mt-1"></i>
                          <span>{t.courseDetail.feat1}</span>
                        </li>
                        <li className="mb-3 d-flex align-items-start gap-3">
                          <i className="bi bi-check-circle-fill text-success mt-1"></i>
                          <span>{t.courseDetail.feat2}</span>
                        </li>
                        <li className="mb-3 d-flex align-items-start gap-3">
                          <i className="bi bi-check-circle-fill text-success mt-1"></i>
                          <span>{t.courseDetail.feat3}</span>
                        </li>
                        <li className="mb-3 d-flex align-items-start gap-3">
                          <i className="bi bi-check-circle-fill text-success mt-1"></i>
                          <span>{t.courseDetail.feat4}</span>
                        </li>
                      </>
                    )}
                  </ul>
              </div>
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm p-4 sticky-top" style={{ top: '100px', borderRadius: '20px', backgroundColor: 'var(--color-card-bg)' }}>
                  <h4 className="font-playfair mb-4" style={{ color: 'var(--color-text)' }}>{t.programs.programDetails}</h4>
                  <div className="d-flex align-items-center gap-3 mb-3 text-muted">
                    <i className="bi bi-clock fs-5"></i>
                    <div>
                      <small className="d-block text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>{t.courseDetail.durationLabel}</small>
                      <span className="fw-bold" style={{ color: 'var(--color-text)' }}>{t.courseDetail.durationVal}</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-3 text-muted">
                    <i className="bi bi-camera-video fs-5"></i>
                    <div>
                      <small className="d-block text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>{t.courseDetail.formatLabel}</small>
                      <span className="fw-bold" style={{ color: 'var(--color-text)' }}>{t.courseDetail.formatVal}</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-4 text-muted">
                    <i className="bi bi-infinity fs-5"></i>
                    <div>
                      <small className="d-block text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>{t.courseDetail.accessLabel}</small>
                      <span className="fw-bold" style={{ color: 'var(--color-text)' }}>{t.courseDetail.accessVal}</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-4 text-muted">
                    {localized_course.authorPhoto ? (
                      <img src={localized_course.authorPhoto} alt={localized_course.author || t.courseDetail.authorLabel} className="rounded-circle object-fit-cover" style={{ width: '24px', height: '24px' }} />
                    ) : (
                      <i className="bi bi-person fs-5"></i>
                    )}
                    <div>
                      <small className="d-block text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>{t.courseDetail.authorLabel}</small>
                      <span className="fw-bold" style={{ color: 'var(--color-text)' }}>{localized_course.author || t.courseDetail.authorDef}</span>
                    </div>
                  </div>
                  <hr className="my-4" />
                  <div className="text-center">
                    <span className="d-block fs-3 fw-bold mb-3" style={{ color: 'var(--color-text)' }}>{formatPrice(localized_course.price, lang)}</span>
                    <button onClick={handleBuy} className="btn btn-primary-custom w-100 rounded-pill py-3 fw-bold">{t.courseDetail.enroll}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>
    </main>
  );
}
