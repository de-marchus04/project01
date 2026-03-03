"use client";

import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useEffect, useState } from "react";
import { Video } from "@/entities/blog/model/types";
import { VideoCard } from "@/entities/blog/ui/VideoCard";
import { getVideos } from "@/shared/api/blogApi";
import { HeroSlider } from "@/shared/ui/HeroSlider/HeroSlider";

export default function BlogVideos() {
  const { t , tStr} = useLanguage() as any;
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    async function loadVideos() {
      try {
        const data = await getVideos();
        setVideos(data);
      } catch (err) {
        console.error('Error loading videos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  const tags = Array.from(new Set(videos.map(v => v.tag).filter(Boolean))) as string[];
  const filteredVideos = selectedTag ? videos.filter(v => v.tag === selectedTag) : videos;

  return (
    <main>
      <section 
        className="hero-section page-hero d-flex align-items-center text-center text-white position-relative"
        style={{
            height: '50vh',
            minHeight: '400px',
            background: "linear-gradient(rgba(62, 66, 58, 0.6), rgba(62, 66, 58, 0.7)), url('https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=2070&auto=format&fit=crop') center/cover"
        }}
      >
          <HeroSlider images={["https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=2070&auto=format&fit=crop","https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop","https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=2000&auto=format&fit=crop","https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop","https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2000&auto=format&fit=crop"]} />
          <div className="container position-relative z-2">
              <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{tStr("Видео-уроки")}</h1>
              <p className="lead text-white-50">
                  {tStr("Практикуйте вместе с нами в любом месте")}
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

                  {!loading && filteredVideos.length === 0 && (
                      <div className="col-12 text-center text-muted">{tStr("Видео пока нет.")}</div>
                  )}

                  {!loading && filteredVideos.map(video => (
                      <div key={video.id} className="col-md-6" onClick={() => setSelectedVideo(video)} style={{ cursor: 'pointer' }}>
                          <VideoCard video={video} />
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Modal for Video Details */}
      {selectedVideo && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedVideo(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0">
                <button type="button" className="btn-close" onClick={() => setSelectedVideo(null)}></button>
              </div>
              <div className="modal-body p-4 pt-0">
                <div className="text-center mb-4">
                  <span className="badge bg-light text-dark border mb-2">{selectedVideo.tag || tStr("Видео")}</span>
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
    </main>
  );
}