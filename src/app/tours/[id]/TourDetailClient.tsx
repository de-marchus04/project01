"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTourById } from "@/shared/api/tourApi";
import type { Tour } from "@/entities/tour/model/types";
import { usePurchase } from "@/shared/hooks/usePurchase";
import Link from "next/link";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { formatPrice } from "@/shared/lib/formatPrice";

export default function TourDetail() {
  const params = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang, tData, tStr } = useLanguage() as any;

  useEffect(() => {
    async function loadTour() {
      try {
        const id = params.id as string;
        const data = await getTourById(id);
        if (data) setTour(data);
      } catch (err) {
        console.error('Error loading tour:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTour();

    const handleStorageChange = () => { loadTour(); };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [params.id]);

  const { buyProduct } = usePurchase();

  if (loading) {
    return (
      <main className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </main>
    );
  }

  const loc_tour = tour && tData ? tData(tour) : tour;

  if (!tour || !loc_tour) {
    return (
      <main>
        <section className="hero-section text-white position-relative d-flex align-items-end"
          style={{ height: '55vh', minHeight: '420px', background: "linear-gradient(rgba(62,66,58,0.55),rgba(62,66,58,0.75)),url('https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800') center/cover" }}>
          <div className="container position-relative z-2 pb-5">
            <Link href="/tours" className="btn btn-outline-light rounded-pill px-4 py-2 mb-4 d-inline-flex align-items-center gap-2">
              <i className="bi bi-arrow-left"></i>{tStr("Назад к турам")}
            </Link>
            <h1 className="display-4 font-playfair mb-3">{tStr("Туры и ретриты")}</h1>
          </div>
        </section>
        <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="container py-3 text-center">
            <h2>{tStr("Тур не найден")}</h2>
            <Link href="/tours" className="btn btn-outline-primary-custom rounded-pill mt-3 px-4">{tStr("К списку туров")}</Link>
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
          background: `linear-gradient(rgba(62, 66, 58, 0.6), rgba(62, 66, 58, 0.8)), url('${loc_tour.imageUrl || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800"}') no-repeat center center/cover`,
        }}
      >
        <div className="container position-relative z-2 h-100 d-flex flex-column">
          <div className="pt-2 pt-md-4">
            <Link
              href="/tours"
              className="btn btn-outline-light rounded-pill px-4 py-2 mb-4 d-inline-flex align-items-center gap-2"
              style={{ transition: 'all 0.3s ease', backdropFilter: 'blur(5px)' }}
            >
              <i className="bi bi-arrow-left"></i>{tStr("Назад к турам")}
            </Link>
          </div>
          <div className="mt-auto mb-auto">
            <span className="text-uppercase mb-3 d-block small fw-bold" style={{ letterSpacing: '2px', color: 'var(--color-secondary)' }}>{tStr("Тур")}</span>
            <div className="d-flex flex-wrap gap-3 mb-3">
              <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', fontSize: '0.9rem' }}>
                <i className="bi bi-calendar-event me-2"></i>{loc_tour.date}
              </span>
              <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', fontSize: '0.9rem' }}>
                <i className="bi bi-geo-alt me-2"></i>{loc_tour.location}
              </span>
            </div>
            <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{loc_tour.title}</h1>
            <p className="lead col-lg-8 fw-light mb-0" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{loc_tour.description}</p>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="container py-5">
          <div className="row g-5">
            <div className="col-lg-7">
              <h3 className="font-playfair fw-bold mb-4">{tStr("О программе")}</h3>
              <div className="text-muted mb-4" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {loc_tour.fullDescription || (
                  <>
                    <p>{loc_tour.description}</p>
                    <p>{tStr("Вас ждут ежедневные практики йоги и медитации, здоровое питание, экскурсии по самым красивым местам и глубокая трансформация в кругу единомышленников.")}</p>
                  </>
                )}
              </div>
              <div className="mt-4 p-3 rounded-3 shadow-sm d-inline-block" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="d-flex align-items-center gap-3">
                  {loc_tour.authorPhoto ? (
                    <img src={loc_tour.authorPhoto} alt={loc_tour.author || tStr("Организатор")} className="rounded-circle object-fit-cover" style={{ width: '40px', height: '40px' }} />
                  ) : (
                    <i className="bi bi-person-circle fs-3 text-primary-custom"></i>
                  )}
                  <div>
                    <small className="d-block text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>{tStr("Организатор")}</small>
                    <span className="fw-bold">{loc_tour.author || tStr("Админ сайта")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{ top: '100px' }}>
                <div className="card-body p-5">
                  <h3 className="font-playfair fw-bold mb-4">{tStr("Бронирование места")}</h3>
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom">
                    <span className="text-muted">{tStr("Стоимость участия")}</span>
                    <span className="fs-3 fw-bold text-primary-custom">{formatPrice(loc_tour.price, lang)}</span>
                  </div>
                  <ul className="list-unstyled mb-5">
                    {loc_tour.features ? (
                      (Array.isArray(loc_tour.features) ? loc_tour.features : loc_tour.features.split('\n')).filter((f: string) => f.trim()).map((feat: string, i: number) => (
                        <li key={i} className="mb-3">
                          <i className={`bi bi-${feat.toLowerCase().includes('оплачивается отдельно') || feat.toLowerCase().includes('не включено') ? 'x-circle text-danger' : 'check-circle-fill text-success'} me-3`}></i>
                          <span className={feat.toLowerCase().includes('оплачивается отдельно') || feat.toLowerCase().includes('не включено') ? 'text-muted' : ''}>{feat}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="mb-3"><i className="bi bi-check-circle-fill text-success me-3"></i>{tStr("Проживание включено")}</li>
                        <li className="mb-3"><i className="bi bi-check-circle-fill text-success me-3"></i>{tStr("Двухразовое питание")}</li>
                        <li className="mb-3"><i className="bi bi-check-circle-fill text-success me-3"></i>{tStr("Все практики и лекции")}</li>
                        <li className="mb-3 text-muted"><i className="bi bi-x-circle text-danger me-3"></i>{tStr("Авиабилеты оплачиваются отдельно")}</li>
                      </>
                    )}
                  </ul>
                  <button
                    onClick={() => buyProduct(loc_tour.title, loc_tour.price)}
                    className="btn btn-primary-custom w-100 rounded-pill py-3 fw-bold fs-5"
                  >{tStr("Забронировать место")}</button>
                  <p className="text-center text-muted small mt-3 mb-0">{tStr("Количество мест строго ограничено")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
