"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { globalSearch, GlobalSearchResponse, SearchResult } from "@/shared/api/searchApi";

const TYPE_LABELS: Record<string, string> = {
  course: 'Курс',
  consultation: 'Консультация',
  tour: 'Тур',
  article: 'Статья',
};

const TYPE_ICONS: Record<string, string> = {
  course: 'bi-book',
  consultation: 'bi-person-circle',
  tour: 'bi-geo-alt',
  article: 'bi-newspaper',
};

function ResultCard({ item }: { item: SearchResult }) {
  return (
    <Link href={item.url} className="text-decoration-none">
      <div className="card border-0 shadow-sm h-100 rounded-3 overflow-hidden"
        style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        {item.imageUrl && (
          <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
            <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div className="card-body p-3">
          <span className="badge bg-secondary mb-2 small">
            <i className={`bi ${TYPE_ICONS[item.type]} me-1`}></i>
            {TYPE_LABELS[item.type]}
          </span>
          <h6 className="card-title fw-bold mb-1" style={{ fontSize: '0.9rem' }}>{item.title}</h6>
          {item.description && (
            <p className="text-muted small mb-1" style={{ fontSize: '0.8rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
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

  const sections: { key: keyof Omit<GlobalSearchResponse, 'total'>; label: string }[] = [
    { key: 'courses', label: 'Курсы' },
    { key: 'consultations', label: 'Консультации' },
    { key: 'tours', label: 'Туры' },
    { key: 'articles', label: 'Статьи' },
  ];

  const hasResults = results && results.total > 0;
  const emptySearch = results && results.total === 0;

  return (
    <main>
      <section
        className="py-5 d-flex align-items-center"
        style={{ minHeight: '40vh', background: 'linear-gradient(135deg, var(--color-primary-soft, #f8f5f0) 0%, var(--color-bg) 100%)', paddingTop: '120px' }}
      >
        <div className="container">
          <h1 className="font-playfair text-center mb-4 display-5">Поиск по сайту</h1>
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="input-group input-group-lg shadow">
                <span className="input-group-text bg-white border-end-0 rounded-start-pill ps-4">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  className="form-control border-start-0 border-end-0 bg-white"
                  placeholder="Курс йоги, тур, статья..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    className="btn btn-outline-secondary border-start-0 rounded-end-pill pe-4"
                    type="button"
                    onClick={() => setQuery('')}
                    style={{ background: 'white' }}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
                {!query && (
                  <span className="input-group-text bg-white border-start-0 rounded-end-pill pe-4"></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light details-section">
        <div className="container">
          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Поиск...</span>
              </div>
            </div>
          )}

          {/* No results */}
          {!loading && emptySearch && (
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted"></i>
              <p className="mt-3 text-muted fs-5">По запросу «{query}» ничего не найдено</p>
            </div>
          )}

          {/* Prompt */}
          {!loading && !results && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-search display-1 opacity-25"></i>
              <p className="mt-3 fs-5">Введите минимум 2 символа для поиска</p>
            </div>
          )}

          {/* Results */}
          {!loading && hasResults && (
            <>
              <p className="text-muted mb-4">
                Найдено результатов: <strong>{results.total}</strong> по запросу «{query}»
              </p>
              {sections.map(({ key, label }) => {
                const items = results[key] as SearchResult[];
                if (!items.length) return null;
                return (
                  <div key={key} className="mb-5">
                    <h5 className="font-playfair mb-3 border-bottom pb-2">{label}</h5>
                    <div className="row g-3">
                      {items.map(item => (
                        <div key={item.id} className="col-sm-6 col-md-4 col-lg-3">
                          <ResultCard item={item} />
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
