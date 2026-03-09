'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTourById } from '@/shared/api/tourApi';
import type { Tour } from '@/entities/tour/model/types';
import Link from 'next/link';
import { BuyButton } from '@/shared/ui/BuyButton/BuyButton';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import ReviewSection from '@/shared/ui/ReviewSection/ReviewSection';
import PromoCodeInput from '@/shared/ui/PromoCodeInput/PromoCodeInput';

function formatTourPrice(price: number, currency?: string | null): string {
  const cur = currency || 'UAH';
  const symbols: Record<string, string> = { UAH: '₴', USD: '$', EUR: '€', RUB: '₽' };
  const sym = symbols[cur] || cur;
  return cur === 'USD' || cur === 'EUR' ? `${sym}${price}` : `${price} ${sym}`;
}

function TourDescriptionRenderer({ text }: { text: string }) {
  type Block = { type: 'paragraph'; content: string } | { type: 'section'; title: string; items: string[] };

  const blocks: Block[] = [];
  const lines = text.split('\n');
  let currentSection: { type: 'section'; title: string; items: string[] } | null = null;
  let paragraphLines: string[] = [];

  const flush = () => {
    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', content: paragraphLines.join('\n') });
      paragraphLines = [];
    }
    if (currentSection) {
      blocks.push(currentSection);
      currentSection = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      continue;
    }
    if (trimmed.endsWith(':') && !trimmed.startsWith('—')) {
      if (paragraphLines.length) flush();
      else if (currentSection) flush();
      currentSection = { type: 'section', title: trimmed.slice(0, -1), items: [] };
    } else if (trimmed.startsWith('—') && currentSection) {
      currentSection.items.push(trimmed.replace(/^—\s*/, ''));
    } else if (!currentSection) {
      paragraphLines.push(trimmed);
    }
  }
  flush();

  const sectionIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('программ')) return 'bi-calendar2-week';
    if (t.includes('стоимость') || t.includes('включен')) return 'bi-gift';
    return 'bi-stars';
  };

  return (
    <div>
      {blocks.map((block, i) => {
        if (block.type === 'paragraph') {
          const paras = block.content.split('\n').filter(Boolean);
          const isFirstBlock = i === 0;
          return (
            <div
              key={i}
              className="mb-4"
              style={
                isFirstBlock
                  ? {
                      borderLeft: '3px solid var(--color-accent)',
                      paddingLeft: '20px',
                      marginLeft: '4px',
                    }
                  : undefined
              }
            >
              {paras.map((p, j) => (
                <p
                  key={j}
                  className="mb-2"
                  style={{
                    lineHeight: '1.9',
                    fontSize: isFirstBlock ? '1.1rem' : '1rem',
                    color: isFirstBlock ? 'var(--color-text)' : 'var(--color-text-muted, #6c757d)',
                    fontStyle: isFirstBlock ? 'italic' : 'normal',
                    fontWeight: isFirstBlock && j === 0 ? 500 : 400,
                  }}
                >
                  {p}
                </p>
              ))}
            </div>
          );
        }
        if (block.type === 'section') {
          return (
            <div
              key={i}
              className="mb-4 p-4 rounded-3"
              style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border, rgba(0,0,0,0.08))' }}
            >
              <h5
                className="font-playfair fw-bold mb-3 d-flex align-items-center gap-2"
                style={{
                  color: 'var(--color-accent)',
                  paddingBottom: '12px',
                  borderBottom: '2px solid var(--color-accent-subtle)',
                  fontSize: '1.2rem',
                  margin: 0,
                  marginBottom: '16px',
                }}
              >
                <i className={`bi ${sectionIcon(block.title)}`}></i>
                {block.title}
              </h5>
              <div className="row">
                {block.items.map((item, j) => (
                  <div key={j} className="col-md-6 mb-2">
                    <div className="d-flex gap-2 align-items-start">
                      <span
                        style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '3px', fontSize: '0.75rem' }}
                      >
                        ✦
                      </span>
                      <span style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function TourDetail() {
  const params = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoPrice, setPromoPrice] = useState<number | null>(null);
  const [promoCodeId, setPromoCodeId] = useState<string | null>(null);
  const { tData, tStr } = useLanguage();

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

    const handleStorageChange = () => {
      loadTour();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [params.id]);

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
        <section
          className="hero-section text-white position-relative d-flex align-items-end"
          style={{
            height: '55vh',
            minHeight: '420px',
            background:
              "linear-gradient(rgba(62,66,58,0.55),rgba(62,66,58,0.75)),url('https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800') center/cover",
          }}
        >
          <div className="container position-relative z-2 pb-5">
            <Link
              href="/tours"
              className="btn btn-outline-light rounded-pill px-4 py-2 mb-4 d-inline-flex align-items-center gap-2"
            >
              <i className="bi bi-arrow-left"></i>
              {tStr('Назад к турам')}
            </Link>
            <h1 className="display-4 font-playfair mb-3">{tStr('Туры и ретриты')}</h1>
          </div>
        </section>
        <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="container py-3 text-center">
            <h2>{tStr('Тур не найден')}</h2>
            <Link href="/tours" className="btn btn-outline-primary-custom rounded-pill mt-3 px-4">
              {tStr('К списку туров')}
            </Link>
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
          height: '70vh',
          minHeight: '550px',
          paddingTop: '100px',
          paddingBottom: '40px',
          background: `linear-gradient(rgba(62, 66, 58, 0.6), rgba(62, 66, 58, 0.8)), url('${loc_tour.imageUrl || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800'}') no-repeat center center/cover`,
        }}
      >
        <div className="container position-relative z-2 h-100 d-flex flex-column">
          <div className="pt-2 pt-md-4">
            <Link
              href="/tours"
              className="btn btn-outline-light rounded-pill px-4 py-2 mb-4 d-inline-flex align-items-center gap-2"
              style={{ transition: 'all 0.3s ease', backdropFilter: 'blur(5px)' }}
            >
              <i className="bi bi-arrow-left"></i>
              {tStr('Назад к турам')}
            </Link>
          </div>
          <div className="mt-auto mb-auto">
            <span
              className="text-uppercase mb-3 d-block small fw-bold"
              style={{ letterSpacing: '2px', color: 'var(--color-secondary)' }}
            >
              {tStr('Ретрит')}
            </span>
            <h1
              className="display-3 font-playfair mb-3"
              style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)', maxWidth: '800px' }}
            >
              {loc_tour.title}
            </h1>
            {loc_tour.description && (
              <p
                className="mb-4"
                style={{
                  fontSize: '1.15rem',
                  lineHeight: '1.8',
                  maxWidth: '700px',
                  opacity: 0.9,
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                {loc_tour.description}
              </p>
            )}
            <div className="d-flex flex-wrap gap-3 mb-0">
              <span
                className="badge rounded-pill px-3 py-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', fontSize: '0.9rem' }}
              >
                <i className="bi bi-calendar-event me-2"></i>
                {loc_tour.date}
              </span>
              <span
                className="badge rounded-pill px-3 py-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', fontSize: '0.9rem' }}
              >
                <i className="bi bi-geo-alt me-2"></i>
                {loc_tour.location}
              </span>
              <span
                className="badge rounded-pill px-3 py-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', fontSize: '0.9rem' }}
              >
                <i className="bi bi-tag me-2"></i>
                {formatTourPrice(loc_tour.price, loc_tour.currency)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS STRIP */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--color-accent) 0%, #5a6b3c 100%)',
          padding: '0',
        }}
      >
        <div className="container">
          <div className="row g-0">
            {[
              { icon: 'bi-geo-alt-fill', label: tStr('Место'), value: loc_tour.location || 'Черногория' },
              { icon: 'bi-calendar2-check', label: tStr('Даты'), value: loc_tour.date || '' },
              { icon: 'bi-people-fill', label: tStr('Группа'), value: tStr('до 10 человек') },
              {
                icon: 'bi-currency-euro',
                label: tStr('Стоимость'),
                value: formatTourPrice(loc_tour.price, loc_tour.currency),
              },
            ].map((item, i) => (
              <div key={i} className="col-6 col-md-3">
                <div
                  className="text-white text-center py-4 px-3"
                  style={{
                    borderRight: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                  }}
                >
                  <i className={`bi ${item.icon} d-block mb-2`} style={{ fontSize: '1.6rem', opacity: 0.85 }}></i>
                  <small
                    className="d-block text-uppercase"
                    style={{ letterSpacing: '1.5px', opacity: 0.7, fontSize: '0.7rem' }}
                  >
                    {item.label}
                  </small>
                  <span className="fw-bold" style={{ fontSize: '1.05rem' }}>
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT + ORGANIZER */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="container py-4">
          <div className="row g-5 align-items-start">
            <div className="col-lg-7">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  style={{ width: '50px', height: '3px', backgroundColor: 'var(--color-accent)', borderRadius: '2px' }}
                ></div>
                <h3 className="font-playfair fw-bold mb-0" style={{ fontSize: '1.8rem' }}>
                  {tStr('О программе')}
                </h3>
              </div>
              <div className="mb-4">
                {loc_tour.fullDescription ? (
                  <TourDescriptionRenderer text={loc_tour.fullDescription} />
                ) : (
                  <>
                    <p>{loc_tour.description}</p>
                    <p className="text-muted">
                      {tStr(
                        'Вас ждут ежедневные практики йоги и медитации, здоровое питание, экскурсии по самым красивым местам и глубокая трансформация в кругу единомышленников.',
                      )}
                    </p>
                  </>
                )}
              </div>

              {/* ORGANIZER CARD */}
              <div
                className="p-4 rounded-4 d-flex align-items-center gap-4"
                style={{
                  background: 'linear-gradient(135deg, var(--color-bg) 0%, var(--color-surface) 100%)',
                  border: '1px solid var(--color-border, rgba(0,0,0,0.08))',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-accent), #5a6b3c)',
                  }}
                >
                  {loc_tour.authorPhoto ? (
                    <Image
                      width={56}
                      height={56}
                      src={loc_tour.authorPhoto}
                      style={{ objectFit: 'cover', borderRadius: '50%' }}
                      alt={loc_tour.author || tStr('Организатор')}
                    />
                  ) : (
                    <i className="bi bi-person-fill text-white" style={{ fontSize: '1.5rem' }}></i>
                  )}
                </div>
                <div>
                  <small
                    className="d-block text-uppercase fw-bold"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '2px',
                      color: 'var(--color-accent)',
                      marginBottom: '2px',
                    }}
                  >
                    {tStr('Организатор и ведущий')}
                  </small>
                  <span className="fw-bold" style={{ fontSize: '1.1rem' }}>
                    {loc_tour.author || tStr('Админ сайта')}
                  </span>
                  <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {tStr('Практикующий йог, психоаналитик, философ')}
                  </p>
                </div>
              </div>
            </div>

            {/* IMMERSIVE SIDE IMAGE */}
            <div className="col-lg-5">
              <div className="position-relative rounded-4 overflow-hidden" style={{ height: '450px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop"
                  alt={tStr('Утренняя практика')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  className="position-absolute bottom-0 start-0 end-0 p-4"
                  style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}
                >
                  <p className="text-white mb-0 font-playfair fst-italic" style={{ fontSize: '1.1rem' }}>
                    &ldquo;{tStr('Место, где время замедляется, а вы — находите себя')}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ФОТОГАЛЕРЕЯ — ПОЛНОШИРИННАЯ МОЗАИКА */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container py-3">
          <div className="text-center mb-5">
            <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
              <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-accent)' }}></div>
              <span
                className="text-uppercase fw-bold small"
                style={{ letterSpacing: '3px', color: 'var(--color-accent)' }}
              >
                {tStr('Галерея')}
              </span>
              <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-accent)' }}></div>
            </div>
            <h3 className="font-playfair fw-bold mb-2" style={{ fontSize: '2rem' }}>
              {tStr('Что вас ждёт')}
            </h3>
            <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto' }}>
              {tStr('Черногория — страна, где горы встречаются с морем, а древние монастыри хранят тишину веков')}
            </p>
          </div>

          <div className="row g-3">
            {/* Большое фото слева */}
            <div className="col-md-7">
              <div className="position-relative overflow-hidden rounded-4 h-100" style={{ minHeight: '420px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1555990793-da11153b2473?q=80&w=1200&auto=format&fit=crop"
                  alt={tStr('Которский залив')}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div
                  className="position-absolute bottom-0 start-0 end-0 p-4"
                  style={{ background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.65) 100%)' }}
                >
                  <span
                    className="badge rounded-pill px-3 py-2 mb-2"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  >
                    <i className="bi bi-camera me-1"></i> {tStr('Которский залив')}
                  </span>
                  <p className="text-white mb-0 small" style={{ opacity: 0.85 }}>
                    {tStr('Один из красивейших заливов Европы, объект ЮНЕСКО')}
                  </p>
                </div>
              </div>
            </div>
            {/* Два фото справа стопкой */}
            <div className="col-md-5 d-flex flex-column gap-3">
              <div className="position-relative overflow-hidden rounded-4 flex-fill" style={{ minHeight: '200px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"
                  alt={tStr('Адриатическое побережье')}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div
                  className="position-absolute bottom-0 start-0 p-3"
                  style={{
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
                    borderRadius: '0 0 var(--bs-border-radius-xl) var(--bs-border-radius-xl)',
                    width: '100%',
                  }}
                >
                  <span className="text-white small fw-medium">{tStr('Адриатическое побережье')}</span>
                </div>
              </div>
              <div className="position-relative overflow-hidden rounded-4 flex-fill" style={{ minHeight: '200px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop"
                  alt={tStr('Природа Черногории')}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div
                  className="position-absolute bottom-0 start-0 p-3"
                  style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', width: '100%' }}
                >
                  <span className="text-white small fw-medium">{tStr('Горы и нетронутая природа')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Нижний ряд — 2 широких фото */}
          <div className="row g-3 mt-0">
            <div className="col-md-5">
              <div className="position-relative overflow-hidden rounded-4" style={{ height: '240px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop"
                  alt={tStr('Медитация')}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div
                  className="position-absolute bottom-0 start-0 p-3"
                  style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', width: '100%' }}
                >
                  <span className="text-white small fw-medium">{tStr('Медитации в местах силы')}</span>
                </div>
              </div>
            </div>
            <div className="col-md-7">
              <div className="position-relative overflow-hidden rounded-4" style={{ height: '240px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop"
                  alt={tStr('Горный пейзаж')}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div
                  className="position-absolute bottom-0 start-0 p-3"
                  style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', width: '100%' }}
                >
                  <span className="text-white small fw-medium">{tStr('Горные маршруты и виды')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING SECTION */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div
                className="card border-0 rounded-4 overflow-hidden"
                style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}
              >
                <div
                  className="p-4 text-white text-center"
                  style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, #5a6b3c 100%)' }}
                >
                  <h3 className="font-playfair fw-bold mb-1">{tStr('Забронируйте своё место')}</h3>
                  <p className="mb-0 small" style={{ opacity: 0.85 }}>
                    {tStr('Количество мест строго ограничено')}
                  </p>
                </div>
                <div className="card-body p-5">
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom">
                    <span className="text-muted fs-5">{tStr('Стоимость участия')}</span>
                    {promoPrice !== null ? (
                      <div className="text-end">
                        <span className="text-muted text-decoration-line-through fs-5 me-2">
                          {formatTourPrice(loc_tour.price, loc_tour.currency)}
                        </span>
                        <span className="fs-2 fw-bold text-primary-custom">
                          {formatTourPrice(promoPrice, loc_tour.currency)}
                        </span>
                      </div>
                    ) : (
                      <span className="fs-2 fw-bold text-primary-custom">
                        {formatTourPrice(loc_tour.price, loc_tour.currency)}
                      </span>
                    )}
                  </div>
                  <div className="row mb-4">
                    {loc_tour.features ? (
                      (Array.isArray(loc_tour.features)
                        ? loc_tour.features
                        : (loc_tour.features as unknown as string).split('\n')
                      )
                        .filter((f: string) => f.trim())
                        .map((feat: string, i: number) => {
                          const isExcluded =
                            feat.toLowerCase().includes('оплачивается отдельно') ||
                            feat.toLowerCase().includes('не включено');
                          return (
                            <div key={i} className="col-md-6 mb-3">
                              <div className="d-flex align-items-start gap-2">
                                <i
                                  className={`bi bi-${isExcluded ? 'x-circle text-danger' : 'check-circle-fill text-success'} mt-1 flex-shrink-0`}
                                ></i>
                                <span className={isExcluded ? 'text-muted' : ''} style={{ fontSize: '0.95rem' }}>
                                  {feat}
                                </span>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <>
                        <div className="col-md-6 mb-3">
                          <div className="d-flex align-items-start gap-2">
                            <i className="bi bi-check-circle-fill text-success mt-1"></i>
                            {tStr('Проживание включено')}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="d-flex align-items-start gap-2">
                            <i className="bi bi-check-circle-fill text-success mt-1"></i>
                            {tStr('Все практики и лекции')}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <PromoCodeInput
                    originalPrice={loc_tour.price}
                    onApply={(finalPrice, codeId) => {
                      setPromoPrice(finalPrice);
                      setPromoCodeId(codeId);
                    }}
                    onClear={() => {
                      setPromoPrice(null);
                      setPromoCodeId(null);
                    }}
                  />
                  <BuyButton
                    title={loc_tour.title}
                    price={promoPrice ?? loc_tour.price}
                    serviceId={loc_tour.id}
                    itemType="TOUR"
                    promoCodeId={promoCodeId ?? undefined}
                    label={tStr('Забронировать место')}
                    className="btn btn-primary-custom w-100 rounded-pill py-3 fw-bold fs-5 mt-3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ReviewSection itemId={params.id as string} itemType="TOUR" />
    </main>
  );
}
