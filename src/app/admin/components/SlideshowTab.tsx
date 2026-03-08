'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { uploadImageToCloud } from '@/shared/api/uploadApi';
import { getPageSlidesAdmin, createPageSlide, updatePageSlide, deletePageSlide } from '@/shared/api/slideApi';
import { modalService } from '@/shared/ui/Modal/modalService';

type Slide = {
  id: string;
  pageKey: string;
  url: string;
  mediaType: 'IMAGE' | 'VIDEO';
  title: string | null;
  sortOrder: number;
  active: boolean;
};

type Props = { showToast: (msg: string, type?: 'success' | 'error') => void };

const PAGE_OPTIONS = [
  { key: 'home', label: 'Главная (home)' },
  { key: 'blog', label: 'Блог (blog)' },
  { key: 'blog-articles', label: 'Блог — Статьи' },
  { key: 'blog-videos', label: 'Блог — Видео' },
  { key: 'blog-podcasts', label: 'Блог — Подкасты' },
  { key: 'blog-recipes', label: 'Блог — Рецепты' },
  { key: 'courses', label: 'Курсы (courses)' },
  { key: 'courses-beginners', label: 'Курсы — Для начинающих' },
  { key: 'courses-women', label: 'Курсы — Женское здоровье' },
  { key: 'courses-meditation', label: 'Курсы — Медитация' },
  { key: 'courses-back', label: 'Курсы — Здоровая спина' },
  { key: 'tours', label: 'Туры (tours)' },
  { key: 'consultations', label: 'Консультации' },
  { key: 'consultations-private', label: 'Консультации — Частная практика' },
  { key: 'consultations-nutrition', label: 'Консультации — Нутрициология' },
  { key: 'consultations-mentorship', label: 'Консультации — Менторство' },
  { key: 'faq', label: 'FAQ' },
  { key: 'contact', label: 'Контакты (contact)' },
  { key: 'wishlist', label: 'Избранное (wishlist)' },
];

