'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { getNavigationConfig } from '@/shared/config/navigation';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { useTheme } from '@/shared/context/ThemeContext';
import { getMyProfile } from '@/shared/api/authActions';

export const Header = () => {
  const { data: session, status } = useSession();
  const isAuth = status === 'authenticated';
  const sessionUser = session?.user;
  const isAdmin = sessionUser?.role === 'ADMIN';

  const [freshProfile, setFreshProfile] = useState<{ name?: string | null; avatar?: string | null } | null>(null);
  const username = freshProfile?.name || sessionUser?.name || sessionUser?.username || '';
  const userPhoto = freshProfile?.avatar || sessionUser?.avatar || '';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navConfig = getNavigationConfig(t);

  // Fetch fresh profile from DB on mount and when profile_updated event fires
  // This bypasses the JWT cookie (which can't store large base64 avatars)
  useEffect(() => {
    if (isAuth && sessionUser?.username) {
      getMyProfile(sessionUser.username).then((p) => {
        if (p) setFreshProfile(p);
      });
    }
  }, [isAuth, sessionUser?.username]);

  useEffect(() => {
    const handler = () => {
      if (sessionUser?.username) {
        getMyProfile(sessionUser.username).then((p) => {
          if (p) setFreshProfile(p);
        });
      }
    };
    window.addEventListener('profile_updated', handler);
    return () => window.removeEventListener('profile_updated', handler);
  }, [sessionUser?.username]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      if (isMenuOpen) {
        const pushWidth = window.innerWidth <= 575 ? window.innerWidth : 320;
        mainContent.style.transform = `translateX(${pushWidth}px)`;
        document.body.style.overflow = 'hidden';
      } else {
        mainContent.style.transform = 'translateX(0)';
        setTimeout(() => {
          if (!isMenuOpen) document.body.style.overflow = 'auto';
        }, 450);
      }
    }
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const toggleMenu = () => {
    const overlay = document.createElement('div');
    overlay.className = 'lang-switch-overlay';
    document.body.appendChild(overlay);
    setTimeout(() => setIsMenuOpen((prev) => !prev), 410);
    overlay.addEventListener('animationend', () => overlay.remove(), { once: true });
  };

  const sidebar = mounted
    ? createPortal(
        <div
          className="custom-sidebar"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '340px',
            height: '100vh',
            backgroundColor: 'var(--color-bg)',
            borderRight: '1px solid var(--color-secondary)',
            zIndex: 0,
            padding: '1.75rem 1.75rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Logo */}
          <div className="mb-4 mt-2 text-center pb-3" style={{ borderBottom: '1px solid var(--color-secondary)' }}>
            <Link
              href="/"
              className="text-decoration-none font-playfair fw-bold"
              style={{ letterSpacing: '2px', color: 'var(--color-primary)', fontSize: '1.6rem' }}
              onClick={() => setIsMenuOpen(false)}
            >
              YOGA.LIFE
            </Link>
          </div>

          <ul className="nav flex-column mb-auto" style={{ gap: '0' }}>
            {navConfig.map((item, index) => {
              return (
                <li className="nav-item" key={index}>
                  {item.children ? (
                    <>
                      <div
                        className="fw-bold text-uppercase mt-4 mb-2"
                        style={{
                          letterSpacing: '1.5px',
                          color: 'var(--color-primary)',
                          fontSize: '0.82rem',
                        }}
                      >
                        {item.label}
                      </div>
                      <ul
                        className="nav flex-column ms-2 border-start ps-3"
                        style={{ borderColor: 'var(--color-secondary)', gap: '2px' }}
                      >
                        {item.children.map((child, childIndex) => (
                          <li key={childIndex}>
                            <Link
                              href={child.href || '#'}
                              className="text-decoration-none d-block py-2"
                              style={{
                                fontSize: '1rem',
                                lineHeight: '1.4',
                                color: pathname === child.href ? 'var(--color-primary)' : 'var(--color-text)',
                                transition: 'color 0.2s',
                                fontWeight: pathname === child.href ? '600' : '400',
                              }}
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {pathname === child.href && (
                                <span
                                  style={{
                                    display: 'inline-block',
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--color-primary)',
                                    marginRight: '8px',
                                    verticalAlign: 'middle',
                                    marginBottom: '2px',
                                  }}
                                />
                              )}
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className="text-decoration-none fw-semibold d-block py-2 mt-2"
                      style={{
                        fontSize: '1.15rem',
                        color: pathname === item.href ? 'var(--color-primary)' : 'var(--color-text)',
                        transition: 'color 0.2s',
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Profile / Auth block */}
          <div className="mt-4 pt-3 border-top" style={{ borderColor: 'var(--color-border)' }}>
            {isAuth ? (
              <div style={{ borderRadius: '16px', backgroundColor: 'rgba(140,154,129,0.08)', padding: '14px 16px' }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  {userPhoto && (userPhoto.startsWith('http') || userPhoto.startsWith('data:image')) ? (
                    <Image
                      width={48}
                      height={48}
                      src={userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=48'}
                      alt={username}
                      style={{ objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--color-primary)' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '48px',
                        height: '48px',
                        flexShrink: 0,
                        backgroundColor: 'var(--color-secondary)',
                        border: '2px solid var(--color-primary)',
                      }}
                    >
                      <i className="bi bi-person" style={{ color: 'var(--color-primary)', fontSize: '1.4rem' }}></i>
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-semibold text-truncate" style={{ color: 'var(--color-text)', fontSize: '1rem' }}>
                      {username}
                    </div>
                    <div style={{ color: 'var(--color-primary)', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                      {isAdmin ? t.header.admin : t.header.profile}
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Link
                    href={isAdmin ? '/admin' : '/profile'}
                    className="btn btn-primary-custom rounded-pill flex-grow-1 py-2"
                    style={{ fontSize: '0.95rem' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.header.profile}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn rounded-pill px-3 py-2"
                    style={{
                      fontSize: '0.95rem',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                  {t.header.loginPrompt}
                </p>
                <Link
                  href="/login"
                  className="btn btn-primary-custom rounded-pill py-2 w-100"
                  style={{ fontSize: '1rem' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.header.login}
                </Link>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  const overlay = mounted
    ? createPortal(
        <div
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 1040,
            opacity: isMenuOpen ? 1 : 0,
            pointerEvents: isMenuOpen ? 'auto' : 'none',
            transition: 'opacity 0.4s ease',
          }}
        />,
        document.getElementById('main-content') || document.body,
      )
    : null;

  return (
    <>
      {sidebar}
      {overlay}
      <nav
        className="navbar fixed-top"
        style={{
          background: theme === 'dark' ? 'rgba(30,27,23,0.97)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          transition: 'transform 0.4s ease, background 0.3s ease',
        }}
      >
        <div className="container-fluid px-4 py-1">
          {/* Left Side: Hamburger + Door + Logo */}
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-link p-0 border-0 me-2 menu-toggle-btn"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={isMenuOpen}
              style={{ outline: 'none', color: 'var(--color-text)' }}
            >
              <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-1`}></i>
            </button>

            {isAuth ? (
              <>
                <Link
                  href={isAdmin ? '/admin' : '/profile'}
                  className="text-decoration-none d-flex align-items-center gap-2"
                  style={{ minWidth: 0 }}
                  title={isAdmin ? t.header.admin : t.header.profile}
                >
                  {userPhoto && (userPhoto.startsWith('http') || userPhoto.startsWith('data:image')) ? (
                    <Image
                      width={34}
                      height={34}
                      src={userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=34'}
                      alt={username}
                      className="flex-shrink-0"
                      style={{ objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--color-primary)' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '34px',
                        height: '34px',
                        backgroundColor: 'var(--color-primary)',
                        border: '2px solid var(--color-primary)',
                      }}
                    >
                      <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, lineHeight: 1 }}>
                        {username ? username.charAt(0).toUpperCase() : <i className="bi bi-person" />}
                      </span>
                    </div>
                  )}
                  <span
                    className="d-none d-sm-block fw-medium text-truncate"
                    style={{ maxWidth: '110px', color: 'var(--color-text)', fontSize: '0.9rem' }}
                  >
                    {username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-link p-0 border-0"
                  aria-label={t.header?.logout || 'Выйти'}
                  style={{ color: 'var(--color-text-muted)', lineHeight: 1 }}
                  title={t.header?.logout || 'Выйти'}
                >
                  <i className="bi bi-door-open fs-4"></i>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="icon-pill-btn text-decoration-none d-flex align-items-center justify-content-center rounded-circle"
                style={{ fontSize: '1.2rem', lineHeight: 1, width: '38px', height: '38px', flexShrink: 0 }}
                title={t.header.login}
              >
                <i className="bi bi-door-closed"></i>
              </Link>
            )}

            <Link
              className="navbar-brand mb-0 font-playfair fw-bold fs-3 ms-2 logo-brand"
              href="/"
              style={{
                letterSpacing: '1px',
                opacity: isMenuOpen ? 0 : 1,
                transition: 'opacity 0.3s ease',
                pointerEvents: isMenuOpen ? 'none' : 'auto',
              }}
            >
              YOGA.LIFE
            </Link>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Link
              href="/search"
              className="icon-pill-btn rounded-circle d-flex align-items-center justify-content-center text-decoration-none"
              style={{ fontSize: '1.2rem', lineHeight: 1, width: '38px', height: '38px', flexShrink: 0 }}
              title="Поиск"
            >
              <i className="bi bi-search"></i>
            </Link>
            <button
              onClick={toggleTheme}
              className="icon-pill-btn rounded-circle d-flex align-items-center justify-content-center"
              aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
              style={{
                fontSize: '1.2rem',
                lineHeight: 1,
                width: '38px',
                height: '38px',
                flexShrink: 0,
                cursor: 'pointer',
              }}
              title={theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
            </button>
            <div
              className="d-flex align-items-center rounded-pill px-2 py-1 shadow-sm border"
              style={{ borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-surface)' }}
            >
              <button
                className="btn btn-sm border-0 fw-bold px-2 py-0"
                onClick={() => setLang('ru')}
                aria-label="Русский язык"
                aria-pressed={lang === 'ru'}
                style={{
                  fontSize: '0.85rem',
                  color: lang === 'ru' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
              >
                RU
              </button>
              <span
                className="opacity-50 mx-1"
                style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}
                aria-hidden="true"
              >
                |
              </span>
              <button
                className="btn btn-sm border-0 fw-bold px-2 py-0"
                onClick={() => setLang('uk')}
                aria-label="Українська мова"
                aria-pressed={lang === 'uk'}
                style={{
                  fontSize: '0.85rem',
                  color: lang === 'uk' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
              >
                UA
              </button>
              <span
                className="opacity-50 mx-1"
                style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}
                aria-hidden="true"
              >
                |
              </span>
              <button
                className="btn btn-sm border-0 fw-bold px-2 py-0"
                onClick={() => setLang('en')}
                aria-label="English language"
                aria-pressed={lang === 'en'}
                style={{
                  fontSize: '0.85rem',
                  color: lang === 'en' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
              >
                ENG
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
