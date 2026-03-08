'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f6f7f9' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Что-то пошло не так</h2>
            <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
              Произошла критическая ошибка. Попробуйте перезагрузить страницу.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.6rem 1.5rem',
                border: 'none',
                borderRadius: '50px',
                backgroundColor: '#7c3aed',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Перезагрузить
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
