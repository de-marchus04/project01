'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { uploadImageToCloud, getCloudImages, deleteCloudImage } from '@/shared/api/uploadApi';
import type { CloudImage } from '@/shared/api/uploadApi';
import { modalService } from '@/shared/ui/Modal/modalService';

type Props = { showToast: (msg: string, type?: 'success' | 'error') => void };

export default function MediaTab({ showToast }: Props) {
  const { t } = useLanguage();
  const [cloudImages, setCloudImages] = useState<CloudImage[]>([]);
  const [mediaUploading, setMediaUploading] = useState(false);

  useEffect(() => {
    getCloudImages()
      .then(setCloudImages)
      .catch(() => {});
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const img = new window.Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX = 1200;
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          await uploadImageToCloud(dataUrl);
          setCloudImages(await getCloudImages());
          showToast(t.admin.itemSaved, 'success');
          setMediaUploading(false);
        };
        img.src = reader.result as string;
      } catch {
        showToast(t.admin.errSave, 'error');
        setMediaUploading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--color-text)' }}>
          {t.admin.mediaTitle}
        </h3>
        <label
          className="btn btn-sm px-3 rounded-pill"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          <i className="bi bi-cloud-upload me-2"></i>
          {mediaUploading ? t.admin.mediaUploading : t.admin.mediaUpload}
          <input type="file" accept="image/*" className="d-none" disabled={mediaUploading} onChange={handleUpload} />
        </label>
      </div>

      {cloudImages.length === 0 ? (
        <div className="text-center py-5" style={{ color: 'var(--color-text-muted)' }}>
          <i className="bi bi-images" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
          <p className="mt-3">{t.admin.mediaNoImages}</p>
        </div>
      ) : (
        <div className="row g-3">
          {cloudImages.map((img) => (
            <div key={img.public_id} className="col-6 col-md-4 col-lg-3">
              <div
                className="card border-0 h-100"
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ position: 'relative', paddingTop: '75%', backgroundColor: 'var(--color-secondary)' }}>
                  <img
                    src={img.secure_url}
                    alt=""
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="p-2">
                  <div
                    className="small text-truncate mb-1"
                    style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}
                  >
                    {img.width}x{img.height} &middot; {img.format.toUpperCase()} &middot;{' '}
                    {(img.bytes / 1024).toFixed(0)}KB
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm flex-grow-1 rounded-pill"
                      style={{
                        fontSize: '0.75rem',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(img.secure_url);
                        showToast(t.admin.mediaCopied, 'success');
                      }}
                    >
                      <i className="bi bi-clipboard me-1"></i>
                      {t.admin.mediaCopyUrl}
                    </button>
                    <button
                      className="btn btn-sm rounded-pill"
                      style={{ fontSize: '0.75rem', border: '1px solid #dc3545', color: '#dc3545' }}
                      onClick={async () => {
                        if (!(await modalService.confirm('', t.admin.mediaConfirmDel))) return;
                        await deleteCloudImage(img.public_id);
                        setCloudImages(await getCloudImages());
                      }}
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
