'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset } from '@/shared/api/authActions';
import { useTheme } from '@/shared/i18n/ThemeContext';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError('Недействительная ссылка. Запросите новую.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await confirmPasswordReset(token, password);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(res.error || 'Произошла ошибка. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  const cardBg = theme === 'dark' ? 'rgba(30, 27, 23, 0.97)' : 'rgba(255, 255, 255, 0.95)';

  return (
    <main>
      <section
        style={{
          minHeight: '100vh',
          paddingTop: '120px',
          paddingBottom: '50px',
          background:
            "url('https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop') center/cover",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div
                className="card shadow-lg overflow-hidden"
                style={{
                  background: cardBg,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(140, 154, 129, 0.2)',
                  borderRadius: '24px',
                }}
              >
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h2 className="font-playfair text-primary-custom">Новый пароль</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Придумайте новый пароль для входа</p>
                  </div>

                  {success ? (
                    <div className="alert alert-success text-center rounded-3">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Пароль успешно изменён! Перенаправление на страницу входа...
                    </div>
                  ) : (
                    <>
                      {error && (
                        <div className="alert alert-danger py-2 rounded-3 text-center" role="alert">
                          {error}
                        </div>
                      )}
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label
                            className="form-label fw-bold small text-uppercase"
                            style={{ letterSpacing: '1px', color: 'var(--color-text-muted)' }}
                          >
                            НОВЫЙ ПАРОЛЬ
                          </label>
                          <input
                            type="password"
                            className="form-control form-control-lg"
                            style={{
                              border: '1px solid var(--color-border)',
                              borderRadius: '12px',
                              backgroundColor: 'var(--color-surface)',
                              color: 'var(--color-text)',
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Минимум 6 символов"
                            required
                            disabled={loading || !token}
                          />
                        </div>
                        <div className="mb-4">
                          <label
                            className="form-label fw-bold small text-uppercase"
                            style={{ letterSpacing: '1px', color: 'var(--color-text-muted)' }}
                          >
                            ПОДТВЕРДИТЬ ПАРОЛЬ
                          </label>
                          <input
                            type="password"
                            className="form-control form-control-lg"
                            style={{
                              border: '1px solid var(--color-border)',
                              borderRadius: '12px',
                              backgroundColor: 'var(--color-surface)',
                              color: 'var(--color-text)',
                            }}
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="Повторите пароль"
                            required
                            disabled={loading || !token}
                          />
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary-custom w-100 py-3 rounded-pill fw-bold text-uppercase"
                          style={{ letterSpacing: '1px' }}
                          disabled={loading || !token}
                        >
                          {loading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Сохранение...
                            </>
                          ) : (
                            'Сохранить пароль'
                          )}
                        </button>
                      </form>
                    </>
                  )}

                  <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <a
                      href="/login"
                      className="btn btn-link text-decoration-none"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Вернуться ко входу
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordClient() {
  return (
    <Suspense
      fallback={
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
