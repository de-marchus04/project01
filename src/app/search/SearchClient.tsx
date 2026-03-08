'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { globalSearch, GlobalSearchResponse, SearchResult } from '@/shared/api/searchApi';

const TYPE_ICONS: Record<string, string> = {
  course: 'bi-book',
  consultation: 'bi-person-circle',
  tour: 'bi-geo-alt',
  article: 'bi-newspaper',
};

function ResultCard({ item, typeLabel }: { item: SearchResult; typeLabel: string }) {
  return (
    <Link href={item.url} className="text-decoration-none">
      <div
        className="card border-0 shadow-sm h-100 rounded-3 overflow-hidden"
        style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        {item.imageUrl && (
          <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
            <Image
              src={item.imageUrl}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              style={{ objectFit: 'cover' }}
              alt={item.title}
            />
          </div>
        )}
        <div className="card-body p-3">
          <span className="badge bg-secondary mb-2 small">
            <i className={`bi ${TYPE_ICONS[item.type]} me-1`}></i>
            {typeLabel}
          </span>
          <h6 className="card-title fw-bold mb-1" style={{ fontSize: '0.9rem' }}>
            {item.title}
          </h6>
          {item.description && (
            <p
              className="text-muted small mb-1"
              style={{
                fontSize: '0.8rem',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {item.description}
            </p>
          )}
          {item.price !== undefined && (
            <p className="fw-bold mb-0" style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>
              {item.price.toLocaleString('ru-RU')} ₴
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function SearchClient({ initialQuery }: { initialQuery?: string }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState<GlobalSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await globalSearch(query);
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const typeLabels: Record<string, string> = {
    course: t.search.typeCourse,
    consultation: t.search.typeConsultation,
    tour: t.search.typeTour,
    article: t.search.typeArticle,
  };

  const sections: { key: keyof Omit<GlobalSearchResponse, 'total'>; label: string }[] = [
    { key: 'courses', label: t.search.sectionCourses },
    { key: 'consultations', label: t.search.sectionConsultations },
    { key: 'tours', label: t.search.sectionTours },
    { key: 'articles', label: t.search.sectionArticles },
  ];

  const hasResults = results && results.total > 0;
  const emptySearch = results && results.total === 0;

  return (
    <main>
      <section
        className="py-5 d-flex align-items-center"
        style={{ minHeight: '40vh', backgroundColor: 'var(--color-surface)', paddingTop: '120px' }}
      >
        <div className="container">
          <h1 className="font-playfair text-center mb-4 display-5">{t.search.title}</h1>
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="input-group input-group-lg shadow-sm">
                <span
                  className="input-group-text border-end-0 rounded-start-pill ps-4"
                  style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}
                >
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  className="form-control border-start-0 border-end-0 shadow-none"
                  style={{
                    backgroundColor: 'var(--color-card-bg)',
                    color: 'var(--color-text)',
                    borderColor: 'var(--color-border)',
                  }}
                  placeholder={t.search.placeholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    className="btn border-start-0 rounded-end-pill pe-4"
                    type="button"
                    onClick={() => setQuery('')}
                    style={{
                      backgroundColor: 'var(--color-card-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
                {!query && (
                  <span
                    className="input-group-text border-start-0 rounded-end-pill pe-4"
                    style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}
                  ></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t.search.loading}</span>
              </div>
            </div>
          )}

          {/* No results */}
          {!loading && emptySearch && (
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted"></i>
              <p className="mt-3 text-muted fs-5">
                {t.search.noResults} «{query}»
              </p>
            </div>
          )}

          {/* Prompt */}
          {!loading && !results && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-search display-1 opacity-25"></i>
              <p className="mt-3 fs-5">{t.search.minChars}</p>
            </div>
          )}

          {/* Results */}
          {!loading && hasResults && (
            <>
              <p className="text-muted mb-4">
                {t.search.foundResults} <strong>{results.total}</strong> {t.search.byQuery} «{query}»
              </p>
              {sections.map(({ key, label }) => {
                const items = results[key] as SearchResult[];
                if (!items.length) return null;
                return (
                  <div key={key} className="mb-5">
                    <h5 className="font-playfair mb-3 border-bottom pb-2">{label}</h5>
                    <div className="row g-3">
                      {items.map((item) => (
                        <div key={item.id} className="col-sm-6 col-md-4 col-lg-3">
                          <ResultCard item={item} typeLabel={typeLabels[item.type] || item.type} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
