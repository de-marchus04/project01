"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/shared/api/authApi";
import { resetPassword } from "@/shared/api/authActions";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { signIn } from "next-auth/react";

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

        // Save user to localStorage for old UI logic compatibility
        const isAdmin = username.trim().toLowerCase() === 'admin' || username.trim().toLowerCase() === 'dimich04';
        localStorage.setItem('yoga_user', JSON.stringify({ 
          username, 
          role: isAdmin ? 'admin' : 'user' 
        }));

        // We redirect blindly to profile, since role redirection usually happens in middleware for safety anyway, but let's check JS-side user if we want
        router.push(isAdmin ? '/admin' : '/profile');
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
        
        // Save user to localStorage for old UI logic compatibility
        const isAdmin = username.trim().toLowerCase() === 'admin' || username.trim().toLowerCase() === 'dimich04';
        localStorage.setItem('yoga_user', JSON.stringify({ 
          username, 
          role: isAdmin ? 'admin' : 'user' 
        }));

        // Wait briefly for session to settle
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/profile');
        }
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
                    {!isRegisterMode && (
                        <div className="mt-2 text-muted small">
                            <span className="me-1">Демо-админ:</span>
                            <span className="badge bg-light text-dark shadow-sm">admin</span> / <span className="badge bg-light text-dark shadow-sm">любой пароль (если еще не зарегистрирован)</span>
                        </div>
                    )}
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
