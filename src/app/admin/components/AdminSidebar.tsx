"use client";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { formatPrice } from "@/shared/lib/formatPrice";

type Stats = {
  earnedTotal: number;
  newRequests: number;
  popularService: string;
};

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  stats: Stats;
  isProfileSaved: boolean;
  isProfileEdited: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
};

export default function AdminSidebar({
  activeTab, onTabChange, stats,
  isProfileSaved, isProfileEdited,
  sidebarOpen, setSidebarOpen, onLogout,
}: Props) {
  const { lang, t } = useLanguage();

  const TABS: [string, string, string][] = [
    ['coursesPane',      t.admin.tabCourses,      'bi-book'],
    ['consultationsPane', t.admin.tabConsult,      'bi-person-circle'],
    ['articlesPane',     t.admin.tabBlog,          'bi-newspaper'],
    ['videosPane',       t.admin.tabVideos,        'bi-play-circle'],
    ['podcastsPane',     t.admin.tabPodcasts,      'bi-mic'],
    ['recipesPane',      t.admin.tabRecipes,       'bi-egg-fried'],
    ['toursPane',        t.admin.tabTours,         'bi-geo-alt'],
    ['ordersPane',       t.admin.tabOrders,        'bi-clipboard-check'],
    ['supportPane',      t.admin.tabSupport,       'bi-chat-dots'],
    ['subscribersPane',  t.admin.tabSubscribers,   'bi-envelope'],
    ['promoPane',        t.admin.tabPromo,         'bi-tag'],
    ['mediaPane',        t.admin.tabMedia,         'bi-images'],
    ['faqsPane',         t.admin.tabFaq,           'bi-question-circle'],
    ['testimonialsPane', t.admin.tabTestimonials,  'bi-star'],
    ['teamPane',         t.admin.tabTeam,          'bi-people'],
    ['settingsPane',     t.admin.tabSettings,      'bi-gear'],
    ['profilePane',      t.admin.tabProfile,       'bi-person-gear'],
  ];

  return (
    <>
      {/* SIDEBAR TOGGLE */}
      <button
        className="admin-sidebar-toggle d-flex align-items-center justify-content-center"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? 'Скрыть меню' : 'Показать меню'}
        style={{
          position: 'fixed', top: '94px', left: sidebarOpen ? '276px' : '14px',
          zIndex: 1040, width: '42px', height: '42px', borderRadius: '50%',
          border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card-bg)',
          color: 'var(--color-text)', cursor: 'pointer', transition: 'left 0.3s ease',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }}
      >
        <i className={`bi ${sidebarOpen ? 'bi-chevron-left' : 'bi-list'}`} style={{ fontSize: '1.15rem' }}></i>
      </button>

      {/* LEFT SIDEBAR */}
      <div style={{
        width: sidebarOpen ? '280px' : '0px', minWidth: sidebarOpen ? '280px' : '0px',
        overflow: 'hidden', transition: 'width 0.3s ease, min-width 0.3s ease',
        opacity: sidebarOpen ? 1 : 0, flexShrink: 0,
      }}>
        <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{
          top: '90px', backgroundColor: 'var(--color-card-bg)',
          padding: '1.25rem 1rem', overflow: 'hidden',
        }}>
          {/* Logo */}
          <div className="d-flex align-items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="d-flex align-items-center justify-content-center" style={{
              width: '36px', height: '36px', borderRadius: '10px',
              backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 700, fontSize: '0.85rem',
            }}>YL</div>
            <div>
              <div className="font-playfair fw-bold" style={{ fontSize: '1rem', color: 'var(--color-text)', lineHeight: 1.2 }}>YOGA.LIFE</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>admin panel</div>
            </div>
          </div>

          {/* Status badge */}
          <div className="mb-3">
            <span className="d-block text-center py-2 rounded-3" style={{
              fontSize: '0.8rem', fontWeight: 600,
              backgroundColor: isProfileSaved ? 'rgba(25,135,84,0.1)' : (isProfileEdited ? 'rgba(255,193,7,0.15)' : 'var(--color-secondary)'),
              color: isProfileSaved ? '#198754' : (isProfileEdited ? '#997404' : 'var(--color-text-muted)'),
              border: `1px solid ${isProfileSaved ? 'rgba(25,135,84,0.2)' : (isProfileEdited ? 'rgba(255,193,7,0.3)' : 'var(--color-border)')}`,
            }}>
              {isProfileSaved ? <><i className="bi bi-check2-circle me-1"></i>{t.admin.badgeSaved}</> : t.admin.titleAdmin}
            </span>
          </div>

          {/* Bento stats */}
          <div className="row g-2 mb-3">
            <div className="col-6">
              <div className="rounded-3 p-2 text-center" style={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
                <div className="fw-bold" style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>{formatPrice(stats.earnedTotal, lang)}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.admin.statEarnedFull}</div>
              </div>
            </div>
            <div className="col-6">
              <div className="rounded-3 p-2 text-center" style={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
                <div className="fw-bold" style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>{stats.newRequests}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.admin.statNewReqFull}</div>
              </div>
            </div>
            <div className="col-12">
              <div className="rounded-3 p-2 text-center" style={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
                <div className="fw-bold text-truncate" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>{stats.popularService}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.admin.statPopService}</div>
              </div>
            </div>
          </div>

          {/* Section label */}
          <div className="mb-2" style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, paddingLeft: '12px' }}>
            {t.admin.tabCourses ? 'Управление' : 'Management'}
          </div>

          {/* Nav items */}
          <nav className="d-flex flex-column gap-1">
            {TABS.map(([pane, label, icon]) => (
              <div
                key={pane}
                className="admin-nav-item"
                onClick={() => onTabChange(pane)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '10px', cursor: 'pointer',
                  fontSize: '0.88rem', transition: 'all 0.2s ease', userSelect: 'none',
                  backgroundColor: activeTab === pane ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === pane ? '#fff' : 'var(--color-text)',
                  fontWeight: activeTab === pane ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (activeTab !== pane) e.currentTarget.style.backgroundColor = 'var(--color-secondary)'; }}
                onMouseLeave={(e) => { if (activeTab !== pane) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <i className={`bi ${icon}`} style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}></i>
                {label}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <button
              onClick={onLogout}
              className="btn w-100 rounded-pill py-2"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              {t.header?.logout || 'Выйти'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
