'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/shared/api/authApi';
import { requestPasswordReset } from '@/shared/api/authActions';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { useTheme } from '@/shared/context/ThemeContext';
import { signIn, getSession } from 'next-auth/react';
import { modalService } from '@/shared/ui/Modal/modalService';

export default function Login() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [timeLeft, setTimeLeft] = useState('');

  // Show error from NextAuth redirect (e.g. OAuth failure)
  useEffect(() => {
    const authError = searchParams.get('error');
    if (authError) {
      setError(t.login.errGeneric);
    }
  }, [searchParams, t.login.errGeneric]);

  // Rate Limiting (lock after 3 wrong attempts)
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  useEffect(() => {
    const savedAttempts = localStorage.getItem('yoga_login_attempts');
    if (savedAttempts) {
      const { count, lockTime } = JSON.parse(savedAttempts);
      if (lockTime && lockTime > Date.now()) {
        setLockUntil(lockTime);
      } else if (lockTime && lockTime <= Date.now()) {
        localStorage.removeItem('yoga_login_attempts');
        setAttempts(0);
        setLockUntil(null);
      } else {
        setAttempts(count);
      }
    }
  }, []);

  const handleFailedAttempt = () => {
    const newCount = attempts + 1;
    setAttempts(newCount);

    if (newCount >= 3) {
      const lockTime = Date.now() + 15 * 60 * 1000;
      setLockUntil(lockTime);
      localStorage.setItem('yoga_login_attempts', JSON.stringify({ count: newCount, lockTime }));
      setError(t.login.errLockoutMsg);
    } else {
      localStorage.setItem('yoga_login_attempts', JSON.stringify({ count: newCount }));
      setError(`${t.login.errInvalidLogin}. ${t.login.errAttemptsLeft} ${3 - newCount}`);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockUntil && Date.now() < lockUntil) return;

    setError(null);
    setLoading(true);

    try {
      if (isForgotPasswordMode) {
        const res = await requestPasswordReset(forgotEmail);
        if (res.success) {
          setError(null);
          await modalService.alert('', t.login.forgotSuccess);
          setIsForgotPasswordMode(false);
          setForgotEmail('');
        } else {
          setError(res.error || t.login.forgotError);
        }
        return;
      }

      if (isRegisterMode) {
        await authApi.register(username, password);
        const res = await signIn('credentials', { redirect: false, username, password });
        if (res?.error) {
          setError(res.error);
          return;
        }
        const session = await getSession();
        router.push(session?.user?.role === 'ADMIN' ? '/admin' : '/profile');
      } else {
        const res = await signIn('credentials', { redirect: false, username, password });
        if (res?.error) {
          handleFailedAttempt();
          return;
        }
        localStorage.removeItem('yoga_login_attempts');
        const loginSession = await getSession();
        router.push((loginSession?.user as any)?.role === 'ADMIN' ? '/admin' : '/profile');
      }
    } catch (err: any) {
      setError(err.message || t.login.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!lockUntil) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= lockUntil) {
        setLockUntil(null);
        localStorage.removeItem('yoga_login_attempts');
        setAttempts(0);
        setTimeLeft('');
        clearInterval(interval);
      } else {
        const diff = lockUntil - now;
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockUntil]);

  const getTitle = () => {
    if (isForgotPasswordMode) return t.login.forgotTitle;
    return isRegisterMode ? t.login.regTitle : t.login.loginTitle;
  };

  const getSubtitle = () => {
    if (isForgotPasswordMode) return t.login.forgotSubtitle;
    return isRegisterMode ? t.login.regSubtitle : t.login.loginSubtitle;
  };

  const cardBg = theme === 'dark' ? 'rgba(30, 27, 23, 0.97)' : 'rgba(255, 255, 255, 0.95)';
  const isLocked = lockUntil !== null && Date.now() < lockUntil;

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
                    <h2 className="font-playfair text-primary-custom">{getTitle()}</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>{getSubtitle()}</p>
                  </div>

                  {error && (
                    <div className="alert alert-danger py-2 rounded-3 text-center" role="alert">
                      {error}
                    </div>
                  )}

                  {isLocked && (
                    <div className="alert alert-warning py-2 rounded-3 text-center" role="alert">
                      {t.login.accountLock}. {t.login.unlockIn}: {timeLeft}
                    </div>
                  )}

                  <form onSubmit={handleAuth}>
                    {isForgotPasswordMode ? (
                      <div className="mb-4">
                        <label
                          className="form-label fw-bold small text-uppercase"
                          style={{ letterSpacing: '1px', color: 'var(--color-text-muted)' }}
                        >
                          {t.login.forgotEmailLabel}
                        </label>
                        <input
                          type="email"
                          className="form-control form-control-lg"
                          style={{
                            border: '1px solid var(--color-border)',
                            borderRadius: '12px',
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-text)',
                          }}
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          disabled={loading}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="mb-3">
                          <label
                            className="form-label fw-bold small text-uppercase"
                            style={{ letterSpacing: '1px', color: 'var(--color-text-muted)' }}
                          >
                            {t.login.usernameLabel}
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            style={{
                              border: '1px solid var(--color-border)',
                              borderRadius: '12px',
                              backgroundColor: 'var(--color-surface)',
                              color: 'var(--color-text)',
                            }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t.login.usernamePlaceholder}
                            required
                            disabled={loading || isLocked}
                          />
                        </div>

                        <div className="mb-4">
                          <label
                            className="form-label fw-bold small text-uppercase"
                            style={{ letterSpacing: '1px', color: 'var(--color-text-muted)' }}
                          >
                            {t.login.passwordLabel}
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
                            placeholder={t.login.passwordPlaceholder}
                            required
                            disabled={loading || isLocked}
                          />
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      className="btn btn-primary-custom w-100 py-3 rounded-pill fw-bold text-uppercase"
                      style={{ letterSpacing: '1px' }}
                      disabled={loading || isLocked}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          {t.common.loading}
                        </>
                      ) : isForgotPasswordMode ? (
                        t.login.forgotBtn
                      ) : isRegisterMode ? (
                        t.login.regBtn
                      ) : (
                        t.login.loginBtn
                      )}
                    </button>
                  </form>

                  {!isForgotPasswordMode && !isRegisterMode && (
                    <div className="text-center mt-3">
                      <button
                        type="button"
                        className="btn btn-link small"
                        style={{ color: 'var(--color-text-muted)' }}
                        onClick={() => {
                          setIsForgotPasswordMode(true);
                          setError(null);
                        }}
                      >
                        {t.login.forgotPass}
                      </button>
                    </div>
                  )}

                  <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <button
                      className="btn btn-link text-decoration-none"
                      style={{ color: 'var(--color-text-muted)' }}
                      onClick={() => {
                        if (isForgotPasswordMode) {
                          setIsForgotPasswordMode(false);
                        } else {
                          setIsRegisterMode(!isRegisterMode);
                        }
                        setError(null);
                        setAttempts(0);
                      }}
                      disabled={loading}
                    >
                      {isForgotPasswordMode
                        ? t.login.backToLogin
                        : isRegisterMode
                          ? `${t.login.alreadyHaveAccount} ${t.login.loginNow}`
                          : `${t.login.noAccount} ${t.login.createNow}`}
                    </button>
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