export default function SlideshowTab({ showToast }: Props) {
  const { t } = useLanguage();
  const [selectedPage, setSelectedPage] = useState(PAGE_OPTIONS[0].key);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);

  // Add-image state
  const [imgUploading, setImgUploading] = useState(false);

  // Add-video state
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoForm, setShowVideoForm] = useState(false);

  useEffect(() => {
    loadSlides();
  }, [selectedPage]);

  const loadSlides = async () => {
    setLoading(true);
    try {
      const data = await getPageSlidesAdmin(selectedPage);
      setSlides(data as Slide[]);
    } catch {
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Image upload ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX = 2000;
        let w = img.width,
          h = img.height;
        if (w > MAX) {
          h *= MAX / w;
          w = MAX;
        }
        if (h > MAX) {
          w *= MAX / h;
          h = MAX;
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        try {
          const url = await uploadImageToCloud(dataUrl);
          await createPageSlide({ pageKey: selectedPage, url, mediaType: 'IMAGE', sortOrder: slides.length });
          await loadSlides();
          showToast(t.admin.itemSaved, 'success');
        } catch {
          showToast(t.admin.errSave, 'error');
        } finally {
          setImgUploading(false);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // --- Video add ---
  const handleAddVideo = async () => {
    if (!videoUrl.trim()) return;
    try {
      await createPageSlide({
        pageKey: selectedPage,
        url: videoUrl.trim(),
        mediaType: 'VIDEO',
        sortOrder: slides.length,
      });
      await loadSlides();
      setVideoUrl('');
      setShowVideoForm(false);
      showToast(t.admin.itemSaved, 'success');
    } catch {
      showToast(t.admin.errSave, 'error');
    }
  };

  // --- Toggle active ---
  const handleToggleActive = async (slide: Slide) => {
    try {
      await updatePageSlide(slide.id, { active: !slide.active });
      await loadSlides();
    } catch {
      showToast(t.admin.errSave, 'error');
    }
  };

  // --- Change order ---
  const handleOrderChange = async (slide: Slide, newOrder: number) => {
    try {
      await updatePageSlide(slide.id, { sortOrder: newOrder });
      await loadSlides();
    } catch {
      showToast(t.admin.errSave, 'error');
    }
  };

  // --- Delete ---
  const handleDelete = async (id: string) => {
    if (!(await modalService.confirm('', t.admin.slideshowConfirmDel))) return;
    try {
      await deletePageSlide(id);
      await loadSlides();
      showToast(t.admin.itemSaved, 'success');
    } catch {
      showToast(t.admin.errSave, 'error');
    }
  };

  return (
    <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--color-text)' }}>
          {t.admin.slideshowTitle}
        </h3>

        {/* Page selector */}
        <select
          className="form-select form-select-sm rounded-pill"
          style={{
            maxWidth: 280,
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text)',
          }}
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
        >
          {PAGE_OPTIONS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Action buttons */}
        <div className="d-flex gap-2 flex-wrap">
          <label
            className="btn btn-sm px-3 rounded-pill"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              cursor: imgUploading ? 'default' : 'pointer',
              opacity: imgUploading ? 0.6 : 1,
            }}
          >
            <i className="bi bi-image me-2"></i>
            {imgUploading ? t.admin.slideshowUploading : t.admin.slideshowAddImage}
            <input
              type="file"
              accept="image/*"
              className="d-none"
              disabled={imgUploading}
              onChange={handleImageUpload}
            />
          </label>

          <button
            className="btn btn-sm px-3 rounded-pill"
            style={{
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary)',
              backgroundColor: 'transparent',
            }}
            onClick={() => setShowVideoForm((v) => !v)}
          >
            <i className="bi bi-camera-video me-2"></i>
            {t.admin.slideshowAddVideo}
          </button>
        </div>
      </div>

      {/* Video URL form */}
      {showVideoForm && (
        <div
          className="card border-0 p-3 mb-4 rounded-3"
          style={{ background: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}
        >
          <label className="form-label small fw-semibold" style={{ color: 'var(--color-text)' }}>
            {t.admin.slideshowVideoUrl}
          </label>
          <div className="d-flex gap-2">
            <input
              type="url"
              className="form-control rounded-pill"
              placeholder={t.admin.slideshowVideoPlaceholder}
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              style={{
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-card-bg)',
                color: 'var(--color-text)',
              }}
            />
            <button
              className="btn btn-sm px-4 rounded-pill"
              style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', whiteSpace: 'nowrap' }}
              onClick={handleAddVideo}
              disabled={!videoUrl.trim()}
            >
              {t.admin.modeAdd}
            </button>
          </div>
          <p className="small mt-2 mb-0" style={{ color: 'var(--color-text-muted)' }}>
            {t.admin.slideshowVideoHint}
          </p>
        </div>
      )}

      {/* Slides list */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--color-primary)' }} role="status" />
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-5" style={{ color: 'var(--color-text-muted)' }}>
          <i className="bi bi-images" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
          <p className="mt-3">{t.admin.slideshowNoSlides}</p>
          <p className="small opacity-50">{t.admin.slideshowDefaultHint}</p>
        </div>
      ) : (
        <div className="row g-3">
          {slides.map((slide) => (
            <div key={slide.id} className="col-12 col-md-6 col-xl-4">
              <div
                className="card border-0 h-100"
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  opacity: slide.active ? 1 : 0.5,
                }}
              >
                {/* Preview */}
                <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: 'var(--color-secondary)' }}>
                  {slide.mediaType === 'VIDEO' ? (
                    <video
                      src={slide.url}
                      muted
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <img
                      src={slide.url}
                      alt={slide.title ?? ''}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  {/* Type badge */}
                  <span
                    className="badge position-absolute"
                    style={{
                      top: 8,
                      left: 8,
                      backgroundColor: slide.mediaType === 'VIDEO' ? 'rgba(99,102,241,0.85)' : 'rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                    }}
                  >
                    <i className={`bi ${slide.mediaType === 'VIDEO' ? 'bi-camera-video' : 'bi-image'} me-1`}></i>
                    {slide.mediaType === 'VIDEO' ? t.admin.slideshowVideoType : t.admin.slideshowImageType}
                  </span>
                </div>

                {/* Controls */}
                <div className="p-3">
                  {/* Order */}
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <label className="small mb-0" style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {t.admin.slideshowOrder}:
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm rounded-pill text-center"
                      style={{
                        width: '64px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-card-bg)',
                        color: 'var(--color-text)',
                      }}
                      value={slide.sortOrder}
                      min={0}
                      onChange={(e) => handleOrderChange(slide, Number(e.target.value))}
                    />
                  </div>

                  {/* URL truncated */}
                  <div
                    className="small text-truncate mb-2"
                    style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}
                  >
                    {slide.url}
                  </div>

                  {/* Active toggle + Delete */}
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm flex-grow-1 rounded-pill"
                      style={{
                        fontSize: '0.78rem',
                        border: `1px solid ${slide.active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        color: slide.active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        backgroundColor: 'transparent',
                      }}
                      onClick={() => handleToggleActive(slide)}
                    >
                      <i className={`bi ${slide.active ? 'bi-eye' : 'bi-eye-slash'} me-1`}></i>
                      {slide.active ? t.admin.slideshowActive : t.admin.slideshowHidden}
                    </button>
                    <button
                      className="btn btn-sm rounded-pill"
                      style={{
                        fontSize: '0.78rem',
                        border: '1px solid #dc3545',
                        color: '#dc3545',
                        backgroundColor: 'transparent',
                      }}
                      onClick={() => handleDelete(slide.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
