"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { getNavigationConfig } from "@/shared/config/navigation";
import { useReminders } from "@/shared/hooks/useReminders";
import { createPortal } from "react-dom";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useTheme } from "@/shared/i18n/ThemeContext";

export const Header = () => {
  const { data: session, status } = useSession();
  const isAuth = status === "authenticated";
  const sessionUser = session?.user as any;
  const isAdmin = sessionUser?.role === "ADMIN";
  const username = sessionUser?.name || sessionUser?.username || "";
  const userPhoto = sessionUser?.avatar || "";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navConfig = getNavigationConfig(t);

  useReminders();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      // CSS handles the transition via #main-content rule in style.css
      if (isMenuOpen) {
        mainContent.style.transform = 'translateX(320px)';
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
    setTimeout(() => setIsMenuOpen(prev => !prev), 410);
    overlay.addEventListener('animationend', () => overlay.remove(), { once: true });
  };

  const sidebar = mounted ? createPortal(
    <div 
      className="custom-sidebar" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '320px',
        height: '100vh',
        backgroundColor: 'var(--color-bg)',
        borderRight: '1px solid var(--color-secondary)',
        zIndex: 0, // Behind main-content
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="mb-5 mt-3 text-center">
        <Link 
          href="/" 
          className="text-decoration-none font-playfair fw-bold fs-2"
          style={{ 
            letterSpacing: '1px', 
            color: 'var(--color-primary)'
          }}
          onClick={() => setIsMenuOpen(false)}
        >
          YOGA.LIFE
        </Link>
      </div>
      
      <ul className="nav flex-column gap-1 mb-auto">
        {navConfig.map((item, index) => {
          if (item.label === "Главная") return null;
          
          return (
            <li className="nav-item" key={index}>
              {item.children ? (
                <>
                  <div className="fw-bold small text-uppercase mt-3 mb-1" style={{ letterSpacing: '1px', color: 'var(--color-primary)' }}>{item.label}</div>
                  <ul className="nav flex-column gap-0 ms-3 border-start ps-3" style={{ borderColor: 'var(--color-secondary)' }}>
                    {item.children.map((child, childIndex) => (
                      <li key={childIndex}>
                        <Link 
                          href={child.href || "#"} 
                          className="text-decoration-none fs-6 d-block py-1"
                          style={{ 
                            color: pathname === child.href ? 'var(--color-primary)' : 'var(--color-text)',
                            transition: 'color 0.2s' 
                          }}
                          onClick={() => setIsMenuOpen(false)}
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
                  className="text-decoration-none fs-5 fw-medium d-block py-1"
                  style={{ 
                    color: pathname === item.href ? 'var(--color-primary)' : 'var(--color-text)',
                    transition: 'color 0.2s'
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

      <div className="mt-5 pt-4 border-top" style={{ borderColor: 'var(--color-secondary)' }}>
        {isAuth ? (
          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-center gap-3 mb-2">
              {userPhoto && (userPhoto.startsWith('http') || userPhoto.startsWith('data:image')) ? (
                <img src={userPhoto} alt={username} className="rounded-circle object-fit-cover shadow-sm" style={{ width: '50px', height: '50px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm border" style={{ width: '50px', height: '50px', flexShrink: 0, backgroundColor: 'var(--color-surface)' }}>
                  <i className="bi bi-person fs-4" style={{ color: 'var(--color-primary)' }}></i>
                </div>
              )}
              <div>
                <div className="fw-bold" style={{ color: 'var(--color-text)' }}>{username}</div>
                <div className="small" style={{ color: 'var(--color-text-muted)' }}>{isAdmin ? t.header.admin : t.header.profile}</div>
              </div>
            </div>
            <Link href={isAdmin ? "/admin" : "/profile"} className="btn btn-primary-custom rounded-pill py-2 w-100" onClick={() => setIsMenuOpen(false)}>
              {t.header.profile}
            </Link>
            <button onClick={handleLogout} className="btn btn-outline-danger rounded-pill py-2 w-100">
              {t.header.logout}
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>{t.header.loginPrompt}</p>
            <Link href="/login" className="btn btn-primary-custom rounded-pill py-2 w-100" onClick={() => setIsMenuOpen(false)}>
              {t.header.login}
            </Link>
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  const overlay = mounted ? createPortal(
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
        transition: 'opacity 0.4s ease'
      }}
    />,
    document.getElementById('main-content') || document.body
  ) : null;

  return (
    <>
      {sidebar}
      {overlay}
      <nav className="navbar fixed-top" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'transform 0.4s ease' }}>
        <div className="container-fluid px-4 py-1">
          
          {/* Left Side: Hamburger + Door + Logo */}
          <div className="d-flex align-items-center gap-3">
            <button 
              className="btn btn-link p-0 border-0 me-2 menu-toggle-btn" 
              onClick={toggleMenu}
              style={{ outline: 'none', color: 'var(--color-text)' }}
            >
              <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-1`}></i>
            </button>

            {isAuth ? (
              <button 
                onClick={handleLogout}
                className="btn btn-link p-0 text-decoration-none"
                style={{ color: 'var(--color-text)' }}
                title={t.header.logout}
              >
                <i className="bi bi-door-open fs-3"></i>
              </button>
            ) : (
              <Link 
                href="/login" 
                className="text-decoration-none"
                style={{ color: 'var(--color-text)' }}
                title={t.header.login}
              >
                <i className="bi bi-door-closed fs-3"></i>
              </Link>
            )}
            
            <Link 
              className="navbar-brand mb-0 font-playfair fw-bold fs-3 ms-2" 
              href="/" 
              style={{ 
                letterSpacing: '1px', 
                color: 'var(--color-primary)',
                opacity: isMenuOpen ? 0 : 1,
                transition: 'opacity 0.3s ease',
                pointerEvents: isMenuOpen ? 'none' : 'auto'
              }}
            >
              YOGA.LIFE
            </Link>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={toggleTheme}
              className="btn btn-link p-0 border-0"
              style={{ color: 'var(--color-text)', outline: 'none' }}
              title={theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon'} fs-4`}></i>
            </button>
            <div className="d-flex align-items-center rounded-pill px-2 py-1 shadow-sm border" style={{ borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-surface)' }}>
              <button 
                className={`btn btn-sm border-0 fw-bold px-2 py-0 ${lang === 'ru' ? 'text-dark' : 'text-muted'}`} 
                onClick={() => setLang('ru')}
                style={{ fontSize: '0.85rem' }}
              >
                RU
              </button>
              <span className="text-muted opacity-50 mx-1" style={{ fontSize: '0.85rem' }}>|</span>
              <button 
                className={`btn btn-sm border-0 fw-bold px-2 py-0 ${lang === 'uk' ? 'text-dark' : 'text-muted'}`} 
                onClick={() => setLang('uk')}
                style={{ fontSize: '0.85rem' }}
              >
                UA
              </button>
              <span className="text-muted opacity-50 mx-1" style={{ fontSize: '0.85rem' }}>|</span>
              <button 
                className={`btn btn-sm border-0 fw-bold px-2 py-0 ${lang === 'en' ? 'text-dark' : 'text-muted'}`} 
                onClick={() => setLang('en')}
                style={{ fontSize: '0.85rem' }}
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
