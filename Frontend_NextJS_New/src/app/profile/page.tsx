"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOrders, markOrderAsNotified, Order } from "@/shared/api/userApi";
import { getUserMessages, SupportMessage } from "@/shared/api/supportApi";
import Image from "next/image";
import { useLanguage } from "@/shared/i18n/LanguageContext";

export default function Profile() {
  const { t, tStr } = useLanguage();
  const [user, setUser] = useState<{ username: string, email?: string, phone?: string, photo?: string, name?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"enrollments" | "messages" | "subscriptions" | "settings">("enrollments");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProfileEdited, setIsProfileEdited] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Проверка авторизации
    const userJson = localStorage.getItem('yoga_user');
    if (!userJson) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(userJson);
      if (userData.role === 'admin' || userData.username === 'admin') {
        router.push('/admin');
        return;
      }
      
      // Загружаем расширенные данные профиля, если есть
      const profileJson = localStorage.getItem(`profile_${userData.username}`);
      if (profileJson) {
        const profile = JSON.parse(profileJson);
        setUser({ 
          ...userData, 
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          photo: profile.photoUrl || profile.photo || ''
        });
      } else {
        setUser({ ...userData, name: '', email: `${userData.username}@example.com`, phone: '', photo: '' });
      }

      // Проверка подписки
      const subscribersJson = localStorage.getItem('yoga_subscribers');
      const subscribers = subscribersJson ? JSON.parse(subscribersJson) : [];
      const userEmail = profileJson ? JSON.parse(profileJson).email : `${userData.username}@example.com`;
      setIsSubscribed(subscribers.includes(userEmail));

    } catch (e) {
      router.push('/login');
      return;
    }

    // Загрузка данных пользователя
    async function loadData() {
      try {
        const data = await getOrders();
        
        const userJson = localStorage.getItem('yoga_user');
        if (userJson) {
          const userData = JSON.parse(userJson);
          
          // Фильтруем заказы только для текущего пользователя
          const userOrders = data.filter(order => 
            order.userId === userData.username || 
            order.customerName === userData.username ||
            (userData.name && order.customerName === userData.name)
          );
          setOrders(userOrders);
          
          // Проверяем уведомления о статусе
          userOrders.forEach(order => {
            if ((order.status === 'Принята' || order.status === 'Отклонена') && !order.notified) {
              if (order.status === 'Принята') {
                alert(t.profile.alertAccepted.replace("{product}", `"${order.productName}"`));
              } else {
                alert(t.profile.alertRejected.replace("{product}", `"${order.productName}"`));
              }
              markOrderAsNotified(order.id);
            }
          });

          const profileJson = localStorage.getItem(`profile_${userData.username}`);
          const userEmail = profileJson ? JSON.parse(profileJson).email : `${userData.username}@example.com`;
          getUserMessages(userEmail).then(setMessages);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const handleSupportUpdate = () => {
      const userJson = localStorage.getItem('yoga_user');
      if (userJson) {
        const userData = JSON.parse(userJson);
        const profileJson = localStorage.getItem(`profile_${userData.username}`);
        const userEmail = profileJson ? JSON.parse(profileJson).email : `${userData.username}@example.com`;
        getUserMessages(userEmail).then(setMessages);
      }
    };

    window.addEventListener('yoga_support_updated', handleSupportUpdate);
    return () => window.removeEventListener('yoga_support_updated', handleSupportUpdate);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('yoga_user');
    window.location.href = '/';
  };

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
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setUser(prev => prev ? { ...prev, photo: compressedBase64 } : null);
          setIsProfileEdited(true);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    
    if (!user?.name || !user?.photo || user.name.trim() === '' || user.photo.trim() === '') {
      setToastMessage(t.profile.alertFillFields);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const updatedProfile = {
      username: user.username,
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      photoUrl: user.photo,
    };
    
    localStorage.setItem(`profile_${user?.username}`, JSON.stringify(updatedProfile));
    
    // Принудительно обновляем Header, вызывая событие storage
    window.dispatchEvent(new Event('storage'));
    
    setIsProfileEdited(false);
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 3000);
    
    setToastMessage(t.profile.alertProfileSaved);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
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
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setUser(prev => prev ? { ...prev, photo: dataUrl } : null);
          setIsProfileEdited(true);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubscriptionToggle = () => {
    if (!user?.email) return;
    
    const subscribersJson = localStorage.getItem('yoga_subscribers');
    let subscribers = subscribersJson ? JSON.parse(subscribersJson) : [];
    
    if (isSubscribed) {
      subscribers = subscribers.filter((e: string) => e !== user.email);
    } else {
      subscribers.push(user.email);
    }
    
    localStorage.setItem('yoga_subscribers', JSON.stringify(subscribers));
    setIsSubscribed(!isSubscribed);
    window.dispatchEvent(new Event('yoga_subscription_updated'));
  };

  if (!user) return null;

  const renderEnrollments = () => {
    if (orders.length === 0) {
      return (
        <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm">
            <i className="bi bi-calendar-check display-1 text-muted mb-3"></i>
            <h3 className="text-muted">{t.profile.noEnrollments}</h3>
            <p className="text-muted mb-4">{t.profile.noEnrollmentsDesc}</p>
            <Link href="/courses-beginners" className="btn btn-primary-custom rounded-pill px-4">{t.profile.goToPrograms}</Link>
        </div>
      );
    }

    return orders.map(order => {
      const isCourse = !order.productName.toLowerCase().includes('консультация') && !order.productName.toLowerCase().includes('тур');
      return (
        <div key={order.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
                <div className="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                    <span className={`badge ${
                      order.status === 'Принята' || order.status === 'Активен' ? 'bg-success' : 
                      order.status === 'Отклонена' || order.status === 'Отменен' ? 'bg-danger' : 
                      order.status === 'Завершен' ? 'bg-secondary' : 
                      'bg-warning text-dark'
                    } rounded-pill px-3 py-2`}>
                        {order.status}
                    </span>
                    <span className="badge bg-light text-dark border rounded-pill px-3 py-2">{isCourse ? t.profile.badgeCourse : t.profile.badgeRecord}</span>
                </div>
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title font-playfair fw-bold mb-3">{order.productName}</h5>
                    <p className="text-muted small mb-4 flex-grow-1">
                      <i className="bi bi-calendar3 me-2"></i>
                      {t.profile.datePrefix} {order.date}
                    </p>
                    <button 
                      className="btn btn-outline-primary-custom w-100 rounded-pill fw-bold"
                      disabled={order.status === 'В обработке' || order.status === 'Отклонена'}
                    >{order.status === 'В обработке' ? t.profile.btnWaitConfirm : order.status === 'Отклонена' ? t.profile.btnRejected : isCourse ? t.profile.btnContinueCourse : t.profile.btnRecordDetails}</button>
                </div>
            </div>
        </div>
      );
    });
  };

  return (
    <main style={{ backgroundColor: '#f6f7f9', minHeight: '100vh' }}>
      <nav className="navbar navbar-expand-lg navbar-light sticky-top" style={{ backgroundColor: '#fff', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
          <div className="container">
              <Link className="navbar-brand font-playfair fw-bold" href="/" style={{ color: '#2c3e50' }}>YOGA.LIFE</Link>
              <div className="d-flex align-items-center ms-auto gap-3">
                  <div className="d-flex align-items-center gap-2">
                    {user.photo ? (
                      <img src={user.photo} alt="Profile" className="rounded-circle object-fit-cover" style={{ width: '32px', height: '32px' }} />
                    ) : (
                      <i className="bi bi-person-circle fs-4 text-muted"></i>
                    )}
                    <span className="text-muted fw-medium d-none d-sm-inline">{user.name || user.username}</span>
                  </div>
                  <Link href="/" className="btn btn-outline-primary-custom btn-sm rounded-pill px-3 fw-bold">{t.profile.toSite}</Link>
                  <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold">{t.profile.logout}</button>
              </div>
          </div>
      </nav>

      <header className="text-center position-relative" style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '4rem 0', marginBottom: '3rem' }}>
          <div className="container position-relative z-2">
              <h1 className="font-playfair display-4 fw-bold mb-3">{t.profile.pageTitle}</h1>
              <p className="lead mb-0" style={{ color: 'var(--color-secondary)' }}>{t.profile.pageSubtitle}</p>
          </div>
      </header>

      <div className="container pb-5">
          <div className="d-flex justify-content-center mb-5">
            <div className="bg-white p-1 rounded-pill shadow-sm d-inline-flex flex-wrap justify-content-center gap-1">
              <button 
                className={`btn rounded-pill px-4 py-2 fw-bold ${activeTab === 'enrollments' ? 'btn-primary-custom text-white' : 'btn-light text-muted bg-transparent border-0'}`}
                onClick={() => setActiveTab('enrollments')}
                style={{ transition: 'all 0.3s ease' }}
              >
                <i className="bi bi-journal-check me-2"></i>{tStr("Мои записи")}</button>
              <button 
                className={`btn rounded-pill px-4 py-2 fw-bold ${activeTab === 'messages' ? 'btn-primary-custom text-white' : 'btn-light text-muted bg-transparent border-0'}`}
                onClick={() => setActiveTab('messages')}
                style={{ transition: 'all 0.3s ease' }}
              >
                <i className="bi bi-chat-dots me-2"></i>{tStr("Мои сообщения")}</button>
              <button 
                className={`btn rounded-pill px-4 py-2 fw-bold ${activeTab === 'subscriptions' ? 'btn-primary-custom text-white' : 'btn-light text-muted bg-transparent border-0'}`}
                onClick={() => setActiveTab('subscriptions')}
                style={{ transition: 'all 0.3s ease' }}
              >
                <i className="bi bi-envelope-paper me-2"></i>{tStr("Подписки")}</button>
              <button 
                className={`btn rounded-pill px-4 py-2 fw-bold ${activeTab === 'settings' ? 'btn-primary-custom text-white' : 'btn-light text-muted bg-transparent border-0'}`}
                onClick={() => setActiveTab('settings')}
                style={{ transition: 'all 0.3s ease' }}
              >
                <i className="bi bi-person-gear me-2"></i>{tStr("Настройки профиля")}</button>
            </div>
          </div>

          <div className="row g-4">
              {loading ? (
                  <div className="col-12 text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                  </div>
              ) : (
                  <>
                    {activeTab === 'enrollments' && renderEnrollments()}

                    {activeTab === 'messages' && (
                      <div className="col-12">
                        <div className="bg-white rounded-4 shadow-sm p-4">
                          <h4 className="font-playfair fw-bold mb-4">{t.profile.historyTitle}</h4>
                          {messages.length > 0 ? (
                            <div className="d-flex flex-column gap-3">
                              {messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(msg => (
                                <div key={msg.id} className="border rounded-3 p-3">
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="badge bg-light text-dark border">{msg.questionType}</span>
                                    <small className="text-muted">{new Date(msg.createdAt).toLocaleDateString()}</small>
                                  </div>
                                  <p className="mb-2">{msg.message}</p>
                                  {msg.reply && (
                                    <div className="bg-light rounded p-3 mt-2 border-start border-4 border-primary">
                                      <strong className="d-block mb-1 small text-primary">{t.profile.supportReply}</strong>
                                      <p className="mb-0 small">{msg.reply}</p>
                                    </div>
                                  )}
                                  <div className="mt-2 text-end">
                                    <span className={`badge ${msg.status === 'new' ? 'bg-warning text-dark' : msg.status === 'replied' ? 'bg-success' : 'bg-secondary'}`}>
                                      {msg.status === 'new' ? t.profile.statusWait : msg.status === 'replied' ? t.profile.statusReplied : t.profile.statusBot}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="alert alert-light border text-muted text-center py-5">
                              <i className="bi bi-chat-square-text display-4 d-block mb-3"></i>
                              {t.profile.noMessages}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'subscriptions' && (
                      <div className="col-12">
                        <div className="bg-white rounded-4 shadow-sm p-4">
                          <h4 className="font-playfair fw-bold mb-4">{t.profile.subTitle}</h4>
                          <div className="d-flex align-items-center justify-content-between p-4 border rounded-3">
                            <div>
                              <h5 className="fw-bold mb-1">{t.profile.subNews}</h5>
                              <p className="text-muted mb-0 small">{t.profile.subNewsDesc}</p>
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
                        </div>
                      </div>
                    )}

                    {activeTab === 'settings' && (
                      <div className="col-12">
                        <div className="bg-white rounded-4 shadow-sm p-4">
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="font-playfair fw-bold mb-0">{t.profile.tabSettings}</h4>
                            <span className={`badge rounded-pill px-3 py-2 ${isProfileEdited ? 'bg-warning text-dark' : isProfileSaved ? 'bg-success' : 'bg-secondary'}`} style={{ transition: 'all 0.3s ease' }}>
                              {isProfileEdited ? t.profile.statusEditing : isProfileSaved ? t.profile.statusSaved : t.profile.statusUser}
                            </span>
                          </div>
                          <div>
                            <div className="row g-4">
                              <div className="col-12 d-flex align-items-center gap-4 mb-2">
                                {user.photo ? (
                                  <img src={user.photo} alt="Profile" className="rounded-circle object-fit-cover border" style={{ width: '100px', height: '100px' }} />
                                ) : (
                                  <div className="rounded-circle bg-light d-flex align-items-center justify-content-center border" style={{ width: '100px', height: '100px' }}>
                                    <i className="bi bi-person text-muted display-4"></i>
                                  </div>
                                )}
                                <div className="flex-grow-1">
                                  <label className="form-label fw-bold">{t.profile.photoLabel} <span className="text-danger">*</span></label>
                                  <div className="d-flex gap-2">
                                    <input type="text" className="form-control" placeholder={t.profile.photoUrlPlaceholder} value={user.photo || ''} onChange={(e) => { setUser(prev => prev ? {...prev, photo: e.target.value} : null); setIsProfileEdited(true); }} />
                                    <label className="btn btn-outline-secondary text-nowrap d-flex align-items-center" style={{ cursor: 'pointer' }}>
                                      <i className="bi bi-upload me-2"></i>{tStr("С ПК")}
                                      <input type="file" accept="image/*" className="d-none" onChange={handleImageUpload} />
                                    </label>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="col-md-6">
                                <label className="form-label fw-bold">{t.profile.nameLabel} <span className="text-danger">*</span></label>
                                <input type="text" className="form-control" value={user.name || ''} onChange={(e) => { setUser(prev => prev ? {...prev, name: e.target.value} : null); setIsProfileEdited(true); }} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-bold">{t.profile.emailLabel}</label>
                                <input type="email" className="form-control" value={user.email || ''} onChange={(e) => { setUser(prev => prev ? {...prev, email: e.target.value} : null); setIsProfileEdited(true); }} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-bold">{t.profile.phoneLabel}</label>
                                <input type="tel" className="form-control" value={user.phone || ''} onChange={(e) => { setUser(prev => prev ? {...prev, phone: e.target.value} : null); setIsProfileEdited(true); }} placeholder="+7 (___) ___-__-__" />
                              </div>
                              <div className="col-12 mt-4 pt-3 border-top d-flex align-items-center gap-3">
                                <button type="button" onClick={handleProfileSave} className="btn btn-primary-custom rounded-pill px-5 py-2 fw-bold">{t.profile.btnSave}</button>
                                {isProfileSaved && (
                                  <div className="d-flex align-items-center text-success fw-medium" style={{ animation: 'fadeIn 0.3s ease' }}>
                                    <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                                    {t.profile.changesSaved}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
              )}
          </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
          <div className={`toast show align-items-center text-white ${toastMessage.includes('ошибка') || toastMessage.includes('Пожалуйста') ? 'bg-danger' : 'bg-success'} border-0 shadow-lg rounded-4`} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center fs-6">
                <i className={`bi ${toastMessage.includes('ошибка') || toastMessage.includes('Пожалуйста') ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill'} me-3 fs-4`}></i>
                {toastMessage}
              </div>
              <button type="button" className="btn-close btn-close-white me-3 m-auto" onClick={() => setToastMessage(null)} aria-label="Close"></button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
