"use client";

import { useLanguage } from '@/shared/i18n/LanguageContext';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ paddingTop: '80px' }}>
      <div className="text-center p-5">
        <div className="mb-4" style={{ fontSize: '4rem' }}>
          <i className="bi bi-exclamation-triangle" style={{ color: 'var(--color-accent)' }}></i>
        </div>
        <h2 className="font-playfair fw-bold mb-3">{t.errorPage.title}</h2>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {error.message || t.errorPage.defaultMessage}
        </p>
        <button onClick={reset} className="btn btn-primary-custom rounded-pill px-4 py-2">
          {t.errorPage.retry}
        </button>
      </div>
    </div>
  );
}
