"use client";

import Image from "next/image";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useEffect, useState } from "react";
import { Article, Video, Podcast, Recipe } from "@/entities/blog/model/types";
import { ArticleCard } from "@/entities/blog/ui/ArticleCard";
import { VideoCard } from "@/entities/blog/ui/VideoCard";
import { PodcastCard } from "@/entities/blog/ui/PodcastCard";
import { RecipeCard } from "@/entities/blog/ui/RecipeCard";
import { getArticles, getVideos, getPodcasts, getRecipes } from "@/shared/api/blogApi";
import { HeroSlider } from "@/shared/ui/HeroSlider/HeroSlider";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { SectionHeader } from "@/shared/ui/SectionHeader/SectionHeader";

type ContentType = 'articles' | 'videos' | 'podcasts' | 'recipes';

export default function BlogAllClient() {
  const { t, tStr, lang } = useLanguage();
  const { observe } = useScrollReveal();
  const dateLocale = lang === 'en' ? 'en-US' : lang === 'uk' ? 'uk-UA' : 'ru-RU';

  const [activeType, setActiveType] = useState<ContentType>('articles');

  // Articles state
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoaded, setArticlesLoaded] = useState(false);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Videos state
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoaded, setVideosLoaded] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Podcasts state
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [podcastsLoaded, setPodcastsLoaded] = useState(false);
  const [podcastsLoading, setPodcastsLoading] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);

  // Recipes state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoaded, setRecipesLoaded] = useState(false);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Load data for the active tab (lazy-load per tab)
  useEffect(() => {
    if (activeType === 'articles' && !articlesLoaded) {
      setArticlesLoading(true);
      getArticles(1, 100).then(r => {
        setArticles(r.data);
        setArticlesLoaded(true);
      }).catch(console.error).finally(() => setArticlesLoading(false));
    }
    if (activeType === 'videos' && !videosLoaded) {
      setVideosLoading(true);
      getVideos().then(data => {
        setVideos(data);
        setVideosLoaded(true);
      }).catch(console.error).finally(() => setVideosLoading(false));
    }
    if (activeType === 'podcasts' && !podcastsLoaded) {
      setPodcastsLoading(true);
      getPodcasts().then(data => {
        setPodcasts(data);
        setPodcastsLoaded(true);
      }).catch(console.error).finally(() => setPodcastsLoading(false));
    }
    if (activeType === 'recipes' && !recipesLoaded) {
      setRecipesLoading(true);
      getRecipes().then(data => {
        setRecipes(data);
        setRecipesLoaded(true);
      }).catch(console.error).finally(() => setRecipesLoading(false));
    }
  }, [activeType]);

  const TABS: { key: ContentType; ruLabel: string; icon: string }[] = [
    { key: 'articles', ruLabel: 'Статьи', icon: 'bi-journal-text' },
    { key: 'videos',   ruLabel: 'Видео',   icon: 'bi-play-circle' },
    { key: 'podcasts', ruLabel: 'Подкасты', icon: 'bi-mic' },
    { key: 'recipes',  ruLabel: 'Рецепты',  icon: 'bi-egg-fried' },
  ];

  const tabLabel = (key: ContentType) => {
    const map: Record<ContentType, string> = {
      articles: t.nav?.blogArticles || 'Статьи',
      videos:   t.nav?.blogVideos   || 'Видео',
      podcasts: t.nav?.blogPodcasts || 'Подкасты',
      recipes:  t.nav?.blogRecipes  || 'Рецепты',
    };
    return map[key];
  };

  const isLoading =
    (activeType === 'articles' && articlesLoading) ||
    (activeType === 'videos' && videosLoading) ||
    (activeType === 'podcasts' && podcastsLoading) ||
    (activeType === 'recipes' && recipesLoading);

  return (
    <main>
      {/* HERO */}
      <section
        className="hero-section page-hero d-flex align-items-center text-center text-white position-relative"
        style={{ height: '60vh', minHeight: '500px', overflow: 'hidden' }}
      >
        <HeroSlider images={[
          "https://images.unsplash.com/photo-1544367563-12123d8965bf?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1599447421405-0753f5d1a5ca?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop",
        ]} />
        <div className="container position-relative z-2">
          <span className="text-uppercase mb-3 d-block small fw-bold" style={{ letterSpacing: '2px', color: 'var(--color-secondary)' }}>
            {t.nav?.blog || 'Блог'}
          </span>
          <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            {tStr('Наш Блог')}
          </h1>
          <p className="lead mb-5 col-lg-8 mx-auto fw-light" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            {tStr('Статьи, видео, подкасты и рецепты для вашей практики')}
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section id="blog-content" className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container py-5">
          <SectionHeader
            badge={t.nav?.blog || 'Блог'}
            title={tStr('Полезные материалы')}
            observe={observe}
          />

          {/* Type Tabs */}
          <div className="d-flex flex-wrap gap-2 justify-content-center mb-5 reveal-up" ref={observe as any}>
            {TABS.map(({ key, icon }) => (
              <button
                key={key}
                className="btn rounded-pill px-4 py-2 d-flex align-items-center gap-2"
                style={activeType === key
                  ? { backgroundColor: 'var(--color-primary)', color: '#fff', border: '1px solid var(--color-primary)' }
                  : { backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                onClick={() => setActiveType(key)}
              >
                <i className={`bi ${icon}`}></i>
                {tabLabel(key)}
              </button>
            ))}
          </div>

          {/* Loading spinner */}
          {isLoading && (
            <div className="text-center py-5">
              <div className="spinner-border" role="status" style={{ color: 'var(--color-primary)' }}>
                <span className="visually-hidden">{t.programs?.loading || 'Загрузка...'}</span>
              </div>
            </div>
          )}

          {/* Articles grid */}
          {activeType === 'articles' && !articlesLoading && (
            <div className="row g-4">
              {articles.length === 0 && articlesLoaded && (
                <p className="col-12 text-center text-muted">{tStr('Статей пока нет.')}</p>
              )}
              {articles.map((article, idx) => (
                <div
                  key={article.id}
                  className={`col-md-6 col-lg-4 reveal-up reveal-delay-${idx % 3}`}
                  ref={observe as any}
                  onClick={() => setSelectedArticle(article)}
                  style={{ cursor: 'pointer' }}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          )}

          {/* Videos grid */}
          {activeType === 'videos' && !videosLoading && (
            <div className="row g-4">
              {videos.length === 0 && videosLoaded && (
                <p className="col-12 text-center text-muted">{tStr('Видео пока нет.')}</p>
              )}
              {videos.map((video, idx) => (
                <div
                  key={video.id}
                  className={`col-md-6 reveal-up reveal-delay-${idx % 2}`}
                  ref={observe as any}
                  onClick={() => setSelectedVideo(video)}
                  style={{ cursor: 'pointer' }}
                >
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          )}

          {/* Podcasts list */}
          {activeType === 'podcasts' && !podcastsLoading && (
            <div className="row g-4">
              {podcasts.length === 0 && podcastsLoaded && (
                <p className="col-12 text-center text-muted">{tStr('Подкастов пока нет.')}</p>
              )}
              {podcasts.map((podcast, idx) => (
                <div
                  key={podcast.id}
                  className={`col-12 reveal-up reveal-delay-${idx % 3}`}
                  ref={observe as any}
                  onClick={() => setSelectedPodcast(podcast)}
                  style={{ cursor: 'pointer' }}
                >
                  <PodcastCard podcast={podcast} />
                </div>
              ))}
            </div>
          )}

          {/* Recipes grid */}
          {activeType === 'recipes' && !recipesLoading && (
            <div className="row g-4">
              {recipes.length === 0 && recipesLoaded && (
                <p className="col-12 text-center text-muted">{tStr('Рецептов пока нет.')}</p>
              )}
              {recipes.map((recipe, idx) => (
                <div
                  key={recipe.id}
                  className={`col-md-6 col-lg-4 reveal-up reveal-delay-${idx % 3}`}
                  ref={observe as any}
                  onClick={() => setSelectedRecipe(recipe)}
                  style={{ cursor: 'pointer' }}
                >
                  <RecipeCard recipe={recipe} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={() => setSelectedArticle(null)}>
          <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0 position-absolute top-0 end-0 z-3">
                <button type="button" className="btn-close bg-white rounded-circle p-2 m-3 shadow-sm" onClick={() => setSelectedArticle(null)}></button>
              </div>
              <div className="modal-body p-0">
                <div className="position-relative" style={{ height: '400px' }}>
                  <Image
                    src={selectedArticle.imageUrl || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop'}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    style={{ objectFit: 'cover' }}
                    alt={tStr(selectedArticle.title)}
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 p-4 p-md-5" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
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
                      <Image width={60} height={60} src={selectedArticle.authorPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=60'} style={{ objectFit: 'cover', borderRadius: '50%' }} alt={selectedArticle.author || tStr('Автор')} className="me-3 border" />
                    ) : (
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3 border" style={{ width: '60px', height: '60px', backgroundColor: 'var(--color-surface)' }}>
                        <i className="bi bi-person text-muted fs-3"></i>
                      </div>
                    )}
                    <div>
                      <p className="mb-0 fw-bold fs-5">{selectedArticle.author || tStr('Автор')}</p>
                      <p className="mb-0 text-muted">{new Date(selectedArticle.createdAt).toLocaleDateString(dateLocale)}</p>
                    </div>
                  </div>
                  <div className="article-content" style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#4a4a4a', whiteSpace: 'pre-wrap' }}>
                    {selectedArticle.content || tStr('Текст статьи недоступен.')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={() => setSelectedVideo(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0">
                <button type="button" className="btn-close" onClick={() => setSelectedVideo(null)}></button>
              </div>
              <div className="modal-body p-4 pt-0">
                <div className="text-center mb-4">
                  <span className="badge bg-light text-dark border mb-2">{selectedVideo.tag || tStr('Видео')}</span>
                  <h3 className="font-playfair fw-bold">{tStr(selectedVideo.title)}</h3>
                </div>
                <div className="ratio ratio-16x9 mb-4 rounded-4 overflow-hidden shadow-sm">
                  <iframe src={selectedVideo.videoUrl} title={tStr(selectedVideo.title)} allowFullScreen></iframe>
                </div>
                <p className="text-muted lead">{tStr(selectedVideo.description)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Podcast Modal */}
      {selectedPodcast && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={() => setSelectedPodcast(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0">
                <button type="button" className="btn-close" onClick={() => setSelectedPodcast(null)}></button>
              </div>
              <div className="modal-body p-4 pt-0 text-center">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '100px', height: '100px', backgroundColor: 'var(--color-primary)' }}>
                  <i className="bi bi-mic-fill text-white" style={{ fontSize: '3rem' }}></i>
                </div>
                <div className="mb-3">
                  <span className="badge bg-light text-dark border mb-2">{selectedPodcast.tag || tStr('Подкаст')}</span>
                  <span className="badge bg-light text-dark border ms-2 mb-2"><i className="bi bi-clock me-1"></i>{selectedPodcast.duration}</span>
                </div>
                <h3 className="font-playfair fw-bold mb-3">{tStr(selectedPodcast.title)}</h3>
                <p className="text-muted mb-4">{tStr(selectedPodcast.description)}</p>
                <div className="bg-light rounded-pill p-2 d-flex align-items-center gap-3">
                  <button className="btn btn-dark rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-play-fill fs-5"></i>
                  </button>
                  <div className="flex-grow-1 bg-white rounded-pill" style={{ height: '6px' }}>
                    <div className="bg-dark rounded-pill h-100" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-muted small pe-3">0:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={() => setSelectedRecipe(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0">
                <button type="button" className="btn-close" onClick={() => setSelectedRecipe(null)}></button>
              </div>
              <div className="modal-body p-0">
                {selectedRecipe.imageUrl && (
                  <div style={{ position: 'relative', height: '300px' }}>
                    <Image src={selectedRecipe.imageUrl} fill sizes="(max-width: 768px) 100vw, 600px" style={{ objectFit: 'cover' }} alt={tStr(selectedRecipe.title)} />
                  </div>
                )}
                <div className="p-4">
                  <div className="d-flex gap-2 mb-3">
                    {selectedRecipe.tag && <span className="badge bg-light text-dark border">{tStr(selectedRecipe.tag)}</span>}
                    <span className="badge bg-light text-dark border"><i className="bi bi-clock me-1"></i>{selectedRecipe.time}</span>
                  </div>
                  <h3 className="font-playfair fw-bold mb-3">{tStr(selectedRecipe.title)}</h3>
                  <p className="text-muted" style={{ lineHeight: '1.8' }}>
                    {tStr(selectedRecipe.fullDescription || selectedRecipe.description)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
