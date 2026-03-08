'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { getMyOrders, markMyOrderAsNotified, Order } from '@/shared/api/userApi';
import { getUserMessages, SupportMessage } from '@/shared/api/supportApi';
import { changePassword, getMyProfile, updateMyProfile } from '@/shared/api/authActions';
import { checkSubscription, subscribeEmail, unsubscribeEmail } from '@/shared/api/subscriberApi';
import { getUserWishlist, removeFromWishlist, WishlistItem } from '@/shared/api/wishlistApi';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { modalService } from '@/shared/ui/Modal/modalService';

export default function Profile() {
  const { t } = useLanguage();
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<{
    username: string;
    email?: string;
    phone?: string;
    photo?: string;
    name?: string;
  } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enrollments' | 'messages' | 'subscriptions' | 'settings' | 'wishlist'>(
    'enrollments',
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isProfileEdited, setIsProfileEdited] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const router = useRouter();

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [messages],
  );

  const translateOrderStatus = (s: string) => {
    if (s === 'PENDING') return t.profile.orderStatusProcessing;
    if (s === 'COMPLETED') return t.profile.orderStatusAccepted;
    if (s === 'CANCELLED') return t.profile.orderStatusRejected;
    return s;
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const username = session?.user?.username as string;
    const role = session?.user?.role as string;

    if (role === 'ADMIN' || username === 'admin') {
      router.push('/admin');
      return;
    }

    async function loadData() {
      try {
        const profile = await getMyProfile(username);
        const email = profile?.email || session?.user?.email || '';
        setUser({
          username,
          name: profile?.name || '',
          email,
          phone: profile?.phone || '',
          photo: profile?.avatar || session?.user?.avatar || '',
        });

        if (email) {
          const subscribed = await checkSubscription(email);
          setIsSubscribed(subscribed);
        }

        const data = await getMyOrders();
        setOrders(data);

        data.forEach(async (order) => {
          if ((order.status === 'COMPLETED' || order.status === 'CANCELLED') && !order.notified) {
            if (order.status === 'COMPLETED') {
              showToast(t.profile.alertAccepted.replace('{product}', `"${order.productName}"`), 'success');
            } else {
              showToast(t.profile.alertRejected.replace('{product}', `"${order.productName}"`), 'error');
            }
            markMyOrderAsNotified(order.id).catch(console.error);
          }
        });

        if (email) {
          getUserMessages(email)
            .then(setMessages)
            .catch((err) => console.error('getUserMessages error:', err));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const handleSupportUpdate = () => {
      const email = session?.user?.email;
      if (email) {
        getUserMessages(email)
          .then(setMessages)
          .catch((err) => console.error('getUserMessages error:', err));
      }
    };

    window.addEventListener('yoga_support_updated', handleSupportUpdate);
    return () => window.removeEventListener('yoga_support_updated', handleSupportUpdate);
  }, [router, session, status]);

  useEffect(() => {
    if (activeTab === 'wishlist') {
      getUserWishlist().then(setWishlistItems).catch(console.error);
    }
  }, [activeTab]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setUser((prev) => (prev ? { ...prev, photo: compressedBase64 } : null));
          setIsProfileEdited(true);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    const username = session?.user?.username as string;
    if (!username) return;

    const res = await changePassword(username, oldPassword, newPassword);
    if (res.success) {
      setIsPasswordChanged(true);
      setPasswordError(null);
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setIsPasswordChanged(false), 3000);
    } else {
      setPasswordError(res.error || t.profile.errPasswordChange);
    }
  };

  const handleProfileSave = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (!user?.name || !user?.photo || user.name.trim() === '' || user.photo.trim() === '') {
      showToast(t.profile.alertFillFields, 'error');
      return;
    }

    const username = session?.user?.username as string;
    await updateMyProfile(username, {
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.photo,
    });

    // Refresh the JWT session so the header reflects the new name/avatar immediately
    await update();
    window.dispatchEvent(new CustomEvent('profile_updated'));

    setIsProfileEdited(false);
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 3000);
    showToast(t.profile.alertProfileSaved, 'success');
  };

  const handleSubscriptionToggle = async () => {
    if (!user?.email) return;
    if (isSubscribed) {
      await unsubscribeEmail(user.email);
    } else {
      await subscribeEmail(user.email);
    }
    setIsSubscribed(!isSubscribed);
  };

  if (!user) return null;

  const cardBg = { backgroundColor: 'var(--color-card-bg)' };
  const surfaceBg = { backgroundColor: 'var(--color-surface)' };

  const renderEnrollments = () => {
    if (orders.length === 0) {
      return (
        <div className="col-12">
          <div className="rounded-4 shadow-sm p-5 text-center" style={cardBg}>
            <i className="bi bi-calendar-check display-1 mb-3" style={{ color: 'var(--color-text-muted)' }}></i>
            <h3 style={{ color: 'var(--color-text-muted)' }}>{t.profile.noEnrollments}</h3>
            <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
              {t.profile.noEnrollmentsDesc}
            </p>
            <Link href="/courses" className="btn btn-primary-custom rounded-pill px-4">
              {t.profile.goToPrograms}
            </Link>
          </div>
        </div>
      );
    }

    return orders.map((order) => {
      const isCourse =
        !order.productName.toLowerCase().includes('консультация') && !order.productName.toLowerCase().includes('тур');
      const isAccepted = order.status === 'COMPLETED';
      const isRejected = order.status === 'CANCELLED';

      return (
        <div key={order.id} className="col-md-6 col-lg-4">
          <div
            className="card h-100 shadow-sm border-0"
            style={{ borderRadius: '16px', backgroundColor: 'var(--color-card-bg)' }}
          >
            <div
              className="card-header border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center"
              style={{ backgroundColor: 'transparent' }}
            >
              <span
                className={`badge ${isAccepted ? 'bg-success' : isRejected ? 'bg-danger' : 'bg-warning text-dark'} rounded-pill px-3 py-2`}
              >
                {translateOrderStatus(order.status)}
              </span>
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {isCourse ? t.profile.badgeCourse : t.profile.badgeRecord}
              </span>
            </div>
            <div className="card-body d-flex flex-column">
              <h5 className="card-title font-playfair fw-bold mb-3" style={{ color: 'var(--color-text)' }}>
                {order.productName}
              </h5>
              <p className="small mb-4 flex-grow-1" style={{ color: 'var(--color-text-muted)' }}>
                <i className="bi bi-calendar3 me-2"></i>
                {t.profile.datePrefix} {order.date}
              </p>
              <button
                className="btn btn-outline-primary-custom w-100 rounded-pill fw-bold"
                disabled={order.status === 'PENDING' || order.status === 'CANCELLED'}
              >
                {order.status === 'PENDING'
                  ? t.profile.btnWaitConfirm
                  : order.status === 'CANCELLED'
                    ? t.profile.btnRejected
                    : isCourse
                      ? t.profile.btnContinueCourse
                      : t.profile.btnRecordDetails}
              </button>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <main style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container py-5">
        <div className="row g-4">
          {/* LEFT SIDEBAR */}
          <div className="col-md-3">
            <div
              className="card border-0 shadow-sm rounded-4 p-4 sticky-top"
              style={{ top: '90px', backgroundColor: 'var(--color-card-bg)' }}
            >
              {/* Avatar */}
              <div className="text-center mb-4">
                {user.photo && (user.photo.startsWith('http') || user.photo.startsWith('data:image')) ? (
                  <Image
                    width={90}
                    height={90}
                    src={user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=90'}
                    alt={user.name || user.username}
                    className="mb-3"
                    style={{
                      objectFit: 'cover',
                      borderRadius: '50%',
                      border: '3px solid var(--color-primary)',
                      display: 'block',
                      margin: '0 auto 12px',
                    }}
                  />
                ) : (
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: '90px', height: '90px', backgroundColor: 'var(--color-primary)', flexShrink: 0 }}
                  >
                    <span style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                      {(user.name || user.username || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h5 className="fw-bold mb-1 text-truncate" style={{ color: 'var(--color-text)' }}>
                  {user.name || user.username}
                </h5>
                <span
                  className="badge rounded-pill px-3 py-2"
                  style={{
                    backgroundColor: 'var(--color-secondary)',
                    color: 'var(--color-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {t.profile.statusUser}
                </span>
              </div>

              {/* Vertical tab nav */}
              <div className="profile-sidebar-nav d-flex flex-column gap-1 mb-4">
                {(
                  [
                    ['enrollments', 'bi-journal-check', t.profile.tabEnrollments],
                    ['messages', 'bi-chat-dots', t.profile.tabMessages],
                    ['subscriptions', 'bi-envelope-paper', t.profile.tabSubscriptions],
                    ['settings', 'bi-person-gear', t.profile.tabSettings],
                    ['wishlist', 'bi-heart', t.profile.tabWishlist],
                  ] as [typeof activeTab, string, string][]
                ).map(([tab, icon, label]) => (
                  <div
                    key={tab}
                    className={`nav-tab-item${activeTab === tab ? ' active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    <i className={`bi ${icon}`}></i>
                    {label}
                  </div>
                ))}
              </div>

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="btn w-100 rounded-pill py-2"
                style={{
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.9rem',
                }}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                {t.header?.logout || 'Выйти'}
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="col-md-9">
            <div className="row g-4">
              {loading ? (
                <div className="col-12 text-center py-5">
                  <div className="spinner-border" role="status" style={{ color: 'var(--color-primary)' }}></div>
                </div>
              ) : (
                <>
                  {activeTab === 'enrollments' && renderEnrollments()}

                  {activeTab === 'messages' && (
                    <div className="col-12">
                      <div className="rounded-4 shadow-sm p-4" style={cardBg}>
                        <h4 className="font-playfair fw-bold mb-4" style={{ color: 'var(--color-text)' }}>
                          {t.profile.historyTitle}
                        </h4>
                        {messages.length > 0 ? (
                          <div className="d-flex flex-column gap-3">
                            {sortedMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className="rounded-3 p-3"
                                style={{ border: '1px solid var(--color-border)' }}
                              >
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <span
                                    className="badge rounded-pill"
                                    style={{
                                      backgroundColor: 'var(--color-surface)',
                                      color: 'var(--color-text)',
                                      border: '1px solid var(--color-border)',
                                    }}
                                  >
                                    {msg.questionType}
                                  </span>
                                  <small style={{ color: 'var(--color-text-muted)' }}>
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                  </small>
                                </div>
                                <p className="mb-2" style={{ color: 'var(--color-text)' }}>
                                  {msg.message}
                                </p>
                                {msg.reply && (
                                  <div
                                    className="rounded p-3 mt-2 border-start border-4 border-primary"
                                    style={surfaceBg}
                                  >
                                    <strong className="d-block mb-1 small text-primary">
                                      {t.profile.supportReply}
                                    </strong>
                                    <p className="mb-0 small" style={{ color: 'var(--color-text)' }}>
                                      {msg.reply}
                                    </p>
                                  </div>
                                )}
                                <div className="mt-2 text-end">
                                  <span
                                    className={`badge ${msg.status === 'new' ? 'bg-warning text-dark' : msg.status === 'replied' ? 'bg-success' : 'bg-secondary'}`}
                                  >
                                    {msg.status === 'new'
                                      ? t.profile.statusWait
                                      : msg.status === 'replied'
                                        ? t.profile.statusReplied
                                        : t.profile.statusBot}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            className="rounded-3 p-5 text-center"
                            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                          >
                            <i className="bi bi-chat-square-text display-4 d-block mb-3"></i>
                            {t.profile.noMessages}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'subscriptions' && (
                    <div className="col-12">
                      <div className="rounded-4 shadow-sm p-4" style={cardBg}>
                        <h4 className="font-playfair fw-bold mb-4" style={{ color: 'var(--color-text)' }}>
                          {t.profile.subTitle}
                        </h4>
                        <div
                          className="d-flex align-items-center justify-content-between p-4 rounded-3"
                          style={{ border: '1px solid var(--color-border)' }}
                        >
                          <div>
                            <h5 className="fw-bold mb-1" style={{ color: 'var(--color-text)' }}>
                              {t.profile.subNews}
                            </h5>
                            <p className="mb-0 small" style={{ color: 'var(--color-text-muted)' }}>
                              {t.profile.subNewsDesc}
                            </p>
                          </div>
                          <div className="form-check form-switch fs-4">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={isSubscribed}
                              onChange={handleSubscriptionToggle}
                              style={{ cursor: 'pointer' }}
                            />
                          </div>
                        </div>
                        <hr className="my-5" style={{ borderColor: 'var(--color-border)' }} />
                        <h5 className="font-playfair fw-bold mb-4" style={{ color: 'var(--color-text)' }}>
                          {t.profile.changePasswordTitle}
                        </h5>
                        <form onSubmit={handlePasswordChange}>
                          <div className="row g-4">
                            <div className="col-md-6">
                              <label className="form-label fw-bold" style={{ color: 'var(--color-text-muted)' }}>
                                {t.profile.currentPassLabel}
                              </label>
                              <input
                                type="password"
                                className="form-control"
                                style={{
                                  backgroundColor: 'var(--color-surface)',
                                  color: 'var(--color-text)',
                                  border: '1px solid var(--color-border)',
                                  borderRadius: '10px',
                                }}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold" style={{ color: 'var(--color-text-muted)' }}>
                                {t.profile.newPassLabel}
                              </label>
                              <input
                                type="password"
                                className="form-control"
                                style={{
                                  backgroundColor: 'var(--color-surface)',
                                  color: 'var(--color-text)',
                                  border: '1px solid var(--color-border)',
                                  borderRadius: '10px',
                                }}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-12 mt-4 d-flex align-items-center gap-3">
                              <button
                                type="submit"
                                className="btn rounded-pill px-4"
                                style={{
                                  border: '2px solid var(--color-primary)',
                                  color: 'var(--color-primary)',
                                  backgroundColor: 'transparent',
                                }}
                              >
                                {t.profile.changePassBtn}
                              </button>
                              {isPasswordChanged && (
                                <div className="fw-medium" style={{ color: '#198754' }}>
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  {t.profile.passChanged}
                                </div>
                              )}
                              {passwordError && (
                                <div className="fw-medium" style={{ color: '#dc3545' }}>
                                  <i className="bi bi-exclamation-circle-fill me-2"></i>
                                  {passwordError}
                                </div>
                              )}
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="col-12">
                      <div className="rounded-4 shadow-sm p-4" style={cardBg}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h4 className="font-playfair fw-bold mb-0" style={{ color: 'var(--color-text)' }}>
                            {t.profile.tabSettings}
                          </h4>
                          <span
                            className={`badge rounded-pill px-3 py-2 ${isProfileEdited ? 'bg-warning text-dark' : isProfileSaved ? 'bg-success' : 'bg-secondary'}`}
                            style={{ transition: 'all 0.3s ease' }}
                          >
                            {isProfileEdited
                              ? t.profile.statusEditing
                              : isProfileSaved
                                ? t.profile.statusSaved
                                : t.profile.statusUser}
                          </span>
                        </div>
                        <div className="row g-4">
                          <div className="col-12 d-flex align-items-center gap-4 mb-2">
                            {user.photo ? (
                              <Image
                                width={100}
                                height={100}
                                src={
                                  user.photo ||
                                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'
                                }
                                style={{
                                  objectFit: 'cover',
                                  borderRadius: '50%',
                                  border: '2px solid var(--color-border)',
                                }}
                                alt="Profile"
                              />
                            ) : (
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: '100px',
                                  height: '100px',
                                  backgroundColor: 'var(--color-surface)',
                                  border: '2px solid var(--color-border)',
                                }}
                              >
                                <i className="bi bi-person display-4" style={{ color: 'var(--color-text-muted)' }}></i>
                              </div>
                            )}
                            <div className="flex-grow-1">
                              <label className="form-label fw-bold" style={{ color: 'var(--color-text-muted)' }}>
                                {t.profile.photoLabel} <span className="text-danger">*</span>
                              </label>
                              <div className="d-flex gap-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  style={{
                                    backgroundColor: 'var(--color-surface)',
                                    color: 'var(--color-text)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '10px',
                                  }}
                                  placeholder={t.profile.photoUrlPlaceholder}
                                  value={user.photo || ''}
                                  onChange={(e) => {
                                    setUser((prev) => (prev ? { ...prev, photo: e.target.value } : null));
                                    setIsProfileEdited(true);
                                  }}
                                />
                                <label
                                  className="btn btn-outline-secondary text-nowrap d-flex align-items-center"
                                  style={{ cursor: 'pointer', borderRadius: '10px' }}
                                >
                                  <i className="bi bi-upload me-2"></i>
                                  {t.profile.photoFromPc}
                                  <input type="file" accept="image/*" className="d-none" onChange={handleImageUpload} />
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <label className="form-label fw-bold" style={{ color: 'var(--color-text-muted)' }}>
                              {t.profile.nameLabel} <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              style={{
                                backgroundColor: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '10px',
                              }}
                              value={user.name || ''}
                              onChange={(e) => {
                                setUser((prev) => (prev ? { ...prev, name: e.target.value } : null));
                                setIsProfileEdited(true);
                              }}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-bold" style={{ color: 'var(--color-text-muted)' }}>
                              {t.profile.emailLabel}
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              style={{
                                backgroundColor: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '10px',
                              }}
                              value={user.email || ''}
                              onChange={(e) => {
                                setUser((prev) => (prev ? { ...prev, email: e.target.value } : null));
                                setIsProfileEdited(true);
                              }}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-bold" style={{ color: 'var(--color-text-muted)' }}>
                              {t.profile.phoneLabel}
                            </label>
                            <input
                              type="tel"
                              className="form-control"
                              style={{
                                backgroundColor: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '10px',
                              }}
                              value={user.phone || ''}
                              onChange={(e) => {
                                setUser((prev) => (prev ? { ...prev, phone: e.target.value } : null));
                                setIsProfileEdited(true);
                              }}
                              placeholder="+7 (___) ___-__-__"
                            />
                          </div>
                          <div
                            className="col-12 mt-4 pt-3 d-flex align-items-center gap-3"
                            style={{ borderTop: '1px solid var(--color-border)' }}
                          >
                            <button
                              type="button"
                              onClick={handleProfileSave}
                              className="btn btn-primary-custom rounded-pill px-5 py-2 fw-bold"
                            >
                              {t.profile.btnSave}
                            </button>
                            {isProfileSaved && (
                              <div
                                className="d-flex align-items-center fw-medium"
                                style={{ color: '#198754', animation: 'fadeIn 0.3s ease' }}
                              >
                                <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                                {t.profile.changesSaved}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'wishlist' && (
                    <div className="col-12">
                      <div className="rounded-4 shadow-sm p-4" style={cardBg}>
                        <h4 className="font-playfair fw-bold mb-4" style={{ color: 'var(--color-text)' }}>
                          <i className="bi bi-heart-fill text-danger me-2"></i>
                          {t.profile.tabWishlist}
                        </h4>
                        {wishlistItems.length === 0 ? (
                          <div className="text-center py-5" style={{ color: 'var(--color-text-muted)' }}>
                            <i className="bi bi-heart display-1" style={{ opacity: 0.2 }}></i>
                            <p className="mt-3">{t.profile.wishlistEmpty}</p>
                            <Link href="/courses" className="btn btn-primary-custom rounded-pill px-4 mt-2">
                              {t.profile.goToCourses}
                            </Link>
                          </div>
                        ) : (
                          <div className="row g-3">
                            {wishlistItems.map((item) => (
                              <div key={item.id} className="col-sm-6 col-md-4">
                                <div
                                  className="card border-0 shadow-sm rounded-3 overflow-hidden h-100"
                                  style={{ backgroundColor: 'var(--color-surface)' }}
                                >
                                  {item.imageUrl && (
                                    <div style={{ height: '130px', overflow: 'hidden', position: 'relative' }}>
                                      <Image
                                        src={item.imageUrl}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 600px"
                                        style={{ objectFit: 'cover' }}
                                        alt={item.title ?? ''}
                                      />
                                    </div>
                                  )}
                                  <div className="card-body p-3">
                                    <span className="badge bg-secondary small mb-1">{item.itemType}</span>
                                    <h6 className="fw-bold mb-1" style={{ color: 'var(--color-text)' }}>
                                      {item.title}
                                    </h6>
                                    {item.price !== undefined && (
                                      <p className="fw-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                                        {item.price.toLocaleString('ru-RU')} ₴
                                      </p>
                                    )}
                                    <div className="d-flex gap-2">
                                      {item.url && (
                                        <Link
                                          href={item.url}
                                          className="btn btn-sm btn-primary-custom rounded-pill flex-grow-1"
                                        >
                                          {t.profile.moreDetails}
                                        </Link>
                                      )}
                                      <button
                                        className="btn btn-sm btn-outline-danger rounded-pill"
                                        onClick={async () => {
                                          await removeFromWishlist(item.itemId, item.itemType as any);
                                          setWishlistItems((prev) => prev.filter((w) => w.id !== item.id));
                                        }}
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
