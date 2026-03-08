'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getUserWishlist, removeFromWishlist, WishlistItem } from '@/shared/api/wishlistApi';
import { HeroSlider } from '@/shared/ui/HeroSlider/HeroSlider';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { useScrollReveal } from '@/shared/hooks/useScrollReveal';
import { SectionHeader } from '@/shared/ui/SectionHeader/SectionHeader';

export default function WishlistPageClient() {
  const { t, tStr } = useLanguage();

  const TYPE_LABEL: Record<string, string> = {
    COURSE: t.search.typeCourse,
    CONSULTATION: t.search.typeConsultation,
    TOUR: t.search.typeTour,
  };
  const { status } = useSession();
  const router = useRouter();
  const { observe } = useScrollReveal();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      getUserWishlist()
        .then(setItems)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const handleRemove = async (item: WishlistItem) => {
    await removeFromWishlist(item.itemId, item.itemType as any);
    setItems((prev) => prev.filter((w) => w.id !== item.id));
  };

  if (status === 'loading' || loading) {
    return (
      <main className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border" role="status" style={{ color: 'var(--color-primary)' }}></div>
      </main>
    );
  }

  return (
    <main>
      {/* HERO */}
      <section
        className="hero-section page-hero d-flex align-items-center text-center text-white position-relative"
        style={{ height: '55vh', minHeight: '440px', overflow: 'hidden' }}
      >
        <HeroSlider
          pageKey="wishlist"
          images={[
            'https://images.unsplash.com/photo-1544367563-12123d8965bf?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1599447421405-0753f5d1a5ca?q=80&w=2070&auto=format&fit=crop',
          ]}
        />
        <div className="container position-relative z-2">
          <span
            className="text-uppercase mb-3 d-block small fw-bold"
            style={{ letterSpacing: '2px', color: 'var(--color-secondary)' }}
          >
            {tStr('Мой аккаунт')}
          </span>
          <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            {tStr('Избранное')}
          </h1>
          <p className="lead mb-0 fw-light" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            {tStr('Сохранённые курсы, консультации и туры')}
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container py-5">
          <SectionHeader badge={tStr('Избранное')} title={tStr('Список желаний')} observe={observe} />

          {items.length === 0 ? (
            <div className="text-center py-5 reveal-up" ref={observe as any}>
              <div className="mb-4" style={{ opacity: 0.15 }}>
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M60 100C60 100 15 72 15 42C15 28 26 18 38 18C47 18 55 24 60 32C65 24 73 18 82 18C94 18 105 28 105 42C105 72 60 100 60 100Z"
                    stroke="var(--color-primary)"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    d="M40 55C40 55 50 65 60 75C70 65 80 55 80 45C80 39 75 35 70 35C65 35 62 38 60 42C58 38 55 35 50 35C45 35 40 39 40 45"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="font-playfair mb-3" style={{ color: 'var(--color-text)' }}>
                {tStr('Список пуст')}
              </h3>
              <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
                {tStr('Добавляйте курсы, консультации и туры в избранное, нажимая на ♡')}
              </p>
              <Link href="/courses" className="btn btn-primary-custom rounded-pill px-5 py-2">
                {tStr('Перейти к курсам')}
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`col-sm-6 col-lg-4 reveal-up reveal-delay-${idx % 3}`}
                  ref={observe as any}
                >
                  <div
                    className="card border-0 shadow-sm rounded-4 overflow-hidden h-100"
                    style={{ backgroundColor: 'var(--color-card-bg)' }}
                  >
                    {item.imageUrl ? (
                      <div style={{ height: '180px', overflow: 'hidden' }}>
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                      </div>
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{ height: '180px', backgroundColor: 'var(--color-secondary)' }}
                      >
                        <i className="bi bi-image" style={{ fontSize: '3rem', color: 'var(--color-text-muted)' }}></i>
                      </div>
                    )}
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="mb-2">
                        <span
                          className="badge rounded-pill px-3 py-2"
                          style={{
                            backgroundColor: 'var(--color-secondary)',
                            color: 'var(--color-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {TYPE_LABEL[item.itemType] || item.itemType}
                        </span>
                      </div>
                      <h5
                        className="fw-bold font-playfair mb-2 flex-grow-1"
                        style={{ color: 'var(--color-text)', lineHeight: '1.35' }}
                      >
                        {item.title}
                      </h5>
                      {item.price !== undefined && (
                        <p className="fw-bold mb-3" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                          {item.price.toLocaleString('ru-RU')} ₴
                        </p>
                      )}
                      <div className="d-flex gap-2 mt-auto">
                        {item.url && (
                          <Link
                            href={item.url}
                            className="btn btn-primary-custom rounded-pill flex-grow-1 py-2"
                            style={{ fontSize: '0.9rem' }}
                          >
                            {tStr('Подробнее')}
                          </Link>
                        )}
                        <button
                          className="btn rounded-pill px-3 py-2"
                          style={{
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-muted)',
                            fontSize: '0.9rem',
                          }}
                          onClick={() => handleRemove(item)}
                          title={tStr('Убрать из избранного')}
                        >
                          <i className="bi bi-heart-fill" style={{ color: '#e74c3c' }}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
