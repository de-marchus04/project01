'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { useTheme } from '@/shared/context/ThemeContext';
import { getMyProfile } from '@/shared/api/authActions';
import { Order } from '@/shared/api/userApi';
import { useSession, signOut } from 'next-auth/react';

import AdminSidebar from './components/AdminSidebar';
import CoursesTab from './components/CoursesTab';
import ConsultationsTab from './components/ConsultationsTab';
import ArticlesTab from './components/ArticlesTab';
import VideosTab from './components/VideosTab';
import PodcastsTab from './components/PodcastsTab';
import RecipesTab from './components/RecipesTab';
import ToursTab from './components/ToursTab';
import OrdersTab from './components/OrdersTab';
import SupportTab from './components/SupportTab';
import SubscribersTab from './components/SubscribersTab';
import PromoTab from './components/PromoTab';
import MediaTab from './components/MediaTab';
import FaqsTab from './components/FaqsTab';
import TestimonialsTab from './components/TestimonialsTab';
import TeamTab from './components/TeamTab';
import SiteSettingsTab from './components/SiteSettingsTab';
import ProfileTab from './components/ProfileTab';
import SlideshowTab from './components/SlideshowTab';

type AdminProfile = { name: string; email: string; phone: string; photoUrl: string };

export default function Admin() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('coursesPane');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isProfileEdited, setIsProfileEdited] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    name: '',
    email: '',
    phone: '',
    photoUrl: '',
  });
  const [stats, setStats] = useState({
    earnedTotal: 0,
    newRequests: 0,
    popularService: t.admin.noData,
  });

  // Recalculate sidebar stats whenever the orders list changes (populated by OrdersTab)
  useEffect(() => {
    let earned = 0;
    let newReqs = 0;
    const serviceCounts: Record<string, number> = {};

    orders.forEach((order) => {
      if (order.status === 'COMPLETED') earned += order.price;
      if (order.status === 'PENDING') newReqs++;
      if (order.productName) {
        serviceCounts[order.productName] = (serviceCounts[order.productName] || 0) + 1;
      }
    });

    let maxCount = 0;
    let popular = t.admin.noData;
    for (const [name, count] of Object.entries(serviceCounts)) {
      if (count > maxCount) {
        maxCount = count;
        popular = name;
      }
    }

    setStats({ earnedTotal: earned, newRequests: newReqs, popularService: popular });
  }, [orders]);

  // Auth guard + admin profile bootstrap
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    const role = session?.user?.role;
    const username = session?.user?.username;
    if (role !== 'ADMIN') {
      router.push('/profile');
      return;
    }
    if (!username) return;
    getMyProfile(username).then((profile) => {
      if (profile) {
        setAdminProfile({
          name: profile.name || profile.username,
          email: profile.email || '',
          phone: profile.phone || '',
          photoUrl: profile.avatar || '',
        });
      }
    });
  }, [status, session, router]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Callback from ProfileTab so the sidebar badge and adminProfile stay in sync
  const handleProfileStatusChange = (saved: boolean, edited: boolean) => {
    setIsProfileSaved(saved);
    setIsProfileEdited(edited);
  };

  const handleProfileSaved = (profile: AdminProfile) => {
    setAdminProfile(profile);
  };

  return (
    <main style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingTop: '70px' }}>
      <div className="d-flex admin-layout" style={{ padding: '20px 16px 16px', gap: '16px' }}>
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          stats={stats}
          isProfileSaved={isProfileSaved}
          isProfileEdited={isProfileEdited}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
        />

        {/* MAIN CONTENT AREA */}
        <div className="flex-grow-1 p-4" style={{ minHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
          {activeTab === 'coursesPane' && <CoursesTab adminProfile={adminProfile} showToast={showToast} />}

          {activeTab === 'consultationsPane' && <ConsultationsTab adminProfile={adminProfile} showToast={showToast} />}

          {activeTab === 'articlesPane' && <ArticlesTab adminProfile={adminProfile} showToast={showToast} />}

          {activeTab === 'videosPane' && <VideosTab showToast={showToast} />}

          {activeTab === 'podcastsPane' && <PodcastsTab showToast={showToast} />}

          {activeTab === 'recipesPane' && <RecipesTab showToast={showToast} />}

          {activeTab === 'toursPane' && <ToursTab adminProfile={adminProfile} showToast={showToast} />}

          {activeTab === 'ordersPane' && <OrdersTab showToast={showToast} onOrdersLoaded={setOrders} />}

          {activeTab === 'supportPane' && <SupportTab showToast={showToast} />}

          {activeTab === 'subscribersPane' && <SubscribersTab showToast={showToast} />}

          {activeTab === 'promoPane' && <PromoTab showToast={showToast} />}

          {activeTab === 'mediaPane' && <MediaTab showToast={showToast} />}

          {activeTab === 'slideshowPane' && <SlideshowTab showToast={showToast} />}

          {activeTab === 'faqsPane' && <FaqsTab showToast={showToast} />}

          {activeTab === 'testimonialsPane' && <TestimonialsTab showToast={showToast} />}

          {activeTab === 'teamPane' && <TeamTab showToast={showToast} />}

          {activeTab === 'settingsPane' && <SiteSettingsTab showToast={showToast} />}

          {activeTab === 'profilePane' && (
            <ProfileTab
              session={session}
              updateSession={update}
              showToast={showToast}
              onProfileStatusChange={handleProfileStatusChange}
              onProfileSaved={handleProfileSaved}
              initialProfile={adminProfile}
            />
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
          <div
            className="toast show align-items-center border-0 shadow-lg"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            style={{
              borderRadius: '16px',
              backgroundColor: toastType === 'error' ? '#dc3545' : 'var(--color-primary)',
              color: '#fff',
            }}
          >
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center" style={{ fontSize: '0.95rem' }}>
                <i
                  className={`bi ${toastType === 'error' ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill'} me-3`}
                  style={{ fontSize: '1.2rem' }}
                ></i>
                {toastMessage}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-3 m-auto"
                onClick={() => setToastMessage(null)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
