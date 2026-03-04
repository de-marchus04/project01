"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Article } from "@/entities/blog/model/types";
import { getArticleById } from "@/shared/api/blogApi";
import Link from "next/link";
import { useLanguage } from "@/shared/i18n/LanguageContext";

export default function ArticleDetail() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tData, tStr, lang } = useLanguage() as any;
  const dateLocale = lang === 'en' ? 'en-US' : lang === 'uk' ? 'uk-UA' : 'ru-RU';

  useEffect(() => {
    async function loadArticle() {
      try {
        const id = params.id as string;
        const data = await getArticleById(id);
        if (data) {
          setArticle(data);
        } else {
          setError(tStr("Статья не найдена"));
        }
      } catch (err) {
        console.error("Error loading article:", err);
        setError("Не удалось загрузить статью.");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadArticle();
    }

    // Слушаем событие storage для обновления данных при изменении профиля
    const handleStorageChange = () => {
      if (params.id) {
        loadArticle();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [params.id]);

  if (loading) {
    return (
      <main className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{tStr("Загрузка...")}</span>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="container py-5 text-center" style={{ minHeight: '60vh', paddingTop: '150px !important' }}>
        <h2 className="font-playfair mb-4">{error || tStr("Статья не найдена")}</h2>
        <button onClick={() => router.back()} className="btn btn-outline-primary-custom rounded-pill px-4">{tStr("Вернуться назад")}</button>
      </main>
    );
  }

  const loc_article = article && tData ? tData(article) : article;
  return (
    <main>
      {/* HERO SECTION */}
      <section 
        className="hero-section d-flex align-items-center text-white position-relative"
        style={{
            height: '50vh',
            minHeight: '400px',
            background: `linear-gradient(rgba(62, 66, 58, 0.6), rgba(62, 66, 58, 0.8)), url('${loc_article.imageUrl}') no-repeat center center/cover`
        }}
      >
          <div className="container position-relative z-2 text-center">
              <span className="text-uppercase mb-3 d-block small fw-bold" style={{ letterSpacing: '2px', color: 'var(--color-secondary)' }}>
                  {new Date(loc_article.createdAt).toLocaleDateString(dateLocale)}
              </span>
              <h1 className="display-4 font-playfair mb-4 mx-auto" style={{ maxWidth: '800px', textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                  {loc_article.title}
              </h1>
          </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="mb-5">
                  <button 
                    onClick={() => router.back()} 
                    className="btn btn-outline-dark rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2"
                    style={{ 
                      borderColor: 'var(--color-primary)', 
                      color: 'var(--color-primary)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-primary)';
                    }}
                  >
                    <i className="bi bi-arrow-left"></i>{tStr("Назад к статьям")}</button>
                </div>
                <p className="lead text-muted mb-5 font-playfair fst-italic" style={{ fontSize: '1.25rem', borderLeft: '4px solid var(--color-primary)', paddingLeft: '1.5rem' }}>
                  {loc_article.subtitle}
                </p>
                <div className="article-content" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#4a4a4a', whiteSpace: 'pre-wrap' }}>
                  {loc_article.content || (
                    <>
                      <p className="mb-4">{tStr("Йога — это не просто набор физических упражнений, это целостная система, которая помогает найти баланс между телом и разумом. В современном мире, полном стрессов и суеты, практика йоги становится настоящим спасением для многих людей.")}</p>
                      <p className="mb-4">{tStr("Исследования показывают, что регулярные занятия не только улучшают физическое самочувствие, но и способствуют формированию новых нейронных связей. Это означает, что мы буквально перепрограммируем свой мозг на более спокойное и осознанное восприятие реальности.")}</p>
                      <img 
                        src={loc_article.imageUrl} 
                        alt="Article illustration" 
                        className="img-fluid rounded-4 my-5 shadow-sm w-100" 
                        style={{ maxHeight: '400px', objectFit: 'cover' }}
                      />
                      <h3 className="font-playfair mt-4 mb-4 text-dark">{tStr("С чего начать?")}</h3>
                      <p className="mb-4">{tStr("Не пытайтесь изменить все сразу. Начните с малого: 10 минут утренней медитации или короткий комплекс растяжки перед сном. Главное — регулярность. Постепенно ваше тело само попросит большего, и практика станет естественной частью вашей жизни.")}</p>
                      <div className="p-4 rounded-4 shadow-sm mt-5 border-start border-4" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-accent) !important' }}>
                        <h5 className="font-playfair mb-3">{tStr("Практический совет")}</h5>
                        <p className="mb-0 small">{tStr(`Попробуйте внедрить правило "одной минуты". Если вам кажется, что у вас совершенно нет времени на практику, пообещайте себе позаниматься ровно одну минуту. Часто самое сложное — это просто расстелить коврик.`)}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-2">
                    {loc_article.tag ? (
                      <span className="badge bg-light text-dark border">{loc_article.tag}</span>
                    ) : (
                      <>
                        <span className="badge bg-light text-dark border">{tStr("Осознанность")}</span>
                        <span className="badge bg-light text-dark border">{tStr("Практика")}</span>
                      </>
                    )}
                  </div>
                  <div className="d-flex gap-3">
                    <button className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-telegram text-primary"></i>
                    </button>
                    <button className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-whatsapp text-success"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>
    </main>
  );
}
