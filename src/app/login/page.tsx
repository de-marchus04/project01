"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/shared/api/authApi";
import { resetPassword } from "@/shared/api/authActions";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { signIn, getSession } from "next-auth/react";

export default function Login() {
  const { t, tStr } = useLanguage();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Rate Limiting (Блокировка после 3 неверных попыток)
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  useEffect(() => {
    const savedAttempts = localStorage.getItem('yoga_login_attempts');
    if (savedAttempts) {
      const { count, lockTime } = JSON.parse(savedAttempts);
      if (lockTime && lockTime > Date.now()) {
        setLockUntil(lockTime);
      } else if (lockTime && lockTime <= Date.now()) {
        // Убираем блокировку, если время прошло
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
      const lockTime = Date.now() + 15 * 60 * 1000; // 15 минут
      setLockUntil(lockTime);
      localStorage.setItem('yoga_login_attempts', JSON.stringify({ count: newCount, lockTime }));
      setError("Слишком много попыток. Аккаунт временно заблокирован на 15 минут.");
    } else {
      localStorage.setItem('yoga_login_attempts', JSON.stringify({ count: newCount }));
      setError((t as any).auth ? (t as any).auth.wrongCredentials : 'Неверный логин или пароль');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockUntil && Date.now() < lockUntil) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isForgotPasswordMode) {
        const res = await resetPassword(username, password);
        if (res.success) {
          setError(null);
          alert("Пароль успешно изменён! Теперь вы можете войти.");
          setIsForgotPasswordMode(false);
          setPassword("");
        } else {
          setError(res.error || "Ошибка смены пароля");
        }
        return;
      }
      if (isRegisterMode) {
        // Registration via API Route
        await authApi.register(username, password);
        // Automatically login after register
        const res = await signIn('credentials', {
          redirect: false,
          username,
          password,
        });

        if (res?.error) {
          setError(res.error);
          return;
        }

        const session = await getSession();
        router.push((session?.user as any)?.role === 'ADMIN' ? '/admin' : '/profile');
      } else {
        // Login via NextAuth credentials provider
        const res = await signIn('credentials', {
          redirect: false,
          username,
          password
        });

        if (res?.error) {
          handleFailedAttempt();
          return;
        }

        // Reset attempts on successful login
        localStorage.removeItem('yoga_login_attempts');

        const loginSession = await getSession();
        router.push((loginSession?.user as any)?.role === 'ADMIN' ? '/admin' : '/profile');
      }
    } catch (err: any) {
      setError(err.message || ((t as any).auth ? (t as any).auth.errRegister : 'Аутентификация не удалась'));
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState("");

  // Update timer for lockout
  useEffect(() => {
    if (!lockUntil) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= lockUntil) {
        setLockUntil(null);
        localStorage.removeItem('yoga_login_attempts');
        setAttempts(0);
        setTimeLeft("");
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

  return (
    <main>
      <section className="py-5" style={{ minHeight: "100vh", paddingTop: "120px", paddingBottom: "50px", background: "url('https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop') center/cover", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(140, 154, 129, 0.2)', borderRadius: '24px' }}>
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h2 className="font-playfair text-primary-custom">
                      {isForgotPasswordMode ? 'Сброс пароля' : (isRegisterMode ? ((t as any).auth ? (t as any).auth.registerTitle : 'Регистрация') : ((t as any).auth ? (t as any).auth.loginTitle : 'Вход'))}
                    </h2>
                    <p className="text-muted">
                      {isForgotPasswordMode ? 'Придумайте новый пароль' : (isRegisterMode ? ((t as any).auth ? (t as any).auth.registerSubtitle : 'Добро пожаловать!') : ((t as any).auth ? (t as any).auth.loginSubtitle : 'С возвращением!'))}
                    </p>
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger py-2 rounded-3 text-center" role="alert">
                      {error}
                    </div>
                  )}

                  {lockUntil && Date.now() < lockUntil && (
                    <div className="alert alert-warning py-2 rounded-3 text-center" role="alert">
                      Заблокировано. Повторите через: {timeLeft}
                    </div>
                  )}

                  <form onSubmit={handleAuth}>
                    <div className="mb-3">
                      <label className="form-label text-muted small text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>
                        {(t as any).auth ? (t as any).auth.usernameLabel : 'Имя пользователя (Логин)'}
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-lg bg-light"
                        style={{ border: '1px solid rgba(140, 154, 129, 0.3)', borderRadius: '12px' }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin или your_name"
                        required
                        disabled={loading || (lockUntil !== null && Date.now() < lockUntil)}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label text-muted small text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>
                        {isForgotPasswordMode ? 'Новый пароль' : ((t as any).auth ? (t as any).auth.passwordLabel : 'Пароль')}
                      </label>
                      <input 
                        type="password" 
                        className="form-control form-control-lg bg-light"
                        style={{ border: '1px solid rgba(140, 154, 129, 0.3)', borderRadius: '12px' }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading || (lockUntil !== null && Date.now() < lockUntil)}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary-custom w-100 py-3 rounded-pill fw-bold text-uppercase"
                      style={{ letterSpacing: '1px' }}
                      disabled={loading || (lockUntil !== null && Date.now() < lockUntil)}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          {t.common ? t.common.loading : 'Загрузка...'}
                        </>
                      ) : (
                        isForgotPasswordMode ? 'Сохранить пароль' : (isRegisterMode ? ((t as any).auth ? (t as any).auth.btnRegister : 'Создать аккаунт') : ((t as any).auth ? (t as any).auth.btnLogin : 'Войти'))
                      )}
                    </button>
                  </form>

                  {!isForgotPasswordMode && !isRegisterMode && (
                    <div className="text-center mt-3">
                      <button type="button" className="btn btn-link text-muted small" onClick={() => {setIsForgotPasswordMode(true); setError(null);}}>
                        Забыли пароль?
                      </button>
                    </div>
                  )}

                  {!isForgotPasswordMode && (
                    <>
                      <div className="d-flex align-items-center my-4">
                        <hr className="flex-grow-1" />
                        <span className="px-3 text-muted small">или</span>
                        <hr className="flex-grow-1" />
                      </div>
                      <div className="d-flex flex-column gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary w-100 py-2 rounded-pill d-flex align-items-center justify-content-center gap-2"
                          onClick={() => signIn('google', { callbackUrl: '/profile' })}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                          Войти через Google
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary w-100 py-2 rounded-pill d-flex align-items-center justify-content-center gap-2"
                          onClick={() => signIn('github', { callbackUrl: '/profile' })}
                        >
                          <i className="bi bi-github fs-5"></i>
                          Войти через GitHub
                        </button>
                      </div>
                    </>
                  )}

                  <div className="text-center mt-4 pt-3 border-top">
                    <button 
                      className="btn btn-link text-decoration-none text-muted"
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
                      {isForgotPasswordMode ? 'Вернуться ко входу' : (isRegisterMode ? ((t as any).auth ? (t as any).auth.linkToLogin : 'Уже есть аккаунт? Войти') : ((t as any).auth ? (t as any).auth.linkToRegister : 'Нет аккаунта? Зарегистрироваться'))}
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
