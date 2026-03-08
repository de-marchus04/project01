"use client";

import Link from 'next/link';
import { useLanguage } from '@/shared/i18n/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ paddingTop: '80px' }}>
      <div className="text-center p-5">
        <h1 className="display-1 fw-bold font-playfair" style={{ color: 'var(--color-primary)' }}>404</h1>
        <h2 className="font-playfair fw-bold mb-3">{t.notFoundPage.title}</h2>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {t.notFoundPage.description}
        </p>
        <Link href="/" className="btn btn-primary-custom rounded-pill px-4 py-2">
          {t.notFoundPage.backHome}
        </Link>
      </div>
    </div>
  );
}
