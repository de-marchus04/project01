'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTourById } from '@/shared/api/tourApi';
import type { Tour } from '@/entities/tour/model/types';
import Link from 'next/link';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import ReviewSection from '@/shared/ui/ReviewSection/ReviewSection';

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
    if (t.includes('программ') || t.includes('включен')) return 'bi-gift';
    if (t.includes('типичный') || t.includes('день') || t.includes('расписан')) return 'bi-clock-history';
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
              <div className="row tour-desc-grid">
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
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS STRIP */}
      <section
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-primary-border)',
          borderBottom: '1px solid var(--color-primary-border)',
          padding: '0',
        }}
      >
        <div className="container">
          <div className="row g-0">
            {[
              { icon: 'bi-journal-richtext', label: tStr('Формат'), value: tStr('Интенсивный ретрит') },
              { icon: 'bi-mortarboard', label: tStr('Уровень'), value: tStr('Для всех уровней') },
              { icon: 'bi-house-heart', label: tStr('Размещение'), value: tStr('Апартаменты') },
              { icon: 'bi-translate', label: tStr('Язык'), value: tStr('Русский') },
            ].map((item, i) => (
              <div key={i} className="col-6 col-md-3">
                <div className={`text-center py-4 px-3 highlight-cell highlight-cell-${i}`}>
                  <i
                    className={`bi ${item.icon} d-block mb-2`}
                    style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}
                  ></i>
                  <small
                    className="d-block text-uppercase"
                    style={{ letterSpacing: '1.5px', color: 'var(--color-text-muted)', fontSize: '0.7rem' }}
                  >
                    {item.label}
                  </small>
                  <span className="fw-bold" style={{ fontSize: '1.05rem', color: 'var(--color-text)' }}>
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT + BOOKING SIDEBAR */}
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
                className="p-4 rounded-4 d-flex align-items-center gap-4 organizer-card"
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
                    border: '1px solid var(--color-primary-border)',
                    backgroundColor: 'var(--color-surface)',
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
                    <i className="bi bi-person-fill" style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}></i>
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

            {/* SIDEBAR */}
            <div className="col-lg-5">
              <div className="sticky-top" style={{ top: '100px' }}>
                {/* CTA CARD */}
                <div
                  className="card rounded-4 overflow-hidden"
                  style={{ border: '1px solid var(--color-primary-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
                >
                  <div className="card-body p-4 text-center">
                    <div
                      className="d-inline-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        border: '1px solid var(--color-primary-border)',
                        backgroundColor: 'var(--color-bg)',
                      }}
                    >
                      <i
                        className="bi bi-envelope-heart"
                        style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}
                      ></i>
                    </div>
                    <h5 className="font-playfair fw-bold mb-2" style={{ color: 'var(--color-text)' }}>
                      {tStr('Заинтересованы?')}
                    </h5>
                    <p className="text-muted small mb-4" style={{ lineHeight: 1.7 }}>
                      {tStr('Остались вопросы или готовы присоединиться? Напишите нам — мы поможем со всеми деталями.')}
                    </p>
                    <Link href="/contact" className="btn btn-primary-custom w-100 rounded-pill py-3 fw-bold fs-5">
                      <i className="bi bi-arrow-right me-2"></i>
                      {tStr('Записаться')}
                    </Link>
                    <p className="text-center text-muted small mt-2 mb-0">
                      {tStr('Количество мест строго ограничено')}
                    </p>
                  </div>
                </div>

                {/* WHY THIS RETREAT */}
                <div
                  className="mt-4 p-4 rounded-4"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-accent-border)',
                  }}
                >
                  <h6
                    className="fw-bold mb-3 d-flex align-items-center gap-2"
                    style={{ fontSize: '0.85rem', color: 'var(--color-accent)' }}
                  >
                    <i className="bi bi-stars"></i>
                    {tStr('Почему этот ретрит')}
                  </h6>
                  <div className="d-flex flex-column gap-3">
                    {[
                      { icon: 'bi-shield-check', text: tStr('Личное сопровождение опытного наставника') },
                      {
                        icon: 'bi-heart-pulse',
                        text: tStr('Глубокая внутренняя трансформация, а не поверхностный отдых'),
                      },
                      { icon: 'bi-geo', text: tStr('Места силы Балкан с многовековой историей') },
                      { icon: 'bi-people', text: tStr('Камерная группа единомышленников') },
                      { icon: 'bi-compass', text: tStr('Сочетание практики и путешествия') },
                    ].map((item, i) => (
                      <div key={i} className="d-flex align-items-start gap-2">
                        <i
                          className={`bi ${item.icon}`}
                          style={{ fontSize: '0.85rem', color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }}
                        ></i>
                        <span style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SIDEBAR PHOTO */}
                <div className="mt-4 position-relative overflow-hidden rounded-4" style={{ height: '220px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1555990793-da11153b2473?q=80&w=600&auto=format&fit=crop"
                    alt={tStr('Черногория')}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    className="position-absolute bottom-0 start-0 end-0 p-3"
                    style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.55))' }}
                  >
                    <span className="text-white small fw-medium">
                      <i className="bi bi-geo-alt me-1"></i>
                      {tStr('Бар, Черногория')}
                    </span>
                  </div>
                </div>

                {/* IMPORTANT DETAILS */}
                <div
                  className="mt-4 p-4 rounded-4"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border, rgba(0,0,0,0.08))',
                  }}
                >
                  <h6
                    className="fw-bold mb-3 d-flex align-items-center gap-2"
                    style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}
                  >
                    <i className="bi bi-info-circle"></i>
                    {tStr('Важные детали')}
                  </h6>
                  <div className="d-flex flex-column gap-2">
                    {[
                      { label: tStr('Даты'), value: loc_tour.date || tStr('9–19 мая 2025') },
                      { label: tStr('Место'), value: loc_tour.location || tStr('Бар, Черногория') },
                      { label: tStr('Длительность'), value: tStr('10 дней') },
                      { label: tStr('Группа'), value: tStr('до 10 человек') },
                    ].map((item, i) => (
                      <div key={i} className="d-flex justify-content-between" style={{ fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                        <span className="fw-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
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
            <h3 className="font-playfair fw-bold mb-2 gallery-title" style={{ fontSize: '2rem' }}>
              {tStr('Что вас ждёт')}
            </h3>
            <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto' }}>
              {tStr('Черногория — страна, где горы встречаются с морем, а древние монастыри хранят тишину веков')}
            </p>
          </div>

          <div className="row g-3 gallery-mosaic">
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
          <div className="row g-3 mt-0 gallery-mosaic">
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

      <ReviewSection itemId={params.id as string} itemType="TOUR" />
    </main>
  );
}
