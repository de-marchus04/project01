"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getNavigationConfig } from "@/shared/config/navigation";
import { useReminders } from "@/shared/hooks/useReminders";
import { createPortal } from "react-dom";
import { useLanguage } from "@/shared/i18n/LanguageContext";

export const Header = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const navConfig = getNavigationConfig(t);

  useReminders();

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem('yoga_db_version_6')) {
      localStorage.clear();
      localStorage.setItem('yoga_db_version_6', 'true');
    }

    const loadUserData = () => {
      const userJson = localStorage.getItem('yoga_user');
      if (userJson) {
        setIsAuth(true);
        try {
          const user = JSON.parse(userJson);

          const profileJson = localStorage.getItem(`profile_${user.username}`);
          if (profileJson) {
            const profile = JSON.parse(profileJson);
            setUsername(profile.name || user.username || "User");
            setUserPhoto(profile.photoUrl || "");
          } else {
            setUsername(user.username || "User");
            setUserPhoto("");
          }

          setIsAdmin(user.role === 'admin' || user.username === 'admin');
        } catch (e) {}
      } else {
        setIsAuth(false);
        setIsAdmin(false);
        setUsername("");
        setUserPhoto("");
      }
    };

    loadUserData();

    window.addEventListener('storage', loadUserData);
    return () => window.removeEventListener('storage', loadUserData);
  }, [pathname]);

  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      if (isMenuOpen) {
        mainContent.style.transform = 'translateX(320px)';
        document.body.style.overflow = 'hidden';
      } else {
        mainContent.style.transform = 'translateX(0)';
        setTimeout(() => {
          if (!isMenuOpen) document.body.style.overflow = 'auto';
        }, 400);
      }
    }
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('yoga_user');
    window.location.href = '/login';
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const sidebar = mounted ? createPortal(
    <nav
      className="custom-sidebar"
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '320px',
        height: '100vh',
        backgroundColor: 'var(--color-bg)',
        borderRight: '1px solid var(--color-border-light)',
        zIndex: 0,
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}
    >
      <div className="mb-5 mt-3 text-center">
        <Link
          href="/"
          className="text-decoration-none font-playfair fw-bold"
          style={{
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-primary)',
            fontSize: 'var(--text-3xl)'
          }}
          onClick={() => setIsMenuOpen(false)}
        >
          YOGA.LIFE
        </Link>
      </div>

      <ul className="nav flex-column gap-3 mb-auto" role="list">
        {navConfig.map((item, index) => {
          if (item.label === "Главная") return null;

          return (
            <li className="nav-item" key={index}>
              {item.children ? (
                <>
                  <div className="fw-bold small text-uppercase mb-2 mt-3" style={{ letterSpacing: 'var(--tracking-wide)', color: 'var(--color-primary)', fontSize: 'var(--text-xs)' }}>{item.label}</div>
                  <ul className="nav flex-column gap-2 ms-3 border-start ps-3" style={{ borderColor: 'var(--color-border-light) !important' }}>
                    {item.children.map((child, childIndex) => (
                      <li key={childIndex}>
                        <Link
                          href={child.href || "#"}
                          className={`text-decoration-none ${pathname === child.href ? 'fw-semibold' : ''}`}
                          style={{
                            color: pathname === child.href ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            transition: 'color var(--duration-fast) var(--ease-out)',
                            fontSize: 'var(--text-lg)'
                          }}
                          onClick={() => setIsMenuOpen(false)}
                          aria-current={pathname === child.href ? 'page' : undefined}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Link
                  href={item.href || "#"}
                  className={`text-decoration-none fw-medium ${pathname === item.href ? 'fw-bold' : ''}`}
                  style={{
                    color: pathname === item.href ? 'var(--color-primary)' : 'var(--color-text)',
                    transition: 'color var(--duration-fast) var(--ease-out)',
                    fontSize: 'var(--text-xl)'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 pt-4 border-top" style={{ borderColor: 'var(--color-border-light) !important' }}>
        {isAuth ? (
          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-center gap-3 mb-2">
              {userPhoto ? (
                <img src={userPhoto} alt={username} className="rounded-circle object-fit-cover" style={{ width: '50px', height: '50px', boxShadow: 'var(--shadow-sm)' }} />
              ) : (
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', backgroundColor: 'var(--color-primary-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <i className="bi bi-person fs-4" style={{ color: 'var(--color-primary)' }}></i>
                </div>
              )}
              <div>
                <div className="fw-bold" style={{ color: 'var(--color-text)' }}>{username}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{isAdmin ? t.header.admin : t.header.profile}</div>
              </div>
            </div>
            <Link href={isAdmin ? "/admin" : "/profile"} className="btn btn-primary-custom py-2 w-100" style={{ borderRadius: 'var(--radius-full)' }} onClick={() => setIsMenuOpen(false)}>
              {t.header.profile}
            </Link>
            <button onClick={handleLogout} className="btn btn-outline-danger py-2 w-100" style={{ borderRadius: 'var(--radius-full)' }}>
              {t.header.logout}
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            <p className="mb-0" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{t.header.loginPrompt}</p>
            <Link href="/login" className="btn btn-primary-custom py-2 w-100" style={{ borderRadius: 'var(--radius-full)' }} onClick={() => setIsMenuOpen(false)}>
              {t.header.login}
            </Link>
          </div>
        )}
      </div>
    </nav>,
    document.body
  ) : null;

  const overlay = mounted ? createPortal(
    <div
      onClick={() => setIsMenuOpen(false)}
      role="presentation"
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
        transition: 'opacity var(--duration-slow) var(--ease-out)'
      }}
    />,
    document.getElementById('main-content') || document.body
  ) : null;

  return (
    <>
      {sidebar}
      {overlay}
      <nav className="navbar fixed-top" role="banner" aria-label="Top navigation bar">
        <div className="container-fluid px-4 py-1">

          {/* Left Side: Hamburger + Door + Logo */}
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-link p-0 border-0 me-2"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-controls="main-sidebar"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              style={{ color: 'var(--color-text)' }}
            >
              <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-1`} aria-hidden="true"></i>
            </button>

            {isAuth ? (
              <button
                onClick={handleLogout}
                className="btn btn-link p-0 text-decoration-none"
                style={{ color: 'var(--color-text)' }}
                aria-label={t.header.logout}
              >
                <i className="bi bi-door-open fs-3" aria-hidden="true"></i>
              </button>
            ) : (
              <Link
                href="/login"
                className="text-decoration-none"
                style={{ color: 'var(--color-text)' }}
                aria-label={t.header.login}
              >
                <i className="bi bi-door-closed fs-3" aria-hidden="true"></i>
              </Link>
            )}

            <Link
              className="navbar-brand mb-0 font-playfair fw-bold ms-2"
              href="/"
              style={{
                letterSpacing: 'var(--tracking-tight)',
                fontSize: 'var(--text-2xl)',
                color: 'var(--color-primary)',
                opacity: isMenuOpen ? 0 : 1,
                transition: 'opacity var(--duration-normal) var(--ease-out)',
                pointerEvents: isMenuOpen ? 'none' : 'auto'
              }}
            >
              YOGA.LIFE
            </Link>
          </div>

          {/* Right Side: Language Selector */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center rounded-pill px-2 py-1" role="group" aria-label="Language selector" style={{ backgroundColor: 'var(--color-bg-card)', boxShadow: 'var(--shadow-xs)', border: '1px solid var(--color-border)' }}>
              <button
                className={`btn btn-sm border-0 fw-bold px-2 py-0 ${lang === 'ru' ? '' : ''}`}
                onClick={() => setLang('ru')}
                aria-label="Russian"
                aria-pressed={lang === 'ru'}
                style={{ fontSize: 'var(--text-xs)', color: lang === 'ru' ? 'var(--color-text)' : 'var(--color-text-muted)' }}
              >
                RU
              </button>
              <span className="opacity-25 mx-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>|</span>
              <button
                className={`btn btn-sm border-0 fw-bold px-2 py-0`}
                onClick={() => setLang('uk')}
                aria-label="Ukrainian"
                aria-pressed={lang === 'uk'}
                style={{ fontSize: 'var(--text-xs)', color: lang === 'uk' ? 'var(--color-text)' : 'var(--color-text-muted)' }}
              >
                UA
              </button>
              <span className="opacity-25 mx-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>|</span>
              <button
                className={`btn btn-sm border-0 fw-bold px-2 py-0`}
                onClick={() => setLang('en')}
                aria-label="English"
                aria-pressed={lang === 'en'}
                style={{ fontSize: 'var(--text-xs)', color: lang === 'en' ? 'var(--color-text)' : 'var(--color-text-muted)' }}
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
