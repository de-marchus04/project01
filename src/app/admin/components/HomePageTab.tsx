'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { getHomeContent, updateHomeContent } from '@/shared/api/homeContentApi';
import { uploadImageToCloud } from '@/shared/api/uploadApi';

type Props = { showToast: (msg: string, type?: 'success' | 'error') => void };

const COURSE_CARDS = [
  { key: 'course_card_1_image', label: 'Для начинающих', href: '/courses-beginners' },
  { key: 'course_card_2_image', label: 'Медитация', href: '/courses-meditation' },
  { key: 'course_card_3_image', label: 'Здоровая спина', href: '/courses-back' },
  { key: 'course_card_4_image', label: 'Женское здоровье', href: '/courses-women' },
] as const;

const PLATFORM_CARDS = [
  { key: 'platform_card_1_image', label: 'Курсы', href: '/courses' },
  { key: 'platform_card_2_image', label: 'Консультации', href: '/consultations' },
  { key: 'platform_card_3_image', label: 'Туры', href: '/tours' },
  { key: 'platform_card_4_image', label: 'Блог', href: '/blog' },
] as const;

export default function HomePageTab({ showToast }: Props) {
  const { t } = useLanguage();
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingKeyRef = useRef<string | null>(null);

  useEffect(() => {
    getHomeContent()
      .then(setContent)
      .catch(() => showToast('Ошибка загрузки данных', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpload = (key: string) => {
    pendingKeyRef.current = key;
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = pendingKeyRef.current;
    if (!file || !key) return;
    e.target.value = '';

    setUploadingKey(key);
    try {
      const dataUrl = await resizeImage(file, 800);
      const cloudUrl = await uploadImageToCloud(dataUrl);
      const updated = { ...content, [key]: cloudUrl };
      setContent(updated);
      const res = await updateHomeContent({ [key]: cloudUrl });
      if (res.success) {
        showToast('Изображение сохранено');
      } else {
        showToast(res.error || 'Ошибка', 'error');
      }
    } catch {
      showToast('Ошибка загрузки', 'error');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleRemoveImage = async (key: string) => {
    const updated = { ...content, [key]: '' };
    setContent(updated);
    const res = await updateHomeContent({ [key]: '' });
    if (res.success) showToast('Изображение удалено');
    else showToast(res.error || 'Ошибка', 'error');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" className="d-none" onChange={onFileChange} />

      <h4 className="fw-bold mb-4" style={{ color: 'var(--color-text)' }}>
        <i className="bi bi-house-door me-2"></i>
        Главная страница
      </h4>

      {/* Hero Section Info */}
      <SectionCard
        icon="bi-image"
        title="Герой (Hero)"
        description="Фоновое изображение героя управляется через вкладку «Слайд-шоу» (страница «home»)."
      >
        <div
          className="d-flex align-items-center gap-2 p-3 rounded-3"
          style={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}
        >
          <i className="bi bi-info-circle" style={{ color: 'var(--color-primary)' }}></i>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Перейдите во вкладку <strong>Слайд-шоу</strong> → выберите страницу <strong>«Главная»</strong> для
            управления фоном.
          </span>
        </div>
      </SectionCard>

      {/* Popular Courses Section */}
      <SectionCard
        icon="bi-grid"
        title="Популярные направления"
        description="Изображения для 4 карточек курсов на главной странице."
      >
        <div className="row g-3">
          {COURSE_CARDS.map((card) => (
            <div key={card.key} className="col-md-6 col-lg-3">
              <ImageCard
                label={card.label}
                imageUrl={content[card.key]}
                uploading={uploadingKey === card.key}
                onUpload={() => handleImageUpload(card.key)}
                onRemove={() => handleRemoveImage(card.key)}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Platform Sections */}
      <SectionCard
        icon="bi-columns-gap"
        title="Разделы платформы"
        description="Изображения для 4 карточек навигации (Курсы, Консультации, Туры, Блог)."
      >
        <div className="row g-3">
          {PLATFORM_CARDS.map((card) => (
            <div key={card.key} className="col-md-6 col-lg-3">
              <ImageCard
                label={card.label}
                imageUrl={content[card.key]}
                uploading={uploadingKey === card.key}
                onUpload={() => handleImageUpload(card.key)}
                onRemove={() => handleRemoveImage(card.key)}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Other sections info */}
      <SectionCard
        icon="bi-puzzle"
        title="Другие секции"
        description="Эти секции управляются через соответствующие вкладки."
      >
        <div className="row g-2">
          {[
            { icon: 'bi-star', label: 'Отзывы', tab: 'Отзывы' },
            { icon: 'bi-question-circle', label: 'FAQ', tab: 'FAQ' },
            { icon: 'bi-geo-alt', label: 'Туры', tab: 'Туры' },
            { icon: 'bi-envelope', label: 'Рассылка', tab: '(автоматическая)' },
            { icon: 'bi-lightning', label: 'Преимущества', tab: '(i18n тексты)' },
          ].map((item) => (
            <div key={item.label} className="col-md-6 col-lg-4">
              <div
                className="d-flex align-items-center gap-2 p-2 rounded-3"
                style={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}
              >
                <i className={item.icon} style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}></i>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{item.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>→ {item.tab}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ---- helper components ---- */

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ backgroundColor: 'var(--color-card-bg)' }}>
      <div className="card-body p-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <i className={icon} style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}></i>
          <h5 className="fw-bold mb-0" style={{ color: 'var(--color-text)', fontSize: '1rem' }}>
            {title}
          </h5>
        </div>
        <p className="mb-3" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {description}
        </p>
        {children}
      </div>
    </div>
  );
}

function ImageCard({
  label,
  imageUrl,
  uploading,
  onUpload,
  onRemove,
}: {
  label: string;
  imageUrl?: string;
  uploading: boolean;
  onUpload: () => void;
  onRemove: () => void;
}) {
  const hasImage = imageUrl && imageUrl.length > 0;

  return (
    <div
      className="rounded-3 overflow-hidden"
      style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-secondary)' }}
    >
      <div className="position-relative" style={{ height: '160px', backgroundColor: '#eee' }}>
        {hasImage ? (
          <Image src={imageUrl} alt={label} fill style={{ objectFit: 'cover' }} sizes="300px" />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100">
            <i className="bi bi-image" style={{ fontSize: '2rem', color: 'var(--color-text-muted)', opacity: 0.3 }}></i>
          </div>
        )}
        {uploading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="spinner-border spinner-border-sm text-white"></div>
          </div>
        )}
      </div>
      <div className="p-2">
        <div className="fw-bold mb-2" style={{ fontSize: '0.8rem', color: 'var(--color-text)' }}>
          {label}
        </div>
        <div className="d-flex gap-1">
          <button
            className="btn btn-sm flex-grow-1"
            onClick={onUpload}
            disabled={uploading}
            style={{
              fontSize: '0.7rem',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              borderRadius: '8px',
            }}
          >
            <i className="bi bi-upload me-1"></i>
            {hasImage ? 'Заменить' : 'Загрузить'}
          </button>
          {hasImage && (
            <button
              className="btn btn-sm"
              onClick={onRemove}
              disabled={uploading}
              style={{
                fontSize: '0.7rem',
                backgroundColor: 'transparent',
                color: '#dc3545',
                border: '1px solid #dc3545',
                borderRadius: '8px',
              }}
            >
              <i className="bi bi-trash"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- utils ---- */

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxSize) {
            h *= maxSize / w;
            w = maxSize;
          }
        } else {
          if (h > maxSize) {
            w *= maxSize / h;
            h = maxSize;
          }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
