"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTourById, Tour } from "@/shared/api/tourApi";
import { usePurchase } from "@/shared/hooks/usePurchase";
import Link from "next/link";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { formatPrice } from "@/shared/lib/formatPrice";

export default function TourDetail() {
  const params = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang , tData, tStr} = useLanguage() as any;

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

    // Слушаем событие storage для обновления данных при изменении профиля
    const handleStorageChange = () => {
      loadTour();
    };
    window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
  }, [params.id]);

  const { buyProduct } = usePurchase();

  if (loading) {
    return <div className="container py-5 text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  }

  const loc_tour = tour && tData ? tData(tour) : tour;

  if (!tour) {
    return <div className="container py-5 text-center mt-5"><h2>{tStr("Тур не найден")}</h2><Link href="/tours" className="btn btn-outline-primary-custom rounded-pill mt-3 px-4">{tStr("К списку туров")}</Link></div>;
  }

  return (
    <main style={{ backgroundColor: 'var(--color-bg)' }} className="min-vh-100 pt-5">
      <div className="container py-5 mt-4">
          <Link 
            href="/tours" 
            className="btn btn-outline-dark rounded-pill px-4 py-2 mb-4 d-inline-flex align-items-center gap-2"
            style={{ transition: 'all 0.3s ease', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
          >
            <i className="bi bi-arrow-left"></i>{tStr("Назад к турам")}
          </Link>
        <div className="row g-5">
          <div className="col-lg-7">
            <img 
              src={loc_tour.imageUrl} 
              alt={loc_tour.title} 
              className="img-fluid rounded-4 shadow-sm w-100 mb-4"
              style={{ maxHeight: '500px', objectFit: 'cover' }}
            />
            <h1 className="font-playfair display-5 fw-bold mb-4">{loc_tour.title}</h1>
            <div className="d-flex gap-4 mb-4 text-muted">
                <span><i className="bi bi-calendar-event me-2 text-primary-custom"></i>{loc_tour.date}</span>
                <span><i className="bi bi-geo-alt me-2 text-primary-custom"></i>{loc_tour.location}</span>
            </div>
            <h4 className="font-playfair fw-bold mb-3">{tStr("О программе")}</h4>
            <div className="lead text-muted" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
              {loc_tour.fullDescription || (
                <>
                  <p>{loc_tour.description}</p>
                  <p>{tStr("Вас ждут ежедневные практики йоги и медитации, здоровое питание, экскурсии по самым красивым местам и глубокая трансформация в кругу единомышленников.")}</p>
                </>
              )}
            </div>
            <div className="mt-4 p-3 rounded-3 shadow-sm d-inline-block" style={{ backgroundColor: "var(--color-surface)" }}>
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
                    loc_tour.features.split('\n').filter((f: string) => f.trim()).map((feat: string, i: number) => (
                      <li key={i} className="mb-3">
                        <i className={`bi bi-${feat.toLowerCase().includes('оплачивается отдельно') || feat.toLowerCase().includes('не включено') || feat.toLowerCase().includes('не входить') ? 'x-circle text-danger' : 'check-circle-fill text-success'} me-3`}></i>
                        <span className={feat.toLowerCase().includes('оплачивается отдельно') || feat.toLowerCase().includes('не включено') || feat.toLowerCase().includes('не входить') ? 'text-muted' : ''}>{feat}</span>
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
    </main>
  );
}
