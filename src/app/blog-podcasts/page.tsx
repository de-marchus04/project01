"use client";

import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useEffect, useState } from "react";
import { Podcast } from "@/entities/blog/model/types";
import { PodcastCard } from "@/entities/blog/ui/PodcastCard";
import { getPodcasts } from "@/shared/api/blogApi";
import { HeroSlider } from "@/shared/ui/HeroSlider/HeroSlider";

export default function BlogPodcasts() {
  const { t , tStr} = useLanguage() as any;
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);

  useEffect(() => {
    async function loadPodcasts() {
      try {
        const data = await getPodcasts();
        setPodcasts(data);
      } catch (err) {
        console.error('Error loading podcasts:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPodcasts();
  }, []);

  const tags = Array.from(new Set(podcasts.map(p => p.tag).filter(Boolean))) as string[];
  const filteredPodcasts = selectedTag ? podcasts.filter(p => p.tag === selectedTag) : podcasts;

  return (
    <main>
      <section 
        className="hero-section page-hero d-flex align-items-center text-center text-white position-relative"
        style={{
            height: '50vh',
            minHeight: '400px',
            background: "linear-gradient(rgba(62, 66, 58, 0.6), rgba(62, 66, 58, 0.7)), url('https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=2070&auto=format&fit=crop') center/cover"
        }}
      >
          <HeroSlider images={["https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=2070&auto=format&fit=crop","https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop","https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=2000&auto=format&fit=crop","https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop","https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2000&auto=format&fit=crop"]} />
          <div className="container position-relative z-2">
              <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{tStr("Подкасты")}</h1>
              <p className="lead text-white-50">
                  {tStr("Слушайте нас в дороге, на прогулке или дома")}
              </p>
          </div>
      </section>

      <section className="py-5 bg-light">
          <div className="container py-5">
              {tags.length > 0 && (
                <div className="d-flex flex-wrap gap-2 justify-content-center mb-5">
                  <button 
                    className={`btn rounded-pill px-4 ${!selectedTag ? 'btn-dark' : 'btn-outline-dark'}`}
                    onClick={() => setSelectedTag(null)}
                  >{tStr("Все")}</button>
                  {tags.map(tag => (
                    <button 
                      key={tag}
                      className={`btn rounded-pill px-4 ${selectedTag === tag ? 'btn-dark' : 'btn-outline-dark'}`}
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tStr(tag)}
                    </button>
                  ))}
                </div>
              )}

              <div className="row g-4">
                  {loading && (
                      <div className="col-12 text-center">
                          <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">{t.programs.loading}</span>
                          </div>
                      </div>
                  )}

                  {!loading && filteredPodcasts.length === 0 && (
                      <div className="col-12 text-center text-muted">{tStr("Подкастов пока нет.")}</div>
                  )}

                  {!loading && filteredPodcasts.map(podcast => (
                      <div key={podcast.id} className="col-12" onClick={() => setSelectedPodcast(podcast)} style={{ cursor: 'pointer' }}>
                          <PodcastCard podcast={podcast} />
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Modal for Podcast Details */}
      {selectedPodcast && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedPodcast(null)}>
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
                  <span className="badge bg-light text-dark border mb-2">{selectedPodcast.tag || tStr("Подкаст")}</span>
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
    </main>
  );
}