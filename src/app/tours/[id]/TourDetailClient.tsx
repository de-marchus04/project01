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
          height: '60vh',
          minHeight: '500px',
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
              className="display-3 font-playfair mb-4"
              style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)', maxWidth: '800px' }}
            >
              {loc_tour.title}
            </h1>
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

      {/* CONTENT SECTION */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="container py-5">
          <div className="row g-5">
            <div className="col-lg-7">
              <h3 className="font-playfair fw-bold mb-4">{tStr('О программе')}</h3>
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
              <div
                className="mt-4 p-3 rounded-3 shadow-sm d-inline-block"
                style={{ backgroundColor: 'var(--color-bg)' }}
              >
                <div className="d-flex align-items-center gap-3">
                  {loc_tour.authorPhoto ? (
                    <Image
                      width={40}
                      height={40}
                      src={
                        loc_tour.authorPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=40'
                      }
                      style={{ objectFit: 'cover', borderRadius: '50%' }}
                      alt={loc_tour.author || tStr('Организатор')}
                    />
                  ) : (
                    <i className="bi bi-person-circle fs-3 text-primary-custom"></i>
                  )}
                  <div>
                    <small
                      className="d-block text-muted text-uppercase"
                      style={{ fontSize: '0.7rem', letterSpacing: '1px' }}
                    >
                      {tStr('Организатор')}
                    </small>
                    <span className="fw-bold">{loc_tour.author || tStr('Админ сайта')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{ top: '100px' }}>
                <div className="card-body p-5">
                  <h3 className="font-playfair fw-bold mb-4">{tStr('Бронирование места')}</h3>
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom">
                    <span className="text-muted">{tStr('Стоимость участия')}</span>
                    {promoPrice !== null ? (
                      <div className="text-end">
                        <span className="text-muted text-decoration-line-through fs-5 me-2">
                          {formatTourPrice(loc_tour.price, loc_tour.currency)}
                        </span>
                        <span className="fs-3 fw-bold text-primary-custom">
                          {formatTourPrice(promoPrice, loc_tour.currency)}
                        </span>
                      </div>
                    ) : (
                      <span className="fs-3 fw-bold text-primary-custom">
                        {formatTourPrice(loc_tour.price, loc_tour.currency)}
                      </span>
                    )}
                  </div>
                  <ul className="list-unstyled mb-5">
                    {loc_tour.features ? (
                      (Array.isArray(loc_tour.features)
                        ? loc_tour.features
                        : (loc_tour.features as unknown as string).split('\n')
                      )
                        .filter((f: string) => f.trim())
                        .map((feat: string, i: number) => (
                          <li key={i} className="mb-3">
                            <i
                              className={`bi bi-${feat.toLowerCase().includes('оплачивается отдельно') || feat.toLowerCase().includes('не включено') ? 'x-circle text-danger' : 'check-circle-fill text-success'} me-3`}
                            ></i>
                            <span
                              className={
                                feat.toLowerCase().includes('оплачивается отдельно') ||
                                feat.toLowerCase().includes('не включено')
                                  ? 'text-muted'
                                  : ''
                              }
                            >
                              {feat}
                            </span>
                          </li>
                        ))
                    ) : (
                      <>
                        <li className="mb-3">
                          <i className="bi bi-check-circle-fill text-success me-3"></i>
                          {tStr('Проживание включено')}
                        </li>
                        <li className="mb-3">
                          <i className="bi bi-check-circle-fill text-success me-3"></i>
                          {tStr('Двухразовое питание')}
                        </li>
                        <li className="mb-3">
                          <i className="bi bi-check-circle-fill text-success me-3"></i>
                          {tStr('Все практики и лекции')}
                        </li>
                        <li className="mb-3 text-muted">
                          <i className="bi bi-x-circle text-danger me-3"></i>
                          {tStr('Авиабилеты оплачиваются отдельно')}
                        </li>
                      </>
                    )}
                  </ul>
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
                  <p className="text-center text-muted small mt-3 mb-0">{tStr('Количество мест строго ограничено')}</p>
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
