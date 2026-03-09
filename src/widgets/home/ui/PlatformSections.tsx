'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { useScrollReveal } from '@/shared/hooks/useScrollReveal';
import { useEffect, useState } from 'react';
import { getHomeContent } from '@/shared/api/homeContentApi';

const WARM_OVERLAY = 'linear-gradient(to top, rgba(35,25,18,0.95) 0%, rgba(50,38,28,0.5) 55%, rgba(35,25,18,0) 100%)';

const DEFAULT_IMAGES = [
  '/img/course-placeholder.svg',
  '/img/course-placeholder.svg',
  '/img/course-placeholder.svg',
  '/img/course-placeholder.svg',
];

const CARD_DEFS = [
  { href: '/courses', badgeKey: 'practice', titleKey: 'courses', descKey: 'coursesDesc' },
  { href: '/consultations', badgeKey: 'experts', titleKey: 'consultations', descKey: 'consultDesc' },
  { href: '/tours', badgeKey: 'retreats', titleKey: 'tours', descKey: 'travelDesc' },
  { href: '/blog', badgeKey: 'usefulness', titleKey: 'blog', descKey: 'blogDesc' },
] as const;

const cardStyle: React.CSSProperties = {
  minHeight: '400px',
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  display: 'flex',
};

const imgStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 0,
};

const overlayStyle: React.CSSProperties = {
  background: WARM_OVERLAY,
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: '1.5rem',
  zIndex: 1,
};

export const PlatformSections = () => {
  const { t } = useLanguage();
  const { observe } = useScrollReveal();
  const [images, setImages] = useState(DEFAULT_IMAGES);

  useEffect(() => {
    getHomeContent()
      .then((data) => {
        setImages([
          data.platform_card_1_image || DEFAULT_IMAGES[0],
          data.platform_card_2_image || DEFAULT_IMAGES[1],
          data.platform_card_3_image || DEFAULT_IMAGES[2],
          data.platform_card_4_image || DEFAULT_IMAGES[3],
        ]);
      })
      .catch(() => {});
  }, []);

  const getTitle = (key: string) => {
    const map: Record<string, string> = {
      courses: t.nav.courses,
      consultations: t.nav.consultations,
      tours: t.nav.tours,
      blog: t.nav.blog,
    };
    return map[key] || key;
  };
  const getBadge = (key: string) => {
    const map: Record<string, string> = {
      practice: t.home.practice,
      experts: t.home.experts,
      retreats: t.home.retreats,
      usefulness: t.home.usefulness,
    };
    return map[key] || key;
  };
  const getDesc = (key: string) => {
    const map: Record<string, string> = {
      coursesDesc: t.home.coursesDesc,
      consultDesc: t.home.consultDesc,
      travelDesc: t.home.travelDesc,
      blogDesc: t.home.blogDesc,
    };
    return map[key] || key;
  };

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
          {CARD_DEFS.map((card, idx) => (
            <div
              key={card.href}
              className={`col-md-6 col-lg-3 reveal-up${idx > 0 ? ` reveal-delay-${idx}` : ''}`}
              ref={observe as any}
            >
              <Link href={card.href} className="text-decoration-none">
                <div className="group-hover text-white" style={cardStyle}>
                  <Image
                    src={images[idx]}
                    alt={getTitle(card.titleKey)}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 992px) 50vw, 25vw"
                    style={{ objectFit: 'cover', ...imgStyle }}
                    priority={idx < 2}
                  />
                  <div style={overlayStyle}>
                    <h3 className="fw-bold font-playfair mb-1">{getTitle(card.titleKey)}</h3>
                    <p className="small mb-0" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {getDesc(card.descKey)}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
