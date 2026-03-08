'use client';

import Image from 'next/image';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { useEffect, useState } from 'react';
import { Article } from '@/entities/blog/model/types';
import { ArticleCard } from '@/entities/blog/ui/ArticleCard';
import { getArticleTags, getArticles } from '@/shared/api/blogApi';
import { Pagination } from '@/shared/ui/Pagination/Pagination';
import { HeroSlider } from '@/shared/ui/HeroSlider/HeroSlider';

export default function BlogArticles() {
  const { t, tStr, lang } = useLanguage();
  const dateLocale = lang === 'en' ? 'en-US' : lang === 'uk' ? 'uk-UA' : 'ru-RU';
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function loadTags() {
      try {
        const availableTags = await getArticleTags();
        setTags(availableTags);
      } catch (err) {
        console.error('Error loading tags:', err);
      }
    }
    loadTags();
  }, []);

  useEffect(() => {
    async function loadArticles() {
      setLoading(true);
      try {
        const response = await getArticles(currentPage, 6, selectedTag, debouncedSearchQuery);
        setArticles(response.data);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Error loading articles:', err);
        setError(t.programs.errLoad);
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, [currentPage, selectedTag, debouncedSearchQuery]);

  // Reset page when tag or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTag, debouncedSearchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const element = document.getElementById('articles-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main>
      {/* HERO SECTION */}
      <section
        className="hero-section page-hero d-flex align-items-center text-center text-white position-relative"
        style={{
          height: '50vh',
          minHeight: '400px',
          background:
            "linear-gradient(rgba(62, 66, 58, 0.6), rgba(62, 66, 58, 0.7)), url('https://images.unsplash.com/photo-1544367563-12123d8965bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80') center/cover",
        }}
      >
        <HeroSlider
          pageKey="blog-articles"
          images={[
            'https://images.unsplash.com/photo-1544367563-12123d8965bf?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1599447421405-0753f5d1a5ca?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop',
          ]}
        />
        <div className="container position-relative z-2">
          <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            {tStr('Наш Блог')}
          </h1>
          <p className="lead text-white-50">{tStr('Полезные материалы для вашей практики')}</p>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section id="articles-content" className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container py-5">
          {tags.length > 0 && (
            <div className="d-flex flex-wrap gap-2 justify-content-center mb-4">
              <button
                className="btn rounded-pill px-4"
                style={
                  !selectedTag
                    ? {
                        backgroundColor: 'var(--color-text)',
                        color: 'var(--color-bg)',
                        border: '1px solid var(--color-text)',
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                      }
                }
                onClick={() => setSelectedTag(null)}
              >
                {tStr('Все')}
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  className="btn rounded-pill px-4"
                  style={
                    selectedTag === tag
                      ? {
                          backgroundColor: 'var(--color-text)',
                          color: 'var(--color-bg)',
                          border: '1px solid var(--color-text)',
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: 'var(--color-text)',
                          border: '1px solid var(--color-border)',
                        }
                  }
                  onClick={() => setSelectedTag(tag)}
                >
                  {tStr(tag)}
                </button>
              ))}
            </div>
          )}

          <div className="row justify-content-center mb-5">
            <div className="col-md-6">
              <div className="input-group">
                <span
                  className="input-group-text border-end-0 rounded-start-pill ps-4"
                  style={{ backgroundColor: 'var(--color-card-bg)' }}
                >
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 rounded-end-pill py-2 shadow-none"
                  placeholder={tStr('Поиск статей...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="row g-4">
            {loading && (
              <div className="col-12 text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">{t.programs.loading}</span>
                </div>
              </div>
            )}

            {error && <div className="col-12 alert alert-warning text-center">{error}</div>}

            {!loading && !error && articles.length === 0 && (
              <div className="col-12 text-center text-muted">{tStr('Статей пока нет.')}</div>
            )}

            {!loading &&
              !error &&
              articles.map((article) => (
                <div
                  key={article.id}
                  className="col-md-6 col-lg-4"
                  onClick={() => setSelectedArticle(article)}
                  style={{ cursor: 'pointer' }}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
          </div>

          {!loading && !error && totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </div>
      </section>

      {/* Modal for Article Details */}
      {selectedArticle && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0 position-absolute top-0 end-0 z-3">
                <button
                  type="button"
                  className="btn-close bg-white rounded-circle p-2 m-3 shadow-sm"
                  onClick={() => setSelectedArticle(null)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <div className="position-relative" style={{ height: '400px' }}>
                  <Image
                    src={
                      selectedArticle.imageUrl ||
                      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop'
                    }
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    style={{ objectFit: 'cover' }}
                    alt={tStr(selectedArticle.title)}
                  />
                  <div
                    className="position-absolute bottom-0 start-0 w-100 p-4 p-md-5"
                    style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}
                  >
                    {selectedArticle.tag && (
                      <span className="badge bg-primary mb-3 fs-6">{tStr(selectedArticle.tag)}</span>
                    )}
                    <h2 className="text-white font-playfair fw-bold display-5 mb-2">{tStr(selectedArticle.title)}</h2>
                    <p className="text-white-50 lead mb-0">{tStr(selectedArticle.subtitle)}</p>
                  </div>
                </div>

                <div className="p-4 p-md-5" style={{ backgroundColor: 'var(--color-card-bg)' }}>
                  <div className="d-flex align-items-center mb-5 pb-4 border-bottom">
                    {selectedArticle.authorPhoto ? (
                      <Image
                        width={60}
                        height={60}
                        src={
                          selectedArticle.authorPhoto ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=60'
                        }
                        style={{ objectFit: 'cover', borderRadius: '50%' }}
                        alt={selectedArticle.author || tStr('Автор')}
                        className="me-3 border"
                      />
                    ) : (
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3 border"
                        style={{ width: '60px', height: '60px', backgroundColor: 'var(--color-surface)' }}
                      >
                        <i className="bi bi-person text-muted fs-3"></i>
                      </div>
                    )}
                    <div>
                      <p className="mb-0 fw-bold fs-5">{selectedArticle.author || tStr('Админ сайта')}</p>
                      <p className="mb-0 text-muted">
                        {new Date(selectedArticle.createdAt).toLocaleDateString(dateLocale)}
                      </p>
                    </div>
                  </div>

                  <div
                    className="article-content"
                    style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#4a4a4a', whiteSpace: 'pre-wrap' }}
                  >
                    {selectedArticle.content || (
                      <>
                        <p className="mb-4">
                          {tStr(
                            'Йога — это не просто набор физических упражнений, это целостная система, которая помогает найти баланс между телом и разумом. В современном мире, полном стрессов и суеты, практика йоги становится настоящим спасением для многих людей.',
                          )}
                        </p>
                        <p className="mb-4">
                          {tStr(
                            'Исследования показывают, что регулярные занятия не только улучшают физическое самочувствие, но и способствуют формированию новых нейронных связей. Это означает, что мы буквально перепрограммируем свой мозг на более спокойное и осознанное восприятие реальности.',
                          )}
                        </p>
                        <h3 className="font-playfair mt-5 mb-4 text-dark">{tStr('С чего начать?')}</h3>
                        <p className="mb-4">
                          {tStr(
                            'Не пытайтесь изменить все сразу. Начните с малого: 10 минут утренней медитации или короткий комплекс растяжки перед сном. Главное — регулярность. Постепенно ваше тело само попросит большего, и практика станет естественной частью вашей жизни.',
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
