import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ paddingTop: '80px' }}>
      <div className="text-center p-5">
        <h1 className="display-1 fw-bold font-playfair" style={{ color: 'var(--color-primary)' }}>404</h1>
        <h2 className="font-playfair fw-bold mb-3">Страница не найдена</h2>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          К сожалению, запрашиваемая страница не существует.
        </p>
        <Link href="/" className="btn btn-primary-custom rounded-pill px-4 py-2">
          На главную
        </Link>
      </div>
    </div>
  );
}
